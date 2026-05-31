# B-2 Execution Proposal — Porterful Truth Alignment
**Status:** ON HOLD — Awaiting Od review and approval  
**Date:** 2026-05-27  
**Scope:** Exact proposed changes for 61 claims across 18 files  
**No edits made yet. No deploy. No commits.**  

---

## HOW TO USE THIS PROPOSAL

For each claim: Review the current text, proposed replacement, and risk assessment. Reply with:  
- **"Approve"** — green light this change  
- **"Hold"** — pause this change, keep current wording  
- **"Revise"** — suggest different replacement text  
- **"Approve Section A"** — approve all HIGH-RISK public claims at once  
- **"Approve all"** — approve all proposed changes (not recommended without review)  

---

## SECTION A: IMMEDIATE HIGH-RISK PUBLIC CLAIMS

### A1. CHALLENGE PAGE — Prize/Bonus Claims (CRITICAL RISK)

**File:** `src/app/(app)/challenge/page.tsx`  
**Public-facing:** YES  
**Category:** NEEDS OD APPROVAL + LEGAL/ COMPLIANCE CAUTION  

#### A1.1 — Hero Headline
```
Current: "Make $10,000 in Sales. Get $10,000 Cash."
Risk: CRITICAL — Implies guaranteed cash prize. No prize pool funded.
Proposed: "Make $10,000 in Sales. Get Recognized."
Why: Removes cash promise. Keeps aspirational goal.
```

#### A1.2 — Subheadline
```
Current: "Every sale counts... You may qualify for a bonus when you hit $10K in sales."
Risk: HIGH — "qualify for a bonus" is vague but still implies potential cash.
Proposed: "Every sale counts. Artists reaching milestones may be featured in future recognition programs."
Why: Shifts from cash bonus to recognition. Honest about future programs.
```

#### A1.3 — Final CTA Badge
```
Current: "First to $10K wins $10K"
Risk: CRITICAL — Direct cash prize claim.
Proposed: "Hit $10K. Get Recognized."
Why: Removes winner/prize language. Keeps goal.
```

#### A1.4 — "How to Win" Section Header
```
Current: "Here's How Artists Actually Win"
Risk: MEDIUM — "Win" implies prize/competition.
Proposed: "Here's How Artists Reach Their Goals"
Why: Neutral language. Same motivational intent.
```

#### A1.5 — Step 3 Card
```
Current: "Hit $10K, Get Paid"
Risk: CRITICAL — Direct payout promise.
Proposed: "Hit $10K, Get Recognized"
Why: Removes payout claim.
```

#### A1.6 — The Math Section
```
Current: "2,000 × $5 sales can add up fast" + "+ merch on top = easy $10K"
Risk: HIGH — "Easy $10K" implies low effort. Actual effort is significant.
Proposed: "2,000 × $5 sales = $10K" + "+ merch sales help reach the goal"
Why: Removes "easy" framing. Keeps the math.
```

#### A1.7 — The Math Section (Superfan)
```
Current: "500 superfans × 5 × $20 avg = $50K in sales"
Risk: MEDIUM — Theoretical example presented as achievable.
Proposed: "Example: 500 superfans × 5 buyers × $20 avg = potential $50K in sales"
Why: Adds "Example" and "potential" qualifiers.
```

#### A1.8 — The Math Section (Merch)
```
Current: "$100/shirt × 100/mo × 12 mo = $120K/year for an active artist"
Risk: MEDIUM — Presents projection as formula.
Proposed: "Example: $100/shirt × 100/mo × 12 mo = $120K/year potential for active artists"
Why: Adds "Example" and "potential" qualifiers.
```

#### A1.9 — Official Rules — How to Win
```
Current: "First artist to hit $10,000 in cumulative net sales wins the $10,000 bonus."
Risk: CRITICAL — Winner-takes-all language. No prize mechanism.
Proposed: "Artists reaching $10,000 in cumulative net sales may be recognized in future programs."
Why: Removes winner/prize. Adds "may" and "future programs."
```

#### A1.10 — Official Rules — When You Get Paid
```
Current: "Within 30 days of hitting $10K. Wire, ACH, or platform credit — your choice."
Risk: CRITICAL — Specific payout mechanism promised.
Proposed: "Recognition details will be announced when programs are finalized."
Why: Removes payout mechanism entirely.
```

