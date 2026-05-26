# PORTERFUL BATCH B — AUDIT & PLANNING REPORT
**Date:** May 26, 2026
**Scope:** Route/Legal/Commerce/Dashboard Truth Mapping
**Status:** PLANNING ONLY — No code changes approved
**Rules:** No deploys, no writes, no legal rewrites without approved replacement copy

---

## 1. ROUTE MATRIX

### Confirmed Duplicate / Nested / Legacy Routes

| Route | File Path | What It Does | Linked Anywhere? | Canonical Keep | Recommendation | Risk |
|-------|-----------|-------------|-------------------|----------------|---------------|------|
| `/cart/cart` | `src/app/cart/cart/page.tsx` | Cart page | No direct links found | `/cart` | **Redirect** → `/cart` | Low |
| `/checkout/checkout` | `src/app/checkout/checkout/page.tsx` | Checkout wrapper | No | `/checkout` | **Redirect** → `/checkout` | Low |
| `/checkout/checkout/success` | `src/app/checkout/checkout/success/page.tsx` | Success page | No | `/checkout/success` | **Redirect** → `/checkout/success` | Low |
| `/dashboard/dashboard` | `src/app/(app)/dashboard/dashboard/page.tsx` | Main dashboard | Yes — linked in `PorterfulDashboard.tsx` | `/dashboard` | **Consolidate** → keep `/dashboard/dashboard` as canonical, redirect `/dashboard` | Medium |
| `/dashboard/dashboard/artist` | `src/app/(app)/dashboard/dashboard/artist/page.tsx` | Artist dashboard | Yes | `/dashboard/artist` | **Consolidate** | Medium |
| `/dashboard/dashboard/artist/edit` | `src/app/(app)/dashboard/dashboard/artist/edit/page.tsx` | Artist profile edit | Yes | `/dashboard/artist/edit` | **Consolidate** | Medium |
| `/dashboard/dashboard/artist/edit/track/[id]` | `src/app/(app)/dashboard/dashboard/artist/edit/track/[id]/page.tsx` | Track edit | Yes | `/dashboard/artist/edit/track/[id]` | **Consolidate** | Medium |
| `/dashboard/dashboard/upload` | `src/app/(app)/dashboard/dashboard/upload/page.tsx` | Upload page | Yes | `/dashboard/upload` | **Consolidate** | Medium |
| `/dashboard/dashboard/catalog` | `src/app/(app)/dashboard/dashboard/catalog/page.tsx` | Catalog/browse | Yes | `/dashboard/catalog` | **Consolidate** | Medium |
| `/dashboard/dashboard/earnings` | `src/app/(app)/dashboard/dashboard/earnings/page.tsx` | Earnings view | Yes | `/dashboard/earnings` | **Consolidate** | Medium |
| `/dashboard/dashboard/collaborations` | `src/app/(app)/dashboard/dashboard/collaborations/page.tsx` | Collab management | Yes | `/dashboard/collaborations` | **Consolidate** | Medium |
| `/dashboard/dashboard/submissions` | `src/app/(app)/dashboard/dashboard/submissions/page.tsx` | Submissions | Yes | `/dashboard/submissions` | **Consolidate** | Medium |
| `/dashboard/dashboard/likeness` | `src/app/(app)/dashboard/dashboard/likeness/page.tsx` | Likeness tab | Yes | `/dashboard/likeness` | **Consolidate** | Medium |
| `/dashboard/dashboard/access` | `src/app/(app)/dashboard/dashboard/access/page.tsx` | Access/recovery | Yes | `/dashboard/access` | **Consolidate** | Medium |
| `/dashboard/dashboard/add-product` | `src/app/(app)/dashboard/dashboard/add-product/page.tsx` | Add product | Yes | `/dashboard/add-product` | **Consolidate** | Medium |
| `/dashboard/dashboard/payout` | `src/app/(app)/dashboard/dashboard/payout/page.tsx` | Payout settings | Yes | `/dashboard/payout` | **Consolidate** | Medium |
| `/dashboard/dashboard/artist/products` | `src/app/(app)/dashboard/dashboard/artist/products/page.tsx` | Artist products | Yes | `/dashboard/artist/products` | **Consolidate** | Medium |
| `/dashboard/artist` | `src/app/(app)/dashboard/artist/page.tsx` | Legacy artist dash | Yes — linked in Navbar | `/dashboard/dashboard/artist` | **Redirect** → nested version | Low |
| `/dashboard/upload` | `src/app/(app)/dashboard/upload/page.tsx` | Legacy upload | Yes — linked in Navbar | `/dashboard/dashboard/upload` | **Redirect** → nested version | Low |
| `/dashboard/access` | `src/app/(app)/dashboard/access/page.tsx` | Legacy access | Yes — linked in Navbar | `/dashboard/dashboard/access` | **Redirect** → nested version | Low |
| `/dashboard/likeness` | `src/app/(app)/dashboard/likeness/page.tsx` | Legacy likeness | Yes — linked in Navbar | `/dashboard/dashboard/likeness` | **Redirect** → nested version | Low |
| `/dashboard/add-product` | `src/app/(app)/dashboard/add-product/page.tsx` | Legacy add product | Yes — linked in Navbar | `/dashboard/dashboard/add-product` | **Redirect** → nested version | Low |
| `/dashboard/founder` | `src/app/(app)/dashboard/founder/page.tsx` | Founder dashboard | Yes — linked in Navbar | — | **Keep** | Low |
| `/dashboard/founder/artists` | `src/app/(app)/dashboard/founder/artists/page.tsx` | Founder artist list | Yes | — | **Keep** | Low |
| `/dashboard/admin` | `src/app/(app)/dashboard/admin/page.tsx` | Admin panel | Yes — linked in Navbar | — | **Keep** | Low |
| `/artist/artist/[id]` | `src/app/(app)/artist/artist/[id]/page.tsx` | Artist profile (legacy param format) | Unclear | `/artist/[slug]` | **Redirect** or **Delete** | Medium |
| `/superfan/superfan` | `src/app/(app)/superfan/superfan/page.tsx` | Superfan page duplicate | No | `/superfan` | **Redirect** → `/superfan` | Low |
| `/marketplace/marketplace` | `src/app/(app)/marketplace/marketplace/page.tsx` | Marketplace duplicate | No | `/marketplace` | **Redirect** → `/marketplace` | Low |
| `/digital/digital` | `src/app/(app)/digital/digital/page.tsx` | Digital store duplicate | No | `/digital` | **Redirect** → `/digital` | Low |
| `/support/support` | `src/app/(app)/support/support/page.tsx` | Support duplicate | No | `/support` | **Redirect** → `/support` | Low |
| `/faq/faq` | `src/app/(app)/faq/faq/page.tsx` | FAQ duplicate | No | `/faq` | **Redirect** → `/faq` | Low |
| `/terms/terms` | `src/app/(app)/terms/terms/page.tsx` | Terms duplicate | No | `/terms` | **Redirect** → `/terms` | Low |
| `/privacy/privacy` | `src/app/(app)/privacy/privacy/page.tsx` | Privacy duplicate | No | `/privacy` | **Redirect** → `/privacy` | Low |
| `/settings/settings` | `src/app/(app)/settings/settings/page.tsx` | Settings page | Yes — linked in Navbar | — | **Keep** (only version exists) | Low |
| `/wallet/wallet` | `src/app/(app)/wallet/wallet/page.tsx` | Wallet duplicate | No | `/wallet` | **Redirect** → `/wallet` | Low |
| `/kids-chains` | `src/app/(app)/kids-chains/page.tsx` | Kids chains store | Yes — linked | — | **Keep** | Low |
| `/kids-chains/success` | `src/app/(app)/kids-chains/success/page.tsx` | Kids chains success | Internal redirect | — | **Keep** | Low |
| `/unlock/unlock` | `src/app/(app)/unlock/unlock/page.tsx` | Unlock page duplicate | No | `/unlock` | **Redirect** → `/unlock` | Low |
| `/proud-to-pay` | `src/app/(app)/proud-to-pay/page.tsx` | Pay-what-you-want | Yes | — | **Keep** | Low |
| `/tap-in` | `src/app/(app)/tap-in/page.tsx` | Tap-in page | Yes | — | **Keep** | Low |
| `/tap` | `src/app/(app)/tap/page.tsx` | NFC Tap page | Yes | — | **Keep** | Low |
| `/competition` | `src/app/(app)/competition/page.tsx` | Competition redirect | Yes — in sitemap | `/apply` | **Keep** (307 redirect to /apply) | Low |
| `/challenge` | `src/app/(app)/challenge/page.tsx` | $10K challenge | Yes — in sitemap | — | **Keep** | Low |
| `/apply` | `src/app/(app)/apply/page.tsx` | Artist application | Yes | — | **Keep** | Low |
| `/apply/form` | `src/app/(app)/apply/form/page.tsx` | Application form | Yes | — | **Keep** | Low |
| `/systems` | `src/app/(app)/systems/page.tsx` | Systems landing | Yes | — | **Keep** | Low |
| `/systems/worlds` | `src/app/(app)/systems/worlds/page.tsx` | Worlds subpage | Yes | — | **Keep** | Low |
| `/food` | `src/app/(app)/food/page.tsx` | Food/OUTCHA page | Yes | — | **Keep** | Low |
| `/store` | `src/app/(app)/store/page.tsx` | Store redirect | Yes | `/shop` | **Redirect** → `/shop` | Low |
| `/store/[username]` | `src/app/(app)/store/[username]/page.tsx` | Artist store | Yes | — | **Keep** | Low |
| `/shop` | `src/app/(app)/shop/page.tsx` | Main shop | Yes | — | **Keep** | Low |
| `/offer/[offerId]` | `src/app/offer/[offerId]/page.tsx` | Product offers | Yes | — | **Keep** | Low |
| `/offer/success` | `src/app/offer/success/page.tsx` | Offer success | Internal redirect | — | **Keep** | Low |
| `/checkout` | `src/app/checkout/page.tsx` | Main checkout | Yes | — | **Keep** | Low |
| `/checkout/success` | `src/app/checkout/success/page.tsx` | Checkout success | Internal redirect | — | **Keep** | Low |
| `/checkout/checkout` | `src/app/checkout/checkout/page.tsx` | Checkout duplicate | No | `/checkout` | **Redirect** | Low |
| `/album/[slug]` | `src/app/(app)/album/[slug]/page.tsx` | Album page | Yes | — | **Keep** | Low |
| `/playlist` | `src/app/(app)/playlist/page.tsx` | Playlists | Yes | — | **Keep** | Low |
| `/playlist/[id]` | `src/app/(app)/playlist/[id]/page.tsx` | Playlist detail | Yes | — | **Keep** | Low |
| `/radio` | `src/app/(app)/radio/page.tsx` | Radio | Yes | — | **Keep** | Low |
| `/verify` | `src/app/(app)/verify/page.tsx` | Likeness verification | Yes | — | **Keep** | Low |
| `/learn` | `src/app/(app)/learn/page.tsx` | Learn page | Yes | — | **Keep** | Low |
| `/land` | `src/app/(app)/land/page.tsx` | Landing page | Yes | — | **Keep** | Low |
| `/ecosystem` | `src/app/(app)/ecosystem/page.tsx` | Ecosystem | Yes | — | **Keep** | Low |
| `/products` | `src/app/(app)/products/page.tsx` | Products | Yes | — | **Keep** | Low |
| `/teachyoung-inquiry` | `src/app/(app)/teachyoung-inquiry/page.tsx` | Inquiry form | Yes | — | **Keep** | Low |
| `/onboarding` | `src/app/(app)/onboarding/page.tsx` | Onboarding | Yes | — | **Keep** | Low |
| `/onboard` | `src/app/(app)/onboard/page.tsx` | Onboard alt | Yes | — | **Keep** or consolidate | Low |
| `/onboarding-pdf` | `src/app/(app)/onboarding-pdf/page.tsx` | PDF onboarding | Yes | — | **Keep** | Low |
| `/coming-soon` | `src/app/(app)/coming-soon/page.tsx` | Coming soon | Yes | — | **Keep** | Low |
| `/maintenance` | `src/app/(app)/maintenance/page.tsx` | Maintenance | Yes | — | **Keep** | Low |
| `/moral-policy` | `src/app/(app)/moral-policy/page.tsx` | Moral policy | Yes | — | **Keep** | Low |
| `/forgot-password` | `src/app/(app)/forgot-password/page.tsx` | Password reset | Yes | — | **Keep** | Low |
| `/sitemap.xml` | `src/app/sitemap.ts` | Sitemap | Auto | — | **Keep** | Low |
| `/sitemap` | `src/app/sitemap.ts` | Sitemap route | Auto | — | **Keep** | Low |
| `/manifest.json` | `public/manifest.json` | PWA manifest | Auto | — | **Keep** | Low |
| `/api/*` | Various | API routes | Internal | — | **Keep** | Low |

