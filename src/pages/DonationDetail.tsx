
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/context/auth-context";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight, MessageCircle, X, Users, Target, BadgeDollarSign, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import CommentList from "@/components/CommentList";
import { Skeleton } from "@/components/ui/skeleton";

interface DonationPost {
  id: number;
  thumbnail_url: string;
  organizer_name: string;
  organizer_avatar: string;
  description: string;
  target_amount: number;
  current_amount: number;
  start_date: string;
  end_date: string;
  created_at: string;
}

const DonationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<DonationPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [donationAmount, setDonationAmount] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [donorCount, setDonorCount] = useState(0);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data, error } = await supabase
          .from("donation_posts")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setPost(data);

        // Get donor count
        const { count, error: countError } = await supabase
          .from("donations")
          .select("user_id", { count: "exact", head: true })
          .eq("post_id", id);

        if (countError) throw countError;
        setDonorCount(count || 0);
      } catch (error) {
        console.error("Error fetching donation post:", error);
        toast.error("Failed to load donation campaign");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const calculateDaysRemaining = () => {
    if (!post?.end_date) return "No end date";
    
    const endDate = new Date(post.end_date);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Campaign ended";
    if (diffDays === 0) return "Last day";
    return `${diffDays} days remaining`;
  };

  const handleDonation = async () => {
    if (!user) {
      toast.error("Please log in to donate");
      return;
    }

    const amount = parseFloat(donationAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);
    try {
      // Add donation to database
      const { error } = await supabase.from("donations").insert({
        user_id: user.id,
        post_id: post?.id,
        amount: amount
      });

      if (error) throw error;

      // Update post current amount
      const { error: updateError } = await supabase
        .from("donation_posts")
        .update({ 
          current_amount: (post?.current_amount || 0) + amount 
        })
        .eq("id", post?.id);

      if (updateError) throw updateError;

      toast.success(`Thank you for your donation of $${amount}`);
      setDonationAmount("");
      
      // Refresh post data
      const { data, error: fetchError } = await supabase
        .from("donation_posts")
        .select("*")
        .eq("id", id)
        .single();
        
      if (fetchError) throw fetchError;
      setPost(data);
      
      // Update donor count
      const { count, error: countError } = await supabase
        .from("donations")
        .select("user_id", { count: "exact", head: true })
        .eq("post_id", id);

      if (countError) throw countError;
      setDonorCount(count || 0);
      
    } catch (error) {
      console.error("Error processing donation:", error);
      toast.error("Failed to process donation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!user) {
      toast.error("Please log in to comment");
      return;
    }

    if (!comment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("comments").insert({
        user_id: user.id,
        post_id: post?.id,
        post_type: "donation",
        content: comment.trim()
      });

      if (error) throw error;

      toast.success("Comment posted successfully");
      setComment("");
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error("Failed to post comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-64 w-full" />
          <div className="flex gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Campaign not found</h2>
          <p className="text-muted-foreground mt-2">
            The donation campaign you're looking for doesn't exist or has been removed.
          </p>
          <Button className="mt-4" onClick={() => navigate("/")}>
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  // Extract title from description (first line)
  const title = post.description.split('\n')[0];
  const description = post.description.split('\n').slice(1).join('\n');

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-1">
          Campaign by {post.organizer_name}
        </p>
      </header>

      <div className="space-y-8">
        <div className="relative h-80 overflow-hidden rounded-lg">
          <img 
            src={post.thumbnail_url || "/lovable-uploads/3cece3d5-35c2-432e-939d-640fe5b9a7b5.png"} 
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center mb-6">
              <Avatar className="h-12 w-12 mr-3">
                <AvatarImage src={post.organizer_avatar} />
                <AvatarFallback>{post.organizer_name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{post.organizer_name}</h3>
                <p className="text-sm text-muted-foreground">Campaign Organizer</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">About this campaign</h2>
              {description.split('\n').map((paragraph, i) => (
                <p key={i} className="text-sm">{paragraph}</p>
              ))}
            </div>
            
            <div className="mt-8">
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setShowComments(!showComments)}
                className="mb-4"
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                {showComments ? "Hide Comments" : "View Comments"}
              </Button>
              
              {showComments && (
                <div className="mt-4">
                  <div className="flex gap-2 mb-4">
                    <Textarea
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="text-sm resize-none"
                    />
                    <Button 
                      size="sm" 
                      onClick={handleSubmitComment}
                      disabled={isSubmitting || !comment.trim()}
                      className="self-end"
                    >
                      Post
                    </Button>
                  </div>
                  
                  <CommentList postId={post.id} postType="donation" />
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6 pb-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">${post.current_amount.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground">of ${post.target_amount.toLocaleString()}</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-amber h-2 rounded-full" 
                      style={{ width: `${Math.min(100, (post.current_amount / post.target_amount) * 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 border rounded-md">
                      <div className="flex flex-col items-center">
                        <BadgeDollarSign className="h-4 w-4 mb-1 text-amber" />
                        <span className="font-medium">${post.current_amount.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground">Raised</span>
                      </div>
                    </div>
                    
                    <div className="p-2 border rounded-md">
                      <div className="flex flex-col items-center">
                        <Users className="h-4 w-4 mb-1 text-amber" />
                        <span className="font-medium">{donorCount}</span>
                        <span className="text-xs text-muted-foreground">Donors</span>
                      </div>
                    </div>
                    
                    <div className="p-2 border rounded-md">
                      <div className="flex flex-col items-center">
                        <Clock className="h-4 w-4 mb-1 text-amber" />
                        <span className="font-medium">{calculateDaysRemaining()}</span>
                        <span className="text-xs text-muted-foreground">Time left</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full bg-amber hover:bg-amber-dark">
                          Donate <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Make a Donation</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <label htmlFor="amount" className="text-sm font-medium">Amount ($)</label>
                            <Input
                              id="amount"
                              type="number"
                              min="1"
                              step="1"
                              placeholder="Enter donation amount"
                              value={donationAmount}
                              onChange={(e) => setDonationAmount(e.target.value)}
                            />
                          </div>
                          <Button 
                            onClick={handleDonation}
                            disabled={isSubmitting}
                            className="w-full bg-amber hover:bg-amber-dark"
                          >
                            {isSubmitting ? "Processing..." : "Complete Donation"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="px-6 pt-0 pb-6 flex flex-col items-start space-y-3 border-t">
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  <div>
                    <div>Start: {formatDate(post.start_date)}</div>
                    <div>End: {formatDate(post.end_date)}</div>
                  </div>
                </div>
                
                <div className="flex items-center text-sm">
                  <Target className="h-4 w-4 mr-2" />
                  <div>Target: ${post.target_amount.toLocaleString()}</div>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationDetail;
