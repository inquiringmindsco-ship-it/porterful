import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

/**
 * GET /api/health/schema
 *
 * Public health endpoint that checks whether the required Supabase tables and
 * columns exist. Returns a structured report. Useful for:
 *   - Manually verifying schema health after a migration
 *   - Diagnosing 404/500 errors that might be schema-related
 *   - CI / monitoring
 *
 * Returns 200 with `{ ok: true, checks: [...] }` if all pass.
 * Returns 503 with `{ ok: false, checks: [...], missing: [...] }` if any fail.
 */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { ok: false, error: 'Supabase env vars not configured' },
      { status: 500 },
    )
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  })

  type Check = {
    name: string
    type: 'table' | 'column'
    table: string
    column?: string
    ok: boolean
    error?: string
  }

  const checks: Check[] = []
  const missing: string[] = []

  // Required tables
  const requiredTables = [
    'artists',
    'profiles',
    'tracks',
    'artist_applications',
    'artist_videos',
    'products',
  ]

  for (const table of requiredTables) {
    const { error } = await supabase.from(table).select('id', { count: 'exact', head: true })
    const ok = !error
    checks.push({ name: `table:${table}`, type: 'table', table, ok, error: error?.message })
    if (!ok) missing.push(`table ${table}: ${error?.message}`)
  }

  // Required columns on artists
  const requiredArtistColumns = [
    'id',
    'name',
    'slug',
    'bio',
    'genre',
    'city',
    'avatar_url',
    'cover_url',
    'verified',
    'status',
    'public_profile_enabled',
    'tiktok_url',
    'x_url',
    'appearance',
    'social_links',
  ]

  for (const column of requiredArtistColumns) {
    const { error } = await supabase.from('artists').select(column, { count: 'exact', head: true })
    const ok = !error
    checks.push({ name: `column:artists.${column}`, type: 'column', table: 'artists', column, ok, error: error?.message })
    if (!ok) missing.push(`column artists.${column}: ${error?.message}`)
  }

  const allOk = missing.length === 0

  return NextResponse.json(
    {
      ok: allOk,
      summary: {
        total: checks.length,
        passing: checks.filter((c) => c.ok).length,
        failing: checks.filter((c) => !c.ok).length,
      },
      checks,
      missing,
      remediation: allOk
        ? null
        : 'Run scripts/verify-schema.sh locally to see what is missing. ' +
          'Then apply the corresponding migration from supabase/migrations/ via the Supabase dashboard SQL editor.',
    },
    { status: allOk ? 200 : 503 },
  )
}
