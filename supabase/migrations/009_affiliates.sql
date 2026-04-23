-- Affiliates table for email-based referral system
-- Vendors enter their email → get a unique link to sell anything on Porterful

CREATE TABLE IF NOT EXISTS affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  link_id TEXT UNIQUE NOT NULL,
  referral_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS affiliates_link_id_idx ON affiliates(link_id);
CREATE INDEX IF NOT EXISTS affiliates_email_idx ON affiliates(email);

-- Enable RLS
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;

-- Allow inserts from authenticated routes only (service role bypasses RLS)
-- For now, we keep it open for API routes - restrict if needed later
CREATE POLICY "Allow insert for affiliates" ON affiliates
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read by link_id" ON affiliates
  FOR SELECT USING (true);

-- Affiliate earnings: tracks commissions owed to email-based affiliates
CREATE TABLE IF NOT EXISTS affiliate_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id),
  order_id UUID REFERENCES orders(id),
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE affiliate_earnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert for affiliate earnings" ON affiliate_earnings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read by affiliate" ON affiliate_earnings
  FOR SELECT USING (true);
