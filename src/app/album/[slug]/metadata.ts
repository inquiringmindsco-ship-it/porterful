import { Metadata } from 'next'
import { TRACKS } from '@/lib/data'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  // Try to find album by slug (handle both slug formats)
  const albumName = params.slug.replace(/-/g, ' ')
  const albumTracks = TRACKS.filter(t => 
    t.album?.toLowerCase().replace(/\s+/g, '-') === params.slug ||
    t.album?.toLowerCase() === albumName
  )
  
  if (albumTracks.length === 0) {
    return {
      title: 'Album Not Found',
    }
  }
  
  const album = albumTracks[0]
  const trackCount = albumTracks.length
  
  return {
    title: `${album.album} by ${album.artist} | Porterful`,
    description: `${album.album} by ${album.artist}. ${trackCount} tracks. Stream or buy on Porterful. 80% goes to artists.`,
    openGraph: {
      title: `${album.album} by ${album.artist}`,
      description: `${trackCount} tracks. Stream or buy on Porterful.`,
      images: [album.image],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${album.album} by ${album.artist}`,
      description: `${trackCount} tracks. 80% goes to artists.`,
      images: [album.image],
    },
  }
}