import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/auth-utils'

/**
 * GET /api/tracks/quota
 * Returns upload quota info for the authenticated artist
 * Used for preflight check before storage upload to prevent orphans
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedClient()
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { supabase, user } = auth
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role, email, full_name')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get artist record with tier
    const { data: artist } = await supabase
      .from('artists')
      .select('id, name, slug, artist_tier, verified')
      .eq('id', user.id)
      .single()

    // Count active tracks
    const { count } = await supabase
      .from('tracks')
      .select('*', { count: 'exact', head: true })
      .eq('artist_id', profile.id)
      .eq('is_active', true)

    const activeTracks = count || 0

    // Determine tier and limits
    const tier = artist?.artist_tier || 'basic_artist'
    const isArtist = profile.role === 'artist' || profile.role === 'admin' || profile.role === 'founder'

    const isUnlimitedUploader =
      profile.role === 'admin' ||
      profile.role === 'founder' ||
      tier === 'porterful_artist' ||
      tier === 'exclusive_porterful_artist'

    const maxActiveTracks = isUnlimitedUploader
      ? null
      : (tier === 'verified_artist' || tier === 'likeness_verified_artist')
        ? 25
        : 3

    const canUpload = isArtist && (isUnlimitedUploader || activeTracks < (maxActiveTracks || Infinity))

    // Build response
    let message: string
    if (!isArtist) {
      message = 'Only artist accounts can upload tracks.'
    } else if (isUnlimitedUploader) {
      const tierLabel = tier === 'exclusive_porterful_artist' ? 'Exclusive Porterful Artist' :
        tier === 'porterful_artist' ? 'Porterful Artist' :
        profile.role === 'founder' ? 'Founder' : 'Admin'
      message = `${tierLabel} account: unlimited uploads enabled.`
    } else {
      message = `${tier.replace('_', ' ')} account: ${activeTracks} of ${maxActiveTracks} active tracks used.`
    }

    return NextResponse.json({
      user_id: user.id,
      profile_id: profile.id,
      profile_role: profile.role,
      artist_id: artist?.id || null,
      artist_slug: artist?.slug || null,
      artist_tier: tier,
      artist_verified: artist?.verified || false,
      active_tracks: activeTracks,
      max_active_tracks: maxActiveTracks,
      can_upload: canUpload,
      is_artist: isArtist,
      is_unlimited: isUnlimitedUploader,
      message
    })

  } catch (err: any) {
    console.error('[quota] Exception:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to get quota' },
      { status: 500 }
    )
  }
}
