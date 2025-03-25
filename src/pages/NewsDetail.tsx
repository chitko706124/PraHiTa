
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/context/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle, X, Clock, Newspaper } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import CommentList from "@/components/CommentList";
import { Skeleton } from "@/components/ui/skeleton";

interface NewsPost {
  id: number;
  thumbnail_url: string;
  organizer_name: string;
  organizer_avatar: string;
  description: string;
  created_at: string;
}

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<NewsPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data, error } = await supabase
          .from("news_posts")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setPost(data);
      } catch (error) {
        console.error("Error fetching news post:", error);
        toast.error("Failed to load news post");
        navigate("/news");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        post_type: "news",
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
          <h2 className="text-2xl font-bold">News post not found</h2>
          <p className="text-muted-foreground mt-2">
            The news post you're looking for doesn't exist or has been removed.
          </p>
          <Button className="mt-4" onClick={() => navigate("/news")}>
            Back to News
          </Button>
        </div>
      </div>
    );
  }

  // Extract title from description (first line)
  const title = post.description.split('\n')[0];
  const content = post.description.split('\n').slice(1).join('\n');

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center">
            <Avatar className="h-6 w-6 mr-2">
              <AvatarImage src={post.organizer_avatar} />
              <AvatarFallback>{post.organizer_name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm">{post.organizer_name}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            <span>{formatDate(post.created_at)}</span>
          </div>
        </div>
      </header>

      <div className="space-y-8">
        <div className="relative h-80 overflow-hidden rounded-lg">
          <img 
            src={post.thumbnail_url || "/lovable-uploads/3cece3d5-35c2-432e-939d-640fe5b9a7b5.png"} 
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="prose dark:prose-invert max-w-none">
              {content.split('\n').map((paragraph, i) => (
                <p key={i} className="mb-4">{paragraph}</p>
              ))}
            </div>
            
            <div className="flex items-center justify-between mt-8 pt-4 border-t">
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={post.organizer_avatar} />
                  <AvatarFallback>{post.organizer_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{post.organizer_name}</h3>
                  <p className="text-xs text-muted-foreground">Publisher</p>
                </div>
              </div>
              
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setShowComments(!showComments)}
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                {showComments ? "Hide Comments" : "View Comments"}
              </Button>
            </div>
            
            {showComments && (
              <div className="mt-6">
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
                
                <CommentList postId={post.id} postType="news" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewsDetail;
