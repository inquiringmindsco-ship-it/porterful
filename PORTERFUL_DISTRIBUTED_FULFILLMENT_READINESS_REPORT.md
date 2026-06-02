# PORTERFUL DISTRIBUTED FULFILLMENT READINESS REPORT

## Scope

This report assesses Porterful's current fulfillment architecture for a future Distributed Fulfillment Network supporting:

- Printful
- IMG Fulfillment
- Approved Local Partners

No production code was changed.

## Executive Summary

Porterful has the beginnings of a multi-provider fulfillment architecture, but it is not yet ready for partner-based fulfillment at scale.

What exists today:

- A unified fulfillment router that can split orders between Printful, Zendrop, and a manual self-fulfilled lane.
- A Printful adapter that can proxy to Printful when `PRINTFUL_API_KEY` is configured.
- A product catalog model with fulfillment flags and provider identifiers.
- A dropship orders table that records third-party provider order IDs and tracking numbers.

What is still missing:

- A canonical provider registry.
- A partner onboarding workflow.
- A quality-control workflow.
- A shipment event model.
- A true routing engine that can assign orders to the best provider by product, region, capacity, and SLA.
- A durable inventory and SKU mapping system for in-house fulfillment and partner fulfillment.

Bottom line:

- **Printful-only** is the simplest near-term external option.
- **In-house-only** is the best long-term control model, but it requires warehouse-grade operational maturity.
- **Hybrid** is the best near-term strategy.
- **Distributed Fulfillment Network** is a later-stage evolution of hybrid, not a day-one add-on.

## 1. Current Fulfillment Architecture

### 1.1 Current Fulfillment Router

Current router:

- [src/app/(app)/api/fulfillment/route.ts](/Users/sentinel/Documents/porterful/src/app/(app)/api/fulfillment/route.ts)

Current behavior:

- Groups items into:
  - `printful`
  - `zendrop`
  - `selfFulfilled`
- For Printful items, the router forwards a nested order request to the Printful adapter.
- For Zendrop items, the router forwards a nested order request to the Zendrop adapter.
- For self-fulfilled items, it only logs the items and shipping info for manual handling.

Assessment:

- Functional as a demo router.
- Not yet a true fulfillment orchestrator.
- Does not select providers by capacity, geography, SLA, or product eligibility.
- Does not persist an allocation record for downstream tracking.
- Does not emit fulfillment events.

### 1.2 Current Printful Integration

Current adapter:

- [src/app/(app)/api/dropship/printful/route.ts](/Users/sentinel/Documents/porterful/src/app/(app)/api/dropship/printful/route.ts)

Current behavior:

- Returns a local demo catalog when Printful is not configured.
- Proxies product and order calls to Printful when `PRINTFUL_API_KEY` exists.
- Stores a local list of sample Printful product definitions in code.

Assessment:

- Good enough to act as a provider adapter.
- Not yet good enough to serve as a partner abstraction.
- No provider contract exists above this adapter.
- No standard capability model exists across fulfillment providers.

### 1.3 Current Manual Fulfillment Path

Current manual behavior:

- The router logs self-fulfilled items to the console.
- No durable internal queue exists.
- No packing workflow exists.
- No quality-control checkpoint exists.
- No shipment tracking lifecycle exists.

Assessment:

- This is only a placeholder manual lane.
- It is not a production in-house fulfillment system.

### 1.4 Current Product Catalog Structure

Primary catalog:

- [src/lib/products.ts](/Users/sentinel/Documents/porterful/src/lib/products.ts)

Current behavior:

- Products are modeled in code.
- Each product has a `fulfillment` field:
  - `printful`
  - `dropship`
  - `mock`
- Each product also has `available`, `supplier`, and `supplierPrice` fields.
- The catalog currently contains mock-only merch items that are not live.

Assessment:

- Useful for preview and merchandising UI.
- Not sufficient as the canonical source of fulfillment truth.
- Catalog state and fulfillment state are mixed together.
- The model does not yet support partner-specific routing metadata.

### 1.5 Current Order Routing Architecture

