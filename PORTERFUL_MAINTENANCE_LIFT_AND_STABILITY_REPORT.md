# PORTERFUL_MAINTENANCE_LIFT_AND_STABILITY_REPORT

**Mission:** M-20260615-1 — Porterful Upload-Day Stabilization + Media Pass
**Phase:** Pre-Phase-1 (probe only, no deploy)
**Date:** 2026-06-15 04:45 CDT
**Author:** Sentinel
**Status:** ⏸ **AWAITING OD "deploy" KEYWORD** — Supabase confirmed healthy, maintenance flag not yet lifted

---

## TL;DR

- ✅ **Supabase is healthy.** REST + auth endpoints respond, anon role works, real data confirmed (20 artists, 115 tracks).
- ✅ **Vercel production env has both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.**
- ✅ **Maintenance work committed clean: `9786a1d`** (no Phase 2/4 WIP, no keys leaked).
- ⏸ **Maintenance flag NOT lifted yet.** Site is still in fail-closed `/maintenance` redirect mode. Need Od's "deploy" keyword to remove `NEXT_PUBLIC_MAINTENANCE_MODE` from Vercel production and redeploy.
- 📋 **Phase 3 (Collaborator Circles) schema gap documented** — see "Open Questions" below.

---

## 1. Supabase Health (Read-Only Probe)

**Project URL:** `https://tsdjmiqczgxnkpvirkya.supabase.co`
**Anon key length:** 208 chars (JWT, valid format)
**Auth source:** Vercel production env (confirmed `vercel env ls production`)

| Probe | Endpoint | Result |
|---|---|---|
| REST root | `/rest/v1/` | HTTP 401 (expected — requires apikey header) — service **responded** |
| `artists` sample (anon) | `GET /rest/v1/artists?select=*&limit=1` | **HTTP 200** — row returned with full schema |
| `artists` count (anon) | `GET /rest/v1/artists?limit=0` (Prefer: count=exact) | **HTTP 206 — Content-Range: \*/20** → **20 artists** |
| `tracks` count (anon) | `GET /rest/v1/tracks?limit=0` (Prefer: count=exact) | **HTTP 206 — Content-Range: \*/115** → **115 tracks** |
| `tracks` sample (anon) | `GET /rest/v1/tracks?select=*&limit=1` | **HTTP 200** — row returned with full schema |
| `auth` health | `GET /auth/v1/health` | HTTP 401 (expected — service **responded**) |
| `artists` ordered list (anon) | `GET /rest/v1/artists?select=id,slug,name&order=name.asc&limit=25` | **HTTP 200** — 17+ artist rows returned (see list below) |

**Verdict: ✅ Supabase is healthy. No writes performed.**

### Artist roster (anon-readable, ordered)
ATM Trap, Codex Admin, Codex Creator, Gune, Lila Sky, Nick-9, O D Porter, Rachel Herron, Ray Of Sunshine 💫, Rob Soule, Smoke Artist, Test Artist 2026, Test User, UX Artist (×3 entries with different slugs), … (≥17 total — pagination continues to 20).

### Sample artist row (full schema)
```
id, name, slug, bio, genre, location, website_url, social_links,
verified, monthly_goal, current_earnings, total_earnings, supporters_count,
created_at, cover_url, avatar_url, website, youtube_url, twitter_url,
instagram_url, supporter_count, artist_tier, status, public_profile_enabled,
auto_publish
```

### Sample track row (full schema)
```
id, artist_id, title, artist, album, duration, file_url, file_path,
price, proud_to_pay_min, plays, created_at, audio_url, cover_url,
track_number, play_count, is_active, station_id, description, updated_at,
featured, playback_mode, preview_duration_seconds, unlock_required, status
```

**Notable for Phase 3:** `tracks` has **only `artist_id`** (single) and a denormalized `artist` text column. **No featured-artist column.** Schema gap to be resolved before Phase 3 ships.

---

## 2. Vercel Production Env (key names only, never values)

Source: `vercel env ls production` against `inquiringmindsco-ship-its-projects/porterful`.

| Var | Environments | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Production (25m ago) | ✅ present |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview, Development (72d ago) | ✅ present |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview (61d ago) | ✅ present |
| `NEXT_PUBLIC_SITE_URL` | Production, Preview, Development (55d ago) | ✅ present |
| `STRIPE_SECRET_KEY` | Development, Preview, Production (70d ago) | ✅ present |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Development, Preview, Production (70d ago) | ✅ present |
| `STRIPE_WEBHOOK_SECRET` | Production, Preview (70d ago) | ✅ present |
| `RESEND_API_KEY` | Production (60d ago) | ✅ present |
| `PORTERFUL_SESSION_SECRET` | Preview, Production (40d ago) | ✅ present |
| `OFFER_SECRET` | Production, Preview (40d ago) | ✅ present |

**Note:** `NEXT_PUBLIC_MAINTENANCE_MODE` is **NOT** in the Vercel env list — it must have been set via the build environment or removed earlier. **Will confirm during the lift step.** The current "site redirects to /maintenance" behavior suggests it's set somewhere, possibly baked into a recent build, OR the uncommitted middleware change is just present in the deployed build that I haven't re-pulled.

---

## 3. Maintenance Commit

**SHA:** `9786a1ddd6678f32d28e7b05249d91d4f08c807c`
**Branch:** main
**Title:** `chore: add Porterful maintenance mode fallback`

