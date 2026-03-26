-- Porterful Competition System
-- Run this in Supabase SQL Editor

-- Artist Competition Progress (tracks each artist's milestone journey)
CREATE TABLE competition_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES profiles(id),
  current_tier TEXT DEFAULT 'Bronze' CHECK (current_tier IN ('Bronze', 'Silver', 'Gold', 'Platinum')),
  total_earnings NUMERIC DEFAULT 0,
  highest_milestone_hit NUMERIC DEFAULT 0,
  is_founding_artist BOOLEAN DEFAULT FALSE,
  founding_artist_claimed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(artist_id)
);

-- Milestone Wins (tracks who won what)
CREATE TABLE competition_wins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES profiles(id),
  milestone_amount NUMERIC NOT NULL,
  bonus_amount NUMERIC NOT NULL,
  tier TEXT NOT NULL,
  claimed_at TIMESTAMPTZ DEFAULT NOW(),
  notified_at TIMESTAMPTZ,
  notification_sent BOOLEAN DEFAULT FALSE
);

-- Prize Pool (global pool tracking)
CREATE TABLE prize_pool (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  balance NUMERIC DEFAULT 0,
  total_earned NUMERIC DEFAULT 0,
  total_paid_out NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (balance >= 0)
);

-- Insert initial pool balance
INSERT INTO prize_pool (id, balance, total_earned, total_paid_out) 
VALUES (1, 0, 0, 0)
ON CONFLICT (id) DO NOTHING;

-- Tier Milestones Config
CREATE TABLE tier_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier TEXT NOT NULL,
  threshold_amount NUMERIC NOT NULL,
  bonus_amount NUMERIC NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert milestones
INSERT INTO tier_milestones (tier, threshold_amount, bonus_amount) VALUES
  ('Bronze', 100, 150),
  ('Bronze', 500, 250),
  ('Silver', 2500, 500),
  ('Silver', 5000, 1000),
  ('Gold', 10000, 2500),
  ('Gold', 25000, 5000),
  ('Platinum', 50000, 10000),
  ('Platinum', 100000, 25000);

