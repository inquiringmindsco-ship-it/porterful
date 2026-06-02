-- Migration 037: Shipment Event Ledger MVP
-- Internal shipment history for fulfillment jobs.
-- No carrier API integration. No returns workflow. Append-only only.

BEGIN;

CREATE TABLE IF NOT EXISTS public.shipment_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fulfillment_job_id UUID NOT NULL REFERENCES public.fulfillment_jobs(id) ON DELETE RESTRICT,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'packed',
    'label_created',
    'shipped',
    'in_transit',
    'delivered',
    'exception',
    'returned'
  )),
  event_status TEXT NOT NULL DEFAULT 'recorded' CHECK (event_status IN (
    'recorded',
    'confirmed',
    'exception',
    'returned'
  )),
  carrier TEXT,
  tracking_number TEXT,
  tracking_url TEXT,
  location_city TEXT,
  location_state TEXT,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS shipment_events_fulfillment_job_idx
  ON public.shipment_events (fulfillment_job_id);
CREATE INDEX IF NOT EXISTS shipment_events_type_idx
  ON public.shipment_events (event_type);
CREATE INDEX IF NOT EXISTS shipment_events_status_idx
  ON public.shipment_events (event_status);
CREATE INDEX IF NOT EXISTS shipment_events_created_by_idx
  ON public.shipment_events (created_by);
CREATE INDEX IF NOT EXISTS shipment_events_created_at_idx
  ON public.shipment_events (created_at);

ALTER TABLE public.shipment_events ENABLE ROW LEVEL SECURITY;

COMMIT;
