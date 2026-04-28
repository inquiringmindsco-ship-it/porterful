-- Verification Script for Migration 018
-- Run this in Supabase SQL Editor

-- Step 1: Check current columns in artist_applications
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'artist_applications'
ORDER BY ordinal_position;

-- Step 2: Run migration (safe to run multiple times with IF NOT EXISTS)
DO $$
BEGIN
    -- Add agree_rights column if not exists
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'artist_applications' 
        AND column_name = 'agree_rights'
    ) THEN
        ALTER TABLE artist_applications ADD COLUMN agree_rights BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added agree_rights column';
    ELSE
        RAISE NOTICE 'agree_rights column already exists';
    END IF;

    -- Add music_license_type column if not exists
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'artist_applications' 
        AND column_name = 'music_license_type'
    ) THEN
        ALTER TABLE artist_applications ADD COLUMN music_license_type TEXT DEFAULT 'non_exclusive';
        RAISE NOTICE 'Added music_license_type column';
    ELSE
        RAISE NOTICE 'music_license_type column already exists';
    END IF;
END $$;

-- Step 3: Add constraint if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_constraint 
        WHERE conname = 'valid_music_license_type'
        AND conrelid = 'artist_applications'::regclass
    ) THEN
        ALTER TABLE artist_applications 
        ADD CONSTRAINT valid_music_license_type 
        CHECK (music_license_type IN ('non_exclusive', 'porterful_exclusive'));
        RAISE NOTICE 'Added valid_music_license_type constraint';
    ELSE
        RAISE NOTICE 'Constraint already exists';
    END IF;
END $$;

-- Step 4: Create index if not exists
CREATE INDEX IF NOT EXISTS idx_artist_applications_license_type 
ON artist_applications (music_license_type);

-- Step 5: Update existing records (backfill)
UPDATE artist_applications 
SET music_license_type = 'non_exclusive',
    agree_rights = COALESCE(agree_rights, TRUE)
WHERE music_license_type IS NULL;

-- Step 6: Verify columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'artist_applications'
AND column_name IN ('agree_rights', 'music_license_type')
ORDER BY column_name;

-- Step 7: Show sample data (if any exists)
SELECT id, stage_name, agree_rights, music_license_type, status, created_at
FROM artist_applications
ORDER BY created_at DESC
LIMIT 5;

-- Step 8: Test constraint (should fail with invalid value)
-- Uncomment to test:
-- INSERT INTO artist_applications (user_id, stage_name, email, phone, status, agree_rights, music_license_type)
-- VALUES ('00000000-0000-0000-0000-000000000000', 'Test Constraint', 'test@test.com', '555-5555', 'pending_review', true, 'invalid_value');
