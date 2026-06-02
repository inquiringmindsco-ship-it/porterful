# Porterful Production Asset Registry Spec

## Status

Specification only.

No production code.

No migrations.

No database changes.

## Purpose

The Production Asset Registry is the proprietary foundation for Porterful's next stage.

It exists to connect:

Creator -> Content -> Asset -> Product -> SKU -> Sale -> Measurement -> Fulfillment -> Revenue

The goal is not to manage files.
The goal is to manage creative property as an operational asset that can be approved, versioned, monetized, fulfilled, measured, and protected.

## 1. What Is a Production Asset?

A production asset is a verified piece of creative property that has been reviewed and can participate in Porterful commerce and fulfillment.

It is more than an uploaded file.

It is the governed record of a creative object that can move through productization and attribution.

### Asset types

The registry should support at minimum:

- Song
- Album
- Album cover
- Artist logo
- Merch design
- Photograph
- Video still
- Catchphrase
- Signature
- Likeness asset
- Campaign artwork
- Tour artwork
- Limited edition design

### Asset boundaries

- An upload is raw input.
- A production asset is an approved, versioned, attributable creative record.
- A production asset may have multiple derived outputs.
- A production asset may map to multiple products and SKUs.

## 2. Asset Ownership

Ownership must be explicit because Porterful's advantage depends on creator attribution and rights clarity.

### Ownership concepts

- Creator owner
  - The originating creator or rights holder for the underlying creative work.
- Artist owner
  - The artist identity used inside Porterful for commerce, audience, and measurement.
- Porterful admin approval
  - The platform approval layer that decides whether the asset can enter production.
- Collaborator credits
  - Contributors who should be acknowledged or compensated.
- Rights notes
  - Short notes about usage limits, territory limits, term limits, or licensing caveats.
- Usage permission
  - The allowed use case for the asset.
- Commercial approval status
  - Whether the asset is approved for monetization and product use.

### Ownership rule

Every production asset must have a clear owner path and a clear commercial permission path.

If ownership is ambiguous, the asset should not be production approved.

## 3. Asset Approval Workflow

The approval workflow should control whether an asset can become a product, SKU, or fulfillment input.

### Required statuses

- Draft
- Submitted
- Under Review
- Approved
- Rejected
- Revision Needed
- Production Approved
- Retired

### Status meaning

- Draft
  - Created but not yet submitted.
- Submitted
  - Ready for review.
- Under Review
  - Being checked for rights, quality, and use permission.
- Approved
  - Approved in principle but not yet production locked.
- Rejected
  - Not approved for Porterful use.
- Revision Needed
  - Changes are required before review can continue.
- Production Approved
  - Approved for use in product, SKU, and fulfillment workflows.
- Retired
  - No longer active for new production, but still retained for history and analytics.

### Approval gate

Only Production Approved assets may:

- link to products for sale
- generate SKUs
- enter fulfillment
- receive revenue attribution
- appear as active production assets in operational dashboards

## 4. Version Control

Versioning is required because creative assets change over time and Porterful must know which version sold.

### Each asset must support

- version number
- upload date
- approved date
- approved by
- change notes
- prior version reference
- current active version

### Versioning rule

- One asset may have many versions.
- Only one version should be active at a time for production use unless the business explicitly allows multiple active versions.
- Historical sales must remain tied to the exact version that was approved or used at the time of sale.

### Version history benefits

- preserves print history
- avoids wrong-version fulfillment
- supports reprints and re-releases
- makes conversion analysis possible by design version

## 5. Asset-to-Product Link

An approved production asset can become many product types.

### Supported product expressions

- shirt
- hoodie
- poster
- sticker
- digital product
- bundle
- limited drop

### Product linkage rule

The product should not be the source of truth for the creative work.

The product should reference the production asset that made it possible.

### Example

One album cover asset could produce:

- a shirt
- a hoodie
- a poster
- a sticker pack
- a limited drop bundle

## 6. Asset-to-SKU Link

One approved production asset can produce multiple SKUs.

### Example

One artwork asset can become:

- black shirt medium
- black shirt large
- white shirt XL
- hoodie large
- poster 11x17

### SKU rule

No SKU should exist without an approved production asset.

The SKU is the sellable operational variant.
The asset is the creative source.

## 7. Asset-to-Measurement Link

Porterful should measure the performance of production assets, not only the performance of products.

### Metrics to connect to each asset

- plays connected to asset
- purchases connected to asset
- downloads connected to asset
- email captures connected to asset
- city/state traction
- revenue generated
- conversion rate

### Why this matters

This allows Porterful to answer:

- which asset drives plays
- which asset drives purchases
- which asset converts by city or state
- which asset generates the most revenue
- which asset deserves a reprint or a re-release

### Measurement principle

The measurement layer should roll up by:

- asset id
- asset version
- creator
- campaign
- product
- SKU

## 8. Asset-to-Fulfillment Link

Approved production assets should flow into fulfillment in a controlled way.

### Supported fulfillment targets

- IMG Fulfillment
- Printful fallback
- future approved partner fulfillment

### Fulfillment rule

Production Approved assets are eligible for fulfillment.

Unapproved assets are not.

### Routing principle

The asset itself should not decide fulfillment provider.

Instead, the asset should carry the metadata needed for the fulfillment system to choose the correct path.

## 9. Asset Security / Integrity

The registry must prevent creative and operational errors.

### Risks to prevent

- random unapproved uploads becoming products
- duplicate assets
- wrong asset versions being printed
- unapproved artwork entering fulfillment
- artist ownership confusion

### Required protection principles

- approval gating before productization
- version locking for fulfillment jobs
- ownership metadata before commercial use
- duplicate detection or review for similar assets
- audit trail for changes and approvals

### Integrity rule

If the asset is not approved, versioned, and attributable, it should not be eligible for production or sale.

## 10. Founder Dashboard Requirements

The founder dashboard should eventually expose production-asset intelligence.

### Required dashboard views

- top assets by plays
- top assets by revenue
- top assets by conversion
- top assets by city/state
- asset approval queue
- production-approved assets
- retired assets

### Why this matters

The founder should be able to see which creative assets are actually driving the business, not just which products exist.

## 11. Proprietary Positioning

The registry should be treated as a Porterful-specific capability.

It is the layer that turns creative output into measurable commerce with provenance.

That is the differentiator.

