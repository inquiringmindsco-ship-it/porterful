# PORTERFUL_TRACK_COLLABORATORS_IMPLEMENTATION_REPORT

**Mission:** M-20260615-1 — Porterful Upload-Day Stabilization + Media Pass
**Date:** 2026-06-15 06:00 CDT
**Author:** Sentinel
**Status:** ⚠️ **PARTIAL** — Migration written + server helper + new API route done. NOT applied to production. NOT wired into the 6 existing `CollaboratorStack` consumers. Build is currently RED due to a separate parallel-session file change.

---

## TL;DR

| Step | Result |
|---|---|
| Migration file written | ✅ `supabase/migrations/044_track_collaborators.sql` (renumbered from 042 after parallel session took 043) |
| Server helper written | ✅ `src/lib/track-collaborators.ts` (5 functions: single fetch, batch fetch, ArtistCredit adapter, track enricher) |
| New API route | ✅ `src/app/api/tracks/with-collaborators/route.ts` (returns tracks with collaborators pre-joined) |
| Migration applied to production | ❌ **NOT APPLIED** — requires Od to paste SQL into Supabase dashboard SQL editor (or link project + `supabase db push`) |
| Wired into `/music` page | ❌ Not done |
| Wired into `ArtistTabs` (artist page) | ❌ Not done |
| Wired into `FeaturedTrackCard` (homepage) | ❌ Not done |
| Wired into `GlobalPlayer` (now playing) | ❌ Not done |
| Build passes | ❌ **RED** — pre-existing error in `src/lib/server/artist-media.ts:94` (parallel-session edit, NOT my code) |

---

## 1. What I Built

### 1a. Migration: `supabase/migrations/044_track_collaborators.sql`

Schema:
```sql
create type collaborator_role as enum (
  'primary', 'featured', 'producer', 'writer', 'collaborator'
);

create table public.track_collaborators (
  id            uuid primary key default gen_random_uuid(),
  track_id      uuid not null references public.tracks(id) on delete cascade,
  artist_id     uuid not null references public.artists(id) on delete cascade,
  role          collaborator_role not null default 'collaborator',
  display_order integer not null default 0,
  created_at    timestamptz not null default now(),
  unique (track_id, artist_id, role),
  check (display_order >= 0)
);
```

Plus: 2 indexes (lookup by track_id, lookup by artist_id), RLS policies (public read, owner+admin write), and a one-time backfill that mirrors all existing `tracks.artist_id` as `role='primary'` rows so existing data is queryable.

**Renumbering note:** I initially wrote this as `042_`. A parallel session wrote `043_artist_media_rbac.sql` while I was working. I renumbered mine to `044_` to avoid the conflict.

### 1b. Server helper: `src/lib/track-collaborators.ts`

5 exports:
- `getTrackCollaborators(supabase, trackId)` — single track fetch
- `getTrackCollaboratorsBatch(supabase, trackIds)` — batch fetch (for N+1 prevention)
- `collaboratorToArtistCredit(c)` — adapter to the shape `CollaboratorStack` expects
- `enrichTrackWithCollaborators(track, collaborators)` — augments a track row with `collaborators`, `featured_artists`, `artist_credits` fields
- `getTrackCollaboratorsBatch` returns `Map<trackId, ...>` for O(1) lookup

**Graceful degradation:** If the `track_collaborators` table doesn't exist (migration not yet applied), the helper returns `[]` / empty `Map` instead of throwing. This means the UI keeps working with "no collaborators" until the migration is applied.

### 1c. New API route: `src/app/api/tracks/with-collaborators/route.ts`

`GET /api/tracks/with-collaborators?ids=uuid1,uuid2,...`

- If `ids` is provided: returns just those tracks with collaborators
- If `ids` is missing: returns all active tracks (limit 200, configurable via `?limit=N`) with collaborators
- Uses anon key (public read, RLS allows it)
- Returns tracks pre-enriched with `collaborators`, `featured_artists`, `artist_credits` arrays

This is the **single point of integration** for the wiring work in step 2.

---

## 2. What I Did NOT Do (and why)

### 2a. Migration not applied

The migration file exists on disk. To apply it:

