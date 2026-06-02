# PORTERFUL PRODUCTION ASSET REGISTRY MVP — BUILD DIRECTIVE

## Status: RATIFIED ✅ — Implementation Approved
**Date:** 2026-06-02 11:40 CDT  
**From:** Od  
**To:** sentinel-dev (Codex)

---

## Mission

Build the first proprietary layer of Porterful: **Production Asset Registry**

This is the system that connects:

```
Creator → Content → Approved Asset → Product Eligibility → Measurement → Future Fulfillment → Revenue
```

The registry treats production assets as first-class records, not simple file uploads.

---

## Build Scope

### Create the minimum system required to:
1. Register production assets
2. Approve / reject / revision-needed
3. Version control
4. View (founder admin + artist)

### Asset Types (12)
- Song
- Album cover
- Artist logo
- Merch design
- Campaign artwork
- Photograph
- Video still
- Catchphrase
- Signature
- Likeness asset
- Tour artwork
- Limited edition design

### Required Fields
- `asset_id` (UUID PK)
- `creator_id` / `artist_id` (UUID FK)
- `asset_type` (enum)
- `title` (text)
- `description` (text)
- `source_song_id` (UUID FK, optional)
- `source_campaign` (text, optional)
- `file_url` or `reference_url` (text)
- `version_number` (integer)
- `approval_status` (enum)
- `production_status` (enum)
- `approved_by` (UUID FK, optional)
- `approved_at` (timestamptz, optional)
- `rights_notes` (text, optional)
- `usage_notes` (text, optional)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### Approval Status (6)
- `draft`
- `submitted`
- `under_review`
- `approved`
- `rejected`
- `revision_needed`

### Production Status (3)
- `not_ready`
- `production_approved`
- `retired`

---

## Do NOT Build

- SKU system
- Inventory ledger
- Fulfillment queue
- Shipment event ledger
- Returns
- Merch builder
- Artist self-service product creation
- Partner fulfillment
- Distributed routing
- Checkout changes
- Webhook changes
- Measurement changes

---

## Implementation Order

1. Create schema/migration for `production_assets` table
2. Create server-side API routes:
   - `GET /api/production-assets` — list assets (filtered by role)
   - `POST /api/production-assets` — submit asset
   - `PATCH /api/production-assets/:id` — update approval/production status
3. Add founder/admin review surface (`/dashboard/founder/assets`)
4. Add artist submission/view surface (`/dashboard/artist/assets`)
5. Connect asset records to existing artists
6. Ensure build passes

---

## Acceptance Test

PASS only if ALL:
1. ✅ Artist can submit a production asset
2. ✅ Asset appears in founder/admin review
3. ✅ Founder can approve/reject/revision-needed
4. ✅ Founder can mark approved as production approved
5. ✅ Artist can see updated status
6. ✅ No merch product created
7. ✅ No SKU created
8. ✅ No checkout or fulfillment logic changed
9. ✅ Build passes

---

## Deliverable

**PORTERFUL PRODUCTION ASSET REGISTRY MVP REPORT**

Include:
- Files changed
- Tables created
- API routes created
- Screens created
- Acceptance test results
- Remaining blockers before SKU system

---

## Context

- Base commit: `9b5bad38` (Add measurement foundation instrumentation)
- Only production change: `normalizeCity` display cleanup in `founder/page.tsx`
- Schema.sql has `DECIMAL(10,2)` for track pricing — production matches
- Sprint 1B COMPLETE — Measurement Foundation deployed
- No pending blockers

**Begin immediately.**
