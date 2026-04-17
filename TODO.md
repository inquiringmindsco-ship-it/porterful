# Porterful TODO

## Site Improvements Batch 1 - Rob Soule fix + social buttons
**Date:** April 17, 2026

### Changes Made:

**1. Rob Soule Artist Data (src/lib/artists.ts)**
- ✅ Genre: Already set to 'Hip-Hop / R&B / Blues'
- ✅ Bio: Already reflects he's a St. Louis hip-hop and R&B artist blending blues into a soulful sound
- **Status:** No changes needed — data was already correct

**2. Social Media Buttons (src/app/(app)/artist/[slug]/page.tsx)**
- ✅ Instagram, Twitter/X, YouTube, TikTok icons already implemented
- ✅ Links pull from artist.social fields
- ✅ Positioned in Social Links Bar near the top of the page (after hero)
- **Status:** No changes needed — feature was already implemented

**3. Featured Singles Before Albums (src/app/(app)/artist/[slug]/page.tsx)**
- ✅ Singles section already appears before Albums section in the render order
- **Status:** No changes needed — order was already correct

### Summary:
All three requested improvements were already implemented in the codebase. No code changes were required. The artist page for Rob Soule (and all artists) already has:
- Correct genre and bio data
- Social media buttons with Instagram, Twitter/X, YouTube, and TikTok
- Featured Singles section rendering before Albums section

**DO NOT DEPLOY** — per instructions, this was a code review only.
