'use client'

import { useState, useEffect } from 'react'
import { TRACKS } from '@/lib/data'
import Link from 'next/link'
import Image from 'next/image'
import { useAudio } from '@/lib/audio-context'
import { Play, Pause, SkipForward, Radio, Heart, ShoppingBag } from 'lucide-react'
import { getArtistSlugByName } from '@/lib/artists'

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function RadioPage() {
  const { currentTrack, isPlaying, togglePlay, playNext, setQueue, currentIndex, setMode } = useAudio()
  const [shuffledTracks, setShuffledTracks] = useState<typeof TRACKS>([])

  useEffect(() => {
    setShuffledTracks(shuffleArray(TRACKS))
  }, [])

  useEffect(() => {
    if (shuffledTracks.length === 0) return
    setQueue(shuffledTracks.map(t => ({
      ...t,
      duration: typeof t.duration === 'string'
        ? t.duration.split(':').reduce((acc: number, part: string) => (60 * acc) + parseInt(part), 0)
        : t.duration || 180
    })))
  }, [shuffledTracks, setQueue])

  useEffect(() => {
    setMode('radio')
    return () => setMode('track')
  }, [setMode])

  const nextTrack = shuffledTracks[(currentIndex + 1) % shuffledTracks.length]
  const currentArtistHref = currentTrack ? `/artist/${getArtistSlugByName(currentTrack.artist) || 'artists'}` : '/artists'
  const nextArtistHref = nextTrack ? `/artist/${getArtistSlugByName(nextTrack.artist) || 'artists'}` : '/artists'

  return (
    <div className="min-h-screen pt-20 pb-32">
      <div className="pf-container max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[var(--pf-orange)] to-purple-600 mb-4">
            <Radio size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Porterful Radio</h1>
          <p className="text-[var(--pf-text-secondary)]">
            Shuffle through all tracks · Click play to start
          </p>
        </div>

        {/* Now Playing Card */}
        <div className="bg-gradient-to-br from-[var(--pf-surface)] to-[var(--pf-bg)] rounded-2xl overflow-hidden border border-[var(--pf-border)] mb-6">
          <div className="relative aspect-square max-h-80 overflow-hidden bg-black">
            <Image
              src={currentTrack?.image || '/album-art/default.jpg'}
              alt={currentTrack?.title || 'Now Playing'}
              fill
              sizes="(max-width: 768px) 100vw, 80vw"
              className={`object-cover transition-opacity duration-300 ${isPlaying ? 'opacity-100' : 'opacity-70'}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="flex items-center gap-1 px-3 py-1 bg-red-500 rounded-full text-white text-sm font-medium shadow-lg">
                <span className={`w-2 h-2 bg-white rounded-full ${isPlaying ? 'animate-pulse' : ''}`} />
                {isPlaying ? 'LIVE' : 'RADIO'}
              </span>
              <span className="px-3 py-1 bg-black/70 backdrop-blur rounded-full text-white text-sm">
                {shuffledTracks.length} tracks
              </span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h2 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">{currentTrack?.title || 'Select a track'}</h2>
              {currentTrack && (
                <>
                  <Link
                    href={currentArtistHref}
                    className="text-white/90 drop-shadow hover:text-[var(--pf-orange)] transition-colors"
                  >
                    {currentTrack.artist}
                  </Link>
                  <span className="text-white/70"> · {currentTrack.album}</span>
                </>
              )}
            </div>
          </div>

          <div className="p-4 bg-[var(--pf-bg)]">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={togglePlay}
                className="w-16 h-16 rounded-full bg-[var(--pf-orange)] flex items-center justify-center hover:bg-[var(--pf-orange-dark)] transition-colors"
              >
                {isPlaying ? <Pause size={28} className="text-white" /> : <Play size={28} className="text-white ml-1" />}
              </button>

              <button
                onClick={playNext}
                className="w-12 h-12 rounded-full bg-[var(--pf-surface)] flex items-center justify-center hover:bg-[var(--pf-border)] transition-colors"
                title="Skip to next track"
              >
                <SkipForward size={20} className="text-[var(--pf-text)]" />
              </button>
            </div>
          </div>
        </div>

        {/* Up Next */}
        {nextTrack && (
          <div className="bg-[var(--pf-surface)] rounded-xl p-4 mb-6 border border-[var(--pf-border)]">
            <h3 className="text-sm font-semibold text-[var(--pf-text-muted)] mb-3">UP NEXT</h3>
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded overflow-hidden bg-black shrink-0">
                <Image
                  src={nextTrack?.image || '/album-art/default.jpg'}
                  alt={nextTrack?.title}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{nextTrack?.title}</p>
                <Link
                  href={nextArtistHref}
                  className="text-sm text-[var(--pf-text-muted)] hover:text-[var(--pf-orange)] transition-colors"
                >
                  {nextTrack?.artist}
                </Link>
              </div>
              <span className="text-sm text-[var(--pf-text-muted)]">{nextTrack?.duration}</span>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-8 text-center">
          <Link href="/music" className="pf-btn pf-btn-primary inline-flex items-center gap-2">
            <ShoppingBag size={18} />
            Buy Tracks
          </Link>
        </div>
      </div>
    </div>
  )
}
