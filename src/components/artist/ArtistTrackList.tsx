'use client'

import { useCallback, useState } from 'react'
import { useAudio, Track } from '@/lib/audio-context'
import { Play, Pause, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ArtistTrackListProps {
  tracks: Track[]
}

function formatPlays(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(0) + 'K'
  return n.toString()
}

export function ArtistTrackList({ tracks }: ArtistTrackListProps) {
  const { currentTrack, isPlaying, playTrack, togglePlay, setMode } = useAudio()
  const router = useRouter()
  const [purchasing, setPurchasing] = useState<string | null>(null)

  const handlePlay = useCallback((track: Track) => {
    if (currentTrack?.id === track.id) {
      togglePlay()
    } else {
      setMode('artist')
      playTrack(track)
    }
  }, [currentTrack, playTrack, togglePlay, setMode])

  const handleBuy = useCallback(async (e: React.MouseEvent, track: Track) => {
    e.stopPropagation()
    setPurchasing(track.id)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{
            id: track.id,
            name: track.title,
            artist: track.artist,
            price: track.price || 1,
            quantity: 1,
            type: 'track',
          }],
          successUrl: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}${window.location.pathname}`,
        })
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Checkout not configured. Add Stripe keys to enable purchases.')
      }
    } catch (err) {
      console.error('Buy failed:', err)
      alert('Something went wrong. Please try again.')
    } finally {
      setPurchasing(null)
    }
  }, [])

  return (
    <div className="bg-[var(--pf-surface)] rounded-2xl border border-[var(--pf-border)] overflow-hidden">
      <div className="divide-y divide-[var(--pf-border)]">
        {tracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <p className="text-sm text-[var(--pf-text-muted)] mb-2">No tracks yet</p>
            <p className="text-xs text-[var(--pf-text-secondary)]">Check back soon — music is on the way.</p>
          </div>
        ) : (
          tracks.map((track, index) => {
            const isActive = currentTrack?.id === track.id

            return (
              <div
                key={track.id}
                onClick={() => handlePlay(track)}
                className={`group flex items-center gap-3 sm:gap-4 px-3 sm:px-5 py-3 sm:py-4 cursor-pointer transition-all hover:bg-[var(--pf-bg)] border border-transparent hover:border-[var(--pf-border-subtle)] rounded-lg mx-1 overflow-hidden ${
                  isActive ? 'bg-[var(--pf-orange)]/5' : ''
                }`}
              >
                {/* Track number / play indicator */}
                <div className="w-7 sm:w-8 flex items-center justify-center flex-shrink-0">
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
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className={`font-medium text-sm sm:text-base truncate ${isActive ? 'text-[var(--pf-orange)]' : ''}`}>
                    {track.title}
                  </p>
                  <p className="text-xs sm:text-sm text-[var(--pf-text-muted)] truncate">{track.album}</p>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
                  <span className="text-sm text-[var(--pf-text-muted)] font-mono w-12 text-right">
                    {track.duration}
                  </span>

                  {/* Buy button */}
                  <button
                    onClick={(e) => handleBuy(e, track)}
                    disabled={purchasing === track.id}
                    title={purchasing === track.id ? 'Processing purchase...' : `Buy "${track.title}" — $${track.price || 1}`}
                    aria-label={purchasing === track.id ? 'Processing purchase' : `Buy for $${track.price || 1}`}
                    className="flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-[var(--pf-orange)] hover:bg-[var(--pf-orange-dark)] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors flex-shrink-0"
                  >
                    {purchasing === track.id ? (
                      <Loader2 size={11} className="animate-spin" />
                    ) : (
                      <span>${track.price || 1}</span>
                    )}
                  </button>

                  {/* Play button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handlePlay(track); }}
                    title={currentTrack?.id === track.id && isPlaying ? `Pause "${track.title}"` : `Play "${track.title}"`}
                    aria-label={currentTrack?.id === track.id && isPlaying ? `Pause` : `Play`}
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                      isActive
                        ? 'bg-[var(--pf-orange)] text-white'
                        : 'bg-[var(--pf-bg)] border border-[var(--pf-border)] text-[var(--pf-text-muted)] hover:bg-[var(--pf-orange)] hover:text-white hover:border-[var(--pf-orange)]'
                    }`}
                  >
                    {isActive && isPlaying ? <Pause size={13} /> : <Play size={13} className="ml-0.5" />}
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
