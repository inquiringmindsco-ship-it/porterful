-- Migration 030: Revenue Reconciliation Fix
-- Sprint 1B: Make Founder Dashboard Revenue Equal Stripe Revenue
-- Created: 2026-05-30

-- PROBLEM: orders table schema expects subtotal/total (DECIMAL) but webhook writes amount (INTEGER/cents)
-- PROBLEM: orders.user_id is null because webhook never sets it from buyer lookup
-- PROBLEM: founder dashboard reads orders directly via client-side Supabase and hits RLS
-- SOLUTION: Add amount column, backfill from total, fix webhook, create admin endpoint

BEGIN;

-- ── 1. ADD amount COLUMN TO orders (stores cents, INTEGER for consistency with Stripe) ──
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS amount INTEGER;

-- Backfill amount from total (convert dollars to cents)
UPDATE public.orders
SET amount = COALESCE(
  (total * 100)::INTEGER,
  (subtotal * 100)::INTEGER,
  0
)
WHERE amount IS NULL;

-- ── 2. ADD buyer_id COLUMN TO orders (already exists? Let's be safe) ──
-- webhook writes buyer_id but schema doesn't have it in some versions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'buyer_id'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN buyer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ── 3. ADD buyer_email COLUMN TO orders (webhook writes this) ──
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'buyer_email'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN buyer_email TEXT;
  END IF;
END $$;

-- ── 4. ADD stripe_checkout_session_id COLUMN TO orders ──
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'stripe_checkout_session_id'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN stripe_checkout_session_id TEXT;
  END IF;
END $$;

-- ── 5. ADD payment_method COLUMN TO orders ──
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN payment_method TEXT DEFAULT 'stripe' CHECK (payment_method IN ('stripe', 'cash', 'code'));
  END IF;
END $$;

-- ── 6. ADD revenue split columns TO orders (webhook writes these) ──
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'seller_total'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN seller_total DECIMAL(10,2) DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'artist_fund_total'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN artist_fund_total DECIMAL(10,2) DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'superfan_total'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN superfan_total DECIMAL(10,2) DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'platform_total'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN platform_total DECIMAL(10,2) DEFAULT 0;
  END IF;
END $$;

-- ── 7. ADD discount_cents COLUMN TO orders ──
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'discount_cents'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN discount_cents INTEGER DEFAULT 0;
  END IF;
END $$;

-- ── 8. ADD activation_code_id COLUMN TO orders ──
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'activation_code_id'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN activation_code_id UUID;
  END IF;
END $$;

-- ── 9. ADD referrer_id COLUMN TO orders ──
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'referrer_id'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN referrer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ── 10. BACKFILL user_id FROM buyer_id WHERE user_id IS NULL ──
UPDATE public.orders
SET user_id = buyer_id
WHERE user_id IS NULL AND buyer_id IS NOT NULL;

-- ── 11. CREATE INDEX FOR FAST STRIPE SESSION LOOKUP ──
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON public.orders(stripe_checkout_session_id);

-- ── 12. CREATE INDEX FOR FAST BUYER EMAIL LOOKUP ──
CREATE INDEX IF NOT EXISTS idx_orders_buyer_email ON public.orders(buyer_email);

-- ── 13. VERIFY COUNTS ──
SELECT 
  'orders' as table_name,
  COUNT(*) as total_rows,
  COUNT(user_id) as with_user_id,
  COUNT(buyer_id) as with_buyer_id,
  COUNT(amount) as with_amount,
  COUNT(total) as with_total,
  COUNT(stripe_checkout_session_id) as with_stripe_session
FROM public.orders;

-- ── 14. VERIFY SCHEMA ──
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;

COMMIT;