### Route Summary

**Total routes in sitemap:** 44
**Duplicate/nested routes found:** 15+
**Legacy redirects working:** `/competition` → `/apply` (307)
**Ray Of Sunshine redirect:** `/artist/ray-of-sunshine` → `/artist/melanie-dyson-o2jf` (307) ✅

---

## 2. LEGAL / SUPPORT CLAIMS MATRIX

### Claims Requiring Verification

| Claim | Location | Operationally True? | Evidence | Recommendation | Safer Replacement |
|-------|----------|---------------------|----------|---------------|-------------------|
| "Stripe payouts are not live yet" | `/dashboard/settings` (line 455) | ✅ TRUE — explicitly says NOT live | Code comment: "Honest status: Stripe Connect is not live" | **Keep** | — |
| "Stripe Connect is coming soon" | `/dashboard/settings` (line 462, 472) | ✅ TRUE — says coming soon | Hardcoded copy | **Keep** | — |
| "30-day satisfaction guarantee" | `/offer/[offerId]` (line 123) | ⚠️ PARTIAL — guarantee stated but refund page says "not a guarantee" | Refund page: "a request is not a guarantee of a refund" | **Soften** | "30-day refund request policy" |
| "Instant access after purchase" | `/offer/[offerId]` (line 123) | ✅ TRUE for digital | Download proxy exists | **Keep** | — |
| "Secure payment via Stripe" | `/offer/[offerId]` (line 123) | ✅ TRUE | Stripe checkout active | **Keep** | — |
| "Superfans can earn referral income" | `/press-kit` (line 51), `/faq` (line 13) | ⚠️ PARTIAL — tracking exists, payouts NOT live | Settings page says "not live yet" | **Soften** | "Superfans can track referral activity. Payouts coming with Stripe Connect." |
| "Fans can earn referral income on supported merch" | `/press-kit` (line 100) | ⚠️ PARTIAL — tracking exists, no live payouts | referral_earnings table exists but empty | **Soften** | "Fans can track referral activity. Payouts coming soon." |
| "Regular security audits" | `/privacy/privacy` (line 79) | ❌ UNVERIFIED — no evidence of audits | Listed as privacy practice but no audit schedule in code | **Soften** | "Security-focused architecture with planned audits" |
| "2FA" | Not found in search | ❌ NOT FOUND | Not in codebase | **Do not add** | — |
| "GDPR compliance" | Not found in search | ⚠️ UNVERIFIED — privacy page exists but no explicit GDPR claims | Privacy page exists | **Keep as-is** | — |
| "AES-256 database encryption" | Not found in search | ❌ NOT FOUND | Not in codebase | **Do not add** | — |
| "support@porterful.com" | Found in code | ⚠️ UNKNOWN — email deliverability not verified | Configured in code, but not tested | **Verify** | — |
| "DMCA takedown process" | `/dmca` page exists | ✅ TRUE — page exists with instructions | Static page with instructions | **Keep** | — |
| "Refund policy: different timelines" | `/refund` page | ✅ TRUE — honest language | "not a guarantee of a refund" | **Keep** | — |
| "Merch & music fulfillment done right" | `/demo` page (line 58) | ⚠️ PARTIAL — Printful/Zendrop not configured | API returns "not configured" | **Soften** | "Merch & music fulfillment integrations (Printful, Zendrop) — connect your account" |
| "Integrates with Printful, Zendrop, CJ Dropshipping" | `/faq` (line 12) | ⚠️ PARTIAL — APIs exist but not configured | Returns "not configured" without API keys | **Soften** | "Dropshipping integrations available — connect your Printful, Zendrop, or CJ Dropshipping account" |
| "70% revenue share" | Not found in current code | ❌ NOT FOUND — was in banned list | Not present | **Good — keep absent** | — |
| "Legal ownership" | Not found | ❌ NOT FOUND — was in banned list | Not present | **Good — keep absent** | — |
| "Guaranteed protection/income" | Not found | ❌ NOT FOUND — was in banned list | Not present | **Good — keep absent** | — |

