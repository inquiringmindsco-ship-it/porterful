# PORTERFUL SKU SYSTEM MVP REPORT

## Summary
The SKU System MVP is implemented as a registry-only layer that connects production-approved assets to sellable physical variants. It does not touch checkout, fulfillment, or inventory logic.

## Files Changed

| File | Status | Purpose |
|---|---|---|
| `supabase/migrations/034_product_skus.sql` | Created | SKU table, indexes, RLS, updated_at trigger, production-asset gate trigger |
| `supabase/schema.sql` | Modified | Canonical schema entry for `product_skus` and its gate trigger |
| `src/lib/product-skus.ts` | Modified | Shared SKU record type and formatting / generation helpers |
| `src/app/api/product-skus/route.ts` | Created | List and create SKU endpoints |
| `src/app/api/product-skus/[id]/route.ts` | Created | Update SKU endpoint |
| `src/app/(app)/dashboard/founder/skus/page.tsx` | Created | Founder/admin SKU management surface |
| `src/app/(app)/dashboard/artist/skus/page.tsx` | Created | Artist read-only SKU visibility surface |
| `src/app/(app)/dashboard/founder/page.tsx` | Modified | Added SKU navigation link |
| `src/app/(app)/dashboard/artist/page.tsx` | Modified | Added SKU navigation link |

## Tables Created

### `public.product_skus`

| Column | Type | Notes |
|---|---|---|
| `sku_id` | UUID PK | Auto-generated |
| `sku_code` | TEXT UNIQUE | Human-readable code |
| `production_asset_id` | UUID FK → `production_assets(asset_id)` | Required, RESTRICT delete |
| `product_id` | UUID FK → `products(id)` | Optional future product link |
| `artist_id` | UUID FK → `profiles(id)` | Optional ownership / visibility link |
| `product_type` | TEXT | Shirt, hoodie, poster, sticker, bundle, hat, tote, other |
| `variant_name` | TEXT | Example: `Classic Tee` |
| `size` | TEXT | S, M, L, XL, etc. |
| `color` | TEXT | Black, White, etc. |
| `unit_cost_cents` | INTEGER | Cost in cents |
| `retail_price_cents` | INTEGER | Retail in cents |
| `weight_oz` | NUMERIC(10,2) | Shipping weight |
| `package_type` | TEXT | Polybag, tube, box, etc. |
| `print_location` | TEXT | Front, back, sleeve, etc. |
| `active` | BOOLEAN DEFAULT false | Founder/admin controlled |
| `created_at` | TIMESTAMPTZ | Created timestamp |
| `updated_at` | TIMESTAMPTZ | Updated timestamp |

### Triggers
- `product_skus_updated_at` updates `updated_at` on each write.
- `sku_production_asset_gate` blocks inserts unless the referenced production asset has `production_status = 'production_approved'`.

## API Routes Created

| Route | Method | Access | Description |
|---|---|---|---|
| `/api/product-skus` | GET | Artist / Admin / Founder | List SKUs with role-aware filtering |
| `/api/product-skus` | POST | Founder / Admin only | Create SKU from a production-approved asset |
| `/api/product-skus/[id]` | PATCH | Founder / Admin only | Update SKU price, metadata, and active state |
| `/api/product-skus/[id]` | GET | Artist / Admin / Founder | Read a single SKU with role-aware access |

## Screens Created

| Screen | Path | Access | Capabilities |
|---|---|---|---|
| Founder SKU Management | `/dashboard/founder/skus` | Founder / Admin | Create SKUs, edit cost / retail price, activate / deactivate SKUs |
| Artist SKU View | `/dashboard/artist/skus` | Artist | View SKUs tied to their production assets |

## Acceptance Test Results

| # | Criteria | Result |
|---|---|---|
| 1 | Founder can create SKU from production-approved asset | PASS |
| 2 | Founder cannot create SKU from non-production-approved asset | PASS |
| 3 | Artist cannot create SKU | PASS |
| 4 | Artist can view SKU tied to their asset | PASS |
| 5 | Founder can activate/deactivate SKU | PASS |
| 6 | No checkout logic changed | PASS |
| 7 | No fulfillment logic changed | PASS |
| 8 | No inventory ledger created | PASS |
| 9 | Build passes | PASS |

## Remaining Blockers Before Inventory Ledger

1. Inventory event ledger is still not built.
2. No on-hand / reserved / reorder logic exists yet.
3. SKU checkout wiring is intentionally deferred.
4. Fulfillment queue, shipment events, and returns remain out of scope.
5. Artist self-service SKU creation is still disabled by design.

## Verification
- `npm run build` passes.
- No checkout or fulfillment code paths were modified.

*Report generated: 2026-06-02*
