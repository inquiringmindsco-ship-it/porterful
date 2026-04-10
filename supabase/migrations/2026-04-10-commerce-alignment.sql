-- ============================================================
-- PORTERFUL ARTIST COMMERCE — PHASE 1A SCHEMA ALIGNMENT
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Add missing products table columns for artist-commerce system
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS seller_type TEXT DEFAULT 'artist' CHECK (seller_type IN ('artist', 'porterful', 'admin')),
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'live', 'archived')),
  ADD COLUMN IF NOT EXISTS printful_sync_status TEXT CHECK (printful_sync_status IN ('pending', 'synced', 'error', 'not_linked')),
  ADD COLUMN IF NOT EXISTS printful_product_id TEXT,
  ADD COLUMN IF NOT EXISTS printful_variant_ids UUID[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS base_price DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS artist_cut DECIMAL(5, 4) DEFAULT 0.8000,
  ADD COLUMN IF NOT EXISTS artist_name TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- 2. Backfill: migrate existing products to porterful as seller (they're static platform products)
UPDATE products
  SET seller_type = 'porterful', is_active = true, status = 'live', base_price = price
  WHERE seller_type IS NULL OR seller_type = 'porterful';

-- 3. Add products indexes for artist queries
CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status) WHERE status = 'live';
CREATE INDEX IF NOT EXISTS idx_products_printful ON products(printful_product_id) WHERE printful_product_id IS NOT NULL;

-- 4. Artist tier margins (for reference in app logic)
-- 'new'     → 60% of sale_price to artist
-- 'growing' → 70% of sale_price to artist
-- 'established' → 80% of sale_price to artist
