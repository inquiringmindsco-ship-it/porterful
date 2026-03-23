'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAudio } from '@/lib/audio-context'
import { TRACKS, ALBUMS } from '@/lib/data'
import Link from 'next/link'
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  List, Heart, Share2, Clock, Disc3, ChevronDown, ChevronUp,
  Maximize2, X
} from 'lucide-react'

// Sample supporters for the wall
const SAMPLE_SUPPORTERS = [
  { name: 'Mike J.', handle: '@mikej_music', date: '2024-03-20', amount: 25 },
  { name: 'Sarah T.', handle: '@saraht_beats', date: '2024-03-20', amount: 50 },
  { name: 'Marcus L.', handle: '@marcuslouis', date: '2024-03-19', amount: 10 },
  { name: 'Jenny K.', handle: '@jennyk_prod', date: '2024-03-19', amount: 100 },
  { name: 'David R.', handle: '@davidraphael', date: '2024-03-18', amount: 15 },
  { name: 'Amber W.', handle: '@amberwave', date: '2024-03-18', amount: 30 },
  { name: 'Chris M.', handle: '@chrism_audio', date: '2024-03-17', amount: 20 },
  { name: 'Taylor N.', handle: '@taylorn_beats', date: '2024-03-17', amount: 45 },
  { name: 'Jordan P.', handle: '@jordanp_music', date: '2024-03-16', amount: 60 },
  { name: 'Alicia B.', handle: '@aliciab_sings', date: '2024-03-16', amount: 35 },
]

export default function RadioPage() {
  const { currentTrack, isPlaying, playTrack, togglePlay, setQueue } = useAudio()
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null)
  const [showQueue, setShowQueue] = useState(false)
  const [isVisualizerOpen, setIsVisualizerOpen] = useState(false)

  // Group tracks by album
  const albums = TRACKS.reduce((acc, track) => {
    const album = track.album || 'Singles'
    if (!acc[album]) acc[album] = []
    acc[album].push(track)
    return acc
  }, {} as Record<string, typeof TRACKS>)

  const albumOrder = ['Singles', 'Ambiguous', 'Roxannity', 'One Day', 'From Feast to Famine', 'God Is Good']

  const playAlbum = (albumName: string) => {
    const tracks = albums[albumName] || []
    if (tracks.length > 0) {
      setQueue(tracks.map(t => ({
        ...t,
        duration: typeof t.duration === 'string' 
          ? t.duration.split(':').reduce((acc: number, part: string) => (60 * acc) + parseInt(part), 0)
          : t.duration || 180
      })))
      playTrack({
        ...tracks[0],
        duration: typeof tracks[0].duration === 'string' 
          ? tracks[0].duration.split(':').reduce((acc: number, part: string) => (60 * acc) + parseInt(part), 0)
          : tracks[0].duration || 180
      } as any)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen pt-20 pb-32">
      <div className="pf-container max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Disc3 size={32} className="text-[var(--pf-orange)]" />
              Radio
            </h1>
            <p className="text-[var(--pf-text-secondary)]">Stream all tracks • Support artists</p>
          </div>
          <button
            onClick={() => setIsVisualizerOpen(true)}
            className="pf-btn pf-btn-secondary flex items-center gap-2"
          >
            <Maximize2 size={18} />
            Visualizer
          </button>
        </div>

        {/* Now Playing */}
        {currentTrack && (
          <div className="bg-gradient-to-br from-[var(--pf-orange)]/20 to-purple-600/20 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-[var(--pf-surface)] shrink-0">
                <img 
                  src={currentTrack.image || '/album-art/default.jpg'} 
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold truncate">{currentTrack.title}</h2>
                <p className="text-[var(--pf-text-secondary)]">{currentTrack.artist}</p>
                {currentTrack.album && (
                  <p className="text-sm text-[var(--pf-text-muted)]">{currentTrack.album}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => togglePlay()}
                  className="w-14 h-14 rounded-full bg-[var(--pf-orange)] flex items-center justify-center hover:bg-[var(--pf-orange)]/80 transition-colors"
                >
                  {isPlaying ? <Pause size={24} className="text-white" /> : <Play size={24} className="text-white ml-1" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Albums Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {albumOrder.map(albumName => {
            const tracks = albums[albumName]
            if (!tracks || tracks.length === 0) return null
            
            const isExpanded = selectedAlbum === albumName
            
            return (
              <div key={albumName} className="bg-[var(--pf-surface)] rounded-xl overflow-hidden">
                <button
                  onClick={() => setSelectedAlbum(isExpanded ? null : albumName)}
                  className="w-full p-4 flex items-center gap-4 hover:bg-[var(--pf-bg)] transition-colors"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-[var(--pf-orange)]/30 to-purple-600/30 flex items-center justify-center shrink-0">
                    <Disc3 size={24} className="text-white" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <h3 className="font-bold truncate">{albumName}</h3>
                    <p className="text-sm text-[var(--pf-text-muted)]">{tracks.length} tracks</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); playAlbum(albumName) }}
                    className="w-10 h-10 rounded-full bg-[var(--pf-orange)] flex items-center justify-center hover:bg-[var(--pf-orange)]/80 shrink-0"
                  >
                    <Play size={18} className="text-white ml-0.5" />
                  </button>
                  <div className="text-[var(--pf-text-muted)]">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </button>
                
                {isExpanded && (
                  <div className="border-t border-[var(--pf-border)] max-h-64 overflow-y-auto">
                    {tracks.map((track, i) => (
                      <button
                        key={track.id}
                        onClick={() => playTrack({
                          ...track,
                          duration: typeof track.duration === 'string' 
                            ? track.duration.split(':').reduce((acc: number, part: string) => (60 * acc) + parseInt(part), 0)
                            : track.duration || 180
                        } as any)}
                        className={`w-full p-3 flex items-center gap-3 hover:bg-[var(--pf-bg)] transition-colors ${
                          currentTrack?.id === track.id ? 'bg-[var(--pf-orange)]/10' : ''
                        }`}
                      >
                        <span className="w-6 text-center text-[var(--pf-text-muted)] text-sm">{i + 1}</span>
                        <div className="flex-1 text-left min-w-0">
                          <p className={`truncate ${currentTrack?.id === track.id ? 'text-[var(--pf-orange)] font-medium' : ''}`}>
                            {track.title}
                          </p>
                          <p className="text-xs text-[var(--pf-text-muted)]">{track.duration}</p>
                        </div>
                        <span className="text-sm font-medium">${track.price}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Full-screen Visualizer */}
      {isVisualizerOpen && currentTrack && (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col">
          {/* Track Info */}
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
                onClick={() => setIsVisualizerOpen(false)}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20"
              >
                <X size={24} className="text-white" />
              </button>
            </div>
          </div>

          {/* Visualizer Area */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-white/20">
              <Disc3 size={200} className="animate-spin mx-auto mb-4" style={{ animationDuration: '3s' }} />
              <p className="text-xl">Visualizer</p>
              <p className="text-sm mt-2">Playing: {currentTrack.title}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="p-6 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => togglePlay()}
                className="w-16 h-16 rounded-full bg-[var(--pf-orange)] flex items-center justify-center"
              >
                {isPlaying ? <Pause size={28} className="text-white" /> : <Play size={28} className="text-white ml-1" />}
              </button>
            </div>
            <p className="text-center text-white/40 text-sm mt-4">
              Tap X to close • Artwork & track info on lock screen
            </p>
          </div>
        </div>
      )}
    </div>
  )
}