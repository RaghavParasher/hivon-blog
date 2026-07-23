-- SQL Script to set up the Hivon Blog database

-- Create Roles Enum if it does not exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('Author', 'Viewer', 'Admin');
  END IF;
END $$;

-- Create Users table (linked to auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role user_role DEFAULT 'Viewer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  image_url TEXT,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- ======================================================
-- USERS POLICIES
-- ======================================================
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON users;
CREATE POLICY "Public profiles are viewable by everyone" ON users 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile name" ON users;
CREATE POLICY "Users can update own profile name" ON users 
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ======================================================
-- POSTS POLICIES
-- ======================================================
DROP POLICY IF EXISTS "Anyone can view posts" ON posts;
CREATE POLICY "Anyone can view posts" ON posts 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authors can create posts" ON posts;
CREATE POLICY "Authors can create posts" ON posts 
  FOR INSERT WITH CHECK (
    auth.uid() = author_id AND 
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('Author', 'Admin'))
  );

DROP POLICY IF EXISTS "Authors can update own posts" ON posts;
CREATE POLICY "Authors can update own posts" ON posts 
  FOR UPDATE USING (
    auth.uid() = author_id OR 
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'Admin')
  );

DROP POLICY IF EXISTS "Authors/Admins can delete posts" ON posts;
CREATE POLICY "Authors/Admins can delete posts" ON posts 
  FOR DELETE USING (
    auth.uid() = author_id OR 
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'Admin')
  );

-- ======================================================
-- COMMENTS POLICIES
-- ======================================================
DROP POLICY IF EXISTS "Anyone can view comments" ON comments;
CREATE POLICY "Anyone can view comments" ON comments 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
CREATE POLICY "Authenticated users can create comments" ON comments 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON comments;
CREATE POLICY "Users can delete own comments" ON comments 
  FOR DELETE USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'Admin')
  );

-- ======================================================
-- 3. SETUP AUTOMATIC PROFILE CREATION TRIGGER
-- ======================================================

-- Trigger function to automatically copy new auth.users into our public.users table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role user_role;
BEGIN
  IF new.email = 'admin@hivon.com' THEN
    assigned_role := 'Admin'::user_role;
  ELSIF new.email = 'author@hivon.com' THEN
    assigned_role := 'Author'::user_role;
  ELSE
    assigned_role := 'Viewer'::user_role;
  END IF;

  INSERT INTO public.users (id, name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'User'),
    new.email,
    assigned_role
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger cleanly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
