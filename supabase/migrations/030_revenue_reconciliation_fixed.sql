-- MIGRATION 030 — Revenue Reconciliation Fix (PRODUCTION-SAFE)
-- Status: ACTIVE — replaces deprecated ARCHIVED_030_revenue_reconciliation_broken.sql
-- Date: 2026-05-31
-- Purpose: Sprint 1B — Make Founder Dashboard Revenue Equal Stripe Revenue
-- Risk Level: LOW — idempotent, read-safe, no amount overwrites
--
-- CHANGE LOG:
-- - v1 (2026-05-30): Referenced non-existent total/subtotal columns — FAILED
-- - v2 (2026-05-31): Removed total/subtotal references, added IF NOT EXISTS guards
--
-- WHAT PRODUCTION NEEDS:
-- 1. Indexes for fast Stripe session and buyer email lookups
-- 2. user_id backfill from buyer_id (where user_id IS NULL and buyer_id IS NOT NULL)
--
-- SAFETY GUARANTEES:
-- - All column additions use IF NOT EXISTS (no-op if already present)
-- - No UPDATE touches amount column (preserves existing values)
-- - No ALTER TABLE modifies existing column types
-- - No DELETE statements
-- - Indexes use CREATE IF NOT EXISTS (no-op if already present)

BEGIN;

-- ── 1. ADD amount COLUMN IF MISSING (production already has this) ──
-- Safe: no-op if exists. Default 0 only applies to new rows if column didn't exist.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'amount'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN amount INTEGER DEFAULT 0;
  END IF;
END $$;

-- ── 2. ADD buyer_id COLUMN IF MISSING ──
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'buyer_id'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN buyer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ── 3. ADD buyer_email COLUMN IF MISSING ──
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'buyer_email'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN buyer_email TEXT;
  END IF;
END $$;

-- ── 4. ADD stripe_checkout_session_id COLUMN IF MISSING ──
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'stripe_checkout_session_id'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN stripe_checkout_session_id TEXT;
  END IF;
END $$;

-- ── 5. ADD payment_method COLUMN IF MISSING ──
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN payment_method TEXT DEFAULT 'stripe' CHECK (payment_method IN ('stripe', 'cash', 'code'));
  END IF;
END $$;

-- ── 6. ADD revenue split columns IF MISSING ──
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'seller_total') THEN ALTER TABLE public.orders ADD COLUMN seller_total DECIMAL(10,2) DEFAULT 0; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'artist_fund_total') THEN ALTER TABLE public.orders ADD COLUMN artist_fund_total DECIMAL(10,2) DEFAULT 0; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'superfan_total') THEN ALTER TABLE public.orders ADD COLUMN superfan_total DECIMAL(10,2) DEFAULT 0; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'platform_total') THEN ALTER TABLE public.orders ADD COLUMN platform_total DECIMAL(10,2) DEFAULT 0; END IF; END $$;

-- ── 7. ADD discount_cents COLUMN IF MISSING ──
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'discount_cents') THEN ALTER TABLE public.orders ADD COLUMN discount_cents INTEGER DEFAULT 0; END IF; END $$;

-- ── 8. ADD activation_code_id COLUMN IF MISSING ──
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'activation_code_id') THEN ALTER TABLE public.orders ADD COLUMN activation_code_id UUID; END IF; END $$;

-- ── 9. ADD referrer_id COLUMN IF MISSING ──
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'referrer_id') THEN ALTER TABLE public.orders ADD COLUMN referrer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL; END IF; END $$;

-- ── 10. BACKFILL user_id FROM buyer_id WHERE user_id IS NULL ──
-- SAFETY: Only updates rows where user_id is NULL AND buyer_id is not NULL
-- No existing non-null user_id values are touched
UPDATE public.orders
SET user_id = buyer_id
WHERE user_id IS NULL AND buyer_id IS NOT NULL;

-- ── 11. CREATE INDEX FOR FAST STRIPE SESSION LOOKUP ──
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON public.orders(stripe_checkout_session_id);

-- ── 12. CREATE INDEX FOR FAST BUYER EMAIL LOOKUP ──
CREATE INDEX IF NOT EXISTS idx_orders_buyer_email ON public.orders(buyer_email);

-- ── 13. VERIFY COUNTS (diagnostic only, does not modify data) ──
SELECT 
  'orders' as table_name,
  COUNT(*) as total_rows,
  COUNT(user_id) as with_user_id,
  COUNT(buyer_id) as with_buyer_id,
  COUNT(amount) as with_amount,
  COUNT(stripe_checkout_session_id) as with_stripe_session
FROM public.orders;

-- ── 14. VERIFY SCHEMA (diagnostic only) ──
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;

COMMIT;
