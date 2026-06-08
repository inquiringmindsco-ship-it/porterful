# Porterful TODO / Dev Log

## 2026-06-08 — Site Improvements Batch 1

Completed at 3:11 PM CST (Monday, June 8, 2026). Changes saved. NOT committed or deployed.

### 1. Rob Soule Artist Data — VERIFIED ✅
- File: `src/lib/artists.ts`
- Genre: already correct → `'Hip-Hop / R&B / Blues'`
- Bio: already correct → "St. Louis hip-hop and R&B artist blending blues into a soulful sound"
- No changes needed — data was already accurate.

### 2. Social Media Buttons — ALREADY IMPLEMENTED ✅
- File: `src/components/artist/ArtistHero.tsx` (lines ~127-146)
- Instagram, Twitter/X, YouTube, TikTok icons already render as circular buttons next to the artist name in the profile header.
- Uses `SOCIAL_ICONS` from `src/lib/artist-social.tsx`.
- No changes needed — feature was already live.

### 3. Singles Before Albums — FIXED ✅
- File: `src/components/artist/ArtistTabs.tsx`
- Moved the **Singles** section above the **Albums** section in the Music tab.
- New order on artist pages: Featured Tracks → Music (all tracks) → **Singles** → **Albums** → Collaborators.

### Files Touched
- `src/components/artist/ArtistTabs.tsx` — reordered Singles above Albums

### Next Steps
- Commit and deploy when ready.

---
