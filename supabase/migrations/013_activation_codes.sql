CREATE TABLE IF NOT EXISTS activation_codes (
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

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS paid_cash BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS cash_paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS activation_code_id UUID;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS activation_code_id UUID,
  ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'stripe' CHECK (payment_method IN ('stripe', 'cash', 'code')),
  ADD COLUMN IF NOT EXISTS discount_cents INTEGER DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'orders_activation_code_id_fkey'
  ) THEN
    ALTER TABLE orders
      ADD CONSTRAINT orders_activation_code_id_fkey
      FOREIGN KEY (activation_code_id) REFERENCES activation_codes(id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_activation_code_id_fkey'
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT profiles_activation_code_id_fkey
      FOREIGN KEY (activation_code_id) REFERENCES activation_codes(id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_activation_codes_code_value ON activation_codes(code_value);
CREATE INDEX IF NOT EXISTS idx_activation_codes_status ON activation_codes(status);
CREATE INDEX IF NOT EXISTS idx_activation_codes_redeemed_email ON activation_codes(redeemed_email);
