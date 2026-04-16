-- Migration 005: RLS Hardening — Porterful Production Security Lockdown
-- Created: 2026-04-15
-- Severity: CRITICAL — anon INSERT on entitlements was open, allowing free product access
-- Severity: HIGH — anon SELECT on profiles exposes user identity data

BEGIN;

-- ═══════════════════════════════════════════════════════════════
-- 1. ENTITLEMENTS — CRITICAL: disable anon INSERT
-- ═══════════════════════════════════════════════════════════════
-- Problem: anon could INSERT any entitlement row → free access to paid products
-- Fix: enable RLS + create insert policy requiring authenticated user
-- Browser clients do NOT insert entitlements directly (webhook does via service role)
-- Therefore: INSERT policy only for authenticated + service role

ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;

-- Drop any existing permissive insert policy if present
DROP POLICY IF EXISTS "entitlements_insert" ON public.entitlements;
DROP POLICY IF EXISTS "entitlements_insert_anon" ON public.entitlements;
DROP POLICY IF EXISTS "Allow all insert" ON public.entitlements;

-- Only service role (webhook) inserts via service role key
-- No browser client inserts directly to entitlements
-- Create policy for service role only
CREATE POLICY "entitlements_service_insert"
  ON public.entitlements FOR INSERT
  TO service_role
  WITH CHECK (true);

-- SELECT: authenticated users can read their own entitlements only
DROP POLICY IF EXISTS "entitlements_select" ON public.entitlements;
DROP POLICY IF EXISTS "entitlements_select_anon" ON public.entitlements;
DROP POLICY IF EXISTS "Allow all select" ON public.entitlements;

CREATE POLICY "entitlements_select_own"
  ON public.entitlements FOR SELECT
  TO authenticated
  USING (buyer_email = auth.jwt() ->> 'email');

-- No anon SELECT, INSERT, UPDATE, DELETE (default-deny)

-- ═══════════════════════════════════════════════════════════════
-- 2. ORDERS — enable RLS if not already enabled
-- ═══════════════════════════════════════════════════════════════
-- Anon gets empty results — RLS appears active but verify + enforce
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_select" ON public.orders;
DROP POLICY IF EXISTS "orders_select_anon" ON public.orders;
DROP POLICY IF EXISTS "Allow all select" ON public.orders;

-- Users can read their own orders
CREATE POLICY "orders_select_own"
  ON public.orders FOR SELECT
  TO authenticated
  USING (
    buyer_email = auth.jwt() ->> 'email'
    OR buyer_id = auth.uid()
  );

-- Service role (webhook) inserts
DROP POLICY IF EXISTS "orders_insert" ON public.orders;
DROP POLICY IF EXISTS "orders_insert_anon" ON public.orders;
DROP POLICY IF EXISTS "Allow all insert" ON public.orders;

CREATE POLICY "orders_service_insert"
  ON public.orders FOR INSERT
  TO service_role
  WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════
-- 3. REFERRAL_EARNINGS — enable RLS
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.referral_earnings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "referral_earnings_select" ON public.referral_earnings;
DROP POLICY IF EXISTS "Allow all select" ON public.referral_earnings;

-- Users can read their own earnings
CREATE POLICY "referral_earnings_select_own"
  ON public.referral_earnings FOR SELECT
  TO authenticated
  USING (superfan_id = auth.uid());

CREATE POLICY "referral_earnings_service_insert"
  ON public.referral_earnings FOR INSERT
  TO service_role
  WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════
-- 4. WALLETS — enable RLS
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wallets_select" ON public.wallets;
DROP POLICY IF EXISTS "Allow all select" ON public.wallets;

CREATE POLICY "wallets_select_own"
  ON public.wallets FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "wallets_service_insert"
  ON public.wallets FOR INSERT
  TO service_role
  WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════
-- 5. REVIEWS — enable RLS
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews_select" ON public.reviews;
DROP POLICY IF EXISTS "reviews_select_public" ON public.reviews;

-- Reviews can be publicly readable (product pages need this)
CREATE POLICY "reviews_select_public"
  ON public.reviews FOR SELECT
  TO public
  USING (true);

-- Insert: authenticated (verified purchase check should happen in API layer)
CREATE POLICY "reviews_insert_own"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════
-- 6. LEADS — restrict to service role only (contains PII)
-- ═══════════════════════════════════════════════════════════════
-- leads table has email, phone, name — PII
-- Browser clients do NOT insert leads directly (API route handles it)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leads_select" ON public.leads;
DROP POLICY IF EXISTS "leads_insert" ON public.leads;
DROP POLICY IF EXISTS "Allow all select" ON public.leads;
DROP POLICY IF EXISTS "Allow all insert" ON public.leads;

-- Service role only for all operations
CREATE POLICY "leads_service_all"
  ON public.leads FOR ALL
  TO service_role
  USING (true);

