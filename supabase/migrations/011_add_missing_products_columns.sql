-- Fix: Add all missing columns that the app expects but migration 2026-04-10 didn't add
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Check current columns
SELECT column_name FROM information_schema.columns WHERE table_name = 'products' ORDER BY column_name;

-- 2. Add images column (the root cause of current failure)
ALTER TABLE products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]';

-- 3. Add variants column if missing
ALTER TABLE products ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]';

-- 4. Add inventory_count if missing
ALTER TABLE products ADD COLUMN IF NOT EXISTS inventory_count INTEGER DEFAULT 999;

-- 5. Verify
SELECT column_name FROM information_schema.columns WHERE table_name = 'products' ORDER BY column_name;
