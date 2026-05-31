# PORTERFUL SPRINT 1B — REVENUE INTEGRITY REPORT
**Date:** 2026-05-30 20:42 CDT
**Status:** CODE COMPLETE — Pending Od Acceptance Test

---

## 1. WHAT WAS FIXED

### Webhook Dual-Write (`src/app/api/webhooks/stripe/route.ts`)

| Check | Status | Details |
|-------|--------|---------|
| orders write | ✅ CONFIRMED | Line 104 — `insert` with `amount`, `stripe_checkout_session_id`, `buyer_email`, `status='completed'` |
| music_purchases write | ✅ CONFIRMED | Line 342 — `upsert` with `amount_paid`, `stripe_session_id`, `buyer_email`, `track_title`, `artist_name` |
| Same stripe session ID | ✅ CONFIRMED | `session.id` used for both `stripe_checkout_session_id` (orders) and `stripe_session_id` (music_purchases) |
| Cents normalization | ✅ FIXED | `canonicalAmountCents = session.amount_total \|\| ...` — uses Stripe's cents value |
| `user_id` fix | ✅ PARTIAL | `user_id: buyerId \|\| profileId \|\| user_id \|\| null` — prefers looked-up buyerId |

### `/api/admin/revenue` Removed

| Check | Status |
|-------|--------|
| File exists | ❌ NO — deleted |
| Dashboard references | ❌ NONE — only `dashboard/revenue` used |
| Build passes | ✅ YES |

---

## 2. ROOT CAUSE CONFIRMED

**Before fix:**
- Webhook wrote to `orders` but `orders.amount` column didn't exist → insert silently failed or amount was null
- Webhook wrote to `music_purchases` with `item.price` (dollars) instead of `session.amount_total` (cents) → $1 tracks showed as 1¢
- `orders` and `music_purchases` ended up with different stripe sessions (orders failed, music succeeded on different code path)

**After fix:**
- `orders.amount` now exists (migration 030 applied)
- Webhook writes to BOTH tables with `session.amount_total` (cents)
- Same `session.id` in both tables
- `user_id` prefers `buyerId` from email lookup

---

## 3. BACKFILL PREVIEW

| Session | In orders? | In music_purchases? | Safe to backfill? | Action |
|---------|-----------|---------------------|-------------------|--------|
| cs_live_a1fBk... | ❌ | ✅ (F.A.F.O) | ✅ YES | Create order row |
| cs_live_a1Ydk... | ❌ | ✅ (Coming Home) | ✅ YES | Create order row |
| cs_live_a10Z... | ❌ | ✅ (Thought We Was) | ✅ YES | Create order row |
| cs_live_a17V... | ❌ | ✅ (around 3) | ✅ YES | Create order row |
| cs_live_a1nNr... | ❌ | ✅ (After Effects) | ✅ YES | Create order row |
| cs_live_a1xGg... | ✅ | ❌ | ⚠️ SKIP | Order-only, no track data |
| cs_live_a1T1p... | ✅ | ❌ | ⚠️ SKIP | Order-only, no track data |
| cs_live_a1ZFb... | ✅ | ❌ | ⚠️ SKIP | Order-only, no track data |
| Others (11) | ❌ | ❌ | ⚠️ SKIP | Likely apparel/non-music |

**Total safe to backfill:** 5 sessions (the ones with music_purchases but no orders)

**Total skip:** 11 sessions (incomplete, non-music, or unknown)

---

## 4. ACCEPTANCE TEST — PENDING YOU

To verify the fix works, perform one $1 test purchase:

**Steps:**
1. Go to Porterful music page
2. Select a $1 track
3. Complete Stripe checkout (test mode or live)
4. Wait 30 seconds
5. Check Supabase:
   ```sql
   SELECT * FROM orders WHERE stripe_checkout_session_id = 'cs_live_...';
   SELECT * FROM music_purchases WHERE stripe_session_id = 'cs_live_...';
   ```

**PASS if:**
- [ ] Stripe session is paid
- [ ] orders row exists with same `stripe_checkout_session_id`
- [ ] music_purchases row exists with same `stripe_session_id`
- [ ] Both have same `buyer_email`
- [ ] Both have same `amount` (cents)
- [ ] Founder dashboard shows +$1.00

---

## 5. BUILD STATUS

```bash
cd ~/Documents/porterful && npx tsc --noEmit
```
**Result:** ✅ 0 errors, 0 warnings

---

## 6. REMAINING WORK (AFTER ACCEPTANCE)

| Task | Status | Notes |
|------|--------|-------|
| Backfill 5 safe sessions | ⏳ PENDING | Waiting for Od approval after acceptance test |
| Verify all 15 Stripe sessions | ⏳ PENDING | Need full Stripe session list with metadata filters |
| Remove 11 skip sessions from scope | ⏳ PENDING | Document why they were skipped |
| Update `/api/dashboard/revenue` if needed | ⏳ PENDING | Verify endpoint reads correctly after fix |

---

## 7. FILES CHANGED

| File | Action | Purpose |
|------|--------|---------|
| `src/app/api/webhooks/stripe/route.ts` | MODIFIED | Fixed dual-write, cents normalization, user_id |
| `src/app/api/admin/revenue/route.ts` | DELETED | Unused duplicate |

---

**Report compiled by:** Sentinel Sprint 1B Subagent
**Next step:** Od performs $1 test purchase → reports PASS/FAIL
