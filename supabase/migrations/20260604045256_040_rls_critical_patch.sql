-- ============================================
-- MIGRATION 040: CRITICAL-004 RLS Patch
-- Fixes Row Level Security gaps identified 2026-06-04
-- 
-- Tables patched:
--   CRITICAL: referral_earnings, dropship_orders, music_purchases, product_skus, user_tracks
--   HIGH: earnings, affiliate_earnings, artist_album_order, production_assets,
--         inventory_ledger, fulfillment_jobs, submission_tracks
--
-- Requirements:
--   - Artist isolation: artists can only read their own data
--   - Founder/admin access: founders/admins can read all data
--   - No checkout logic changed
--   - No fulfillment logic changed
--   - Only RLS policies added
-- ============================================

-- ============================================
-- CRITICAL: Tables with NO RLS enabled
-- ============================================

-- referral_earnings
ALTER TABLE referral_earnings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own referral earnings" ON referral_earnings;
CREATE POLICY "Users can read own referral earnings" ON referral_earnings
  FOR SELECT USING (auth.uid() = superfan_id);

DROP POLICY IF EXISTS "Founder/admin can read all referral earnings" ON referral_earnings;
CREATE POLICY "Founder/admin can read all referral earnings" ON referral_earnings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('founder', 'admin')
    )
  );

-- dropship_orders
ALTER TABLE dropship_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own dropship orders" ON dropship_orders;
CREATE POLICY "Users can read own dropship orders" ON dropship_orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = dropship_orders.order_id
        AND orders.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Founder/admin can read all dropship orders" ON dropship_orders;
CREATE POLICY "Founder/admin can read all dropship orders" ON dropship_orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('founder', 'admin')
    )
  );

-- music_purchases
ALTER TABLE music_purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own music purchases" ON music_purchases;
CREATE POLICY "Users can read own music purchases" ON music_purchases
  FOR SELECT USING (auth.uid() = buyer_user_id);

DROP POLICY IF EXISTS "Founder/admin can read all music purchases" ON music_purchases;
CREATE POLICY "Founder/admin can read all music purchases" ON music_purchases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('founder', 'admin')
    )
  );

-- product_skus (REVISED per Od directive: no public read, artist isolation via artist_id)
ALTER TABLE product_skus ENABLE ROW LEVEL SECURITY;

-- Artists can read only SKUs tied to their own assets
DROP POLICY IF EXISTS "Artists can read own product SKUs" ON product_skus;
CREATE POLICY "Artists can read own product SKUs" ON product_skus
  FOR SELECT USING (auth.uid() = artist_id);

-- Founders/admins can read all SKUs
DROP POLICY IF EXISTS "Founder/admin can read all product SKUs" ON product_skus;
CREATE POLICY "Founder/admin can read all product SKUs" ON product_skus
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('founder', 'admin')
    )
  );

-- Founders/admins can manage (insert/update/delete) SKUs
DROP POLICY IF EXISTS "Founder/admin can manage product SKUs" ON product_skus;
CREATE POLICY "Founder/admin can manage product SKUs" ON product_skus
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('founder', 'admin')
    )
  );

-- user_tracks
ALTER TABLE user_tracks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own user tracks" ON user_tracks;
CREATE POLICY "Users can read own user tracks" ON user_tracks
  FOR SELECT USING (auth.uid() = user_id);

-- entitlements (REVISED per Od directive: add full RLS with buyer_user_id isolation)
ALTER TABLE entitlements ENABLE ROW LEVEL SECURITY;

-- Users can read their own entitlements
DROP POLICY IF EXISTS "Users can read own entitlements" ON entitlements;
CREATE POLICY "Users can read own entitlements" ON entitlements
  FOR SELECT USING (auth.uid() = buyer_user_id);

-- Founder/admin can read all entitlements
DROP POLICY IF EXISTS "Founder/admin can read all entitlements" ON entitlements;
CREATE POLICY "Founder/admin can read all entitlements" ON entitlements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('founder', 'admin')
    )
  );

-- Founder/admin can manage entitlements
DROP POLICY IF EXISTS "Founder/admin can manage entitlements" ON entitlements;
CREATE POLICY "Founder/admin can manage entitlements" ON entitlements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('founder', 'admin')
    )
  );

