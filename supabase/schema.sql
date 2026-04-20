-- Porterful Database Schema V2.1
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES (extends Supabase Auth)
-- ============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'supporter' CHECK (role IN ('supporter', 'superfan', 'artist', 'business', 'brand', 'admin')),
  referral_code TEXT UNIQUE DEFAULT 'PF-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8)),
  referred_by UUID REFERENCES profiles(id),
  paid_cash BOOLEAN DEFAULT FALSE,
  cash_paid_at TIMESTAMPTZ,
  activation_code_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SUPERFANS
-- ============================================
CREATE TABLE superfans (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  tier TEXT DEFAULT 'supporter' CHECK (tier IN ('supporter', 'superfan', 'champion', 'patron')),
  primary_artist_id UUID REFERENCES artists(id),
  total_referrals INTEGER DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0,
  available_earnings DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ARTISTS
-- ============================================
CREATE TABLE artists (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  slug TEXT UNIQUE,
  bio TEXT,
  genre TEXT[],
  location TEXT,
  website_url TEXT,
  social_links JSONB DEFAULT '{}',
  monthly_goal DECIMAL(10,2) DEFAULT 1000,
  current_earnings DECIMAL(10,2) DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0,
  supporter_count INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BUSINESSES (Small Businesses + Brands)
-- ============================================
CREATE TABLE businesses (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  business_name TEXT NOT NULL,
  business_type TEXT CHECK (business_type IN ('small_business', 'brand')),
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  stripe_account_id TEXT,
  verified BOOLEAN DEFAULT FALSE,
  total_sales DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PRODUCTS (Marketplace)
-- ============================================
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  seller_type TEXT CHECK (seller_type IN ('artist', 'business')),
  category TEXT NOT NULL CHECK (category IN ('artist_merch', 'essentials', 'trending', 'digital', 'service')),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  cost DECIMAL(10,2) DEFAULT 0,
  images JSONB DEFAULT '[]',
  variants JSONB DEFAULT '[]',
  inventory_count INTEGER DEFAULT 999,
  inventory_tracking BOOLEAN DEFAULT FALSE,
  
  -- Dropshipping
  dropship_provider TEXT CHECK (dropship_provider IN ('none', 'printful', 'zendrop', 'cj_dropshipping', 'manual')),
  dropship_product_id TEXT,
  
  -- Revenue splits
  seller_percent DECIMAL(5,2) DEFAULT 67,
  artist_fund_percent DECIMAL(5,2) DEFAULT 20,
  superfan_percent DECIMAL(5,2) DEFAULT 3,
  platform_percent DECIMAL(5,2) DEFAULT 10,
  
  -- Linked artist (for marketplace sales)
  linked_artist_id UUID REFERENCES artists(id),
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ORDERS
-- ============================================
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  order_number TEXT UNIQUE DEFAULT 'ORD-' || UPPER(SUBSTRING(MD5(RANDOM()::text) FROM 1 FOR 8)),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  
  -- Amounts
  subtotal DECIMAL(10,2) NOT NULL,
  shipping DECIMAL(10,2) DEFAULT 0,
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  
  -- Revenue splits
  seller_total DECIMAL(10,2) DEFAULT 0,
  artist_fund_total DECIMAL(10,2) DEFAULT 0,
  superfan_total DECIMAL(10,2) DEFAULT 0,
  platform_total DECIMAL(10,2) DEFAULT 0,
  
  -- Referral tracking
  referrer_id UUID REFERENCES profiles(id), -- Superfan who referred
  
  -- Cash/activation tracking
  activation_code_id UUID,
  payment_method TEXT DEFAULT 'stripe' CHECK (payment_method IN ('stripe', 'cash', 'code')),
  discount_cents INTEGER DEFAULT 0,

  -- Stripe
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  
  -- Shipping
  shipping_address JSONB,
  tracking_number TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ORDER ITEMS
-- ============================================
CREATE TABLE order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  seller_id UUID REFERENCES profiles(id),
  artist_id UUID REFERENCES artists(id),
  superfan_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CART
-- ============================================
CREATE TABLE cart_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STATIONS (Radio)
-- ============================================
CREATE TABLE stations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  genre TEXT,
  cover_url TEXT,
  is_live BOOLEAN DEFAULT FALSE,
  listener_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRACKS
-- ============================================
CREATE TABLE tracks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  station_id UUID REFERENCES stations(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES artists(id),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  album TEXT,
  duration INTEGER, -- seconds
  audio_url TEXT,
  cover_url TEXT,
  play_count INTEGER DEFAULT 0,
  proud_to_pay_min DECIMAL(10,2) DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER TRACKS (Proud to Pay)
-- ============================================
CREATE TABLE user_tracks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  amount_paid DECIMAL(10,2) NOT NULL,
  tier TEXT CHECK (tier IN ('listener', 'supporter', 'champion', 'patron')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, track_id)
);

-- ============================================
-- SUBSCRIPTIONS (Premium Radio)
-- ============================================
CREATE TABLE subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  price DECIMAL(10,2) DEFAULT 0,
  stripe_subscription_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ARTIST GOALS
-- ============================================
CREATE TABLE goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  month DATE NOT NULL, -- YYYY-MM-01
  target_amount DECIMAL(10,2) NOT NULL,
  current_amount DECIMAL(10,2) DEFAULT 0,
  supporter_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- REFERRALS (Superfan tracking)
-- ============================================
CREATE TABLE referrals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  referrer_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- Superfan
  referred_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- New user
  referral_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- REFERRAL EARNINGS
-- ============================================
CREATE TABLE referral_earnings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  superfan_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'available', 'withdrawn')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ACTIVATION CODES
-- ============================================
CREATE TABLE activation_codes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code_value TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'unused' CHECK (status IN ('unused', 'used')),
  kind TEXT DEFAULT 'activation' CHECK (kind IN ('activation', 'discount')),
  prepaid BOOLEAN DEFAULT FALSE,
  discount_cents INTEGER DEFAULT 0,
  shirt_type TEXT,
  source TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  redeemed_by_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  redeemed_email TEXT,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DROPSHIP ORDERS (Third-party fulfillment)
-- ============================================
CREATE TABLE dropship_orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  provider TEXT NOT NULL,
  provider_order_id TEXT,
  tracking_number TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FOLLOWERS
-- ============================================
CREATE TABLE followers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, artist_id)
);