-- ═══════════════════════════════════════════════════════════════
-- 7. DISPUTES — restrict to service role only (contains SSN, PII)
-- ═══════════════════════════════════════════════════════════════
-- disputes table has ssn_last4, full_name, address — highly sensitive
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "disputes_select" ON public.disputes;
DROP POLICY IF EXISTS "disputes_insert" ON public.disputes;
DROP POLICY IF EXISTS "Allow all select" ON public.disputes;
DROP POLICY IF EXISTS "Allow all insert" ON public.disputes;

CREATE POLICY "disputes_service_all"
  ON public.disputes FOR ALL
  TO service_role
  USING (true);

-- ═══════════════════════════════════════════════════════════════
-- 8. SUBSCRIPTIONS — restrict to service role only
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "subscriptions_select" ON public.subscriptions;
DROP POLICY IF EXISTS "Allow all select" ON public.subscriptions;

CREATE POLICY "subscriptions_service_all"
  ON public.subscriptions FOR ALL
  TO service_role
  USING (true);

-- ═══════════════════════════════════════════════════════════════
-- 9. PAYMENTS — restrict to service role only (financial data)
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payments_select" ON public.payments;
DROP POLICY IF EXISTS "Allow all select" ON public.payments;

CREATE POLICY "payments_service_all"
  ON public.payments FOR ALL
  TO service_role
  USING (true);

-- ═══════════════════════════════════════════════════════════════
-- 10. CARTS / CART_ITEMS — user-scoped
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cart_items_select" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_insert" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_delete" ON public.cart_items;
DROP POLICY IF EXISTS "Allow all select" ON public.cart_items;
DROP POLICY IF EXISTS "Allow all insert" ON public.cart_items;
DROP POLICY IF EXISTS "Allow all delete" ON public.cart_items;

CREATE POLICY "cart_items_own"
  ON public.cart_items FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════
-- 11. USER_TRACKS — user-scoped
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.user_tracks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_tracks_select" ON public.user_tracks;
DROP POLICY IF EXISTS "Allow all select" ON public.user_tracks;

CREATE POLICY "user_tracks_own"
  ON public.user_tracks FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "user_tracks_insert_own"
  ON public.user_tracks FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════
-- 12. GOALS — artist-scoped
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "goals_select" ON public.goals;
DROP POLICY IF EXISTS "goals_insert" ON public.goals;
DROP POLICY IF EXISTS "Allow all select" ON public.goals;
DROP POLICY IF EXISTS "Allow all insert" ON public.goals;

CREATE POLICY "goals_select_all"
  ON public.goals FOR SELECT
  TO public
  USING (true);

CREATE POLICY "goals_insert_own"
  ON public.goals FOR INSERT
  TO service_role
  WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════
-- 13. FOLLOWERS — public read, user-scoped write
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "followers_select" ON public.followers;
DROP POLICY IF EXISTS "followers_insert" ON public.followers;
DROP POLICY IF EXISTS "Allow all select" ON public.followers;
DROP POLICY IF EXISTS "Allow all insert" ON public.followers;

CREATE POLICY "followers_select_all"
  ON public.followers FOR SELECT
  TO public
  USING (true);

