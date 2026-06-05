import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAccess } from '@/lib/admin-client'
import { createClient } from '@supabase/supabase-js'
import {
  normalizeCity,
  normalizeState,
} from '@/lib/measurement'

export const dynamic = 'force-dynamic'

function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase service credentials')
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  })
}

type PlayRow = {
  session_id: string
  track_id: string
  artist_id: string | null
  track_title: string
  artist_name: string
  city: string | null
  state: string | null
}

type DownloadRow = {
  session_id: string
  track_id: string
  artist_id: string | null
  track_title: string
  artist_name: string
  city: string | null
  state: string | null
}

type EmailCaptureRow = {
  session_id: string
  city: string | null
  state: string | null
}

type PurchaseRow = {
  measurement_session_id: string | null
  measurement_city: string | null
  measurement_state: string | null
  track_id: string | null
  track_title: string | null
  artist_name: string | null
}

type PresenceCountRow = {
  count: number | null
}

function normalizeSessionId(value: string | null | undefined): string | null {
  const sessionId = value?.trim() || ''
  return sessionId || null
}

function makeKey(parts: Array<string | null | undefined>): string {
  return parts.map((part) => (part?.trim() || '')).join('|')
}

function toPercent(numerator: number, denominator: number): string {
  if (!denominator) return '0.0%'
  return `${((numerator / denominator) * 100).toFixed(1)}%`
}

function createTrackBucket(key: string, trackId: string | null, trackTitle: string, artistName: string) {
  return {
    key,
    track_id: trackId,
    track_title: trackTitle,
    artist_name: artistName,
    plays: 0,
    downloads: 0,
    purchases: 0,
    total: 0,
  }
}

function createArtistBucket(key: string, artistId: string | null, artistName: string) {
  return {
    key,
    artist_id: artistId,
    artist_name: artistName,
    plays: 0,
    downloads: 0,
    purchases: 0,
    total: 0,
  }
}

function createLocationBucket(key: string, city: string | null, state: string | null) {
  return {
    key,
    city,
    state,
    plays: 0,
    downloads: 0,
    email_captures: 0,
    purchases: 0,
    total: 0,
  }
}