-- ============================================
-- REVIEWS
-- ============================================
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_artist ON products(linked_artist_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_referrer ON orders(referrer_id);
CREATE INDEX idx_stations_artist ON stations(artist_id);
CREATE INDEX idx_tracks_station ON tracks(station_id);
CREATE INDEX idx_tracks_artist ON tracks(artist_id);
CREATE INDEX idx_goals_artist ON goals(artist_id);
CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referral_earnings_superfan ON referral_earnings(superfan_id);
CREATE INDEX idx_activation_codes_code_value ON activation_codes(code_value);
CREATE INDEX idx_activation_codes_status ON activation_codes(status);
CREATE INDEX idx_activation_codes_redeemed_email ON activation_codes(redeemed_email);
CREATE INDEX idx_followers_artist ON followers(artist_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Generate referral code for new users
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
BEGIN
  RETURN 'PF-' || UPPER(SUBSTRING(MD5(RANDOM()::text) FROM 1 FOR 8));
END;
$$ LANGUAGE plpgsql;

-- Create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name, referral_code)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    generate_referral_code()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update superfan tier based on referrals
CREATE OR REPLACE FUNCTION update_superfan_tier()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE superfans
  SET 
    tier = CASE
      WHEN total_referrals >= 100 THEN 'patron'
      WHEN total_referrals >= 50 THEN 'champion'
      WHEN total_referrals >= 10 THEN 'superfan'
      ELSE 'supporter'
    END
  WHERE id = NEW.referrer_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_referral_created
  AFTER INSERT ON referrals
  FOR EACH ROW EXECUTE FUNCTION update_superfan_tier();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE superfans ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Public read profiles
CREATE POLICY "Public profiles are viewable" ON profiles
  FOR SELECT USING (true);

-- Users can update own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Products are publicly readable
CREATE POLICY "Products are viewable" ON products
  FOR SELECT USING (is_active = true);

-- Artists can create/update own products
CREATE POLICY "Artists can manage own products" ON products
  FOR ALL USING (auth.uid() = seller_id);

-- Authenticated users can insert products (API validates artist role)
CREATE POLICY "Authenticated users can insert products" ON products
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Orders readable by owner
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create orders
CREATE POLICY "Users can create orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- SEED DATA
-- ============================================

-- Sample products
INSERT INTO products (category, name, description, price, images, seller_type, seller_percent, artist_fund_percent, superfan_percent, platform_percent) VALUES
('artist_merch', 'Ambiguous Tour Tee', 'Limited edition cotton tee from the Ambiguous album', 25.00, '["/products/tee.jpg"]', 'artist', 80, 15, 5, 0),
('artist_merch', 'Ambiguous Digital EP', 'Full digital download of the Ambiguous album', 5.00, '["/products/ep.jpg"]', 'artist', 85, 10, 5, 0),
('artist_merch', 'Signed Vinyl', 'Limited edition signed vinyl record', 50.00, '["/products/vinyl.jpg"]', 'artist', 85, 10, 5, 0),
('essentials', 'Premium Toothpaste', 'Whitening toothpaste - 6oz', 8.99, '["/products/toothpaste.jpg"]', 'business', 67, 20, 3, 10),
('essentials', 'Toilet Paper (12 Rolls)', 'Ultra-soft 3-ply', 12.99, '["/products/tp.jpg"]', 'business', 67, 20, 3, 10),
('essentials', 'Hand Soap Refill', 'Lavender scent - 32oz', 9.99, '["/products/soap.jpg"]', 'business', 67, 20, 3, 10),
('essentials', 'Bottled Water (24 Pack)', 'Natural spring water', 8.99, '["/products/water.jpg"]', 'business', 67, 20, 3, 10),
('trending', 'Wireless Earbuds Pro', 'Noise cancelling, 24hr battery', 49.99, '["/products/earbuds.jpg"]', 'business', 67, 20, 3, 10),
('trending', 'Phone Charger Cable', 'Braided, fast charge', 15.99, '["/products/charger.jpg"]', 'business', 67, 20, 3, 10),
('trending', 'Portable Speaker', 'Waterproof, bluetooth', 29.99, '["/products/speaker.jpg"]', 'business', 67, 20, 3, 10);

-- Sample stations
INSERT INTO stations (name, slug, description, genre, is_live, listener_count) VALUES
('Porterful Radio', 'porterful-radio', 'The home of independent artists', 'Hip-Hop', TRUE, 2847),
('O D Music', 'od-music', 'Ambiguous project and more', 'R&B', TRUE, 1256),
('Hip-Hop Central', 'hip-hop-central', 'Underground hip-hop and beats', 'Hip-Hop', TRUE, 983),
('Lo-Fi Dreams', 'lofi-dreams', 'Chill beats for studying and work', 'Lo-Fi', TRUE, 2104);

-- ============================================
-- VIEWS
-- ============================================

-- Active products with artist info
CREATE VIEW active_products AS
SELECT 
  p.*,
  CASE 
    WHEN p.seller_type = 'artist' THEN a.slug
    ELSE NULL
  END as artist_slug,
  CASE 
    WHEN p.seller_type = 'artist' THEN a.bio
    ELSE NULL
  END as artist_bio
FROM products p
LEFT JOIN artists a ON p.linked_artist_id = a.id
WHERE p.is_active = TRUE;

-- Artist earnings summary
CREATE VIEW artist_earnings AS
SELECT 
  a.id as artist_id,
  a.slug,
  COALESCE(SUM(oi.price * oi.quantity * 0.80), 0) as total_merch_earnings,
  COALESCE(SUM(CASE WHEN p.category = 'artist_merch' THEN oi.price * oi.quantity ELSE 0 END), 0) as merch_count,
  (SELECT COALESCE(SUM(amount), 0) FROM referral_earnings WHERE superfan_id IN (SELECT id FROM superfans WHERE primary_artist_id = a.id)) as superfan_referrals
FROM artists a
LEFT JOIN order_items oi ON oi.artist_id = a.id
LEFT JOIN products p ON oi.product_id = p.id
GROUP BY a.id, a.slug;

-- Superfan earnings summary
CREATE VIEW superfan_earnings AS
SELECT 
  s.id as superfan_id,
  p.name,
  s.tier,
  s.total_referrals,
  s.total_earnings,
  s.available_earnings
FROM superfans s
JOIN profiles p ON s.id = p.id;

-- ============================================
-- DONE
-- ============================================
-- Schema ready for Supabase deployment