Current supporting data model:

- [supabase/schema.sql](/Users/sentinel/Documents/porterful/supabase/schema.sql)

Relevant tables:

- `products`
- `orders`
- `order_items`
- `dropship_orders`
- `activation_codes`

Assessment:

- There is already a split between order identity and provider-specific order records.
- `dropship_orders` is the start of a provider execution ledger.
- There is no provider registry table.
- There is no per-line fulfillment allocation table.
- There is no event-sourced shipment lifecycle.

### 1.6 Current Shipping Workflow Architecture

Current state:

- Shipping addresses are captured on `orders`.
- `dropship_orders` stores a `tracking_number`.
- Printful and Zendrop adapters accept shipping payloads.

Assessment:

- Shipping data exists.
- Tracking lifecycle does not.
- No universal shipment status model exists.
- No webhook-based delivery confirmation flow exists.
- No customer-facing shipment history model exists.

### 1.7 Current Artist Merchandising Architecture

Current artist merch surfaces:

- [src/components/artist/ArtistProducts.tsx](/Users/sentinel/Documents/porterful/src/components/artist/ArtistProducts.tsx)
- [src/components/artist/ArtistMedia.tsx](/Users/sentinel/Documents/porterful/src/components/artist/ArtistMedia.tsx)
- [src/components/ArtistSearch.tsx](/Users/sentinel/Documents/porterful/src/components/ArtistSearch.tsx)
- [src/app/products/page.tsx](/Users/sentinel/Documents/porterful/src/app/products/page.tsx)
- [src/app/(app)/api/fulfillment/route.ts](/Users/sentinel/Documents/porterful/src/app/(app)/api/fulfillment/route.ts)

Assessment:

- Artist-facing merchandising UI exists.
- It is still preview-heavy and catalog-driven.
- It does not yet expose fulfillment provider selection to artists.
- It does not yet support per-artist provider preferences, inventory status, or regional routing rules.

## 2. Readiness Gaps For Partner Fulfillment

### 2.1 Schema Changes Required

To support a Distributed Fulfillment Network, Porterful would need a canonical fulfillment schema. The current schema is not enough.

Required additions:

- `fulfillment_providers`
  - provider name
  - provider type
  - status
  - region coverage
  - capability flags
  - API credential references
  - SLA metadata
- `fulfillment_provider_locations`
  - warehouse / print center / partner location
  - address
  - supported regions
  - active capacity
- `product_fulfillment_rules`
  - product to provider mapping
  - fallback priority
  - blacklisted/allowed regions
  - max quantity / packaging rules
- `fulfillment_orders`
  - one order can be split across providers
  - allocation status
  - provider reference
  - routing reason
- `fulfillment_order_items`
  - line-level assignment
  - quantity
  - provider-specific SKU
  - QC status
- `shipment_events`
  - packed
  - shipped
  - in_transit
  - delivered
  - returned
  - exception
- `fulfillment_qc_checks`
  - sample order result
  - packaging result
  - print quality result
  - approval status

Likely existing tables that would need extension:

- `products`
- `orders`
- `order_items`
- `dropship_orders`

### 2.2 Provider Model Required

Porterful needs a real provider abstraction, not just provider-specific API routes.

Recommended provider model fields:

- provider id
- provider name
- provider type
  - `printful`
  - `img_fulfillment`
  - `local_partner`
  - `zendrop`
  - `manual`
- active status
- supported product categories
- supported regions
- shipping methods
- production lead times
- average transit times
- QC requirements
- return/replacement policy
- API connectivity mode
- fallback priority
- cost basis
- margin target

### 2.3 Partner Onboarding Workflow Required

Required onboarding steps:

1. Invite partner.
2. Verify legal/business identity.
3. Register fulfillment location(s).
4. Set product/category capabilities.
5. Connect shipping methods and service levels.
6. Attach SKU mappings.
7. Run a test order.
8. Pass QC review.
9. Mark provider active.
10. Enable routing gradually.

Without this, a local partner cannot safely enter the system.

### 2.4 Quality-Control Workflow Required

