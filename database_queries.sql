
-- Create storage buckets
INSERT INTO storage.buckets (id, name) VALUES ('avatars', 'avatars');
INSERT INTO storage.buckets (id, name) VALUES ('thumbnails', 'thumbnails');

-- Set up storage bucket policies
CREATE POLICY "Public Access for Avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Public Access for Thumbnails" ON storage.objects
  FOR SELECT USING (bucket_id = 'thumbnails');

CREATE POLICY "Authenticated admins can upload thumbnails" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'thumbnails' 
    AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  email TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create donation_posts table
CREATE TABLE donation_posts (
  id SERIAL PRIMARY KEY,
  thumbnail_url TEXT NOT NULL,
  organizer_name TEXT NOT NULL,
  organizer_avatar TEXT NOT NULL,
  description TEXT NOT NULL,
  target_amount DECIMAL NOT NULL,
  current_amount DECIMAL DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create news_posts table
CREATE TABLE news_posts (
  id SERIAL PRIMARY KEY,
  thumbnail_url TEXT NOT NULL,
  organizer_name TEXT NOT NULL,
  organizer_avatar TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create comments table
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id INTEGER NOT NULL,
  post_type TEXT NOT NULL,  -- 'donation' or 'news'
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create donations table to track donations
CREATE TABLE donations (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id INTEGER REFERENCES donation_posts(id) ON DELETE CASCADE,
  amount DECIMAL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create a function to get leaderboard data
CREATE OR REPLACE FUNCTION get_leaderboard()
RETURNS TABLE (
  id UUID,
  display_name TEXT,
  avatar_url TEXT,
  total_donation DECIMAL,
  rank BIGINT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id, 
    p.display_name, 
    p.avatar_url,
    COALESCE(SUM(d.amount), 0) as total_donation,
    ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(d.amount), 0) DESC) as rank
  FROM 
    profiles p
  LEFT JOIN 
    donations d ON p.id = d.user_id
  GROUP BY 
    p.id, p.display_name, p.avatar_url
  ORDER BY 
    total_donation DESC
  LIMIT 100;
END;
$$;

-- Create RLS policies for each table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view any profile" 
  ON profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- IMPORTANT: Add policy to allow profile creation during registration
CREATE POLICY "Allow users to insert their own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Donation posts policies
CREATE POLICY "Anyone can view donation posts" 
  ON donation_posts FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can insert donation posts" 
  ON donation_posts FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Only admins can update donation posts" 
  ON donation_posts FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Add delete policy for donation posts
CREATE POLICY "Only admins can delete donation posts" 
  ON donation_posts FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
    )
  );

-- News posts policies
CREATE POLICY "Anyone can view news posts" 
  ON news_posts FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can insert news posts" 
  ON news_posts FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Only admins can update news posts" 
  ON news_posts FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Add delete policy for news posts
CREATE POLICY "Only admins can delete news posts" 
  ON news_posts FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Comments policies
CREATE POLICY "Anyone can view comments" 
  ON comments FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can insert comments" 
  ON comments FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own comments" 
  ON comments FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" 
  ON comments FOR DELETE 
  USING (auth.uid() = user_id);

-- Donations policies
CREATE POLICY "Anyone can view donation totals" 
  ON donations FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can insert donations" 
  ON donations FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Create an admin user function (to be executed from the dashboard)
CREATE OR REPLACE FUNCTION create_admin_user(admin_email TEXT, display_name TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET is_admin = TRUE
  WHERE email = admin_email;
END;
$$;
