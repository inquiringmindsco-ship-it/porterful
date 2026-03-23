'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { TRACKS } from '@/lib/data'
import Link from 'next/link'
import { Play, Pause, SkipForward, Radio, Heart, ShoppingBag } from 'lucide-react'

// Shuffle array helper
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Format time helper
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Preview duration (1 minute)
const PREVIEW_DURATION = 60

export default function RadioPage() {
  const [shuffledTracks] = useState(() => shuffleArray(TRACKS))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [showPurchasePrompt, setShowPurchasePrompt] = useState(false)
  const [crossfade, setCrossfade] = useState(1)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  const currentTrack = shuffledTracks[currentIndex]
  const nextTrack = shuffledTracks[(currentIndex + 1) % shuffledTracks.length]
  
  // Play track preview
  const playTrack = useCallback(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.audio_url
      audioRef.current.play().catch(() => {})
      setIsPlaying(true)
      setCurrentTime(0)
      setShowPurchasePrompt(false)
    }
  }, [currentTrack])
  
  // Handle time update from audio element
  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current && isPlaying) {
      const time = audioRef.current.currentTime
      setCurrentTime(Math.floor(time))
      
      // Crossfade in last 5 seconds
      const remainingTime = (audioRef.current.duration || 60) - time
      if (remainingTime <= 5 && remainingTime > 0) {
        setCrossfade(remainingTime / 5)
      } else {
        setCrossfade(1)
      }
      
      // Show purchase prompt at 60 seconds or end of track
      if (time >= 60) {
        // Show purchase prompt randomly
        if (Math.random() > 0.7) {
          setShowPurchasePrompt(true)
          setIsPlaying(false)
          audioRef.current.pause()
        } else {
          // Skip to next track
          skipTrack()
        }
      }
    }
  }, [isPlaying])

  // Handle audio ended
  const handleEnded = useCallback(() => {
    skipTrack()
  }, [])
  
  // Setup audio event listeners
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [handleTimeUpdate, handleEnded])
  
  // Auto-play next track when index changes
  useEffect(() => {
    if (isPlaying) {
      playTrack()
    }
  }, [currentIndex])
  
  // Start radio
  const startRadio = () => {
    playTrack()
  }
  
  // Pause radio
  const pauseRadio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
    setIsPlaying(false)
  }
  
  // Resume radio
  const resumeRadio = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {})
    }
    setIsPlaying(true)
  }
  
  // Skip to next track
  const skipTrack = () => {
    setCurrentIndex(i => (i + 1) % shuffledTracks.length)
    setShowPurchasePrompt(false)
  }
  
  // Handle audio end
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    
    const handleEnded = () => {
      skipTrack()
    }
    
    audio.addEventListener('ended', handleEnded)
    return () => audio.removeEventListener('ended', handleEnded)
  }, [])

  return (
    <div className="min-h-screen pt-20 pb-32">
      <audio ref={audioRef} />
      
      <div className="pf-container max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[var(--pf-orange)] to-purple-600 mb-4">
            <Radio size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Porterful Radio</h1>
          <p className="text-[var(--pf-text-secondary)]">
            Stream unlimited previews • 1-minute per track • Shuffle mode
          </p>
        </div>
        
        {/* Now Playing Card */}
        <div className="bg-gradient-to-br from-[var(--pf-surface)] to-[var(--pf-bg)] rounded-2xl overflow-hidden border border-[var(--pf-border)] mb-6">
          {/* Album Art */}
          <div className="relative aspect-square max-h-80 overflow-hidden bg-black">
            <img 
              src={currentTrack?.image || '/album-art/default.jpg'} 
              alt={currentTrack?.title || 'Now Playing'}
              className={`w-full h-full object-cover transition-opacity duration-1000 ${crossfade < 1 ? 'opacity-50' : 'opacity-100'}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            
            {/* Live Badge */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="flex items-center gap-1 px-3 py-1 bg-red-500 rounded-full text-white text-sm font-medium shadow-lg">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                LIVE
              </span>
              <span className="px-3 py-1 bg-black/70 backdrop-blur rounded-full text-white text-sm">
                {shuffledTracks.length} tracks
              </span>
            </div>
            
            {/* Track Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h2 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">{currentTrack?.title}</h2>
              <Link 
                href={`/artist/${currentTrack?.artist?.toLowerCase().replace(/\s+/g, '-') || 'unknown'}`}
                className="text-white/90 drop-shadow hover:text-[var(--pf-orange)] transition-colors"
              >
                {currentTrack?.artist}
              </Link>
              <span className="text-white/70"> • {currentTrack?.album}</span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="p-4 bg-[var(--pf-bg)]">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm text-[var(--pf-text-muted)]">{formatTime(currentTime)}</span>
              <div className="flex-1 h-2 bg-[var(--pf-surface)] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[var(--pf-orange)] to-purple-500 transition-all duration-1000"
                  style={{ width: `${(currentTime / PREVIEW_DURATION) * 100}%` }}
                />
              </div>
              <span className="text-sm text-[var(--pf-text-muted)]">1:00</span>
            </div>
            
            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              {isPlaying ? (
                <button 
                  onClick={pauseRadio}
                  className="w-16 h-16 rounded-full bg-[var(--pf-orange)] flex items-center justify-center hover:bg-[var(--pf-orange-dark)] transition-colors"
                >
                  <Pause size={28} className="text-white" />
                </button>
              ) : (
                <button 
                  onClick={isPlaying ? resumeRadio : startRadio}
                  className="w-16 h-16 rounded-full bg-[var(--pf-orange)] flex items-center justify-center hover:bg-[var(--pf-orange-dark)] transition-colors"
                >
                  <Play size={28} className="text-white ml-1" />
                </button>
              )}
              
              <button 
                onClick={skipTrack}
                className="w-12 h-12 rounded-full bg-[var(--pf-surface)] flex items-center justify-center hover:bg-[var(--pf-border)] transition-colors"
                title="Skip to next track"
              >
                <SkipForward size={20} className="text-[var(--pf-text)]" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Purchase Prompt (shows after some tracks) */}
        {showPurchasePrompt && (
          <div className="bg-gradient-to-br from-[var(--pf-orange)]/20 to-purple-600/20 rounded-2xl p-6 mb-6 border border-[var(--pf-orange)]/30">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Love this track?</h3>
              <p className="text-[var(--pf-text-secondary)] mb-4">
                Buy it for ${currentTrack?.price || 1} and own it forever.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link 
                  href="/digital"
                  className="pf-btn pf-btn-primary inline-flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={18} />
                  Buy This Track
                </Link>
                <button 
                  onClick={() => { setShowPurchasePrompt(false); startRadio(); }}
                  className="pf-btn pf-btn-secondary"
                >
                  Keep Listening
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Up Next */}
        <div className="bg-[var(--pf-surface)] rounded-xl p-4 mb-6 border border-[var(--pf-border)]">
          <h3 className="text-sm font-semibold text-[var(--pf-text-muted)] mb-3">UP NEXT</h3>
          <div className="flex items-center gap-3">
            <img 
              src={nextTrack?.image || '/album-art/default.jpg'} 
              alt={nextTrack?.title}
              className="w-12 h-12 rounded object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{nextTrack?.title}</p>
              <Link 
                href={`/artist/${nextTrack?.artist?.toLowerCase().replace(/\s+/g, '-') || 'unknown'}`}
                className="text-sm text-[var(--pf-text-muted)] hover:text-[var(--pf-orange)] transition-colors"
              >
                {nextTrack?.artist}
              </Link>
            </div>
            <span className="text-sm text-[var(--pf-text-muted)]">1 min</span>
          </div>
        </div>
        
        {/* How It Works */}
        <div className="bg-[var(--pf-surface)] rounded-xl p-6 border border-[var(--pf-border)]">
          <h3 className="text-lg font-bold mb-4">How Radio Works</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--pf-orange)]/10 flex items-center justify-center shrink-0">
                <Radio size={20} className="text-[var(--pf-orange)]" />
              </div>
              <div>
                <p className="font-medium">Shuffle Mode</p>
                <p className="text-sm text-[var(--pf-text-secondary)]">Tracks play in random order</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--pf-orange)]/10 flex items-center justify-center shrink-0">
                <span className="text-[var(--pf-orange)] font-bold">1:00</span>
              </div>
              <div>
                <p className="font-medium">1-Minute Previews</p>
                <p className="text-sm text-[var(--pf-text-secondary)]">Hear each track before buying</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--pf-orange)]/10 flex items-center justify-center shrink-0">
                <Heart size={20} className="text-[var(--pf-orange)]" />
              </div>
              <div>
                <p className="font-medium">Support Artists</p>
                <p className="text-sm text-[var(--pf-text-secondary)]">80% goes to the artist</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* CTA */}
        <div className="mt-8 text-center">
          <p className="text-[var(--pf-text-secondary)] mb-4">
            Want unlimited access? Buy tracks to own them forever.
          </p>
          <Link href="/digital" className="pf-btn pf-btn-primary inline-flex items-center gap-2">
            <ShoppingBag size={18} />
            Browse All Music
          </Link>
        </div>
      </div>
    </div>
  )
}