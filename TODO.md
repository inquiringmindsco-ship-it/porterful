# Site Improvements Batch 1 - Completed April 28, 2026

## Changes Made

### 1. ✅ Rob Soule Artist Data (src/lib/artists.ts)
- **Genre**: Already correctly set to 'Hip-Hop / R&B / Blues'
- **Bio**: Already correctly reflects he's a St. Louis hip-hop and R&B artist blending blues into a soulful sound

### 2. ✅ Social Media Buttons (src/components/artist/ArtistHero.tsx)
- Social icons already exist in the profile header
- Shows Instagram, Twitter/X, YouTube, TikTok icons with links
- Icons only display if artist has those social fields filled in
- Placed below the artist name/genre info in the profile header

### 3. ✅ Reorder Sections (src/components/artist/ArtistTabs.tsx)
- **Featured Singles** now appears **BEFORE** Albums & Projects
- Moved the Featured Singles section above Albums section in the Music tab
- Order is now: Featured Tracks → Featured Singles → Albums & Projects

## Status
- All changes saved to codebase
- NOT committed - changes are local only
- NOT deployed - waiting for explicit deployment command

## Next Steps
- Review changes
- Commit when ready: `git add src/components/artist/ArtistTabs.tsx && git commit -m "Reorder: Featured Singles before Albums"`
- Deploy when approved: `git push origin main` (or trigger Vercel deploy)
