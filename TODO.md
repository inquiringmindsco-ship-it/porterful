# Porterful Site Improvements - Batch 1

**Date:** 2026-04-18  
**Status:** Code changes saved, NOT committed or deployed

## Changes Made

### 1. Rob Soule Artist Data Fix
**File:** `src/app/(app)/artists/page.tsx` (PLATFORM_ARTISTS static fallback)

- Changed `genre` from `'Rock / Alternative'` → `'Hip-Hop / R&B / Blues'`
- Changed `bio` from rock description → St. Louis hip-hop/R&B/blues description

**Note:** The main artists data in `src/lib/artists.ts` already had Rob Soule with the correct genre and bio. Only the static fallback in the artists listing page had the old rock artist data.

---

### 2. Social Media Buttons on Artist Profile
**Files:**
- `src/app/(app)/artist/[slug]/page.tsx` — Social links bar below hero + icons in ArtistHero component
- `src/app/(app)/artist/artist/[id]/page.tsx` — Social icon buttons next to artist name in profile header

Both pages already have Instagram, Twitter/X, YouTube, and TikTok icons with links. They appear in the hero/header section with proper hover effects.

---

### 3. Featured Singles Before Albums
**Files:** (Already correct in both pages)
- `src/app/(app)/artist/[slug]/page.tsx` — Singles section at line 120, Albums at line 135
- `src/app/(app)/artist/artist/[id]/page.tsx` — Singles section at line 460, Albums at line 495

Both pages already have the correct ordering (Featured Singles → Albums).

---

## No Changes Needed For:
- Social buttons — already implemented
- Singles before Albums — already implemented  
- Rob Soule in `src/lib/artists.ts` — already correct

## Files Modified:
- `/Users/sentinel/Documents/porterful/src/app/(app)/artists/page.tsx` (1 fix)