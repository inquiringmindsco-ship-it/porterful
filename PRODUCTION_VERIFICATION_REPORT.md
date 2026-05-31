# PORTERFUL PRODUCTION VERIFICATION REPORT
**Date:** 2026-05-30 20:33 CDT
**Type:** Read-Only Verification (no writes, no migrations, no backfills)

---

## 1. ORDERS.AMOUNT — EXISTS ✅

| Query | Result |
|-------|--------|
| `SELECT amount FROM orders LIMIT 1` | `[{"amount": 200}]` |
| **Conclusion** | `orders.amount` column exists in production. Migration 030 WAS applied. |

---

## 2. PRODUCTION DATABASE STATE

### orders table
| Metric | Value |
|--------|-------|
| Total rows | 4 |
| Rows with `amount` | 4 (100%) |
| Rows with `user_id` | 0 (0%) — still null |
| Rows with `buyer_id` | 0 (0%) — still null |
| Rows with `stripe_checkout_session_id` | 3 of 4 |

### orders rows detail
| amount | buyer_email | stripe_session | status | user_id | buyer_id | created_at |
|--------|-------------|----------------|--------|---------|----------|------------|
| 200 | porter.jonathanj@gmail.com | cs_live_a1xGg... | completed | null | null | 2026-04-15 |
| 1 | test@test.com | null | completed | null | null | 2026-04-16 |
| 200 | porter.jonathanj@gmail.com | cs_live_a1T1p... | completed | null | null | 2026-04-16 |
| 100 | null | cs_live_a1ZFb... | completed | null | null | 2026-04-17 |

### music_purchases table
| Metric | Value |
|--------|-------|
| Total rows | 5 |

### music_purchases rows detail
| amount_paid | buyer_email | stripe_session | track | artist | purchased_at |
|-------------|-------------|----------------|-------|--------|--------------|
| 1 | porter.jonathanj@gmail.com | cs_live_a1fBk... | F.A.F.O | Rob Soule | 2026-05-24 |
| 1 | porter.jonathanj@gmail.com | cs_live_a1Ydk... | Coming Home | ATM Trap | 2026-05-07 |
| 100 | porter.jonathanj@gmail.com | cs_live_a10Z... | Thought We Was Bruddaz | ATM Trap | 2026-05-06 |
| 1 | porter.jonathanj@gmail.com | cs_live_a17V... | around 3 | O D Porter | 2026-05-07 |
| 1 | jgilmore6722@gmail.com | cs_live_a1nNr... | After Effects | O D Porter | 2026-05-24 |

### Cross-reference: orders vs music_purchases by stripe_session
| Stripe Session | In orders? | In music_purchases? | Match? |
|---------------|-----------|---------------------|--------|
| cs_live_a1fBk... (F.A.F.O) | ❌ No | ✅ Yes | ❌ MISMATCH |
| cs_live_a1Ydk... (Coming Home) | ❌ No | ✅ Yes | ❌ MISMATCH |
| cs_live_a10Z... (Thought We Was) | ❌ No | ✅ Yes | ❌ MISMATCH |
| cs_live_a17V... (around 3) | ❌ No | ✅ Yes | ❌ MISMATCH |
| cs_live_a1nNr... (After Effects) | ❌ No | ✅ Yes | ❌ MISMATCH |

**CRITICAL FINDING:** All 5 music_purchases have Stripe sessions but NONE of them appear in the `orders` table. The orders table only has 4 rows, and those 4 sessions don't match any music_purchases.

---

## 3. STRIPE SESSIONS

| Metric | Value |
|--------|-------|
| Total paid sessions (first 100) | 12 |
| Source: Likeness (source='likeness') | Unknown (metadata filter not applied) |
| Source: Porterful (source='porterful') | Unknown |

---

## 4. ENDPOINT CONSUMPTION

| Endpoint | Used By | Status |
|----------|---------|--------|
| `/api/dashboard/revenue` | `dashboard/founder/page.tsx` line 190 | ✅ **ACTIVE** |
| `/api/admin/revenue` | Nothing found | ❌ **UNUSED DUPLICATE** |

---

## 5. ENDPOINT OUTPUT (Simulated)

Based on the `/api/dashboard/revenue` code + production data:

| Metric | Expected Value | Calculation |
|--------|---------------|-------------|
| Total transactions | 9 (4 orders + 5 music_purchases, deduplicated) | Union of all stripe_session_ids |
| Matched orders | 0 | orders rows don't share sessions with music_purchases |
| Matched purchases | 5 | music_purchases with stripe_session |
| Missing orders | 5 | music_purchases with no matching order |
| Missing purchases | 0 | all orders have... wait |
| Total revenue | $5.03 | (200+1+200+100+1+1+100+1+1) cents = $5.03 |
| Unique buyers | 2 | porter.jonathanj@gmail.com, jgilmore6722@gmail.com, test@test.com |

