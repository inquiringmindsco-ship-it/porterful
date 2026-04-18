-- Migration: Fix products table column names
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- Step 1: Check what columns actually exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY column_name;

-- Step 2: If 'artist_cut' exists but 'seller_percent' doesn't:
-- This means the old migration ran but new schema didn't
-- ADD seller_percent column:
ALTER TABLE products ADD COLUMN IF NOT EXISTS seller_percent DECIMAL(5,2) DEFAULT 67;

-- Step 3: Copy data from artist_cut to seller_percent (if artist_cut has data):
UPDATE products SET seller_percent = artist_cut WHERE seller_percent IS NULL AND artist_cut IS NOT NULL;

-- Step 4: Verify seller_percent now exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name = 'seller_percent';

-- Step 5: Confirm the fix
SELECT name, seller_percent, artist_cut FROM products LIMIT 5;