**Option A — Supabase dashboard SQL editor (recommended for one-off):**
1. Open https://supabase.com/dashboard/project/tsdjmiqczgxnkpvirkya/sql
2. Paste the contents of `supabase/migrations/044_track_collaborators.sql`
3. Click "Run"
4. Verify: `select count(*) from public.track_collaborators;` → expect 115

**Option B — `supabase db push`:**
1. `cd ~/Documents/porterful && supabase link --project-ref tsdjmiqczgxnkpvirkya` (requires DB password)
2. `supabase db push`
3. This will apply ALL pending migrations in order

**I cannot do either** — dashboard requires Od's login, CLI requires the DB password (not in any env file).

### 2b. Wiring into the 6 existing `CollaboratorStack` consumers

`CollaboratorStack` is imported and rendered in:
- `src/app/music/page.tsx`
- `src/app/(app)/dashboard/founder/page.tsx`
- `src/app/(app)/dashboard/artist/page.tsx`
- `src/components/GlobalPlayer.tsx`
- `src/components/ArtistSearch.tsx`
- `src/components/artist/ArtistTabs.tsx`
- `src/components/artist/ArtistTrackList.tsx`
- `src/components/artist/FeaturedTrackCard.tsx`

All of them call `buildTrackArtistCredits(track)` from `lib/artist-credits.ts`. That function already supports reading from `track.collaborators`, `track.featured_artists`, `track.artist_credits` etc. **So if a track row is enriched with those arrays (via my new API route or a client-side fetch), the existing `CollaboratorStack` will render collaborators for free.**

The wiring work is:
- Change each page's data-fetch from raw `supabase.from('tracks')` to `fetch('/api/tracks/with-collaborators')`
- OR: add a client-side hook `useTrackCollaborators(trackId)` that runs after the page loads and enriches tracks in state

Either way, this touches 8 files. The /music page is a client-side fetch (lines visible in the earlier read); `ArtistTabs` is the most complex because it manages filters, search, tabs, etc.

**I did not do this work** for two reasons:
1. **The build is currently RED** due to an unrelated error in `src/lib/server/artist-media.ts:94` introduced by the parallel session — making it impossible to verify any of my changes build cleanly
2. **A parallel Codex/Claude session is actively modifying the same code area** — I don't want to write a v1 of the wiring that gets clobbered by their v2

### 2c. Build verification

The build is **RED** because of:
```
./src/lib/server/artist-media.ts:94:7
Type error: Argument of type 'PostgrestFilterBuilder<any, any, any, ...>' is not assignable to parameter of type 'Promise<{ data: any; error: any; count: number | null; }>'.
```

`artist-media.ts` was modified by a parallel session (timestamps show 05:40 CDT, after my refactor of the API routes started). The change wraps `supabase.from(...).select(...)` in `countQuery()` and then passes it to `Promise.all()` — but `.from().select()` returns a `PostgrestFilterBuilder`, not a Promise.

**This is not my code. I have not touched `src/lib/server/artist-media.ts`.** The diff against `af1d20d` shows it was modified outside my session.

**I am NOT going to fix it** because:
- I don't know what the parallel session was trying to do
- They may have a fix in flight
- Touching their work may make the integration harder

---

## 3. ⚠️ Conflict With Parallel Session

While I was working on Step 2 (refactoring `/api/artist-videos/*`), another session (Codex/Claude? or another Sentinel instance?) was doing the **same refactor** in parallel. Evidence:

| Their file | My file | Overlap |
|---|---|---|
| `src/lib/artist-video-access.ts` (new, 05:41 CDT) | `src/lib/supabase-per-request.ts` (new, 05:36 CDT) | **Both export `createUserClient(token)`** — the exact same pattern (anon key + Bearer token in global headers) |
| `supabase/migrations/043_artist_media_rbac.sql` (new, 05:40 CDT) | (none) | Adds RLS policies on `artist_videos` — I didn't get to this |
| `src/lib/server/artist-media.ts` (modified, 05:40 CDT) | (none) | Has a TypeScript error in their version |

