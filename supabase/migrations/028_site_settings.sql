-- Migration 028: Site Settings Table
-- Stores founder-controlled featured content, homepage configuration
-- RUN THIS IN SUPABASE DASHBOARD SQL EDITOR

BEGIN;

-- Create site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Policy: founders and admins can read
CREATE POLICY "Founders can read site settings" ON public.site_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'founder')
    )
  );

-- Policy: founders and admins can update
CREATE POLICY "Founders can update site settings" ON public.site_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'founder')
    )
  );

-- Policy: founders and admins can insert
CREATE POLICY "Founders can insert site settings" ON public.site_settings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'founder')
    )
  );

-- Seed default settings
INSERT INTO public.site_settings (key, value)
VALUES 
  ('homepage', '{"hero_track_id": null, "featured_track_ids": [], "promo_track_ids": [], "hero_label": "Featured Release"}')
ON CONFLICT (key) DO NOTHING;

COMMIT;
