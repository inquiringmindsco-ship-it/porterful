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
                <div className="flex flex-col gap-2">
                  <p className="text-sm uppercase tracking-widest text-[var(--pf-orange)]">About</p>
                  {/* Social Media Buttons in Profile Header */}
                  {artist.social && (
                    <div className="flex items-center gap-3">
                      {artist.social.instagram && (
                        <a href={`https://instagram.com/${artist.social.instagram}`} target="_blank" rel="noopener noreferrer" className="text-[var(--pf-text-muted)] hover:text-[var(--pf-orange)] transition-colors" aria-label="Instagram">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                        </a>
                      )}
                      {artist.social.twitter && (
                        <a href={`https://twitter.com/${artist.social.twitter}`} target="_blank" rel="noopener noreferrer" className="text-[var(--pf-text-muted)] hover:text-[var(--pf-orange)] transition-colors" aria-label="X (Twitter)">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        </a>
                      )}
                      {artist.social.youtube && (
                        <a href={artist.social.youtube.startsWith('http') ? artist.social.youtube : `https://youtube.com/${artist.social.youtube}`} target="_blank" rel="noopener noreferrer" className="text-[var(--pf-text-muted)] hover:text-[var(--pf-orange)] transition-colors" aria-label="YouTube">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                        </a>
                      )}
                      {artist.social.tiktok && (
                        <a href={`https://tiktok.com/@${artist.social.tiktok}`} target="_blank" rel="noopener noreferrer" className="text-[var(--pf-text-muted)] hover:text-[var(--pf-orange)] transition-colors" aria-label="TikTok">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-2.98.25-1.62 1.32-2.33 3.17-2.03 5.05.32 1.98 1.82 3.55 3.58 3.55 1.87 0 3.36-1.38 3.58-3.25V15.2c.75.15 1.53.24 2.33.24.02-.06 0-12.18.01-12.18z"/></svg>
                        </a>
                      )}
                    </div>
                  )}
                </div>
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
