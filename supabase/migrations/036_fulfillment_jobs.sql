-- Migration 036: Fulfillment Queue MVP
-- Manual founder/admin fulfillment jobs for SKU-based products.
-- No checkout integration. No shipment event ledger. No returns. No distributed routing.

BEGIN;

CREATE TABLE IF NOT EXISTS public.fulfillment_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_number TEXT NOT NULL UNIQUE DEFAULT ('FQ-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8))),
  sku_id UUID NOT NULL REFERENCES public.product_skus(sku_id) ON DELETE RESTRICT,
  production_asset_id UUID NOT NULL REFERENCES public.production_assets(asset_id) ON DELETE RESTRICT,
  artist_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reserved', 'printing', 'qc', 'packed', 'shipped', 'delivered', 'exception', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'rush')),
  customer_name TEXT,
  customer_email TEXT,
  shipping_address JSONB,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reserved_at TIMESTAMPTZ,
  printing_at TIMESTAMPTZ,
  qc_at TIMESTAMPTZ,
  packed_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS fulfillment_jobs_sku_idx ON public.fulfillment_jobs (sku_id);
CREATE INDEX IF NOT EXISTS fulfillment_jobs_asset_idx ON public.fulfillment_jobs (production_asset_id);
CREATE INDEX IF NOT EXISTS fulfillment_jobs_artist_idx ON public.fulfillment_jobs (artist_id);
CREATE INDEX IF NOT EXISTS fulfillment_jobs_status_idx ON public.fulfillment_jobs (status);
CREATE INDEX IF NOT EXISTS fulfillment_jobs_priority_idx ON public.fulfillment_jobs (priority);
CREATE INDEX IF NOT EXISTS fulfillment_jobs_assigned_idx ON public.fulfillment_jobs (assigned_to);
CREATE INDEX IF NOT EXISTS fulfillment_jobs_created_by_idx ON public.fulfillment_jobs (created_by);
CREATE INDEX IF NOT EXISTS fulfillment_jobs_created_at_idx ON public.fulfillment_jobs (created_at);

ALTER TABLE public.fulfillment_jobs ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.update_fulfillment_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS fulfillment_jobs_updated_at ON public.fulfillment_jobs;
CREATE TRIGGER fulfillment_jobs_updated_at
  BEFORE UPDATE ON public.fulfillment_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_fulfillment_jobs_updated_at();

CREATE OR REPLACE FUNCTION public.advance_fulfillment_job_status(
  p_job_id UUID,
  p_actor_id UUID,
  p_next_status TEXT,
  p_notes TEXT DEFAULT NULL
)
RETURNS public.fulfillment_jobs
LANGUAGE plpgsql
AS $$
DECLARE
  job public.fulfillment_jobs%ROWTYPE;
  next_status TEXT := LOWER(BTRIM(COALESCE(p_next_status, '')));
  current_on_hand INTEGER := 0;
  current_reserved INTEGER := 0;
  current_available INTEGER := 0;
  auto_notes TEXT;
  now_ts TIMESTAMPTZ := NOW();
BEGIN
  SELECT *
  INTO job
  FROM public.fulfillment_jobs
  WHERE id = p_job_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Fulfillment job not found';
  END IF;

  auto_notes := COALESCE(NULLIF(BTRIM(p_notes), ''), job.notes);

  IF next_status = 'reserved' THEN
    IF job.status <> 'pending' THEN
      RAISE EXCEPTION 'Only pending jobs can be reserved';
    END IF;

    SELECT
      COALESCE(SUM(CASE
        WHEN movement_type IN ('receive', 'adjust', 'return') THEN quantity
        WHEN movement_type = 'ship' THEN -quantity
        ELSE 0
      END), 0)::INTEGER,
      COALESCE(SUM(CASE
        WHEN movement_type = 'reserve' THEN quantity
        WHEN movement_type = 'release' THEN -quantity
        ELSE 0
      END), 0)::INTEGER
    INTO current_on_hand, current_reserved
    FROM public.inventory_ledger
    WHERE sku_id = job.sku_id;

    current_available := current_on_hand - current_reserved;

    IF current_available < job.quantity THEN
      RAISE EXCEPTION 'Insufficient inventory to reserve % units; only % available', job.quantity, current_available;
    END IF;

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
      job.sku_id,
      'reserve',
      job.quantity,
      'Reserve inventory for fulfillment job ' || job.job_number,
      'fulfillment_job',
      job.id::TEXT,
      auto_notes,
      p_actor_id
    );

    UPDATE public.fulfillment_jobs
    SET status = 'reserved',
        reserved_at = COALESCE(reserved_at, now_ts),
        updated_at = now_ts
    WHERE id = job.id
    RETURNING * INTO job;

    RETURN job;
  ELSIF next_status = 'printing' THEN
    IF job.status <> 'reserved' THEN
      RAISE EXCEPTION 'Job must be reserved before printing';
    END IF;

    UPDATE public.fulfillment_jobs
    SET status = 'printing',
        printing_at = COALESCE(printing_at, now_ts),
        updated_at = now_ts
    WHERE id = job.id
    RETURNING * INTO job;

    RETURN job;
  ELSIF next_status = 'qc' THEN
    IF job.status <> 'printing' THEN
      RAISE EXCEPTION 'Job must be printing before QC';
    END IF;

    UPDATE public.fulfillment_jobs
    SET status = 'qc',
        qc_at = COALESCE(qc_at, now_ts),
        updated_at = now_ts
    WHERE id = job.id
    RETURNING * INTO job;

    RETURN job;
  ELSIF next_status = 'packed' THEN
    IF job.status <> 'qc' THEN
      RAISE EXCEPTION 'Job must pass QC before packing';
    END IF;

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
      job.sku_id,
      'pack',
      job.quantity,
      'Packed for fulfillment job ' || job.job_number,
      'fulfillment_job',
      job.id::TEXT,
      auto_notes,
      p_actor_id
    );

    UPDATE public.fulfillment_jobs
    SET status = 'packed',
        packed_at = COALESCE(packed_at, now_ts),
        updated_at = now_ts
    WHERE id = job.id
    RETURNING * INTO job;

    RETURN job;
  ELSIF next_status = 'shipped' THEN
    IF job.status <> 'packed' THEN
      RAISE EXCEPTION 'Job must be packed before shipping';
    END IF;

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
      job.sku_id,
      'ship',
      job.quantity,
      'Shipped via fulfillment queue for job ' || job.job_number,
      'fulfillment_job',
      job.id::TEXT,
      auto_notes,
      p_actor_id
    );

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
      job.sku_id,
      'release',
      job.quantity,
      'Auto-release reserved inventory after shipping fulfillment job ' || job.job_number,
      'fulfillment_job',
      job.id::TEXT,
      auto_notes,
      p_actor_id
    );

    UPDATE public.fulfillment_jobs
    SET status = 'shipped',
        shipped_at = COALESCE(shipped_at, now_ts),
        updated_at = now_ts
    WHERE id = job.id
    RETURNING * INTO job;

    RETURN job;
  ELSIF next_status = 'delivered' THEN
    IF job.status <> 'shipped' THEN
      RAISE EXCEPTION 'Job must be shipped before delivery';
    END IF;

    UPDATE public.fulfillment_jobs
    SET status = 'delivered',
        delivered_at = COALESCE(delivered_at, now_ts),
        updated_at = now_ts
    WHERE id = job.id
    RETURNING * INTO job;

    RETURN job;
  ELSIF next_status = 'exception' THEN
    IF job.status IN ('cancelled', 'delivered') THEN
      RAISE EXCEPTION 'Completed jobs cannot be moved to exception';
    END IF;

    UPDATE public.fulfillment_jobs
    SET status = 'exception',
        updated_at = now_ts
    WHERE id = job.id
    RETURNING * INTO job;

    RETURN job;
  ELSIF next_status = 'cancelled' THEN
    IF job.status IN ('shipped', 'delivered', 'cancelled') THEN
      RAISE EXCEPTION 'Shipped or delivered jobs cannot be cancelled';
    END IF;

    IF job.status IN ('reserved', 'printing', 'qc', 'packed', 'exception') THEN
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
        job.sku_id,
        'release',
        job.quantity,
        'Release reserved inventory after cancelling fulfillment job ' || job.job_number,
        'fulfillment_job',
        job.id::TEXT,
        auto_notes,
        p_actor_id
      );
    END IF;

    UPDATE public.fulfillment_jobs
    SET status = 'cancelled',
        cancelled_at = COALESCE(cancelled_at, now_ts),
        updated_at = now_ts
    WHERE id = job.id
    RETURNING * INTO job;

    RETURN job;
  END IF;

  RAISE EXCEPTION 'Unsupported fulfillment status: %', p_next_status;
END;
$$;

COMMIT;
