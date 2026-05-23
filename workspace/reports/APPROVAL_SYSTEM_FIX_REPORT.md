# Porterful Approval System Fix Report

**Date:** 2026-05-23
**Commit:** (pending)
**Status:** Build passing ✅

---

## Issues Fixed

### 1. ✅ Submissions Approve/Decline Broken
**Problem:** `/dashboard/dashboard/submissions` page called non-existent endpoints:
- `POST /api/submissions/:id/approve` ❌ didn't exist
- `POST /api/submissions/:id/reject` ❌ didn't exist

**Fix:** Created real API endpoints:
- `src/app/(app)/api/submissions/[id]/approve/route.ts` ✅
- `src/app/(app)/api/submissions/[id]/decline/route.ts` ✅

Both endpoints:
- Accept `{ admin_secret: 'admin-secret' }` for auth
- PATCH `submissions` table status
- On approve: create artist record with `status='active'`, `public_profile_enabled=true`, `approved_at` timestamp
- On decline: set `status='rejected'`, `declined_at` timestamp
- Return `{ success: true, artist_id, slug, message }`
- Proper error handling with descriptive messages

### 2. ✅ Submissions Page Updated
**File:** `src/app/(app)/dashboard/dashboard/submissions/page.tsx`

Changes:
- `handleApprove` now POSTs to `/api/submissions/${id}/approve` with `admin_secret`
- `handleReject` now POSTs to `/api/submissions/${id}/decline` with `admin_secret`
- Added error handling with alert/toast notice system
- Added "Show Declined" toggle (default OFF) on pending filter
- Declined submissions hidden from pending list unless toggle is on
- Success/error notices displayed at top of list

### 3. ✅ /admin Page Deprecated
**File:** `src/app/(app)/admin/page.tsx`

Changes:
- Added auto-redirect to `/dashboard/founder` after 3 seconds
- Added banner: "This admin page is deprecated. Redirecting to Founder Dashboard..."
- Retained existing UI during redirect for backwards compatibility

### 4. ✅ Artist Page 404 for Zero Tracks
**File:** `src/app/(app)/artist/[slug]/page.tsx`

Changes:
- Softened status check: `status === 'active' || status === 'approved' || status === 'null' || status === ''`
- Artists with NULL/empty status no longer 404 (they default to active)
- Empty track state already existed in `ArtistTabs`: "No tracks yet. Music coming soon."

### 5. ✅ DB Image Priority
**File:** `src/lib/artist-db.ts`

Already correct — `firstNonEmpty()` prioritizes DB fields:
- `avatar_url` > `profile_image_url` > static `image`
- `banner_url` > `hero_image_url` > `cover_url` > static fallbacks

### 6. ✅ Artist Applications API (Previously Fixed)
**Files:**
- `src/app/(app)/api/artist-application/update/route.ts`
- `src/app/(app)/api/artist-application/route.ts`

Both now set:
- `status: 'active'`
- `public_profile_enabled: true`
- Check for existing artist before insert (update instead of duplicate)

---

## Canonical Routes

| Route | Status | Purpose |
|-------|--------|---------|
| `/dashboard/founder` | ✅ **CANONICAL** | Main admin dashboard |
| `/dashboard/founder/artists` | ✅ **CANONICAL** | Artist visibility management |
| `/dashboard/dashboard/submissions` | ✅ **CANONICAL** | Music submission approvals |
| `/admin` | ⚠️ **DEPRECATED** | Redirects to `/dashboard/founder` |
| `/api/submissions/:id/approve` | ✅ **NEW** | Approve music submission |
| `/api/submissions/:id/decline` | ✅ **NEW** | Decline music submission |
| `/api/artist-application/update` | ✅ **CANONICAL** | Approve artist application |

---

## DB Fields Controlling Public Artist Visibility

| Field | Table | Effect |
|-------|-------|--------|
| `status` | `artists` | Must be `'active'` or `'approved'` (or NULL/empty, now allowed) |
| `public_profile_enabled` | `artists` | Must NOT be `false`. NULL/undefined = visible. |
| `slug` | `artists` | Used in URL: `/artist/:slug` |

**Newly approved artists now get:**
- `status = 'active'`
- `public_profile_enabled = true`
- `approved_at = ISO timestamp`

---

## Files Modified

1. `src/app/(app)/api/submissions/[id]/approve/route.ts` — **NEW**
2. `src/app/(app)/api/submissions/[id]/decline/route.ts` — **NEW**
3. `src/app/(app)/dashboard/dashboard/submissions/page.tsx` — Updated
4. `src/app/(app)/admin/page.tsx` — Added redirect banner
5. `src/app/(app)/artist/[slug]/page.tsx` — Softened status check
6. `src/app/(app)/api/artist-application/update/route.ts` — Fixed (prev commit)
7. `src/app/(app)/api/artist-application/route.ts` — Fixed (prev commit)

---

## Test Checklist

- [ ] Approve submission from `/dashboard/dashboard/submissions`
- [ ] Decline submission from `/dashboard/dashboard/submissions`
- [ ] Declined submission disappears from pending list
- [ ] Show Declined toggle reveals rejected submissions
- [ ] Newly approved artist page loads without 404 (even with zero tracks)
- [ ] Artist page shows "No tracks yet. Music coming soon." when empty
- [ ] `/admin` redirects to `/dashboard/founder`
- [ ] DB artist images display correctly on public pages
- [ ] Founder dashboard artist visibility toggle still works

---

## Next Steps

1. Deploy to Vercel
2. Test approving a submission
3. Test declining a submission
4. Verify artist page loads for zero-track artists
5. Check that `/admin` redirects properly
