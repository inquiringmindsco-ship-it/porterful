# COMING HOME COLLECTION™ — IMPLEMENTATION PLAN

**Date:** 2026-06-04  
**Status:** PLANNING ONLY — No code changes  
**Author:** Sentinel (per Od directive)  
**Phase:** 1 (Safe and Simple)

---

## EXECUTIVE SUMMARY

Create a **Coming Home Collection™** inside Porterful that tells a story of resilience, rebuilding, and second chances — without compensation complexity, legal risk, or premature promises.

**Key Principle:** Build the collection first. Build the creator program second. Build compensation third — with lawyers.

---

## PHASE 1 — COMING HOME COLLECTION™ (NOW)

### Collection Definition

**Name:** Coming Home Collection™  
**Tagline:** "Products inspired by resilience, rebuilding, second chances, and new beginnings."  
**Positioning:** A curated product line within Porterful Store  
**Brand Values:** Hope, resilience, community, new beginnings

### Collection Structure

```
Coming Home Collection™
├── Products (Phase 1 — Live)
│   ├── Coming Home Tee™        ($30, Black, controlled_test)
│   ├── Coming Home Hoodie™     ($45, Coming Soon)
│   ├── Coming Home Journal™    ($18, Coming Soon)
│   └── Coming Home Poster™     ($25, Coming Soon)
├── Story Section
│   ├── "What is Coming Home?"
│   ├── "The Story Behind the Collection"
│   └── "Future: Creator Program"
└── Visual Identity
    ├── Collection badge/logo
    ├── Warm, hopeful color accent
    └── Product photography style
```

### Products Phase 1

| Product | Price | Status | SKU Pattern | Fulfillment |
|---------|-------|--------|-------------|---------------|
| Coming Home Tee™ | $30 | ✅ Live | CH-TEE-001 | img_fulfillment |
| Coming Home Hoodie™ | $45 | 🟡 Coming Soon | CH-HOODIE-001 | img_fulfillment |
| Coming Home Journal™ | $18 | 🟡 Coming Soon | CH-JOURNAL-001 | img_fulfillment |
| Coming Home Poster™ | $25 | 🟡 Coming Soon | CH-POSTER-001 | img_fulfillment |

### What Makes This Safe

- No claims about who made the products
- No compensation promises
- No revenue sharing language
- No "support returning citizens" as a sales pitch
- Just products + story + future possibility

---

## PHASE 2 — COMING HOME CREATOR PROGRAM™ (FUTURE)

### Program Definition

**Name:** Coming Home Creator Program™  
**Purpose:** Allow selected creators to submit designs for Coming Home Collection products  
**Eligibility (Future):** Returning citizens, veterans, community creators  
**Gate:** Founder approval required for all submissions

### Workflow

```
Creator Submits Design
        ↓
Founder Review (manual approval)
        ↓
Approved → Production Asset Created
        ↓
SKU Generated (existing system)
        ↓
Product Added to Coming Home Collection
        ↓
Store Listing
        ↓
Fulfillment (existing pipeline)
```

### Infrastructure Alignment

| Existing System | How It Supports Coming Home |
|-----------------|---------------------------|
| Production Asset Registry | Store approved designs as assets |
| SKU System | Generate CH-[TYPE]-[NNN] SKUs |
| Store/Product Catalog | List under "Coming Home Collection" |
| Fulfillment Pipeline | Same IMG fulfillment flow |
| Artist Pages | Creator attribution (if desired) |

### What Phase 2 Does NOT Include

- ❌ Automatic approval
- ❌ Self-service creator portal (yet)
- ❌ Compensation tracking
- ❌ Revenue sharing logic
- ❌ Payout automation
- ❌ Legal contracts (yet)

### What Phase 2 DOES Include

- ✅ Manual submission workflow (email/form)
- ✅ Founder approval gate
- ✅ Production Asset creation (manual)
- ✅ SKU generation (manual or automated)
- ✅ Product listing in collection
- ✅ Creator attribution on product page

---

## PHASE 3 — COMPENSATION MODEL (LATER — WITH LAWYERS)

### Why This is Phase 3

Compensation models have legal implications:

| Model | Legal Consideration |
|-------|---------------------|
| Royalties | Intellectual property licensing |
| Commissions | Contractor vs employee classification |
| Revenue Share | Tax implications, reporting |
| Stipends | Gift vs income classification |
| Profit Sharing | Business entity implications |

### Phase 3 Requirements

