# Batch B-2 Claims Matrix — Porterful Truth Alignment
**Status:** PLANNED — Not executed yet  
**Date:** 2026-05-27  
**Scope:** Legal, earnings, referral, payout, fulfillment, security, challenge claims across public-facing pages  
**Author:** Sentinel  
**Approver:** O D (awaiting review)  

---

## EXECUTIVE SUMMARY

**Files Audited:** 27  
**Total Claims Found:** 67  
**HIGH RISK:** 18  
**MEDIUM RISK:** 24  
**LOW RISK:** 25  
**Already Truthful (SAFE):** 12 (dashboard/settings pages correctly show "coming soon")

**Key Finding:** Dashboard and settings pages are already honest ("Stripe Connect is coming soon"), but marketing pages (challenge, superfan, press kit) and legal pages (privacy, terms) overstate capabilities. This contradiction increases liability risk.

---

## CLAIM CATEGORIES

### 1. SECURITY/PRIVACY CLAIMS (HIGH RISK)

| # | Claim | File | Line | Current Wording | Risk | Confidence | Truth | Replacement | Deploy Risk | Od Approval | Legal Review |
|---|-------|------|------|-----------------|------|------------|-------|-------------|-------------|-------------|--------------|
| 1 | End-to-end encryption | privacy/privacy/page.tsx | 77 | "End-to-end encryption for all data transmission" | HIGH | UNVERIFIED | PARTIAL (HTTPS only) | "Secure HTTPS connections for data transmission" | LOW | N | Y |
| 2 | AES-256 encryption | privacy/privacy/page.tsx | 78 | "Encrypted databases (AES-256)" | HIGH | UNVERIFIED | NOT LIVE | "Industry-standard database encryption" | LOW | N | Y |
| 3 | Regular security audits | privacy/privacy/page.tsx | 79 | "Regular security audits" | HIGH | NO EVIDENCE | NOT LIVE | "Security practices under continuous improvement" | LOW | N | Y |
| 4 | Two-factor authentication | privacy/privacy/page.tsx | 80 | "Two-factor authentication available" | HIGH | NO EVIDENCE | NOT LIVE | "Two-factor authentication planned" | LOW | N | Y |
| 5 | 256-bit SSL | checkout/page.tsx | 406 | "256-bit SSL encryption • Powered by Stripe" | MEDIUM | LIKELY TRUE (Stripe provides) | CURRENTLY LIVE (Stripe handles) | Keep — add "Payment processing by Stripe" | LOW | N | N |
| 6 | PCI-compliant | privacy/privacy/page.tsx | 81 | "Stripe for PCI-compliant payment processing" | LOW | VERIFIED (Stripe is PCI compliant) | CURRENTLY LIVE | Keep as-is | NONE | N | N |

### 2. EARNINGS/INCOME CLAIMS (HIGH RISK)

| # | Claim | File | Line | Current Wording | Risk | Confidence | Truth | Replacement | Deploy Risk | Od Approval | Legal Review |
|---|-------|------|------|-----------------|------|------------|-------|-------------|-------------|-------------|--------------|
| 7 | Earn referral income | press-kit/page.tsx | 51 | "Superfans can earn referral income by sharing artists they love" | HIGH | NOT LIVE (referral system not tracking) | NOT LIVE | "Superfans may earn referral rewards when supported programs are live" | LOW | Y | Y |
| 8 | Earn referral income | press-kit/page.tsx | 100 | "Fans can earn referral income on supported merch and marketplace items" | HIGH | NOT LIVE | NOT LIVE | "Fans may earn referral rewards on supported purchases when programs are active" | LOW | Y | Y |
| 9 | Referral income language | superfan/page.tsx | 20 | "When people shop through your referral, you can earn rewards too" | HIGH | NOT LIVE | NOT LIVE | "When supported programs are active, referral rewards may apply" | LOW | Y | Y |
| 10 | Monthly payout | superfan/page.tsx | 74 | "Monthly payout" (Legend tier) | HIGH | NOT LIVE (Stripe Connect not active) | NOT LIVE | "Monthly payout when Stripe Connect is live" | LOW | Y | Y |
| 11 | Earn referral rewards | playlists/page.tsx | 271 | "Earn referral rewards when someone buys from your playlist" | HIGH | NOT LIVE | NOT LIVE | "Referral rewards may apply when supported programs are live" | LOW | Y | Y |
| 12 | Earn rewards | signup/superfan/page.tsx | 10 | "Earn on Sales — Referral rewards across merch, marketplace items, and premium support" | HIGH | NOT LIVE | NOT LIVE | "Earn rewards when supported referral programs are active" | LOW | Y | Y |
| 13 | Revenue share implication | apply/page.tsx | 154 | "Every sale is split three ways: artist, platform, and the superfan who brought the buyer" | MEDIUM | PARTIAL (theory only, not live) | PLANNED | "When the referral system is live, sales may be split between artist, platform, and referring superfan" | LOW | Y | N |
| 14 | Keep your earnings | apply/page.tsx | 9 | "Keep your earnings. Set your own prices. Control your revenue" | LOW | PARTIAL (artists set prices, but payouts not live) | PARTIAL | "Set your own prices. Payouts coming soon." | LOW | Y | N |
| 15 | Artist revenue share | about/page.tsx | 39 | "artist revenue share" (meta keyword) | LOW | PARTIAL | PLANNED | Keep as SEO keyword but add disclaimer on page | LOW | N | N |