#### A1.11 — Official Rules — Challenge End Date
```
Current: "Ongoing. We close registration with 30 days notice. Prize available until then."
Risk: HIGH — "Prize available" language.
Proposed: "Ongoing. Check dashboard for current status."
Why: Removes prize end-date language.
```

#### A1.12 — Final CTA Button Text
```
Current: "Free to join. Artist-first sales can help you qualify for the $10K bonus."
Risk: HIGH — "qualify for the $10K bonus" still implies cash.
Proposed: "Free to join. Artist-first sales can help you reach recognition milestones."
Why: Replaces bonus with recognition.
```

---

### A2. PRIVACY PAGE — Security Claims (HIGH RISK)

**File:** `src/app/(app)/privacy/privacy/page.tsx`  
**Public-facing:** YES  
**Category:** NEEDS LEGAL / COMPLIANCE CAUTION + OD APPROVAL  

#### A2.1 — End-to-End Encryption
```
Current: "End-to-end encryption for all data transmission"
Line: 77
Risk: HIGH — Cannot verify end-to-end encryption is implemented.
Proposed: "Secure HTTPS connections for data transmission"
Why: HTTPS is verifiable. "End-to-end" implies application-level encryption which may not exist.
```

#### A2.2 — AES-256 Encrypted Databases
```
Current: "Encrypted databases (AES-256)"
Line: 78
Risk: HIGH — Cannot verify database encryption algorithm.
Proposed: "Industry-standard database protection"
Why: Removes specific algorithm claim. Still conveys security intent.
```

#### A2.3 — Regular Security Audits
```
Current: "Regular security audits"
Line: 79
Risk: HIGH — No evidence of regular audits conducted.
Proposed: "Security practices under continuous improvement"
Why: Honest about ongoing effort without claiming formal audits.
```

#### A2.4 — Two-Factor Authentication Available
```
Current: "Two-factor authentication available"
Line: 80
Risk: HIGH — 2FA not built or available in UI.
Proposed: "Two-factor authentication planned for future release"
Why: Truthful about roadmap.
```

---

### A3. PAYOUT PAGE — Withdrawal Claims (HIGH RISK)

**File:** `src/app/(app)/dashboard/dashboard/payout/page.tsx`  
**Public-facing:** NO (dashboard-only, auth-gated)  
**Category:** NEEDS OD APPROVAL  

#### A3.1 — Payout Method Description
```
Current: "Payouts are processed via Stripe direct deposit. Connect your Stripe account in settings to enable withdrawals."
Line: 251
Risk: HIGH — Stripe Connect not live. Settings page says "coming soon."
Proposed: "Payouts will be processed via Stripe direct deposit when Stripe Connect is activated. Currently in development."
Why: Matches settings page honesty. Removes immediate-action implication.
```

#### A3.2 — Automatic 67% Cut
```
Current: "You receive 67% of each sale automatically"
Line: 313
Risk: HIGH — Auto-payout not built.
Proposed: "You are eligible for up to 67% of each sale. Payouts processed when threshold is met."
Why: "Eligible" instead of "receive." "When threshold is met" instead of "automatically."
```

#### A3.3 — Real-Time Balance Updates
```
Current: "Balance updates in real-time as orders complete"
Line: 320
Risk: MEDIUM — Balance updates but not real-time streaming.
Proposed: "Balance updates as orders are processed"
Why: Removes "real-time" absolute.
```

#### A3.4 — Success State Timeline
```
Current: "Expect it to arrive in 2-3 business days"
Line: 214
Risk: HIGH — No payout processing built.
Proposed: "Payout timelines will be confirmed when Stripe Connect is live"
Why: Removes specific timeline.
```

---

## SECTION B: CONTRADICTIONS

### B1. Stripe Connect Contradiction

**Contradiction:** Settings says "Stripe Connect is coming soon" but Payout page says "Connect your Stripe account in settings to enable withdrawals"

**Fix:** Update Payout page (see A3.1 above) to match Settings page honesty.

**Files to change:**  
- `src/app/(app)/dashboard/dashboard/payout/page.tsx` (A3.1)  
- No changes needed to Settings page (already honest)  

---

### B2. Fulfillment Integration Contradiction

**Contradiction:** API returns "Zendrop not configured" / "Printful not configured" but FAQ says "We integrate with Printful, Zendrop, and CJ Dropshipping"

**File:** `src/app/(app)/faq/faq/page.tsx`  
**Public-facing:** YES  
**Category:** SAFE COPY CLEANUP  

