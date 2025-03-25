import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/context/auth-context";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import CommentList from "./CommentList";
import { DialogTrigger } from "@radix-ui/react-dialog";

interface NewsPost {
  id: number;
  thumbnail_url: string;
  organizer_name: string;
  organizer_avatar: string;
  description: string;
  created_at: string;
}

interface NewsCardProps {
  post: NewsPost;
}

const NewsCard = ({ post }: NewsCardProps) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleSubmitComment = async () => {
    if (!user) {
      navigate("/login");
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
        post_type: "news",
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
      <Link to={`/news/${post.id}`}>
        <div className="relative h-56 overflow-hidden">
          <img
            src={
              post.thumbnail_url ||
              "/lovable-uploads/3cece3d5-35c2-432e-939d-640fe5b9a7b5.png"
            }
            alt={`${post.organizer_name}'s news`}
            className="w-full h-full object-cover"
          />
        </div>

        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={post.organizer_avatar} />
                <AvatarFallback>{post.organizer_name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="font-medium">{post.organizer_name}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {formatDate(post.created_at)}
            </span>
          </div>

          <p className="text-sm">{post.description}</p>
        </CardContent>
      </Link>

      <CardFooter className="flex justify-end p-4 pt-0">
        <Link to={`/news/${post.id}`} className="text-primary">
          <Button size="sm">
            Read More <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
        {/* <DialogTrigger asChild>
          <Button className="donation-button">
            Donate <ArrowRight className="h-4 w-4" />
          </Button>
        </DialogTrigger> */}
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

          <CommentList postId={post.id} postType="news" />
        </div>
      )}
    </Card>
  );
};

export default NewsCard;
