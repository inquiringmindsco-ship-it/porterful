-- Migration 035: Inventory Ledger MVP
-- Event-based inventory truth for approved SKUs.
-- No fulfillment queue. No checkout integration. No shipment event ledger.

BEGIN;

CREATE TABLE IF NOT EXISTS public.inventory_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku_id UUID NOT NULL REFERENCES public.product_skus(sku_id) ON DELETE RESTRICT,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('receive', 'reserve', 'release', 'adjust', 'pack', 'ship', 'return')),
  quantity INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reference_type TEXT,
  reference_id TEXT,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT inventory_ledger_quantity_rule CHECK (
    (movement_type = 'adjust' AND quantity <> 0)
    OR (movement_type <> 'adjust' AND quantity > 0)
  )
);

CREATE INDEX IF NOT EXISTS inventory_ledger_sku_idx ON public.inventory_ledger (sku_id);
CREATE INDEX IF NOT EXISTS inventory_ledger_movement_idx ON public.inventory_ledger (movement_type);
CREATE INDEX IF NOT EXISTS inventory_ledger_created_by_idx ON public.inventory_ledger (created_by);
CREATE INDEX IF NOT EXISTS inventory_ledger_created_at_idx ON public.inventory_ledger (created_at);

ALTER TABLE public.inventory_ledger ENABLE ROW LEVEL SECURITY;

COMMIT;