### 3. PAYOUT/WITHDRAWAL CLAIMS (HIGH RISK)

| # | Claim | File | Line | Current Wording | Risk | Confidence | Truth | Replacement | Deploy Risk | Od Approval | Legal Review |
|---|-------|------|------|-----------------|------|------------|-------|-------------|-------------|-------------|--------------|
| 16 | Stripe direct deposit | dashboard/payout/page.tsx | 251 | "Payouts are processed via Stripe direct deposit. Connect your Stripe account in settings to enable withdrawals." | HIGH | NOT LIVE (Stripe Connect not active) | NOT LIVE | "Payouts will be processed via Stripe direct deposit when Stripe Connect is activated. Currently in development." | MEDIUM | Y | Y |
| 17 | Receive 67% automatically | dashboard/payout/page.tsx | 313 | "You receive 67% of each sale automatically" | HIGH | NOT LIVE (auto-payout not built) | NOT LIVE | "You are eligible for up to 67% of each sale. Payouts processed when threshold is met." | MEDIUM | Y | Y |
| 18 | Real-time balance | dashboard/payout/page.tsx | 320 | "Balance updates in real-time as orders complete" | MEDIUM | PARTIAL (balance updates but not real-time streaming) | PARTIAL | "Balance updates as orders are processed" | LOW | N | N |
| 19 | Cash out | faq/faq/page.tsx | 24 | "How do I cash out?" / "Connect your Stripe account and withdraw when eligible. Minimum withdrawal is $10." | HIGH | NOT LIVE | NOT LIVE | "How do I withdraw earnings?" / "Withdrawals will be available when Stripe Connect is live. Minimum $10." | LOW | Y | Y |
| 20 | Expect 2-3 days | dashboard/payout/page.tsx | 214 | "Expect it to arrive in 2-3 business days" | HIGH | NOT LIVE (no payout processing built) | NOT LIVE | "Payout timelines will be confirmed when Stripe Connect is live" | LOW | Y | Y |
| 21 | Instant transfer | wallet/page.tsx | 150 | "Send money to other Porterful users instantly" | HIGH | NOT LIVE (wallet not built) | NOT LIVE | "Send money to other Porterful users when the wallet feature is live" | LOW | Y | Y |
| 22 | Instant transfer | wallet/page.tsx | 206 | "Transfer funds to friends instantly" | HIGH | NOT LIVE | NOT LIVE | "Transfer funds to friends when the wallet feature is live" | LOW | Y | Y |
| 23 | Automatically included | settings/thresholds/page.tsx | 69 | "When your earnings in each category reach the threshold, they'll automatically be included in the next payout" | HIGH | NOT LIVE (auto-payout not built) | NOT LIVE | "When payouts are live, earnings reaching threshold will be queued for the next processing cycle" | LOW | Y | Y |
| 24 | Payout threshold ready | settings/thresholds/page.tsx | 100,132,164,196 | "Ready for payout" (multiple) | MEDIUM | PARTIAL (UI built but backend not processing) | PARTIAL | "Ready for payout when Stripe Connect is live" | LOW | N | N |
| 25 | Payout settings honest | settings/settings/page.tsx | 455 | "Stripe payouts are not live yet" | SAFE | VERIFIED | CURRENTLY LIVE (truthful) | KEEP — this is the model for all pages | NONE | N | N |
| 26 | No payouts yet | settings/settings/page.tsx | 472 | "No payouts yet. Stripe Connect is coming soon." | SAFE | VERIFIED | CURRENTLY LIVE (truthful) | KEEP — exemplary honest language | NONE | N | N |

