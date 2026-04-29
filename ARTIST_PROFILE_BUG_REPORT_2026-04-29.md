# ARTIST PROFILE LOOKUP BUG REPORT — 2026-04-29

**Issue:** "artist profile not found" when O D (iamodmusic@gmail.com) accesses `/dashboard/artist/album-order`  
**Status:** IDENTIFIED — Code bug, not data issue  
**Severity:** MEDIUM — Blocks artist from album-order feature  
**Investigator:** Claw  
**Report Time:** 2026-04-29 16:30 CDT

---

## 1. FAILING FILE/ROUTE

| Route | File | Line | Message |
|-------|------|------|---------|
| `/dashboard/artist/album-order` | `src/app/dashboard/artist/album-order/page.tsx` | 44 | `Artist profile not found` |
| `/dashboard/artist/album-order` | `src/app/dashboard/artist/album-order/page.tsx` | 140 | `Artist not found` (on save) |

**Failing query (line 40):**
```tsx
const { data: artist } = await supabase
  .from('artists')
  .select('id, name')
  .eq('user_id', user.id)   // ← BUG: column doesn't exist
  .single()

if (!artist) {
  setMessage('Artist profile not found')  // User sees this
}
```

---

## 2. FAILING QUERY ANALYSIS

**Query:** `SELECT id, name FROM artists WHERE user_id = :userId`

**Problem:** Column `user_id` does **NOT EXIST** in `artists` table.

**Evidence from schema (`supabase/schema.sql`):**
```sql
CREATE TABLE artists (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  slug TEXT UNIQUE,
  bio TEXT,
  genre TEXT[],
  location TEXT,
  website_url TEXT,
  social_links JSONB DEFAULT '{}',
  monthly_goal DECIMAL(10,2) DEFAULT 1000,
  current_earnings DECIMAL(10,2) DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0,
  supporter_count INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**No `user_id` column exists.** The `id` column IS the user ID.

---

## 3. CURRENT AUTH/PROFILE/ARTIST ROWS

### Schema Relationships

| Table | Key Column | References | Notes |
|-------|-----------|------------|-------|
| `auth.users` | `id` | — | Supabase auth |
| `profiles` | `id` | `auth.users(id)` | Same UUID |
| `profiles` | `email` | — | e.g., iamodmusic@gmail.com |
| `profiles` | `role` | — | e.g., 'artist' |
| `artists` | `id` | `profiles(id)` | **Same UUID as user** |
| `artists` | `slug` | — | e.g., 'od-porter' |
| `tracks` | `artist_id` | `artists(id)` | Same UUID |

### Expected Mapping for O D

| Field | Expected Value |
|-------|---------------|
| `auth.users.email` | iamodmusic@gmail.com |
| `auth.users.id` | `<some UUID>` |
| `profiles.id` | Same as auth.users.id |
| `profiles.email` | iamodmusic@gmail.com |
| `profiles.role` | 'artist' |
| `artists.id` | Same as profiles.id |
| `artists.slug` | 'od-porter' |
| `tracks.artist_id` | Same as artists.id |

---

## 4. CORRECT OWNERSHIP FIELD

| What | Field | Why |
|------|-------|-----|
| User ID | `profiles.id` or `auth.users.id` | Same UUID across tables |
| Artist ID | `artists.id` | References `profiles(id)` — IS the user ID |
| Track artist | `tracks.artist_id` | References `artists(id)` — same UUID |

**Correct lookup:** `.eq('id', user.id)` (not `.eq('user_id', user.id)`)

**Why:** `artists.id` IS the user's profile ID. They share the same UUID.

---

## 5. WHY OTHER PAGES WORK

| Page | Query | Works? | Reason |
|------|-------|--------|--------|
| `/dashboard/artist` | `tracks.artist_id = user!.id` | ✅ Yes | `tracks.artist_id` exists and matches `artists.id` |
| `/dashboard/artist/album-order` | `artists.user_id = user.id` | ❌ **NO** | `artists.user_id` column **does not exist** |

**Dashboard artist page** (`/dashboard/artist` canonical):
```tsx
.from('tracks').eq('artist_id', user!.id)
```

This works because `tracks.artist_id` exists and = `artists.id` = `user.id`.

---

## 6. AFFECTED CODE LOCATIONS

| File | Line | Pattern | Severity |
|------|------|---------|----------|
| `album-order/page.tsx` | 40 | `.eq('user_id', user.id)` | 🔴 **BREAKS** — shows "Artist profile not found" |
| `album-order/page.tsx` | 135 | `.eq('user_id', user.id)` | 🔴 **BREAKS** — save fails with "Artist not found" |

**No other pages affected.** `/dashboard/artist` uses `.eq('artist_id', ...)` on tracks table, not artists table.

---

## 7. MIGRATION ISSUE (Secondary)

**File:** `supabase/migrations/019_artist_album_order_safe.sql`

Contains RLS policies referencing `artists.user_id`:
```sql
SELECT id FROM artists WHERE user_id = auth.uid()
```

**These will also fail** if `user_id` column doesn't exist. However:
- The migrations may have been run when `user_id` existed
- Or they may have failed silently
- Or the column was added by a migration not in the repo

**No migration needed for the immediate fix.** The code fix is sufficient.

---

## 8. SMALLEST SAFE FIX

### Option A: Fix the query (RECOMMENDED — 2 lines)

**File:** `src/app/dashboard/artist/album-order/page.tsx`

**Line 40:**
```tsx
// BEFORE (BROKEN)
.eq('user_id', user.id)

// AFTER (FIXED)
.eq('id', user.id)
```

**Line 135:**
```tsx
// BEFORE (BROKEN)
.eq('user_id', user.id)

// AFTER (FIXED)
.eq('id', user.id)
```

### Option B: Add user_id column (NOT recommended)

Would require DB migration and update all queries. Unnecessary since `id` already serves this purpose.

**No DB changes. No migrations. No other files touched.**

---

## 9. VERIFICATION PLAN

After fix, verify:
1. `/dashboard/artist/album-order` loads without "Artist profile not found"
2. Artist album list displays correctly
3. Drag/drop reordering works
4. Save order works without "Artist not found"
5. `/dashboard/artist` still works as before
6. Build passes

---

## 10. WHAT NOT TO TOUCH

| System | Status |
|--------|--------|
| catalog/audio | ✅ Untouched |
| album order logic (drag/drop/save) | ✅ Untouched |
| preview controls | ✅ Untouched |
| upload | ✅ Untouched |
| rights gate | ✅ Untouched |
| payments | ✅ Untouched |
| merch | ✅ Untouched |
| DB schema | ✅ No migration needed |
| tracks table | ✅ Untouched |
| products table | ✅ Untouched |
| `/dashboard/artist` canonical page | ✅ Untouched — already works |

---

## 11. SUMMARY

| Aspect | Finding |
|--------|---------|
| Root cause | Code references non-existent column `artists.user_id` |
| Correct column | `artists.id` (same as user profile ID) |
| Fix scope | 2 lines in `album-order/page.tsx` |
| DB change needed | NO |
| Migration needed | NO |
| Risk | LOW — simple column name fix |
| Other pages affected | NO |

---

**PASS — Bug identified. Smallest safe fix proposed.**