export async function GET(request: NextRequest) {
  try {
    // Use centralized admin verification (cookie-based, more reliable)
    const auth = await verifyAdminAccess(request)
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error || 'Forbidden: founder or admin required' },
        { status: 403 }
      )
    }

    const supabase = createServiceClient()

    const [revenueResponse, playsResult, downloadsResult, emailCapturesResult, purchasesResult, anonymousVisitorsResult, authenticatedSessionsResult] = await Promise.all([
      fetch(new URL('/api/dashboard/revenue', request.url).toString(), {
        headers: { cookie: request.headers.get('cookie') || '' },
        cache: 'no-store',
      }),
      supabase
        .from('plays')
        .select('session_id, track_id, artist_id, track_title, artist_name, city, state')
        .order('played_at', { ascending: false }),
      supabase
        .from('downloads')
        .select('session_id, track_id, artist_id, track_title, artist_name, city, state')
        .order('downloaded_at', { ascending: false }),
      supabase
        .from('email_captures')
        .select('session_id, city, state')
        .order('captured_at', { ascending: false }),
      supabase
        .from('music_purchases')
        .select('measurement_session_id, measurement_city, measurement_state, track_id, track_title, artist_name')
        .order('created_at', { ascending: false }),
      supabase.from('presence_visitors').select('visitor_id', { count: 'exact', head: true }),
      supabase.from('presence_sessions').select('user_id', { count: 'exact', head: true }),
    ])

    if (!revenueResponse.ok) {
      const errorText = await revenueResponse.text()
      return NextResponse.json({ error: errorText || 'Failed to load revenue report' }, { status: 500 })
    }

    if (playsResult.error) {
      return NextResponse.json({ error: `Failed to fetch plays: ${playsResult.error.message}` }, { status: 500 })
    }

    if (downloadsResult.error) {
      return NextResponse.json({ error: `Failed to fetch downloads: ${downloadsResult.error.message}` }, { status: 500 })
    }

    if (emailCapturesResult.error) {
      return NextResponse.json({ error: `Failed to fetch email captures: ${emailCapturesResult.error.message}` }, { status: 500 })
    }

    if (purchasesResult.error) {
      return NextResponse.json({ error: `Failed to fetch purchases: ${purchasesResult.error.message}` }, { status: 500 })
    }

    if (anonymousVisitorsResult.error) {
      return NextResponse.json({ error: `Failed to fetch anonymous visitors: ${anonymousVisitorsResult.error.message}` }, { status: 500 })
    }

    if (authenticatedSessionsResult.error) {
      return NextResponse.json({ error: `Failed to fetch authenticated sessions: ${authenticatedSessionsResult.error.message}` }, { status: 500 })
    }

    const revenueData = await revenueResponse.json()
    const plays = (playsResult.data || []) as PlayRow[]
    const downloads = (downloadsResult.data || []) as DownloadRow[]
    const emailCaptures = (emailCapturesResult.data || []) as EmailCaptureRow[]
    const purchases = (purchasesResult.data || []) as PurchaseRow[]

    const visitorCount = (anonymousVisitorsResult.count || 0) + (authenticatedSessionsResult.count || 0)
    const totalPlays = plays.length
    const totalDownloads = downloads.length
    const totalEmailCaptures = emailCaptures.length
    const totalPurchases = revenueData?.totals?.transactions_count || 0
    const totalRevenueCents = revenueData?.totals?.revenue_cents || 0

    const playSessions = new Set(plays.map((row) => normalizeSessionId(row.session_id)).filter((value): value is string => Boolean(value))).size
    const downloadSessions = new Set(downloads.map((row) => normalizeSessionId(row.session_id)).filter((value): value is string => Boolean(value))).size
    const emailSessions = new Set(emailCaptures.map((row) => normalizeSessionId(row.session_id)).filter((value): value is string => Boolean(value))).size
    const purchaseSessions = new Set(
      purchases
        .map((row) => normalizeSessionId(row.measurement_session_id))
        .filter((value): value is string => Boolean(value))
    ).size

    const trackBuckets = new Map<string, ReturnType<typeof createTrackBucket>>()
    const artistBuckets = new Map<string, ReturnType<typeof createArtistBucket>>()
    const locationBuckets = new Map<string, ReturnType<typeof createLocationBucket>>()

    const upsertTrack = (trackId: string | null, trackTitle: string, artistName: string, artistId: string | null, delta: { plays?: number; downloads?: number; purchases?: number }) => {
      const key = makeKey([trackId, trackTitle, artistName])
      const bucket = trackBuckets.get(key) || createTrackBucket(key, trackId, trackTitle, artistName)
      bucket.plays += delta.plays || 0
      bucket.downloads += delta.downloads || 0
      bucket.purchases += delta.purchases || 0
      bucket.total += (delta.plays || 0) + (delta.downloads || 0) + (delta.purchases || 0)
      trackBuckets.set(key, bucket)

      const artistKey = makeKey([artistId, artistName])
      const artistBucket = artistBuckets.get(artistKey) || createArtistBucket(artistKey, artistId, artistName)
      artistBucket.plays += delta.plays || 0
      artistBucket.downloads += delta.downloads || 0
      artistBucket.purchases += delta.purchases || 0
      artistBucket.total += (delta.plays || 0) + (delta.downloads || 0) + (delta.purchases || 0)
      artistBuckets.set(artistKey, artistBucket)
    }

    const upsertLocation = (cityValue: unknown, stateValue: unknown, delta: { plays?: number; downloads?: number; emailCaptures?: number; purchases?: number }) => {
      const city = normalizeCity(cityValue)
      const state = normalizeState(stateValue)
      if (!city && !state) return

      const key = makeKey([city, state])
      const bucket = locationBuckets.get(key) || createLocationBucket(key, city, state)
      bucket.plays += delta.plays || 0
      bucket.downloads += delta.downloads || 0
      bucket.email_captures += delta.emailCaptures || 0
      bucket.purchases += delta.purchases || 0
      bucket.total += (delta.plays || 0) + (delta.downloads || 0) + (delta.emailCaptures || 0) + (delta.purchases || 0)
      locationBuckets.set(key, bucket)
    }

    for (const row of plays) {
      upsertTrack(row.track_id || null, row.track_title || 'Unknown Track', row.artist_name || 'Unknown Artist', row.artist_id || null, { plays: 1 })
      upsertLocation(row.city, row.state, { plays: 1 })
    }

    for (const row of downloads) {
      upsertTrack(row.track_id || null, row.track_title || 'Unknown Track', row.artist_name || 'Unknown Artist', row.artist_id || null, { downloads: 1 })
      upsertLocation(row.city, row.state, { downloads: 1 })
    }

    for (const row of purchases) {
      upsertTrack(row.track_id || null, row.track_title || 'Unknown Track', row.artist_name || 'Unknown Artist', null, { purchases: 1 })
      upsertLocation(row.measurement_city, row.measurement_state, { purchases: 1 })
    }

    for (const row of emailCaptures) {
      upsertLocation(row.city, row.state, { emailCaptures: 1 })
    }

    const topTracks = Array.from(trackBuckets.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)

    const topArtists = Array.from(artistBuckets.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)

    const topCities = Array.from(locationBuckets.values())
      .filter((row) => Boolean(row.city))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)

    const topStates = Array.from(locationBuckets.values())
      .filter((row) => Boolean(row.state))
      .reduce((map, row) => {
        const key = row.state || ''
        const existing = map.get(key) || {
          state: key,
          plays: 0,
          downloads: 0,
          email_captures: 0,
          purchases: 0,
          total: 0,
        }
        existing.plays += row.plays
        existing.downloads += row.downloads
        existing.email_captures += row.email_captures
        existing.purchases += row.purchases
        existing.total += row.total
        map.set(key, existing)
        return map
      }, new Map<string, { state: string; plays: number; downloads: number; email_captures: number; purchases: number; total: number }>())

    const topStatesList = Array.from(topStates.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)

    const metrics = {
      visitor_count: visitorCount,
      total_plays: totalPlays,
      total_downloads: totalDownloads,
      total_email_captures: totalEmailCaptures,
      total_purchases: totalPurchases,
      total_revenue_cents: totalRevenueCents,
      total_revenue_dollars: (totalRevenueCents / 100).toFixed(2),
      unique_play_sessions: playSessions,
      unique_download_sessions: downloadSessions,
      unique_email_sessions: emailSessions,
      unique_purchase_sessions: purchaseSessions,
      conversion_rates: {
        visitor_to_play: toPercent(playSessions, visitorCount),
        play_to_email: toPercent(emailSessions, playSessions),
        email_to_purchase: toPercent(purchaseSessions, emailSessions),
        purchase_to_download: toPercent(downloadSessions, purchaseSessions),
      },
    }

    return NextResponse.json({
      source: 'measurement-foundation',
      metrics,
      top_tracks: topTracks,
      top_artists: topArtists,
      top_cities: topCities,
      top_states: topStatesList,
      raw: {
        plays,
        downloads,
        email_captures: emailCaptures,
        purchases,
      },
    })
  } catch (error: any) {
    console.error('[api/dashboard/analytics] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
