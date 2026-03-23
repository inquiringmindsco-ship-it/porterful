'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  ChevronUp, ChevronDown, X, Maximize2
} from 'lucide-react'
import { useAudio } from '@/lib/audio-context'

export function GlobalPlayer() {
  const { currentTrack, isPlaying, togglePlay, nextTrack, prevTrack, queue, currentIndex, seek, progress, duration } = useAudio()
  const [volume, setVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [showVisualizer, setShowVisualizer] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)

  // Update Media Session for iOS lock screen
  useEffect(() => {
    if (!currentTrack) return

    if ('mediaSession' in navigator) {
      const mediaSession = navigator.mediaSession
      
      mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title || 'Unknown Track',
        artist: currentTrack.artist || 'Unknown Artist',
        album: currentTrack.album || 'Unknown Album',
        artwork: currentTrack.image ? [
          { src: currentTrack.image, sizes: '512x512', type: 'image/jpeg' },
          { src: currentTrack.image, sizes: '256x256', type: 'image/jpeg' },
          { src: currentTrack.image, sizes: '128x128', type: 'image/jpeg' },
          { src: currentTrack.image, sizes: '96x96', type: 'image/jpeg' },
        ] : [],
      })

      mediaSession.setActionHandler('play', () => {
        togglePlay()
      })

      mediaSession.setActionHandler('pause', () => {
        togglePlay()
      })

      mediaSession.setActionHandler('previoustrack', () => {
        if (prevTrack) prevTrack()
      })

      mediaSession.setActionHandler('nexttrack', () => {
        if (nextTrack) nextTrack()
      })

      mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime && seek) {
          seek(details.seekTime)
        }
      })
    }
  }, [currentTrack])

  // Update play state in Media Session
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused'
    }
  }, [isPlaying])

  // Volume control
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100
    }
  }, [volume, isMuted])

  if (!currentTrack) return null

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0

  return (
    <>
      {/* Mini Player */}
      <div 
        className={`fixed bottom-0 left-0 right-0 bg-[var(--pf-surface)] border-t border-[var(--pf-border)] z-50 transition-all ${
          expanded ? 'translate-y-full' : ''
        }`}
      >
        <div className="pf-container">
          <div className="flex items-center gap-3 p-3">
            {/* Album Art */}
            <div 
              className="w-12 h-12 rounded-lg overflow-hidden bg-[var(--pf-bg)] shrink-0 cursor-pointer"
              onClick={() => setExpanded(true)}
            >
              <img 
                src={currentTrack.image || '/album-art/default.jpg'} 
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpanded(true)}>
              <p className={`font-medium truncate ${isPlaying ? 'text-[var(--pf-orange)]' : ''}`}>
                {currentTrack.title}
              </p>
              <p className="text-sm text-[var(--pf-text-muted)] truncate">
                {currentTrack.artist}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button 
                onClick={prevTrack}
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
                onClick={nextTrack}
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

          {/* Progress Bar */}
          <div className="h-1 bg-[var(--pf-bg)]">
            <div 
              className="h-full bg-[var(--pf-orange)] transition-all"
              style={{ width: `${progressPercent}%` }}
            />
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
            <div className="w-full max-w-sm aspect-square rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={currentTrack.image || '/album-art/default.jpg'} 
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Track Info */}
          <div className="px-8 text-center">
            <h2 className="text-2xl font-bold truncate">{currentTrack.title}</h2>
            <p className="text-lg text-[var(--pf-text-secondary)] truncate">{currentTrack.artist}</p>
            {currentTrack.album && (
              <p className="text-sm text-[var(--pf-text-muted)] truncate">{currentTrack.album}</p>
            )}
          </div>

          {/* Progress */}
          <div className="px-8 py-6">
            <div className="h-1 bg-[var(--pf-bg)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[var(--pf-orange)] transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-[var(--pf-text-muted)]">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6 pb-8">
            <button 
              onClick={prevTrack}
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
              onClick={nextTrack}
              className="p-3 rounded-full hover:bg-[var(--pf-surface)] transition-colors"
            >
              <SkipForward size={28} />
            </button>
          </div>

          {/* Volume */}
          <div className="px-8 pb-8">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsMuted(!isMuted)} className="p-2">
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="flex-1"
              />
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
                <p className="text-lg text-white/80 truncate">{currentTrack.artist}</p>
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
              <div className="w-64 h-64 mx-auto rounded-full overflow-hidden shadow-2xl">
                <img 
                  src={currentTrack.image || '/album-art/default.jpg'} 
                  alt={currentTrack.title}
                  className={`w-full h-full object-cover ${isPlaying ? 'animate-spin' : ''}`}
                  style={{ animationDuration: '3s' }}
                />
              </div>
              <p className="text-white/40 mt-8 text-sm">Visualizer Mode</p>
            </div>
          </div>

          {/* Play Controls */}
          <div className="p-6 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center justify-center gap-6">
              <button 
                onClick={prevTrack}
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
                onClick={nextTrack}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20"
              >
                <SkipForward size={24} className="text-white" />
              </button>
            </div>
            <p className="text-center text-white/40 text-sm mt-4">
              Lock screen shows artist info on iOS
            </p>
          </div>
        </div>
      )}
    </>
  )
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}