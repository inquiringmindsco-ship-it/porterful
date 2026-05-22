-- Migration 026: Founder Dashboard Schema
-- Adds status/approval control fields for artists and tracks

BEGIN;

-- Add status to artists table
ALTER TABLE public.artists 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending'
CHECK (status IN ('pending', 'approved', 'active', 'suspended'));

-- Add public profile control
ALTER TABLE public.artists 
ADD COLUMN IF NOT EXISTS public_profile_enabled BOOLEAN DEFAULT false;

-- Add auto-publish control
ALTER TABLE public.artists 
ADD COLUMN IF NOT EXISTS auto_publish BOOLEAN DEFAULT false;

-- Add status to tracks table
ALTER TABLE public.tracks 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft'
CHECK (status IN ('draft', 'pending_review', 'live', 'rejected', 'archived'));

-- Update existing data: O D gets full founder access
UPDATE public.artists 
SET 
  status = 'active',
  public_profile_enabled = true,
  auto_publish = true
WHERE id = '613a0b3a-e2c3-4e6a-ac2e-704e2a76feff';

-- Update all existing artists to approved (they were already public)
UPDATE public.artists 
SET 
  status = 'approved',
  public_profile_enabled = true
WHERE status = 'pending';

-- Update all existing tracks to live (they were already public)
UPDATE public.tracks 
SET status = 'live'
WHERE status = 'draft';

-- Create activity log table
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on activity_log
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Policy: founders/admins can read all activity
CREATE POLICY "Admins can read all activity" ON public.activity_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'founder')
    )
  );

-- Policy: users can read their own activity
CREATE POLICY "Users can read own activity" ON public.activity_log
  FOR SELECT USING (user_id = auth.uid());

COMMIT;
