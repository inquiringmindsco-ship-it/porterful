-- Migration 043: Harden artist media access for user-scoped reads
-- Keeps artist video queries under user context while preserving founder/admin override access.

BEGIN;

CREATE OR REPLACE FUNCTION public.is_porterful_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND lower(coalesce(p.role, '')) IN ('admin', 'founder')
  );
$$;

DO $$
BEGIN
  EXECUTE 'GRANT EXECUTE ON FUNCTION public.is_porterful_staff() TO authenticated';
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END
$$;

DROP POLICY IF EXISTS "Public can read visible artist videos" ON public.artist_videos;
DROP POLICY IF EXISTS "Artists can insert own videos" ON public.artist_videos;
DROP POLICY IF EXISTS "Artists can update own videos" ON public.artist_videos;
DROP POLICY IF EXISTS "Artists can delete own videos" ON public.artist_videos;

CREATE POLICY "Public can read visible artist videos"
  ON public.artist_videos
  FOR SELECT
  USING (
    visibility_status = 'visible'
    OR auth.uid() = artist_id
    OR public.is_porterful_staff()
  );

CREATE POLICY "Artists and Porterful staff can insert artist videos"
  ON public.artist_videos
  FOR INSERT
  WITH CHECK (
    auth.uid() = artist_id
    OR public.is_porterful_staff()
  );

CREATE POLICY "Artists and Porterful staff can update artist videos"
  ON public.artist_videos
  FOR UPDATE
  USING (
    auth.uid() = artist_id
    OR public.is_porterful_staff()
  )
  WITH CHECK (
    auth.uid() = artist_id
    OR public.is_porterful_staff()
  );

CREATE POLICY "Artists and Porterful staff can delete artist videos"
  ON public.artist_videos
  FOR DELETE
  USING (
    auth.uid() = artist_id
    OR public.is_porterful_staff()
  );

DROP POLICY IF EXISTS "Artists can read own progression" ON public.artist_progressions;
CREATE POLICY "Artists and Porterful staff can read progression"
  ON public.artist_progressions
  FOR SELECT
  USING (
    auth.uid() = artist_id
    OR public.is_porterful_staff()
  );

COMMIT;