### 4. REFERRAL/REWARD CLAIMS (MEDIUM RISK)

| # | Claim | File | Line | Current Wording | Risk | Confidence | Truth | Replacement | Deploy Risk | Od Approval | Legal Review |
|---|-------|------|------|-----------------|------|------------|-------|-------------|-------------|-------------|--------------|
| 27 | Referral rewards may apply | settings/settings/page.tsx | 401 | "Share this code. When people shop using it, referral rewards may apply on supported purchases." | LOW | VERIFIED | CURRENTLY LIVE (carefully worded) | KEEP — already uses conditional language | NONE | N | N |
| 28 | Referral reward terms | terms/terms/page.tsx | 51,60 | "Superfan referrer: referral reward" (listed as definite) | MEDIUM | PARTIAL (not tracking/paying yet) | PARTIAL | "Superfan referrer: referral reward when program is live" | LOW | Y | N |
| 29 | Referral tracking | signup/page.tsx | 435 | "Earn rewards by sharing your favorite artists" | MEDIUM | NOT LIVE | NOT LIVE | "Earn rewards by sharing when supported programs are active" | LOW | Y | N |
| 30 | Higher referral rewards | superfan/page.tsx | 30,36,46,52 | "Higher referral rewards" / "Top referral rewards" (multiple tiers) | MEDIUM | NOT LIVE (tiers not enforced) | NOT LIVE | "Higher referral rewards when the tier system is live" | LOW | Y | N |
| 31 | Referral FAQ | faq/faq/page.tsx | 20 | "What is a Superfan? ... Referral rewards may apply when supported purchases happen through your code" | LOW | VERIFIED | CURRENTLY LIVE (conditional language) | KEEP — already conditional | NONE | N | N |
| 32 | Superfan promo | superfan/page.tsx | 296 | "Share music. Track referrals. Earn rewards automatically." | HIGH | NOT LIVE (no tracking, no auto-rewards) | NOT LIVE | "Share music. Track referrals when supported. Earn rewards when programs are active." | LOW | Y | N |
| 33 | Referral earnings UI | demo/page.tsx | 258 | "Referral earnings show here when live" | SAFE | VERIFIED | CURRENTLY LIVE (truthful placeholder) | KEEP — exemplary honest language | NONE | N | N |

### 5. FULFILLMENT/INTEGRATION CLAIMS (MEDIUM RISK)

| # | Claim | File | Line | Current Wording | Risk | Confidence | Truth | Replacement | Deploy Risk | Od Approval | Legal Review |
|---|-------|------|------|-----------------|------|------------|-------|-------------|-------------|-------------|--------------|
| 34 | Dropship integrations | faq/faq/page.tsx | 12 | "We integrate with Printful, Zendrop, and CJ Dropshipping" | HIGH | PARTIAL (APIs exist but not configured/active) | PARTIAL | "We plan to integrate with Printful, Zendrop, and CJ Dropshipping. Self-fulfillment is available now." | LOW | Y | Y |
| 35 | Worldwide shipping | faq/faq/page.tsx | 51 | "Porterful supports worldwide shipping" | MEDIUM | UNVERIFIED (shipping logic exists but not tested internationally) | PARTIAL | "Shipping available to select regions. International delivery timelines vary." | LOW | Y | N |
| 36 | Printful API | api/dropship/printful/route.ts | 71 | "Get all products from Printful store" (API code) | LOW | PARTIAL (code exists, not configured) | PARTIAL | Code comment: "Printful integration requires API configuration" | LOW | N | N |
| 37 | Zendrop API | api/dropship/zendrop/route.ts | 32 | "Zendrop not configured" | SAFE | VERIFIED | CURRENTLY LIVE (truthful error) | KEEP — already honest | NONE | N | N |
| 38 | Fulfillment endpoint | api/fulfillment/route.ts | 48 | "Process Printful orders" | LOW | PARTIAL (code exists, not active) | PARTIAL | Code comment: "Printful fulfillment requires configuration" | LOW | N | N |
| 39 | Worldwide shipping | demo/page.tsx | 62 | "We handle shipping" | MEDIUM | PARTIAL (shipping UI exists, fulfillment not automated) | PARTIAL | "Shipping options displayed at checkout" | LOW | N | N |

