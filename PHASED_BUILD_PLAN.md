# PORTERFUL ARTIST IDENTITY + TRUST — PHASED BUILD PLAN
## Mission: M-20260608-6
## Priority: P0
## Status: Phase 1 In Progress
## Constraint: NO DEPLOY until localhost review approved by O D

---

## SAFE TOUCH BOUNDARIES (DO NOT CROSS)

- ❌ checkout
- ❌ Stripe
- ❌ fulfillment
- ❌ inventory math
- ❌ shipment events
- ❌ returns
- ❌ payouts
- ❌ referral logic
- ❌ RLS/security policies
- ❌ product pricing
- ❌ product activation rules

---

## PHASE 1 — ATM TRAP ARTIST IDENTITY PROOF

**Proof-of-concept artist:** ATM Trap

### Goals
1. Music-first artist page layout
2. Artist theme proof-of-concept (dark charcoal/black base, warm orange accent)
3. Player artist identity (global player adopts artist accent)
4. Profile image / face positioning fix
5. Collaborator circle verification

### Scope
- Reorder ArtistTabs: Music BEFORE "Support This Creator"
- Reduce hero height, artist photo not dominant
- Add ATM Trap theme to artist data
- Player: inject artist accent color when playing ATM Trap tracks
- Profile image: proper object-fit/object-position
- Verify CollaboratorStack works with real data

### Deliverable
`PORTERFUL_ARTIST_IDENTITY_PHASE1_ATM_TRAP_REPORT`

---

## PHASE 2 — ARTIST THEME SYSTEM GENERALIZATION

**Begin only after Phase 1 review acceptable.**

### Goals
1. Artist appearance settings (primary color, accent color, secondary color, background style, image focus position)
2. Dashboard controls for appearance
3. Safe color validation (prevent broken contrast)
4. Theme fallback for artists without custom theme

### Deliverable
`PORTERFUL_ARTIST_THEME_SYSTEM_REPORT`

---

## PHASE 3 — MUSIC MANAGEMENT FIX

### Goals
1. Bulk track selection (select multiple, select all, select album)
2. Bulk actions (hide/show, price change, album change, release status, featured track)
3. Artist dashboard music management
4. Founder dashboard music management
5. Verification testing

### Deliverable
`PORTERFUL_MUSIC_MANAGEMENT_FIX_REPORT`

---

## PHASE 4 — STORE TRUST + BRAND ASSET CLEANUP

### Goals
1. Store simplification (curated products only, hide excess behind "View Collection")
2. Remove duplicate brand sections
3. Real brand assets (Noble Naturals real logo, Marvelous Black approved logo)
4. Product card fixes (image sizes, faded preview cards, missing images)
5. Founder visibility controls (hide/show/preview/live/featured)

### Deliverable
`PORTERFUL_STORE_TRUST_BRAND_CLEANUP_REPORT`

---

## PHASE 5 — DASHBOARD FRIENDLY PASS

### Goals
1. Artist dashboard language: "My Music", "My Albums", "My Store", "Appearance", "Analytics", "Collaborations", "Settings"
2. Founder dashboard organization
3. Remove clutter, keep power tools available
4. Organize navigation better

### Deliverable
`PORTERFUL_DASHBOARD_FRIENDLY_PASS_REPORT`

---

## PHASE 6 — FINAL LOCAL REVIEW PACKAGE

### Goals
1. Compile all phase summaries
2. Screenshots/descriptions
3. localhost URL
4. Remaining blockers
5. Ready for O D review assessment

### Deliverable
`PORTERFUL_ARTIST_IDENTITY_TRUST_FINAL_REVIEW`

---

## PHASE X — YOUTUBE VIDEO IMPORT + CREATOR PROGRESSION

### Goals
1. YouTube URL import (auto-pull title, thumbnail, channel, date)
2. Artist video section (Featured Videos, Music Videos, Interviews, Live)
3. Starter limits (3 video slots, 1 featured for new artists)
4. Progression system (Level 1-4 unlocks based on activity)
5. Founder controls for limits

### Deliverable
`YOUTUBE_IMPORT_AND_ARTIST_PROGRESSION_REPORT`

---

## CURRENT STATUS

**Phase 1:** Queued for sentinel-dev dispatch
**Build target:** localhost:3000
**Deploy policy:** BLOCKED until O D approves
