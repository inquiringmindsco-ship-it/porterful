import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  console.log('[homepage-data] Supabase URL:', url ? 'SET' : 'MISSING')
  console.log('[homepage-data] Using key type:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE' : 'ANON')
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

    // Get newest track
    const { data: newestTrack } = await supabase
      .from('tracks')
      .select('id, title, artist, album, duration, cover_url, is_active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Get site settings
    const { data: siteSettings, error: siteSettingsError } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'homepage')
      .single()
    
    if (siteSettingsError) {
      console.error('[homepage-data] site_settings error:', siteSettingsError)
    }
    
    console.log('[homepage-data] siteSettings raw:', JSON.stringify(siteSettings, null, 2))
    console.log('[homepage-data] siteSettings.value:', siteSettings?.value)
    console.log('[homepage-data] hero_track_id:', siteSettings?.value?.hero_track_id)

    // Resolve featured/hero tracks if they're DB tracks not in static array
    const featuredIds = siteSettings?.value?.featured_track_ids || []
    const heroId = siteSettings?.value?.hero_track_id
    const promoIds = siteSettings?.value?.promo_track_ids || []
    const allNeededIds = Array.from(new Set([...(heroId ? [heroId] : []), ...featuredIds, ...promoIds]))
    
    let resolvedTracks: any[] = []
    if (allNeededIds.length > 0) {
      const { data: dbTracks } = await supabase
        .from('tracks')
        .select('id, title, artist, album, duration, cover_url, is_active')
        .in('id', allNeededIds)
      resolvedTracks = dbTracks || []
    }

    return NextResponse.json({
      counts: {
        totalArtists: totalArtists || 0,
        publicArtists: publicArtists || 0,
        totalTracks: totalTracks || 0,
        activeTracks: activeTracks || 0,
      },
      newestTrack,
      siteSettings: siteSettings?.value || {},
      tracks: resolvedTracks,
      _debug: {
        keyType: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE' : 'ANON_FALLBACK',
        hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        siteSettingsError: siteSettingsError ? siteSettingsError.message : null,
        rawSiteSettings: siteSettings,
        rawValue: siteSettings?.value,
        valueType: typeof siteSettings?.value,
        valueKeys: siteSettings?.value ? Object.keys(siteSettings.value) : null,
      }
    })
  } catch (error) {
    console.error('Homepage data error:', error)
    return NextResponse.json({ 
      counts: { totalArtists: 0, publicArtists: 0, totalTracks: 0, activeTracks: 0 },
      newestTrack: null,
      siteSettings: {},
    })
  }
}
