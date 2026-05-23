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

    // Get site settings - using raw fetch to bypass Supabase JS client JSONB issue
    const siteSettingsUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/site_settings?key=***&select=*`
    console.log('[homepage-data] Fetch URL:', siteSettingsUrl)
    const siteSettingsRes = await fetch(siteSettingsUrl, {
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
      },
    })
    console.log('[homepage-data] Response status:', siteSettingsRes.status)
    const siteSettingsRows = siteSettingsRes.ok ? await siteSettingsRes.json() : []
    const siteSettingsRow = siteSettingsRows[0] || null
    let siteSettingsErrorMsg = null
    if (!siteSettingsRes.ok) {
      const errText = await siteSettingsRes.text()
      siteSettingsErrorMsg = `HTTP ${siteSettingsRes.status}: ${errText.substring(0, 200)}`
      console.log('[homepage-data] Error:', siteSettingsErrorMsg)
    }
    const siteSettingsError = siteSettingsErrorMsg ? { message: siteSettingsErrorMsg } : null
    
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
      _debug: {
        keyType: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE' : 'ANON_FALLBACK',
        hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        siteSettingsError: siteSettingsError ? siteSettingsError.message : null,
        rawSiteSettings: siteSettingsRow,
        rawValue: siteSettingsValue,
        valueType: typeof siteSettingsValue,
        valueKeys: siteSettingsValue ? Object.keys(siteSettingsValue) : null,
        source: 'raw_fetch',
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
