# Porterful Site Improvements — Batch 1 (2026-04-29)

## Requested Changes
1. Fix Rob Soule genre + bio
2. Add social media buttons (IG, X, YouTube, TikTok) to artist profile header
3. Move Featured Singles section above Albums on artist pages

## Completed 2026-04-29 18:30 CDT
All three changes verified present and correct. No new edits required.

- Rob Soule genre: `Hip-Hop / R&B / Blues` ✓
- Rob Soule bio: reflects STL hip-hop/R&B artist blending blues into a soulful sound ✓
- Social icons (IG, X/Twitter, YouTube, TikTok) rendered in `ArtistHero.tsx` under artist name ✓
- Singles section positioned before Albums & Projects in `ArtistTabs.tsx` ✓

Nothing staged, committed, or deployed.

## Status
All three changes were **already present** in the codebase at time of check:

- `src/lib/artists.ts` — Rob Soule genre is `'Hip-Hop / R&B / Blues'` and bio reads "Rob Soule is a St. Louis hip-hop and R&B artist blending blues into a soulful sound."
- `src/components/artist/ArtistHero.tsx` — Social icon buttons (Instagram, Twitter/X, YouTube, TikTok) rendered conditionally under artist name in profile header
- `src/components/artist/ArtistTabs.tsx` — Singles section positioned before Albums/Projects section

No new edits were required. Nothing committed or deployed.

## Porterful Deck Mode Backlog (2026-04-29)

Documented only for now. This is the experience-layer foundation for Porterful Deck Mode / Dock Mode on top of the existing GlobalPlayer and audio-context system.

- Real analyser-backed visualizers: Classic Bars, Circular Spectrum, Waveform, Artwork fallback
- Full-screen deck overlay with browser fullscreen toggle, minimal transport controls, and visual mode switcher
- Dock Mode use cases: sideways phone, Bluetooth speaker, tablet counter display, car-style screen, merch booth / event display
- Future EQ backlog: Flat, Bass Boost, Clear Vocals, Night Mode, Car Mode, Bass, Mid, Treble, then 10-band EQ
- Loudness normalization backlog: loudness analysis, metadata storage, normalized playback version, preserve original masters
- Guardrails: no fake waveform data, no heavy WebGL default on mobile, respect prefers-reduced-motion, keep mobile playback stable before expanding the feature set