**My `supabase-per-request.ts` and their `artist-video-access.ts` provide duplicate functionality.** If both stay, the codebase will have two slightly different ways to do the same thing. Recommend picking one. **Mine is in `/lib/supabase-per-request.ts` (named for the request lifecycle) and theirs is in `/lib/artist-video-access.ts` (named for the media domain).** I'd recommend consolidating into theirs (better naming, smaller API surface — just `createUserClient` + `createAdminClient` + `extractBearerToken` + `isFounderOrAdmin`).

**The build is broken because of their change to `artist-media.ts`.** I cannot ship until that's fixed.

---

## 4. Recommended Path Forward (for Od)

This is a **coordination moment**, not a "do more work" moment. Three options:

### Option 1 — Pause my session, let the parallel session finish, then resume
- Pros: clean integration, single source of truth
- Cons: my migration, helper, and API route sit uncommitted; the parallel session may not know about them

### Option 2 — Commit my work as a separate atomic commit
- Pros: preserves my Step 2 + Step 3 contributions; if the parallel session is for a different mission, mine is independent
- Cons: duplicate `createUserClient` if I don't consolidate
- Required cleanup: I should consolidate `supabase-per-request.ts` → delete, and have my API routes import from `artist-video-access.ts` instead

### Option 3 — Discard my Step 3 work, do it in a new mission after the dust settles
- Pros: clean slate
- Cons: throws away the migration file and helper I wrote

**My recommendation: Option 2, with the consolidation.** Specifically:
1. Delete my `src/lib/supabase-per-request.ts`
2. Change my `/api/artist-videos/*` routes to import `createUserClient`, `createAdminClient`, `extractBearerToken` from `@/lib/artist-video-access`
3. Keep my `src/lib/track-collaborators.ts` and the migration file (these are new, not duplicates)
4. Keep my new `src/app/api/tracks/with-collaborators/route.ts` (also new)
5. Have whoever is fixing `artist-media.ts:94` finish that fix
6. Build must be GREEN before the migration can be applied

**I will not do the consolidation without your "do it" keyword** because it involves deleting my code in favor of theirs.

---

## 5. Files Created / Modified This Session

| Path | Action | Status |
|---|---|---|
| `supabase/migrations/042_track_collaborators.sql` | Created then renamed to `044_track_collaborators.sql` | ✅ |
| `src/lib/track-collaborators.ts` | NEW (4599 bytes) | ✅ |
| `src/app/api/tracks/with-collaborators/route.ts` | NEW (3141 bytes) | ✅ |
| `src/lib/supabase-per-request.ts` | NEW (4034 bytes) | ⚠️ **Duplicate of `artist-video-access.ts` — recommend deleting in favor of theirs** |
| `src/app/api/artist-videos/route.ts` | Refactored (uses my `supabase-per-request.ts`) | ✅ |
| `src/app/api/artist-videos/[id]/route.ts` | Refactored (uses my `supabase-per-request.ts`) | ✅ |
| `PORTERFUL_TRACK_COLLABORATORS_IMPLEMENTATION_REPORT.md` | NEW (this file) | ✅ |

---

## 6. Open Questions (for Od)

1. **Apply the migration now or wait?** Recommend: fix the build first, then apply, then wire the consumers.
2. **Consolidate my `supabase-per-request.ts` into their `artist-video-access.ts`?** Recommend: yes.
3. **Who is fixing `src/lib/server/artist-media.ts:94`?** I don't want to touch it; whoever introduced the change should fix it.
4. **How many of the 8 CollaboratorStack consumers should I wire in this mission?** All 8, or just the artist page (the most visible)?

---

## 7. Next Action (Awaiting Od Decision)

- **If "do it, consolidate"**: I delete `supabase-per-request.ts`, update my API routes to import from `artist-video-access.ts`, run the build to confirm green, commit, then report.
- **If "pause"**: I commit what I have as-is, write a final status report, and stop until the parallel session finishes.
- **If "discard Step 3"**: I delete `track-collaborators.ts`, the new API route, and the migration file.

**No production deploy performed.** Site is on `af1d20d`. Build is RED. Cannot ship until build is green.

---

*End of implementation report. The schema is designed, the helper is written, the API route exists, and the migration is on disk. What's missing is: (a) the migration applied to production, (b) the wiring into the 8 consumers, (c) the build green again, and (d) coordination with the parallel session.*
