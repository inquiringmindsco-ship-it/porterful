-- Migration 034: Product SKU System MVP
-- Links sellable product variants to production-approved assets.
-- Enforces: SKU can only reference assets with production_status = 'production_approved'.
-- No inventory ledger. No fulfillment logic. No checkout changes.

BEGIN;

CREATE TABLE IF NOT EXISTS public.product_skus (
  sku_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku_code TEXT UNIQUE NOT NULL,
  production_asset_id UUID NOT NULL REFERENCES public.production_assets(asset_id) ON DELETE RESTRICT,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  artist_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  product_type TEXT NOT NULL CHECK (product_type IN ('shirt', 'hoodie', 'poster', 'sticker', 'bundle', 'hat', 'tote', 'other')),
  variant_name TEXT NOT NULL DEFAULT '',
  size TEXT,
  color TEXT,
  unit_cost_cents INTEGER NOT NULL DEFAULT 0,
  retail_price_cents INTEGER NOT NULL DEFAULT 0,
  weight_oz NUMERIC(6,2) NOT NULL DEFAULT 0,
  package_type TEXT NOT NULL DEFAULT 'polybag',
  print_location TEXT,
  active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS product_skus_asset_idx ON public.product_skus (production_asset_id);
CREATE INDEX IF NOT EXISTS product_skus_product_idx ON public.product_skus (product_id);
CREATE INDEX IF NOT EXISTS product_skus_artist_idx ON public.product_skus (artist_id);
CREATE INDEX IF NOT EXISTS product_skus_type_idx ON public.product_skus (product_type);
CREATE INDEX IF NOT EXISTS product_skus_active_idx ON public.product_skus (active);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_product_skus_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS product_skus_updated_at ON public.product_skus;
CREATE TRIGGER product_skus_updated_at
  BEFORE UPDATE ON public.product_skus
  FOR EACH ROW
  EXECUTE FUNCTION public.update_product_skus_updated_at();

-- Validation trigger: ensure referenced asset is production_approved before insert
CREATE OR REPLACE FUNCTION public.check_sku_production_asset_approved()
RETURNS TRIGGER AS $$
DECLARE
  asset_status TEXT;
BEGIN
  SELECT production_status INTO asset_status
  FROM public.production_assets
  WHERE asset_id = NEW.production_asset_id;

  IF asset_status IS NULL THEN
    RAISE EXCEPTION 'Referenced production asset does not exist';
  END IF;

  IF asset_status != 'production_approved' THEN
    RAISE EXCEPTION 'SKU can only reference production-approved assets. Asset status: %', asset_status;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sku_production_asset_gate ON public.product_skus;
CREATE TRIGGER sku_production_asset_gate
  BEFORE INSERT ON public.product_skus
  FOR EACH ROW
  EXECUTE FUNCTION public.check_sku_production_asset_approved();

COMMIT;
