import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar as CalendarIcon,
  Upload,
  LogOut,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/context/auth-context";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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

interface NewsPost {
  id: number;
  thumbnail_url: string;
  organizer_name: string;
  organizer_avatar: string;
  description: string;
  created_at: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  // Form state for donation post
  const [donationTitle, setDonationTitle] = useState("");
  const [donationDesc, setDonationDesc] = useState("");
  const [donationOrgName, setDonationOrgName] = useState("");
  const [donationTargetAmount, setDonationTargetAmount] = useState("");
  const [donationThumbnail, setDonationThumbnail] = useState<File | null>(null);
  const [donationOrgAvatar, setDonationOrgAvatar] = useState<File | null>(null);

  // Dates for donation campaign
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  // Form state for news post
  const [newsTitle, setNewsTitle] = useState("");
  const [newsDesc, setNewsDesc] = useState("");
  const [newsOrgName, setNewsOrgName] = useState("");
  const [newsThumbnail, setNewsThumbnail] = useState<File | null>(null);
  const [newsOrgAvatar, setNewsOrgAvatar] = useState<File | null>(null);

  // Lists of existing posts for management
  const [donationPosts, setDonationPosts] = useState<DonationPost[]>([]);
  const [newsPosts, setNewsPosts] = useState<NewsPost[]>([]);

  // Edit mode state
  const [editingDonationId, setEditingDonationId] = useState<number | null>(
    null
  );
  const [editingNewsId, setEditingNewsId] = useState<number | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch existing posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Fetch donation posts
        const { data: donationData, error: donationError } = await supabase
          .from("donation_posts")
          .select("*")
          .order("created_at", { ascending: false });

        if (donationError) throw donationError;
        setDonationPosts(donationData || []);

        // Fetch news posts
        const { data: newsData, error: newsError } = await supabase
          .from("news_posts")
          .select("*")
          .order("created_at", { ascending: false });

