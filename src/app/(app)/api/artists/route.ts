import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ARTISTS } from '@/lib/artists'

export const dynamic = 'force-dynamic'

function getServerSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function GET() {
  try {
    const supabase = getServerSupabase()

    const { data: artists, error } = await supabase
      .from('artists')
      .select(
        'id, name, slug, genre, location, bio, avatar_url, cover_url, verified, artist_tier, status, public_profile_enabled, auto_publish, created_at'
      )
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[api/artists] DB error:', error)
      return NextResponse.json({ artists: ARTISTS })
    }

    const { data: liveTracks } = await supabase
      .from('tracks')
      .select('artist_id, artist, is_active')
      .eq('is_active', true)

    const trackCountsById = new Map<string, number>()
    const trackCountsByName = new Map<string, number>()

    ;(liveTracks || []).forEach((track: any) => {
      if (track.artist_id) {
        trackCountsById.set(track.artist_id, (trackCountsById.get(track.artist_id) || 0) + 1)
      }
      if (track.artist) {
        const key = String(track.artist).toLowerCase()
        trackCountsByName.set(key, (trackCountsByName.get(key) || 0) + 1)
      }
    })

    return NextResponse.json({
      artists: (artists || [])
        .filter((artist: any) => artist.public_profile_enabled !== false && ['active', 'approved'].includes(artist.status))
        .map((artist: any) => ({
          ...artist,
          trackCount: trackCountsById.get(artist.id) || trackCountsByName.get(String(artist.name || '').toLowerCase()) || 0,
          image: artist.avatar_url || artist.cover_url || '',
        })),
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ artists: ARTISTS })
  }
}
