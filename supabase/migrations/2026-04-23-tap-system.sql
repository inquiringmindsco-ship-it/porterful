-- ============================================================
-- PORTERFUL TAP SYSTEM
-- Adds public tap profiles and lightweight tap analytics.
-- ============================================================

CREATE TABLE IF NOT EXISTS tap_profiles (
  slug TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  hero_image_url TEXT NOT NULL,
  primary_product_id TEXT,
  store_url TEXT NOT NULL,
  ref_code TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  bio TEXT,
  secondary_products JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tap_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_type TEXT NOT NULL CHECK (event_type IN ('visit', 'register', 'store', 'learn')),
  path TEXT NOT NULL,
  slug TEXT,
  ref TEXT,
  product TEXT,
  campaign TEXT,
  destination_href TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tap_profiles_active
  ON tap_profiles(is_active)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_tap_events_slug
  ON tap_events(slug);

CREATE INDEX IF NOT EXISTS idx_tap_events_type
  ON tap_events(event_type);

CREATE INDEX IF NOT EXISTS idx_tap_events_created_at
  ON tap_events(created_at);

ALTER TABLE tap_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tap_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public tap profiles are viewable" ON tap_profiles;
CREATE POLICY "Public tap profiles are viewable" ON tap_profiles
  FOR SELECT USING (is_active = true);

