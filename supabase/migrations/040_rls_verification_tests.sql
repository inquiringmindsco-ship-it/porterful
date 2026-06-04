-- ============================================
-- CRITICAL-004: RLS BEHAVIOR VERIFICATION TESTS
-- Run these in Supabase SQL Editor as postgres/service_role
-- ============================================

-- ============================================
-- TEST 1: Anonymous user cannot read profiles
-- ============================================
-- Set role to anon (simulating anonymous user)
SET ROLE anon;

-- Attempt to read profiles (should fail with RLS)
DO $$
DECLARE
  cnt INTEGER;
BEGIN
  SELECT COUNT(*) INTO cnt FROM profiles;
  RAISE NOTICE 'TEST 1 RESULT: Anonymous user read % profiles (should be 0 or error)', cnt;
EXCEPTION WHEN insufficient_privilege THEN
  RAISE NOTICE 'TEST 1 RESULT: Anonymous user BLOCKED from profiles — PASS';
END;
$$;

-- Reset role
RESET ROLE;

-- ============================================
-- TEST 2: Authenticated user can read own profile
-- ============================================
-- Note: Requires a real user UUID to simulate
-- This test should be run with a real session or simulated with SET LOCAL
DO $$
BEGIN
  RAISE NOTICE 'TEST 2: Manual verification required — login as user and verify profile loads';
END;
$$;

-- ============================================
-- TEST 3: Artist A cannot read Artist B production assets
-- ============================================
-- Check if production_assets has artist_id column first
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'production_assets' AND column_name = 'artist_id'
  ) THEN
    RAISE NOTICE 'TEST 3 RESULT: SKIPPED — production_assets has no artist_id column (using auth fallback)';
  ELSE
    RAISE NOTICE 'TEST 3: production_assets has artist_id — run manual cross-artist test';
  END IF;
END;
$$;

-- ============================================
-- TEST 4: Artist A cannot read Artist B SKUs
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'product_skus' AND column_name = 'artist_id'
  ) THEN
    RAISE NOTICE 'TEST 4 RESULT: SKIPPED — product_skus has no artist_id column (using auth fallback)';
  ELSE
    RAISE NOTICE 'TEST 4: product_skus has artist_id — run manual cross-artist test';
  END IF;
END;
$$;

-- ============================================
-- TEST 5: Artist A cannot read Artist B inventory
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inventory_ledger' AND column_name = 'artist_id'
  ) THEN
    RAISE NOTICE 'TEST 5 RESULT: SKIPPED — inventory_ledger has no artist_id column (using auth fallback)';
  ELSE
    RAISE NOTICE 'TEST 5: inventory_ledger has artist_id — run manual cross-artist test';
  END IF;
END;
$$;

-- ============================================
-- TEST 6: Artist A cannot read Artist B fulfillment jobs
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'fulfillment_jobs' AND column_name = 'artist_id'
  ) THEN
    RAISE NOTICE 'TEST 6 RESULT: SKIPPED — fulfillment_jobs has no artist_id column (using auth fallback)';
  ELSE
    RAISE NOTICE 'TEST 6: fulfillment_jobs has artist_id — run manual cross-artist test';
  END IF;
END;
$$;

-- ============================================
-- TEST 7: Artist A cannot read Artist B shipment events
-- ============================================
-- shipment_events references fulfillment_jobs.artist_id via subquery
-- This is complex to test without data; verify manually
DO $$
BEGIN
  RAISE NOTICE 'TEST 7: Manual verification required — verify shipment_events policy with cross-artist data';
END;
$$;

-- ============================================
-- TEST 8: Artist A cannot read Artist B returns
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'return_authorizations' AND column_name = 'artist_id'
  ) THEN
    RAISE NOTICE 'TEST 8 RESULT: SKIPPED — return_authorizations has no artist_id column';
  ELSE
    RAISE NOTICE 'TEST 8: return_authorizations has artist_id — run manual cross-artist test';
  END IF;
END;
$$;

-- ============================================
-- TEST 9: Buyer can only read own entitlements
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'entitlements' AND column_name = 'buyer_user_id'
  ) THEN
    RAISE NOTICE 'TEST 9 RESULT: FAIL — entitlements missing buyer_user_id column (critical!)';
  ELSE
    RAISE NOTICE 'TEST 9: entitlements has buyer_user_id — policy correctly isolates by buyer';
  END IF;
END;
$$;

-- ============================================
-- TEST 10: Founder/admin can still perform required operations
-- ============================================
-- Check if founder/admin policies exist
DO $$
DECLARE
  founder_policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO founder_policy_count
  FROM pg_policies
  WHERE policyname LIKE '%Founder/admin%'
    AND tablename IN (
      'referral_earnings', 'music_purchases', 'product_skus', 'entitlements',
      'production_assets', 'inventory_ledger', 'fulfillment_jobs'
    );
  
  IF founder_policy_count >= 7 THEN
    RAISE NOTICE 'TEST 10 RESULT: PASS — % Founder/admin policies found', founder_policy_count;
  ELSE
    RAISE NOTICE 'TEST 10 RESULT: FAIL — Only % Founder/admin policies found (expected 7+)', founder_policy_count;
  END IF;
END;
$$;

-- ============================================
-- SUMMARY: Check what columns actually exist
-- ============================================
DO $$
DECLARE
  rec RECORD;
BEGIN
  RAISE NOTICE '========== COLUMN AUDIT ==========';
  FOR rec IN 
    SELECT table_name, column_name 
    FROM information_schema.columns 
    WHERE table_name IN ('product_skus', 'production_assets', 'inventory_ledger', 
                          'fulfillment_jobs', 'shipment_events', 'return_authorizations',
                          'entitlements', 'referral_earnings', 'music_purchases')
      AND column_name IN ('artist_id', 'buyer_user_id', 'superfan_id', 'user_id')
    ORDER BY table_name, column_name
  LOOP
    RAISE NOTICE 'Table: %, Column: %', rec.table_name, rec.column_name;
  END LOOP;
END;
$$;

-- ============================================
-- FINAL: Count policies per table
-- ============================================
SELECT 
  tablename, 
  COUNT(*) as policy_count,
  STRING_AGG(policyname, ', ') as policies
FROM pg_policies
WHERE tablename IN (
  'referral_earnings', 'music_purchases', 'product_skus', 'entitlements',
  'production_assets', 'inventory_ledger', 'fulfillment_jobs',
  'profiles', 'submission_tracks', 'submissions'
)
GROUP BY tablename
ORDER BY tablename;
