-- Migration 032: Measurement Foundation
-- Adds privacy-safe analytics tables for plays, downloads, and email captures.

BEGIN;

CREATE TABLE IF NOT EXISTS public.plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  track_id TEXT NOT NULL,
  artist_id UUID REFERENCES public.artists(id) ON DELETE SET NULL,
  track_title TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  playback_mode TEXT DEFAULT 'full' CHECK (playback_mode IN ('full', 'preview', 'locked')),
  source TEXT DEFAULT 'audio-context',
  city TEXT,
  state TEXT,
  played_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS plays_session_idx ON public.plays (session_id);
CREATE INDEX IF NOT EXISTS plays_track_idx ON public.plays (track_id);
CREATE INDEX IF NOT EXISTS plays_artist_idx ON public.plays (artist_id);
CREATE INDEX IF NOT EXISTS plays_played_at_idx ON public.plays (played_at DESC);
CREATE INDEX IF NOT EXISTS plays_city_idx ON public.plays (city);
CREATE INDEX IF NOT EXISTS plays_state_idx ON public.plays (state);

CREATE TABLE IF NOT EXISTS public.downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  purchase_id UUID REFERENCES public.music_purchases(id) ON DELETE SET NULL,
  track_id TEXT NOT NULL,
  artist_id UUID REFERENCES public.artists(id) ON DELETE SET NULL,
  track_title TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  city TEXT,
  state TEXT,
  source TEXT DEFAULT 'download-proxy',
  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS downloads_session_idx ON public.downloads (session_id);
CREATE INDEX IF NOT EXISTS downloads_track_idx ON public.downloads (track_id);
CREATE INDEX IF NOT EXISTS downloads_artist_idx ON public.downloads (artist_id);
CREATE INDEX IF NOT EXISTS downloads_purchase_idx ON public.downloads (purchase_id);
CREATE INDEX IF NOT EXISTS downloads_downloaded_at_idx ON public.downloads (downloaded_at DESC);
CREATE INDEX IF NOT EXISTS downloads_city_idx ON public.downloads (city);
CREATE INDEX IF NOT EXISTS downloads_state_idx ON public.downloads (state);

CREATE TABLE IF NOT EXISTS public.email_captures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  email_hash TEXT NOT NULL,
  email_domain TEXT,
  city TEXT,
  state TEXT,
  source TEXT DEFAULT 'email-access',
  captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS email_captures_session_email_idx
  ON public.email_captures (session_id, email_hash);
CREATE INDEX IF NOT EXISTS email_captures_session_idx ON public.email_captures (session_id);
CREATE INDEX IF NOT EXISTS email_captures_captured_at_idx ON public.email_captures (captured_at DESC);
CREATE INDEX IF NOT EXISTS email_captures_city_idx ON public.email_captures (city);
CREATE INDEX IF NOT EXISTS email_captures_state_idx ON public.email_captures (state);

ALTER TABLE public.plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_captures ENABLE ROW LEVEL SECURITY;

-- Measurement metadata on music purchases so funnel analysis can link back to
-- the same anonymous session while keeping reporting separate from revenue.
ALTER TABLE public.music_purchases
  ADD COLUMN IF NOT EXISTS measurement_session_id TEXT;

ALTER TABLE public.music_purchases
  ADD COLUMN IF NOT EXISTS measurement_city TEXT;

ALTER TABLE public.music_purchases
  ADD COLUMN IF NOT EXISTS measurement_state TEXT;

CREATE INDEX IF NOT EXISTS music_purchases_measurement_session_idx
  ON public.music_purchases (measurement_session_id);
CREATE INDEX IF NOT EXISTS music_purchases_measurement_city_idx
  ON public.music_purchases (measurement_city);
CREATE INDEX IF NOT EXISTS music_purchases_measurement_state_idx
  ON public.music_purchases (measurement_state);

COMMIT;
