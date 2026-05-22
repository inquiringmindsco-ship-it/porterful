-- Migration 023: Artist Submissions Table
-- For tracking artist/music submissions through /submit page
-- Created: 2026-05-21

BEGIN;

CREATE TABLE IF NOT EXISTS submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Artist info
  stage_name TEXT NOT NULL,
  email TEXT NOT NULL,
  genre TEXT,
  city TEXT,
  bio TEXT,

  -- Review status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),

  -- Admin notes
  review_notes TEXT,
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,

  -- Timestamps
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track files attached to a submission
CREATE TABLE IF NOT EXISTS submission_tracks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE NOT NULL,

  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  path TEXT NOT NULL,
  size INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS submissions_email_idx ON submissions (email);
CREATE INDEX IF NOT EXISTS submissions_status_idx ON submissions (status);
CREATE INDEX IF NOT EXISTS submissions_submitted_at_idx ON submissions (submitted_at DESC);
CREATE INDEX IF NOT EXISTS submission_tracks_submission_idx ON submission_tracks (submission_id);

-- Enable RLS
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_tracks ENABLE ROW LEVEL SECURITY;

-- Allow anon insert (for submission form)
CREATE POLICY "Allow anonymous submissions" ON submissions
  FOR INSERT TO anon WITH CHECK (true);

-- Allow anon insert on tracks
CREATE POLICY "Allow anonymous track inserts" ON submission_tracks
  FOR INSERT TO anon WITH CHECK (true);

-- Allow select for service_role (admin dashboard)
CREATE POLICY "Allow admin select on submissions" ON submissions
  FOR SELECT TO service_role USING (true);

CREATE POLICY "Allow admin select on tracks" ON submission_tracks
  FOR SELECT TO service_role USING (true);

COMMIT;
