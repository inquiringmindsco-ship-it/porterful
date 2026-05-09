# Porterful TODO Log

## 2026-05-08 — Site Improvements Batch 1 (cron re-verification)

Cron job re-checked all three items. Code already in place from 05-07 commit `a4236fd0` — no new edits needed.

1. **Rob Soule artist data** (`src/lib/artists.ts`)
   - Genre: `Hip-Hop / R&B / Blues` ✓
   - Bio: "St. Louis hip-hop and R&B artist blending blues into a soulful sound" ✓

2. **Social media buttons on artist profile** (`src/components/artist/ArtistHero.tsx`)
   - Instagram, Twitter/X, YouTube, TikTok icons rendered via `SOCIAL_ICONS` from `@/lib/artist-social` ✓
   - Positioned in profile header below artist badges ✓

3. **Featured Singles before Albums** (`src/components/artist/ArtistTabs.tsx`)
   - `playableSingles` section renders above `albumGroups` ✓

**Status:** No changes made. Not committed or deployed.
