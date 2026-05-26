import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ALBUMS } from '@/lib/data'
import { PRODUCTS } from '@/lib/products'
import { isPublicTrackArtist } from '@/lib/artists'
import { filterPublicArtists } from '@/lib/public-artists'

function getServerSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )
}

// Static albums as searchable items
const STATIC_ALBUMS = Object.entries(ALBUMS).map(([key, album]: [string, any]) => ({
  id: key.toLowerCase().replace(/\s+/g, '-'),
  name: album.name || key,
  type: 'album',
  artist: 'O D Porter',
  image: album.image,
  year: album.year,
  tracks: album.tracks,
}))

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ artists: [], products: [], tracks: [], albums: [] })
  }

  const searchTerm = query.toLowerCase().trim()

  try {
    const supabase = getServerSupabase()
    // A3-2 FIX: Run sequentially for cleaner error handling
    const { data: artists, error: artistsError } = await supabase
      .from('artists')
      .select('id, name, slug, genre, location, bio, avatar_url, cover_url, verified, artist_tier, status, public_profile_enabled')
      .neq('status', 'suspended')
    if (artistsError) console.error('[search] artists error:', artistsError)
    
    const { data: liveTracks, error: tracksError } = await supabase
      .from('tracks')
      .select('id, title, artist, artist_id, album, cover_url, duration, price, track_number, is_active')
      .eq('is_active', true)
      // A3-2 FIX: Explicit status gating — live, published, or null (legacy compat)
      .or('status.is.null,status.eq.live,status.eq.published')
    if (tracksError) console.error('[search] tracks error:', tracksError)

    const publicArtists = filterPublicArtists(artists as any[] | null | undefined)
    const publicArtistNames = new Set(
      publicArtists
        .map((artist: any) => String(artist.name || '').toLowerCase())
        .filter(Boolean),
    )

    // A3-2 FIX: Count tracks by artist_id first, then artist name fallback.
    // This fixes the Ray of Sunshine issue where track.artist != artist.name.
    const artistTrackCounts = new Map<string, number>()
    const artistNameToIdMap = new Map<string, string>()

    publicArtists.forEach((artist: any) => {
      artistNameToIdMap.set(String(artist.name || '').toLowerCase(), artist.id)
    })

    ;(liveTracks || []).forEach((track: any) => {
      // Primary: count by artist_id (most reliable)
      if (track.artist_id) {
        artistTrackCounts.set(
          track.artist_id,
          (artistTrackCounts.get(track.artist_id) || 0) + 1
        )
        return
      }
      // Fallback: count by artist name (legacy tracks without artist_id)
      const artistName = String(track.artist || '').toLowerCase()
      if (artistName && artistNameToIdMap.has(artistName)) {
        const artistId = artistNameToIdMap.get(artistName)!
        artistTrackCounts.set(
          artistId,
          (artistTrackCounts.get(artistId) || 0) + 1
        )
      }
    })

    const liveArtistResults = publicArtists
      .filter((artist: any) =>
        artist.name.toLowerCase().includes(searchTerm) ||
        artist.slug.toLowerCase().includes(searchTerm) ||
        String(artist.genre || '').toLowerCase().includes(searchTerm)
      )
      .map((artist: any) => ({
        id: artist.id,
        name: artist.name,
        slug: artist.slug,
        genre: Array.isArray(artist.genre) ? artist.genre.join(', ') : (artist.genre || ''),
        avatar: artist.avatar_url || artist.cover_url || null,
        trackCount: artistTrackCounts.get(artist.id) || 0,
      }))

    // Search static albums
    const albums = STATIC_ALBUMS.filter((album: any) =>
      album.name.toLowerCase().includes(searchTerm) ||
      album.artist.toLowerCase().includes(searchTerm)
    )

    // Search tracks: live DB tracks first, then static legacy catalog for fallback
    const liveTrackResults = (liveTracks || [])
      .filter((track: any) =>
        (publicArtistNames.has(String(track.artist || '').toLowerCase()) || isPublicTrackArtist(track.artist)) && (
          String(track.title || '').toLowerCase().includes(searchTerm) ||
          String(track.artist || '').toLowerCase().includes(searchTerm) ||
          String(track.album || '').toLowerCase().includes(searchTerm)
        )
      )
      .slice(0, 10)
      .map((track: any) => ({
        id: track.id,
        title: track.title,
        artist: track.artist,
        album: track.album,
        image: track.cover_url || track.image,
        duration: track.duration,
        price: track.price,
      }))

    // A3-2 FIX: Stop appending ungated static tracks to public search results.
    // Search must return DB/public-truth tracks only.
    const tracks = liveTrackResults.slice(0, 10)

    // Search static products (no canonical DB endpoint yet)
    const products = PRODUCTS.filter((product: any) =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.artist.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm)
    ).slice(0, 5).map((product: any) => ({
      id: product.id,
      name: product.name,
      artistName: product.artist,
      price: product.price,
      image: product.image,
      category: product.category,
    }))

    return NextResponse.json({
      artists: liveArtistResults,
      albums,
      tracks,
      products,
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
