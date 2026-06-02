# PORTERFUL FULFILLMENT CORE SPEC

## Status

Specification only.

No code.

No migrations.

No database changes.

## Purpose

Define the minimum operational infrastructure required for IMG Fulfillment while preserving Porterful's real advantage:

**Creator → Content → Commerce → Measurement → Fulfillment**

Porterful is not building fulfillment just to print shirts.

Porterful is building a creator-owned commerce system where creative assets become measurable products, products become revenue, and revenue can be traced back to the original creative source.

## Non-Goals

This spec does not define:

- a merch builder
- artist self-service product design
- partner onboarding
- distributed fulfillment implementation
- Printful expansion
- dashboard redesign
- analytics expansion
- checkout changes

## Fulfillment Philosophy

Fulfillment exists to strengthen Porterful's creator economy loop, not to become a generic shipping backend.

The strategic goal is:

- connect creative work to physical commerce
- preserve attribution from asset to sale
- understand which creative inputs convert
- tie fulfillment outcomes back to creators, campaigns, and songs
- build a system that can learn from physical commerce, not just process it

So the question is not:

- "How do we print a shirt?"

The question is:

- "How does Porterful turn a creative asset into a measurable, revenue-producing product with a traceable fulfillment outcome?"

That is the distinctive value.

## System Overview

Fulfillment Core should be treated as a connected operating layer:

1. Creator
2. Content
3. Production Asset
4. Product
5. SKU
6. Purchase
7. Inventory Reservation
8. Fulfillment Queue
9. Shipment Event History
10. Delivery Outcome
11. Measurement and Revenue Feedback

The core principle:

- physical merch should not be isolated from creator identity or content performance
- every fulfilled item should be traceable back to a creator and a production asset
- every delivery outcome should be visible in operational and measurement terms

## 1. Production Asset Registry

### Why it is the proprietary layer

The production asset registry is the most important differentiator in this system.

Most fulfillment systems know:

- product
- SKU
- order
- shipment

Porterful should also know:

- which creative asset produced the product
- which song or campaign the asset came from
- which version sold
- which asset converted
- which asset performed best by city, audience, or campaign

That makes the registry a creative asset operating system, not just a file repository.

### Registry scope

The Production Asset Registry is the source of truth for:

- Artists
- Songs
- Albums
- Campaigns
- Products
- SKUs
- Orders
- Fulfillment

### Core asset fields

Each production asset should conceptually include:

- Asset ID
- Creator
- Source Song
- Source Campaign
- Approval Status
- Version History
- Linked Products
- Linked SKUs
- Sales Metrics
- Revenue Metrics
- Production Status

### Asset types

The registry should support at least:

- front artwork
- back artwork
- sleeve artwork
- print instructions
- product mockup references
- campaign creative

### Asset lifecycle

1. Draft asset is created.
2. Asset is reviewed.
3. Asset is approved.
4. Asset becomes print-ready.
5. Asset is linked to one or more products.
6. Products are linked to one or more SKUs.
7. Approved assets become eligible for fulfillment.
8. Sales and revenue are associated back to the asset.

### Eligibility rule

An asset is eligible for fulfillment only when:

- it has been approved
- it has a production-ready version
- it is linked to one or more active SKUs
- it has the required print instructions or production metadata

### Why this matters

This allows Porterful to answer questions like:

- Which asset sold best?
- Which creative version converts?
- Which song campaign drove physical product demand?
- Which artist asset should be reprinted?
- Which asset should be retired or iterated?

That is proprietary value because it links creative output to commerce outcome.

## 2. SKU System

### Purpose

Every physical item must have a canonical SKU.

The SKU is the operational identity of a sellable physical variant.

### Required SKU references

Every SKU must reference:

- Product
- Production Asset
- Variant
- Cost
- Retail Price
- Inventory Status

### Rule

No SKU should exist without an approved Production Asset.

### SKU fields

Conceptually, each SKU should contain:

- SKU code
- product_id
- artist_id
- production_asset_id
- variant descriptor
- size
- color
- unit_cost
- retail_price
- inventory status
- on_hand
- reserved
- available
- reorder_point
- active flag

### SKU behavior

- SKUs should be the primary object used for inventory and fulfillment.
- Products are the customer-facing wrapper.
- Production assets are the creative source.
- SKUs are the operational link between those layers.

## 3. Inventory Ledger

### Purpose

Inventory must be a transaction ledger, not a single quantity field.

That gives Porterful traceability and auditability.

### Supported movements

- Receive
- Reserve
- Release
- Pack
- Ship
- Return
- Adjust

### Ledger rules

- Every movement must reference a SKU.
- Every movement must be timestamped.
- Every movement must be attributable to an order or fulfillment job when relevant.
- On-hand quantity should be derivable from the ledger, not hand-edited as the only truth.

### Inventory outcomes

Inventory should always be explainable as:

- what came in
- what was reserved
- what was packed
- what shipped
- what returned
- what was adjusted and why

