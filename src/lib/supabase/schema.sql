-- ==========================================
-- IDEATHON CHECK-IN SYSTEM - COMPLETE SCHEMA
-- ==========================================
-- Run this entire script in the Supabase SQL Editor for a brand new project.

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  team_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  institution TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  checked_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'Member',
  is_present BOOLEAN NOT NULL DEFAULT false,
  marked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create Indexes
CREATE INDEX IF NOT EXISTS idx_teams_status ON teams(status);
CREATE INDEX IF NOT EXISTS idx_teams_username ON teams(username);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_schedule_order ON schedule(order_index);

-- 3. Enable Realtime for the frontend
ALTER PUBLICATION supabase_realtime ADD TABLE teams;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule ENABLE ROW LEVEL SECURITY;

-- 5. Grant Permissions (Required because 'Expose new tables' is unchecked)

-- For Frontend (Anon/Authenticated)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON TABLE teams, team_members, admins, schedule TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- For Backend API (Service Role)
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 6. Create RLS Policies
-- Safely drop existing policies so this script can be run multiple times
DROP POLICY IF EXISTS "Allow initial admin setup" ON admins;
DROP POLICY IF EXISTS "Allow reading admins" ON admins;
DROP POLICY IF EXISTS "Allow reading teams" ON teams;
DROP POLICY IF EXISTS "Allow inserting teams" ON teams;
DROP POLICY IF EXISTS "Allow updating teams" ON teams;
DROP POLICY IF EXISTS "Allow reading members" ON team_members;
DROP POLICY IF EXISTS "Allow inserting members" ON team_members;
DROP POLICY IF EXISTS "Allow updating members" ON team_members;
DROP POLICY IF EXISTS "Allow reading schedule" ON schedule;

-- Admins
CREATE POLICY "Allow reading admins" ON admins FOR SELECT TO public USING (true);

-- Teams
CREATE POLICY "Allow reading teams" ON teams FOR SELECT TO public USING (true);
CREATE POLICY "Allow inserting teams" ON teams FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow updating teams" ON teams FOR UPDATE TO public USING (true);

-- Team Members
CREATE POLICY "Allow reading members" ON team_members FOR SELECT TO public USING (true);
CREATE POLICY "Allow inserting members" ON team_members FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow updating members" ON team_members FOR UPDATE TO public USING (true);

-- Schedule
CREATE POLICY "Allow reading schedule" ON schedule FOR SELECT TO public USING (true);

-- 7. Reload Schema Cache
NOTIFY pgrst, 'reload schema';