### Legal Page Status

| Page | Status | Notes |
|------|--------|-------|
| `/dmca` | ✅ Live | Has takedown instructions |
| `/refund` | ✅ Live | Honest language, "not a guarantee" |
| `/privacy` | ✅ Live | Lists practices, some unverified |
| `/terms` | ⚠️ Exists | Need to verify content |
| `/moral-policy` | ✅ Live | Exists |

---

## 3. STORE / COMMERCE TRUTH MATRIX

| Component | Status | Evidence | Notes |
|-----------|--------|----------|-------|
| **Store/Shop** | ✅ LIVE | `/shop`, `/store`, `/store/[username]` routes active | Products visible, checkout works |
| **Products** | MIXED | Printful catalog integrated | Some real products, some mock/placeholder |
| **Checkout** | ✅ LIVE | Stripe checkout active | Real payments processing |
| **Stripe** | ✅ LIVE MODE | `sk_live` key confirmed | LIVE (not test mode) |
| **Music purchase** | ✅ LIVE | Download proxy, email delivery | Purchase → download flow works |
| **Music download** | ✅ LIVE | `/api/music/download-proxy` | Signed URLs from Supabase storage |
| **Email delivery** | ⚠️ PARTIAL | Templates exist (`music-email-template.ts`) | Sends download links, but deliverability untested |
| **Merch fulfillment** | ❌ NOT LIVE | Printful API returns "not configured" | No API keys set |
| **Dropship (Printful)** | ❌ NOT LIVE | API returns "not configured" | Needs `PRINTFUL_API_KEY` |
| **Dropship (Zendrop)** | ❌ NOT LIVE | API returns "not configured" | Needs `ZENDROP_API_KEY` |
| **Dropship (CarcamFPV)** | ❌ NOT LIVE | Returns demo mode message | Needs `CARCAMFPV_API_URL` |
| **Referral payouts** | ❌ NOT LIVE | `referral_earnings` table exists but empty | Stripe Connect not live |
| **Superfan earnings** | ❌ NOT LIVE | Tracking exists, no payouts | Waiting on Stripe Connect |
| **Wallet** | ⚠️ DEMO | `/wallet` page says "Demo mode • Feature coming soon" | Not real yet |
| **Kids Chains** | ✅ LIVE | Separate checkout flow, real Stripe payments | Working store |
| **Offers** | ✅ LIVE | `/offer/[offerId]` with Stripe checkout | Real purchases |
| **Digital products** | ✅ LIVE | `/digital` route, real purchases | Working |
| **Catalog** | ✅ LIVE | `/dashboard/catalog` for browsing | Artists can create offers |
| **Payouts to artists** | ❌ NOT LIVE | Settings page explicitly says "not live" | Waiting on Stripe Connect |