### Why it matters

Inventory is where merch businesses fail first.

If Porterful cannot trust stock truth, it cannot trust fulfillment truth.

## 4. IMG Fulfillment Queue

### Purpose

The fulfillment queue is the operational center of the merch system.

It is where orders become work.

### Required statuses

- Pending
- Reserved
- Printing
- QC
- Packed
- Label Created
- Shipped
- Delivered
- Exception

### Queue responsibilities

The queue should show:

- order id
- SKU(s)
- asset version
- assigned creator/artist
- current status
- age in status
- blocker reason
- tracking number
- priority
- operator assignment

### Founder visibility requirements

The founder should be able to see:

- what is waiting
- what is blocked
- what is in print
- what failed QC
- what has shipped
- what is overdue
- what assets are performing operationally

### Queue logic

The queue should advance only when:

- inventory is reserved
- production asset is approved
- print or pack action is complete
- QC passes
- label is created

## 5. Shipment Event Ledger

### Purpose

Every shipment action must become an append-only event.

### Required events

- Packed
- Label Created
- Shipped
- In Transit
- Delivered
- Returned
- Failed

### Ledger rules

- Events should never overwrite history.
- Each event should reference the fulfillment job, order, SKU, and shipment where possible.
- Each event should capture the actor or source system that created it.
- Each event should support a timestamp and optional carrier metadata.

### Why append-only matters

Shipment history is not just operational state.

It is evidence.

Porterful should be able to reconstruct the full fulfillment path for any order without guessing.

## 6. Returns

### Priority

Returns are not a primary system in this phase.

They should be minimal and deliberately simple.

### Minimum viable return workflow

- return requested
- return approved or rejected
- return received
- return inspected
- return restocked, replaced, or discarded
- refund or replacement resolved

### Return design goal

Returns should exist only to prevent operational dead-ends.

They should not become a new product surface.

## 7. Future Distributed Fulfillment Compatibility

This spec does not implement distributed fulfillment.

It only keeps the architecture compatible with future providers.

### Future provider classes

- Printful
- IMG Fulfillment
- Approved Local Partners

### Future compatibility principle

Each provider should eventually fit into the same canonical model:

- provider identity
- provider capability
- provider product support
- provider SKU mapping
- fulfillment queue assignment
- shipment event reporting

### Current phase rule

For this phase, the active provider model is:

- **IMG Fulfillment only**

That keeps the operational system simple while preserving future expansion options.

## 8. Proprietary Advantage Analysis

Porterful's competitive advantage is **not** fulfillment itself.

The advantage is the linked system of:

- creator identity
- content performance
- creative asset versioning
- product conversion
- fulfillment outcome
- revenue feedback

### Why this is proprietary

Most platforms can do at least one of the following:

- sell products
- print shirts
- track payments
- ship orders

Far fewer systems can connect:

- the song that drove interest
- the campaign that introduced the asset
- the exact asset version that sold
- the SKU that fulfilled it
- the shipment that delivered it
- the revenue that came back

That chain is the moat.

### What Porterful can know that others usually do not

- which song drives merch demand
- which asset version converts best
- which creator campaign produces physical sales
- which SKUs create the highest repeat value
- which city or audience segment responds to which asset
- which products deserve reprints or retirement

### Why this matters strategically

If Porterful only builds a fulfillment system, it becomes replaceable.

If Porterful builds a creator-to-asset-to-commerce-to-fulfillment intelligence layer, it becomes much harder to copy.

## 9. Competitive Moat Analysis

### Commodity layer

The following are commodity and should be treated as supporting infrastructure:

- SKU tracking
- inventory tracking
- packing queues
- label generation
- delivery tracking
- returns

Any good commerce platform can eventually build these.

### Differentiated layer

Porterful's moat emerges when it adds:

- production asset provenance
- creator and campaign attribution
- song-to-product linkage
- conversion history by asset version
- revenue feedback to creators and campaigns

### Hard-to-copy layer

The hard-to-copy part is not shipping.

It is the combination of:

1. creator-owned content
2. approved production assets
3. SKU-linked merch
4. measurable purchase behavior
5. fulfillment outcome data

That makes the merch system part of a broader creator intelligence engine.

### Bottom line

Printful can print a shirt.

Shopify can sell a shirt.

Porterful should be able to explain **why that shirt sold**, **which creative asset caused it**, and **what happened after delivery**.

That is the moat.

## 10. Recommended Build Order

The recommended order should stay exactly focused on the smallest operational backbone:

1. Production Asset Registry
2. SKU System
3. Inventory Ledger
4. IMG Fulfillment Queue
5. Shipment Event Ledger
6. Returns

## Final Direction

Porterful should not build a merch feature.

Porterful should build a **creator-owned production and commerce system** where merch is only one expression of a broader asset-to-revenue workflow.

That is what gives the Fulfillment Core strategic value beyond basic shipping.
