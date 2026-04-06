# Artist Onboarding — Uniform Template

## Folder Structure Required

```
public/artist-images/{SLUG}/
├── avatar.jpg        ← REQUIRED: Square profile pic (500x500+)
├── cover.jpg         ← OPTIONAL: Wide banner image
├── audio/            ← Music files (mp3, m4a)
│   ├── track-1.mp3
│   └── track-2.mp3
└── products/         ← OPTIONAL: Merch images
```

## Artist Data Template

```typescript
{
  id: '{slug}',
  name: '{Full Name}',
  slug: '{url-slug}',
  genre: 'Hip-Hop',           // Primary genre
  location: 'St. Louis, MO',
  bio: `{Bio text - 2-3 sentences}`,
  shortBio: '{One line description}',
  verified: true,              // Always true for now
  image: '/artist-images/{slug}/avatar.jpg',  // ALWAYS this path format
  coverGradient: 'from-orange-500 to-red-600', // Match brand colors
  followers: 0,
  supporters: null,
  earnings: null,
  products: 0,
  trackCount: {N},             // Number of tracks
  social: {
    instagram: '{handle}',      // Without @
    youtube: '{channel}',      // Without @
    tiktok: '{handle}',
    twitter: '{handle}',
  },
  coverSlides: [
    { src: '/artist-images/{slug}/avatar.jpg', alt: '{Name}' },
  ],
},
```

## Track Data Template

```typescript
{ id: '{slug}-01', title: '{Track Name}', artist: '{Artist Name}', album: 'Singles', duration: '3:30', price: 1, plays: 0, image: '/artist-images/{slug}/avatar.jpg', audio_url: '/artist-images/{slug}/audio/track-name.mp3' },
```

## Adding a New Artist — Step by Step

### Step 1: Image Prep
- [ ] Get artist avatar (square, 500x500+)
- [ ] Save as `avatar.jpg` in `/artist-images/{slug}/`
- [ ] Resize/crop if needed

### Step 2: Audio Prep
- [ ] Get audio files (mp3 or m4a)
- [ ] Rename to clean format: `Track-Name.mp3`
- [ ] Place in `/artist-images/{slug}/audio/`

### Step 3: Add to artists.ts
- [ ] Add artist object to `ARTISTS` array
- [ ] Use exact template above
- [ ] Image path MUST be `/artist-images/{slug}/avatar.jpg`

### Step 4: Add Tracks to data.ts
- [ ] Add track objects to `TRACKS` array
- [ ] Use exact template above
- [ ] Set plays to 0 for new artists

### Step 5: Deploy
- [ ] Build: `npm run build`
- [ ] Deploy: `vercel --prod --yes`
- [ ] Verify: Check `/artist/{slug}` loads

## Color Gradients Reference

| Artist | Gradient |
|--------|----------|
| O D Porter | `from-[var(--pf-orange)] to-purple-600` |
| Gune | `from-red-600 to-orange-600` |
| Nikee Turbo | `from-yellow-500 to-orange-500` |
| ATM Trap | `from-gray-800 to-gray-900` |
| Rob Soule | `from-purple-600 to-blue-600` |

## Notes

- Avatar path is ALWAYS `/artist-images/{slug}/avatar.jpg`
- Audio path is ALWAYS `/artist-images/{slug}/audio/{filename}.mp3`
- No nested `/images/` or `/images/` subfolder in path
- social links without @ symbol
- `trackCount` should match actual number of tracks added
