
import { useEffect, useState } from "react";
import { supabase } from "@/context/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import NewsCard from "@/components/NewsCard";

interface NewsPost {
  id: number;
  thumbnail_url: string;
  organizer_name: string;
  organizer_avatar: string;
  description: string;
  created_at: string;
}

const News = () => {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from("news_posts")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setPosts(data || []);
      } catch (error) {
        console.error("Error fetching news posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">News</h1>
        <p className="text-muted-foreground mt-1">Latest updates</p>
      </header>

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="animate-pulse">
              <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No news updates yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <NewsCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default News;
