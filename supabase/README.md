# Porterful — Supabase Schema

This directory contains all SQL migrations for the Porterful Supabase project.
Project ref: `tsdjmiqczgxnkpvirkya`
URL: `https://tsdjmiqczgxnkpvirkya.supabase.co`

## ⚠️ APPLYING MIGRATIONS — READ FIRST

**Always apply migrations in two ways:**

1. **The migration file is committed to this repo** (`supabase/migrations/0XX_*.sql`).
2. **It must ALSO be applied to live Supabase.** Until step 2 happens, the code
   will fail at runtime — silently in some places, loudly in others.

There is no automatic migration runner wired up. Migrations are applied
manually in the Supabase dashboard SQL editor or via `supabase db query`
(with a personal access token).

## 🚨 CRITICAL — KNOWN SCHEMA GAPS THAT ALREADY HAPPENED

These were the gaps that bit us in June 2026:

| # | Date | Gap | Symptom | Lesson |
|---|---|---|---|---|
| 1 | 2026-04-16 | `tiktok_url` / `x_url` columns missing on `artists` | "Could not find the 'tiktok_url' column" | Migration 027 was written but never applied to live DB |
| 2 | 2026-06-15 | `artist_applications` table missing entirely | `/api/artist-application` POST returns 500, every application silently fails | The 018 migration did `ALTER TABLE artist_applications ADD COLUMN IF NOT EXISTS …` — but the table didn't exist, so the ALTER was a silent no-op. The original `CREATE TABLE` was never in any migration file |
| 3 | 2026-06-15 | `user_id` vs `id` (PK) confusion on artists insert | Auto-approved artists got 200 response but no artists row | The `artists` table has `id UUID REFERENCES profiles(id) PRIMARY KEY` — the PK IS the user_id, there's no `user_id` column. Code was sending `user_id` instead of `id` |

**Fix in place:**
- `scripts/verify-schema.sh` — runs against live DB, fails loudly on missing
  tables/columns. Run after every deploy, or hook into CI.
- Migration 046 — created the missing `artist_applications` table with all
  the columns the code expects (including the 018 additions).

## 📋 HOW TO APPLY A NEW MIGRATION

### Option A: Supabase Dashboard (recommended, fastest, 30 seconds)

1. Open https://supabase.com/dashboard/project/tsdjmiqczgxnkpvirkya/sql/new
2. Open the migration file from `supabase/migrations/0XX_name.sql`
3. Copy/paste the contents into the SQL editor
4. Click "Run" (or Cmd/Ctrl + Enter)
5. Verify with `./scripts/verify-schema.sh`

### Option B: Supabase CLI (requires personal access token)

```bash
# Get a personal access token from:
#   https://supabase.com/dashboard/account/tokens

export SUPABASE_ACCESS_TOKEN=...

# Apply a single migration file
supabase db query --file supabase/migrations/046_artist_applications_create.sql --linked

# Verify
./scripts/verify-schema.sh
```

### Option C: Supabase Management API (not used; requires personal access token)

```bash
curl -X POST "https://api.supabase.com/v1/projects/tsdjmiqczgxnkpvirkya/database/query" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d @- <<'JSON'
{ "query": "..." }
JSON
```

## 🧪 VERIFYING SCHEMA AFTER ANY DEPLOY

```bash
./scripts/verify-schema.sh
```

Expected output: `✓ PASSED: 21 checks` (or whatever the current count is).

If the count is lower than expected, a migration is missing.

## 🗂️ MIGRATION FILE NAMING

We use **two formats** in this repo (please don't add new files in a third format):

- `NNN_name.sql` — legacy, used 002–045
- `YYYY-MM-DD-name.sql` — newer, used for ad-hoc fixes (e.g. 2026-04-10-commerce-alignment.sql)
- `ARCHIVED_*.sql` — old, broken versions kept for reference (do not apply)

**New files should follow the NNN_name.sql format with the next available number.**

## 🛡️ SAFE-MIGRATION RULES

When writing a new migration:

1. **Always use `IF NOT EXISTS`** on `CREATE TABLE`, `ADD COLUMN`, `CREATE INDEX` so re-runs are safe.
2. **Never ALTER a table that may not exist** — check with `to_regclass('public.tablename')` first or wrap in DO block.
3. **Enable RLS** on every new table.
4. **Add a `created_at TIMESTAMPTZ DEFAULT NOW()`** to every new table.
5. **Add a comment** at the top of the file explaining the why.
6. **Update `scripts/verify-schema.sh`** to include the new table/column in the self-test.

## 📊 CURRENT SCHEMA (50 tables as of 2026-06-15)

See `scripts/verify-schema.sh` for the canonical list of required tables/columns.
Full introspection: `curl https://tsdjmiqczgxnkpvirkya.supabase.co/rest/v1/ -H "apikey: ..."` (returns the PostgREST schema cache).
