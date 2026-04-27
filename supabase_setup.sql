-- SQL Script to set up the Hivon Blog database

-- Create Roles Enum
CREATE TYPE user_role AS ENUM ('Author', 'Viewer', 'Admin');

-- Create Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role user_role DEFAULT 'Viewer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  image_url TEXT,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) example
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view posts
CREATE POLICY "Public can view posts" ON posts FOR SELECT USING (true);

-- Allow Authors to insert their own posts
CREATE POLICY "Authors can create posts" ON posts FOR INSERT 
WITH CHECK (auth.uid() = author_id);
