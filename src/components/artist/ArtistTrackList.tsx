'use client'

import { useCallback } from 'react'
import { useAudio, Track } from '@/lib/audio-context'
import { Play, Pause } from 'lucide-react'

interface ArtistTrackListProps {
  tracks: Track[]
  sectionTitle?: string
}

function formatPlays(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(0) + 'K'
  return n.toString()
}

export function ArtistTrackList({ tracks }: ArtistTrackListProps) {
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudio()

  const handlePlay = useCallback((track: Track) => {
    if (currentTrack?.id === track.id) {
      togglePlay()
    } else {
      playTrack(track)
    }
  }, [currentTrack, playTrack, togglePlay])

  return (
    <div className="bg-[var(--pf-surface)] rounded-2xl border border-[var(--pf-border)] overflow-hidden">
      <div className="divide-y divide-[var(--pf-border)]">
        {tracks.map((track, index) => {
          const isActive = currentTrack?.id === track.id

          return (
            <div
              key={track.id}
              onClick={() => handlePlay(track)}
              className={`group flex items-center gap-4 px-5 py-4 cursor-pointer transition-all hover:bg-[var(--pf-bg)] ${
                isActive ? 'bg-[var(--pf-orange)]/5' : ''
              }`}
            >
              {/* Track number / play indicator */}
              <div className="w-8 flex items-center justify-center">
                {isActive && isPlaying ? (
                  <div className="flex items-center gap-0.5" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
                    <div className="w-1 h-3.5 bg-[var(--pf-orange)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1 h-2.5 bg-[var(--pf-orange)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1 h-4 bg-[var(--pf-orange)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                ) : (
                  <span className="text-sm font-mono text-[var(--pf-text-muted)] group-hover:text-[var(--pf-orange)]">
                    {index + 1}
                  </span>
                )}
              </div>

              {/* Track info */}
              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${isActive ? 'text-[var(--pf-orange)]' : ''}`}>
                  {track.title}
                </p>
                <p className="text-sm text-[var(--pf-text-muted)] truncate">{track.album}</p>
              </div>

              {/* Right side */}
              <div className="flex items-center gap-4">
                <span className="hidden sm:block text-sm text-[var(--pf-text-muted)] font-mono">
                  {formatPlays(track.plays || 0)}
                </span>
                <span className="text-sm text-[var(--pf-text-muted)] font-mono w-12 text-right">
                  {track.duration}
                </span>
                <span className="text-sm font-semibold text-[var(--pf-text-muted)]">
                  ${track.price || 1}
                </span>

                {/* Play button */}
                <button
                  onClick={(e) => { e.stopPropagation(); handlePlay(track); }}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                    isActive
                      ? 'bg-[var(--pf-orange)] text-white'
                      : 'bg-[var(--pf-bg)] text-[var(--pf-text-muted)] group-hover:bg-[var(--pf-orange)] group-hover:text-white opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {isActive && isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
