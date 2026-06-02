-- Migration 038: Return Authorization MVP
-- Internal returns workflow tied to fulfillment jobs, inventory, and shipment history.
-- No carrier integration. No automatic refunds. No checkout integration.

BEGIN;

CREATE TABLE IF NOT EXISTS public.return_authorizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  return_number TEXT NOT NULL UNIQUE DEFAULT ('RA-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8))),
  fulfillment_job_id UUID NOT NULL REFERENCES public.fulfillment_jobs(id) ON DELETE RESTRICT,
  sku_id UUID NOT NULL REFERENCES public.product_skus(sku_id) ON DELETE RESTRICT,
  artist_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  customer_name TEXT,
  customer_email TEXT,
  reason_code TEXT NOT NULL,
  reason_notes TEXT,
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN (
    'requested',
    'under_review',
    'approved',
    'rejected',
    'received',
    'inspected',
    'restocked',
    'replacement_needed',
    'refund_pending',
    'closed'
  )),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  inspected_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  inspection_notes TEXT,
  disposition TEXT CHECK (disposition IN (
    'restock',
    'replace',
    'discard',
    'manual_refund',
    'no_action'
  )),
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  updated_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS return_authorizations_job_idx
  ON public.return_authorizations (fulfillment_job_id);
CREATE INDEX IF NOT EXISTS return_authorizations_sku_idx
  ON public.return_authorizations (sku_id);
CREATE INDEX IF NOT EXISTS return_authorizations_artist_idx
  ON public.return_authorizations (artist_id);
CREATE INDEX IF NOT EXISTS return_authorizations_status_idx
  ON public.return_authorizations (status);
CREATE INDEX IF NOT EXISTS return_authorizations_disposition_idx
  ON public.return_authorizations (disposition);
CREATE INDEX IF NOT EXISTS return_authorizations_created_by_idx
  ON public.return_authorizations (created_by);
CREATE INDEX IF NOT EXISTS return_authorizations_created_at_idx
  ON public.return_authorizations (created_at);

ALTER TABLE public.return_authorizations ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.update_return_authorizations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS return_authorizations_updated_at ON public.return_authorizations;
CREATE TRIGGER return_authorizations_updated_at
  BEFORE UPDATE ON public.return_authorizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_return_authorizations_updated_at();

CREATE OR REPLACE FUNCTION public.advance_return_authorization_status(
  p_return_id UUID,
  p_actor_id UUID,
  p_next_status TEXT,
  p_disposition TEXT DEFAULT NULL,
  p_inspection_notes TEXT DEFAULT NULL,
  p_reason_notes TEXT DEFAULT NULL
)
RETURNS public.return_authorizations
LANGUAGE plpgsql
AS $$
DECLARE
  ra public.return_authorizations%ROWTYPE;
  next_status TEXT := LOWER(BTRIM(COALESCE(p_next_status, '')));
  next_disposition TEXT := LOWER(BTRIM(COALESCE(p_disposition, '')));
  now_ts TIMESTAMPTZ := NOW();
  shipment_notes TEXT;
