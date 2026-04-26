import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getArtistById, getArtistTracks, ARTISTS } from '@/lib/artists'
import { ArtistHero } from '@/components/artist/ArtistHero'
import { ArtistTabs } from '@/components/artist/ArtistTabs'
import type { Track } from '@/lib/audio-context'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return ARTISTS.map((artist) => ({
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
  const artist = getArtistById(slug)

  if (!artist) {
    notFound()
  }

  const tracks = getArtistTracks(slug) as unknown as Track[]
  const singles = tracks.filter((t) => !t.album || !ALBUM_LIST.includes(t.album))
  const albumTracks = tracks.filter((t) => !!t.album && ALBUM_LIST.includes(t.album))

  // Per-artist storefront isn't wired into product data yet; spec rule is
  // "real products only, or coming soon" — pass empty so Store tab shows
  // a clean coming-soon state instead of fake/global fallback merch.
  const products: never[] = []

  return (
    <div className="min-h-screen pb-32">
      <ArtistHero artist={artist} firstTrack={tracks[0] ?? null} queueTracks={tracks} />
      <ArtistTabs
        artistName={artist.name}
        bio={artist.bio}
        social={artist.social}
        singles={singles}
        albumTracks={albumTracks}
        products={products}
      />
    </div>
  )
}