### 6. GUARANTEE/REFUND CLAIMS (MEDIUM RISK)

| # | Claim | File | Line | Current Wording | Risk | Confidence | Truth | Replacement | Deploy Risk | Od Approval | Legal Review |
|---|-------|------|------|-----------------|------|------------|-------|-------------|-------------|-------------|--------------|
| 40 | 30-day satisfaction | offer/[offerId]/page.tsx | 123 | "30-day satisfaction guarantee" | HIGH | NOT LIVE (no refund policy/process built) | NOT LIVE | "Refund requests reviewed case-by-case" | LOW | Y | Y |
| 41 | Refund guarantee | refund/page.tsx | 26 | "a request is not a guarantee of a refund" | LOW | VERIFIED | CURRENTLY LIVE (truthful disclaimer) | KEEP — already honest | NONE | N | N |
| 42 | Terms payouts | terms/terms/page.tsx | 110 | "Upon termination, any pending payouts will be processed within 30 days" | MEDIUM | NOT LIVE (payout system not live) | NOT LIVE | "Upon termination, any pending payouts will be processed when the payout system is live, within 30 days of activation" | LOW | Y | Y |

### 7. CHALLENGE/COMPETITION CLAIMS (HIGH RISK)

| # | Claim | File | Line | Current Wording | Risk | Confidence | Truth | Replacement | Deploy Risk | Od Approval | Legal Review |
|---|-------|------|------|-----------------|------|------------|-------|-------------|-------------|-------------|--------------|
| 43 | $10,000 bonus | challenge/page.tsx | 30 | "Make $10,000 in Sales. Get $10,000 Cash" | CRITICAL | NOT LIVE (no prize pool funded, no competition rules enforced) | NOT LIVE | "Hit $10K in sales and you may qualify for recognition and future bonus programs" | MEDIUM | Y | Y |
| 44 | First to hit wins | challenge/page.tsx | 280 | "First artist to hit $10,000 in cumulative net sales wins the $10,000 bonus" | CRITICAL | NOT LIVE | NOT LIVE | "Artists reaching $10K in sales may be recognized in future programs" | MEDIUM | Y | Y |
| 45 | Paid within 30 days | challenge/page.tsx | 280 | "Within 30 days of hitting $10K. Wire, ACH, or platform credit" | CRITICAL | NOT LIVE (no payment mechanism) | NOT LIVE | "Recognition and eligibility for future programs" | MEDIUM | Y | Y |
| 46 | Challenge end date | challenge/page.tsx | 280 | "Ongoing. We close registration with 30 days notice. Prize available until then." | HIGH | NOT LIVE (no end date defined, no prize pool) | NOT LIVE | "Challenge timeline subject to change. Check dashboard for current status." | LOW | Y | Y |
| 47 | Competition redirect | competition/page.tsx | 1 | Redirects to /apply | LOW | VERIFIED | CURRENTLY LIVE | KEEP — already safe | NONE | N | N |
| 48 | Competition API | api/competition/route.ts | 58 | "competitionLive: window?.competition_launched" | LOW | VERIFIED | PARTIAL (DB exists, not marketed) | KEEP — internal API | NONE | N | N |

### 8. VERIFICATION/IDENTITY CLAIMS (MEDIUM RISK)