### What Should Remain Public

| Feature | Public? | Why |
|---------|---------|-----|
| Store/Shop | ✅ Yes | Live checkout, real products |
| Music streaming | ✅ Yes | Core feature |
| Kids Chains | ✅ Yes | Live store |
| Offers | ✅ Yes | Live checkout |
| Digital products | ✅ Yes | Live purchases |
| Wallet | ⚠️ Label as preview | Demo mode |
| Referral earnings | ⚠️ Label as tracking only | No payouts yet |
| Merch fulfillment | ⚠️ Label as preview | Not configured |
| Dropship integrations | ⚠️ Label as preview | Not configured |
| Printful catalog | ✅ Yes | Browse-only is fine |

---

## 4. DASHBOARD TRUTH MATRIX

### Founder Dashboard (`/dashboard/founder`)

| Feature | Status | Evidence | Notes |
|---------|--------|----------|-------|
| Overview tab | ✅ Built | Line 564: `['overview', 'users', 'music', 'content', 'revenue']` | Active |
| Users tab | ✅ Built | User list with track counts | Shows `track_count`, `live_track_count` |
| Music tab | ✅ Built | Track list, purchases | Shows purchase history |
| Content tab | ✅ Built | — | Active |
| Revenue tab | ✅ Built | Shows metrics | Part of tab array |
| Artist approvals | ✅ Built | — | In users tab |
| Purchase history | ✅ Built | Line 1363: `download_count` tracking | Shows buyer, track, amount |
| Failed uploads | ❌ NOT FOUND | No explicit failed upload tracking | Could add |
| Failed payments | ❌ NOT FOUND | No explicit failed payment tracking | Could add |
| Featured track control | ✅ Built | Line 438: `setSelectedFeaturedTracks` | Founder can set featured tracks |
| Site settings | ✅ Built | `featured_track_ids`, other settings | Saved to `site_settings` table |

