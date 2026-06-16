#!/bin/bash
# scripts/verify-schema.sh
# Schema self-test: runs after every deploy (or manually) to catch missing
# tables/columns BEFORE users hit them. Fails loudly with a clear message if
# any expected schema is missing.
#
# Usage:
#   ./scripts/verify-schema.sh                              # uses .env.local
#   SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… ./scripts/verify-schema.sh
#
# Returns exit 0 on success, exit 1 on failure.
# In CI (or Vercel post-deploy hook), a non-zero exit would block promotion.

set -e

# Load from .env.local if no env vars are set
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  if [ -f .env.local ]; then
    export SUPABASE_URL="$(grep -E '^NEXT_PUBLIC_SUPABASE_URL' .env.local | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'")"
    export SUPABASE_SERVICE_ROLE_KEY="$(grep -E '^SUPABASE_SERVICE_ROLE_KEY' .env.local | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'")"
  fi
fi

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set"
  exit 1
fi

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

FAIL_COUNT=0
PASS_COUNT=0

# Helper: check that a table exists by attempting a query
# Usage: check_table <table_name> <primary_key_column>
check_table() {
  local table_name="$1"
  local pk_column="${2:-id}"
  local result=$(curl -sS --max-time 10 "$SUPABASE_URL/rest/v1/$table_name?select=$pk_column&limit=1" \
    -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" 2>/dev/null)

  if echo "$result" | grep -q '"PGRST205"'; then
    echo -e "  ${RED}✗${NC} MISSING TABLE: $table_name"
    FAIL_COUNT=$((FAIL_COUNT + 1))
    return 1
  elif echo "$result" | grep -q '"PGRST204"'; then
    echo -e "  ${RED}✗${NC} MISSING PK COLUMN $pk_column on $table_name"
    FAIL_COUNT=$((FAIL_COUNT + 1))
    return 1
  elif echo "$result" | grep -q '"42703"'; then
    echo -e "  ${RED}✗${NC} MISSING PK COLUMN $pk_column on $table_name"
    FAIL_COUNT=$((FAIL_COUNT + 1))
    return 1
  else
    echo -e "  ${GREEN}✓${NC} $table_name (PK: $pk_column)"
    PASS_COUNT=$((PASS_COUNT + 1))
    return 0
  fi
}

# Helper: check that a column exists on a table
check_column() {
  local table_name="$1"
  local column_name="$2"
  local result=$(curl -sS --max-time 10 "$SUPABASE_URL/rest/v1/$table_name?select=$column_name&limit=1" \
    -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" 2>/dev/null)

  if echo "$result" | grep -q '"PGRST204"'; then
    echo -e "  ${RED}✗${NC} MISSING COLUMN: $table_name.$column_name"
    FAIL_COUNT=$((FAIL_COUNT + 1))
    return 1
  elif echo "$result" | grep -q '"PGRST205"'; then
    echo -e "  ${RED}✗${NC} MISSING TABLE: $table_name (can't check column)"
    FAIL_COUNT=$((FAIL_COUNT + 1))
    return 1
  else
    echo -e "  ${GREEN}✓${NC} $table_name.$column_name"
    PASS_COUNT=$((PASS_COUNT + 1))
    return 0
  fi
}

echo "==================================================================="
echo "  Porterful schema self-test"
echo "  Supabase: $SUPABASE_URL"
echo "==================================================================="
echo ""
echo "Required tables (with each table's primary key column):"
# Use sequential checks because bash 3.2 (default on macOS) doesn't support
# associative arrays.
check_table "artists" "id"
check_table "profiles" "id"
check_table "tracks" "id"
check_table "artist_applications" "id"
check_table "artist_videos" "video_id"
check_table "products" "id"

echo ""
echo "Required columns on artists:"
for col in id name slug bio genre city avatar_url cover_url verified status public_profile_enabled tiktok_url x_url appearance social_links; do
  check_column "artists" "$col"
done

echo ""
echo "==================================================================="
if [ "$FAIL_COUNT" -gt 0 ]; then
  echo -e "${RED}✗ FAILED${NC}: $FAIL_COUNT missing, $PASS_COUNT present"
  echo ""
  echo "To fix: check the corresponding migration in supabase/migrations/"
  echo "and apply it via the Supabase dashboard SQL editor or supabase CLI."
  exit 1
else
  echo -e "${GREEN}✓ PASSED${NC}: $PASS_COUNT checks"
  exit 0
fi