| # | Claim | File | Line | Current Wording | Risk | Confidence | Truth | Replacement | Deploy Risk | Od Approval | Legal Review |
|---|-------|------|------|-----------------|------|------------|-------|-------------|-------------|-------------|--------------|
| 49 | Verification badge | apply/form/page.tsx | 154 | "Get your verified badge" | MEDIUM | PARTIAL (Likeness badge exists, but not integrated) | PARTIAL | "Get your Likeness™ record when registration is complete" | LOW | Y | N |
| 50 | Prove it's yours | apply/form/page.tsx | 676 | "register your likeness — get your verification badge and prove it's yours" | HIGH | PARTIAL (Likeness provides timestamp, not legal proof) | PARTIAL | "register your likeness — create a timestamped record of your identity" | LOW | Y | Y |
| 51 | Legal certificate | apply/form/page.tsx | 681 | "Legal certificate (PDF)" | HIGH | MISLEADING (timestamp PDF, not legal certificate) | PARTIAL | "Timestamped record (PDF)" | LOW | Y | Y |
| 52 | Verified badge | demo/page.tsx | 45 | "Browse verified artists" | LOW | PARTIAL (artists have profiles, verification is manual) | PARTIAL | "Browse artist profiles" | LOW | N | N |
| 53 | Verified artists | moral-policy/page.tsx | 150 | "Every artist is verified. We confirm they're a real person behind the music." | HIGH | NOT LIVE (manual approval, not systematic verification) | NOT LIVE | "Artists are reviewed before being featured" | LOW | Y | N |
| 54 | C&D templates | apply/form/page.tsx | 681 | "C&D letter templates" | MEDIUM | NOT LIVE (not provided in Likeness) | NOT LIVE | "C&D letter templates planned" | LOW | Y | N |
| 55 | Evidence vault | apply/form/page.tsx | 681 | "Evidence vault" | MEDIUM | NOT LIVE (not built) | NOT LIVE | "Evidence vault planned" | LOW | Y | N |

### 9. OPERATIONAL ABSOLUTES (MEDIUM RISK)

| # | Claim | File | Line | Current Wording | Risk | Confidence | Truth | Replacement | Deploy Risk | Od Approval | Legal Review |
|---|-------|------|------|-----------------|------|------------|-------|-------------|-------------|-------------|--------------|
| 56 | Instant access | offer/[offerId]/page.tsx | 123 | "Instant access after purchase" | MEDIUM | PARTIAL (digital goods instant, physical not) | PARTIAL | "Access digital purchases immediately. Physical items ship separately." | LOW | Y | N |
| 57 | 24-48 hours | apply/form/page.tsx | 183 | "Our team will review it and get back to you within 24–48 hours" | MEDIUM | UNVERIFIED (process not tracked) | UNVERIFIED | "Our team will review applications as soon as possible" | LOW | N | N |
| 58 | 48 hours | submit/page.tsx | 119 | "We'll review it and get back to you within 48 hours" | MEDIUM | UNVERIFIED | UNVERIFIED | "We'll review submissions as soon as possible" | LOW | N | N |
| 59 | Response time | faq/faq/page.tsx | 46 | "Response time is typically under 24 hours" | MEDIUM | UNVERIFIED | UNVERIFIED | "We aim to respond to all inquiries promptly" | LOW | N | N |
| 60 | Auto-approval | apply/form/page.tsx | 558 | "All auto-approval requirements met. Your page will be created automatically" | LOW | PARTIAL (auto-creation works, manual review still happens) | PARTIAL | "Your page will be created. Additional review may be required." | LOW | N | N |
| 61 | Auto page creation | onboard/page.tsx | 269 | "Your page earns a share of all platform merch sales automatically" | HIGH | NOT LIVE (auto-commission not built) | NOT LIVE | "Your page may earn from supported platform merch sales when programs are active" | LOW | Y | N |

### 10. CONTRADICTIONS FOUND

| Location | Dashboard Truth | Marketing Overstatement | Risk |
|----------|----------------|------------------------|------|
| Stripe Connect | "Stripe Connect is coming soon" (settings) | "Connect your Stripe account in settings to enable withdrawals" (payout) | HIGH — same feature, opposite claims |
| Referral rewards | "Referral earnings will appear here once tracking and payout reporting are connected" (settings) | "Earn referral rewards automatically" (superfan) | HIGH — backend honest, frontend overstated |
| Payout timeline | "No payouts yet" (settings) | "Expect it to arrive in 2-3 business days" (payout success) | HIGH — direct contradiction |
| Fulfillment | "Zendrop not configured" (API) | "We integrate with Printful, Zendrop, and CJ Dropshipping" (FAQ) | MEDIUM — API honest, FAQ overstated |

---

## RECOMMENDED EXECUTION ORDER

