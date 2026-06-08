-- Migration 041: Artist Video Import + Creator Progression
-- Adds YouTube-imported artist videos and a founder-managed progression override layer.

BEGIN;

CREATE TABLE IF NOT EXISTS public.artist_videos (
  video_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

  source_url TEXT NOT NULL,
  youtube_video_id TEXT NOT NULL,
  embed_url TEXT NOT NULL,
  title TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  channel_name TEXT,
  published_at TIMESTAMPTZ,

  video_category TEXT NOT NULL DEFAULT 'music_video'
    CHECK (video_category IN ('featured', 'music_video', 'interview', 'live_performance')),
  visibility_status TEXT NOT NULL DEFAULT 'visible'
    CHECK (visibility_status IN ('visible', 'hidden', 'archived')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  source TEXT NOT NULL DEFAULT 'youtube',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS artist_videos_artist_idx
  ON public.artist_videos (artist_id);
CREATE INDEX IF NOT EXISTS artist_videos_creator_idx
  ON public.artist_videos (creator_id);
CREATE INDEX IF NOT EXISTS artist_videos_category_idx
  ON public.artist_videos (video_category);
CREATE INDEX IF NOT EXISTS artist_videos_visibility_idx
  ON public.artist_videos (visibility_status);
CREATE INDEX IF NOT EXISTS artist_videos_youtube_idx
  ON public.artist_videos (youtube_video_id);
CREATE INDEX IF NOT EXISTS artist_videos_created_idx
  ON public.artist_videos (created_at DESC);

ALTER TABLE public.artist_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read visible artist videos"
  ON public.artist_videos
  FOR SELECT
  USING (visibility_status = 'visible');

CREATE POLICY "Artists can insert own videos"
  ON public.artist_videos
  FOR INSERT
  WITH CHECK (auth.uid() = artist_id);

CREATE POLICY "Artists can update own videos"
  ON public.artist_videos
  FOR UPDATE
  USING (auth.uid() = artist_id)
  WITH CHECK (auth.uid() = artist_id);

CREATE POLICY "Artists can delete own videos"
  ON public.artist_videos
  FOR DELETE
  USING (auth.uid() = artist_id);

CREATE OR REPLACE FUNCTION public.update_artist_videos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS artist_videos_updated_at ON public.artist_videos;
CREATE TRIGGER artist_videos_updated_at
  BEFORE UPDATE ON public.artist_videos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_artist_videos_updated_at();

CREATE TABLE IF NOT EXISTS public.artist_progressions (
  artist_id UUID PRIMARY KEY REFERENCES public.artists(id) ON DELETE CASCADE,
  access_state TEXT NOT NULL DEFAULT 'auto'
    CHECK (access_state IN ('auto', 'granted', 'revoked')),
  manual_level INTEGER CHECK (manual_level BETWEEN 1 AND 4),
  manual_video_slot_limit INTEGER CHECK (manual_video_slot_limit >= 0),
  manual_featured_video_limit INTEGER CHECK (manual_featured_video_limit >= 0),
  manual_notes TEXT,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS artist_progressions_access_state_idx
  ON public.artist_progressions (access_state);
CREATE INDEX IF NOT EXISTS artist_progressions_updated_idx
  ON public.artist_progressions (updated_at DESC);

ALTER TABLE public.artist_progressions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artists can read own progression"
  ON public.artist_progressions
  FOR SELECT
  USING (auth.uid() = artist_id);

CREATE OR REPLACE FUNCTION public.update_artist_progressions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS artist_progressions_updated_at ON public.artist_progressions;
CREATE TRIGGER artist_progressions_updated_at
  BEFORE UPDATE ON public.artist_progressions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_artist_progressions_updated_at();

COMMIT;
