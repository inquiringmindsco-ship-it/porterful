# Porterful Asset Lifecycle Spec

## Status

Specification only.

No production code.

No migrations.

No database changes.

## Purpose

This document maps the full lifecycle of a creative asset across the Porterful ecosystem.

The lifecycle connects:

Artist
-> Song / Artwork
-> Production Asset
-> Product
-> SKU
-> Order
-> Fulfillment Job
-> Shipment
-> Revenue Report
-> Asset Intelligence

## Lifecycle Diagram

```mermaid
flowchart LR
  A["Artist"] --> B["Song / Artwork"]
  B --> C["Production Asset"]
  C --> D["Approved Production Asset"]
  D --> E["Product"]
  E --> F["SKU"]
  F --> G["Order"]
  G --> H["Inventory Reservation"]
  H --> I["Fulfillment Job"]
  I --> J["Shipment"]
  J --> K["Revenue Report"]
  K --> L["Asset Intelligence"]
```

## Stage 1. Artist Submits Creative Material

The lifecycle begins when an artist submits:

- a song
- artwork
- photography
- campaign creative
- likeness material

The submission is the raw input.

It is not yet a production asset.

## Stage 2. Porterful Creates Asset Record

Porterful creates a production asset record that captures:

- who created it
- what it is
- what it relates to
- what version it is
- what it can become

This is the first move from raw content to governed asset.

## Stage 3. Asset Enters Approval

The asset enters review and moves through approval statuses such as:

- Draft
- Submitted
- Under Review
- Approved
- Rejected
- Revision Needed

Only approved assets may continue to production usage.

## Stage 4. Asset Is Versioned

The asset becomes version-aware.

Versioning records:

- version number
- upload date
- approval date
- approver
- notes about the change
- prior version reference

This ensures Porterful knows which exact creative version is attached to future commerce.

## Stage 5. Asset Becomes Production Approved

A Production Approved asset is eligible to become a product.

This is the point where the asset becomes commercially active.

## Stage 6. Asset Links To Product

The asset is mapped into one or more products such as:

- shirt
- hoodie
- poster
- sticker
- digital product
- bundle
- limited drop

The product is the customer-facing expression of the asset.

## Stage 7. Product Links To SKU

The product expands into SKU-level sellable variants.

Example:

- black shirt medium
- black shirt large
- white shirt XL
- hoodie large
- poster 11x17

The SKU is the operational fulfillment unit.

## Stage 8. SKU Links To Inventory

The SKU becomes the inventory object.

Inventory can then be tracked as:

- received
- reserved
- packed
- shipped
- returned
- adjusted

The SKU is the truth object for stock.

## Stage 9. Customer Purchases

The order is placed through checkout.

The purchase should retain a trace to:

- product
- SKU
- production asset
- creator
- campaign

The transaction should not lose creative provenance.

## Stage 10. Sale Links Back To Asset

The sale should roll back up to the asset record.

This allows Porterful to see:

- which asset sold
- which version sold
- which creator earned
- which campaign worked
- which city/state responded

## Stage 11. Fulfillment Job References Asset

The fulfillment job should carry the asset reference so production can print the right design version.

This prevents:

- wrong-version prints
- unapproved asset use
- confusion between similar assets

## Stage 12. Shipment References Asset

Shipment events should preserve the asset link for traceability and reporting.

That means Porterful can reconstruct:

- the asset used
- the SKU shipped
- the order fulfilled
- the carrier outcome
- the final delivery status

## Stage 13. Revenue And Analytics Roll Up To Asset

Revenue and analytics should aggregate back up to the asset.

This gives Porterful asset intelligence:

- revenue by asset
- conversion by asset
- play-to-purchase by asset
- city/state traction by asset
- shipment success by asset

## Lifecycle Rules

### Rule 1

No production asset approval, no product launch.

### Rule 2

No production asset, no SKU.

### Rule 3

No SKU, no inventory truth.

### Rule 4

No asset link, no meaningful measurement attribution.

### Rule 5

No version lock, no fulfillment certainty.

## Operational Meaning

This lifecycle ensures Porterful is not simply shipping items.

It is capturing how creative work becomes commerce and how commerce becomes measurable value.

