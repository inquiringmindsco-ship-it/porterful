import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { loadCatalogProducts } from '@/lib/product-visibility'
import { attachTrackCollaborators, loadTrackCollaboratorMap } from '@/lib/track-collaborators'

export const dynamic = 'force-dynamic'

function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // ✅ FIXED: anon key only, not service role
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function GET() {
  try {
    const supabase = getServerSupabase()

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

    // Get newest LIVE track only
    const { data: newestTrack } = await supabase
      .from('tracks')
      .select('id, title, artist, artist_id, album, duration, cover_url, is_active, status')
      .in('status', ['live', 'published'])
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Get site settings - using raw fetch to bypass Supabase JS client JSONB issue
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const siteSettingsUrl = baseUrl + '/rest/v1/site_settings?select=*'
    const siteSettingsRes = await fetch(siteSettingsUrl, {
      cache: 'no-store',
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
      },
    })
    let siteSettingsRows: any[] = []
    if (siteSettingsRes.ok) {
      siteSettingsRows = await siteSettingsRes.json()
    }
    const siteSettingsRow = siteSettingsRows.find((r: any) => r.key === 'homepage') || siteSettingsRows[0] || null
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
      resolvedTracks = dbTracks || []
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
