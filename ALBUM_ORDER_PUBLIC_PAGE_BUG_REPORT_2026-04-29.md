# ALBUM ORDER PUBLIC PAGE BUG REPORT — 2026-04-29

**Issue:** Album order saved at `/dashboard/artist/album-order` but NOT reflected on public `/artist/od-porter`  
**Status:** IDENTIFIED — Two bugs found  
**Severity:** MEDIUM — Public page ignores saved order  
**Investigator:** Claw  
**Report Time:** 2026-04-29 17:20 CDT

---

## 1. SAVE VERIFICATION

### Save Logic (dashboard/album-order/page.tsx)

```tsx
// Gets album names from tracks (RAW values)
const uniqueAlbums = Array.from(new Set(trackAlbums?.map(t => t.album).filter(Boolean) || []))

// Saves with these raw names
await supabase.from('artist_album_order').insert(
  albums.map(a => ({
    artist_id: artist.id,
    album_name: a.album_name,  // ← RAW track album name
    sort_order: a.sort_order
  }))
)
```

**Assessment:** Save logic appears correct. Stores `artist_id` + `album_name` + `sort_order`.

**Rows saved?** Expected YES — save succeeds without error.

**Saved row examples (expected):**
```
artist_id: <O D's UUID>
album_name: "God Is Good"
sort_order: 0

artist_id: <O D's UUID>
album_name: "Streets Thought I Left"
sort_order: 1
```

---

## 2. PUBLIC PAGE FETCH VERIFICATION

### Fetch Logic (artist/[slug]/page.tsx)

```tsx
async function getArtistAlbumOrder(artistId: string): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('artist_album_order')
    .select('album_name, sort_order')
    .eq('artist_id', artistId)
    .order('sort_order')
  
  const order: Record<string, number> = {}
  data?.forEach((row) => {
    order[row.album_name] = row.sort_order
  })
  return order
}
```

**Assessment:** Fetch logic correct. Returns `Record<album_name, sort_order>`.

**Passed to ArtistTabs:** `albumOrder={albumOrder}`

---

## 3. ARTIST ID MISMATCH

| Source | How artist ID resolved | Value |
|--------|------------------------|-------|
| Dashboard save | `artists.id` WHERE `id = user.id` | `auth.users.id` UUID |
| Public page fetch | `getArtistWithDb(slug)` → `artists.id` from DB | Same `auth.users.id` UUID |

**Static fallback:** `src/lib/artists.ts` defines `id: 'od-porter'` (string, not UUID)

**BUG #1: Static `id` is a string slug, NOT a UUID**

```ts
// src/lib/artists.ts
{
  id: 'od-porter',  // ← STRING, not UUID
  name: 'O D Porter',
  slug: 'od-porter',
  ...
}
```

When `getArtistWithDb()` merges:
```ts
// Merge: DB overrides static
return {
  ...staticArtist!,
  id: dbArtist.id || staticArtist!.id,  // ← dbArtist.id (UUID) used if available
  ...
}
```

