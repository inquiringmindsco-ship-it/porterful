# DIAGNOSTIC: Album Order Still Alphabetical

**Status:** IDENTIFIED — Artist ID mismatch confirmed
**Report Time:** 2026-04-29 17:36 CDT

---

## Root Cause Found

### The Artist Record for O D Does NOT Exist in DB

**Evidence:**
- `src/lib/artists.ts` defines O D statically:
  ```ts
  {
    id: 'od-porter',  // ← STRING slug, NOT a UUID
    name: 'O D Porter',
    slug: 'od-porter',
    ...
  }
  ```
- The DB `artists` table has NO `user_id` column (confirmed from schema.sql)
- The `artist-application` API auto-creates artists on approval, but O D was likely created BEFORE the auto-approve system existed

### What Happens on Public Page

```tsx
// artist/[slug]/page.tsx
const artist = await getArtistWithDb('od-porter')
// Returns static fallback: { id: 'od-porter', ... }

const albumOrder = await getArtistAlbumOrder(artist.id)
// Queries: SELECT * FROM artist_album_order WHERE artist_id = 'od-porter'
// Result: 0 rows (because DB uses UUIDs, not strings)

// albumOrder = {} → fallback to alphabetical sorting
```

### What Happens on Dashboard Save

```tsx
// dashboard/artist/album-order/page.tsx
const artist = await supabase
  .from('artists')
  .select('id')
  .eq('id', user.id)  // ← UUID from auth
  .single()

// artist.id = <UUID>

// Saves rows with artist_id = <UUID>
```

### The Mismatch

| Location | artist_id Value | Type |
|----------|-----------------|------|
| Dashboard save | `auth.users.id` (UUID) | UUID |
| Public page query | `'od-porter'` (static) | String |

**They never match.** Albums always fall back to alphabetical.

---

## The Fix

**We need the artist's UUID on the public page.**

### Option A: Look up artist by slug in DB (RECOMMENDED)

**File:** `src/app/(app)/artist/[slug]/page.tsx`

After `getArtistWithDb()`, query DB for the artist UUID by slug:

```tsx
const artist = await getArtistWithDb(slug)

// Get DB artist ID by slug (the UUID)
let artistId = artist.id
if (typeof artistId === 'string' && !artistId.includes('-')) {
  // Static fallback used a string slug → lookup DB UUID
  const supabase = getServerSupabase()
  const { data: dbArtist } = await supabase
    .from('artists')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()
  if (dbArtist?.id) {
    artistId = dbArtist.id
  }
}

const albumOrder = await getArtistAlbumOrder(artistId)
```

### Option B: Add DB row for O D

Run SQL to create the artist record:

```sql
-- Find O D's auth UUID
SELECT id FROM auth.users WHERE email = 'iamodmusic@gmail.com';

-- Insert artist record
INSERT INTO artists (id, slug, name, verified)
VALUES ('<uuid-from-above>', 'od-porter', 'O D Porter', TRUE)
ON CONFLICT (id) DO UPDATE SET
  slug = 'od-porter',
  name = 'O D Porter',
  verified = TRUE;
```

**Do NOT run without Od's approval.**

---

## Summary

| Issue | Finding |
|-------|---------|
| Save works | ✅ Yes — saves with UUID |
| Public query works | ✅ Yes — but uses string slug |
| **Root cause** | **Artist ID mismatch: UUID vs string slug** |
| **Fix needed** | **Get DB UUID by slug on public page** |
| DB migration | No |
| Schema change | No |
| Code change | Yes — 1 file, ~5 lines |

**Do NOT apply without Od's approval.**
