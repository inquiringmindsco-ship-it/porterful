-- Migration 025: Fix tracks RLS policy
-- The current policy checks tracks.station_id against stations, but:
-- 1. tracks.station_id is not set in the upload API
-- 2. There are no stations in the database
-- 3. artist_id IS the auth user ID (profiles.id references auth.users)
-- 
-- Fix: Check artist_id directly against auth.uid()

BEGIN;

-- Drop the broken policy
DROP POLICY IF EXISTS "Artists can manage own tracks" ON tracks;

-- Create correct policy: artist_id is the auth user ID
CREATE POLICY "Artists can manage own tracks" ON tracks
  FOR ALL
  USING (auth.uid() = artist_id)
  WITH CHECK (auth.uid() = artist_id);

-- Also ensure public can read (already exists, but keep it safe)
DROP POLICY IF EXISTS "Anyone can read tracks" ON tracks;
CREATE POLICY "Anyone can read tracks" ON tracks
  FOR SELECT
  USING (true);

COMMIT;