### Artist Dashboard (`/dashboard/dashboard/artist`)

| Feature | Status | Evidence | Notes |
|---------|--------|----------|-------|
| Profile edit | ✅ Built | `/dashboard/dashboard/artist/edit` | Full form |
| Track management | ✅ Built | Track list, edit, upload | Full CRUD |
| Upload | ✅ Built | `/dashboard/dashboard/upload` | With progress |
| Earnings view | ✅ Built | `/dashboard/dashboard/earnings` | Shows `$0.00` (no payouts yet) |
| Collaborations | ✅ Built | `/dashboard/dashboard/collaborations` | Revenue split calculator |
| Catalog | ✅ Built | `/dashboard/dashboard/catalog` | Browse products |
| Add product | ✅ Built | `/dashboard/dashboard/add-product` | Create offers |
| Submissions | ✅ Built | `/dashboard/dashboard/submissions` | Track submissions |
| Likeness | ✅ Built | `/dashboard/dashboard/likeness` | Likeness integration |
| Payout settings | ✅ Built | `/dashboard/dashboard/payout` | Form exists, not live |
| Access/recovery | ✅ Built | `/dashboard/dashboard/access` | Music recovery |
| Track count display | ✅ Built | Shows live/total count | `live_track_count/track_count` |

### Admin Dashboard (`/dashboard/admin`)

