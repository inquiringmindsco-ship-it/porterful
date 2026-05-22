import { notFound, redirect } from 'next/navigation'
import { getArtistWithDb } from '@/lib/artist-db'

interface PageProps {
  params: Promise<{ id: string }>
}

// Legacy compatibility route.
// The canonical public artist page is /artist/[slug].
export default async function LegacyArtistPage({ params }: PageProps) {
  const { id } = await params
  const artist = await getArtistWithDb(id)

  if (!artist) {
    notFound()
  }

  redirect(`/artist/${artist.slug}`)
}