        if (newsError) throw newsError;
        setNewsPosts(newsData || []);
      } catch (error) {
        console.error("Error fetching posts:", error);
        toast.error("Failed to load posts");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate("/admin/login");
  };

  const uploadFile = async (file: File, bucket: string) => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.floor(
        Math.random() * 1000
      )}.${fileExt}`;
      const filePath = `${bucket}/${fileName}`;
      const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (error) throw error;

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error(`Error uploading to ${bucket}:`, error);
      throw error;
    }
  };

  const handleCreateDonationPost = async () => {
    if (
      !donationTitle ||
      !donationDesc ||
      !donationOrgName ||
      !donationTargetAmount ||
      !donationThumbnail ||
      !donationOrgAvatar ||
      !startDate ||
      !endDate
    ) {
      toast.error("Please fill in all fields for the donation post");
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload files
      const thumbnailUrl = await uploadFile(donationThumbnail, "thumbnails");
      const orgAvatarUrl = await uploadFile(donationOrgAvatar, "avatars");
      // const thumbnailUrl =
      //   "/public/thumbnails/" +
      //   (await uploadFile(donationThumbnail, "thumbnails"));
      // const orgAvatarUrl =
      //   "/public/avatars/" + (await uploadFile(donationOrgAvatar, "avatars"));

      // Create or update post
      if (editingDonationId) {
        // Update existing post
        const { error } = await supabase
          .from("donation_posts")
          .update({
            thumbnail_url: thumbnailUrl,
            organizer_name: donationOrgName,
            organizer_avatar: orgAvatarUrl,
            description: donationDesc,
            target_amount: parseFloat(donationTargetAmount),
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
          })
          .eq("id", editingDonationId);

        if (error) throw error;
        toast.success("Donation post updated successfully");

        // Refresh the list
        const { data } = await supabase
          .from("donation_posts")
          .select("*")
          .order("created_at", { ascending: false });

        setDonationPosts(data || []);
      } else {
        // Create new post
        const { error } = await supabase.from("donation_posts").insert({
          thumbnail_url: thumbnailUrl,
          organizer_name: donationOrgName,
          organizer_avatar: orgAvatarUrl,
          description: donationDesc,
          target_amount: parseFloat(donationTargetAmount),
          current_amount: 0,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        });

        if (error) throw error;
        toast.success("Donation post created successfully");

        // Refresh the list
        const { data } = await supabase
          .from("donation_posts")
          .select("*")
          .order("created_at", { ascending: false });

        setDonationPosts(data || []);
      }

      // Reset form
      setDonationTitle("");
      setDonationDesc("");
      setDonationOrgName("");
      setDonationTargetAmount("");
      setDonationThumbnail(null);
      setDonationOrgAvatar(null);
      setStartDate(undefined);
      setEndDate(undefined);
      setEditingDonationId(null);
    } catch (error) {
      console.error("Error with donation post:", error);
      toast.error("Failed to process donation post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateNewsPost = async () => {
    if (
      !newsTitle ||
      !newsDesc ||
      !newsOrgName ||
      !newsThumbnail ||
      !newsOrgAvatar
    ) {
      toast.error("Please fill in all fields for the news post");
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload files
      const thumbnailUrl = await uploadFile(newsThumbnail, "thumbnails");
      const orgAvatarUrl = await uploadFile(newsOrgAvatar, "avatars");

      if (editingNewsId) {
        // Update existing post
        const { error } = await supabase
          .from("news_posts")
          .update({
            thumbnail_url: thumbnailUrl,
            organizer_name: newsOrgName,
            organizer_avatar: orgAvatarUrl,
            description: newsDesc,
          })
          .eq("id", editingNewsId);

        if (error) throw error;
        toast.success("News post updated successfully");

        // Refresh the list
        const { data } = await supabase
          .from("news_posts")
          .select("*")
          .order("created_at", { ascending: false });

        setNewsPosts(data || []);
      } else {
        // Create new post
        const { error } = await supabase.from("news_posts").insert({
          thumbnail_url: thumbnailUrl,
          organizer_name: newsOrgName,
          organizer_avatar: orgAvatarUrl,
          description: newsDesc,
        });

        if (error) throw error;
        toast.success("News post created successfully");

        // Refresh the list
        const { data } = await supabase
          .from("news_posts")
          .select("*")
          .order("created_at", { ascending: false });

        setNewsPosts(data || []);
      }

      // Reset form
      setNewsTitle("");
      setNewsDesc("");
      setNewsOrgName("");
      setNewsThumbnail(null);
      setNewsOrgAvatar(null);
      setEditingNewsId(null);
    } catch (error) {
      console.error("Error with news post:", error);
      toast.error("Failed to process news post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditDonation = (post: DonationPost) => {
    // Set form values
    setDonationTitle(post.description.split("\n")[0] || ""); // Assume first line is title
    setDonationDesc(post.description);
    setDonationOrgName(post.organizer_name);
    setDonationTargetAmount(post.target_amount.toString());
    setStartDate(post.start_date ? new Date(post.start_date) : undefined);
    setEndDate(post.end_date ? new Date(post.end_date) : undefined);
    setEditingDonationId(post.id);

    toast.info(
      "Now editing donation post. Make changes and click 'Update Campaign'."
    );
  };

  const handleEditNews = (post: NewsPost) => {
    // Set form values
    setNewsTitle(post.description.split("\n")[0] || ""); // Assume first line is title
    setNewsDesc(post.description);
    setNewsOrgName(post.organizer_name);
    setEditingNewsId(post.id);

    toast.info("Now editing news post. Make changes and click 'Update News'.");
  };

  const handleDeleteDonation = async (id: number) => {
    try {
      const { error } = await supabase
        .from("donation_posts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Donation post deleted successfully");

      // Update state by removing the deleted post
      setDonationPosts(donationPosts.filter((post) => post.id !== id));
    } catch (error) {
      console.error("Error deleting donation post:", error);
      toast.error("Failed to delete donation post");
    }
  };

  const handleDeleteNews = async (id: number) => {
    try {
      const { error } = await supabase.from("news_posts").delete().eq("id", id);

      if (error) throw error;

      toast.success("News post deleted successfully");

      // Update state by removing the deleted post
      setNewsPosts(newsPosts.filter((post) => post.id !== id));
    } catch (error) {
      console.error("Error deleting news post:", error);
      toast.error("Failed to delete news post");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage content and campaigns
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="donation" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="donation">Donation Campaigns</TabsTrigger>
            <TabsTrigger value="news">News Posts</TabsTrigger>
          </TabsList>

          {/* Donation Campaign Tab */}
          <TabsContent value="donation">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>
                  {editingDonationId
                    ? "Edit Donation Campaign"
                    : "Create Donation Campaign"}
                </CardTitle>
                <CardDescription>
                  {editingDonationId
                    ? "Update an existing donation campaign"
                    : "Add a new donation campaign to the platform"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="donationTitle">Campaign Title</Label>
                    <Input
                      id="donationTitle"
                      placeholder="Enter campaign title"
                      value={donationTitle}
                      onChange={(e) => setDonationTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="donationOrgName">Organizer Name</Label>
                    <Input
                      id="donationOrgName"
                      placeholder="Enter organizer name"
                      value={donationOrgName}
                      onChange={(e) => setDonationOrgName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="donationDesc">Description</Label>
                  <Textarea
                    id="donationDesc"
                    placeholder="Describe the donation campaign"
                    value={donationDesc}
                    onChange={(e) => setDonationDesc(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="donationTargetAmount">
                      Target Amount ($)
                    </Label>
                    <Input
                      id="donationTargetAmount"
                      type="number"
                      placeholder="Enter target amount"
                      value={donationTargetAmount}
                      onChange={(e) => setDonationTargetAmount(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Campaign Duration</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "justify-start text-left font-normal",
                              !startDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? (
                              format(startDate, "PPP")
                            ) : (
                              <span>Start date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={setStartDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "justify-start text-left font-normal",
                              !endDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? (
                              format(endDate, "PPP")
                            ) : (
                              <span>End date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={setEndDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="donationThumbnail">
                      Campaign Thumbnail
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="donationThumbnail"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setDonationThumbnail(e.target.files[0]);
                          }
                        }}
                      />
                      {donationThumbnail && (
                        <div className="text-sm text-green-600 dark:text-green-400">
                          Selected ✓
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="donationOrgAvatar">Organizer Avatar</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="donationOrgAvatar"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setDonationOrgAvatar(e.target.files[0]);
                          }
                        }}
                      />
                      {donationOrgAvatar && (
                        <div className="text-sm text-green-600 dark:text-green-400">
                          Selected ✓
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                {editingDonationId && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingDonationId(null);
                      setDonationTitle("");
                      setDonationDesc("");
                      setDonationOrgName("");
                      setDonationTargetAmount("");
                      setDonationThumbnail(null);
                      setDonationOrgAvatar(null);
                      setStartDate(undefined);
                      setEndDate(undefined);
                    }}
                  >
                    Cancel Editing
                  </Button>
                )}
                <Button
                  onClick={handleCreateDonationPost}
                  disabled={isSubmitting}
                  className="bg-amber hover:bg-amber-dark"
                >
                  {isSubmitting ? (
                    "Processing..."
                  ) : editingDonationId ? (
                    <>
                      <Pencil className="h-4 w-4 mr-2" />
                      Update Campaign
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Campaign
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            {/* List of existing donation posts for management */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">
                Manage Existing Campaigns
              </h3>

              {isLoading ? (
                <p>Loading campaigns...</p>
              ) : donationPosts.length === 0 ? (
                <p className="text-muted-foreground">
                  No donation campaigns yet
                </p>
              ) : (
                <div className="space-y-4">
                  {donationPosts.map((post) => (
                    <Card key={post.id} className="overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-1/4 h-40 bg-gray-100">
                          <img
                            src={post.thumbnail_url}
                            alt={post.organizer_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4 flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold">
                                {post.description.split("\n")[0]}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                By {post.organizer_name} • Target: $
                                {post.target_amount}
                              </p>
                              <p className="text-sm mt-2">
                                {post.start_date && post.end_date
                                  ? `${new Date(
                                      post.start_date
                                    ).toLocaleDateString()} - ${new Date(
                                      post.end_date
                                    ).toLocaleDateString()}`
                                  : "No dates specified"}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditDonation(post)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Are you sure?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete this donation
                                      campaign and cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleDeleteDonation(post.id)
                                      }
                                      className="bg-red-500 hover:bg-red-600"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* News Posts Tab */}
          <TabsContent value="news">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>
                  {editingNewsId ? "Edit News Post" : "Create News Post"}
                </CardTitle>
                <CardDescription>
                  {editingNewsId
                    ? "Update an existing news post"
                    : "Add a new news update to the platform"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newsTitle">News Title</Label>
                    <Input
                      id="newsTitle"
                      placeholder="Enter news title"
                      value={newsTitle}
                      onChange={(e) => setNewsTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newsOrgName">Publisher Name</Label>
                    <Input
                      id="newsOrgName"
                      placeholder="Enter publisher name"
                      value={newsOrgName}
                      onChange={(e) => setNewsOrgName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newsDesc">Content</Label>
                  <Textarea
                    id="newsDesc"
                    placeholder="Write the news content"
                    value={newsDesc}
                    onChange={(e) => setNewsDesc(e.target.value)}
                    rows={6}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newsThumbnail">News Thumbnail</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="newsThumbnail"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setNewsThumbnail(e.target.files[0]);
                          }
                        }}
                      />
                      {newsThumbnail && (
                        <div className="text-sm text-green-600 dark:text-green-400">
                          Selected ✓
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newsOrgAvatar">Publisher Avatar</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="newsOrgAvatar"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setNewsOrgAvatar(e.target.files[0]);
                          }
                        }}
                      />
                      {newsOrgAvatar && (
                        <div className="text-sm text-green-600 dark:text-green-400">
                          Selected ✓
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                {editingNewsId && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingNewsId(null);
                      setNewsTitle("");
                      setNewsDesc("");
                      setNewsOrgName("");
                      setNewsThumbnail(null);
                      setNewsOrgAvatar(null);
                    }}
                  >
                    Cancel Editing
                  </Button>
                )}
                <Button
                  onClick={handleCreateNewsPost}
                  disabled={isSubmitting}
                  className="bg-amber hover:bg-amber-dark"
                >
                  {isSubmitting ? (
                    "Processing..."
                  ) : editingNewsId ? (
                    <>
                      <Pencil className="h-4 w-4 mr-2" />
                      Update News
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Publish News
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            {/* List of existing news posts for management */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Manage Existing News</h3>

              {isLoading ? (
                <p>Loading news posts...</p>
              ) : newsPosts.length === 0 ? (
                <p className="text-muted-foreground">No news posts yet</p>
              ) : (
                <div className="space-y-4">
                  {newsPosts.map((post) => (
                    <Card key={post.id} className="overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-1/4 h-40 bg-gray-100">
                          <img
                            src={post.thumbnail_url}
                            alt={post.organizer_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4 flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold">
                                {post.description.split("\n")[0]}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                By {post.organizer_name} •{" "}
                                {new Date(post.created_at).toLocaleDateString()}
                              </p>
                              <p className="text-sm mt-2 line-clamp-2">
                                {post.description
                                  .split("\n")
                                  .slice(1)
                                  .join(" ")}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditNews(post)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Are you sure?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete this news
                                      post and cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteNews(post.id)}
                                      className="bg-red-500 hover:bg-red-600"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
