# RLS Hardening Audit Trail — Migration 005
**Date:** 2026-04-15  
**Status:** CONTAINED

## Critical Vulnerability Closed
- **entitlements** anon INSERT was open → anyone could mint free product access
- **FIXED:** RLS enabled, all anon policies dropped, INSERT blocked (42501 on test)

## RLS Enforcement Confirmed (post-migration)
| Table | Anon SELECT | Anon INSERT | Service Role |
|-------|------------|-------------|--------------|
| profiles | `[]` blocked ✅ | N/A (server) | readable ✅ |
| wallets | `[]` blocked ✅ | blocked ✅ | readable ✅ |
| orders | `[]` blocked ✅ | blocked ✅ | readable ✅ |
| entitlements | blocked ✅ | **42501 BLOCKED** ✅ | readable ✅ |
| leads | blocked ✅ | blocked ✅ | readable ✅ |
| disputes | blocked ✅ | blocked ✅ | readable ✅ |
| payments | blocked ✅ | blocked ✅ | readable ✅ |
| referral_earnings | blocked ✅ | blocked ✅ | readable ✅ |

## Key Proof Points
- `entitlements` anon INSERT now returns: `{"code":"42501","message":"new row violates row-level security policy"}`
- Service role bypasses RLS — webhook/admin paths intact
- Offer page, checkout, claim flow all verified functional

## Profiles Caveat
- `profiles_insert_own` absent — if signup creates profiles from browser client, add:
```sql
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
```

## Second Pass Deferred
Public storefront tables (artists, products, tracks, stations, reviews, goals, 
competition_participants, tier_milestones, founding_window, prize_pool) still 
need individual public-read verification before granting USING (true) policies.