Before implementing compensation:
- [ ] Legal review (entity type, liability)
- [ ] Accounting review (tax reporting, 1099s)
- [ ] Compliance review (state/federal regulations)
- [ ] Insurance review (if any)
- [ ] Written agreements (creator contracts)

### Safe Language for Phase 1-2

**Use:** "Future creator program in development"  
**Use:** "Creator submissions considered by invitation"  
**Use:** "Compensation models under legal review"  
**Avoid:** "X% of profits go to creators"  
**Avoid:** "Guaranteed payment for designs"  
**Avoid:** "Revenue sharing program" (implies legal structure)

---

## IMPLEMENTATION ARCHITECTURE

### Database Changes (Minimal)

```sql
-- Add collection field to products (optional)
ALTER TABLE products ADD COLUMN collection VARCHAR(50);
-- Values: NULL, 'coming_home', 'likeness', etc.

-- Add collection metadata table (optional)
CREATE TABLE product_collections (
  id UUID PRIMARY KEY,
  slug VARCHAR(50) UNIQUE, -- 'coming-home'
  name VARCHAR(100),       -- 'Coming Home Collection'
  description TEXT,
  story TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Product Data Model Changes

```typescript
// Add to Product interface (optional)
interface Product {
  // ... existing fields
  collection?: string;        // 'coming-home' | null
  collectionPosition?: number; // sort order within collection
  isCollectionFeatured?: boolean;
}
```

### File Structure

```
src/app/(app)/
├── store/
│   └── page.tsx                    (existing — add collection filter)
├── collections/
│   └── [slug]/
│       └── page.tsx               (NEW — collection landing page)
│   └── coming-home/
│       └── page.tsx               (NEW — specific collection page)
├── products/
│   └── [id]/
│       └── page.tsx               (existing — add collection badge)
└── api/
    └── collections/
        └── route.ts               (NEW — fetch collection data)
```

---

## HOMEPAGE PLACEMENT

### Section: "Coming Home Collection™"

**Position:** Below hero, above or below "How It Works"  
**Layout:** Horizontal scroll or 2-column grid  
**Content:**
- Collection name + tagline
- 1 featured product (Coming Home Tee)
- "Shop Collection →" CTA
- Brief story text (2-3 sentences)

**Visual Treatment:**
- Slightly different background (subtle warm tint)
- Collection badge on product card
- Different accent color (warm gold/copper instead of orange)

### Copy (Safe)

```
Coming Home Collection™
Products inspired by resilience, rebuilding, second chances, and new beginnings.

[Coming Home Tee — $30]
[Coming Home Hoodie — Coming Soon]

Shop Collection →
```

---

## STORE PLACEMENT

### Collection Page: `/collections/coming-home`

**Layout:**
- Collection header (name, story, visual identity)
- Product grid (all Coming Home products)
- "About This Collection" section
- "Future Creator Program" teaser (Phase 2)

**Store Integration:**
- Add "Collections" to store category filter
- Coming Home appears as a filter option
- Collection badge on product cards

### Product Card Badge

```
┌─────────────────────────────┐
│  [Image]                    │
│                             │
│  🏠 Coming Home Collection™   │
│  Coming Home Tee™            │
│  $30                        │
│  By ATM Trap                │
└─────────────────────────────┘
```

---

## ARTIST PAGE INTEGRATION

### Current State
Artist pages show:
- Music tracks
- Products (if any)

### Future State (Phase 2)
Artist pages show:
- Music tracks
- Products (including Coming Home items)
- "Collections" section (if artist has items in curated collections)

### Attribution Model (Phase 2)
- Product page: "Design by [Creator Name]" (if applicable)
- Creator page: "Coming Home Collection contributor"
- No compensation info displayed (Phase 3 only)

---

## PRODUCT TAGGING

### Tags to Add

| Tag | Purpose |
|-----|---------|
| `coming-home` | Collection membership |
| `collection-featured` | Featured in collection |
| `creator-submitted` | Phase 2 — from creator program |
| `founder-approved` | Phase 2 — approved by Od |

### Tag Implementation

```typescript
// Product interface extension
interface Product {
  // ... existing fields
  tags?: string[];
  collection?: string;
  creatorInfo?: {
    name: string;
    story?: string;
    approvedAt?: string;
  };
}
```

---

## BRAND/STORY PLACEMENT

### Coming Home Story Section

**Where:** Collection page, product pages, homepage  
**Length:** 2-3 paragraphs max  
**Tone:** Hopeful, honest, not exploitative

**Draft Copy:**

```
Coming Home Collection™

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

