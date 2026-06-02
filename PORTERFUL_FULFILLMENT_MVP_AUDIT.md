# PORTERFUL FULFILLMENT MVP AUDIT

## Scope

This audit covers the smallest possible path to support **IMG Fulfillment as a single in-house provider**.

It does **not** add a merch builder, partner onboarding, or distributed fulfillment.

It does **not** change checkout or production code.

## Executive Summary

Porterful already has the purchase-side plumbing needed to accept a merch order:

- catalog surfaces
- checkout shipping capture
- order records
- order items
- a fulfillment router with a manual lane

What it does **not** yet have is a real in-house fulfillment operating model:

- no SKU system
- no inventory ledger
- no packing queue
- no shipping-label workflow
- no return workflow
- no shipment event history

The current architecture is enough to support a **very small IMG Fulfillment MVP**, but only if the repo adds a few canonical fulfillment tables and treats IMG as the only active provider.

## 1. Current Systems Audit

### 1. Product Catalog

Current state:

- The static merch catalog in [src/lib/products.ts](/Users/sentinel/Documents/porterful/src/lib/products.ts) is still mock-only.
- `fulfillment` values exist, but current items are marked `mock` and `available: false`.
- The Supabase product helper in [src/lib/supabase.ts](/Users/sentinel/Documents/porterful/src/lib/supabase.ts) reads the `products` table.
- The checkout catalog in [src/lib/checkout-catalog.ts](/Users/sentinel/Documents/porterful/src/lib/checkout-catalog.ts) already resolves purchasable products from the catalog and blocks unavailable items.
- There are two product schemas in the repo:
  - [supabase/schema.sql](/Users/sentinel/Documents/porterful/supabase/schema.sql)
  - [supabase/marketplace.sql](/Users/sentinel/Documents/porterful/supabase/marketplace.sql)

Audit:

- The product layer is usable as a start, but not yet a clean IMG Fulfillment catalog.
- The presence of both static merch data and database-backed product helpers means the catalog source of truth is still split.
- The mock catalog is not ready to drive physical production.

### 2. Orders

Current state:

- Checkout creates orders in [src/app/(app)/api/checkout/route.ts](/Users/sentinel/Documents/porterful/src/app/(app)/api/checkout/route.ts).
- Orders already capture:
  - shipping address
  - buyer identity
  - amounts
  - Stripe metadata
  - tracking number fields in the schema
- The canonical schema in [supabase/schema.sql](/Users/sentinel/Documents/porterful/supabase/schema.sql) includes `orders.shipping_address`, `orders.tracking_number`, and `orders.status`.
- The alternate marketplace schema in [supabase/marketplace.sql](/Users/sentinel/Documents/porterful/supabase/marketplace.sql) includes a different order shape with `customer_email`, `printful_order_id`, `tracking_number`, and `estimated_delivery`.

Audit:

- Order capture exists.
- Order routing to an in-house fulfillment queue does not.
- The repo still has schema drift between order models.

### 3. Order Items

Current state:

- `order_items` exists in both schema variants.
- Checkout writes line items with product name, quantity, and price.
- The fulfillment router in [src/app/(app)/api/fulfillment/route.ts](/Users/sentinel/Documents/porterful/src/app/(app)/api/fulfillment/route.ts) passes line-item data to provider adapters.

Audit:

- Itemization exists.
- Variant-level production data does not.
- There is no durable per-line fulfillment assignment, pack status, or SKU link in the current order-item model.

### 4. Fulfillment Router

Current state:

- The router in [src/app/(app)/api/fulfillment/route.ts](/Users/sentinel/Documents/porterful/src/app/(app)/api/fulfillment/route.ts) splits items into:
  - Printful
  - Zendrop
  - selfFulfilled
- Printful orders are forwarded to [src/app/(app)/api/dropship/printful/route.ts](/Users/sentinel/Documents/porterful/src/app/(app)/api/dropship/printful/route.ts).
- Zendrop orders are forwarded to [src/app/(app)/api/dropship/zendrop/route.ts](/Users/sentinel/Documents/porterful/src/app/(app)/api/dropship/zendrop/route.ts).
- Self-fulfilled items are only logged to the console for manual processing.

