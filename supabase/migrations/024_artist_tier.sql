-- Migration 024: Add artist_tier to artists table
-- Tier system:
--   basic_artist: 3 active tracks (trial/free)
--   verified_artist: 25 active tracks (identity verified)
--   likeness_verified_artist: 25 active tracks (Likeness Verified)
--   porterful_artist: unlimited (active seller/producer)
--   exclusive_porterful_artist: unlimited + priority roster

BEGIN;

ALTER TABLE public.artists 
ADD COLUMN IF NOT EXISTS artist_tier TEXT 
DEFAULT 'basic_artist' 
CHECK (artist_tier IN (
  'basic_artist', 
  'verified_artist', 
  'likeness_verified_artist', 
  'porterful_artist', 
  'exclusive_porterful_artist'
));

-- Update O D Porter to exclusive Porterful Artist
UPDATE public.artists 
SET artist_tier = 'exclusive_porterful_artist' 
WHERE id = '613a0b3a-e2c3-4e6a-ac2e-704e2a76feff';

-- Set all existing artists to basic_artist (default trial tier)
UPDATE public.artists 
SET artist_tier = 'basic_artist' 
WHERE artist_tier IS NULL;

COMMIT;
