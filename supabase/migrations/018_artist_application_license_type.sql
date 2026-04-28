-- Migration 018: Artist Application License Type
-- Adds rights confirmation and music license type tracking
-- Created: 2026-04-28

BEGIN;

-- Add new columns to artist_applications table
ALTER TABLE artist_applications
  ADD COLUMN IF NOT EXISTS agree_rights BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS music_license_type TEXT DEFAULT 'non_exclusive';

-- Add constraint to ensure valid license types
ALTER TABLE artist_applications
  ADD CONSTRAINT valid_music_license_type 
  CHECK (music_license_type IN ('non_exclusive', 'porterful_exclusive'));

-- Add comment explaining the columns
COMMENT ON COLUMN artist_applications.agree_rights IS 
  'Artist confirms they own or control rights to upload, sell, stream, and promote music';

COMMENT ON COLUMN artist_applications.music_license_type IS 
  'non_exclusive: artist can distribute elsewhere | porterful_exclusive: only available on Porterful';

-- Create index for license type queries (for reporting/analytics)
CREATE INDEX IF NOT EXISTS idx_artist_applications_license_type 
  ON artist_applications (music_license_type);

-- Update existing records (set default for existing applications)
UPDATE artist_applications 
SET music_license_type = 'non_exclusive',
    agree_rights = COALESCE(agree_rights, TRUE)  -- Assume true for existing approved applications
WHERE music_license_type IS NULL;

COMMIT;
