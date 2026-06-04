# Porterful TODO

## Site Improvements Batch 1 - Completed June 4, 2026

### 1. ✅ Rob Soule artist data fix (src/lib/artists.ts)
**Status:** Already correct — no change needed  
- Genre: `Hip-Hop / R&B / Blues` (correct)
- Bio: "St. Louis hip-hop and R&B artist blending blues into a soulful sound" (correct)
- Short bio and social links also already correct

### 2. ✅ Social media buttons on artist profile page
**File:** `src/components/artist/ArtistHero.tsx`  
**Status:** Already implemented and working  
- Social icons (Instagram, Twitter/X, YouTube, TikTok) are displayed next to the artist name in the profile header
- Uses the `SOCIAL_ICONS` map and `normalizeSocialUrl()` helper from `src/lib/artist-social.tsx`
- Buttons only appear when the artist has that social field filled in
- Styled as circular buttons with hover effects

### 3. ✅ Singles before Albums on artist pages
**File:** `src/components/artist/ArtistTabs.tsx`  
**Status:** Already correct — verified order  
- The "Featured Singles" section renders BEFORE the "Albums & Projects" section
- Comments in code explicitly note: "shown BEFORE Albums" / "shown AFTER Singles"
- This is the desired order: Featured → Singles → Albums

### 4. ✅ Pass singles before albumTracks to ArtistTabs
**File:** `src/app/(app)/artist/[slug]/page.tsx`  
**Change:** Reordered props in the `<ArtistTabs>` component so `singles` appears before `albumTracks` for consistency with the display order.

---

## Summary
All requested changes were either already implemented correctly or verified. Only one minor prop-order adjustment was made in the page component for consistency. No deployment needed — changes saved locally.

**Next batch ideas:**
- Add "Latest Release" banner on artist cards
- Improve mobile responsive spacing on artist profiles
- Add share button to artist pages
- Consider adding `website` social link support