Audit:

- The router is a good placeholder.
- It is not yet a real IMG Fulfillment orchestrator.
- For an IMG-only MVP, the self-fulfilled lane is the closest existing entry point, but it still needs a durable queue and status updates.

### 5. Shipping Workflow

Current state:

- Checkout captures shipping fields in [src/app/(app)/checkout/checkout/page.tsx](/Users/sentinel/Documents/porterful/src/app/(app)/checkout/checkout/page.tsx) and [src/app/checkout/page.tsx](/Users/sentinel/Documents/porterful/src/app/checkout/page.tsx).
- The checkout API stores the shipping address on the order.
- The schema stores `tracking_number`, but not a real shipping-label or carrier workflow.

Audit:

- Address capture exists.
- Label generation does not.
- Carrier selection does not.
- Shipment lifecycle status does not.

### 6. Tracking Workflow

Current state:

- `orders.tracking_number` exists in the schema.
- `dropship_orders.tracking_number` exists in the schema.
- There is no shipment-event ledger.
- There is no packed/shipped/in-transit/delivered history.

Audit:

- Tracking number storage exists.
- Tracking workflow does not yet exist.
- “Delivered” cannot be proven from the current model without manual updates.

## 2. Minimum IMG Fulfillment Systems Required

### A. Inventory Schema Required

The smallest useful in-house fulfillment schema should add:

1. `product_skus`
   - one row per sellable variant
   - internal SKU
   - product reference
   - size/color/variant
   - cost
   - retail price
   - print asset / design reference
   - pack instructions
   - weight and package hints
   - IMG fulfillment flag

2. `inventory_ledger`
   - receive stock
   - reserve stock
   - release stock
   - pack stock
   - ship stock
   - return stock
   - adjust stock

3. `fulfillment_jobs`
   - one job per order, or per split order if needed later
   - status
   - priority
   - packed_by
   - shipped_by
   - provider name

4. `shipment_events`
   - packed
   - label_created
   - shipped
   - in_transit
   - delivered
   - exception

5. `return_authorizations`
   - return request
   - reason
   - approval status
   - inspection result
   - restock/refund/replacement disposition

Optional but useful if IMG runs more than one storage area:

- `inventory_locations`

Current fields that can be reused as a stopgap:

- `products.inventory_count`
- `products.inventory_tracking`
- `orders.shipping_address`
- `orders.tracking_number`

Those fields are not enough on their own for a real in-house operation.

### B. SKU Model Required

Each merch item needs a stable SKU model, not just a product row.

Minimum SKU fields:

- `sku`
- `product_id`
- `artist_id`
- `variant_name`
- `size`
- `color`
- `print_asset_url` or design reference
- `provider_sku`
- `unit_cost`
- `retail_price`
- `weight_oz`
- `package_type`
- `on_hand`
- `reserved`
- `available_to_sell`
- `reorder_point`
- `pack_instructions`
- `returnable`
- `is_active`

Why this matters:

- Porterful can sell a product today.
- Porterful cannot yet uniquely reserve, pick, pack, and ship a specific variant without a real SKU layer.

### C. Packing Workflow Required

Smallest workable IMG packing flow:

1. Paid order creates a `fulfillment_job`.
2. Inventory is reserved against the SKU.
3. A pick list is generated.
4. The item is printed or pulled from stock.
5. A quality check confirms size, artwork, and condition.
6. The item is packed.
7. The package is scanned as packed.
8. The shipping label is created and attached.
9. The job is marked ready to ship.

Without these steps, IMG Fulfillment is only a manual promise, not a system.

### D. Shipping Label Workflow Required

Minimum label workflow:

1. Validate shipping address.
2. Select carrier and service level.
3. Purchase or generate the label.
4. Store label identifier and label cost.
5. Store the tracking number.
6. Attach label PDF or label URL to the fulfillment job.
7. Update the order status to shipped.
8. Trigger the customer notification.

What is missing today:

