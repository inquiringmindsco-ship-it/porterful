# Migration 018 Verification Report

## Summary
Migration 018 adds rights confirmation and music license type tracking to artist applications.

## Changes Implemented

### 1. Code Changes (Committed to main)
- `src/app/(app)/apply/form/page.tsx` - Updated form UI with:
  - Terms of Service checkbox (required)
  - Rights confirmation checkbox (required)
  - License type selection: Non-Exclusive (default) vs Porterful Exclusive
  - Review page shows selected license type
  - Submit button validation

- `src/app/(app)/api/artist-application/route.ts` - API now stores:
  - `agree_rights` (boolean)
  - `music_license_type` ('non_exclusive' | 'porterful_exclusive')

### 2. Database Migration
File: `supabase/migrations/018_artist_application_license_type.sql`

Adds:
- `agree_rights BOOLEAN DEFAULT FALSE`
- `music_license_type TEXT DEFAULT 'non_exclusive'`
- Constraint: CHECK (music_license_type IN ('non_exclusive', 'porterful_exclusive'))
- Index: idx_artist_applications_license_type
- Backfill: Existing records default to 'non_exclusive'

## Deployment Status

### GitHub
✅ Committed: `9548f52a Fix artist signup terms: add rights confirmation and explicit license type selection`

### Vercel
⏳ Queued for deployment (last seen: 7m ago)

### Supabase
⏳ Migration NOT YET RUN - requires manual execution in SQL Editor

## Required Next Steps

### Step 1: Run Migration in Supabase
1. Go to https://supabase.com/dashboard/project/tsdjmiqczgxnkpvirkya
2. Navigate to SQL Editor
3. Open or paste: `supabase/migrations/018_artist_application_license_type.sql`
4. Click "Run"
5. Verify output shows columns added

### Step 2: Verify Migration Applied
Run this SQL to confirm:
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'artist_applications'
AND column_name IN ('agree_rights', 'music_license_type');
```

Expected result:
| column_name | data_type | is_nullable | column_default |
|-------------|-----------|-------------|----------------|
| agree_rights | boolean | YES | false |
| music_license_type | text | YES | 'non_exclusive' |

### Step 3: Test Application Flow
1. Go to https://porterful.com/apply/form
2. Complete Steps 1-4
3. On Step 5, verify:
   - [ ] Two checkboxes visible (Terms, Rights)
   - [ ] License type radio buttons visible
   - [ ] Non-Exclusive selected by default
   - [ ] "Recommended" badge on Non-Exclusive
4. Submit with Non-Exclusive selected
5. Check Supabase row for:
   - agree_rights: true
   - music_license_type: 'non_exclusive'

### Step 4: Test Exclusive Selection
1. Submit another test application
2. Select "Porterful Exclusive"
3. Verify row shows:
   - agree_rights: true
   - music_license_type: 'porterful_exclusive'

## Verification Checklist

- [ ] Migration SQL executed in Supabase
- [ ] Columns visible in Table Editor
- [ ] Non-exclusive test submit successful
- [ ] Exclusive test submit successful
- [ ] Review page displays correct license type
- [ ] Existing applications not broken

## Rollback Plan

If issues occur:
```sql
-- Remove constraint first
ALTER TABLE artist_applications DROP CONSTRAINT IF EXISTS valid_music_license_type;

-- Drop columns
ALTER TABLE artist_applications DROP COLUMN IF EXISTS agree_rights;
ALTER TABLE artist_applications DROP COLUMN IF EXISTS music_license_type;

-- Drop index
DROP INDEX IF EXISTS idx_artist_applications_license_type;
```

## Notes
- The API is backwards-compatible - it will still work if columns don't exist yet (won't crash)
- New fields are required for submission but have defaults in DB
- Existing applications are set to non_exclusive by default
