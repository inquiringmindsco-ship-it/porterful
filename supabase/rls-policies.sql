-- ============================================
-- Porterful RLS Policies — Run in Supabase SQL Editor
-- ============================================

-- PROFILES
DROP POLICY IF EXISTS "Anyone can read profiles" ON profiles;
CREATE POLICY "Anyone can read profiles" ON profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- ARTISTS
DROP POLICY IF EXISTS "Anyone can read artists" ON artists;
CREATE POLICY "Anyone can read artists" ON artists FOR SELECT USING (true);
DROP POLICY IF EXISTS "Artists can update own record" ON artists;
CREATE POLICY "Artists can update own record" ON artists FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Authenticated users can insert artists" ON artists;
CREATE POLICY "Authenticated users can insert artists" ON artists FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ORDERS (uses user_id — not buyer_id)
DROP POLICY IF EXISTS "Users can read own orders" ON orders;
CREATE POLICY "Users can read own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
CREATE POLICY "Users can insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own orders" ON orders;
CREATE POLICY "Users can update own orders" ON orders FOR UPDATE USING (auth.uid() = user_id);

-- ORDER ITEMS
DROP POLICY IF EXISTS "Users can read own order items" ON order_items;
CREATE POLICY "Users can read own order items" ON order_items FOR SELECT
USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

-- PRODUCTS
DROP POLICY IF EXISTS "Anyone can read products" ON products;
CREATE POLICY "Anyone can read products" ON products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
CREATE POLICY "Authenticated users can insert products" ON products FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Sellers can update own products" ON products;
CREATE POLICY "Sellers can update own products" ON products FOR UPDATE USING (auth.uid() = seller_id);
DROP POLICY IF EXISTS "Sellers can delete own products" ON products;
CREATE POLICY "Sellers can delete own products" ON products FOR DELETE USING (auth.uid() = seller_id);

-- STATIONS
DROP POLICY IF EXISTS "Anyone can read stations" ON stations;
CREATE POLICY "Anyone can read stations" ON stations FOR SELECT USING (true);
DROP POLICY IF EXISTS "Artists can manage own stations" ON stations;
CREATE POLICY "Artists can manage own stations" ON stations FOR ALL USING (auth.uid() = artist_id);

-- TRACKS
DROP POLICY IF EXISTS "Anyone can read tracks" ON tracks;
CREATE POLICY "Anyone can read tracks" ON tracks FOR SELECT USING (true);
DROP POLICY IF EXISTS "Artists can manage own tracks" ON tracks;
CREATE POLICY "Artists can manage own tracks" ON tracks FOR ALL
USING (EXISTS (SELECT 1 FROM stations WHERE stations.id = tracks.station_id AND stations.artist_id = auth.uid()));

-- SUPERFANS
DROP POLICY IF EXISTS "Users can read own superfan record" ON superfans;
CREATE POLICY "Users can read own superfan record" ON superfans FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own superfan record" ON superfans;
CREATE POLICY "Users can update own superfan record" ON superfans FOR UPDATE USING (auth.uid() = id);

-- GOALS
DROP POLICY IF EXISTS "Artists can read own goals" ON goals;
CREATE POLICY "Artists can read own goals" ON goals FOR SELECT USING (auth.uid() = artist_id);
DROP POLICY IF EXISTS "Artists can manage own goals" ON goals;
CREATE POLICY "Artists can manage own goals" ON goals FOR ALL USING (auth.uid() = artist_id);

-- REFERRALS (uses user_id and referred_user_id — not referrer_id)
DROP POLICY IF EXISTS "Users can read own referrals" ON referrals;
CREATE POLICY "Users can read own referrals" ON referrals FOR SELECT USING (auth.uid() = user_id);

-- SUBSCRIPTIONS
DROP POLICY IF EXISTS "Users can read own subscriptions" ON subscriptions;
CREATE POLICY "Users can read own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage own subscriptions" ON subscriptions;
CREATE POLICY "Users can manage own subscriptions" ON subscriptions FOR ALL USING (auth.uid() = user_id);

-- STORAGE
DROP POLICY IF EXISTS "Public can read music bucket" ON storage.objects;
CREATE POLICY "Public can read music bucket" ON storage.objects FOR SELECT USING (bucket_id = 'music');
DROP POLICY IF EXISTS "Public can read artist-images bucket" ON storage.objects;
CREATE POLICY "Public can read artist-images bucket" ON storage.objects FOR SELECT USING (bucket_id = 'artist-images');
DROP POLICY IF EXISTS "Public can read product-images bucket" ON storage.objects;
CREATE POLICY "Public can read product-images bucket" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
DROP POLICY IF EXISTS "Authenticated users can upload objects" ON storage.objects;
CREATE POLICY "Authenticated users can upload objects" ON storage.objects FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Users can delete own objects" ON storage.objects;
CREATE POLICY "Users can delete own objects" ON storage.objects FOR DELETE USING (auth.uid() IS NOT NULL);
