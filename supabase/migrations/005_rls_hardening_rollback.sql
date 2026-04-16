-- Rollback 005: Remove RLS hardening if needed
-- Only use if migration 005 causes production breakage
BEGIN;

-- Remove all new policies added by 005
DROP POLICY IF EXISTS "entitlements_service_insert" ON public.entitlements;
DROP POLICY IF EXISTS "entitlements_select_own" ON public.entitlements;
DROP POLICY IF EXISTS "orders_select_own" ON public.orders;
DROP POLICY IF EXISTS "orders_service_insert" ON public.orders;
DROP POLICY IF EXISTS "referral_earnings_select_own" ON public.referral_earnings;
DROP POLICY IF EXISTS "referral_earnings_service_insert" ON public.referral_earnings;
DROP POLICY IF EXISTS "wallets_select_own" ON public.wallets;
DROP POLICY IF EXISTS "wallets_service_insert" ON public.wallets;
DROP POLICY IF EXISTS "reviews_select_public" ON public.reviews;
DROP POLICY IF EXISTS "reviews_insert_own" ON public.reviews;
DROP POLICY IF EXISTS "leads_service_all" ON public.leads;
DROP POLICY IF EXISTS "disputes_service_all" ON public.disputes;
DROP POLICY IF EXISTS "subscriptions_service_all" ON public.subscriptions;
DROP POLICY IF EXISTS "payments_service_all" ON public.payments;
DROP POLICY IF EXISTS "cart_items_own" ON public.cart_items;
DROP POLICY IF EXISTS "user_tracks_own" ON public.user_tracks;
DROP POLICY IF EXISTS "user_tracks_insert_own" ON public.user_tracks;
DROP POLICY IF EXISTS "goals_select_all" ON public.goals;
DROP POLICY IF EXISTS "goals_insert_own" ON public.goals;
DROP POLICY IF EXISTS "followers_select_all" ON public.followers;
DROP POLICY IF EXISTS "followers_insert_own" ON public.followers;
DROP POLICY IF EXISTS "stations_select_all" ON public.stations;
DROP POLICY IF EXISTS "stations_insert_artist" ON public.stations;
DROP POLICY IF EXISTS "tracks_select_all" ON public.tracks;
DROP POLICY IF EXISTS "tracks_insert_artist" ON public.tracks;
DROP POLICY IF EXISTS "products_select_active" ON public.products;
DROP POLICY IF EXISTS "products_insert_own" ON public.products;
DROP POLICY IF EXISTS "products_update_own" ON public.products;
DROP POLICY IF EXISTS "order_items_select_own" ON public.order_items;
DROP POLICY IF EXISTS "artists_select_all" ON public.artists;
DROP POLICY IF EXISTS "artists_insert_own" ON public.artists;
DROP POLICY IF EXISTS "artists_update_own" ON public.artists;
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_service_all" ON public.profiles;
DROP POLICY IF EXISTS "competition_participants_select_all" ON public.competition_participants;
DROP POLICY IF EXISTS "tier_milestones_select_all" ON public.tier_milestones;
DROP POLICY IF EXISTS "competition_wins_select_own" ON public.competition_wins;
DROP POLICY IF EXISTS "founding_window_select_all" ON public.founding_window;
DROP POLICY IF EXISTS "prize_pool_select_all" ON public.prize_pool;
DROP POLICY IF EXISTS "superfans_select_own" ON public.superfans;
DROP POLICY IF EXISTS "superfans_insert_own" ON public.superfans;
DROP POLICY IF EXISTS "email_list_service_all" ON public.email_list;

-- Disable RLS on all tables (back to pre-005 state)
ALTER TABLE public.entitlements DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_earnings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tracks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.followers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.stations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tier_milestones DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_wins DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.founding_window DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.prize_pool DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.superfans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_list DISABLE ROW LEVEL SECURITY;

COMMIT;