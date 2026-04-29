'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  ChevronUp, ChevronDown, X, Maximize2
} from 'lucide-react'
import { useAudio } from '@/lib/audio-context'
import { getArtistSlugByName } from '@/lib/artists'
import { getTrackArtwork } from '@/lib/artwork'

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function GlobalPlayer() {
  const { currentTrack, isPlaying, togglePlay, playNext, playPrev, setVolume, seek, progress, duration, mode } = useAudio()
  const pathname = usePathname()
  const hideOnTapRoute = pathname.startsWith('/tap')
  const [volume, setVolumeState] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [showVisualizer, setShowVisualizer] = useState(false)
  const [mounted, setMounted] = useState(false)
  const progressRef = useRef<HTMLDivElement>(null)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Volume control — guard with mounted check (audio context differs server vs client)
  useEffect(() => {
    if (!mounted) return
    setVolume(volume)
  }, [volume, setVolume, mounted])

  useEffect(() => {
    if (!mounted) return
    if (isMuted) {
      setVolume(0)
    } else {
      setVolume(volume)
    }
  }, [isMuted, volume, setVolume, mounted])

  // Don't render player shell until mounted
  if (!mounted) return null
  if (!currentTrack) return null
  if (hideOnTapRoute) return null

  // Seek on progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !duration) return
    const rect = progressRef.current.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    seek(percent * duration)
  }

  if (!currentTrack) return null

  const artistSlug = getArtistSlugByName(currentTrack.artist) || 'artists'
  const artistHref = `/artist/${artistSlug}`

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0

  const handleExpandedTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0]
    if (!touch) return
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
  }

  const handleExpandedTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current
    const touch = e.changedTouches[0]
    touchStartRef.current = null
    if (!start || !touch) return

    const dx = touch.clientX - start.x
    const dy = touch.clientY - start.y

    if (dy > 70 && Math.abs(dy) > Math.abs(dx)) {
      setExpanded(false)
    }
  }

  const handleExpandedTouchCancel = () => {
    touchStartRef.current = null
  }

  return (
    <>
      {/* Mini Player */}
      <div className="fixed bottom-0 left-0 right-0 bg-[var(--pf-surface)] border-t border-[var(--pf-border)] z-50">
        <div className="pf-container">
          <div className="flex items-center gap-3 p-3">
            {/* Album Art */}
            <div 
              className="w-12 h-12 rounded-lg overflow-hidden bg-[var(--pf-bg)] shrink-0 cursor-pointer relative"
              onClick={() => setExpanded(true)}
            >
              <Image 
                src={getTrackArtwork(currentTrack)}
                alt={currentTrack.title}
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpanded(true)}>
              <div className="flex items-center gap-2">
                <p className={`font-medium truncate ${isPlaying ? 'text-[var(--pf-orange)]' : ''}`}>
                  {currentTrack.title}
                </p>
                {mode !== 'track' && (
                  <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-[var(--pf-surface)] text-[var(--pf-text-secondary)] border border-[var(--pf-border)]">
                    {mode}
                  </span>
                )}
                {(currentTrack as any).playback_mode === 'preview' && (
                  <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                    Preview
                  </span>
                )}
              </div>
              <Link
                href={artistHref}
                className="text-sm text-[var(--pf-text-muted)] truncate hover:text-[var(--pf-text)] transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {currentTrack.artist}
              </Link>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button 
                onClick={playPrev}
                className="p-2 rounded-full hover:bg-[var(--pf-bg)] transition-colors"
                aria-label="Previous track"
              >
                <SkipBack size={20} />
              </button>
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-[var(--pf-orange)] flex items-center justify-center hover:bg-[var(--pf-orange)]/80 transition-colors"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={20} className="text-[var(--pf-text)]" /> : <Play size={20} className="text-[var(--pf-text)] ml-0.5" />}
              </button>
              <button 
                onClick={playNext}
                className="p-2 rounded-full hover:bg-[var(--pf-bg)] transition-colors"
                aria-label="Next track"
              >
                <SkipForward size={20} />
              </button>
            </div>

            {/* Visualizer Button */}
            <button 
              onClick={() => setShowVisualizer(true)}
              className="p-2 rounded-full hover:bg-[var(--pf-bg)] transition-colors hidden sm:block"
              aria-label="Open visualizer"
            >
              <Maximize2 size={18} />
            </button>
          </div>

          {/* Progress Bar - Clickable & Keyboard Accessible */}
          <div className="px-3 pb-2">
            <div 
              ref={progressRef}
              className="h-1 bg-[var(--pf-bg)] rounded-full cursor-pointer group"
              onClick={handleProgressClick}
              onKeyDown={(e) => {
                if (!duration) return
                const step = duration * 0.05 // 5% step
                if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                  e.preventDefault()
                  seek(Math.min(progress + step, duration))
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                  e.preventDefault()
                  seek(Math.max(progress - step, 0))
                }
              }}
              role="slider"
              aria-label="Seek"
              aria-valuemin={0}
              aria-valuemax={duration || 0}
              aria-valuenow={progress}
              tabIndex={0}
            >
              <div
                className="h-full bg-[var(--pf-orange)] rounded-full transition-all relative group-hover:bg-[var(--pf-orange)]/80"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-[var(--pf-text)] rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md" />
              </div>
            </div>
            <div className="flex justify-between mt-1 text-xs text-[var(--pf-text-muted)] px-1">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            
            {/* Preview ended message */}
            {(currentTrack as any).playback_mode === 'preview' && !isPlaying && progress >= ((currentTrack as any).preview_duration_seconds || 60) - 1 && (
              <div className="mt-2 text-center">
                <p className="text-sm text-yellow-400">Preview ended — unlock full track</p>
                <button 
                  className="mt-1 text-xs bg-[var(--pf-surface)] hover:bg-[var(--pf-orange)]/20 border border-[var(--pf-border)] px-3 py-1 rounded transition-colors disabled:opacity-50"
                  disabled
                  title="Unlock feature coming soon"
                >
                  Unlock Full Track
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Player */}
      {expanded && (
        <div
          className="fixed inset-0 bg-[var(--pf-bg)] z-[60] flex flex-col overflow-hidden"
          style={{ touchAction: 'pan-y' }}
          onTouchStart={handleExpandedTouchStart}
          onTouchEnd={handleExpandedTouchEnd}
          onTouchCancel={handleExpandedTouchCancel}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--pf-border)] shrink-0">
            <button onClick={() => setExpanded(false)} className="p-2">
              <ChevronDown size={24} />
            </button>
            <span className="font-medium">Now Playing</span>
            <button onClick={() => setShowVisualizer(true)} className="p-2">
              <Maximize2 size={20} />
            </button>
          </div>

          {/* Album Art */}
          <div className="flex-1 min-h-0 flex items-center justify-center px-4 py-4 md:px-8 md:py-8">
            <div className="w-full max-w-xs md:max-w-sm aspect-square rounded-2xl overflow-hidden shadow-2xl relative">
              <Image 
                src={getTrackArtwork(currentTrack)}
                alt={currentTrack.title}
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover"
              />
            </div>
          </div>

          {/* Track Info */}
          <div className="px-4 text-center md:px-8">
            <h2 className="text-xl font-bold truncate md:text-2xl">{currentTrack.title}</h2>
            <Link
              href={artistHref}
              className="block truncate text-base text-[var(--pf-text-secondary)] transition-colors hover:text-[var(--pf-text)] md:text-lg"
            >
              {currentTrack.artist}
            </Link>
            {currentTrack.album && (
              <p className="text-sm text-[var(--pf-text-muted)] truncate">{currentTrack.album}</p>
            )}
          </div>

          {/* Progress */}
          <div className="px-4 py-4 md:px-8 md:py-6">
            <div 
              className="h-2 bg-[var(--pf-bg)] rounded-full overflow-hidden cursor-pointer group"
              onClick={handleProgressClick}
              onKeyDown={(e) => {
                if (!duration) return
                const step = duration * 0.05
                if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                  e.preventDefault()
                  seek(Math.min(progress + step, duration))
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                  e.preventDefault()
                  seek(Math.max(progress - step, 0))
                }
              }}
              role="slider"
              aria-label="Seek"
              aria-valuemin={0}
              aria-valuemax={duration || 0}
              aria-valuenow={progress}
              tabIndex={0}
            >
              <div
                className="h-full bg-[var(--pf-orange)] transition-all relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-[var(--pf-text)] rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
              </div>
            </div>
            <div className="flex justify-between mt-2 text-sm text-[var(--pf-text-muted)]">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6 pb-4 md:pb-8 shrink-0">
            <button 
              onClick={playPrev}
              className="p-3 rounded-full hover:bg-[var(--pf-surface)] transition-colors"
            >
              <SkipBack size={28} />
            </button>
            <button
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-[var(--pf-orange)] flex items-center justify-center hover:bg-[var(--pf-orange)]/80 transition-colors"
            >
              {isPlaying ? <Pause size={28} className="text-[var(--pf-text)]" /> : <Play size={28} className="text-[var(--pf-text)] ml-1" />}
            </button>
            <button 
              onClick={playNext}
              className="p-3 rounded-full hover:bg-[var(--pf-surface)] transition-colors"
            >
              <SkipForward size={28} />
            </button>
          </div>

          {/* Volume */}
          <div className="hidden px-8 pb-4 md:block">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsMuted(!isMuted)} className="p-2">
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolumeState(parseInt(e.target.value))}
                className="flex-1"
              />
            </div>
          </div>

          {/* Fan CTA */}
          <div className="hidden px-8 pb-8 md:block">
            <div className="bg-[var(--pf-surface)] rounded-xl p-4 border border-[var(--pf-border)]">
              <p className="text-sm font-medium mb-2">Support this artist directly</p>
              <p className="text-xs text-[var(--pf-text-muted)] mb-3">Artists who care share with fans who care. Unlock full tracks or become a superfan.</p>
              <div className="flex gap-2">
                <Link href="/music" className="flex-1 py-2 px-3 bg-[var(--pf-bg)] border border-[var(--pf-border)] text-[var(--pf-text)] rounded-lg font-medium text-sm text-center hover:border-[var(--pf-text-secondary)] transition-colors">
                  Buy Tracks
                </Link>
                <Link href="/signup?role=supporter" className="flex-1 py-2 px-3 border border-[var(--pf-border)] rounded-lg font-medium text-sm text-center hover:border-[var(--pf-text-secondary)] transition-colors">
                  Become a Superfan
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visualizer Modal */}
      {showVisualizer && (
        <div className="fixed inset-0 bg-[var(--pf-bg)] z-[70] flex flex-col">
          {/* Track Info at top */}
          <div className="p-6 bg-gradient-to-b from-[var(--pf-bg)]/80 to-transparent">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-[var(--pf-text)] truncate">{currentTrack.title}</h2>
                <Link
                  href={artistHref}
                  className="text-lg text-[var(--pf-text-secondary)] truncate hover:text-[var(--pf-text)] transition-colors block"
                  onClick={() => setShowVisualizer(false)}
                >
                  {currentTrack.artist}
                </Link>
                {currentTrack.album && (
                  <p className="text-sm text-[var(--pf-text-muted)] truncate">{currentTrack.album}</p>
                )}
              </div>
              <button
                onClick={() => setShowVisualizer(false)}
                className="p-3 rounded-full bg-[var(--pf-surface)] hover:bg-[var(--pf-border)]"
              >
                <X size={24} className="text-[var(--pf-text)]" />
              </button>
            </div>
          </div>

          {/* Visualizer Area */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-64 h-64 mx-auto rounded-full overflow-hidden shadow-2xl relative">
                <Image 
                  src={getTrackArtwork(currentTrack)}
                  alt={currentTrack.title}
                  fill
                  sizes="256px"
                  className={`object-cover ${isPlaying ? 'animate-spin' : ''}`}
                  style={{ animationDuration: '3s' }}
                />
              </div>
            </div>
          </div>

          {/* Play Controls */}
          <div className="p-6 bg-gradient-to-t from-[var(--pf-bg)]/80 to-transparent">
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={playPrev}
                className="p-3 rounded-full bg-[var(--pf-surface)] hover:bg-[var(--pf-border)]"
              >
                <SkipBack size={24} className="text-[var(--pf-text)]" />
              </button>
              <button
                onClick={togglePlay}
                className="w-14 h-14 rounded-full bg-[var(--pf-orange)] flex items-center justify-center"
              >
                {isPlaying ? <Pause size={24} className="text-[var(--pf-text)]" /> : <Play size={24} className="text-[var(--pf-text)] ml-0.5" />}
              </button>
              <button
                onClick={playNext}
                className="p-3 rounded-full bg-[var(--pf-surface)] hover:bg-[var(--pf-border)]"
              >
                <SkipForward size={24} className="text-[var(--pf-text)]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
