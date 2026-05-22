# Porterful Artist Profile Alignment — Deployment Summary

**Date:** May 22, 2026
**Status:** ✅ PRODUCTION LIVE
**Commits:** `e8bf866a` through `e324a51e`

---

## What Was Fixed

### 1. Profile Save Bug — FIXED ✅
**Root cause:** API used `createServerClient` with ANON key to update `artists` table, but RLS policy blocked anon-key updates. Auth passed, but DB write failed silently.

**Fix:** PATCH `/api/artists/[id]` now:
1. Verifies auth with `getSession()` (security check)
2. Uses **service role** for the actual DB update (bypasses RLS)
3. Returns saved data to client

**Commit:** `a099a305`

### 2. Edit Page Not Updating Local State — FIXED ✅
**Root cause:** After successful save, edit page showed "Profile saved!" but form fields still displayed OLD values because `useState` was never updated from API response.

**Fix:** After `setSuccess(true)`, parse API response and update all form state fields:
```typescript
const saved = await res.json()
setName(saved.name || '')
setBio(saved.bio || '')
setGenre(saved.genre || '')
setLocation(saved.location || '')
// ... etc
```

**Commit:** `7e3afe0b`

### 3. Public Artist Page Reading from Static Data — FIXED ✅
**Root cause:** `/artist/[slug]/page.tsx` checked `ARTISTS` static array first, then DB as fallback. Static data overrode DB updates.

**Fix:** Reversed priority — queries DB first. Only uses static fallback if no DB artist found.
- DB `artists` table = canonical source
- Static `ARTISTS` array = fallback only

**Commit:** `32e27f3c`, `bc89da74`

### 4. Artists Listing Page Using Hardcoded Data — FIXED ✅
**Root cause:** `/artists/page.tsx` used static `PUBLIC_ARTISTS` array with hardcoded O D Porter data (84 tracks, old genre, etc).

**Fix:** Rewrote to fetch from DB `artists` table dynamically:
- Queries `artists` table for all `status = 'active'`
- Track count computed client-side from live tracks API
- Images from `avatar_url` field
- Genre, location, bio from DB

**Commit:** `e22fd0b0`

### 5. Duplicate Edit Pages — CLEANED UP ✅
**Problem:** Both `/settings/settings` and `/dashboard/dashboard/artist/edit` edited the same artist row, confusing users.

**Fix:** 
- `/settings/settings` → clarified as **Account Settings** (email, password, avatar)
- Added prominent link: "Edit Artist Profile →" pointing to canonical editor
- `/dashboard/dashboard/artist/edit` = canonical artist profile editor

**Commit:** `43fbc5a0`, `e324a51e`

### 6. Mobile Layout Cutoff — FIXED ✅
**Problem:** Artist edit page, settings page, and public artist page had horizontal overflow on mobile (iPhone Safari).

**Fix:** Added `overflow-x-hidden`, `max-w-full`, responsive padding fixes.

**Commit:** `17556605`

### 7. API Route File in Wrong Location — CLEANED UP ✅
**Problem:** `src/app/(app)/api/artists/[id]/route.ts` was overriding the real API route.

**Fix:** Deleted duplicate API route file.

**Commit:** `e98a0392`

---

## Data Hierarchy (Canonical Rules)

Every public artist component now follows this priority:

| Priority | Source | Used For |
|---|---|---|
| 1st | `artists` table (DB) | name, bio, genre, location, avatar, banner |
| 2nd | `profiles` table (DB) | full_name, email, role (account data) |
| 3rd | `tracks` table (DB) | track count, song listings |
| 4th | Static `ARTISTS` array | fallback ONLY if no DB artist exists |

**Rule:** DB data always wins. Static never overrides an updated DB field.

---

## Verified Working (Production)

| Check | Status |
|---|---|
| Bio saves to DB | ✅ |
| Public page shows updated bio | ✅ ("St. Louis-born" visible) |
| Genre shows from DB | ✅ ("Hip-Hop" visible) |
| Location shows from DB | ✅ ("New Orleans, LA" visible) |
| Artists listing page loads | ✅ HTTP 200 |
| Track count from live API | ✅ 116 tracks for O D Porter |
| Mobile no horizontal overflow | ✅ |
| Edit page updates local state | ✅ |
| Service role used for DB writes | ✅ |

---

## Files Changed

- `src/app/(app)/artist/[slug]/page.tsx` — DB-first artist lookup
- `src/app/(app)/artists/page.tsx` — Dynamic DB artist listing
- `src/app/(app)/dashboard/dashboard/artist/edit/page.tsx` — Local state update fix
- `src/app/(app)/settings/settings/page.tsx` — Clarified as account settings
- `src/app/api/artists/[id]/route.ts` — Service role for PATCH
- `src/components/artist/ArtistHero.tsx` — Removed hardcoded track count
- `src/components/artist/ArtistTracks.tsx` — Dynamic track count
- `vercel.json` — Removed redundant /api rewrite
- Deleted: `src/app/(app)/api/artists/[id]/route.ts` (duplicate)

---

## Test Results

```
Public artist page:     HTTP 200, "St. Louis-born" found ✅
Artists listing:        HTTP 200, "O D Porter" found ✅
Track count API:        116 tracks for O D Porter ✅
DB artist API:          name=O D Porter, location=New Orleans, LA ✅
```

---

## Next Steps

- [ ] Test with another artist (ATM Trap or Gune) to confirm universal behavior
- [ ] Add `banner_url` field to artist edit form if hero image upload needed
- [ ] Consider adding `artist.featured_track_id` for explicit top track selection

**Commit:** `e8bf866a` (final)
**Production URL:** https://porterful.com/artists
