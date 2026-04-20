import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getArtistById, getArtistTracks, ARTISTS } from '@/lib/artists'
import { FEATURED_PRODUCTS } from '@/lib/products'
import { ArtistHero } from '@/components/artist/ArtistHero'
import { ArtistTrackList } from '@/components/artist/ArtistTrackList'
import { ArtistSupportCard } from '@/components/artist/ArtistSupportCard'
import { ArtistProducts } from '@/components/artist/ArtistProducts'
import { LikenessVerifiedBadge } from '@/components/LikenessVerifiedBadge'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return ARTISTS.map(artist => ({
    slug: artist.slug,
  }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const artist = getArtistById(slug)
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

export default async function ArtistPage({ params }: PageProps) {
  const { slug } = await params
  const artist = getArtistById(slug)

  if (!artist) {
    notFound()
  }

  const tracks = getArtistTracks(slug)

  // Separate singles from albums
  const ALBUM_LIST = ['Ambiguous', 'From Feast to Famine', 'God Is Good', 'One Day', 'Streets Thought I Left', 'Roxannity', 'Artgasm', 'Levi']
  const albums = tracks.filter(t => ALBUM_LIST.includes(t.album))
  const singles = tracks.filter(t => !ALBUM_LIST.includes(t.album))

  const products = FEATURED_PRODUCTS.slice(0, 4)

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Section */}
      <ArtistHero artist={artist} />

      {/* Content Grid */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-10">

          {/* Main Column — Tracks */}
          <div className="lg:col-span-2 space-y-8">
            {/* Bio Section */}
            <section>
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm uppercase tracking-widest text-[var(--pf-orange)]">About</p>
                {artist.likeness_verified && (
                  <div className="flex items-center gap-1.5 text-xs text-[var(--pf-text-muted)]">
                    <LikenessVerifiedBadge size={14} />
                    <span>Likeness Verified</span>
                  </div>
                )}
              </div>
              <div className="bg-[var(--pf-surface)] rounded-2xl p-6 border border-[var(--pf-border)]">
                <p className="text-[var(--pf-text-secondary)] leading-relaxed whitespace-pre-line break-words max-w-full">
                  {artist.bio}
                </p>
              </div>
            </section>

            {/* Featured Singles (first) */}
            {singles.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm uppercase tracking-widest text-[var(--pf-orange)]">Featured Singles</p>
                  <span className="text-sm text-[var(--pf-text-muted)]">{singles.length} singles</span>
                </div>
                <ArtistTrackList tracks={singles} />
                <p className="text-xs text-[var(--pf-text-muted)] mt-3 text-center">
                  {singles.length === 1 ? 'This track' : `${singles.length} tracks`}
                  {` — listen, then choose support or merch in the sidebar`}
                </p>
              </section>
            )}

            {/* Albums */}
            {albums.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm uppercase tracking-widest text-[var(--pf-orange)]">Albums</p>
                  <span className="text-sm text-[var(--pf-text-muted)]">{albums.length} albums</span>
                </div>
                <ArtistTrackList tracks={albums} />
              </section>
            )}
          </div>

          {/* Sidebar Column */}
          <div className="space-y-5 flex flex-col">

            {/* Support Card */}
            <ArtistSupportCard artist={artist} />

            {/* Products */}
            <ArtistProducts products={products} artistName={artist.name} />

          </div>
        </div>
      </div>
    </div>
  )
}
