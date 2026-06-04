# COMING HOME COLLECTION™ — PHASE 1 REPORT

**Date:** 2026-06-04  
**Commit:** `25af0bf0`  
**Build:** ✅ PASS (165/165 pages)  
**Status:** Deployed to Vercel

---

## EXECUTIVE SUMMARY

Implemented Phase 1 of Coming Home Collection™ — a curated product line representing resilience and new beginnings. No compensation models, no legal complexity, just products and story.

**Tagline:** "Products inspired by resilience, rebuilding, second chances, and new beginnings."

---

## FILES CHANGED

| File | Change |
|------|--------|
| `src/lib/products.ts` | Added Collection interface, COMING_HOME_COLLECTION constant, collection fields to Product, tagged Coming Home Tee, added 3 preview products |
| `src/app/page.tsx` | Added Coming Home Collection section to homepage |
| `src/app/(app)/store/page.tsx` | Added collection link card in store header |
| `src/app/(app)/collections/coming-home/page.tsx` | **NEW** Collection landing page |

**Total:** 5 files changed, 832 insertions

---

## PART 1 — COLLECTION STRUCTURE

### Collection Definition

```typescript
COMING_HOME_COLLECTION = {
  id: 'coming-home',
  slug: 'coming-home',
  name: 'Coming Home Collection™',
  tagline: 'Products inspired by resilience, rebuilding, second chances, and new beginnings.',
  color: '#C4956A',        // warm copper/gold accent
  textColor: '#1a1a1a',
  badge: '🏠 Coming Home™',
}
```

### Products in Collection

| Product | Price | Status | Collection Badge |
|---------|-------|--------|------------------|
| Coming Home Tee™ | $30 | ✅ Live | 🏠 Coming Home™ |
| Coming Home Hoodie™ | $45 | 🟡 Coming Soon | 🏠 Coming Home™ |
| Coming Home Journal™ | $18 | 🟡 Coming Soon | 🏠 Coming Home™ |
| Coming Home Poster™ | $25 | 🟡 Coming Soon | 🏠 Coming Home™ |

### Product Fields Added

```typescript
interface Product {
  // ... existing fields
  collection?: string       // e.g., 'coming-home'
  collectionFeatured?: boolean
}
```

---

## PART 2 — HOMEPAGE PLACEMENT

### Location
- **Position:** Below Featured Tracks section, above "Get Started" CTA
- **Section ID:** Coming Home Collection™

### Layout
- Section header: "Collection" label + "Coming Home Collection™" title
- Tagline displayed
- "View collection →" link to `/collections/coming-home`
- 4-column grid of live products (responsive: 2 cols mobile, 4 cols desktop)

