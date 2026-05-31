# BATCH B-2 — LEGAL / SUPPORT / EARNINGS / FULFILLMENT CLAIMS REPLACEMENT MATRIX

**Status:** ✅ COMPLETE — Planning only, no edits made
**Date:** 2026-05-26
**Scope:** 10 public-facing claim categories audited
**Risk assessment:** Claims are categorized as TRUE, PARTIAL, UNSUPPORTED, or RISKY

---

## 1. REGULAR SECURITY AUDITS

| Field | Detail |
|-------|--------|
| **Exact current text** | "Regular security audits" |
| **File path** | `src/app/(app)/privacy/privacy/page.tsx` |
| **Line** | 79 |
| **Current truth status** | **UNSUPPORTED** |
| **Why it is risky** | No evidence of regular security audits being performed. Claiming this without actual audit logs creates liability if a breach occurs. Could be used against Porterful in litigation ("you claimed audits but had no record"). |
| **Proposed replacement** | "Industry-standard security practices" or remove the bullet entirely |
| **Safe to approve?** | ✅ YES — Replacement is conservative and truthful |

---

## 2. TWO-FACTOR AUTHENTICATION AVAILABLE

| Field | Detail |
|-------|--------|
| **Exact current text** | None found — 2FA is NOT mentioned anywhere in the codebase |
| **File path** | N/A |
| **Line** | N/A |
| **Current truth status** | **NOT CLAIMED** |
| **Why it is risky** | Not applicable — no claim exists |
| **Proposed replacement** | N/A |
| **Safe to approve?** | ✅ N/A — No action needed |

**Note:** 2FA is not promised anywhere. Good — no false claim to fix.

---

## 3. GDPR COMPLIANCE

| Field | Detail |
|-------|--------|
| **Exact current text** | "We comply with GDPR and other applicable regulations." |
| **File path** | `src/app/(app)/privacy/privacy/page.tsx` |
| **Line** | 154 |
| **Current truth status** | **PARTIAL** |
| **Why it is risky** | GDPR compliance requires specific legal infrastructure (DPO, data processing agreements, user data export/deletion mechanisms). Claiming full GDPR compliance without these mechanisms is risky. The privacy page does not mention a DPO, data retention officer, or specific GDPR rights (right to erasure, data portability, etc.). |
| **Proposed replacement** | "We follow data protection best practices and comply with applicable regulations including GDPR where required. For data access or deletion requests, contact legal@porterful.com." |
| **Safe to approve?** | ✅ YES — Softens claim while staying truthful |

---

## 4. AES-256 DATABASE ENCRYPTION

| Field | Detail |
|-------|--------|
| **Exact current text** | "Encrypted databases (AES-256)" |
| **File path** | `src/app/(app)/privacy/privacy/page.tsx` |
| **Line** | 78 |
| **Current truth status** | **PARTIAL / UNSUPPORTED** |
| **Why it is risky** | Supabase provides encryption-at-rest by default, but this is not AES-256 in the way users understand it (not client-side encryption, not end-to-end). Claiming AES-256 specifically implies a higher security standard than what Supabase free tier provides. If questioned, Porterful cannot prove AES-256 implementation. |
| **Proposed replacement** | "Industry-standard database encryption at rest" |
| **Safe to approve?** | ✅ YES — Accurate without overclaiming |

**Related:** "End-to-end encryption for all data transmission" (line 77) is also **UNSUPPORTED** — Supabase uses TLS/SSL, not end-to-end encryption. Suggest: "TLS encryption for all data transmission" or "HTTPS for all connections".

---

## 5. EARN REFERRAL INCOME / SUPERFAN EARNINGS

| Field | Detail |
|-------|--------|
| **Exact current text (multiple instances)** | See table below |
| **Current truth status** | **RISKY — Mostly unsupported or misleading** |
| **Why it is risky** | Referral tracking exists in webhook code but payouts are NOT live. Superfan dashboard explicitly says "Stripe payouts are not live yet." Yet public pages (press kit, FAQ, superfan signup) claim fans "can earn referral income" and "earn from marketplace purchases." This creates a legal liability — users could sign up expecting earnings that cannot be paid out. |

### All instances found:

