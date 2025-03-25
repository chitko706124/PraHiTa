import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight, MessageCircle, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/context/auth-context";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import CommentList from "./CommentList";

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
}

interface DonationCardProps {
  post: DonationPost;
}

const DonationCard = ({ post }: DonationCardProps) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [donationAmount, setDonationAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });
  };

  useEffect(() => {
    console.log(post.thumbnail_url);
  }, [post]);

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
    // try {
    //   const { error } = await supabase.from("donations").insert({
    //     user_id: user.id,
    //     post_id: post.id,
    //     amount: amount,
    //   });

    //   if (error) throw error;

    //   const { error: updateError } = await supabase
    //     .from("donation_posts")
    //     .update({
    //       current_amount: post.current_amount + amount,
    //     })
    //     .eq("id", post.id);

    //   if (updateError) throw updateError;

    //   toast.success(`Thank you for your donation of $${amount}`);
    //   setDonationAmount("");
    // }
    try {
      // Step 1: Insert donation record
      const { error: insertError } = await supabase.from("donations").insert({
        user_id: user.id,
        post_id: post.id,
        amount: amount,
      });

      if (insertError) throw insertError;

      // Step 2: Fetch latest post data to ensure `current_amount` is correct
      const { data: postData, error: fetchError } = await supabase
        .from("donation_posts")
        .select("current_amount")
        .eq("id", post.id)
        .single();

      if (fetchError) throw fetchError;
      if (!postData) throw new Error("Donation post not found");

      // Step 3: Ensure `current_amount` is a number
      const newAmount = (postData.current_amount || 0) + amount;

      // Step 4: Update the post with the new donation amount
      const { error: updateError } = await supabase
        .from("donation_posts")
        .update({ current_amount: newAmount })
        .eq("id", post.id);

      if (updateError) throw updateError;

      toast.success(`Thank you for your donation of $${amount}`);
      setDonationAmount("");
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
        post_id: post.id,
        post_type: "donation",
        content: comment.trim(),
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

  return (
    <Card className="overflow-hidden card-hover">
      <Link to={`/donations/${post.id}`}>
        <div className="relative h-48 overflow-hidden">
          <img
            src={
              post.thumbnail_url ||
              "/lovable-uploads/3cece3d5-35c2-432e-939d-640fe5b9a7b5.png"
            }
            alt={`${post.organizer_name}'s campaign`}
            className="w-full h-full object-cover"
          />
        </div>

        <CardContent className="p-4">
          <div className="flex items-center mb-3">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src={post.organizer_avatar} />
              <AvatarFallback>{post.organizer_name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{post.organizer_name}</span>
          </div>

          <p className="text-sm mb-3 line-clamp-3">{post.description}</p>

          <div className="flex items-center text-xs text-muted-foreground mb-3">
            <Calendar className="h-3 w-3 mr-1" />
            <span>
              Start - {formatDate(post.start_date)}
              <br />
              End - {formatDate(post.end_date)}
            </span>
          </div>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
            <div
              className="bg-amber h-2.5 rounded-full"
              style={{
                width: `${Math.min(
                  100,
                  (post.current_amount / post.target_amount) * 100
                )}%`,
              }}
            ></div>
          </div>

          <div className="flex justify-between text-sm">
            <span>{post.current_amount.toLocaleString()} MMK</span>
            <span>Goal: {post.target_amount.toLocaleString()} MMK</span>
          </div>
        </CardContent>
      </Link>

      <CardFooter className="flex justify-between p-4 pt-0">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="donation-button">
              Donate <ArrowRight className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Make a Donation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="amount" className="text-sm font-medium">
                  Amount (MMK)
                </label>
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

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle className="h-4 w-4 mr-1" />
          Comments
        </Button>
      </CardFooter>

      {showComments && (
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-sm">Comments</h4>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowComments(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

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
    </Card>
  );
};

export default DonationCard;
