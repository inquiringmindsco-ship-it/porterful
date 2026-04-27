# Porterful Site Improvements - Batch 1 (April 27, 2026)

## Changes Made

### 1. Rob Soule Artist Data ✓
- **File:** `src/lib/artists.ts`
- **Status:** Already correct
- Genre: 'Hip-Hop / R&B / Blues'
- Bio: "Rob Soule is a St. Louis hip-hop and R&B artist blending blues into a soulful sound. His music captures the raw energy of the Lou while weaving in the emotional depth of R&B and the timeless roots of blues."

### 2. Social Media Buttons on Artist Profile ✓
- **File:** `src/components/artist/ArtistHero.tsx`
- **Status:** Implemented
- Added Instagram, Twitter/X, YouTube, and TikTok icons (SVG) next to artist name
- Social buttons appear only if artist has those fields filled in
- Icons are 16px with circular button styling (8x8 touch targets)
- Opens links in new tab with proper accessibility labels

### 3. Featured Singles Before Albums ✓
- **File:** `src/components/artist/ArtistTabs.tsx`
- **Status:** Already correct
- Singles section appears BEFORE Albums & Projects section
- Order: Featured Tracks → Singles → Albums & Projects

## Notes
- All changes are saved but NOT committed or deployed
- Social icons implemented as inline SVGs for performance
- Artist data structure supports: instagram, twitter, youtube, tiktok, website

---
**Next:** Deploy when ready