-- profiles (REVISED per Od directive: tighten from Anyone to Authenticated-only)
DROP POLICY IF EXISTS "Anyone can read profiles" ON profiles;

DROP POLICY IF EXISTS "Authenticated users can read profiles" ON profiles;
CREATE POLICY "Authenticated users can read profiles" ON profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- ============================================
-- HIGH: Tables with RLS enabled but NO policies
-- ============================================

-- earnings
DROP POLICY IF EXISTS "Users can read own earnings" ON earnings;
CREATE POLICY "Users can read own earnings" ON earnings
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Founder/admin can read all earnings" ON earnings;
CREATE POLICY "Founder/admin can read all earnings" ON earnings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('founder', 'admin')
    )
  );

-- affiliate_earnings
DROP POLICY IF EXISTS "Affiliates can read own earnings" ON affiliate_earnings;
CREATE POLICY "Affiliates can read own earnings" ON affiliate_earnings
  FOR SELECT USING (auth.uid() = affiliate_id);

DROP POLICY IF EXISTS "Founder/admin can read all affiliate earnings" ON affiliate_earnings;
CREATE POLICY "Founder/admin can read all affiliate earnings" ON affiliate_earnings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('founder', 'admin')
    )
  );

-- artist_album_order
DROP POLICY IF EXISTS "Artists can read own album order" ON artist_album_order;
CREATE POLICY "Artists can read own album order" ON artist_album_order
  FOR SELECT USING (auth.uid() = artist_id);

DROP POLICY IF EXISTS "Artists can update own album order" ON artist_album_order;
CREATE POLICY "Artists can update own album order" ON artist_album_order
  FOR UPDATE USING (auth.uid() = artist_id);

-- production_assets
DROP POLICY IF EXISTS "Artists can read own production assets" ON production_assets;
CREATE POLICY "Artists can read own production assets" ON production_assets
  FOR SELECT USING (auth.uid() = artist_id);

DROP POLICY IF EXISTS "Founder/admin can read all production assets" ON production_assets;
CREATE POLICY "Founder/admin can read all production assets" ON production_assets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('founder', 'admin')
    )
  );

-- inventory_ledger
DROP POLICY IF EXISTS "Artists can read own inventory" ON inventory_ledger;
CREATE POLICY "Artists can read own inventory" ON inventory_ledger
  FOR SELECT USING (auth.uid() = artist_id);

DROP POLICY IF EXISTS "Founder/admin can read all inventory" ON inventory_ledger;
CREATE POLICY "Founder/admin can read all inventory" ON inventory_ledger
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('founder', 'admin')
    )
  );

-- fulfillment_jobs
DROP POLICY IF EXISTS "Artists can read own fulfillment jobs" ON fulfillment_jobs;
CREATE POLICY "Artists can read own fulfillment jobs" ON fulfillment_jobs
  FOR SELECT USING (auth.uid() = artist_id);

DROP POLICY IF EXISTS "Founder/admin can read all fulfillment jobs" ON fulfillment_jobs;
CREATE POLICY "Founder/admin can read all fulfillment jobs" ON fulfillment_jobs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('founder', 'admin')
    )
  );

-- submission_tracks
DROP POLICY IF EXISTS "Artists can read own submission tracks" ON submission_tracks;
CREATE POLICY "Artists can read own submission tracks" ON submission_tracks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM submissions
      WHERE submissions.id = submission_tracks.submission_id
        AND submissions.user_id = auth.uid()
    )
  );

-- ============================================
-- VERIFICATION QUERIES (run manually after migration)
-- ============================================

/*
-- Verify RLS is enabled on all patched tables:
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname IN (
  'referral_earnings', 'dropship_orders', 'music_purchases', 
  'product_skus', 'user_tracks', 'earnings', 'affiliate_earnings',
  'artist_album_order', 'production_assets', 'inventory_ledger',
  'fulfillment_jobs', 'submission_tracks'
);

-- Count policies per table:
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN (
  'referral_earnings', 'dropship_orders', 'music_purchases',
  'product_skus', 'user_tracks', 'earnings', 'affiliate_earnings',
  'artist_album_order', 'production_assets', 'inventory_ledger',
  'fulfillment_jobs', 'submission_tracks'
)
ORDER BY tablename;
*/
