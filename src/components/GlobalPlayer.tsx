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

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function GlobalPlayer() {
  const { currentTrack, isPlaying, isLoading, error, togglePlay, playNext, playPrev, setVolume, seek, progress, duration, mode } = useAudio()
  const pathname = usePathname()
  const hideOnTapRoute = pathname.startsWith('/tap')
  const [volume, setVolumeState] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [showVisualizer, setShowVisualizer] = useState(false)
  const [mounted, setMounted] = useState(false)
  const progressRef = useRef<HTMLDivElement>(null)

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
                src={currentTrack.image || '/album-art/default.jpg'} 
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
                {isLoading && (
                  <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-yellow-500/20 text-yellow-400">
                    loading
                  </span>
                )}
                {error && (
                  <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-red-500/20 text-red-400" title={error}>
                    error
                  </span>
                )}
                {mode !== 'track' && (
                  <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                    mode === 'radio' ? 'bg-red-500/20 text-red-400' : 'bg-[var(--pf-orange)]/20 text-[var(--pf-orange)]'
                  }`}>
                    {mode}
                  </span>
                )}
              </div>
              <Link
                href={artistHref}
                className="text-sm text-[var(--pf-text-muted)] truncate hover:text-[var(--pf-orange)] transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {currentTrack.artist}
              </Link>
              {error && (
                <p className="text-xs text-red-400 truncate">{error}</p>
              )}
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
                {isPlaying ? <Pause size={20} className="text-white" /> : <Play size={20} className="text-white ml-0.5" />}
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
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md" />
              </div>
            </div>
            <div className="flex justify-between mt-1 text-xs text-[var(--pf-text-muted)] px-1">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Player */}
      {expanded && (
        <div className="fixed inset-0 bg-[var(--pf-bg)] z-[60] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--pf-border)]">
            <button onClick={() => setExpanded(false)} className="p-2">
              <ChevronDown size={24} />
            </button>
            <span className="font-medium">Now Playing</span>
            <button onClick={() => setShowVisualizer(true)} className="p-2">
              <Maximize2 size={20} />
            </button>
          </div>

          {/* Album Art */}
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-sm aspect-square rounded-2xl overflow-hidden shadow-2xl relative">
              <Image 
                src={currentTrack.image || '/album-art/default.jpg'} 
                alt={currentTrack.title}
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover"
              />
            </div>
          </div>

          {/* Track Info */}
          <div className="px-8 text-center">
            <h2 className="text-2xl font-bold truncate">{currentTrack.title}</h2>
            <Link 
              href={artistHref}
              className="text-lg text-[var(--pf-text-secondary)] truncate hover:text-[var(--pf-orange)] transition-colors block"
            >
              {currentTrack.artist}
            </Link>
            {currentTrack.album && (
              <p className="text-sm text-[var(--pf-text-muted)] truncate">{currentTrack.album}</p>
            )}
          </div>

          {/* Progress */}
          <div className="px-8 py-6">
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
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
              </div>
            </div>
            <div className="flex justify-between mt-2 text-sm text-[var(--pf-text-muted)]">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6 pb-8">
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
              {isPlaying ? <Pause size={28} className="text-white" /> : <Play size={28} className="text-white ml-1" />}
            </button>
            <button 
              onClick={playNext}
              className="p-3 rounded-full hover:bg-[var(--pf-surface)] transition-colors"
            >
              <SkipForward size={28} />
            </button>
          </div>

          {/* Volume */}
          <div className="px-8 pb-4">
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
          <div className="px-8 pb-8">
            <div className="bg-gradient-to-r from-[var(--pf-orange)]/10 to-purple-500/10 rounded-xl p-4 border border-[var(--pf-orange)]/20">
              <p className="text-sm font-medium mb-2">Support this artist directly</p>
              <p className="text-xs text-[var(--pf-text-muted)] mb-3">Artists who care share with fans who care. Unlock full tracks or become a superfan.</p>
              <div className="flex gap-2">
                <Link href="/music" className="flex-1 py-2 px-3 bg-[var(--pf-orange)] text-white rounded-lg font-medium text-sm text-center hover:bg-[var(--pf-orange-dark)] transition-colors">
                  Buy Tracks
                </Link>
                <Link href="/signup?role=supporter" className="flex-1 py-2 px-3 border border-[var(--pf-border)] rounded-lg font-medium text-sm text-center hover:border-[var(--pf-orange)] transition-colors">
                  Become a Superfan
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visualizer Modal */}
      {showVisualizer && (
        <div className="fixed inset-0 bg-black z-[70] flex flex-col">
          {/* Track Info at top */}
          <div className="p-6 bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-white truncate">{currentTrack.title}</h2>
                <Link 
                  href={artistHref}
                  className="text-lg text-white/80 truncate hover:text-[var(--pf-orange)] transition-colors block"
                  onClick={() => setShowVisualizer(false)}
                >
                  {currentTrack.artist}
                </Link>
                {currentTrack.album && (
                  <p className="text-sm text-white/60 truncate">{currentTrack.album}</p>
                )}
              </div>
              <button
                onClick={() => setShowVisualizer(false)}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20"
              >
                <X size={24} className="text-white" />
              </button>
            </div>
          </div>

          {/* Visualizer Area */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-64 h-64 mx-auto rounded-full overflow-hidden shadow-2xl relative">
                <Image 
                  src={currentTrack.image || '/album-art/default.jpg'} 
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
          <div className="p-6 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center justify-center gap-6">
              <button 
                onClick={playPrev}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20"
              >
                <SkipBack size={24} className="text-white" />
              </button>
              <button 
                onClick={togglePlay}
                className="w-14 h-14 rounded-full bg-[var(--pf-orange)] flex items-center justify-center"
              >
                {isPlaying ? <Pause size={24} className="text-white" /> : <Play size={24} className="text-white ml-0.5" />}
              </button>
              <button 
                onClick={playNext}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20"
              >
                <SkipForward size={24} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