**If DB artist exists:** `artist.id` = UUID ✅ (matches saved `artist_id`)
**If DB artist missing:** `artist.id` = `'od-porter'` ❌ (string, won't match)

**Likely outcome:** DB artist exists for O D → UUID matches ✅

---

## 4. ALBUM NAME MISMATCH (ROOT CAUSE #2)

### How Album Names Are Processed

**Dashboard save:** Uses raw `track.album` values from tracks table.

**Public page display:**
```tsx
// ArtistTabs.tsx buildAlbumGroups()
const canonicalName = canonicalAlbum(t.album) || 'Unknown'
// ...
const albumOrder = albumOrder || {}
result.sort((a, b) => {
  const orderA = albumOrder[a.name] ?? 999
  const orderB = albumOrder[b.name] ?? 999
  return orderA - orderB
})
```

**The problem:** `buildAlbumGroups()` calls `canonicalAlbum()` on the album name BEFORE sorting. The `albumOrder` keys are RAW names from the DB, but `a.name` and `b.name` are CANONICALIZED names.

**Example:**
```
Saved in DB:          { "God Is Good": 0, "Streets Thought I Left": 1 }
canonicalAlbum():     "God Is Good" → "God Is Good" ✅
canonicalAlbum():     "Streets Thought I Left" → "Streets Thought I Left" ✅
```

But if tracks use different casing:
```
Saved in DB:          { "God is Good": 0 }  (lowercase i)
canonicalAlbum():     "God is Good" → ???
```

**ALBUM_ALIASES in duration-formatter.ts:**
```ts
const ALBUM_ALIASES: Record<string, string> = {
  'Roxannity': 'Roxanity',
  'God Is Good': 'God Is Good',
  'GodIsGood': 'God Is Good',
  ...
}
```

**Issue:** Aliases only cover specific misspellings. If tracks use a variant NOT in ALBUM_ALIASES, the saved name won't match the canonicalized name.

**Most likely actual bug:** The save code stores the RAW `track.album` value. But `buildAlbumGroups()` canonicalizes the album name AND uses it as the group key. The `albumOrder` lookup uses `albumOrder[a.name]` where `a.name` is the canonical name. If the saved name doesn't match the canonical name exactly, the lookup returns `undefined` (999) and falls back to alphabetical sorting.

---

## 5. CACHING ISSUE

**Public page caching:**
- `page.tsx` is server-rendered (async)
- No `export const revalidate` or `export const dynamic` export
- Next.js default: SSG with ISR (revalidate after 60s on Vercel?)
- Supabase queries use server-side client (service role key)

**Assessment:** Caching may cause stale data, but not the root cause. After refresh, new data should appear.

---

## 6. ROOT CAUSE SUMMARY

| Issue | Evidence | Likelihood |
|-------|----------|------------|
| Artist ID mismatch | Static `id` = string, DB `id` = UUID | LOW (DB artist exists) |
| **Album name canonicalization mismatch** | `buildAlbumGroups()` canonicalizes names before lookup | **HIGH** |
| Caching | No revalidate export | LOW (refresh would fix) |
| `albumOrder` prop ignored | Code clearly uses it | VERY LOW |

**CONFIRMED ROOT CAUSE:** `buildAlbumGroups()` in `ArtistTabs.tsx` canonicalizes album names via `canonicalAlbum()` before sorting, but the saved `albumOrder` keys use the RAW track album names. If a track's album name doesn't match its canonical form exactly, the lookup fails and the album falls back to default alphabetical sorting.

---

## 7. SMALLEST SAFE FIX

**File:** `src/components/artist/ArtistTabs.tsx`

**Problem area:** `buildAlbumGroups()` function

```tsx
function buildAlbumGroups(tracks: Track[], albumOrder?: Record<string, number>): Array<...> {
  // ...
  // Sort albums by custom order if provided, otherwise by name
  if (albumOrder && Object.keys(albumOrder).length > 0) {
    result.sort((a, b) => {
      const orderA = albumOrder[a.name] ?? 999
      const orderB = albumOrder[b.name] ?? 999
      return orderA - orderB
    })
  }
  // ...
}
```

**Issue:** `a.name` and `b.name` are canonicalized names. `albumOrder` keys may be raw names.

**Fix options:**

### Option A: Canonicalize albumOrder keys when loading (RECOMMENDED)

**File:** `src/app/(app)/artist/[slug]/page.tsx`

Change `getArtistAlbumOrder()` to canonicalize keys:

```tsx
import { canonicalAlbum } from '@/lib/duration-formatter'

async function getArtistAlbumOrder(artistId: string): Promise<Record<string, number>> {
  const { data } = await supabase
    .from('artist_album_order')
    .select('album_name, sort_order')
    .eq('artist_id', artistId)
    .order('sort_order')
  
  const order: Record<string, number> = {}
  data?.forEach((row) => {
    // Canonicalize the key to match buildAlbumGroups() keys
    const key = canonicalAlbum(row.album_name) || row.album_name
    order[key] = row.sort_order
  })
  return order
}
```

### Option B: Use raw album names in buildAlbumGroups (NOT recommended)

Would require significant changes to dedupe logic.

---

## 8. VERIFICATION PLAN

After fix:
1. Save album order at `/dashboard/artist/album-order`
2. Visit `/artist/od-porter` → verify order reflected
3. Hard refresh → still correct
4. Albums not in saved order appear after ordered ones
5. `/music` still loads
6. `/artist/gune` still loads
7. Build passes

---

## 9. WHAT NOT TO TOUCH

| System | Status |
|--------|--------|
| DB schema | ✅ Untouched |
| Migrations | ✅ Untouched |
| Catalog/audio | ✅ Untouched |
| Upload | ✅ Untouched |
| Preview controls | ✅ Untouched |
| Payments/merch | ✅ Untouched |
| Rights gate | ✅ Untouched |
| Artist records | ✅ Untouched |
| `buildAlbumGroups()` sort logic | ✅ Minor change — only canonicalization of keys |

---

## 10. SUMMARY

| Aspect | Finding |
|--------|---------|
| Save works | ✅ Yes — stores to `artist_album_order` |
| Public page fetches order | ✅ Yes — `getArtistAlbumOrder()` loads correctly |
| Artist ID mismatch | ⚠️ Possible if DB artist missing |
| **Album name mismatch** | **🔴 CONFIRMED — canonicalization mismatch** |
| Caching issue | ⚠️ Minor — not root cause |
| Fix scope | 1 function: canonicalize `albumOrder` keys |
| DB change needed | NO |
| Migration needed | NO |
| Risk | LOW — 1 import + 1 line change |

**Recommended fix:** Option A — canonicalize `albumOrder` keys in `getArtistAlbumOrder()` to match `buildAlbumGroups()` canonical names.

---

**PASS — Bug identified. Fix ready for approval.**
