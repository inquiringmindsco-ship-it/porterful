-- MIGRATION 031 — Fix proud_to_pay_min column type
-- Date: 2026-06-02
-- Purpose: Allow decimal values (0.50) in track pricing
-- Risk Level: LOW — ALTER TABLE on existing column, preserves existing data

BEGIN;

-- Check current column type first (diagnostic)
SELECT column_name, data_type, numeric_precision, numeric_scale
FROM information_schema.columns
WHERE table_name = 'tracks' AND column_name = 'proud_to_pay_min';

-- If column is INTEGER, change to DECIMAL(10,2)
-- If already DECIMAL, this is a no-op
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tracks' 
    AND column_name = 'proud_to_pay_min'
    AND data_type = 'integer'
  ) THEN
    -- Change INTEGER to DECIMAL(10,2)
    ALTER TABLE public.tracks 
    ALTER COLUMN proud_to_pay_min TYPE DECIMAL(10,2) 
    USING proud_to_pay_min::DECIMAL(10,2);
    
    -- Set default for new tracks
    ALTER TABLE public.tracks 
    ALTER COLUMN proud_to_pay_min SET DEFAULT 0.50;
  END IF;
END $$;

-- Also fix the 'price' column if it exists as INTEGER (legacy alias)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tracks' 
    AND column_name = 'price'
    AND data_type = 'integer'
  ) THEN
    ALTER TABLE public.tracks 
    ALTER COLUMN price TYPE DECIMAL(10,2) 
    USING price::DECIMAL(10,2);
  END IF;
END $$;

-- Verify final state
SELECT column_name, data_type, numeric_precision, numeric_scale
FROM information_schema.columns
WHERE table_name = 'tracks' AND column_name IN ('proud_to_pay_min', 'price');

COMMIT;