### What This Copy Does NOT Do
- ❌ Mention incarceration specifically
- ❌ Promise jobs or income
- ❌ Claim to be a non-profit or charity
- ❌ Use guilt or pity as motivation
- ❌ Make promises about future program

### What This Copy DOES Do
- ✅ Tell a universal story (resilience, second chances)
- ✅ Hint at future expansion (without promising)
- ✅ Focus on product meaning, not creator hardship
- ✅ Leave door open for Phase 2-3

---

## COMPLIANCE CONSIDERATIONS

### Phase 1 (Current) — Low Risk

**What's Safe:**
- Selling products with a story
- Using words like "resilience," "rebuilding," "second chances"
- Creating a product collection
- Mentioning future programs "under development"

**What's NOT Safe (Yet):**
- Claiming proceeds benefit any group
- Promising employment or income
- Representing as a charity or non-profit
- Collecting personal stories without consent

### Phase 2 (Future) — Medium Risk

**Requirements:**
- Creator consent forms (for using their name/story)
- Clear terms: "submission does not guarantee acceptance"
- No compensation promises in writing
- Founder retains full approval rights

**Legal Review Needed:**
- IP assignment (who owns the design?)
- Publicity rights (can we use their name?)
- Defamation risk (if story is shared)

### Phase 3 (Future) — High Risk

**Requirements:**
- Lawyer (employment law, IP law)
- Accountant (tax implications)
- Insurance (liability)
- Written contracts (creator agreements)
- State/federal compliance (if applicable)

---

## FUTURE EXPANSION OPPORTUNITIES

### Collection Expansion
- Additional products (mugs, hats, tote bags)
- Limited editions
- Seasonal variations
- Collaboration with established artists

### Creator Program Expansion
- Open submissions (vs invitation-only)
- Self-service portal
- Design voting/community selection
- Mentorship pairing

### Compensation Models (Phase 3+)
| Model | Pros | Cons | Complexity |
|-------|------|------|------------|
| Flat fee per design | Simple, predictable | Limited upside for creator | Low |
| Per-unit royalty | Creator incentive | Accounting tracking | Medium |
| Revenue share | Shared success | Tax complexity, legal | High |
| Stipend + royalty | Stable + incentive | Most complex | Highest |

---

## SUCCESS METRICS

### Phase 1 Metrics
- Collection page views
- Product clicks from collection
- Sales attributed to collection
- Social shares of collection story

### Phase 2 Metrics
- Creator submissions received
- Approval rate
- Time from submission to product
- Creator satisfaction (qualitative)

### Phase 3 Metrics
- Creator earnings (if compensation active)
- Legal/compliance incidents (target: zero)
- Collection revenue vs standard products
- Brand perception surveys

---

## IMPLEMENTATION TIMELINE

### Phase 1 (2-3 Days)
- [ ] Create collection page (`/collections/coming-home`)
- [ ] Add collection badge to product cards
- [ ] Add homepage section
- [ ] Add store filter
- [ ] Write collection story copy
- [ ] Create collection visual assets (badge, banner)

### Phase 2 (2-4 Weeks)
- [ ] Design submission workflow (form/email)
- [ ] Create founder approval process
- [ ] Build creator attribution on product pages
- [ ] Draft creator terms (legal review)
- [ ] Test workflow end-to-end

### Phase 3 (Months — Legal Dependent)
- [ ] Legal review
- [ ] Accounting review
- [ ] Contract drafting
- [ ] Compliance audit
- [ ] Soft launch with 1-2 creators
- [ ] Iterate based on learnings

---

## FILES TO CREATE (Phase 1)

```
src/app/(app)/collections/
├── page.tsx                    (Collections index)
└── coming-home/
    └── page.tsx               (Coming Home Collection page)

src/components/collections/
├── CollectionCard.tsx         (Collection preview card)
├── CollectionBadge.tsx        (Badge for product cards)
└── CollectionStory.tsx        (Story section component)

public/images/collections/
├── coming-home-banner.png     (Collection banner)
├── coming-home-badge.png      (Collection badge)
└── coming-home-og.png         (Social sharing image)
```

---

## CONTEXT UPDATE REQUIRED

- **Files to update:** MEMORY.md (Coming Home Collection concept, Phase 1-2-3 plan)
- **New decision:** Coming Home Collection approved for Phase 1 planning
- **New open loop:** Legal review for Phase 3, creator terms drafting
- **Agent briefings affected:** None (Sentinel-main continues)

---

*Implementation plan generated by Sentinel — Planning Only, No Code Changes*
