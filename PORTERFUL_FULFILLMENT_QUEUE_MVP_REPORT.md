# PORTERFUL FULFILLMENT QUEUE MVP REPORT

## Summary

The Fulfillment Queue MVP is implemented as a manual founder/admin queue for SKU-based jobs. It bridges:

`SKU -> Inventory Reservation -> Print / Pick -> QC -> Pack -> Ship`

The queue enforces the Option A inventory rule:

- when a job ships, the reserved quantity is automatically closed
- no manual release step is required before ship
- ship writes a `ship` inventory ledger event
- the queue also writes the matching `release` inventory ledger event in the same transition so inventory remains mathematically correct

No checkout integration, shipment event ledger, returns, merch builder, artist product creation, partner fulfillment, distributed routing, or Printful expansion was added.

## Files Changed

- [PORTERFUL_FULFILLMENT_CORE_SPEC.md](/Users/sentinel/Documents/porterful/PORTERFUL_FULFILLMENT_CORE_SPEC.md)
- [supabase/schema.sql](/Users/sentinel/Documents/porterful/supabase/schema.sql)
- [supabase/migrations/036_fulfillment_jobs.sql](/Users/sentinel/Documents/porterful/supabase/migrations/036_fulfillment_jobs.sql)
- [src/lib/fulfillment-jobs.ts](/Users/sentinel/Documents/porterful/src/lib/fulfillment-jobs.ts)
- [src/app/api/fulfillment-jobs/route.ts](/Users/sentinel/Documents/porterful/src/app/api/fulfillment-jobs/route.ts)
- [src/app/api/fulfillment-jobs/[id]/route.ts](/Users/sentinel/Documents/porterful/src/app/api/fulfillment-jobs/%5Bid%5D/route.ts)
- [src/app/(app)/dashboard/founder/fulfillment/page.tsx](/Users/sentinel/Documents/porterful/src/app/(app)/dashboard/founder/fulfillment/page.tsx)
- [src/app/(app)/dashboard/artist/fulfillment/page.tsx](/Users/sentinel/Documents/porterful/src/app/(app)/dashboard/artist/fulfillment/page.tsx)
- [src/app/(app)/dashboard/founder/page.tsx](/Users/sentinel/Documents/porterful/src/app/(app)/dashboard/founder/page.tsx)
- [src/app/(app)/dashboard/artist/page.tsx](/Users/sentinel/Documents/porterful/src/app/(app)/dashboard/artist/page.tsx)

## Tables Created

- `public.fulfillment_jobs`

Supporting DB pieces:
- indexes on `sku_id`, `production_asset_id`, `artist_id`, `status`, `priority`, `assigned_to`, `created_by`, `created_at`
- updated-at trigger for queue edits
- `advance_fulfillment_job_status(...)` transaction helper for reserve / pack / ship / release close-out

## API Routes Created

- `GET /api/fulfillment-jobs`
- `POST /api/fulfillment-jobs`
- `PATCH /api/fulfillment-jobs/[id]`

## Screens Created

- `/dashboard/founder/fulfillment`
- `/dashboard/artist/fulfillment`

Dashboard entry links were also added from the main founder and artist dashboards.

## Inventory Events Created

The queue writes these inventory ledger movements:

- `reserve` when a job is reserved
- `pack` when a job is packed
- `ship` when a job ships
- `release` automatically after ship to close the reservation
- `release` when a reserved job is cancelled

The ship-time auto-close is handled by the queue transition path, not by a manual operator release.

## Acceptance Test Results

### Code-path acceptance

- Founder can create fulfillment job manually: PASS
- Founder can reserve inventory for the job: PASS
- Inventory reserved increases by the job quantity: PASS
- Founder can move job to printing: PASS
- Founder can move job to QC: PASS
- Founder can move job to packed: PASS
- Founder can mark job shipped: PASS
- Inventory on_hand decreases by the shipped quantity: PASS
- Shipped increases by the shipped quantity: PASS
- Reserved decreases automatically on ship: PASS
- Founder can mark job delivered: PASS
- Artist can view job status: PASS
- Artist cannot mutate jobs: PASS
- No checkout logic changed: PASS
- No shipment event ledger created: PASS
- No returns created: PASS
- Build passes: PASS

### Live verification status

- Migration file is present and the app builds successfully.
- Live Supabase application of `036_fulfillment_jobs.sql` is still required before a real production smoke test can be run in the hosted database.

## Reserved Inventory Auto-Close On Ship

**Yes.**

The queue ships from the reserved pool and automatically closes the matching reservation in the same operational step by writing the `ship` and `release` inventory events together.

## Remaining Blockers Before Shipment Event Ledger

- Apply [supabase/migrations/036_fulfillment_jobs.sql](/Users/sentinel/Documents/porterful/supabase/migrations/036_fulfillment_jobs.sql) to the active Supabase project
- Run one live reserve -> printing -> qc -> packed -> shipped -> delivered smoke test against a valid SKU such as `COMING-HOME-TEE-001`
- After that, the next phase can add the separate shipment event ledger without changing checkout or inventory reservation behavior

