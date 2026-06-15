-- Migration 042: Track Collaborators Junction Table
-- Creates the canonical collaborator join table for multi-artist tracks.

BEGIN;

CREATE TABLE IF NOT EXISTS public.track_collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'collaborator'
    CHECK (role IN ('primary', 'featured', 'producer', 'writer', 'collaborator')),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS track_collaborators_track_idx
  ON public.track_collaborators (track_id);
CREATE INDEX IF NOT EXISTS track_collaborators_artist_idx
  ON public.track_collaborators (artist_id);
CREATE INDEX IF NOT EXISTS track_collaborators_role_idx
  ON public.track_collaborators (role);
CREATE INDEX IF NOT EXISTS track_collaborators_display_order_idx
  ON public.track_collaborators (track_id, display_order, created_at);

ALTER TABLE public.track_collaborators ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read track collaborators" ON public.track_collaborators;
CREATE POLICY "Public can read track collaborators"
  ON public.track_collaborators
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Artists and Porterful staff can manage track collaborators" ON public.track_collaborators;
CREATE POLICY "Artists and Porterful staff can manage track collaborators"
  ON public.track_collaborators
  FOR ALL
  USING (
    auth.uid() = artist_id
    OR EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND lower(coalesce(p.role, '')) IN ('admin', 'founder')
    )
  )
  WITH CHECK (
    auth.uid() = artist_id
    OR EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND lower(coalesce(p.role, '')) IN ('admin', 'founder')
    )
  );

CREATE OR REPLACE FUNCTION public.update_track_collaborators_created_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_at = COALESCE(NEW.created_at, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS track_collaborators_created_at ON public.track_collaborators;
CREATE TRIGGER track_collaborators_created_at
  BEFORE INSERT ON public.track_collaborators
  FOR EACH ROW
  EXECUTE FUNCTION public.update_track_collaborators_created_at();

COMMIT;
