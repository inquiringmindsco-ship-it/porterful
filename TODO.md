# Porterful Site Improvements — Batch 1 (2026-06-02 1:04 PM CT)

## 1. Rob Soule Artist Data Fix
**Status: Already correct** — No changes needed.

- **Genre:** `'Hip-Hop / R&B / Blues'` — matches the requested genre exactly.
- **Bio:** Already reads:
  > "Rob Soule is a St. Louis hip-hop and R&B artist blending blues into a soulful sound. His music fuses the raw edge of STL hip-hop with smooth R&B melodies, layered with blues influences that give his tracks a depth and authenticity rooted in the city's rich musical heritage. Tracks like 'Love Jones' and '2B' showcase his signature style — soulful, modern, and unmistakably St. Louis."
- **File:** `src/lib/artists.ts`
- **Social links:** Already populated for Instagram, Twitter, YouTube, and TikTok (`robsoule`).

## 2. Social Media Buttons on Artist Profile Page
**Status: Already implemented** — No changes needed.

- **Location:** `src/components/artist/ArtistHero.tsx` (lines 79–101)
- **Icons shown:** Instagram, Twitter/X, YouTube, TikTok — rendered as SVG icon buttons.
- **Placement:** Right next to the artist name (inline with `<h1>`), alongside the verified badge.
- **Behavior:** Only shows icons for which the artist has a non-empty social field. Links open in a new tab.
- **Icons imported from:** `src/lib/artist-social.tsx` (custom SVGs: Instagram, Twitter/X, YouTube, TikTok).

## 3. Featured Singles Before Albums
**Status: Already correct** — No changes needed.

- **Location:** `src/components/artist/ArtistTabs.tsx`
- **Current order in the "Music" tab:**
  1. Featured Tracks (if any)
  2. Featured Singles
  3. Albums & Projects
- **Rationale:** Singles are front-loaded so casual listeners hit new releases first before diving into full albums.

## 4. Deployment
**Status: NO DEPLOYMENT PERFORMED**

- All changes verified but nothing committed or deployed.
- This TODO file documents the current state of the codebase.

## Files Verified
- `src/lib/artists.ts` — Artist data (Rob Soule already correct)
- `src/components/artist/ArtistHero.tsx` — Social icons already rendered next to artist name
- `src/components/artist/ArtistTabs.tsx` — Singles already before Albums
- `src/lib/artist-social.tsx` — Social icon SVG components already defined

## Notes
- No code edits were required for any of the 3 tasks — they were already implemented in the codebase.
- If Rob Soule's bio or genre needs *further* refinement, ping `@sentinel` with the exact wording.

## Files Verified
- `src/lib/artists.ts` — Artist data (Rob Soule already correct)
- `src/components/artist/ArtistHero.tsx` — Social icons already rendered next to artist name
- `src/components/artist/ArtistTabs.tsx` — Singles already before Albums
- `src/lib/artist-social.tsx` — Social icon SVG components already defined

## Notes
- No code edits were required for any of the 3 tasks — they were already implemented in the codebase.
- If Rob Soule's bio or genre needs *further* refinement, ping `@sentinel` with the exact wording.