BEGIN
  SELECT *
  INTO ra
  FROM public.return_authorizations
  WHERE id = p_return_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Return authorization not found';
  END IF;

  IF next_status = '' THEN
    RAISE EXCEPTION 'Next status is required';
  END IF;

  IF p_reason_notes IS NOT NULL THEN
    ra.reason_notes := NULLIF(BTRIM(p_reason_notes), '');
  END IF;

  IF p_inspection_notes IS NOT NULL THEN
    ra.inspection_notes := NULLIF(BTRIM(p_inspection_notes), '');
  END IF;

  IF next_disposition <> '' THEN
    IF next_disposition NOT IN ('restock', 'replace', 'discard', 'manual_refund', 'no_action') THEN
      RAISE EXCEPTION 'Invalid disposition: %', next_disposition;
    END IF;
  END IF;

  CASE ra.status
    WHEN 'requested' THEN
      IF next_status <> 'under_review' THEN
        RAISE EXCEPTION 'Requested returns can only move to under_review';
      END IF;
    WHEN 'under_review' THEN
      IF next_status NOT IN ('approved', 'rejected') THEN
        RAISE EXCEPTION 'Under review returns can only move to approved or rejected';
      END IF;
    WHEN 'approved' THEN
      IF next_status NOT IN ('received', 'closed') THEN
        RAISE EXCEPTION 'Approved returns can only move to received or closed';
      END IF;
    WHEN 'rejected' THEN
      IF next_status <> 'closed' THEN
        RAISE EXCEPTION 'Rejected returns can only move to closed';
      END IF;
    WHEN 'received' THEN
      IF next_status NOT IN ('inspected', 'closed') THEN
        RAISE EXCEPTION 'Received returns can only move to inspected or closed';
      END IF;
    WHEN 'inspected' THEN
      IF next_status NOT IN ('restocked', 'replacement_needed', 'refund_pending', 'closed') THEN
        RAISE EXCEPTION 'Inspected returns can only move to restocked, replacement_needed, refund_pending, or closed';
      END IF;
    WHEN 'restocked' THEN
      IF next_status <> 'closed' THEN
        RAISE EXCEPTION 'Restocked returns can only move to closed';
      END IF;
    WHEN 'replacement_needed' THEN
      IF next_status <> 'closed' THEN
        RAISE EXCEPTION 'Replacement needed returns can only move to closed';
      END IF;
    WHEN 'refund_pending' THEN
      IF next_status <> 'closed' THEN
        RAISE EXCEPTION 'Refund pending returns can only move to closed';
      END IF;
    WHEN 'closed' THEN
      RAISE EXCEPTION 'Closed returns cannot be changed';
    ELSE
      RAISE EXCEPTION 'Unsupported return status: %', ra.status;
  END CASE;

  IF next_status = 'approved' THEN
    ra.approved_at := COALESCE(ra.approved_at, now_ts);
  END IF;

  IF next_status = 'received' THEN
    ra.received_at := COALESCE(ra.received_at, now_ts);
    shipment_notes := 'Return received for ' || ra.return_number;
    INSERT INTO public.shipment_events (
      fulfillment_job_id,
      event_type,
      event_status,
      carrier,
      tracking_number,
      tracking_url,
      location_city,
      location_state,
      notes,
      created_by
    ) VALUES (
      ra.fulfillment_job_id,
      'returned',
      'returned',
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      shipment_notes,
      p_actor_id
    );
  ELSIF next_status = 'closed' AND ra.received_at IS NULL THEN
    shipment_notes := 'Return closed for ' || ra.return_number;
    INSERT INTO public.shipment_events (
      fulfillment_job_id,
      event_type,
      event_status,
      carrier,
      tracking_number,
      tracking_url,
      location_city,
      location_state,
      notes,
      created_by
    ) VALUES (
      ra.fulfillment_job_id,
      'returned',
      'returned',
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      shipment_notes,
      p_actor_id
    );
  END IF;

  IF next_status = 'inspected' THEN
    ra.inspected_at := COALESCE(ra.inspected_at, now_ts);
  END IF;

  IF next_status = 'restocked' THEN
    ra.disposition := 'restock';
    ra.inspected_at := COALESCE(ra.inspected_at, now_ts);

    INSERT INTO public.inventory_ledger (
      sku_id,
      movement_type,
      quantity,
      reason,
      reference_type,
      reference_id,
      notes,
      created_by
    ) VALUES (
      ra.sku_id,
      'return',
      ra.quantity,
      'Restock return authorization ' || ra.return_number,
      'return_authorization',
      ra.id::TEXT,
      COALESCE(NULLIF(ra.inspection_notes, ''), ra.reason_notes),
      p_actor_id
    );
  END IF;

  IF next_status = 'replacement_needed' THEN
    ra.disposition := 'replace';
  ELSIF next_status = 'refund_pending' THEN
    ra.disposition := 'manual_refund';
  ELSIF next_status = 'closed' AND next_disposition <> '' THEN
    ra.disposition := next_disposition;
  ELSIF next_status = 'closed' AND ra.disposition IS NULL THEN
    ra.disposition := 'no_action';
  END IF;

  IF next_status = 'closed' THEN
    ra.closed_at := COALESCE(ra.closed_at, now_ts);
  END IF;

  UPDATE public.return_authorizations
  SET
    status = next_status,
    disposition = COALESCE(ra.disposition, disposition),
    approved_at = ra.approved_at,
    received_at = ra.received_at,
    inspected_at = ra.inspected_at,
    closed_at = ra.closed_at,
    inspection_notes = COALESCE(ra.inspection_notes, inspection_notes),
    reason_notes = COALESCE(ra.reason_notes, reason_notes),
    updated_by = p_actor_id,
    updated_at = now_ts
  WHERE id = ra.id
  RETURNING * INTO ra;

  RETURN ra;
END;
$$;

COMMIT;
