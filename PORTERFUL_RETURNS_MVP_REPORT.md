# PORTERFUL RETURNS MVP REPORT

Returns MVP is implemented as an internal return authorization layer tied to fulfillment jobs, shipment history, and inventory restoration. No checkout, carrier-label, refund automation, or merch-builder logic was changed.

## Files Changed

- `/Users/sentinel/Documents/porterful/supabase/migrations/038_return_authorizations.sql`
- `/Users/sentinel/Documents/porterful/src/lib/return-authorizations.ts`
- `/Users/sentinel/Documents/porterful/src/app/api/return-authorizations/route.ts`
- `/Users/sentinel/Documents/porterful/src/app/api/return-authorizations/[id]/route.ts`
- `/Users/sentinel/Documents/porterful/src/app/(app)/dashboard/founder/returns/page.tsx`
- `/Users/sentinel/Documents/porterful/src/app/(app)/dashboard/artist/returns/page.tsx`
- `/Users/sentinel/Documents/porterful/src/app/(app)/dashboard/founder/page.tsx`
- `/Users/sentinel/Documents/porterful/src/app/(app)/dashboard/artist/page.tsx`
- `/Users/sentinel/Documents/porterful/supabase/rls-policies.sql`
- `/Users/sentinel/Documents/porterful/supabase/schema.sql`

## Tables Created

- `return_authorizations`

Implementation note:
- A `quantity` field was added to support partial and full restock math while keeping the ledger internal and event-driven.

## API Routes Created

- `GET /api/return-authorizations`
- `POST /api/return-authorizations`
- `PATCH /api/return-authorizations/[id]`

## Screens Updated

- `/dashboard/founder/returns`
- `/dashboard/artist/returns`
- Founder dashboard quick link to returns
- Artist dashboard quick link to returns

## Return Statuses Supported

- `requested`
- `under_review`
- `approved`
- `rejected`
- `received`
- `inspected`
- `restocked`
- `replacement_needed`
- `refund_pending`
- `closed`

## Dispositions Supported

- `restock`
- `replace`
- `discard`
- `manual_refund`
- `no_action`

## Founder Permissions

Founder/admin can:
- create return authorizations
- view all returns
- update return status
- record inspection notes
- choose disposition
- close returns

## Artist Permissions

Artist can:
- view returns tied to their own SKUs and fulfillment jobs
- see return status and disposition
- view the return timeline

Artist cannot:
- create returns
- approve returns
- reject returns
- change disposition
- close returns

## Inventory Return Behavior

- When a return is moved to `restocked`, the system writes an `inventory_ledger` `return` event.
- The return event uses the return authorization `quantity`.
- Inventory summary math updates from the ledger, so `on_hand` increases through the existing derived summary rules.

## Shipment Event Behavior

- When a return is received, the system writes a shipment event with `event_type = returned`.
- If a return is closed before being marked received, the system still writes a shipment event with `event_type = returned` so the shipment history stays visible.
- No carrier integration was added.

## Acceptance Test Results

Code-level acceptance is satisfied:

1. Founder can create return authorization. PASS
2. Founder can mark return under review. PASS
3. Founder can approve return. PASS
4. Founder can mark return received. PASS
5. Founder can inspect return. PASS
6. Founder can choose restock disposition. PASS
7. Restock creates inventory return event. PASS
8. Inventory summary updates correctly. PASS
9. Artist can view return status. PASS
10. Artist cannot mutate return. PASS
11. No automatic refund is triggered. PASS
12. No carrier integration added. PASS
13. No checkout logic changed. PASS
14. Build passes. PASS

## Remaining Blockers Before Controlled Merch Activation

- Apply `/Users/sentinel/Documents/porterful/supabase/migrations/038_return_authorizations.sql` to the live Supabase database.
- Run one controlled founder smoke test against a delivered fulfillment job.
- Confirm the live returns timeline and inventory restock path against production data.
- After that, returns can remain an internal support workflow without changing checkout or fulfillment automation.
