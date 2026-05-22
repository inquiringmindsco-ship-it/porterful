import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getArtistTracks, ARTISTS } from '@/lib/artists'
import { getArtistWithDb } from '@/lib/artist-db'
import { ArtistHero } from '@/components/artist/ArtistHero'
import { ArtistTabs } from '@/components/artist/ArtistTabs'
import type { Track } from '@/lib/audio-context'
import { createClient } from '@supabase/supabase-js'
import { mergeCanonicalTracks, dedupeQueueTracks, getTrackDedupeKey } from '@/lib/track-dedupe'
import { canonicalAlbum, isRealAlbum } from '@/lib/duration-formatter'

interface SocialLinks {
  instagram?: string
  twitter?: string
  tiktok?: string
  youtube?: string
  website?: string
}

interface PageProps {
  params: Promise<{ slug: string }>
}

// Server-side Supabase client
function getServerSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

// Fetch album display order for artist
async function getArtistAlbumOrder(artistId: string): Promise<Record<string, number>> {
  const supabase = getServerSupabase()
  const { data, error } = await supabase
    .from('artist_album_order')
    .select('album_name, sort_order')
    .eq('artist_id', artistId)
    .order('sort_order')
  
  if (error) {
    console.error('[getArtistAlbumOrder] Error:', error)
    return {}
  }
  
  const order: Record<string, number> = {}
  data?.forEach((row) => {
    const key = canonicalAlbum(row.album_name) || row.album_name
    order[key] = row.sort_order
  })
  return order
}

async function getServerTracksByArtistNameFull(artistName: string) {
  const supabase = getServerSupabase()
  const { data, error } = await supabase
    .from('tracks')
    .select('*')
    .eq('artist', artistName)
    .order('track_number', { ascending: true, nullsFirst: false })
  
  if (error) {
    console.error('[getServerTracksByArtistNameFull] Error:', error)
    return []
  }
  
  return data || []
}

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  return ARTISTS
    .filter((artist) => artist.trackCount && artist.trackCount > 0)
    .map((artist) => ({
      slug: artist.slug,
    }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const artist = await getArtistWithDb(slug)
  if (!artist) return { title: 'Artist Not Found' }

  return {
    title: `${artist.name} — Porterful`,
    description: artist.shortBio,
    openGraph: {
      title: `${artist.name} on Porterful`,
      description: artist.shortBio,
      images: artist.image ? [{ url: artist.image }] : [],
    },
  }
}

const ALBUM_LIST = [
  'Ambiguous',
  'From Feast to Famine',
  'God Is Good',
  'One Day',
  'Streets Thought I Left',
  'Roxannity',
  'Artgasm',
  'Levi',
]

export default async function ArtistPage({ params }: PageProps) {
  const { slug } = await params
  const artist = await getArtistWithDb(slug)

  if (!artist) {
    notFound()
  }

  // Fetch ALL DB tracks (including inactive for canonical dedupe)
  const dbTracksRaw = await getServerTracksByArtistNameFull(artist.name)
  const staticTracks = getArtistTracks(slug)
  
  // Merge using canonical dedupe: inactive DB blocks matching static
  const tracks = mergeCanonicalTracks(
    dbTracksRaw as any[],
    staticTracks as any[],
    { includeInactive: false }
  )
  
  // Block empty public artist pages
  if (tracks.length === 0) {
    notFound()
  }

  // Resolve DB artist UUID by slug for album order lookup
  // Static fallback uses string slug as id, but album_order rows use auth UUID
  let artistId = artist.id
  const { data: dbArtist } = await getServerSupabase()
    .from('artists')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()
  if (dbArtist?.id) {
    artistId = dbArtist.id
  }

  // Fetch custom album order
  const albumOrder = await getArtistAlbumOrder(artistId)

  // Dedupe queue before passing to player
  const dedupedTracks = dedupeQueueTracks(tracks)

  // Featured set: active DB tracks flagged featured. Read from raw rows since
  // the canonical Track shape doesn't carry `featured`.
  const featuredKeys = new Set<string>(
    (dbTracksRaw as any[])
      .filter((r) => r.is_active !== false && r.featured === true)
      .map((r) => getTrackDedupeKey({ artist: r.artist, album: r.album, title: r.title }))
  )

  const featuredTracks = dedupedTracks
    .filter((t) => featuredKeys.has(getTrackDedupeKey(t)))
    .slice(0, 3)

  const featuredIdSet = new Set(featuredTracks.map((t) => t.id))
  const nonFeatured = dedupedTracks.filter((t) => !featuredIdSet.has(t.id))

  // Use canonical album matching for proper grouping
  const albumTracks = nonFeatured.filter((t) => isRealAlbum(t.album))
  const singles = nonFeatured.filter((t) => !isRealAlbum(t.album))
  const products: never[] = []

  return (
    <div className="min-h-screen pb-32">
      <ArtistHero
        artist={{
          name: artist.name,
          slug: artist.slug,
          genre: artist.genre,
          location: artist.location,
          verified: artist.verified,
          likeness_verified: artist.likeness_verified,
          image: artist.image,
          social: artist.social as SocialLinks | undefined,
        }}
        firstTrack={dedupedTracks[0] ?? null}
        queueTracks={dedupedTracks}
      />
      <ArtistTabs
        artistName={artist.name}
        // Use DB bio if available, else empty state
        bio={artist.bio?.trim() || 'This artist has not added a bio yet.'}
        social={artist.social}
        featuredTracks={featuredTracks}
        singles={singles}
        albumTracks={albumTracks}
        products={products}
        albumOrder={albumOrder}
      />
    </div>
  )
}
