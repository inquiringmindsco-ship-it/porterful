import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getArtistTracks, ARTISTS } from '@/lib/artists'
import { getArtistWithDb, getServerArtistBySlug } from '@/lib/artist-db'
import { ArtistHero } from '@/components/artist/ArtistHero'
import { ArtistTabs } from '@/components/artist/ArtistTabs'
import type { Track } from '@/lib/audio-context'
import { createClient } from '@supabase/supabase-js'
import { mergeCanonicalTracks, dedupeQueueTracks, getTrackDedupeKey } from '@/lib/track-dedupe'
import { canonicalAlbum, isRealAlbum } from '@/lib/duration-formatter'
import { loadCatalogProducts } from '@/lib/product-visibility'

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

// Server-side Supabase client for public reads
function getServerSupabase() {
  // Public artist page should use ANON key to respect RLS
  // Service role is only for explicit admin operations
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // ✅ FIXED: anon key, not service role
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

async function getServerTracksByArtistId(artistId: string) {
  const supabase = getServerSupabase()
  const { data, error } = await supabase
    .from('tracks')
    .select('*')
    .eq('artist_id', artistId)
    .order('track_number', { ascending: true, nullsFirst: false })
  
  if (error) {
    console.error('[getServerTracksByArtistId] Error:', error)
    return []
  }
  
  return data || []
}

// Disable static generation for artist pages — always fetch fresh from DB
export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = 0

// Return empty array — no static pages at build time
// All artist pages are fully dynamic (fetched at request time)
export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const artist = await getArtistWithDb(slug)
  if (!artist) return { title: 'Artist Not Found' }
  const heroImage = artist.bannerUrl || artist.coverUrl || artist.image

  return {
    title: `${artist.name} — Porterful`,
    description: artist.shortBio,
    openGraph: {
      title: `${artist.name} on Porterful`,
      description: artist.shortBio,
      images: heroImage ? [{ url: heroImage }] : [],
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
  const dbArtistRecord = await getServerArtistBySlug(slug)

  if (!artist) {
    notFound()
  }

  // Only gate on public_profile_enabled if the DB record exists.
  // If status is missing/null, default to 'active' (allow approved artists
  // who have not yet uploaded tracks to still show their public page).
  if (dbArtistRecord) {
    const status = String(dbArtistRecord.status || 'active').toLowerCase()
    const isPublicProfile = dbArtistRecord.public_profile_enabled !== false
    const isAllowedStatus = status === 'active' || status === 'approved' || status === 'null' || status === ''

    if (!isPublicProfile || !isAllowedStatus) {
      notFound()
    }
  }

  // Fetch ALL DB tracks by artist_id (UUID) instead of artist name string
  // This fixes the issue where tracks have the real name but artist page uses stage name
  let dbTracksRaw: any[] = []
  if (dbArtistRecord?.id) {
    dbTracksRaw = await getServerTracksByArtistId(dbArtistRecord.id)
  }
  // Fallback: also try by artist name if no tracks found by ID (legacy compat)
  if (dbTracksRaw.length === 0) {
    dbTracksRaw = await getServerTracksByArtistId(dbArtistRecord.id)
  }
  const staticTracks = getArtistTracks(slug)
  
  // Merge using canonical dedupe: inactive DB blocks matching static
  const tracks = mergeCanonicalTracks(
    dbTracksRaw as any[],
    staticTracks as any[],
    { includeInactive: false }
  )
  
  // Allow artist pages even without tracks — they may be new or building profile.
  // The public_profile_enabled flag (or admin preview) is the real gate.

  // Resolve DB artist UUID by slug for album order lookup
  // Static fallback uses string slug as id, but album_order rows use auth UUID
  let artistId = artist.id
  const { data: dbArtistRow } = await getServerSupabase()
    .from('artists')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()
  if (dbArtistRow?.id) {
    artistId = dbArtistRow.id
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
    .slice(0, 6)

  const topTrack = featuredTracks[0] ?? dedupedTracks[0] ?? null

  const featuredIdSet = new Set(featuredTracks.map((t) => t.id))
  const nonFeatured = dedupedTracks.filter((t) => !featuredIdSet.has(t.id))

  // Use canonical album matching for proper grouping
  const albumTracks = nonFeatured.filter((t) => isRealAlbum(t.album))
  const singles = nonFeatured.filter((t) => !isRealAlbum(t.album))
  const catalogProducts = await loadCatalogProducts('store')
  const artistProducts = catalogProducts.filter((p) =>
    p.artistId === dbArtistRecord?.id ||
    p.artist?.toLowerCase() === artist.name.toLowerCase() ||
    p.artist?.toLowerCase().replace(/[^a-z0-9]/g, '-') === slug
  )

  const products = artistProducts.length > 0 ? artistProducts : []

  return (
    <div className="min-h-screen overflow-x-hidden pb-32">
      <ArtistHero
        artist={{
          name: artist.name,
          slug: artist.slug,
          genre: artist.genre,
          location: artist.location,
          verified: artist.verified,
          likeness_verified: artist.likeness_verified,
          image: artist.image,
          bannerUrl: artist.bannerUrl || artist.coverUrl || null,
          coverUrl: artist.coverUrl || null,
          trackCount: dedupedTracks.length,
          social: artist.social as SocialLinks | undefined,
        }}
        firstTrack={topTrack}
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
