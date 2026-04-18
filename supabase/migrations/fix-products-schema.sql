-- Migration: Fix products table schema
-- Run this in Supabase SQL Editor if you see 'artist_cut' column errors

-- Check current columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products';

-- If artist_cut exists but seller_percent doesn't, run:
-- ALTER TABLE products RENAME COLUMN artist_cut TO seller_percent;

-- If seller_percent doesn't exist at all, add it:
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS seller_percent DECIMAL(5,2) DEFAULT 67;

-- Verify the columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('seller_percent', 'artist_cut', 'artist_fund_percent', 'superfan_percent', 'platform_percent');