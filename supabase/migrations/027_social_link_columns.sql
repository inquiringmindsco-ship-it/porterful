-- Migration 027: Add missing social link columns
-- Adds tiktok_url and x_url for complete social link support
-- RUN THIS IN SUPABASE DASHBOARD SQL EDITOR

BEGIN;

-- Add tiktok_url if missing
ALTER TABLE public.artists 
ADD COLUMN IF NOT EXISTS tiktok_url TEXT;

-- Add x_url if missing (modern Twitter/X URL)
ALTER TABLE public.artists 
ADD COLUMN IF NOT EXISTS x_url TEXT;

COMMIT;
