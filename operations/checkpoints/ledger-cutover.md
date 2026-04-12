# CUTOVER CHECKPOINT — Signal Ledger Native
**Date:** Apr 11, 2026, 21:30 CDT
**Classification:** ledger-native proven

## Status Summary
The Signal Economics System is now reading and writing live to `signal_actions` only.
`referral_records` is legacy/inert — no live logic touches it.

## What Is Locked True
- ✅ Live writes → `signal_actions`
- ✅ Live reads → `signal_actions`
- ✅ Payout path → `signal_actions` (via `signal_balances`)
- ✅ Verify path → `signal_actions`
- ✅ Dashboard path → `signal_actions`
- ✅ `referral_records` → **LEGACY / DO NOT USE**

## Files Changed During Cutover
*(Track files modified to achieve ledger-native state)*

- `src/lib/payout-context.tsx` — switched from `referral_records` to `signal_actions`
- `src/lib/use-signal-data.ts` — ledger reads from `signal_actions`
- `src/app/(app)/dashboard/dashboard/page.tsx` — earnings from `signal_actions`
- `src/app/(app)/api/payout/verify/route.ts` — verify from `signal_actions`
- *(add others as applicable)*

## Mark Legacy in Code
`referral_records` should be marked with code comments:

```typescript
// LEGACY: referral_records
// DO NOT USE — retained for audit only
// Ledger reads/writes now go through signal_actions
```

## Mark in System Docs
- `MEMORY.md` — mark `referral_records` as legacy
- `SIGNAL_ECONOMICS_CURRENT_STATE.md` — add "ledger-native" badge
- `SIGNAL_ECONOMICS_OPEN_LOOPS.md` — close migration 016 item

## Hard Blockers Still Pending
1. Migration 016 not run — `access_requests` table missing
2. HttpOnly cookie set in middleware — but middleware doesn't protect `/dashboard`
3. Dashboard route has no auth guard (middleware bypassable)
4. Store/success session gap
5. Full E2E human test not done

## Next Priority (per Od's directive)
**1. Auth/Security Hardening** (current focus)
**2. Full-site theme consistency**
**3. Signal Balance / Share-to-Pay user layer**

---

*This checkpoint was created to prevent anyone from accidentally reconnecting live logic to referral_records.*
