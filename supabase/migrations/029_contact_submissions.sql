-- Migration 029: Contact Submissions Table
-- Stores contact form submissions for founder/admin review
-- Created: 2026-05-23

BEGIN;

CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT DEFAULT 'General',
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: anyone can insert (for contact form)
CREATE POLICY "Allow anonymous contact submissions" ON public.contact_submissions
  FOR INSERT WITH CHECK (true);

-- Policy: only founders/admins can read
CREATE POLICY "Founders can read contact submissions" ON public.contact_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'founder')
    )
  );

-- Policy: only founders/admins can update
CREATE POLICY "Founders can update contact submissions" ON public.contact_submissions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'founder')
    )
  );

-- Index for performance
CREATE INDEX IF NOT EXISTS contact_submissions_status_idx ON public.contact_submissions (status);
CREATE INDEX IF NOT EXISTS contact_submissions_created_at_idx ON public.contact_submissions (created_at DESC);

COMMIT;