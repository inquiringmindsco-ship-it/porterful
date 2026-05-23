-- Fix submissions table RLS policies
-- Run this in Supabase SQL Editor

-- 1. Enable RLS on submissions table (if not already enabled)
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- 2. Enable RLS on submission_tracks table
ALTER TABLE submission_tracks ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if they conflict
DROP POLICY IF EXISTS "Allow admin update on submissions" ON submissions;
DROP POLICY IF EXISTS "Allow admin update on submission_tracks" ON submission_tracks;

-- 4. Add UPDATE policy for service_role (what the API uses)
CREATE POLICY "Allow admin update on submissions" 
  ON submissions 
  FOR UPDATE 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow admin update on submission_tracks" 
  ON submission_tracks 
  FOR UPDATE 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

-- 5. Also add DELETE policy (for future cleanup)
DROP POLICY IF EXISTS "Allow admin delete on submissions" ON submissions;
CREATE POLICY "Allow admin delete on submissions" 
  ON submissions 
  FOR DELETE 
  TO service_role 
  USING (true);

-- 6. Verify all policies exist
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('submissions', 'submission_tracks')
ORDER BY tablename, policyname;
