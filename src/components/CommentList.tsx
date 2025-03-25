
import { useState, useEffect } from "react";
import { supabase } from "@/context/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Comment {
  id: number;
  content: string;
  created_at: string;
  user: {
    display_name: string;
    avatar_url: string | null;
  };
}

interface CommentListProps {
  postId: number;
  postType: "donation" | "news";
}

const CommentList = ({ postId, postType }: CommentListProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const { data, error } = await supabase
          .from("comments")
          .select(`
            id,
            content,
            created_at,
            user:user_id (
              display_name,
              avatar_url
            )
          `)
          .eq("post_id", postId)
          .eq("post_type", postType)
          .order("created_at", { ascending: false });

        if (error) throw error;
        
        // Transform the data to ensure user property is a single object, not an array
        const formattedComments = data?.map((comment: any) => ({
          id: comment.id,
          content: comment.content,
          created_at: comment.created_at,
          user: Array.isArray(comment.user) ? comment.user[0] : comment.user
        })) || [];
        
        setComments(formattedComments);
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
    
    // Subscribe to new comments
    const subscription = supabase
      .channel(`comments-${postId}-${postType}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${postId} AND post_type=eq.${postType}`,
        },
        (payload) => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [postId, postType]);

  if (loading) {
    return (
      <div className="space-y-2 animate-pulse">
        {[1, 2].map((n) => (
          <div key={n} className="flex gap-2">
            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
            <div className="flex-1">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-2">
        No comments yet. Be the first to comment!
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.user.avatar_url || undefined} />
            <AvatarFallback>
              {comment.user.display_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="font-medium text-sm">
                {comment.user.display_name}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(comment.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm">{comment.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommentList;
