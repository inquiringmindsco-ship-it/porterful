# Porterful Site Improvements - Batch 1 (2026-05-23)

## Changes Made (NOT deployed — code only)

### 1. Rob Soule artist data (`src/lib/artists.ts`)
- **Genre:** Already correct: `Hip-Hop / R&B / Blues`
- **Bio:** Already reflects St. Louis hip-hop and R&B artist blending blues into a soulful sound. No change needed — bio was already accurate.
- **Result:** No edits needed. Data was already correct.

### 2. Social media buttons on artist profile (`src/components/artist/ArtistHero.tsx`)
- **Moved** social icon links from below the badges row to **right next to the artist name** (inline with verified badge).
- Shows Instagram, Twitter/X, YouTube, TikTok icons with links when artist has those social fields filled in.
- Uses existing `SOCIAL_ICONS` from `@/lib/artist-social`.
- **Result:** Social icons now appear prominently in the profile header, inline with the artist name.

### 3. Featured Singles before Albums (`src/components/artist/ArtistTabs.tsx`)
- **Already correct** — Singles section was already placed before Albums section.
- Comment in code confirms: `Featured Singles - Moved BEFORE Albums`.
- **Result:** No edits needed. Order was already correct.

## Files Modified
- `src/components/artist/ArtistHero.tsx` — moved social icons next to artist name

## Files Verified (no changes needed)
- `src/lib/artists.ts` — Rob Soule data already correct
- `src/components/artist/ArtistTabs.tsx` — Singles already before Albums

## Next Steps
- Review changes in dev
- When ready, commit and deploy

---
*Verified: Saturday, May 23rd, 2026 - 9:28 PM (America/Chicago)*
