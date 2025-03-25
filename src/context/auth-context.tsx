import { createContext, useContext, useEffect, useState } from "react";
import { createClient, SupabaseClient, User } from "@supabase/supabase-js";
import { toast } from "sonner";

// Define auth context types
type AuthContextType = {
  user: User | null;
  profile: any | null;
  isAdmin: boolean;
  isLoading: boolean;
  signUp: (email: string, password: string, data: any) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signInAdmin: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  updateProfile: (data: any) => Promise<any>;
  uploadAvatar: (file: File) => Promise<string | null>;
};

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Supabase client
const supabaseUrl = "https://lxrqxzvwlrwzmvkibnqq.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4cnF4enZ3bHJ3em12a2libnFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3MTE4MDQsImV4cCI6MjA1ODI4NzgwNH0.5ToDvexVW9XirPRaj_SnQvz0fdcVa0b8whDiTow4mmM";
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Auth provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check for session on load
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setUser(data.session?.user ?? null);

        if (data.session?.user) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.session.user.id)
            .single();

          setProfile(profileData);
          setIsAdmin(profileData?.is_admin || false);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching session:", error);
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
        setIsLoading(false);
      }
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setIsLoading(true);

        if (session?.user) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          setProfile(profileData);
          setIsAdmin(profileData?.is_admin || false);
        } else {
          setProfile(null);
          setIsAdmin(false);
        }

        setIsLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // // Sign up function
  // const signUp = async (email: string, password: string, userData: any) => {
  //   try {
  //     setIsLoading(true);

  //     const { data, error } = await supabase.auth.signUp({
  //       email,
  //       password,
  //     });

  //     if (error) throw error;

  //     if (data.user) {
  //       let avatarUrl = userData.avatar_url;
  //       if (!avatarUrl && userData.avatar) {
  //         avatarUrl = await uploadAvatar(userData.avatar);
  //       }

  //       const { error: profileError } = await supabase.from("profiles").insert({
  //         id: data.user.id,
  //         display_name: userData.display_name,
  //         avatar_url: avatarUrl || null,
  //         email: email,
  //         is_admin: false,
  //       });

  //       if (profileError) {
  //         console.error("Profile creation error:", profileError);
  //         throw new Error("Failed to create user profile");
  //       }
  //     }

  //     toast.success("Account created successfully!");
  //     return data;
  //   } catch (error: any) {
  //     toast.error(error.message || "An error occurred during sign up");
  //     throw error;
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // Sign up function
  // const signUp = async (email: string, password: string, userData: any) => {
  //   try {
  //     setIsLoading(true);

  //     // Sign up user
  //     const { data, error } = await supabase.auth.signUp({
  //       email,
  //       password,
  //     });

  //     if (error) throw error;
  //     if (!data.user) throw new Error("User sign-up failed");

  //     // Wait for authentication session
  //     await new Promise((resolve) => setTimeout(resolve, 2000)); // Give Supabase time to register session

  //     // Fetch authenticated user session
  //     const {
  //       data: { user },
  //       error: authError,
  //     } = await supabase.auth.getUser();

  //     if (authError || !user)
  //       throw new Error("Failed to retrieve authenticated user");

  //     // Upload avatar if provided
  //     let avatarUrl = userData.avatar_url;
  //     if (!avatarUrl && userData.avatar) {
  //       avatarUrl = await uploadAvatar(userData.avatar);
  //     }

  //     // Insert into profiles with the authenticated user ID
  //     const { error: profileError } = await supabase.from("profiles").insert({
  //       id: user.id, // Using the confirmed authenticated user ID
  //       display_name: userData.display_name,
  //       avatar_url: avatarUrl || null,
  //       email,
  //       is_admin: false,
  //     });

  //     if (profileError) {
  //       console.error("Profile creation error:", profileError);
  //       throw new Error("Failed to create user profile");
  //     }

  //     toast.success("Account created successfully!");
  //     return data;
  //   } catch (error: any) {
  //     toast.error(error.message || "An error occurred during sign up");
  //     throw error;
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      setIsLoading(true);

      // Step 1: Register the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error("User sign-up failed");

      // Step 2: Wait for the session to be created
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Step 3: Fetch the authenticated user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user)
        throw new Error("Failed to retrieve authenticated user");

      // Step 4: Upload avatar if provided
      let avatarUrl = userData.avatar_url;
      if (!avatarUrl && userData.avatar) {
        avatarUrl = await uploadAvatar(userData.avatar);
      }

      // Step 5: Insert into profiles table
      const { error: profileError } = await supabase.from("profiles").insert({
        id: user.id, // Using confirmed authenticated user ID
        display_name: userData.display_name,
        avatar_url: avatarUrl || null,
        email,
        is_admin: false,
      });

      if (profileError) {
        console.error("Profile creation error:", profileError);
        throw new Error("Failed to create user profile");
      }

      toast.success("Account created successfully!");
      return data;
    } catch (error: any) {
      toast.error(error.message || "An error occurred during sign up");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success("Signed in successfully!");
      return data;
    } catch (error: any) {
      toast.error(error.message || "Invalid login credentials");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Admin sign in
  const signInAdmin = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", data.user.id)
        .single();

      if (profileError) throw profileError;

      if (!profileData.is_admin) {
        await supabase.auth.signOut();
        throw new Error("Access denied: Admin privileges required");
      }

      toast.success("Signed in as admin successfully!");
      return data;
    } catch (error: any) {
      toast.error(error.message || "Invalid admin credentials");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Signed out successfully!");
    } catch (error: any) {
      toast.error(error.message || "Error signing out");
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (data: any) => {
    try {
      setIsLoading(true);

      if (!user) throw new Error("No user logged in");

      const { error } = await supabase
        .from("profiles")
        .update(data)
        .eq("id", user.id);

      if (error) throw error;

      setProfile({ ...profile, ...data });
      toast.success("Profile updated successfully!");
      return { ...profile, ...data };
    } catch (error: any) {
      toast.error(error.message || "Error updating profile");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Upload avatar function
  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      if (!user && !file) throw new Error("No user logged in or file provided");

      const fileExt = file.name.split(".").pop();
      const fileName = `${user?.id || "temp"}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: any) {
      console.error("Avatar upload error:", error);
      toast.error(error.message || "Error uploading avatar");
      return null;
    }
  };

  const value = {
    user,
    profile,
    isAdmin,
    isLoading,
    signUp,
    signIn,
    signInAdmin,
    signOut,
    updateProfile,
    uploadAvatar,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Auth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Supabase client export for direct usage
export { supabase };
