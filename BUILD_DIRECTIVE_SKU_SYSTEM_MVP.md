# PORTERFUL SKU SYSTEM MVP — BUILD DIRECTIVE

## Status: APPROVED — Production Asset Registry verified
**Date:** 2026-06-02 12:13 CDT  
**From:** Od  
**To:** sentinel-dev (Codex)

---

## Mission

Build the SKU layer that connects production-approved assets to sellable physical variants.

A SKU must not exist unless it references a production-approved asset.

The SKU system should become the bridge between:

```
Production Asset → Product Variant → Future Inventory → Future Fulfillment
```

---

## Build Scope

### Create the minimum system required to:
1. Define SKU schema linked to production assets
2. Enforce production approval gate
3. Founder/admin SKU management
4. Artist SKU visibility (read-only)

### Do NOT Build
- Inventory ledger (no on_hand/reserved/reorder logic)
- Fulfillment queue
- Shipment event ledger
- Returns
- Merch builder
- Artist self-service product creation
- Checkout integration
- Partner fulfillment
- Distributed routing

---

## SKU Schema

### Table: `product_skus`

| Field | Type | Notes |
|---|---|---|
| `sku_id` | UUID PK | |
| `sku_code` | TEXT UNIQUE | Human-readable code |
| `production_asset_id` | UUID FK → production_assets(asset_id) | Required |
| `product_id` | UUID FK (optional) | Future product table |
| `artist_id` | UUID FK → profiles(id) | Optional |
| `product_type` | TEXT | shirt, hoodie, poster, sticker, bundle, etc. |
| `variant_name` | TEXT | e.g., "Classic Tee" |
| `size` | TEXT | S, M, L, XL, etc. |
| `color` | TEXT | Black, White, etc. |
| `unit_cost_cents` | INTEGER | Cost in cents |
| `retail_price_cents` | INTEGER | Retail in cents |
| `weight_oz` | DECIMAL(6,2) | Shipping weight |
| `package_type` | TEXT | polybag, tube, box, etc. |
| `print_location` | TEXT | front, back, sleeve, etc. |
| `active` | BOOLEAN DEFAULT false | Must be activated by founder |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

---

## Production Asset Gate

### Enforce:
- SKU can only be created if `production_assets.production_status = 'production_approved'`
- Rejected, draft, revision_needed, approved-but-not-production-approved assets cannot become SKUs

---

## Access Control

### Founder/Admin can:
- Create SKU from production-approved asset
- View all SKUs
- Edit cost/retail price
- Activate/deactivate SKU

### Artist can:
- View SKUs connected to their assets
- See SKU status
- See product type, size, color, retail price

### Artist cannot:
- Create SKU
- Change SKU price
- Activate/deactivate SKU

---

## Implementation Order

1. Create schema/migration for `product_skus`
2. Create server-side API routes:
   - `GET /api/product-skus` — list with role-based filtering
   - `POST /api/product-skus` — create SKU (founder/admin only)
   - `PATCH /api/product-skus/:id` — update price/status (founder/admin only)
3. Add founder/admin SKU management surface (`/dashboard/founder/skus`)
4. Add artist SKU visibility surface (`/dashboard/artist/skus`)
5. Add navigation links from dashboards
6. Ensure build passes

---

## Acceptance Test

PASS only if ALL:
1. ✅ Founder can create SKU from production-approved asset
2. ✅ Founder cannot create SKU from non-production-approved asset
3. ✅ Artist cannot create SKU
4. ✅ Artist can view SKU tied to their asset
5. ✅ Founder can activate/deactivate SKU
6. ✅ No checkout logic changed
7. ✅ No fulfillment logic changed
8. ✅ No inventory ledger created
9. ✅ Build passes

---

## Deliverable

**PORTERFUL SKU SYSTEM MVP REPORT**

Include:
- Files changed
- Tables created
- API routes created
- Screens created
- Acceptance test results
- Remaining blockers before Inventory Ledger

---

## Context

- Base commit: `03e49d35` (Production Asset Registry MVP)
- Production Asset Registry: ✅ Verified and live
- Migration 033: ✅ Applied
- Sprint 1B: ✅ COMPLETE
- No pending blockers

**Begin immediately.**
