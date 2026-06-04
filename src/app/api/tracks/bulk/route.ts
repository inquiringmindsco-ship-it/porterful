import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/auth-utils'
import { getArtistAccessContext, trackBelongsToArtist } from '@/lib/artist-identity'
import { canonicalAlbum } from '@/lib/duration-formatter'

export const dynamic = 'force-dynamic'

function parseStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || '').trim())
      .filter(Boolean)
  }

  if (typeof value === 'string' && value.trim()) {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}

function normalizeAlbumKey(value: string | null | undefined) {
  return canonicalAlbum(value) || 'Singles'
}

async function loadTracksForScope(supabase: any, role: string, userId: string) {
  let query = supabase
    .from('tracks')
    .select('id, artist_id, album, title, proud_to_pay_min, is_active, updated_at')
    .order('created_at', { ascending: false })

  if (role === 'artist') {
    const context = await getArtistAccessContext(supabase, userId)
    const artistIds = Array.from(context.artistIds).filter(Boolean)
    if (artistIds.length > 0) {
      query = query.in('artist_id', artistIds)
    } else {
      query = query.eq('artist_id', userId)
    }
  }

  const { data, error } = await query
  if (error) {
    throw error
  }

  return data || []
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await getAuthenticatedClient()
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { supabase, user } = auth
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (!['artist', 'admin', 'founder'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const action = typeof body.action === 'string' ? body.action.trim().toLowerCase() : ''
    const trackIds = parseStringArray(body.track_ids)
    const albumNames = parseStringArray(body.album_names).map(normalizeAlbumKey)

    if (!['hide', 'show', 'set_price'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    if (trackIds.length === 0 && albumNames.length === 0) {
      return NextResponse.json({ error: 'Select at least one track or album' }, { status: 400 })
    }

    let nextPrice: number | null = null
    if (action === 'set_price') {
      const parsed = Number(body.price)
      if (!Number.isFinite(parsed) || parsed < 0) {
        return NextResponse.json({ error: 'Valid price is required' }, { status: 400 })
      }
      nextPrice = Math.round(parsed * 100) / 100
    }

    const tracks = await loadTracksForScope(supabase, profile.role, user.id)

    const requestedTrackIdSet = new Set(trackIds)
    const requestedAlbumSet = new Set(albumNames)

    const matchedTracks = tracks.filter((track: any) => {
      const albumKey = normalizeAlbumKey(track.album)
      return requestedTrackIdSet.has(track.id) || requestedAlbumSet.has(albumKey)
    })

    const matchedTrackIdSet = new Set(matchedTracks.map((track: any) => track.id))
    const missingTrackIds = trackIds.filter((id) => !matchedTrackIdSet.has(id))
    const missingAlbums = albumNames.filter(
      (album) => !matchedTracks.some((track: any) => normalizeAlbumKey(track.album) === album)
    )

    if (missingTrackIds.length > 0 || missingAlbums.length > 0) {
      return NextResponse.json(
        {
          error: 'One or more selected tracks or albums could not be updated',
          missing_track_ids: missingTrackIds,
          missing_albums: missingAlbums,
        },
        { status: 403 }
      )
    }

    if (matchedTracks.length === 0) {
      return NextResponse.json({ error: 'No matching tracks found' }, { status: 404 })
    }

    if (profile.role === 'artist') {
      const context = await getArtistAccessContext(supabase, user.id)
      const unauthorizedTrack = matchedTracks.find((track: any) => !trackBelongsToArtist(track.artist_id, context))
      if (unauthorizedTrack) {
        return NextResponse.json({ error: 'You can only update your own tracks' }, { status: 403 })
      }
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (action === 'hide') {
      updates.is_active = false
    } else if (action === 'show') {
      updates.is_active = true
    } else if (action === 'set_price' && nextPrice !== null) {
      updates.proud_to_pay_min = nextPrice
    }

    const { data: updatedTracks, error: updateError } = await supabase
      .from('tracks')
      .update(updates)
      .in('id', matchedTracks.map((track: any) => track.id))
      .select('id, title, album, proud_to_pay_min, is_active, updated_at')

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      action,
      updated_count: updatedTracks?.length || matchedTracks.length,
      tracks: updatedTracks || [],
    })
  } catch (err: any) {
    console.error('[tracks:bulk] Exception:', err)
    return NextResponse.json({ error: err.message || 'Failed to update tracks' }, { status: 500 })
  }
}
