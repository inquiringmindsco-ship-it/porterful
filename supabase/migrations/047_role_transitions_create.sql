-- Migration 047: Create role_transitions table
-- Migration 045 (045_role_transitions.sql) was written but never applied to
-- live Supabase, so role-transition audits silently fail. This migration
-- creates the table with the same schema and adds RLS policies so the
-- audit trail is reliable.

BEGIN;

CREATE TABLE IF NOT EXISTS public.role_transitions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  previous_role TEXT,
  next_role TEXT NOT NULL,
  changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  source TEXT NOT NULL,
  reason TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (previous_role IS NULL OR previous_role <> next_role)
);

-- Indexes for the common queries (latest transition for a user, recent
-- transitions to a target role).
CREATE INDEX IF NOT EXISTS role_transitions_user_id_idx
  ON public.role_transitions (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS role_transitions_next_role_idx
  ON public.role_transitions (next_role, created_at DESC);

-- RLS
ALTER TABLE public.role_transitions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies in case the table was partially created.
DROP POLICY IF EXISTS "Service role full access" ON public.role_transitions;
DROP POLICY IF EXISTS "Users can read own transitions" ON public.role_transitions;

-- Policy 1: service role has full access (used by the application
-- promotion flow, manual admin actions, etc).
CREATE POLICY "Service role full access"
  ON public.role_transitions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy 2: a user can read their own transitions (so the dashboard
-- can show "you were promoted to artist on ...")
CREATE POLICY "Users can read own transitions"
  ON public.role_transitions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

COMMIT;
