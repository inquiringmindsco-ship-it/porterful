import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { TRACKS, ALBUMS } from '@/lib/data'
import { formatDuration, canonicalAlbum } from '@/lib/duration-formatter'
import { sortTracksByAlbumOrder } from '@/lib/track-dedupe'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

// Generate static params for all albums
export async function generateStaticParams() {
  return Object.values(ALBUMS).map(album => ({
    slug: album.id,
  }))
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const album = Object.values(ALBUMS).find(a => a.id === slug)
  
  if (!album) {
    return { title: 'Album Not Found' }
  }
  
  const albumTracks = TRACKS.filter(t => t.album === album.name)
  const totalPlays = albumTracks.reduce((sum, t) => sum + (t.plays || 0), 0)
  
  return {
    title: `${album.name} by O D Porter`,
    description: `Stream and buy tracks from ${album.name} album. ${albumTracks.length} tracks. Total plays: ${totalPlays.toLocaleString()}.`,
    openGraph: {
      title: `${album.name} | Porterful`,
      description: `${albumTracks.length} tracks • ${totalPlays.toLocaleString()} total plays`,
      images: [{ url: album.image, width: 500, height: 500, alt: album.name }],
    },
  }
}

// Custom play icon
const PlayIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5,3 19,12 5,21"/>
  </svg>
)

export default async function AlbumPage({ params }: PageProps) {
  const { slug } = await params
  const album = Object.values(ALBUMS).find(a => a.id === slug)
  
  if (!album) {
    notFound()
  }
  
  // Get tracks for this album and sort by track_number
  const albumTracks = sortTracksByAlbumOrder(TRACKS.filter(t => t.album === album.name))
  const totalDuration = albumTracks.reduce((acc, t) => {
    const durationStr = String(t.duration || '0:00')
    const [mins, secs] = durationStr.split(':').map(Number)
    return acc + mins * 60 + secs
  }, 0)
  
  const formatDurationAlbum = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins} min`
  }

  return (
    <div className="min-h-screen pt-20 pb-24">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[var(--pf-orange)]/20 via-[var(--pf-bg)] to-purple-500/10">
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--pf-bg)] to-transparent" />
        
        <div className="relative z-10 pf-container max-w-4xl pt-8 pb-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Album Art */}
            <div className="w-full md:w-64 shrink-0">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl relative">
                <Image 
                  src={album.image} 
                  alt={album.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 256px"
                  className="object-cover"
                />
              </div>
            </div>
            
            {/* Album Info */}
            <div className="flex-1">
              <p className="text-sm font-medium text-[var(--pf-orange)] uppercase tracking-wider mb-2">Album</p>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{album.name}</h1>
              <Link 
                href="/artist/od-porter"
                className="inline-flex items-center gap-2 text-[var(--pf-text-secondary)] hover:text-[var(--pf-orange)] transition-colors mb-4"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--pf-orange)] to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                  O
                </div>
                <span className="font-medium">O D Porter</span>
              </Link>
              
              <div className="flex flex-wrap gap-4 text-sm text-[var(--pf-text-secondary)] mb-6">
                <span>{albumTracks.length} tracks</span>
                <span>•</span>
                <span>{formatDurationAlbum(totalDuration)}</span>
              </div>
              
              {/* Play Button */}
              <div className="flex gap-3">
                <a 
                  href="/digital"
                  className="pf-btn pf-btn-primary flex items-center gap-2 text-lg px-6 py-3"
                >
                  <PlayIcon />
                  Play All
                </a>
                <a 
                  href="/digital"
                  className="pf-btn pf-btn-secondary flex items-center gap-2"
                >
                  Buy Album
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Track List */}
      <div className="pf-container max-w-4xl py-8">
        <h2 className="text-xl font-bold mb-4">Tracks</h2>
        <div className="space-y-2">
          {albumTracks.map((track, index) => (
            <div 
              key={track.id}
              className="group flex items-center gap-4 p-4 rounded-xl bg-[var(--pf-surface)] border border-[var(--pf-border)] hover:border-[var(--pf-orange)] transition-colors"
            >
              {/* Track Number - uses track_number if available, otherwise index+1 */}
              <span className="w-8 text-center text-[var(--pf-text-muted)] group-hover:hidden">
                {(track as any).track_number ?? index + 1}
              </span>
              <span className="w-8 text-center hidden group-hover:block">
                <PlayIcon />
              </span>
              
              {/* Track Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate group-hover:text-[var(--pf-orange)] transition-colors">
                  {track.title}
                </p>
              </div>
              
              {/* Duration */}
              <span className="text-sm text-[var(--pf-text-muted)]">
                {formatDuration(track.duration)}
              </span>
              
              {/* Price */}
              <span className="text-sm font-medium text-[var(--pf-orange)]">
                ${track.price}
              </span>
            </div>
          ))}
        </div>

        {/* Support Section */}
        <div className="mt-10 p-6 bg-gradient-to-r from-[var(--pf-orange)]/10 to-purple-500/10 rounded-2xl border border-[var(--pf-orange)]/30">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Support this artist</h3>
              <p className="text-[var(--pf-text-secondary)]">
                Buy tracks directly — every dollar goes to the artist. No middlemen.
              </p>
            </div>
            <Link href="/music" className="pf-btn pf-btn-primary px-5 py-2 text-lg font-semibold">
              Buy Tracks
            </Link>
          </div>
        </div>
        
        {/* Back to Music */}
        <div className="mt-8 pt-8 border-t border-[var(--pf-border)]">
          <Link 
            href="/music"
            className="text-[var(--pf-orange)] hover:underline font-medium"
          >
            ← Back to all music
          </Link>
        </div>
      </div>
    </div>
  )
}
