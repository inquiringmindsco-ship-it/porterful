-- Porterful Database Schema
-- Run this in Supabase SQL Editor

-- Users (extends Supabase Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'supporter', -- supporter, superfan, artist, business, brand, admin
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Superfans (users who promote and earn)
CREATE TABLE superfans (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  tier TEXT DEFAULT 'supporter', -- supporter, superfan, champion, patron
  referral_code TEXT UNIQUE NOT NULL,
  total_referrals INTEGER DEFAULT 0,
  successful_referrals INTEGER DEFAULT 0,
  total_earnings DECIMAL DEFAULT 0,
  pending_earnings DECIMAL DEFAULT 0,
  primary_artist_id UUID REFERENCES artists(id), -- Who they primarily promote
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Superfan tiers and rates
CREATE TABLE superfan_tiers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL, -- supporter, superfan, champion, patron
  min_referrals INTEGER DEFAULT 0,
  commission_rate DECIMAL NOT NULL, -- 0.02, 0.05, 0.08, 0.10
  benefits JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default tiers
INSERT INTO superfan_tiers (name, min_referrals, commission_rate, benefits) VALUES
('supporter', 0, 0.02, '["2% commission", "Referral link"]'),
('superfan', 10, 0.05, '["5% commission", "Early access", "Exclusive merch codes"]'),
('champion', 50, 0.08, '["8% commission", "Artist collabs", "Priority support"]'),
('patron', 100, 0.10, '["10% commission", "Revenue share", "Founding member status"]');

-- Referral tracking
CREATE TABLE referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID REFERENCES superfans(id) ON DELETE SET NULL,
  referred_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  referral_code TEXT NOT NULL,
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  converted_at TIMESTAMPTZ,
  order_id UUID, -- Reference to the order that converted
  commission_earned DECIMAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Superfan earnings log
CREATE TABLE superfan_earnings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  superfan_id UUID REFERENCES superfans(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id),
  referral_id UUID REFERENCES referrals(id),
  amount DECIMAL NOT NULL,
  source TEXT NOT NULL, -- 'merch', 'marketplace', 'premium'
  rate DECIMAL NOT NULL, -- Commission rate at time of sale
  status TEXT DEFAULT 'pending', -- pending, paid, cancelled
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Artists (extended profile for artists)
CREATE TABLE artists (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  bio TEXT,
  genre TEXT,
  social_links JSONB DEFAULT '{}',
  monthly_goal DECIMAL DEFAULT 1000,
  current_earnings DECIMAL DEFAULT 0,
  total_earnings DECIMAL DEFAULT 0,
  stripe_account_id TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products (merch + essentials + trending)
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES profiles(id),
  category TEXT NOT NULL, -- artist, essentials, trending
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL NOT NULL,
  cost DECIMAL DEFAULT 0,
  images JSONB DEFAULT '[]',
  variants JSONB DEFAULT '[]',
  printful_product_id TEXT, -- for drop shipping
  stock INTEGER DEFAULT 999,
  commission_rate DECIMAL DEFAULT 0.10, -- 10% to artist fund
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'pending', -- pending, paid, shipped, delivered
  total DECIMAL NOT NULL,
  subtotal DECIMAL NOT NULL,
  commission_total DECIMAL DEFAULT 0,
  referral_commission DECIMAL DEFAULT 0,
  stripe_payment_id TEXT,
  shipping_address JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER DEFAULT 1,
  price DECIMAL NOT NULL,
  commission DECIMAL DEFAULT 0
);

-- Referrals tracking
CREATE TABLE referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID REFERENCES profiles(id),
  referred_id UUID REFERENCES profiles(id),
  commission_earned DECIMAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Radio Stations
CREATE TABLE stations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID REFERENCES artists(id),
  name TEXT NOT NULL,
  description TEXT,
  genre TEXT,
  cover_url TEXT,
  stream_url TEXT,
  is_live BOOLEAN DEFAULT FALSE,
  listener_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tracks
CREATE TABLE tracks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  station_id UUID REFERENCES stations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  album TEXT,
  duration INTEGER, -- seconds
  audio_url TEXT,
  cover_url TEXT,
  plays INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Radio Subscriptions
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  plan TEXT DEFAULT 'free', -- free, premium
  stripe_subscription_id TEXT,
  status TEXT DEFAULT 'active',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ
);

-- Artist Goals (monthly targets)
CREATE TABLE goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID REFERENCES artists(id),
  month DATE NOT NULL, -- YYYY-MM-01
  target_amount DECIMAL NOT NULL,
  current_amount DECIMAL DEFAULT 0,
  supporter_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_stations_artist ON stations(artist_id);
CREATE INDEX idx_goals_artist ON goals(artist_id);

-- Function to generate referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
BEGIN
  SELECT UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 8)) INTO code;
  RETURN 'PF-' || code;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create profile on auth signup
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

-- Insert sample products
INSERT INTO products (category, name, description, price, images) VALUES
('essentials', 'Premium Toothpaste', 'Whitening toothpaste - 6oz', 8.99, '["/products/toothpaste.jpg"]'),
('essentials', 'Toilet Paper (12 Rolls)', 'Ultra-soft 3-ply', 12.99, '["/products/tp.jpg"]'),
('essentials', 'Hand Soap Refill', 'Lavender scent - 32oz', 9.99, '["/products/soap.jpg"]'),
('trending', 'Wireless Earbuds Pro', 'Noise cancelling, 24hr battery', 49.99, '["/products/earbuds.jpg"]'),
('trending', 'Phone Charger Cable', 'Braided, fast charge', 15.99, '["/products/charger.jpg"]'),
('artist', 'Ambiguous Tour Tee', 'Limited edition cotton tee', 25.00, '["/products/tee.jpg"]'),
('artist', 'Ambiguous EP Digital', '5-track digital release', 5.00, '["/products/ep.jpg"]');

-- Insert sample station
INSERT INTO stations (name, description, genre, cover_url, is_live) VALUES
('Porterful Radio', 'The home of independent artists', 'Hip-Hop', '/stations/porterful.jpg', TRUE),
('O D Radio', 'Ambiguous project and more', 'R&B', '/stations/od.jpg', TRUE);