#### B2.1 — Dropship FAQ
```
Current: "Yes! We integrate with Printful, Zendrop, and CJ Dropshipping. You can also self-fulfill if you prefer."
Line: 12
Risk: MEDIUM — APIs exist but are not configured/active.
Proposed: "We plan to integrate with Printful, Zendrop, and CJ Dropshipping. Self-fulfillment is available now."
Why: "Plan to integrate" vs "integrate." Honest about current capability.
```

---

## SECTION C: MEDIUM-RISK CLAIMS

### C1. REFERRAL / EARNINGS CLAIMS

**File:** `src/app/(app)/press-kit/page.tsx`  
**Public-facing:** YES  
**Category:** NEEDS OD APPROVAL  

#### C1.1 — Press Kit Referral Income
```
Current: "Superfans can earn referral income by sharing artists they love when supported products are purchased."
Line: 51
Risk: HIGH — "earn referral income" implies active program.
Proposed: "Superfans may earn referral rewards when supported referral programs are active."
Why: "May" instead of "can." "When supported programs are active" instead of "when products purchased."
```

#### C1.2 — Press Kit Referral Income (duplicate)
```
Current: "Fans can earn referral income on supported merch and marketplace items."
Line: 100
Risk: HIGH
Proposed: "Fans may earn referral rewards on supported purchases when programs are active."
```

---

**File:** `src/app/(app)/superfan/page.tsx`  
**Public-facing:** YES  
**Category:** NEEDS OD APPROVAL  

#### C1.3 — Superfan Hero
```
Current: "When people shop through your referral, you can earn rewards too."
Line: 20
Risk: HIGH
Proposed: "When supported programs are active, referral rewards may apply."
```

#### C1.4 — Superfan Monthly Payout
```
Current: "Monthly payout" (Legend tier)
Line: 74
Risk: HIGH — No automated monthly payout exists.
Proposed: "Monthly payout when Stripe Connect is live"
Why: Adds condition.
```

#### C1.5 — Superfan Hero CTA
```
Current: "Earn referral rewards supporting artists you love"
Line: 293
Risk: MEDIUM
Proposed: "Earn referral rewards when supported programs are active"
```

#### C1.6 — Superfan Subhead
```
Current: "Share music. Track referrals. Earn rewards automatically."
Line: 296
Risk: HIGH — "automatically" and "Track referrals" not built.
Proposed: "Share music. Track referrals when supported. Earn rewards when programs are active."
```

#### C1.7 — Superfan Tier Rewards
```
Current: "Higher referral rewards" / "Top referral rewards" (Advocate and Legend tiers)
Lines: 30, 36, 46, 52
Risk: MEDIUM — Tier system not enforced.
Proposed: "Higher referral rewards when the tier system is live" / "Top referral rewards when the tier system is live"
```

---

**File:** `src/app/(app)/playlists/page.tsx`  
**Public-facing:** YES  
**Category:** NEEDS OD APPROVAL  

#### C1.8 — Playlist Referral
```
Current: "Earn referral rewards when someone buys from your playlist."
Line: 271
Risk: HIGH — Referral tracking not live.
Proposed: "Referral rewards may apply when supported programs are live."
```

---

**File:** `src/app/(app)/signup/superfan/page.tsx`  
**Public-facing:** YES  
**Category:** NEEDS OD APPROVAL  

#### C1.9 — Signup Superfan Benefit
```
Current: "Earn on Sales — Referral rewards across merch, marketplace items, and premium support"
Line: 10
Risk: HIGH
Proposed: "Earn rewards when supported referral programs are active"
```

---

### C2. PAYOUT/WITHDRAWAL CLAIMS (Dashboard)

**File:** `src/app/(app)/wallet/page.tsx`  
**Public-facing:** NO (dashboard)  
**Category:** NEEDS OD APPROVAL  

#### C2.1 — Wallet Instant Transfer
```
Current: "Send money to other Porterful users instantly"
Line: 150
Risk: HIGH — Wallet not built.
Proposed: "Send money to other Porterful users when the wallet feature is live"
```

#### C2.2 — Wallet Transfer Description
```
Current: "Transfer funds to friends instantly. Share music together."
Line: 206
Risk: HIGH
Proposed: "Transfer funds to friends when the wallet feature is live. Share music together."
```

---

