'use client'

import { useCallback, useState } from 'react'
import Image from 'next/image'
import { Play, Pause, Loader2, Star } from 'lucide-react'
import { useAudio, type Track } from '@/lib/audio-context'
import { CollaboratorStack } from '@/components/artist/CollaboratorStack'
import { buildTrackArtistCredits } from '@/lib/artist-credits'

interface FeaturedTrackCardProps {
  track: Track
  queue: Track[]
}

export function FeaturedTrackCard({ track, queue }: FeaturedTrackCardProps) {
  const { currentTrack, isPlaying, playTrack, togglePlay, setMode, setQueue } = useAudio()
  const [purchasing, setPurchasing] = useState(false)

  const isActive = currentTrack?.id === track.id
  const artistCredits = buildTrackArtistCredits(track)

  const handlePlay = useCallback(() => {
    if (isActive) {
      togglePlay()
      return
    }
    setMode('artist')
    const idx = queue.findIndex((t) => t.id === track.id)
    if (idx >= 0) {
      const reordered = [...queue.slice(idx), ...queue.slice(0, idx)]
      setQueue(reordered)
    } else {
      setQueue([track])
    }
    playTrack(track)
  }, [isActive, playTrack, queue, setMode, setQueue, togglePlay, track])

  const handleBuy = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    setPurchasing(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{
            id: track.id,
            name: track.title,
            artist: track.artist,
            price: track.price ?? 0.50,
            quantity: 1,
            type: 'track',
          }],
          successUrl: `${window.location.origin}/checkout/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}${window.location.pathname}`,
        }),
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
      setPurchasing(false)
    }
  }, [track])

  return (
    <div
      onClick={handlePlay}
      className={`relative flex items-center gap-4 sm:gap-5 p-4 sm:p-5 rounded-2xl bg-[var(--pf-surface)] border cursor-pointer transition-colors overflow-hidden ${
        isActive ? 'border-[var(--pf-orange)]' : 'border-[var(--pf-border)] hover:border-[var(--pf-text-muted)]'
      }`}
    >
      <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-[var(--pf-bg)] flex-shrink-0">
        {track.image && (
          <Image
            src={track.image}
            alt={track.title}
            fill
            sizes="(max-width: 640px) 80px, 112px"
            className="object-cover"
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--pf-orange)]/10 text-[var(--pf-orange)] text-[11px] uppercase tracking-widest font-semibold mb-2">
          <Star size={11} className="fill-[var(--pf-orange)]" />
          Top Track
        </div>
        <h3 className={`text-lg sm:text-xl font-bold truncate ${isActive ? 'text-[var(--pf-orange)]' : ''}`}>
          {track.title}
        </h3>
        {track.album && (
          <p className="text-xs sm:text-sm text-[var(--pf-text-muted)] truncate">{track.album}</p>
        )}
        {artistCredits.length > 1 && (
          <CollaboratorStack artists={artistCredits} size="xs" className="mt-2" />
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <button
          onClick={handleBuy}
          disabled={purchasing}
          aria-label={purchasing ? 'Processing purchase' : `Buy for $${Number(track.price ?? 0.50).toFixed(2)}`}
          className="hidden sm:flex items-center gap-1 px-3 py-2 bg-[var(--pf-bg)] border border-[var(--pf-border)] hover:border-[var(--pf-text-muted)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--pf-text)] text-sm font-semibold rounded-lg transition-colors"
        >
          {purchasing ? <Loader2 size={12} className="animate-spin" /> : <span>${Number(track.price ?? 0.50).toFixed(2)}</span>}
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); handlePlay() }}
          aria-label={isActive && isPlaying ? 'Pause featured track' : 'Play featured track'}
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-colors ${
            isActive
              ? 'bg-[var(--pf-orange)] text-[var(--pf-text)]'
              : 'bg-[var(--pf-orange)] hover:bg-[var(--pf-orange)]/90 text-[var(--pf-text)]'
          }`}
        >
          {isActive && isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
        </button>
      </div>
    </div>
  )
}