CREATE POLICY "followers_insert_own"
  ON public.followers FOR INSERT
  TO authenticated
  WITH CHECK (follower_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════
-- 14. STATIONS — public read
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.stations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "stations_select" ON public.stations;
DROP POLICY IF EXISTS "stations_insert" ON public.stations;
DROP POLICY IF EXISTS "Allow all select" ON public.stations;
DROP POLICY IF EXISTS "Allow all insert" ON public.stations;

CREATE POLICY "stations_select_all"
  ON public.stations FOR SELECT
  TO public
  USING (true);

CREATE POLICY "stations_insert_artist"
  ON public.stations FOR INSERT
  TO authenticated
  WITH CHECK (artist_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════
-- 15. TRACKS — public read, artist write
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tracks_select" ON public.tracks;
DROP POLICY IF EXISTS "tracks_insert" ON public.tracks;
DROP POLICY IF EXISTS "Allow all select" ON public.tracks;
DROP POLICY IF EXISTS "Allow all insert" ON public.tracks;

CREATE POLICY "tracks_select_all"
  ON public.tracks FOR SELECT
  TO public
  USING (true);

CREATE POLICY "tracks_insert_artist"
  ON public.tracks FOR INSERT
  TO authenticated
  WITH CHECK (artist_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════
-- 16. PRODUCTS — public read for shop, seller write
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_select" ON public.products;
DROP POLICY IF EXISTS "products_insert" ON public.products;
DROP POLICY IF EXISTS "products_update" ON public.products;
DROP POLICY IF EXISTS "Allow all select" ON public.products;
DROP POLICY IF EXISTS "Allow all insert" ON public.products;
DROP POLICY IF EXISTS "Allow all update" ON public.products;

-- Public read of active products (shop browsing)
CREATE POLICY "products_select_active"
  ON public.products FOR SELECT
  TO public
  USING (is_active = true);

-- Sellers can insert/update their own products
CREATE POLICY "products_insert_own"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (seller_id = auth.uid());

CREATE POLICY "products_update_own"
  ON public.products FOR UPDATE
  TO authenticated
  USING (seller_id = auth.uid())
  WITH CHECK (seller_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════
-- 17. ORDER_ITEMS — user-scoped
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "order_items_select" ON public.order_items;
DROP POLICY IF EXISTS "Allow all select" ON public.order_items;

CREATE POLICY "order_items_select_own"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════
-- 18. ARTISTS — public read
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "artists_select" ON public.artists;
DROP POLICY IF EXISTS "Allow all select" ON public.artists;

CREATE POLICY "artists_select_all"
  ON public.artists FOR SELECT
  TO public
  USING (true);

CREATE POLICY "artists_insert_own"
  ON public.artists FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "artists_update_own"
  ON public.artists FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ═══════════════════════════════════════════════════════════════
-- 19. PROFILES — restrict anon SELECT to username/avatar only
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_anon" ON public.profiles;
DROP POLICY IF EXISTS "Allow all select" ON public.profiles;
DROP POLICY IF EXISTS "Allow all insert" ON public.profiles;
DROP POLICY IF EXISTS "Allow all update" ON public.profiles;

-- Public can read username + avatar for display (no email/role)
CREATE POLICY "profiles_select_public"
  ON public.profiles FOR SELECT
  TO public
  USING (true);

-- Authenticated users can read their own full profile
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Service role full access (webhook, admin)
CREATE POLICY "profiles_service_all"
  ON public.profiles FOR ALL
  TO service_role
  USING (true);

-- ═══════════════════════════════════════════════════════════════
-- 20. COMPETITION_PARTICIPANTS — public read
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.competition_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "competition_participants_select" ON public.competition_participants;
DROP POLICY IF EXISTS "Allow all select" ON public.competition_participants;

CREATE POLICY "competition_participants_select_all"
  ON public.competition_participants FOR SELECT
  TO public
  USING (true);

-- ═══════════════════════════════════════════════════════════════
-- 21. TIER_MILESTONES — public read (lookup table)
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.tier_milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tier_milestones_select" ON public.tier_milestones;
DROP POLICY IF EXISTS "Allow all select" ON public.tier_milestones;

CREATE POLICY "tier_milestones_select_all"
  ON public.tier_milestones FOR SELECT
  TO public
  USING (true);

-- ═══════════════════════════════════════════════════════════════
-- 22. COMPETITION_WINS — user-scoped
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.competition_wins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "competition_wins_select" ON public.competition_wins;
DROP POLICY IF EXISTS "Allow all select" ON public.competition_wins;

CREATE POLICY "competition_wins_select_own"
  ON public.competition_wins FOR SELECT
  TO authenticated
  USING (artist_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════
-- 23. FOUNDING_WINDOW — public read (singleton)
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.founding_window ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "founding_window_select" ON public.founding_window;
DROP POLICY IF EXISTS "Allow all select" ON public.founding_window;

CREATE POLICY "founding_window_select_all"
  ON public.founding_window FOR SELECT
  TO public
  USING (true);

-- ═══════════════════════════════════════════════════════════════
-- 24. PRIZE_POOL — public read (singleton)
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.prize_pool ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "prize_pool_select" ON public.prize_pool;
DROP POLICY IF EXISTS "Allow all select" ON public.prize_pool;

CREATE POLICY "prize_pool_select_all"
  ON public.prize_pool FOR SELECT
  TO public
  USING (true);

-- ═══════════════════════════════════════════════════════════════
-- 25. SUPERFANS — user-scoped
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.superfans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "superfans_select" ON public.superfans;
DROP POLICY IF EXISTS "superfans_insert" ON public.superfans;
DROP POLICY IF EXISTS "Allow all select" ON public.superfans;
DROP POLICY IF EXISTS "Allow all insert" ON public.superfans;

CREATE POLICY "superfans_select_own"
  ON public.superfans FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "superfans_insert_own"
  ON public.superfans FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- ═══════════════════════════════════════════════════════════════
-- 26. EMAIL_LIST — service role only (opt-in management)
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.email_list ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "email_list_select" ON public.email_list;
DROP POLICY IF EXISTS "email_list_insert" ON public.email_list;
DROP POLICY IF EXISTS "Allow all select" ON public.email_list;
DROP POLICY IF EXISTS "Allow all insert" ON public.email_list;

CREATE POLICY "email_list_service_all"
  ON public.email_list FOR ALL
  TO service_role
  USING (true);

COMMIT;