import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/auth-utils'
import { createServerClient as createAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mine = searchParams.get('mine') === '1'

  if (!mine) {
    return NextResponse.json({ error: 'Unsupported' }, { status: 400 })
  }

  try {
    const auth = await getAuthenticatedClient()
    if (!auth?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { user } = auth
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('tracks')
      .select('id, title, artist, album, duration, audio_url, cover_url, play_count, proud_to_pay_min, is_active, created_at')
      .eq('artist_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      tracks: data || [],
      total: data?.length || 0,
    })
  } catch (error) {
    console.error('Tracks GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch tracks' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedClient()
    if (!auth?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { user } = auth
    const supabase = createAdminClient()

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, username')
      .eq('id', user.id)
      .single()

    const body = await request.json()
    const title = String(body.title || '').trim()
    const audioUrl = String(body.audio_url || '').trim()
    const coverUrl = String(body.cover_url || '').trim() || null
    const album = String(body.album || '').trim() || null
    const duration = toNumber(body.duration)
    const proudToPayMin = toNumber(body.proud_to_pay_min ?? body.price) ?? 5

    if (!title || !audioUrl) {
      return NextResponse.json({ error: 'Missing required fields: title, audio_url' }, { status: 400 })
    }

    const artistName = profile?.full_name || profile?.username || 'Unknown Artist'

    const { data, error } = await supabase
      .from('tracks')
      .insert({
        artist_id: user.id,
        title,
        artist: artistName,
        album,
        duration,
        audio_url: audioUrl,
        cover_url: coverUrl,
        play_count: 0,
        proud_to_pay_min: proudToPayMin,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error('Track insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ track: data })
  } catch (error) {
    console.error('Tracks POST error:', error)
    return NextResponse.json({ error: 'Failed to save track' }, { status: 500 })
  }
}