**File:** `src/app/(app)/settings/settings/thresholds/page.tsx`  
**Public-facing:** NO (dashboard)  
**Category:** NEEDS OD APPROVAL  

#### C2.3 — Auto-Payout Description
```
Current: "When your earnings in each category reach the threshold, they'll automatically be included in the next payout."
Line: 69
Risk: HIGH — Auto-payout not built.
Proposed: "When payouts are live, earnings reaching threshold will be queued for the next processing cycle."
```

#### C2.4 — "Ready for Payout" Badges
```
Current: "Ready for payout" (appears 4x)
Lines: 100, 132, 164, 196
Risk: MEDIUM — UI built but backend not processing.
Proposed: "Ready for payout when Stripe Connect is live"
```

---

### C3. SUPPORT/RESPONSE CLAIMS

**File:** `src/app/(app)/faq/faq/page.tsx`  
**Public-facing:** YES  
**Category:** SAFE COPY CLEANUP  

#### C3.1 — Cash Out FAQ
```
Current: "How do I cash out?" / "Connect your Stripe account and withdraw when eligible. Minimum withdrawal is $10."
Line: 24
Risk: HIGH — Payout system not live.
Proposed: "How do I withdraw earnings?" / "Withdrawals will be available when Stripe Connect is live. Minimum $10."
```

#### C3.2 — Response Time FAQ
```
Current: "Response time is typically under 24 hours"
Line: 46
Risk: MEDIUM — Unverified claim.
Proposed: "We aim to respond to all inquiries promptly"
```

---

**File:** `src/app/(app)/apply/form/page.tsx`  
**Public-facing:** YES  
**Category:** SAFE COPY CLEANUP  

#### C3.3 — Application Response Time
```
Current: "Our team will review it and get back to you within 24–48 hours."
Line: 183
Risk: MEDIUM — Unverified process.
Proposed: "Our team will review applications as soon as possible."
```

---

**File:** `src/app/(app)/submit/page.tsx`  
**Public-facing:** YES  
**Category:** SAFE COPY CLEANUP  

#### C3.4 — Submission Response Time
```
Current: "We'll review it and get back to you within 48 hours."
Line: 119
Risk: MEDIUM — Unverified process.
Proposed: "We'll review submissions as soon as possible."
```

---

### C4. VERIFICATION / LEGAL CLAIMS

**File:** `src/app/(app)/apply/form/page.tsx`  
**Public-facing:** YES  
**Category:** NEEDS LEGAL / COMPLIANCE CAUTION  

#### C4.1 — Prove It's Yours
```
Current: "register your likeness — get your verification badge and prove it's yours"
Line: 676
Risk: HIGH — "Prove" implies legal standing. Likeness provides timestamp, not legal proof.
Proposed: "register your likeness — create a timestamped record of your identity"
```

#### C4.2 — Legal Certificate
```
Current: "Legal certificate (PDF)"
Line: 681
Risk: HIGH — Timestamp PDF is not a legal certificate.
Proposed: "Timestamped record (PDF)"
```

#### C4.3 — C&D Templates
```
Current: "C&D letter templates"
Line: 681
Risk: MEDIUM — Not provided in Likeness.
Proposed: "C&D letter templates planned"
```

#### C4.4 — Evidence Vault
```
Current: "Evidence vault"
Line: 681
Risk: MEDIUM — Not built.
Proposed: "Evidence vault planned"
```

---

**File:** `src/app/(app)/moral-policy/page.tsx`  
**Public-facing:** YES  
**Category:** NEEDS OD APPROVAL  

#### C4.5 — Verified Artists
```
Current: "Every artist is verified. We confirm they're a real person behind the music."
Line: 150
Risk: HIGH — Manual approval, not systematic verification.
Proposed: "Artists are reviewed before being featured."
```

---

### C5. FULFILLMENT CLAIMS

**File:** `src/app/(app)/faq/faq/page.tsx`  
**Public-facing:** YES  
**Category:** SAFE COPY CLEANUP  

#### C5.1 — Worldwide Shipping
```
Current: "Porterful supports worldwide shipping. Buyers see prices in their local currency."
Line: 51
Risk: MEDIUM — Shipping logic exists but not tested internationally.
Proposed: "Shipping available to select regions. International delivery timelines vary."
```

---

### C6. GUARANTEE CLAIMS

**File:** `src/app/offer/[offerId]/page.tsx`  
**Public-facing:** YES  
**Category:** NEEDS OD APPROVAL  