| Feature | Status | Evidence | Notes |
|---------|--------|----------|-------|
| User management | ✅ Built | `/api/admin/users` route | Full user list |
| Artist profiles | ✅ Built | Part of admin | View/edit |

### Missing Dashboard Features

| Feature | Priority | Why Missing |
|---------|----------|-------------|
| Failed upload retry | Medium | No explicit tracking |
| Failed payment retry | Medium | No explicit tracking |
| Payout history | High | Stripe Connect not live |
| Automated reports | Low | Not built |
| Bulk operations | Low | Not built |

---

## 5. TOP 10 BATCH B FIXES

| Rank | Issue | Risk | User Impact | Files Likely Involved | Codex Review? | Recommended Order |
|------|-------|------|-------------|----------------------|---------------|-------------------|
| 1 | **Duplicate route redirects** — `/cart/cart`, `/checkout/checkout`, etc. | Low | SEO, UX | `vercel.json` or `next.config.mjs` | No | B-1 |
| 2 | **Dashboard route consolidation** — `/dashboard` vs `/dashboard/dashboard/*` | Medium | Navigation confusion | `Navbar.tsx`, route files | Yes | B-2 |
| 3 | **Store page redirect** — `/store` → `/shop` | Low | UX | `vercel.json` | No | B-1 |
| 4 | **Legal claim softening** — "regular security audits", "earn referral income" | Low | Trust, compliance | `privacy/privacy.tsx`, `press-kit.tsx`, `faq.tsx` | Yes | B-1 |
| 5 | **Wallet demo label** — explicitly mark as preview | Low | Trust | `wallet/page.tsx` | No | B-1 |
| 6 | **Merch/dropship preview labels** — mark unconfigured integrations | Low | Trust | `faq.tsx`, `demo/page.tsx` | No | B-1 |
| 7 | **Settings honesty pass** — verify all "coming soon" labels are accurate | Low | Trust | `settings/settings/page.tsx` | No | B-1 |
| 8 | **Sitemap cleanup** — remove duplicate/nested routes if they shouldn't be indexed | Low | SEO | `sitemap.ts` | No | B-1 |
| 9 | **Superfan page redirect** — `/superfan/superfan` → `/superfan` | Low | UX | `vercel.json` | No | B-1 |
| 10 | **Digital page redirect** — `/digital/digital` → `/digital` | Low | UX | `vercel.json` | No | B-1 |