Required QC workflow:

- Sample order creation.
- Print/packaging review.
- Photo proof capture.
- Material/ink/placement validation.
- Size/variant validation.
- Rework or reject loop.
- Approval to go live.

For local partners, QC should be mandatory before any production routing.

### 2.5 Shipping And Tracking Workflow Required

Required shipping flow:

1. Order placed.
2. Order split into provider assignments.
3. Provider receives allocation.
4. Provider accepts or rejects assignment.
5. Packing starts.
6. Shipment label created.
7. Tracking number issued.
8. Shipment events recorded.
9. Customer receives status updates.
10. Delivery or exception closes the lifecycle.

Required tracking data:

- provider order id
- shipment id
- carrier
- service level
- tracking number
- shipped at
- delivered at
- exception reason

## 3. Future Distributed Fulfillment Structure

### Recommended hierarchy

#### Tier 1: Provider Registry

Single source of truth for:

- Printful
- IMG Fulfillment
- Approved Local Partners

#### Tier 2: Product Capability Mapping

Each merch product should know:

- which providers can produce it
- which regions they can serve
- whether a partner can make it in-house
- whether Printful is a fallback

#### Tier 3: Order Allocation

Each order should be split into one or more fulfillment allocations:

- local production
- Printful overflow
- partner production
- manual exception handling

#### Tier 4: Shipment Event Ledger

Every provider interaction should write an event record:

- accepted
- packed
- shipped
- in transit
- delivered
- returned
- failed

#### Tier 5: Artist Merch Control Plane

Artists should eventually be able to:

- choose default fulfillment strategy
- view provider availability
- set product preferences
- see fulfillment status
- see stock/production warnings

## 4. Option Assessment For Future Partner Network

### Printful

Role in future structure:

- Overflow provider
- Catalog expansion provider
- Remote fallback for products not made by IMG Fulfillment

Best use:

- Long-tail SKUs
- Regional overflow
- Fast setup

### IMG Fulfillment

Role in future structure:

- Primary local production lane
- Brand-controlled hero SKUs
- Higher-margin local items

Best use:

- In-house or closely managed production
- Premium packaging
- Artist-branded experiences

### Approved Local Partners

Role in future structure:

- Regional capacity expansion
- Geographic overflow
- Same-day or faster regional fulfillment

Best use:

- Shared partner production
- Local distribution
- Market-by-market expansion

## 5. Readiness Verdict

### What is ready

- A basic provider adapter pattern.
- A basic router that can split by provider.
- A product catalog with fulfillment flags.
- A third-party fulfillment placeholder ledger.

### What is not ready

- Partner registry.
- Partner onboarding.
- QC approvals.
- Inventory / SKU allocation.
- Shipment event tracking.
- Regional routing rules.
- Capacity-based routing.
- Supplier performance monitoring.

### Overall readiness

Porterful is **architecture-aware but not partner-ready**.

It can support a Distributed Fulfillment Network later, but only after the following are added:

- canonical provider schema
- line-item allocation model
- shipment event model
- partner onboarding flow
- QC workflow
- fallback and routing rules

## 6. Recommended Build Direction

Do not build the network yet.

When it is time, the safest order is:

1. Create the provider registry schema.
2. Add product-to-provider routing rules.
3. Add allocation and shipment event tables.
4. Build partner onboarding and QC workflows.
5. Extend the router to choose providers by product, region, and capacity.
6. Add IMG Fulfillment as the first local provider.
7. Add approved local partners after IMG is stable.
8. Keep Printful as overflow fallback.

## 7. Final Recommendation

Porterful should treat future Distributed Fulfillment as an extension of Hybrid Fulfillment, not a separate system.

Recommended future structure:

- **Printful** = fallback / overflow / catalog expansion
- **IMG Fulfillment** = primary controlled local production
- **Approved Local Partners** = regional capacity and speed layer

This gives Porterful:

- control where it matters
- flexibility where it helps
- resilience when one lane is overloaded

Without the schema and workflows listed above, partner fulfillment would add complexity faster than it adds value.
