-- Artist profile columns — run in Supabase SQL Editor
-- Adds columns needed for artist profile pages and editing

-- Add cover_url and avatar_url to artists table (if not exist)
ALTER TABLE artists ADD COLUMN IF NOT EXISTS cover_url TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS website TEXT;

-- Add individual social link columns for easier editing
ALTER TABLE artists ADD COLUMN IF NOT EXISTS youtube_url TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS twitter_url TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS tiktok_url TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS soundcloud_url TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS spotify_url TEXT;

-- Add avatar_url to profiles if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website TEXT;

-- Drop the artists table's old social_links JSONB column if you're using individual columns
-- (commented out to preserve data if you have any)
-- ALTER TABLE artists DROP COLUMN IF EXISTS social_links;