#### C6.1 — Satisfaction Guarantee
```
Current: "30-day satisfaction guarantee"
Line: 123
Risk: HIGH — No refund policy/process built.
Proposed: "Refund requests reviewed case-by-case"
```

#### C6.2 — Instant Access
```
Current: "Instant access after purchase"
Line: 123
Risk: MEDIUM — Digital goods instant, physical not.
Proposed: "Access digital purchases immediately. Physical items ship separately."
```

---

### C7. TERMS CLAIMS

**File:** `src/app/(app)/terms/terms/page.tsx`  
**Public-facing:** YES  
**Category:** NEEDS LEGAL / COMPLIANCE CAUTION  

#### C7.1 — Termination Payouts
```
Current: "Upon termination, any pending payouts will be processed within 30 days."
Line: 110
Risk: MEDIUM — Payout system not live.
Proposed: "Upon termination, any pending payouts will be processed when the payout system is live, within 30 days of activation."
```

---

## SECTION D: LOW-RISK / MINOR ALIGNMENT

### D1. Apply Page Revenue Language

**File:** `src/app/(app)/apply/page.tsx`  
**Public-facing:** YES  
**Category:** SAFE COPY CLEANUP  

#### D1.1 — Keep Your Earnings
```
Current: "Keep your earnings. Set your own prices. Control your revenue."
Line: 9
Risk: LOW — Artists set prices, but payouts not live.
Proposed: "Set your own prices. Control your catalog. Payouts coming soon."
```

#### D1.2 — Revenue Split Description
```
Current: "Every sale is split three ways: artist, platform, and the superfan who brought the buyer."
Line: 154
Risk: MEDIUM — Theory only, not live.
Proposed: "When the referral system is live, sales may be split between artist, platform, and referring superfan."
```

---

### D2. Onboard Page Auto-Earnings

**File:** `src/app/(app)/onboard/page.tsx`  
**Public-facing:** YES (but post-signup)  
**Category:** NEEDS OD APPROVAL  

#### D2.1 — Auto Earnings
```
Current: "Your page earns a share of all platform merch sales automatically."
Line: 269
Risk: HIGH — Auto-commission not built.
Proposed: "Your page may earn from supported platform merch sales when programs are active."
```

---

## SUMMARY BY FILE

| File | Claims | Risk Level | Action |
|------|--------|------------|--------|
| `challenge/page.tsx` | 12 | CRITICAL/HIGH | Section A1 |
| `privacy/privacy/page.tsx` | 4 | HIGH | Section A2 |
| `dashboard/payout/page.tsx` | 4 | HIGH | Section A3 |
| `press-kit/page.tsx` | 2 | HIGH | Section C1 |
| `superfan/page.tsx` | 7 | HIGH/MEDIUM | Section C1 |
| `apply/form/page.tsx` | 6 | MEDIUM | Section C4 |
| `faq/faq/page.tsx` | 5 | MEDIUM | Sections B2, C3, C5 |
| `wallet/page.tsx` | 2 | HIGH | Section C2 |
| `settings/thresholds/page.tsx` | 5 | MEDIUM | Section C2 |
| `offer/[offerId]/page.tsx` | 2 | MEDIUM | Section C6 |
| `terms/terms/page.tsx` | 1 | MEDIUM | Section C7 |
| `playlists/page.tsx` | 1 | HIGH | Section C1 |
| `signup/superfan/page.tsx` | 1 | HIGH | Section C1 |
| `moral-policy/page.tsx` | 1 | HIGH | Section C4 |
| `apply/page.tsx` | 2 | LOW/MEDIUM | Section D1 |
| `onboard/page.tsx` | 1 | HIGH | Section D2 |
| `submit/page.tsx` | 1 | LOW | Section C3 |
| `about/page.tsx` | 0 (meta only) | LOW | No text changes |

---

## APPROVAL CHECKLIST

Reply with:
- [ ] **"Approve Section A"** — All HIGH-RISK public claims (Challenge, Privacy, Payout)
- [ ] **"Approve Section B"** — All contradictions
- [ ] **"Approve Section C"** — All MEDIUM-RISK claims
- [ ] **"Approve Section D"** — All LOW-RISK claims
- [ ] **"Approve all"** — All sections (not recommended without review)
- [ ] **"Hold [section]"** — Pause specific section
- [ ] **"Revise [claim #]"** — Suggest different replacement text

**No edits will be made until you reply.**
