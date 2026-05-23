import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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

    // Get site settings - using raw fetch to bypass Supabase JS client JSONB issue
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const siteSettingsUrl = baseUrl + encodeURI('/rest/v1/site_settings?select=*')
    const siteSettingsRes = await fetch(siteSettingsUrl, {
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
      },
    })
    const siteSettingsRows = siteSettingsRes.ok ? await siteSettingsRes.json() : []
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
      siteSettings: siteSettingsValue,
      tracks: resolvedTracks,
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
