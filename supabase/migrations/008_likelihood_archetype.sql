-- ============================================================
-- LIKELIHOOD™ EXAM — USER ARCHETYPE SYSTEM
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Add archetype fields to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS archetype TEXT,
  ADD COLUMN IF NOT EXISTS archetype_scores JSONB DEFAULT '{"seller":0,"creator":0,"promoter":0,"operator":0,"freelancer":0}',
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS user_level INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS revenue_total DECIMAL(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS next_unlock DECIMAL(10, 2) DEFAULT 25;

-- 2. Migration is complete — ready for Likelihood™ exam
