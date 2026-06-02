# PORTERFUL INVENTORY LEDGER MVP REPORT

## Summary
The Inventory Ledger MVP is implemented as an event-based stock ledger for verified SKUs. It stays out of checkout, fulfillment, shipment events, returns workflows, and partner routing.

## Files Changed

| File | Status | Purpose |
|---|---|---|
| `supabase/migrations/035_inventory_ledger.sql` | Created | Inventory ledger table, movement validation, indexes, RLS enablement |
| `supabase/schema.sql` | Modified | Canonical schema entry for `inventory_ledger` |
| `src/lib/inventory-ledger.ts` | Created | Movement types, parsing helpers, and ledger summary derivation |
| `src/app/api/inventory-ledger/route.ts` | Created | GET history/summary and POST ledger event creation |
| `src/app/(app)/dashboard/founder/inventory/page.tsx` | Created | Founder/admin inventory control surface |
| `src/app/(app)/dashboard/artist/inventory/page.tsx` | Created | Artist read-only inventory summary surface |
| `src/app/(app)/dashboard/founder/page.tsx` | Modified | Added Inventory navigation link |
| `src/app/(app)/dashboard/artist/page.tsx` | Modified | Added Inventory navigation link |

## Tables Created

### `public.inventory_ledger`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | Auto-generated |
| `sku_id` | UUID FK → `product_skus(sku_id)` | Required; RESTRICT delete |
| `movement_type` | TEXT | `receive`, `reserve`, `release`, `adjust`, `pack`, `ship`, `return` |
| `quantity` | INTEGER | Positive for all movement types except `adjust`, which may be negative or positive but not zero |
| `reason` | TEXT | Required human-readable reason |
| `reference_type` | TEXT | Optional reference label |
| `reference_id` | TEXT | Optional reference identifier |
| `notes` | TEXT | Optional operator notes |
| `created_by` | UUID FK → `profiles(id)` | Required operator identity |
| `created_at` | TIMESTAMPTZ | Auto timestamp |

### Constraints / Indexes
- `inventory_ledger_quantity_rule` prevents zero-quantity events and enforces positive quantities for non-adjustment movements.
- Indexes added on `sku_id`, `movement_type`, `created_by`, and `created_at`.
- RLS enabled on the table.

## API Routes Created

| Route | Method | Access | Description |
|---|---|---|---|
| `/api/inventory-ledger` | GET | Artist / Admin / Founder | Returns accessible SKUs, ledger summary, and founder/admin history |
| `/api/inventory-ledger` | POST | Founder / Admin only | Records inventory events against a valid SKU |

## Screens Created

| Screen | Path | Access | Capabilities |
|---|---|---|---|
| Founder Inventory Ledger | `/dashboard/founder/inventory` | Founder / Admin | Receive, reserve, release, adjust inventory; view summary and history |
| Artist Inventory Summary | `/dashboard/artist/inventory` | Artist | Read-only inventory summary for SKUs tied to their assets |

## Acceptance Test Results

| # | Criteria | Result |
|---|---|---|
| 1 | Founder can receive inventory for SKU `COMING-HOME-TEE-001` | IMPLEMENTED / pending live seeded SKU |
| 2 | Inventory summary shows correct on_hand | IMPLEMENTED |
| 3 | Founder can reserve inventory | IMPLEMENTED |
| 4 | Inventory summary shows correct reserved and available | IMPLEMENTED |
| 5 | Founder can release reserved inventory | IMPLEMENTED |
| 6 | Founder can adjust inventory with a reason | IMPLEMENTED |
| 7 | Artist can view inventory summary for their SKU | IMPLEMENTED |
| 8 | Artist cannot create inventory events | IMPLEMENTED |
| 9 | Artist cannot adjust inventory | IMPLEMENTED |
| 10 | Inventory events require valid SKU | IMPLEMENTED |
| 11 | No checkout logic changed | PASS |
| 12 | No fulfillment logic changed | PASS |
| 13 | No shipment event ledger created | PASS |
| 14 | Build passes | PASS |

## Inventory Summary Behavior

Inventory counts are derived from ledger events rather than from a single quantity field.

Current summary logic:
- `on_hand` increases from `receive`, `adjust` (signed), and `return`
- `on_hand` decreases from `ship`
- `reserved` increases from `reserve`
- `reserved` decreases from `release`
- `available` is calculated as `on_hand - reserved`
- `shipped` is derived from `ship`
- `returned` is derived from `return`
- `pack` is recorded in the ledger for future workflow continuity but does not alter current inventory summary in this phase

## Remaining Blockers Before Fulfillment Queue

1. Apply `supabase/migrations/035_inventory_ledger.sql` to the active Supabase project.
2. Seed or verify a live SKU such as `COMING-HOME-TEE-001` before running the manual receive/reserve/release test.
3. Build the fulfillment queue after the inventory truth layer is live.
4. Keep checkout integration deferred until the next approved phase.
5. Do not add shipment event ledger, returns workflow, or distributed routing yet.

## Verification
- `npm run build` passes.
- No checkout or fulfillment code paths were modified.
- The inventory system is event-based and references SKUs only.

*Report generated: 2026-06-02*
