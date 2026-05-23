-- Add DELETE policy for submissions (to remove declined entries)
-- Run this in Supabase SQL Editor

-- Drop if exists to avoid conflicts
DROP POLICY IF EXISTS "Allow admin delete on submissions" ON submissions;

-- Create DELETE policy for service_role
CREATE POLICY "Allow admin delete on submissions" 
  ON submissions 
  FOR DELETE 
  TO service_role 
  USING (true);

-- Verify
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'submissions' AND cmd = 'DELETE';
