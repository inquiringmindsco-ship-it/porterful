# PORTERFUL MOBILE QA BUG REPORT — 2026-04-29

**Status:** INVESTIGATION COMPLETE — Fixes in progress  
**Investigator:** Claw  
**Report Time:** 2026-04-29 17:50 CDT  
**Phase:** 1 (Critical broken flows)

---

## 1. FALSE OWNERSHIP WARNING — "You do not own this track"

**Root Cause:** Dual edit routes with different ownership checks

| Route | File | Ownership Check | Status |
|-------|------|-----------------|--------|
| `/dashboard/artist/tracks/[id]/edit` | `src/app/dashboard/artist/tracks/[id]/edit/page.tsx` | Multi-step: `track.artist_id === user.id \|\| profile?.id === user.id \|\| artistRow?.id === user.id` | ❌ Shows false warning for some cases |
| `/dashboard/dashboard/artist/edit/track/[id]` | `src/app/(app)/dashboard/dashboard/artist/edit/track/[id]/page.tsx` | Simple: `trackData.artist_id !== user.id` | ❌ Same issue |

**Problem:** The check `track.artist_id === user.id` assumes `tracks.artist_id` = `auth.users.id` (UUID). But `tracks.artist_id` references `artists.id`, which IS the same UUID. The fallback checks (`profile?.id === user.id`, `artistRow?.id === user.id`) are redundant since all three are the same value.

**The real issue:** If `track.artist_id` doesn't match `user.id`, but the user IS the owner (e.g., through a different linking mechanism), the warning appears falsely.

**Fix needed:** The ownership check needs to also verify via the `artists` table lookup by the track's `artist_id` matching the logged-in user's `id`. The current code does this but might fail if the artist record doesn't exist.

**Smallest fix:** In the canonical route (`src/app/dashboard/artist/tracks/[id]/edit/page.tsx`), add a fallback that checks if the track's artist_id matches any artist owned by the current user.

---

## 2. MOBILE SAVE BUTTON BLOCKED

**Root Cause:** Pages use `pb-24` (padding-bottom) but not enough for the combined height of:
- MobileBottomNav (64px)
- GlobalPlayer mini bar when active (96px offset)
- iOS safe area inset (20-34px)
- Form action buttons at the very bottom

**Current values:**
- `pb-24` = 96px padding
- MobileBottomNav = ~64px
- GlobalPlayer offset when active = 96px additional
- Total needed: 96 + 64 + 20 = ~180px minimum

**Affected files:**
- `src/app/dashboard/artist/tracks/[id]/edit/page.tsx` — `pb-24` (line 125)
- `src/app/(app)/dashboard/dashboard/artist/edit/track/[id]/page.tsx` — `pb-12` (line 217)

**Fix needed:** Increase bottom padding or add `mb-32` (128px = 8rem) to the form container to push content above the combined nav + player height.

---

## 3. MOBILE MENU NO CLOSE BUTTON

**Status:** Already fixed! The mobile menu HAS:
- ✅ X button in top-right of drawer (line 183)
- ✅ Overlay that closes on tap (line 226)
- ✅ Escape key closes menu (line 112)
- ✅ Menu items close on click (line 194)

**But:** The X button might be obscured by the iOS status bar or safe area. Need to add `pt-safe` or `mt-4` to ensure it's tappable.

---

## 4. DASHBOARD CATALOG BUTTON LOOPS

**Root Cause:** Duplicate routes with different button targets

| Button | Target Route | Actual Route | Issue |
|--------|-----------|-------------|-------|
| "Back to Dashboard" | `/dashboard` | `/dashboard/artist` | ✅ Already removed (fixed earlier today) |
| "Upload Track" | `/dashboard/upload` | `/dashboard/upload` | ✅ Works |
| "Edit Profile" | `/dashboard/artist/edit` | `/dashboard/artist/edit` | ⚠️ Two routes exist |

**The loop:** When on `/dashboard/artist` (My Catalog), clicking certain buttons might route to `/dashboard/dashboard/artist` (legacy duplicate) which has different buttons.

**Fix needed:** Ensure all dashboard links point to canonical routes, not legacy duplicates.

---

## 5. STRIPE CONNECT BUTTON

**Status:** NOT IMPLEMENTED

In `src/app/(app)/dashboard/dashboard/payout/page.tsx`:
- Page loads balance but doesn't show a Stripe Connect button
- No onboarding flow exists
- The page shows "Payout" but only displays balance, not withdrawal options

**Fix needed:** Either implement Stripe Connect onboarding or show "Payouts coming soon" message.

---

## 6. ARTISTS PAGE CTA FOR LOGGED-IN ARTISTS

**Current logic:** `src/app/(app)/artists/page.tsx`

```tsx
if (isArtistAccount && artist) {
  setCtaHref('/dashboard/artist')
  setCtaLabel('Manage My Artist Profile')
} else if (profile?.role === 'artist') {
  setCtaHref('/dashboard/artist/edit')
  setCtaLabel('Continue Setup')
} else {
  setCtaHref('/apply/form')
  setCtaLabel('Apply as Artist')
}
```

**Issue:** If `artist` record exists but `profile?.role !== 'artist'`, it shows "Continue Setup" instead of "Manage My Artist Profile".

**Fix needed:** Prioritize the artist record check over the role check.

---

## 7. HOMEPAGE DUPLICATE LOGO

**Investigation:** Could not find duplicate PORTERFUL wordmark on homepage. The hero section shows the tagline but no separate wordmark below the nav logo.

**Status:** Not confirmed — need screenshot to identify exact location.

---

## 8. FULL-SCREEN PLAYER COLLAPSE

**File:** `src/components/Player.tsx` and `src/components/GlobalPlayer.tsx`

**Issues:**
- Full-screen player may scroll when it shouldn't
- No swipe-down gesture to collapse
- Volume slider visible on mobile

**Fix needed:** Add swipe handler and hide volume slider on mobile.

---

## 9. PROFILE IMAGE UPLOAD

**Investigation:** Profile image upload exists in:
- `src/app/(app)/dashboard/dashboard/artist/edit/page.tsx` (legacy route)
- Artist application form stores `avatar_url`
- Static artists have `image` field

**Issue:** No clear way to change profile image from dashboard.

---

## 10. SIGN-UP VS SIGN-IN CONFUSION

**Root Cause:** The signup flow doesn't check if email already exists before showing the form.

**File:** `src/app/(app)/signup/page.tsx`
- User enters email → clicks Continue → creates account
- No check: "This email already has an account. Sign in instead?"

**Fix needed:** Add email existence check before signup form progression.

---

## EXECUTION ORDER (Phase 1)

1. Fix false ownership warning — canonical edit route
2. Fix mobile save button blocked — increase bottom padding
3. Fix mobile menu close button safe area
4. Fix Artists page CTA priority
5. Add "coming soon" to Stripe Connect

---

## PASS/FAIL

**IN PROGRESS** — Fixes being applied now.
