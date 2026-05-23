// Server-side helper to fetch homepage data
// Used by server component to get real DB data at request time

import { createClient } from '@supabase/supabase-js'

export interface HomePageData {
  counts: {
    totalArtists: number
    publicArtists: number
    totalTracks: number
    activeTracks: number
  }
  newestTrack: {
    id: string
    title: string
    artist: string
    album: string | null
    duration: string
    cover_url: string | null
    is_active: boolean
  } | null
  siteSettings: Record<string, any>
  artists: Array<{
    id: string
    name: string
    slug: string
    avatar_url: string | null
    trackCount: number | null
    public_profile_enabled: boolean
    status: string
    bio?: string
    location?: string
    genre?: string
  }>
}

function getServerSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function fetchHomepageData(): Promise<HomePageData> {
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
  const { data: siteSettings } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'homepage')
    .single()

  // Get public artists for browse section
  const { data: artistsData } = await supabase
    .from('artists')
    .select('id, name, slug, avatar_url, track_count, public_profile_enabled, status, bio, location, genre')
    .eq('public_profile_enabled', true)
    .in('status', ['active', 'approved'])

  const artists = (artistsData || []).map((a: any) => ({
    id: a.id,
    name: a.name,
    slug: a.slug,
    avatar_url: a.avatar_url,
    trackCount: a.track_count,
    public_profile_enabled: a.public_profile_enabled,
    status: a.status,
    bio: a.bio,
    location: a.location,
    genre: a.genre,
  }))

  return {
    counts: {
      totalArtists: totalArtists || 0,
      publicArtists: publicArtists || 0,
      totalTracks: totalTracks || 0,
      activeTracks: activeTracks || 0,
    },
    newestTrack: newestTrack ? {
      id: newestTrack.id,
      title: newestTrack.title,
      artist: newestTrack.artist,
      album: newestTrack.album,
      duration: newestTrack.duration || '0:00',
      cover_url: newestTrack.cover_url,
      is_active: newestTrack.is_active,
    } : null,
    siteSettings: siteSettings?.value || {},
    artists,
  }
}
