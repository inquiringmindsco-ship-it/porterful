-- Supabase Storage Setup for Porterful Audio

-- 1. Create the storage bucket for audio files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audio',
  'audio',
  true,
  52428800, -- 50MB max file size
  ARRAY['audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/wav', 'audio/flac']
) ON CONFLICT (id) DO NOTHING;

-- 2. Create policy to allow public read access
CREATE POLICY "Public Audio Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'audio');

-- 3. Create policy for authenticated artists to upload
CREATE POLICY "Artists Can Upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'audio'
  AND auth.role() = 'authenticated'
);

-- 4. Create policy for artists to delete their own files
CREATE POLICY "Artists Can Delete Own Files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'audio'
  AND auth.uid()::text = (storage.folder(name))[1]
);

-- 5. Tracks table (if not exists)
CREATE TABLE IF NOT EXISTS tracks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  album TEXT,
  duration INTEGER,
  audio_url TEXT NOT NULL,
  cover_url TEXT,
  price DECIMAL(10,2) DEFAULT 1.00,
  plays INTEGER DEFAULT 0,
  artist_cut DECIMAL(10,2) DEFAULT 0.80,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),
  is_published BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false
);

-- 6. Enable RLS on tracks
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;

-- 7. Public can view published tracks
CREATE POLICY "Public can view published tracks"
ON tracks FOR SELECT
USING (is_published = true);

-- 8. Artists can insert their own tracks
CREATE POLICY "Artists can insert own tracks"
ON tracks FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 9. Artists can update own tracks
CREATE POLICY "Artists can update own tracks"
ON tracks FOR UPDATE
USING (auth.uid() = user_id);

-- 10. Index for faster queries
CREATE INDEX IF NOT EXISTS idx_tracks_album ON tracks(album);
CREATE INDEX IF NOT EXISTS idx_tracks_artist ON tracks(artist);
CREATE INDEX IF NOT EXISTS idx_tracks_featured ON tracks(featured);

-- 11. Playlists table
CREATE TABLE IF NOT EXISTS playlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  tracks JSONB DEFAULT '[]',
  plays INTEGER DEFAULT 0,
  earnings DECIMAL(10,2) DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Enable RLS on playlists
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;

-- 13. Public can view public playlists
CREATE POLICY "Public can view public playlists"
ON playlists FOR SELECT
USING (is_public = true);

-- 14. Users can manage own playlists
CREATE POLICY "Users can manage own playlists"
ON playlists FOR ALL
USING (auth.uid() = user_id);

-- 15. Function to generate signed URLs for audio
CREATE OR REPLACE FUNCTION get_audio_url(file_path TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN 'https://tsdjmiqczgxnkpvirkya.supabase.co/storage/v1/object/public/audio/' || file_path;
END;
$$ LANGUAGE plpgsql;