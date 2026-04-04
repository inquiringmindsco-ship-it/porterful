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
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudio()
  const router = useRouter()
  const [purchasing, setPurchasing] = useState<string | null>(null)

  const handlePlay = useCallback((track: Track) => {
    if (currentTrack?.id === track.id) {
      togglePlay()
    } else {
      playTrack(track)
    }
  }, [currentTrack, playTrack, togglePlay])

  const handleBuy = useCallback(async (e: React.MouseEvent, track: Track) => {
    e.stopPropagation()
    setPurchasing(track.id)
    try {
      // Create checkout for single track
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
          successUrl: `${window.location.origin}/checkout/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
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
              <div className="flex items-center gap-3">
                <span className="hidden sm:block text-sm text-[var(--pf-text-muted)] font-mono">
                  {formatPlays(track.plays || 0)}
                </span>
                <span className="text-sm text-[var(--pf-text-muted)] font-mono w-12 text-right">
                  {track.duration}
                </span>

                {/* Buy button */}
                <button
                  onClick={(e) => handleBuy(e, track)}
                  disabled={purchasing === track.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--pf-orange)] hover:bg-[var(--pf-orange-dark)] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  {purchasing === track.id ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      <span>Buying...</span>
                    </>
                  ) : (
                    <span>${track.price || 1}</span>
                  )}
                </button>

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