### Not in Top 10 (Higher Risk, Defer)

| Issue | Risk | Why Deferred |
|-------|------|--------------|
| Dashboard deep consolidation (15+ nested routes) | Medium | Requires navigation link updates, more testing |
| Gune artist link fix | Medium | Data investigation needed |
| Founder dashboard new features | Medium | New development, not cleanup |
| Stripe Connect activation | High | External dependency, legal/compliance |
| Merch fulfillment configuration | High | Requires vendor accounts |

---

## 6. PROPOSED BATCH B-1 SCOPE

### Rules
- Small — max 5 changes
- Low-risk — no database writes, no route deletion without redirect
- Trust-improving — honest labels, clear previews
- No broad redesign
- No new features
- No legal rewrite without approved replacement copy
- No route deletion without redirect map

### Approved B-1 Items

1. **Add safe redirects for duplicate routes**
   - `/cart/cart` → `/cart`
   - `/checkout/checkout` → `/checkout`
   - `/checkout/checkout/success` → `/checkout/success`
   - `/superfan/superfan` → `/superfan`
   - `/marketplace/marketplace` → `/marketplace`
   - `/digital/digital` → `/digital`
   - `/support/support` → `/support`
   - `/faq/faq` → `/faq`
   - `/terms/terms` → `/terms`
   - `/privacy/privacy` → `/privacy`
   - `/wallet/wallet` → `/wallet`
   - `/unlock/unlock` → `/unlock`
   - `/artist/artist/[id]` → `/artist/[slug]` (or delete)
   - Method: `vercel.json` redirects (like Ray Of Sunshine)
   - Risk: Low
   - Files: `vercel.json` only