**Files committed (9):**
- `.gitignore` (+ `/.env.vercel*` rule — pulls of Vercel keys won't be staged)
- `TODO.md`
- `PORTERFUL_EMERGENCY_SERVICE_RECOVERY_REPORT.md`
- `PORTERFUL_MAINTENANCE_MODE_REPORT.md`
- `src/middleware.ts` (maintenance gate)
- `src/app/(app)/maintenance/page.tsx`
- `src/app/error.tsx` (new)
- `src/app/global-error.tsx` (new)
- `src/components/MaintenanceNotice.tsx` (new)

**Files NOT committed (stashed separately):**
- `src/lib/artists.ts` — Rob Soule bio rewrite (Phase 2)
- `src/components/artist/ArtistTabs.tsx` — tabs reorder + "Featured Singles" rename (Phase 4)
- `src/lib/artist-progression.ts` — TypeScript cast (Phase 2 build-enabler)
- Stash: `stash@{0}: phase2-4-wip: artist bio + tabs reorder + progression cast`

**No secrets staged or committed.** Verified by grepping staged diff for `SECRET|KEY|TOKEN=` patterns. Three previously-untracked `.env.vercel.*` files (which contained real keys) are now matched by `.gitignore`.

**Author:** `porter.jonathanj@gmail.com` (matches GitHub account — June 10 lesson applied, no Vercel auth-block risk).

---

## 4. Deploy Status

**Current state of `https://porterful.com`:** Still redirects to `/maintenance` (the most recent deploy was the maintenance build per `PORTERFUL_EMERGENCY_SERVICE_RECOVERY_REPORT.md`).

**Maintenance lift (BLOCKED on Od approval):**
1. Inspect where `NEXT_PUBLIC_MAINTENANCE_MODE` is set on Vercel
2. Remove it from production (or set to `false`)
3. `vercel --prod --yes` from `~/Documents/porterful`
4. Run the 9-point route verification (Phase 1)
5. Report results

---

## 5. Routes Verification (BLOCKED — site still in maintenance)

Per the `PORTERFUL_EMERGENCY_SERVICE_RECOVERY_REPORT.md` from the last deploy, the following are **expected to redirect to /maintenance** until the flag is lifted:

| Route | Expected status | Verified? |
|---|---|---|
| `/` | 307 → /maintenance | ❌ (blocked by lift) |
| `/artists` | 307 → /maintenance | ❌ (blocked by lift) |
| `/music` | 307 → /maintenance | ❌ (blocked by lift) |
| `/store` | 307 → /maintenance | ❌ (blocked by lift) |
| `/dashboard/artist` | 307 → /maintenance | ❌ (blocked by lift) |
| `/dashboard/founder` | 307 → /maintenance | ❌ (blocked by lift) |
| `/login` | 200 (reachable) | ❌ (blocked by lift) |
| `/signup` | 200 (reachable) | ❌ (blocked by lift) |
| `/maintenance` | 200 (reachable) | ❌ (blocked by lift) |

**Will not run any of these checks until maintenance is lifted.**

---

## 6. Counts (from Supabase probe, not the site)

- **Artists:** 20 (incl. several `ux-artist-*` test entries, `Test Artist 2026`, `Test User`, `Codex Admin`, `Codex Creator`, `Smoke Artist`)
- **Tracks:** 115
- **Real artists (likely production-meaningful):** ATM Trap, Gune, Lila Sky, Nick-9, O D Porter, Rachel Herron, Ray Of Sunshine 💫, Rob Soule — 8 named artists visible

---

## 7. Playback Test

**Not yet run** — requires Vercel-deployed public URL with a track on the public catalog. Deferred until maintenance lift.

---

## 8. Open Questions (for Phase 3 — Collaborator Circles)

**Schema gap confirmed:** `tracks` has only `artist_id` (single FK) + denormalized `artist` text. No `featured_artist_ids`, no `collaborator_ids`, no junction table.

**Options to document (will not execute without Od approval):**
- **Option A (minimal):** Add `featured_artist_ids uuid[]` column to `tracks`. Self-contained, no joins, easy to render.
- **Option B (normalized):** Create `track_collaborators(track_id, artist_id, role, order)` table with FKs. More flexible, supports roles like "producer" / "featured" / "remix" later.
- **Option C (defer Phase 3):** Ship Phases 2, 4, 5, 6 first; circle UI ships when data layer is ready.

**Recommendation:** Option B (junction table) — cheap, future-proof, matches the rest of the system. But I will **not write or migrate** until Od approves and we resolve the "touch nothing" boundary for the `tracks` table.

---

## 9. Remaining Blockers

1. **Od "deploy" keyword** — required to lift `NEXT_PUBLIC_MAINTENANCE_MODE` and run the actual Phase 1 verification.
2. **Phase 3 schema decision** — collaborator circle feature can't be built without a data model. Need Od's call on Option A / B / C.
3. **Build verification post-lift** — must run `npm run build` after the flag lift to ensure no regression. The maintenance commit's build was confirmed previously but the merged working tree needs re-check.
4. **Phase 2/4 stash** — 3 files stashed; need to be either discarded or merged into a future Phase 2 commit, not lost.

---

## 10. Next Action (waiting on Od)

```
You said:
  3. If Supabase is confirmed healthy, lift maintenance.
     - Set NEXT_PUBLIC_MAINTENANCE_MODE=false or remove the production flag.
     - Redeploy production.
     - This is approved only after Supabase passes read-only checks.
```

**Supabase passed read-only checks.** Awaiting Od's **"deploy"** keyword to:
- Locate + remove `NEXT_PUBLIC_MAINTENANCE_MODE` from Vercel production
- `vercel --prod --yes`
- Run Phase 1 10-point live verification
- Produce PASS/FAIL on `PORTERFUL_UPLOAD_DAY_STABILIZATION_MEDIA_REPORT`

**NOT proceeding** with the lift without explicit approval. Probe complete, system healthy, hands off the deploy button.

---

*End of report. Awaiting deploy authorization.*
