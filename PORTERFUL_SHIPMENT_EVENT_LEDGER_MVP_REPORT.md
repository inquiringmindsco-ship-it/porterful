# PORTERFUL SHIPMENT EVENT LEDGER MVP REPORT

Shipment Event Ledger MVP is implemented in code as an append-only shipment history layer for fulfillment jobs.

## Files Changed
- [supabase/migrations/037_shipment_events.sql](/Users/sentinel/Documents/porterful/supabase/migrations/037_shipment_events.sql)
- [supabase/schema.sql](/Users/sentinel/Documents/porterful/supabase/schema.sql)
- [supabase/rls-policies.sql](/Users/sentinel/Documents/porterful/supabase/rls-policies.sql)
- [src/lib/shipment-events.ts](/Users/sentinel/Documents/porterful/src/lib/shipment-events.ts)
- [src/app/api/shipment-events/route.ts](/Users/sentinel/Documents/porterful/src/app/api/shipment-events/route.ts)
- [src/components/fulfillment/ShipmentEventTimeline.tsx](/Users/sentinel/Documents/porterful/src/components/fulfillment/ShipmentEventTimeline.tsx)
- [src/app/(app)/dashboard/founder/fulfillment/page.tsx](/Users/sentinel/Documents/porterful/src/app/(app)/dashboard/founder/fulfillment/page.tsx)
- [src/app/(app)/dashboard/artist/fulfillment/page.tsx](/Users/sentinel/Documents/porterful/src/app/(app)/dashboard/artist/fulfillment/page.tsx)

## Tables Created
- `shipment_events`

### Table Shape
- `id`
- `fulfillment_job_id`
- `event_type`
- `event_status`
- `carrier`
- `tracking_number`
- `tracking_url`
- `location_city`
- `location_state`
- `notes`
- `created_by`
- `created_at`

### Append-Only Rule
- The shipment ledger is insert-only.
- No update or delete routes were added.
- No inventory math was changed.
- No checkout logic was changed.

## API Routes Created
- `GET /api/shipment-events`
- `POST /api/shipment-events`

### Route Behavior
- Founder/admin can list shipment history for all jobs or a selected job.
- Founder/admin can create shipment events manually.
- Artists can list shipment events only for their own fulfillment jobs.
- Artists cannot create shipment events.

## Screens Updated
- [src/app/(app)/dashboard/founder/fulfillment/page.tsx](/Users/sentinel/Documents/porterful/src/app/(app)/dashboard/founder/fulfillment/page.tsx)
- [src/app/(app)/dashboard/artist/fulfillment/page.tsx](/Users/sentinel/Documents/porterful/src/app/(app)/dashboard/artist/fulfillment/page.tsx)

### UI Added
- Founder shipment event form
- Founder shipment timeline
- Artist shipment timeline
- Simple append-only event history display

## Shipment Event Types Supported
- `packed`
- `label_created`
- `shipped`
- `in_transit`
- `delivered`
- `exception`
- `returned`

## Founder Permissions
- View shipment history for all fulfillment jobs
- Create shipment events
- Add carrier manually
- Add tracking number manually
- Add tracking URL manually
- Add city/state event location
- Mark shipments as in transit, delivered, exception, or returned

## Artist Permissions
- View shipment history for their own fulfillment jobs
- View shipment timelines in read-only mode
- Cannot create shipment events
- Cannot edit shipment events
- Cannot delete shipment events

## Acceptance Test Results
- PASS: Build passes
- PASS: Shipment events reference a valid fulfillment job in the API
- PASS: Shipment events are append-only by design
- PASS: Founder UI includes shipment event creation and timeline viewing
- PASS: Artist UI includes shipment event timeline viewing
- PASS: No checkout logic changed
- PASS: No inventory math changed
- PASS: No returns system built
- PASS: No carrier API integration added
- PASS: No distributed routing added

### Live Rollout Note
- The code and schema are ready.
- The new migration still needs to be applied in the active production database before live shipment history can be smoke-tested end to end.

## Remaining Blockers Before Returns MVP
- Apply [supabase/migrations/037_shipment_events.sql](/Users/sentinel/Documents/porterful/supabase/migrations/037_shipment_events.sql) to production
- Run one controlled founder shipment-event smoke test
- Confirm artist read-only visibility in production
- Then proceed to Returns MVP

