'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, Pause, Play, Verified } from 'lucide-react'
import { useAudio, Track } from '@/lib/audio-context'
import { LikenessBadge } from '@/components/likeness/LikenessGate'

interface ArtistHeroProps {
  artist: {
    name: string
    slug: string
    genre: string
    location: string
    verified: boolean
    likeness_verified?: boolean
    image: string
  }
  firstTrack: Track | null
  queueTracks: Track[]
}

export function ArtistHero({ artist, firstTrack, queueTracks }: ArtistHeroProps) {
  const { currentTrack, isPlaying, playTrack, togglePlay, setQueue } = useAudio()

  const isThisArtistPlaying = !!currentTrack && queueTracks.some((t) => t.id === currentTrack.id)
  const showPause = isThisArtistPlaying && isPlaying

  const handlePlay = () => {
    if (!firstTrack) return
    if (isThisArtistPlaying) {
      togglePlay()
      return
    }
    if (queueTracks.length > 0) setQueue(queueTracks)
    playTrack(firstTrack)
  }

  return (
    <section className="bg-[var(--pf-bg)] border-b border-[var(--pf-border)]">
      {/* Back nav */}
      <div className="max-w-6xl mx-auto px-5 sm:px-6 pt-5">
        <Link
          href="/artists"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--pf-text-secondary)] hover:text-[var(--pf-text)] transition-colors"
        >
          <ChevronLeft size={16} />
          Artists
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-5 sm:px-6 pt-5 pb-6 sm:pt-6 sm:pb-8">
        <div className="flex items-center gap-4 sm:gap-5">
          {/* Avatar */}
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden flex-shrink-0 bg-[var(--pf-surface)] border border-[var(--pf-border)]">
            {artist.image ? (
              <Image
                src={artist.image}
                alt={artist.name}
                fill
                sizes="(max-width: 640px) 96px, 128px"
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-3xl font-bold text-[var(--pf-text-secondary)]">
                  {artist.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] uppercase tracking-widest text-[var(--pf-text-secondary)] mb-1">
              Artist
            </p>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-3xl font-bold truncate">{artist.name}</h1>
              {artist.verified && (
                <Verified size={16} className="text-[var(--pf-text-secondary)] shrink-0" />
              )}
              {artist.likeness_verified && <LikenessBadge compact />}
            </div>
            <p className="text-sm text-[var(--pf-text-secondary)] truncate">
              {artist.genre}
              {artist.location && ` · ${artist.location}`}
            </p>
          </div>

          {/* Primary action */}
          <button
            onClick={handlePlay}
            disabled={!firstTrack}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[var(--pf-orange)] hover:bg-[var(--pf-orange)]/90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 transition-colors shadow-lg"
            aria-label={showPause ? `Pause ${artist.name}` : `Play ${artist.name}`}
          >
            {showPause ? (
              <Pause size={24} className="text-[var(--pf-text)]" />
            ) : (
              <Play size={24} className="text-[var(--pf-text)] ml-0.5" />
            )}
          </button>
        </div>
      </div>
    </section>
  )
}