-- Founding Artist Window
CREATE TABLE founding_window (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  window_open TIMESTAMPTZ DEFAULT NOW(),
  window_close TIMESTAMPTZ, -- NULL = stays open until limit
  artist_limit INTEGER DEFAULT 50,
  artists_joined INTEGER DEFAULT 0,
  competition_launched BOOLEAN DEFAULT FALSE,
  competition_launched_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO founding_window (id, window_open, artist_limit) VALUES (1, NOW(), 50)
ON CONFLICT (id) DO NOTHING;

-- Indexes for performance
CREATE INDEX idx_competition_participants_artist ON competition_participants(artist_id);
CREATE INDEX idx_competition_participants_tier ON competition_participants(current_tier);
CREATE INDEX idx_competition_participants_earnings ON competition_participants(total_earnings DESC);
CREATE INDEX idx_competition_wins_artist ON competition_wins(artist_id);
CREATE INDEX idx_competition_wins_milestone ON competition_wins(milestone_amount);
CREATE INDEX idx_tier_milestones_active ON tier_milestones(tier, is_active);

-- Function to add to prize pool (called on every sale)
CREATE OR REPLACE FUNCTION add_to_prize_pool(amount NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE prize_pool 
  SET 
    balance = balance + (amount * 0.10),
    total_earned = total_earned + (amount * 0.10),
    updated_at = NOW()
  WHERE id = 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and award milestone
CREATE OR REPLACE FUNCTION check_milestone(p_artist_id UUID, p_new_earnings NUMERIC)
RETURNS TABLE(
  milestone_won BOOLEAN,
  threshold NUMERIC,
  bonus NUMERIC,
  tier TEXT
) AS $$
DECLARE
  v_current_tier TEXT;
  v_highest_hit NUMERIC;
  v_milestone RECORD;
BEGIN
  -- Get current tier and highest milestone hit
  SELECT current_tier, highest_milestone_hit INTO v_current_tier, v_highest_hit
  FROM competition_participants
  WHERE artist_id = p_artist_id;

  -- Find next unclaimed milestone for this tier
  SELECT * INTO v_milestone
  FROM tier_milestones tm
  WHERE tm.tier = v_current_tier
    AND tm.is_active = TRUE
    AND tm.threshold_amount > v_highest_hit
    AND tm.threshold_amount <= p_new_earnings
  ORDER BY tm.threshold_amount ASC
  LIMIT 1;

  IF v_milestone IS NOT NULL THEN
    -- Award the milestone
    INSERT INTO competition_wins (artist_id, milestone_amount, bonus_amount, tier)
    VALUES (p_artist_id, v_milestone.threshold_amount, v_milestone.bonus_amount, v_milestone.tier);

    -- Update participant
    UPDATE competition_participants
    SET 
      highest_milestone_hit = v_milestone.threshold_amount,
      updated_at = NOW()
    WHERE artist_id = p_artist_id;

    -- Deduct from pool
    UPDATE prize_pool
    SET 
      balance = balance - v_milestone.bonus_amount,
      total_paid_out = total_paid_out + v_milestone.bonus_amount,
      updated_at = NOW()
    WHERE id = 1;

    RETURN QUERY SELECT TRUE, v_milestone.threshold_amount, v_milestone.bonus_amount, v_milestone.tier;
    RETURN;
  END IF;

  RETURN QUERY SELECT FALSE, NULL::NUMERIC, NULL::NUMERIC, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update artist earnings and potentially tier
CREATE OR REPLACE FUNCTION update_artist_competition_earnings(
  p_artist_id UUID,
  p_sale_amount NUMERIC
)
RETURNS TABLE(new_tier TEXT, tier_changed BOOLEAN) AS $$
DECLARE
  v_old_tier TEXT;
  v_new_tier TEXT;
BEGIN
  -- Get current tier
  SELECT current_tier INTO v_old_tier
  FROM competition_participants
  WHERE artist_id = p_artist_id;

  -- Update earnings
  UPDATE competition_participants
  SET 
    total_earnings = total_earnings + p_sale_amount,
    updated_at = NOW()
  WHERE artist_id = p_artist_id;

  -- Determine new tier based on earnings
  SELECT 
    CASE 
      WHEN total_earnings >= 25000 THEN 'Platinum'
      WHEN total_earnings >= 5000 THEN 'Gold'
      WHEN total_earnings >= 500 THEN 'Silver'
      ELSE 'Bronze'
    END INTO v_new_tier
  FROM competition_participants
  WHERE artist_id = p_artist_id;

  -- If tier changed, update and reset milestones
  IF v_new_tier != v_old_tier THEN
    UPDATE competition_participants
    SET 
      current_tier = v_new_tier,
      highest_milestone_hit = 0  -- Reset for new tier
    WHERE artist_id = p_artist_id;

    RETURN QUERY SELECT v_new_tier, TRUE;
    RETURN;
  END IF;

  RETURN QUERY SELECT v_new_tier, FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to register new artist
CREATE OR REPLACE FUNCTION register_competition_artist(p_artist_id UUID, p_is_founder BOOLEAN DEFAULT FALSE)
RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
  v_limit INTEGER;
BEGIN
  -- Check if already registered
  IF EXISTS (SELECT 1 FROM competition_participants WHERE artist_id = p_artist_id) THEN
    RETURN FALSE;
  END IF;

  -- Check if founding window is still open
  SELECT artists_joined, artist_limit INTO v_count, v_limit
  FROM founding_window WHERE id = 1;

  -- If at limit and trying to be founder, reject
  IF p_is_founder AND v_count >= v_limit THEN
    RETURN FALSE;
  END IF;

  -- Register the artist
  INSERT INTO competition_participants (artist_id, is_founding_artist, current_tier)
  VALUES (p_artist_id, p_is_founder, 'Bronze');

  -- Update founding window count if founder
  IF p_is_founder THEN
    UPDATE founding_window
    SET 
      artists_joined = artists_joined + 1,
      updated_at = NOW()
    WHERE id = 1;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to add to prize pool on new order
CREATE OR REPLACE FUNCTION trigger_on_order_complete()
RETURNS TRIGGER AS $$
BEGIN
  -- Add to prize pool (10% of order total)
  PERFORM add_to_prize_pool(NEW.total);
  
  -- Get artist from order_items
  -- This would need to be enhanced based on your order structure
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE competition_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_wins ENABLE ROW LEVEL SECURITY;
ALTER TABLE prize_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE founding_window ENABLE ROW LEVEL SECURITY;

-- RLS Policies (adjust based on your auth setup)
CREATE POLICY "Public read competition participants" ON competition_participants FOR SELECT USING (true);
CREATE POLICY "Artists can update own participation" ON competition_participants FOR UPDATE USING (auth.uid() = artist_id);
CREATE POLICY "Public read prize pool" ON prize_pool FOR SELECT USING (true);
CREATE POLICY "Service role can update prize pool" ON prize_pool FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "Public read founding window" ON founding_window FOR SELECT USING (true);