| # | Exact Text | File | Line | Status | Replacement |
|---|-----------|------|------|--------|-------------|
| 1 | "Superfans can earn referral income by sharing artists they love when supported products are purchased." | `src/app/(app)/press-kit/page.tsx` | 51 | RISKY | "Superfans can support artists by sharing their favorites. Referral tracking is coming soon." |
| 2 | "Fans can earn referral income on supported merch and marketplace items." | `src/app/(app)/press-kit/page.tsx` | 100 | RISKY | "Fans can support artists by sharing merch and marketplace items. Earnings tracking is coming soon." |
| 3 | "Yes! When your superfans shop marketplace items from other businesses, you can earn a share when supported products are sold." | `src/app/(app)/faq/faq/page.tsx` | 13 | RISKY | "Referral sharing is coming soon. When available, superfans who shop through your links will support your artist." |
| 4 | "I understand that referral earnings are tracked inside my Porterful account as activity is recorded." | `src/app/(app)/signup/superfan/page.tsx` | 267 | PARTIAL | Keep as-is — this is accurate (tracking exists, payout doesn't). |
| 5 | "Superfans to earn referral commissions" | `src/app/(app)/terms/terms/page.tsx` | 32 | RISKY | "Superfans to participate in referral sharing (coming soon)" |
| 6 | "Superfans can earn from referrals" | `src/app/(app)/challenge/page.tsx` | 169 | RISKY | "Superfans can support artists through referrals (earning features coming soon)" |
| 7 | "Referral earnings will appear here once tracking and payout reporting are connected." | `src/app/(app)/settings/settings/page.tsx` | 417 | ✅ TRUE | Already honest — keep |
| 8 | "Stripe payouts are not live yet" / "Honest status: Stripe Connect is not live in this build yet." | `src/app/(app)/settings/settings/page.tsx` | 455-466 | ✅ TRUE | Already honest — keep |

**Proposed blanket replacement for RISKY instances:** Replace "earn" with "support" or add "(coming soon)" to any earnings claim.

**Safe to approve?** | ⚠️ NEEDS REVIEW — Some instances (press-kit, FAQ, terms) are public-facing and create liability. Settings page is already truthful.

---

## 6. 30-DAY SATISFACTION GUARANTEE

| Field | Detail |
|-------|--------|
| **Exact current text** | "30-day satisfaction guarantee" |
| **File path** | `src/app/offer/[offerId]/page.tsx` |
| **Line** | 123 |
| **Current truth status** | **UNSUPPORTED** |
| **Why it is risky** | No refund policy infrastructure exists. The `/refund` page says "Refund requests are reviewed according to the product type, fulfillment status, and applicable platform policies" — which is vague and non-committal. A "30-day satisfaction guarantee" implies unconditional refunds, which is not supported by the current refund process. This creates consumer protection liability. |
| **Proposed replacement** | Remove the bullet entirely OR replace with "Secure checkout via Stripe" |
| **Safe to approve?** | ✅ YES — Either removal or replacement is safe |

---

## 7. PRINTFUL / ZENDROP / LIVE MERCH FULFILLMENT

| Field | Detail |
|-------|--------|
| **Exact current text (multiple instances)** | See table below |
| **Current truth status** | **MIXED — Some true, some misleading** |
| **Why it is risky** | FAQ claims "We integrate with Printful, Zendrop, and CJ Dropshipping" but no Printful API key is configured (per `products.ts` comments: "Printful API key not configured"). This implies live fulfillment integration that does not exist. |

### All instances found:

| # | Exact Text | File | Line | Status | Replacement |
|---|-----------|------|------|--------|-------------|
| 1 | "We integrate with Printful, Zendrop, and CJ Dropshipping. You can also self-fulfill if you prefer." | `src/app/(app)/faq/faq/page.tsx` | 12 | RISKY | "We plan to integrate with Printful, Zendrop, and CJ Dropshipping. Self-fulfillment is available now." |
| 2 | "Merch fulfillment without inventory" | `src/app/(app)/signup/page.tsx` | 24 | RISKY | "Merch tools for artists (fulfillment partners coming soon)" |
| 3 | "Real products from Printful catalog" | `src/app/(app)/trending/page.tsx` | 8 | RISKY | "Products from our catalog" (remove Printful claim) |
| 4 | "Merch drops only when fulfillment is ready" | `src/app/(app)/coming-soon/page.tsx` | 35 | ✅ TRUE | Keep — already cautious |
| 5 | Comment: "Printful API key not configured" | `src/lib/products.ts` | 48 | ✅ TRUE | Internal only — not public |

**Safe to approve?** | ⚠️ NEEDS REVIEW — FAQ and signup claims are public-facing and misleading.

---

## 8. SUPPORT REPLY-TIME PROMISES

| Field | Detail |
|-------|--------|
| **Exact current text (multiple instances)** | See table below |
| **Current truth status** | **UNSUPPORTED** |
| **Why it is risky** | Claims "24-48 hours" and "under 24 hours" response times without any ticketing system, SLA monitoring, or actual support staffing. If a user emails and doesn't get a response in 48 hours, this is a broken promise that damages trust and could be cited in disputes. |

### All instances found:

| # | Exact Text | File | Line | Status | Replacement |
|---|-----------|------|------|--------|-------------|
| 1 | "Our team will review it and get back to you within 24–48 hours." | `src/app/(app)/apply/form/page.tsx` | 183 | RISKY | "Our team will review your application and respond as soon as possible." |
| 2 | "We'll get back to you within 24-48 hours." | `src/app/(app)/contact/page.tsx` | 59 | RISKY | "We'll respond as soon as we can." |
| 3 | "We'll review it and get back to you within 48 hours." | `src/app/(app)/submit/page.tsx` | 119 | RISKY | "We'll review your submission and respond as soon as possible." |
| 4 | "Response time is typically under 24 hours." | `src/app/(app)/faq/faq/page.tsx` | 50 | RISKY | "We aim to respond to all inquiries as quickly as possible." |
| 5 | "We will review it and get back to you within 24–48 hours." | `src/app/(app)/api/artist-application/route.ts` | 201 | RISKY | "We will review your application and respond as soon as possible." |

**Safe to approve?** | ✅ YES — All replacements are safe and more honest |

---

## 9. SUPPORT@PORTERFUL.COM / OUTBOUND SENDER TRUTH

| Field | Detail |
|-------|--------|
| **Exact current text (multiple instances)** | See table below |
| **Current truth status** | **MIXED** |
| **Why it is risky** | `support@porterful.com` is used as the public support email, but the actual email sender is `contact@porterful.com` (via Resend). This mismatch could confuse users. Also, `support@porterful.com` may not actually receive emails if not configured in Resend/Postmark. |

### All instances found:

| # | Email | File | Line | Status | Replacement |
|---|-------|------|------|--------|-------------|
| 1 | `support@porterful.com` | `src/app/(app)/contact/page.tsx` | 18 | ✅ TRUE | Keep — this is the public-facing support email |
| 2 | `support@porterful.com` | `src/app/(app)/faq/faq/page.tsx` | 50 | ✅ TRUE | Keep — public support email |
| 3 | `support@porterful.com` | `src/app/(app)/onboarding-pdf/page.tsx` | 160 | ✅ TRUE | Keep |
| 4 | `contact@porterful.com` (sender) | `src/app/api/contact/route.ts` | 67 | ✅ TRUE | Keep — this is the actual sender |
| 5 | `legal@porterful.com` | `src/app/(app)/terms/terms/page.tsx` | 12-section | ✅ TRUE | Keep — separate legal contact |
| 6 | `demo@porterful.com` | `src/app/(app)/checkout/checkout/success/page.tsx` | 140 | ⚠️ INTERNAL | Demo data — not public claim |

**Note:** The `music-email-template.ts` (line 114) says "Reply to this email or contact support@porterful.com" but the actual sender is likely `contact@porterful.com`. If a user replies to the email, it goes to `contact@porterful.com`, not `support@porterful.com`. This is a **minor inconsistency** but low risk.

**Safe to approve?** | ✅ YES — No changes needed, but consider standardizing on one email address |

---

## 10. STRIPE CONNECT / PAYOUT WORDING

| Field | Detail |
|-------|--------|
| **Exact current text (multiple instances)** | See table below |
| **Current truth status** | **MIXED — Some honest, some misleading** |
| **Why it is risky** | Terms page says "Payouts require a minimum balance of $10" and "pending payouts will be processed within 30 days" but Stripe Connect is NOT live. This implies payouts are functional when they are not. The settings page is already honest ("Stripe payouts are not live yet") but the terms page contradicts this. |

### All instances found:

| # | Exact Text | File | Line | Status | Replacement |
|---|-----------|------|------|--------|-------------|
| 1 | "Payments are processed through Stripe." | `src/app/(app)/terms/terms/page.tsx` | ~7 | ✅ TRUE | Keep — Stripe checkout IS live |
| 2 | "Payouts require a minimum balance of $10." | `src/app/(app)/terms/terms/page.tsx` | ~7 | RISKY | "When payouts become available, a minimum balance may be required." |
| 3 | "any pending payouts will be processed within 30 days." | `src/app/(app)/terms/terms/page.tsx` | 110 | RISKY | "When payout features are live, pending payouts will be processed according to Stripe's schedule." |
| 4 | "Stripe payouts are not live yet" | `src/app/(app)/settings/settings/page.tsx` | 455 | ✅ TRUE | Keep — already honest |
| 5 | "Stripe Connect is not live in this build yet." | `src/app/(app)/settings/settings/page.tsx` | 466 | ✅ TRUE | Keep — already honest |
| 6 | "No payouts yet. Stripe Connect is coming soon." | `src/app/(app)/settings/settings/page.tsx` | 472 | ✅ TRUE | Keep — already honest |
| 7 | "Within 30 days of hitting $10K. Wire, ACH, or platform credit — your choice." | `src/app/(app)/challenge/page.tsx` | 295 | RISKY | "Prize details and delivery method will be confirmed when the challenge is officially launched." |
| 8 | "Ready for payout" (x4) | `src/app/(app)/settings/settings/thresholds/page.tsx` | 100, 132, 164, 196 | RISKY | "Ready for tracking" or "Threshold met" |

**Safe to approve?** | ⚠️ NEEDS REVIEW — Terms page and challenge page claims contradict the honest status in settings.

---

## SUMMARY: SAFE vs. NEEDS REVIEW

### ✅ SAFE TO REPLACE NOW (No legal review needed)

| # | Claim | File(s) | Replacement |
|---|-------|---------|-------------|
| 1 | Regular security audits | `privacy/privacy/page.tsx:79` | "Industry-standard security practices" |
| 2 | End-to-end encryption | `privacy/privacy/page.tsx:77` | "TLS encryption for all connections" |
| 3 | AES-256 databases | `privacy/privacy/page.tsx:78` | "Industry-standard database encryption" |
| 4 | GDPR full compliance | `privacy/privacy/page.tsx:154` | Softened claim (see above) |
| 5 | 30-day satisfaction guarantee | `offer/[offerId]/page.tsx:123` | Remove or replace with "Secure checkout" |
| 6 | 24-48 hour response times (all) | `contact.tsx:59`, `faq.tsx:50`, `apply/form.tsx:183`, `submit.tsx:119`, `artist-application/route.ts:201` | "As soon as possible" variants |
| 7 | Settings page honest wording | `settings/settings/page.tsx` | Already honest — KEEP |

### ⚠️ NEEDS OD OR LEGAL REVIEW BEFORE REPLACING

| # | Claim | File(s) | Risk |
|---|-------|---------|------|
| 1 | "Earn referral income" (press kit, FAQ, terms, challenge) | `press-kit.tsx`, `faq.tsx`, `terms.tsx`, `challenge.tsx` | Changes business model messaging — needs Od approval |
| 2 | Printful/Zendrop integration claims | `faq.tsx:12`, `signup/page.tsx:24`, `trending/page.tsx:8` | Affects artist onboarding messaging |
| 3 | Terms page payout promises | `terms/terms/page.tsx:~7, 110` | Legal document — needs legal review before edits |
| 4 | $10K challenge payout wording | `challenge/page.tsx:295` | Marketing/PR — needs Od approval |
| 5 | Thresholds page "Ready for payout" | `settings/thresholds/page.tsx` | UI text — minor, but should align with honest status |

### ✅ ALREADY TRUTHFUL (No changes needed)

| # | Claim | File(s) |
|---|-------|---------|
| 1 | Stripe checkout is live | `terms/terms/page.tsx`, checkout pages |
| 2 | "Stripe payouts are not live yet" | `settings/settings/page.tsx:455-472` |
| 3 | "Referral earnings will appear once tracking is connected" | `settings/settings/page.tsx:417` |
| 4 | Support email addresses | `contact.tsx`, `faq.tsx`, `terms.tsx` |

---

## RECOMMENDED B-2 EXECUTION ORDER

**Phase 1 (Safe — can approve with "do it"):**
1. Privacy page soft-claim fixes (security audits, AES-256, end-to-end encryption, GDPR)
2. Support response time removals (all 5 instances)
3. 30-day satisfaction guarantee removal

**Phase 2 (Needs Od approval):**
4. Press kit + FAQ + terms referral income rewording
5. Printful/Zendrop integration rewording
6. Terms page payout clause update
7. Challenge page $10K wording update

**Phase 3 (Needs legal review):**
8. Full terms of service review with lawyer
9. Privacy policy review with lawyer

---

## NO-GO ZONES (Do not touch in B-2)

- Dashboard logic (earnings calculations, payout thresholds)
- Stripe webhook logic
- Database schema or data
- Route structure
- Checkout flow
- Auth flow
- New features or pages

---

**Prepared by:** Sentinel
**Reviewed by:** Self-audit (Codex validation recommended before execution)
**Next step:** Od reviews matrix → approves Phase 1 scope → Sentinel executes