- no carrier decision engine
- no label purchase step
- no label artifact storage
- no automated shipping status propagation

### E. Return Workflow Required

Minimum return flow:

1. Customer requests return.
2. Return authorization is created.
3. Reason code is recorded.
4. Return label is issued if approved.
5. Return is received and inspected.
6. Item is restocked, replaced, or discarded.
7. Refund or replacement is triggered.

Required data:

- return authorization id
- order id
- SKU id
- reason code
- condition
- inspection result
- disposition
- refund amount

The current schema has no proper return workflow table.

### F. Artist Product Workflow Required

Minimum artist merch flow for IMG-only fulfillment:

1. Artist creates or requests a product.
2. Product is linked to a real SKU.
3. Artist selects size/color variants.
4. Artist uploads print assets or design references.
5. Product gets a pricing and margin check.
6. IMG Fulfillment approves the production proof.
7. Product is marked active and purchasable.
8. The product appears on artist-facing merch surfaces.
9. Purchase routes directly into the IMG fulfillment queue.

Current gap:

- [src/components/artist/ArtistProducts.tsx](/Users/sentinel/Documents/porterful/src/components/artist/ArtistProducts.tsx) shows merch surfaces, but the underlying fulfillment is still preview-oriented.
- [src/lib/products.ts](/Users/sentinel/Documents/porterful/src/lib/products.ts) still treats current merch entries as mock/preview products.

## 3. Smallest Possible Path

The smallest IMG-only path from artist product to delivered package is:

1. Artist product exists as a real product row.
2. Product is mapped to one or more SKUs.
3. Customer buys the product through checkout.
4. Order and order items are created.
5. Shipping address is captured on the order.
6. Order is routed to IMG Fulfillment only.
7. Inventory is reserved.
8. Item is printed or pulled from stock.
9. Item is packed and QC-checked.
10. Shipping label is created.
11. Tracking number is saved.
12. Shipment events are recorded until delivered.

## 4. What Porterful Already Has

Useful foundations already in the repo:

- order creation and shipping capture in [src/app/(app)/api/checkout/route.ts](/Users/sentinel/Documents/porterful/src/app/(app)/api/checkout/route.ts)
- order/item schema primitives in [supabase/schema.sql](/Users/sentinel/Documents/porterful/supabase/schema.sql)
- a manual fulfillment lane in [src/app/(app)/api/fulfillment/route.ts](/Users/sentinel/Documents/porterful/src/app/(app)/api/fulfillment/route.ts)
- public product helpers in [src/lib/supabase.ts](/Users/sentinel/Documents/porterful/src/lib/supabase.ts)
- product discovery surfaces in [src/components/artist/ArtistProducts.tsx](/Users/sentinel/Documents/porterful/src/components/artist/ArtistProducts.tsx)

## 5. What Porterful Still Lacks

The missing minimum systems are:

- canonical SKU model
- inventory ledger
- packing queue
- label workflow
- return authorization workflow
- shipment event history
- IMG-only fulfillment provider state
- a single merch schema source of truth

Also important:

- [supabase/schema.sql](/Users/sentinel/Documents/porterful/supabase/schema.sql) and [supabase/marketplace.sql](/Users/sentinel/Documents/porterful/supabase/marketplace.sql) still define overlapping but different merch/order schemas.
- That drift will become a problem as soon as IMG Fulfillment becomes the active provider.

## 6. MVP Verdict

Porterful is **partially ready** for an IMG-only merch MVP.

It already has:

- catalog surfaces
- checkout capture
- order records
- basic fulfillment routing

It still needs:

- SKU and inventory truth
- a fulfillment job queue
- label and tracking lifecycle records
- a return system

## 7. Recommended Next Minimum Step

If the goal is the smallest safe IMG Fulfillment launch, the next step is not a merch builder.

The next step is a canonical fulfillment data model built around:

- one merch catalog
- one SKU system
- one IMG fulfillment queue
- one shipment event ledger
- one return workflow

That is the minimum path from:

**Artist Product → Purchase → Print → Pack → Ship → Delivered**
