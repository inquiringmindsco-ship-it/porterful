# Porterful Site Improvements — Batch 1 (2026-04-29)

## Requested Changes
1. Fix Rob Soule genre + bio
2. Add social media buttons (IG, X, YouTube, TikTok) to artist profile header
3. Move Featured Singles section above Albums on artist pages

## Status
All three changes were **already present** in the codebase at time of check:

- `src/lib/artists.ts` — Rob Soule genre is `'Hip-Hop / R&B / Blues'` and bio reads "Rob Soule is a St. Louis hip-hop and R&B artist blending blues into a soulful sound."
- `src/components/artist/ArtistHero.tsx` — Social icon buttons (Instagram, Twitter/X, YouTube, TikTok) rendered conditionally under artist name in profile header
- `src/components/artist/ArtistTabs.tsx` — Singles section positioned before Albums/Projects section

No new edits were required. Nothing committed or deployed.