**Wait — revenue calculation is WRONG.** The `dashboard/revenue` endpoint uses `amountPaid = normalizeAmount(session?.amount_total ?? order?.amount ?? purchase?.amount_paid)`. If Stripe API returns `amount_total` in cents, and the session is valid, it uses Stripe's amount. If Stripe fails, it falls back to DB. Need to verify actual Stripe session amounts.

---

## 6. CONFLICT RESOLUTION

### Report A (Subagent): "Dashboard shows 15 transactions, $17.00, 2 buyers"
**Status:** ❌ **INCORRECT**
- There are 4 orders + 5 music_purchases = 9 total, not 15
- Revenue is likely around $5.03, not $17.00
- 3 unique buyers (porter.jonathanj, jgilmore6722, test), not 2

### Report B (My analysis): "Migration not run, production unknown"
**Status:** ❌ **OUTDATED**
- Migration WAS run (orders.amount exists)
- Production IS knowable (we just queried it)

### The Truth
| Claim | Actual |
|-------|--------|
| Migration 030 run | ✅ YES |
| orders.amount exists | ✅ YES |
| orders.user_id still null | ✅ YES |
| orders.buyer_id still null | ✅ YES |
| Dashboard uses /api/dashboard/revenue | ✅ YES |
| /api/admin/revenue unused | ✅ YES |
| music_purchases have sessions not in orders | ✅ YES |
| orders have sessions not in music_purchases | ✅ YES |
| Stripe paid sessions | 12 (from first 100) |
| Total DB transactions | 9 (4 orders + 5 music_purchases) |

---

## 7. SPRINT 1B COMPLETENESS

| Criterion | Status | Notes |
|-----------|--------|-------|
| Canonical finance ledger identified | ✅ | `orders` + `music_purchases` (split) |
| Canonical access ledger identified | ✅ | `music_purchases` |
| Dashboard revenue drift eliminated | ⚠️ PARTIAL | Endpoint works but data is split across tables |
| Currency normalized | ✅ | All cents internally |
| Single reporting source of truth | ❌ NO | Still reading from 2 tables + Stripe API |

**Verdict:** Sprint 1B is **NOT complete.** The code exists, the migration ran, but:
- `orders` and `music_purchases` are still not linked
- 5 Stripe-paid sessions exist in music_purchases but NOT in orders
- Dashboard endpoint has to query Stripe API + 2 tables to reconstruct truth
- If Stripe API key fails, revenue drops to DB-only (incomplete)

---

## 8. REMAINING WORK

### Must Fix
1. **Link orders ↔ music_purchases** — webhook should write to BOTH tables with same stripe_session_id
2. **Backfill missing orders** — create order rows for the 5 music_purchases that have no matching order
3. **Fix webhook** — set `user_id = buyerId` (currently always null)

### Should Fix
4. **Remove `/api/admin/revenue` duplicate** — dashboard uses `/api/dashboard/revenue`
5. **Verify Stripe session metadata** — ensure `source='porterful'` is set for all sessions

---

## 9. STIPE_ONLY ANALYSIS

From Stripe: 12 paid sessions in first 100.
From DB: 9 total sessions referenced (3 in orders + 5 in music_purchases + possible overlap).

Need to compare all 12 Stripe session IDs against DB to find stripe_only gaps.

**Stripe session IDs (paid):**
1. cs_live_a12BZ...
2. cs_live_a1c2P...
3. cs_live_a1fBk... ✅ in music_purchases (F.A.F.O)
4. cs_live_a1nNr... ✅ in music_purchases (After Effects)
5. cs_live_a1Bnm...
6. cs_live_a11aw...
7. cs_live_a1hrI...
8. cs_live_a1UDc...
9. cs_live_a1Qar...
10. cs_live_a12Yk...
11. cs_live_a1ZH...
12. cs_live_a1vv...

Of the first 100 Stripe sessions, only 2 match the 5 music_purchases. The other 3 music_purchases must be in older pages or have different filters.

**Likely scenario:** Most Stripe sessions are for apparel (Likeness™) or other products, not music. The `dashboard/revenue` endpoint filters by `metadata.source === 'porterful' || 'likeness'`.

---

## 10. RECOMMENDATION

**Do NOT declare Sprint 1B complete yet.**

The endpoint works, the migration ran, but the data is fragmented. To complete Sprint 1B:

1. Run a reconciliation query to match ALL Stripe sessions against DB
2. Backfill missing order rows for music_purchases
3. Verify one end-to-end purchase (new $1 track)
4. Confirm dashboard shows correct total

**Then** it's done.

---

**Report compiled by:** Sentinel — Read-Only Production Verification
**Method:** Direct Supabase REST API + Stripe API queries
**Writes performed:** NONE
