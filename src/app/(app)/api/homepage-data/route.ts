import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { loadCatalogProducts } from '@/lib/product-visibility'
import { attachTrackCollaborators, loadTrackCollaboratorMap } from '@/lib/track-collaborators'
import { filterPublicArtists } from '@/lib/public-artists'

export const dynamic = 'force-dynamic'

function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // ✅ FIXED: anon key only, not service role
  return createClient(url, key, { auth: { persistSession: false } })
}

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

export async function GET() {
  try {
    const supabase = getServerSupabase()
    const publicArtistsResult = await supabase
      .from('artists')
      .select('id, name, slug, status, public_profile_enabled')
      .in('status', ['active', 'approved'])
      .eq('public_profile_enabled', true)
    const publicArtistsList = filterPublicArtists((publicArtistsResult.data || []) as any[])
    const publicArtistIdSet = new Set(publicArtistsList.map((artist: any) => String(artist.id)))
    const publicArtistNameSet = new Set(
      publicArtistsList
        .map((artist: any) => String(artist.name || '').trim().toLowerCase())
        .filter(Boolean),
    )

    const isPublicTrack = (track: any) => {
      if (!track) return false
      const trackArtistId = String(track.artist_id || '').trim()
      const trackArtistName = String(track.artist || '').trim().toLowerCase()
      if (trackArtistId && publicArtistIdSet.has(trackArtistId)) return true
      if (trackArtistName && publicArtistNameSet.has(trackArtistName)) return true
      return false
    }

    // Get accurate counts
    const { count: totalArtists } = await supabase
      .from('artists')
      .select('*', { count: 'exact', head: true })

    const { count: publicArtists } = await supabase
      .from('artists')
      .select('*', { count: 'exact', head: true })
      .eq('public_profile_enabled', true)
      .in('status', ['active', 'approved'])

    const { count: totalTracks } = await supabase
      .from('tracks')
      .select('*', { count: 'exact', head: true })

    const { count: activeTracks } = await supabase
      .from('tracks')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .in('status', ['live', 'published'])

    // Get newest LIVE track only, then fail closed if the artist is hidden.
    const { data: newestTracks } = await supabase
      .from('tracks')
      .select('id, title, artist, artist_id, album, duration, cover_url, is_active, status')
      .in('status', ['live', 'published'])
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(12)
    const newestTrack = (newestTracks || []).find((track: any) => isPublicTrack(track)) || null

    // Site settings are founder-controlled, so read them with the admin key.
    const adminSupabase = getAdminSupabase()
    const { data: siteSettingsRows } = await adminSupabase
      .from('site_settings')
      .select('key, value')
      .eq('key', 'homepage')
      .limit(1)
    const siteSettingsRow = siteSettingsRows?.[0] || null
    const siteSettingsValue = siteSettingsRow?.value || {}

    // Resolve featured/hero tracks if they're DB tracks not in static array
    const featuredIds = siteSettingsValue?.featured_track_ids || []
    const heroId = siteSettingsValue?.hero_track_id
    const promoIds = siteSettingsValue?.promo_track_ids || []
    const allNeededIds = Array.from(new Set([...(heroId ? [heroId] : []), ...featuredIds, ...promoIds]))
    
    let resolvedTracks: any[] = []
    if (allNeededIds.length > 0) {
      const { data: dbTracks } = await supabase
        .from('tracks')
        .select('id, title, artist, artist_id, album, duration, cover_url, is_active, status')
        .in('id', allNeededIds)
        .in('status', ['live', 'published'])
        .eq('is_active', true)
      resolvedTracks = (dbTracks || []).filter((track: any) => isPublicTrack(track))
    }

    const collaboratorMap = await loadTrackCollaboratorMap(
      supabase,
      Array.from(
        new Set([
          ...(newestTrack?.id ? [newestTrack.id] : []),
          ...resolvedTracks.map((track: any) => track.id),
        ]),
      ),
    ).catch((error) => {
      console.warn('[homepage-data] collaborator load failed, using plain tracks:', error)
      return new Map<string, any[]>()
    })

    const newestTrackWithCollaborators = newestTrack
      ? attachTrackCollaborators([newestTrack], collaboratorMap)[0]
      : null

    const resolvedTracksWithCollaborators = attachTrackCollaborators(resolvedTracks, collaboratorMap)

    const response = NextResponse.json({
      counts: {
        totalArtists: totalArtists || 0,
        publicArtists: publicArtists || 0,
        totalTracks: totalTracks || 0,
        activeTracks: activeTracks || 0,
      },
      newestTrack: newestTrackWithCollaborators,
      siteSettings: siteSettingsValue,
      tracks: resolvedTracksWithCollaborators,
      products: await loadCatalogProducts('store', { limit: 4 }),
    })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response
  } catch (error) {
    console.error('Homepage data error:', error)
    const errorResponse = NextResponse.json({ 
      counts: { totalArtists: 0, publicArtists: 0, totalTracks: 0, activeTracks: 0 },
      newestTrack: null,
      siteSettings: {},
      products: [],
    })
    errorResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    errorResponse.headers.set('Pragma', 'no-cache')
    errorResponse.headers.set('Expires', '0')
    return errorResponse
  }
}
