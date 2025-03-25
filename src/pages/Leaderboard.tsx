import { useEffect, useState } from "react";
import { supabase } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy } from "lucide-react";

interface LeaderboardUser {
  id: string;
  display_name: string;
  avatar_url: string | null;
  total_donation: number;
  rank: number;
}

const Leaderboard = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // We'll use a complex query to get the leaderboard data
        const { data, error } = await supabase.rpc("get_leaderboard");

        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // Helper function for medal colors
  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "text-amber-400";
      case 2:
        return "text-gray-400";
      case 3:
        return "text-amber-800";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
        <p className="text-muted-foreground mt-1">
          Top donors making a difference
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-amber" /> Donation Heroes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  className="flex items-center justify-between p-3 animate-pulse"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No donations yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`font-bold ${getMedalColor(user.rank)}`}>
                      #{user.rank}
                    </div>
                    <Avatar>
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback>
                        {user.display_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{user.display_name}</span>
                  </div>
                  <div className="font-medium text-right">
                    MMK {user.total_donation.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Leaderboard;