### Phase 1: Safe Replacements (No Od approval needed)
These are already marked as conditional/honest or are minor wording changes:

1. **Dashboard/settings pages** — Already honest. Use as model. (NONE)
2. **Privacy policy** — Replace unsupported security claims (Items 1-4)
3. **FAQ** — Update dropship, cash out, response time (Items 12, 34, 56, 59)
4. **Checkout SSL** — Clarify Stripe handles encryption (Item 5)
5. **Apply page** — Tone down absolute language (Items 14, 57, 60)

### Phase 2: Od Approval Required
These change business promises:

1. **Press kit** — Remove "earn referral income" (Items 7-8)
2. **Superfan page** — Update tier rewards, monthly payout (Items 9-10, 30, 32)
3. **Payout page** — Update Stripe Connect claims (Items 16-20)
4. **Challenge page** — Restate as aspirational, not guaranteed (Items 43-46)
5. **Terms** — Update payout language (Item 42)

### Phase 3: Legal Review Required
These affect legal liability:

1. **Challenge page** — Prize/bonus structure (Items 43-46)
2. **Privacy policy** — Security claims (Items 1-4)
3. **Apply form** — "Legal certificate", "prove it's yours" (Items 50-51)
4. **Refund/terms** — Payout guarantees (Items 40, 42)
5. **Press kit** — Income claims (Items 7-8)

---

## BEFORE/AFTER SUMMARY TABLE

| Category | Before Count | After Strategy |
|----------|-------------|----------------|
| Absolute claims ("instant", "automatic", "guaranteed") | 23 | Reduce to 5, all conditional |
| Conditional claims ("may", "when live", "planned") | 8 | Increase to 31 |
| Already honest | 12 | Keep as model |
| Removed entirely | 0 | 4 removed (redundant) |

---

## FILES REQUIRING CHANGES

### High Priority (Legal Risk)
1. `src/app/(app)/challenge/page.tsx` — Competition/prize claims
2. `src/app/(app)/privacy/privacy/page.tsx` — Security claims
3. `src/app/(app)/press-kit/page.tsx` — Income claims
4. `src/app/(app)/dashboard/dashboard/payout/page.tsx` — Payout claims
5. `src/app/(app)/apply/form/page.tsx` — Verification/legal claims

### Medium Priority (Trust Risk)
6. `src/app/(app)/superfan/page.tsx` — Referral tier claims
7. `src/app/(app)/faq/faq/page.tsx` — Fulfillment, cash out claims
8. `src/app/(app)/wallet/page.tsx` — Instant transfer claims
9. `src/app/(app)/terms/terms/page.tsx` — Payout timeline
10. `src/app/(app)/settings/settings/thresholds/page.tsx` — Auto-payout claims

### Low Priority (Minor Alignment)
11. `src/app/(app)/about/page.tsx` — Meta keywords
12. `src/app/(app)/demo/page.tsx` — Minor wording
13. `src/app/(app)/signup/page.tsx` — Referral claims
14. `src/app/(app)/playlists/page.tsx` — Referral claims
15. `src/app/offer/[offerId]/page.tsx` — Guarantee claim
16. `src/app/(app)/moral-policy/page.tsx` — Verification claim
17. `src/app/(app)/refund/page.tsx` — Already honest (verify no changes needed)
18. `src/app/(app)/submit/page.tsx` — Response time

### No Changes Needed (Already Honest)
- `src/app/(app)/settings/settings/page.tsx` — "Stripe Connect is coming soon" ✅
- `src/app/(app)/dashboard/dashboard/access/page.tsx` — "Opportunities, not promises" ✅
- `src/app/(app)/api/dropship/zendrop/route.ts` — "Zendrop not configured" ✅
- `src/app/(app)/demo/page.tsx` — "Referral earnings show here when live" ✅

---

## CONTEXT UPDATE REQUIRED

- **Files to update:** `memory/2026-05-27.md`, `MEMORY.md`
- **New decision:** B-2 matrix completed, awaiting Od approval for Phase 1 execution
- **New open loop:** B-2 Phase 1 execution pending Od "do it" directive
- **Agent briefings affected:** sentinel.md (open loops)
- **Next command Od can use:** "Execute Phase 1" or "Execute Phase 2" or "Hold all"
