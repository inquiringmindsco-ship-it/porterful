import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  createMeasurementSessionId,
  getMeasurementSessionCookieName,
  readMeasurementSessionIdFromCookie,
  resolveMeasurementLocation,
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

type PlayEventBody = {
  session_id?: string | null
  track_id?: string | null
  artist_id?: string | null
  track_title?: string | null
  artist_name?: string | null
  playback_mode?: 'full' | 'preview' | 'locked' | string | null
  is_preview?: boolean | null
  duration_seconds?: number | string | null
  source?: string | null
}

function normalizeTrackText(value: string | null | undefined, fallback: string): string {
  const trimmed = value?.trim()
  return trimmed || fallback
}

function normalizeOptionalText(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed || null
}

function toNumberOrNull(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PlayEventBody

    const trackId = normalizeTrackText(body.track_id, '')
    const trackTitle = normalizeTrackText(body.track_title, 'Unknown Track')
    const artistName = normalizeTrackText(body.artist_name, 'Unknown Artist')

    if (!trackId) {
      return NextResponse.json({ error: 'track_id is required' }, { status: 400 })
    }

    const measurementCookie = request.cookies.get(getMeasurementSessionCookieName())?.value || null
    const measurementSessionId = readMeasurementSessionIdFromCookie(measurementCookie) || createMeasurementSessionId()
    const measurementLocation = resolveMeasurementLocation({
      headers: request.headers,
    })

    const supabase = createServiceClient()
    let artistId = normalizeOptionalText(body.artist_id)

    if (!artistId) {
      const { data: trackRecord } = await supabase
        .from('tracks')
        .select('artist_id')
        .eq('id', trackId)
        .maybeSingle()

      artistId = trackRecord?.artist_id || null
    }

    const { error } = await supabase.from('plays').insert({
      session_id: normalizeOptionalText(body.session_id) || measurementSessionId,
      user_id: null,
      track_id: trackId,
      artist_id: artistId,
      track_title: trackTitle,
      artist_name: artistName,
      playback_mode: body.playback_mode === 'preview' || body.playback_mode === 'locked'
        ? body.playback_mode
        : 'full',
      source: body.source?.trim() || 'audio-context',
      city: measurementLocation.city,
      state: measurementLocation.state,
      played_at: new Date().toISOString(),
    })

    if (error) {
      console.error('[analytics/play] Insert error:', error)
      return NextResponse.json({ error: 'Failed to record play event' }, { status: 500 })
    }

    const response = NextResponse.json({ success: true })

    if (!measurementCookie) {
      response.cookies.set(getMeasurementSessionCookieName(), measurementSessionId, {
        httpOnly: false,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
      })
    }

    return response
  } catch (error: any) {
    console.error('[analytics/play] Unexpected error:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
