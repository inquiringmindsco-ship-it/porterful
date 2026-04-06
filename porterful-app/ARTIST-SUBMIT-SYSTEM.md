# Artist Submit System

**When Od says "Add @artistname" — run this checklist.**

---

## Step 1: Gather Info

Ask Od for:
- Artist Name
- Instagram Handle (without @)
- YouTube URL (optional)
- Genre
- Bio (or I'll use a template)
- Location (default: "St. Louis, MO")

---

## Step 2: Download Assets

**Avatar/Profile Pic:**
```bash
# Try Instagram first (requires python and instaloader)
# Or use the YouTube channel art as fallback
```

**Music (if provided):**
```bash
# Use yt-dlp to download from YouTube/SoundCloud
yt-dlp -x --audio-format mp3 --audio-quality 0 "VIDEO_URL"
```

---

## Step 3: Process Files

**Avatar:**
- Save as: `/artist-images/{slug}/avatar.jpg`
- Size: 500x500+ recommended
- Format: JPG or PNG

**Audio:**
- Save as: `/artist-images/{slug}/audio/{track-name}.mp3`
- Clean filenames: `Track-Name.mp3` (no spaces, no special chars)

---

## Step 4: Add to artists.ts

```typescript
{
  id: '{slug}',
  name: '{Artist Name}',
  slug: '{url-slug}',
  genre: '{Genre}',
  location: '{City, State}',
  bio: `{Bio text}`,
  shortBio: '{One line}',
  verified: true,
  image: '/artist-images/{slug}/avatar.jpg',
  coverGradient: 'from-orange-500 to-red-600',
  followers: 0,
  supporters: null,
  earnings: null,
  products: 0,
  trackCount: {N},
  social: {
    instagram: '{handle}',
    youtube: '{channel}',
  },
  coverSlides: [
    { src: '/artist-images/{slug}/avatar.jpg', alt: '{Name}' },
  ],
},
```

---

## Step 5: Add Tracks to data.ts

```typescript
{ id: '{slug}-01', title: '{Track Name}', artist: '{Artist Name}', album: 'Singles', duration: '3:30', price: 1, plays: 0, image: '/artist-images/{slug}/avatar.jpg', audio_url: '/artist-images/{slug}/audio/track-name.mp3' },
```

**Track naming convention:**
- `{slug}-01` for first track, `{slug}-02` for second, etc.
- `featured: true` on the first/featured track
- Duration in `M:SS` format (estimate if unknown)
- `plays: 0` for new artists

---

## Step 6: Add to Music Page

Check `/music/page.tsx` — if there's an artist browse section, make sure the new artist is included in the `ARTISTS` array used there.

---

## Step 7: Build & Deploy

```bash
cd ~/Documents/Porterful/porterful-app
npm run build
vercel --prod --yes
```

---

## Artist Color Gradients

| Vibe | Gradient |
|------|----------|
| Dark/moody (trap, rap) | `from-gray-800 to-gray-900` |
| Energetic (bangers) | `from-orange-500 to-red-600` |
| Soulful/R&B | `from-purple-600 to-blue-600` |
| Chill/lo-fi | `from-teal-500 to-blue-600` |
| Aggressive | `from-red-600 to-orange-600` |
| Fresh/positive | `from-green-500 to-teal-600` |
| Premium/luxury | `from-yellow-500 to-orange-500` |

---

## Slug Format

- Lowercase
- No spaces — use hyphens
- Examples: `atm-trap`, `rob-soule`, `nikee-turbo`

---

## Auto-Approve Threshold (for artist apply form)

Applications auto-approve if ALL:
- ✅ Stage name
- ✅ Genre
- ✅ Bio (50+ characters)
- ✅ Email
- ✅ Phone
- ✅ At least 1 music link (Spotify, Apple Music, SoundCloud, or YouTube)

If missing any → flagged for manual review.

---

## File Locations

| File | Path |
|------|------|
| Artist Data | `src/lib/artists.ts` |
| Track Data | `src/lib/data.ts` |
| Artist Images | `public/artist-images/{slug}/` |
| Artist Audio | `public/artist-images/{slug}/audio/` |
| Artist Page | `src/app/(app)/artist/[slug]/page.tsx` |
