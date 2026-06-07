-- Run this in your Supabase SQL Editor to set up the database schema.

-- 1. Profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  points INTEGER DEFAULT 0,
  eco_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are publicly viewable"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. Trips (group planning)
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  origin_name TEXT,
  dest_name TEXT,
  origin_lng DOUBLE PRECISION,
  origin_lat DOUBLE PRECISION,
  dest_lng DOUBLE PRECISION,
  dest_lat DOUBLE PRECISION,
  created_by UUID NOT NULL REFERENCES profiles(id),
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'voting', 'confirmed', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trip members can view"
  ON trips FOR SELECT
  USING (
    created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM trip_members WHERE trip_id = id AND user_id = auth.uid())
  );

CREATE POLICY "Authenticated users can create trips"
  ON trips FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creator can update trip"
  ON trips FOR UPDATE
  USING (auth.uid() = created_by);

-- 3. Trip members
CREATE TABLE IF NOT EXISTS trip_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(trip_id, user_id)
);

ALTER TABLE trip_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members visible to trip members"
  ON trip_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM trip_members tm WHERE tm.trip_id = trip_id AND tm.user_id = auth.uid())
  );

CREATE POLICY "Users can join trips"
  ON trip_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4. Trip messages (real-time chat)
CREATE TABLE IF NOT EXISTS trip_messages (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE trip_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trip messages visible to members"
  ON trip_messages FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM trip_members WHERE trip_id = trip_messages.trip_id AND user_id = auth.uid())
  );

CREATE POLICY "Members can send messages"
  ON trip_messages FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM trip_members WHERE trip_id = trip_messages.trip_id AND user_id = auth.uid())
  );

-- 5. Saved routes (leaderboard points)
CREATE TABLE IF NOT EXISTS saved_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  origin_name TEXT,
  dest_name TEXT,
  mode TEXT,
  provider TEXT,
  co2_saved DOUBLE PRECISION DEFAULT 0,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE saved_routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Saved routes publicly viewable"
  ON saved_routes FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own routes"
  ON saved_routes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Indexes for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_saved_routes_user_id ON saved_routes(user_id);
CREATE INDEX IF NOT EXISTS idx_trip_messages_trip_id ON trip_messages(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_messages_created ON trip_messages(created_at DESC);

-- Enable realtime on trip_messages for live chat
ALTER PUBLICATION supabase_realtime ADD TABLE trip_messages;

-- Function: auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