2. **Soft-claim pass on public pages**
   - `"Regular security audits"` → `"Security-focused architecture with planned audits"` (privacy page)
   - `"Superfans can earn referral income"` → `"Superfans can track referral activity. Payouts coming with Stripe Connect."` (press-kit, faq)
   - `"30-day satisfaction guarantee"` → `"30-day refund request policy"` (offer page)
   - Method: Edit copy only, no functional changes
   - Risk: Low
   - Files: `privacy/privacy.tsx`, `press-kit.tsx`, `faq.tsx`, `offer/[offerId]/page.tsx`
   - Requires: Od approval of replacement copy

3. **Preview labels for non-live features**
   - Wallet page already says "Demo mode" — verify this is prominent
   - Merch fulfillment pages — add "Connect your account" language
   - Method: Add/verify labels only
   - Risk: Low
   - Files: `wallet/page.tsx`, `faq.tsx`, `demo/page.tsx`

4. **Store redirect**
   - `/store` → `/shop` (consolidate)
   - Risk: Low
   - File: `vercel.json`

5. **Sitemap accuracy**
   - Remove duplicate/nested routes from sitemap if they shouldn't be indexed
   - Keep canonical routes only
   - Risk: Low
   - File: `sitemap.ts`

### NOT in B-1

- Dashboard route consolidation (too many files, needs navigation updates)
- Gune fix (data investigation)
- New features
- Stripe Connect activation
- Legal page rewrites without approved copy

---

## APPENDIX: File Inventory for Batch B

### Route Files Found
```
src/app/cart/cart/page.tsx
src/app/checkout/checkout/page.tsx
src/app/checkout/checkout/success/page.tsx
src/app/(app)/dashboard/dashboard/*/page.tsx (15 routes)
src/app/(app)/dashboard/[flat-routes]/page.tsx (6 routes)
src/app/(app)/artist/artist/[id]/page.tsx
src/app/(app)/superfan/superfan/page.tsx
src/app/(app)/marketplace/marketplace/page.tsx
src/app/(app)/digital/digital/page.tsx
src/app/(app)/support/support/page.tsx
src/app/(app)/faq/faq/page.tsx
src/app/(app)/terms/terms/page.tsx
src/app/(app)/privacy/privacy/page.tsx
src/app/(app)/wallet/wallet/page.tsx
src/app/(app)/unlock/unlock/page.tsx
```

### Legal/Copy Files
```
src/app/(app)/privacy/privacy/page.tsx
src/app/(app)/press-kit/page.tsx
src/app/(app)/faq/faq/page.tsx
src/app/offer/[offerId]/page.tsx
src/app/(app)/dmca/page.tsx
src/app/(app)/refund/page.tsx
```

### Commerce/Store Files
```
src/app/(app)/store/page.tsx
src/app/(app)/shop/page.tsx
src/app/(app)/kids-chains/page.tsx
src/app/(app)/wallet/page.tsx
src/app/(app)/api/dropship/*/route.ts
src/app/(app)/api/fulfillment/route.ts
```

### Dashboard Files
```
src/app/(app)/dashboard/founder/page.tsx
src/app/(app)/dashboard/dashboard/*/page.tsx
src/app/(app)/dashboard/admin/page.tsx
src/components/Navbar.tsx
src/app/(app)/dashboard/PorterfulDashboard.tsx
```

---

## SUMMARY

**A-3 Status:** ✅ Deployed, verified
**Ray Of Sunshine:** ✅ Redirect live
**Data cleanup:** ✅ Complete
**Next phase:** Batch B-1 planning complete

**Recommended B-1:** 5 safe, low-risk fixes
**Estimated effort:** 2-3 hours
**Estimated risk:** Low
**Codex review needed:** For dashboard consolidation (deferred to B-2)
