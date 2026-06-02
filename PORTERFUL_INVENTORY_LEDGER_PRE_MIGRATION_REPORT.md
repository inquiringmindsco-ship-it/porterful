# PORTERFUL INVENTORY LEDGER PRE-MIGRATION REPORT

**Date:** 2026-06-02 13:30 CDT  
**Status:** ✅ READY FOR MIGRATION

---

## Scope Verification

| Check | Status | Evidence |
|---|---|---|
| No checkout logic changed | ✅ PASS | Zero checkout files modified |
| No fulfillment logic changed | ✅ PASS | Zero fulfillment files modified |
| No shipment event ledger | ✅ PASS | No shipment_ledger table created |
| No returns workflow | ✅ PASS | No returns table/process |
| No checkout integration | ✅ PASS | No cart/checkout modifications |
| Build passes | ✅ PASS | `next build` exit 0 |

---

## Files Created (5) + Modified (3)

### New Files
1. `supabase/migrations/035_inventory_ledger.sql` — Event-based ledger schema
2. `src/lib/inventory-ledger.ts` — Movement types + summary derivation
3. `src/app/api/inventory-ledger/route.ts` — GET history/summary + POST event
4. `src/app/(app)/dashboard/founder/inventory/page.tsx` — Founder control surface
5. `src/app/(app)/dashboard/artist/inventory/page.tsx` — Artist read-only view

### Modified Files
- `src/app/(app)/dashboard/founder/page.tsx` — Added Inventory nav link
- `src/app/(app)/dashboard/artist/page.tsx` — Added Inventory nav link
- `supabase/schema.sql` — Canonical schema entry

---

## Migration 035 Safety Assessment

### Idempotency
| Check | Status |
|---|---|
| `CREATE TABLE IF NOT EXISTS` | ✅ Idempotent |
| `CREATE INDEX IF NOT EXISTS` | ✅ Idempotent |
| `ALTER TABLE ... ENABLE RLS` | ✅ Idempotent |
| No `DROP TABLE` | ✅ Safe |
| No data destruction | ✅ Safe |

### Constraints
| Constraint | Purpose |
|---|---|
| `inventory_ledger_quantity_rule` | Prevents zero-quantity events; enforces positive for non-adjust |
| `sku_id` FK → `product_skus(sku_id)` | RESTRICT delete (safe) |
| `created_by` FK → `profiles(id)` | RESTRICT delete (safe) |

### RLS Status
- ✅ `ENABLE ROW LEVEL SECURITY` present
- ⚠️ No explicit policies defined in migration (API-only access for MVP)

---

## Event-Based Inventory Confirmed

### Movement Types
- `receive` — Add stock
- `reserve` — Hold stock (doesn't affect on_hand)
- `release` — Un-hold stock
- `adjust` — Signed correction (can be positive or negative)
- `pack` — Recorded but not affecting summary yet
- `ship` — Remove stock + increment shipped
- `return` — Add stock + increment returned

### Summary Derivation (No Single Quantity Field)
```
on_hand = receive + adjust + return - ship
reserved = reserve - release
available = on_hand - reserved
shipped = ship events
dReturned = return events
```

### Source: `src/lib/inventory-ledger.ts`
```typescript
switch (movementType) {
  case 'receive': summary.on_hand += quantity; break;
  case 'reserve': summary.reserved += quantity; break;
  case 'release': summary.reserved -= quantity; break;
  case 'adjust': summary.on_hand += quantity; break;
  case 'pack': break; // recorded, not affecting summary
  case 'ship': summary.on_hand -= quantity; summary.shipped += quantity; break;
  case 'return': summary.on_hand += quantity; summary.returned += quantity; break;
}
summary.available = summary.on_hand - summary.reserved;
```

---

## API Access Control

| Role | GET | POST |
|---|---|---|
| Founder/Admin | ✅ Full history + summary | ✅ Receive, reserve, release, adjust |
| Artist | ✅ Summary only (own SKUs) | ❌ 403 Forbidden |
| Public | ❌ No access | ❌ No access |

---

## Remaining Before Fulfillment Queue

1. **Apply migration 035** — Run SQL in Supabase SQL Editor
2. **Commit + push + deploy** — Vercel auto-deploy
3. **Test with SKU `COMING-HOME-TEE-001`**:
   - Receive 100 units
   - Verify on_hand = 100
   - Reserve 20 units
   - Verify reserved = 20, available = 80
   - Release 10 units
   - Verify reserved = 10, available = 90
   - Ship 30 units
   - Verify on_hand = 70, shipped = 30
4. **Verify artist read-only access**

---

## Exact SQL to Apply

**File:** `supabase/migrations/035_inventory_ledger.sql`

```sql
BEGIN;

CREATE TABLE IF NOT EXISTS public.inventory_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku_id UUID NOT NULL REFERENCES public.product_skus(sku_id) ON DELETE RESTRICT,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('receive','reserve','release','adjust','pack','ship','return')),
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
```

---

## Decision: ✅ SAFE TO APPLY

Migration is idempotent, safe, and event-based. No single quantity field. Ready for production.

*Reported by Sentinel*  
*Date: 2026-06-02 13:30 CDT*
