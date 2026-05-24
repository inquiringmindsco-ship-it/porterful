# Porterful Site Improvements — Batch 1 (2026-05-23)

## Changes Made (NOT committed or deployed)

### 1. Rob Soule Artist Data Fix
**File:** `src/lib/artists.ts`
- **Genre:** Already correct (`'Hip-Hop / R&B / Blues'`)
- **Bio:** Updated to: *"Rob Soule is a St. Louis hip-hop and R&B artist blending blues influences into a soulful, modern sound deeply rooted in the city's music scene."*

### 2. Social Media Buttons on Artist Profile
**File:** `src/components/artist/ArtistHero.tsx` — Already implemented.
- Instagram, Twitter/X, YouTube, and TikTok icons already render next to the artist name when social fields are populated in `artist.social`.
- Uses `SOCIAL_ICONS` and `normalizeSocialUrl` from `@/lib/artist-social`.
- No code changes needed — functionality verified present.

### 3. Featured Singles Before Albums
**File:** `src/components/artist/ArtistTabs.tsx` — Already correct.
- The "Featured Singles" section is rendered **before** the "Albums & Projects" section in the Music tab.
- No code changes needed — order verified correct.

## Git Status
- `src/lib/artists.ts`: 1 line changed (bio update)
- All other requested features were already in place.

## Next Steps
- Review changes with Od
- Commit and deploy when approved
