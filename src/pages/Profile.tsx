
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/components/theme-provider";
import { useNavigate } from "react-router-dom";
import { Upload, Moon, Sun, LogOut, Info, User, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const Profile = () => {
  const { profile, updateProfile, signOut, uploadAvatar, isLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    if (displayName.trim() === "") return;
    
    setSaving(true);
    try {
      let newAvatarUrl = profile?.avatar_url;
      
      if (avatar) {
        const uploadedUrl = await uploadAvatar(avatar);
        if (uploadedUrl) {
          newAvatarUrl = uploadedUrl;
        }
      }
      
      await updateProfile({
        display_name: displayName,
        avatar_url: newAvatarUrl,
      });
      
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg font-medium">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account</p>
      </header>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage 
                    src={avatarPreview || profile?.avatar_url} 
                    alt={profile?.display_name} 
                  />
                  <AvatarFallback className="text-xl">
                    {profile?.display_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute bottom-0 right-0 rounded-full bg-white dark:bg-gray-800 h-8 w-8"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              
              <div className="space-y-2 flex-1">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  This is the name that will be displayed to other users
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={profile?.email || ""}
                disabled
                className="bg-gray-50 dark:bg-gray-800"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleSaveProfile} 
              disabled={saving || displayName.trim() === ""}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Manage your app settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-medium">Dark Mode</div>
                <div className="text-sm text-muted-foreground">
                  Toggle between light and dark theme
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Sun className="h-4 w-4 text-amber" />
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={(checked) => {
                    setTheme(checked ? "dark" : "light");
                  }}
                />
                <Moon className="h-4 w-4" />
              </div>
            </div>
            
            <Separator />
            
            <Dialog>
              <DialogTrigger asChild>
                <div className="flex items-center justify-between cursor-pointer">
                  <div className="space-y-0.5">
                    <div className="font-medium">About This App</div>
                    <div className="text-sm text-muted-foreground">
                      View information about the application
                    </div>
                  </div>
                  <Info className="h-4 w-4" />
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>About</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p>
                    This donation platform connects people with causes they care about. 
                    Users can donate to campaigns and stay updated with the latest news.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Version 1.0.0
                  </p>
                </div>
              </DialogContent>
            </Dialog>
            
            <Separator />
            
            <div 
              className="flex items-center justify-between cursor-pointer" 
              onClick={handleLogout}
            >
              <div className="space-y-0.5">
                <div className="font-medium">Log Out</div>
                <div className="text-sm text-muted-foreground">
                  Sign out of your account
                </div>
              </div>
              <LogOut className="h-4 w-4 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
