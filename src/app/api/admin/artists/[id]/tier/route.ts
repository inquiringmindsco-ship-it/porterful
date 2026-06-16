import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

/**
 * PATCH /api/admin/artists/[id]/tier
 *
 * Founder/admin only: change an artist's tier (and therefore their track
 * upload cap). The artist themselves cannot call this endpoint.
 *
 * Body: { tier: 'basic_artist' | 'verified_artist' | 'likeness_verified_artist' | 'porterful_artist' | 'exclusive_porterful_artist' }
 *
 * Tier → cap mapping (mirrored in src/app/api/tracks/route.ts):
 *   basic_artist               → 3 active tracks
 *   verified_artist            → 25 active tracks
 *   likeness_verified_artist   → 25 active tracks
 *   porterful_artist           → unlimited
 *   exclusive_porterful_artist → unlimited
 *
 * Note: admin and founder roles are also unlimited regardless of tier
 * (see /api/tracks/route.ts).
 */
const ALLOWED_TIERS = [
  'basic_artist',
  'verified_artist',
  'likeness_verified_artist',
  'porterful_artist',
  'exclusive_porterful_artist',
] as const

type AllowedTier = (typeof ALLOWED_TIERS)[number]

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json()
    const { tier, notes } = body

    if (!tier || !ALLOWED_TIERS.includes(tier as AllowedTier)) {
      return NextResponse.json(
        {
          error: `Invalid tier. Must be one of: ${ALLOWED_TIERS.join(', ')}`,
          allowed_tiers: ALLOWED_TIERS,
        },
        { status: 400 },
      )
    }

    // Verify the requesting user is founder or admin
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
          },
        },
      },
    )

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || (profile.role !== 'admin' && profile.role !== 'founder')) {
      return NextResponse.json(
        { error: 'Only founders and admins can change artist tiers' },
        { status: 403 },
      )
    }

    // Verify the target artist exists
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      { auth: { persistSession: false } },
    )

    const { data: targetArtist, error: lookupError } = await serviceSupabase
      .from('artists')
      .select('id, name, slug, artist_tier')
      .eq('id', params.id)
      .maybeSingle()

    if (lookupError) {
      return NextResponse.json({ error: lookupError.message }, { status: 500 })
    }

    if (!targetArtist) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 })
    }

    const previousTier = targetArtist.artist_tier

    // No-op: already at this tier
    if (previousTier === tier) {
      return NextResponse.json({
        success: true,
        no_change: true,
        artist: targetArtist,
        message: `${targetArtist.name} is already at tier '${tier}'.`,
      })
    }

    // Update the tier
    const { data: updated, error: updateError } = await serviceSupabase
      .from('artists')
      .update({ artist_tier: tier })
      .eq('id', params.id)
      .select('id, name, slug, artist_tier')
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Audit log (no schema change — just console.log so it shows in Vercel logs)
    console.log(
      `[TIER-CHANGE] ${session.user.id} (${profile.role}) changed ` +
        `${targetArtist.name} (${targetArtist.id}) tier: ` +
        `'${previousTier}' -> '${tier}'` +
        (notes ? ` | notes: ${notes}` : ''),
    )

    // Cap explanation
    const cap =
      tier === 'porterful_artist' || tier === 'exclusive_porterful_artist'
        ? 'unlimited'
        : tier === 'verified_artist' || tier === 'likeness_verified_artist'
          ? '25 active tracks'
          : '3 active tracks'

    return NextResponse.json({
      success: true,
      artist: updated,
      previous_tier: previousTier,
      new_tier: tier,
      cap,
      message: `${updated.name} is now '${tier.replace(/_/g, ' ')}' (${cap}).`,
    })
  } catch (error: any) {
    console.error('[tier-change] error:', error)
    return NextResponse.json(
      { error: error?.message || 'Server error' },
      { status: 500 },
    )
  }
}

/**
 * GET /api/admin/artists/[id]/tier
 *
 * Return the current tier + cap for an artist. Used by the founder
 * dashboard UI to populate the tier selector.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      { auth: { persistSession: false } },
    )

    const { data: artist, error } = await serviceSupabase
      .from('artists')
      .select('id, name, slug, artist_tier')
      .eq('id', params.id)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!artist) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 })
    }

    return NextResponse.json({
      artist,
      allowed_tiers: ALLOWED_TIERS,
      current_cap:
        artist.artist_tier === 'porterful_artist' ||
        artist.artist_tier === 'exclusive_porterful_artist'
          ? 'unlimited'
          : artist.artist_tier === 'verified_artist' ||
              artist.artist_tier === 'likeness_verified_artist'
            ? '25 active tracks'
            : '3 active tracks',
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Server error' },
      { status: 500 },
    )
  }
}
