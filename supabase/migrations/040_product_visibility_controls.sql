-- Migration 040: Product visibility controls
-- Founder-managed visibility flags for public/store/purchasable catalog control.

BEGIN;

CREATE TABLE IF NOT EXISTS public.product_visibility_controls (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id TEXT NOT NULL UNIQUE,
  public_visible BOOLEAN NOT NULL DEFAULT TRUE,
  store_visible BOOLEAN NOT NULL DEFAULT TRUE,
  purchasable BOOLEAN NOT NULL DEFAULT FALSE,
  visibility_status TEXT NOT NULL DEFAULT 'preview'
    CHECK (visibility_status IN ('live', 'preview', 'unavailable', 'hidden', 'controlled')),
  notes TEXT,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS product_visibility_controls_status_idx
  ON public.product_visibility_controls (visibility_status);

CREATE INDEX IF NOT EXISTS product_visibility_controls_product_idx
  ON public.product_visibility_controls (product_id);

CREATE OR REPLACE FUNCTION public.update_product_visibility_controls_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS product_visibility_controls_updated_at ON public.product_visibility_controls;
CREATE TRIGGER product_visibility_controls_updated_at
  BEFORE UPDATE ON public.product_visibility_controls
  FOR EACH ROW EXECUTE FUNCTION public.update_product_visibility_controls_updated_at();

INSERT INTO public.product_visibility_controls (
  product_id,
  public_visible,
  store_visible,
  purchasable,
  visibility_status,
  notes
) VALUES (
  '75006c54-3f40-4309-81a1-a85de8f34841',
  TRUE,
  TRUE,
  TRUE,
  'controlled',
  'Controlled merch activation for Coming Home Tee'
)
ON CONFLICT (product_id) DO UPDATE SET
  public_visible = EXCLUDED.public_visible,
  store_visible = EXCLUDED.store_visible,
  purchasable = EXCLUDED.purchasable,
  visibility_status = EXCLUDED.visibility_status,
  notes = EXCLUDED.notes,
  updated_at = NOW();

COMMIT;
