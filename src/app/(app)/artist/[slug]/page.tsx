import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Instagram, Youtube, Twitter, Music2 } from 'lucide-react'
import { getArtistById, getArtistTracks, ARTISTS } from '@/lib/artists'
import { FEATURED_PRODUCTS } from '@/lib/products'
import { ArtistHero } from '@/components/artist/ArtistHero'
import { ArtistTrackList } from '@/components/artist/ArtistTrackList'
import { ArtistSupportCard } from '@/components/artist/ArtistSupportCard'
import { ArtistProducts } from '@/components/artist/ArtistProducts'

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
  const featuredTrack = tracks[0]
  const totalPlays = tracks.reduce((sum, t) => sum + (t.plays || 0), 0)

  // Separate singles from albums
  const ALBUM_LIST = ['Ambiguous', 'From Feast to Famine', 'God Is Good', 'One Day', 'Streets Thought I Left', 'Roxannity', 'Artgasm', 'Levi']
  const albums = tracks.filter(t => ALBUM_LIST.includes(t.album))
  const singles = tracks.filter(t => !ALBUM_LIST.includes(t.album))

  const products = FEATURED_PRODUCTS.slice(0, 4)

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Section */}
      <ArtistHero artist={artist} featuredTrack={featuredTrack} totalPlays={totalPlays} />

      {/* Content Grid */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-10">

          {/* Main Column — Tracks */}
          <div className="lg:col-span-2 space-y-8">
            {/* Bio Section */}
            <section>
              <p className="text-sm uppercase tracking-widest text-[var(--pf-orange)] mb-3">About</p>
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
                  {` — listen, then explore merch & support options in the sidebar`}
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

            {/* Superfan CTA */}
            <div className="bg-gradient-to-br from-[var(--pf-orange)]/10 to-purple-600/10 rounded-2xl p-5 border border-[var(--pf-orange)]/20 flex flex-col min-h-[140px]">
              <div className="flex items-start justify-between mb-2">
                <div className="text-2xl">⭐</div>
              </div>
              <h3 className="font-bold text-base mb-1">Become a Superfan</h3>
              <p className="text-sm text-[var(--pf-text-secondary)] flex-1">
                Earn 3% on everything your referrals buy. Help {artist.name.split(' ')[0]} grow without spending a dime.
              </p>
              <p className="text-xs text-[var(--pf-text-muted)] mt-2">
                No purchase required to join
              </p>
              <Link
                href="/superfan"
                className="mt-4 block w-full py-2.5 rounded-xl text-center text-sm font-semibold bg-[var(--pf-orange)] text-white hover:bg-[var(--pf-orange-dark)] transition-colors"
              >
                Learn More
              </Link>
            </div>

            {/* Platform Stats */}
            <div className="bg-[var(--pf-surface)] rounded-2xl p-5 border border-[var(--pf-border)] min-h-[160px]">
              <p className="text-sm uppercase tracking-widest text-[var(--pf-text-muted)] mb-4">Platform</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--pf-text-secondary)]">Artist revenue share</span>
                  <span className="text-sm font-semibold text-[var(--pf-orange)]">80%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--pf-text-secondary)]">Superfan commission</span>
                  <span className="text-sm font-semibold">3–8%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--pf-text-secondary)]">Platform fee</span>
                  <span className="text-sm font-semibold">10%</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[var(--pf-border)]">
                <Link href="/ecosystem" className="text-sm text-[var(--pf-orange)] hover:underline">
                  How Porterful works →
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
