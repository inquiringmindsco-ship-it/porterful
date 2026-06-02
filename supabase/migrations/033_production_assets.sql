-- Migration 033: Production Asset Registry MVP
-- Adds the canonical creative asset registry used by Porterful merch and future fulfillment.

BEGIN;

CREATE TABLE IF NOT EXISTS public.production_assets (
  asset_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_group_id UUID NOT NULL DEFAULT gen_random_uuid(),
  prior_version_id UUID REFERENCES public.production_assets(asset_id) ON DELETE SET NULL,

  creator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  artist_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  asset_type TEXT NOT NULL CHECK (
    asset_type IN (
      'song',
      'album_cover',
      'artist_logo',
      'merch_design',
      'campaign_artwork',
      'photograph',
      'video_still',
      'catchphrase',
      'signature',
      'likeness_asset',
      'tour_artwork',
      'limited_edition_design'
    )
  ),
  title TEXT NOT NULL,
  description TEXT,
  source_song_id UUID REFERENCES public.tracks(id) ON DELETE SET NULL,
  source_campaign TEXT,
  file_url TEXT,
  reference_url TEXT,

  version_number INTEGER NOT NULL DEFAULT 1,
  is_current_version BOOLEAN NOT NULL DEFAULT TRUE,
  change_notes TEXT,

  approval_status TEXT NOT NULL DEFAULT 'draft' CHECK (
    approval_status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'revision_needed')
  ),
  production_status TEXT NOT NULL DEFAULT 'not_ready' CHECK (
    production_status IN ('not_ready', 'production_approved', 'retired')
  ),

  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,

  rights_notes TEXT,
  usage_notes TEXT,
  review_notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS production_assets_creator_idx
  ON public.production_assets (creator_id);
CREATE INDEX IF NOT EXISTS production_assets_artist_idx
  ON public.production_assets (artist_id);
CREATE INDEX IF NOT EXISTS production_assets_type_idx
  ON public.production_assets (asset_type);
CREATE INDEX IF NOT EXISTS production_assets_approval_idx
  ON public.production_assets (approval_status);
CREATE INDEX IF NOT EXISTS production_assets_production_idx
  ON public.production_assets (production_status);
CREATE INDEX IF NOT EXISTS production_assets_group_idx
  ON public.production_assets (asset_group_id);
CREATE INDEX IF NOT EXISTS production_assets_current_idx
  ON public.production_assets (asset_group_id)
  WHERE is_current_version = TRUE;
CREATE INDEX IF NOT EXISTS production_assets_source_song_idx
  ON public.production_assets (source_song_id);
CREATE INDEX IF NOT EXISTS production_assets_approved_by_idx
  ON public.production_assets (approved_by);

ALTER TABLE public.production_assets ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.update_production_assets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS production_assets_updated_at ON public.production_assets;
CREATE TRIGGER production_assets_updated_at
  BEFORE UPDATE ON public.production_assets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_production_assets_updated_at();

COMMIT;