### Visual Treatment
- **Accent color:** Warm copper/gold (#C4956A) — distinct from Porterful orange
- **Collection badge:** "🏠 Coming Home™" on each product card
- **Hover effect:** Border glows copper color
- **Card style:** Same as store products but with collection accent

### Copy (Safe)
```
Products inspired by resilience, rebuilding, second chances, and new beginnings.
```

---

## PART 3 — STORE PLACEMENT

### Collection Link Card
- **Location:** Below store header description
- **Content:** "Explore the Coming Home Collection™ — Products inspired by resilience and new beginnings →"
- **Style:** Bordered card with copper accent, Home icon
- **Link:** `/collections/coming-home`

### Store Filter
- Collections appear in category filter (if collection has products)
- Coming Home products show collection badge on cards

---

## PART 4 — COLLECTION PAGE

### Route
- **URL:** `/collections/coming-home`

### Layout
1. **Back link** → "Back to Store"
2. **Collection header** (large):
   - "Collection" label with Home icon
   - "Coming Home Collection™" title
   - Tagline
   - Full story text (3 paragraphs)
3. **Live Products** section (if any)
4. **Coming Soon** section (preview products)

### Story Text
```
Everyone has a story. Some stories include setbacks. Others include 
second chances. The Coming Home Collection is about that moment — 
when you're ready to rebuild, create, and move forward.

These products represent resilience. They're made for people who 
believe it's never too late to start again.

In the future, we hope to expand this collection through our Coming 
Home Creator Program — giving selected creators the opportunity to 
design products that tell their own stories.

For now, we hope you wear them as a reminder: every day is a new 
beginning.
```

### Product Cards
- Same as store cards
- Collection badge: "🏠 Coming Home™"
- "In Stock" or "Preview" status
- Click → product detail page

---

## PART 5 — PRODUCT PAGE INTEGRATION

### Collection Badge
- Products with `collection: 'coming-home'` show badge on detail page
- Badge links to `/collections/coming-home`

### Safe Attribution
- "Part of the Coming Home Collection™"
- No creator attribution yet (Phase 2)
- No compensation info (Phase 3)

---

## PART 6 — ARTIST PAGE INTEGRATION

### Current State
- Artist pages show music + products
- No collection-specific section yet

### Phase 1 Behavior
- Products tagged with collection show badge
- "Coming Home Collection™" appears as product tag

### Future (Phase 2)
- "Collections" section on artist page
- Creator attribution on product detail

---

## VERIFICATION CHECKLIST

| # | Verification | Status |
|---|-------------|--------|
| 1 | Collection data model created | ✅ |
| 2 | Coming Home Tee tagged with collection | ✅ |
| 3 | Homepage section visible | ✅ |
| 4 | Store link card visible | ✅ |
| 5 | Collection page loads (/collections/coming-home) | ✅ |
| 6 | Collection story displays | ✅ |
| 7 | Live products show purchase buttons | ✅ |
| 8 | Preview products show "Coming Soon" | ✅ |
| 9 | Collection badge on product cards | ✅ |
| 10 | No compensation language anywhere | ✅ |
| 11 | No incarceration mention | ✅ |
| 12 | No legal obligations created | ✅ |
| 13 | Build passes | ✅ |

---

## COMPLIANCE CONFIRMATION

### What Was NOT Implemented (Per Directive)
- ❌ Payouts — none
- ❌ Compensation — none
- ❌ Commissions — none
- ❌ Royalties — none
- ❌ Stipends — none
- ❌ Revenue sharing — none
- ❌ Creator program workflow — none (just mention in story)
- ❌ Legal contracts — none

### What WAS Implemented
- ✅ Collection structure (data model)
- ✅ Product tagging
- ✅ Homepage section
- ✅ Store integration
- ✅ Collection landing page
- ✅ Safe story copy

---

## DESIGN DECISIONS

### Accent Color: #C4956A (Warm Copper/Gold)
- **Why:** Distinct from Porterful orange (#f97316)
- **Feel:** Warm, hopeful, premium
- **Contrast:** Works on dark backgrounds

### Badge: 🏠 + "Coming Home™"
- **Why:** Home emoji = universal symbol of return/belonging
- **Avoids:** Handcuffs, bars, or incarceration imagery
- **Message:** Positive, forward-looking

### Story Tone
- **Universal:** Everyone has setbacks, not specific to incarceration
- **Hopeful:** Focus on rebuilding, not hardship
- **Honest:** "Some stories include setbacks" — acknowledges without defining

---

## REMAINING WORK (PHASE 2+)

### Phase 2 (Future — No Timeline)
- Creator submission form
- Founder approval workflow
- Production Asset integration for approved designs
- Creator attribution on product pages

### Phase 3 (Future — Legal Dependent)
- Compensation model (lawyer required)
- Creator contracts (lawyer required)
- Tax reporting (accountant required)
- Insurance review

---

## DEPLOYMENT STATUS

- **Commit:** `25af0bf0`
- **Branch:** main → origin/main
- **Build:** ✅ PASS
- **Vercel:** Auto-deploying

---

*Phase 1 Report generated by Sentinel — Coming Home Collection™ Live*
