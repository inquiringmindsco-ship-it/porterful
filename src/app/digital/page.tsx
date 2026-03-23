'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAudio } from '@/lib/audio-context'
import { TRACKS, ALBUMS } from '@/lib/data'

// Custom Porterful Icons
const Icon = {
  Play: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  ),
  Pause: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  ),
  Search: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  ChevronLeft: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="15,18 9,12 15,6" />
    </svg>
  ),
  ChevronRight: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9,18 15,12 9,6" />
    </svg>
  ),
  Music: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  ),
  Disc: () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2a10 10 0 0 1 10 10" opacity="0.3" />
    </svg>
  ),
}

// EQ Visualizer Component
function EQVisualizer({ isPlaying }: { isPlaying: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const barsRef = useRef<number[]>(Array(32).fill(0))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const barCount = 32
      const barWidth = canvas.width / barCount - 2
      const centerY = canvas.height / 2

      for (let i = 0; i < barCount; i++) {
        // Simulate audio data with smooth randomness
        if (isPlaying) {
          const target = Math.random() * canvas.height * 0.4
          barsRef.current[i] += (target - barsRef.current[i]) * 0.3
        } else {
          barsRef.current[i] *= 0.95 // Decay when paused
        }
        
        const barHeight = barsRef.current[i]
        const x = i * (barWidth + 2)
        
        // Gradient from orange to purple
        const gradient = ctx.createLinearGradient(x, centerY - barHeight, x, centerY + barHeight)
        gradient.addColorStop(0, '#f97316')
        gradient.addColorStop(1, '#7c3aed')
        
        ctx.fillStyle = gradient
        ctx.fillRect(x, centerY - barHeight, barWidth, barHeight * 2)
      }
      
      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying])

  return (
    <canvas 
      ref={canvasRef} 
      width={300} 
      height={100} 
      className="w-full"
      style={{ maxWidth: '100%' }}
    />
  )
}

// Scrollable Carousel Component
function Carousel({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', checkScroll)
    checkScroll()
    return () => el.removeEventListener('scroll', checkScroll)
  }, [checkScroll])

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const scrollAmount = scrollRef.current.clientWidth * 0.8
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    })
  }

  return (
    <div className="relative">
      {canScrollLeft && (
        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/80 rounded-full flex items-center justify-center text-white hover:bg-black"
        >
          <Icon.ChevronLeft />
        </button>
      )}
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
      >
        {children}
      </div>
      {canScrollRight && (
        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/80 rounded-full flex items-center justify-center text-white hover:bg-black"
        >
          <Icon.ChevronRight />
        </button>
      )}
    </div>
  )
}

export default function MusicPage() {
  const { currentTrack, isPlaying, playTrack, setQueue } = useAudio()
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'artists' | 'albums' | 'songs'>('artists')

  // Filter tracks by search
  const filteredTracks = search 
    ? TRACKS.filter(t => 
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.artist.toLowerCase().includes(search.toLowerCase()) ||
        t.album?.toLowerCase().includes(search.toLowerCase())
      )
    : []

  // Get unique artists
  const artists = [...new Set(TRACKS.map(t => t.artist))]
  
  // Group albums
  const albums = Object.values(ALBUMS)

  // Play all tracks
  const playAll = () => {
    setQueue(TRACKS.map(t => ({
      ...t,
      duration: typeof t.duration === 'string' 
        ? t.duration.split(':').reduce((acc: number, part: string) => (60 * acc) + parseInt(part), 0)
        : t.duration || 180
    })))
    playTrack({
      ...TRACKS[0],
      duration: typeof TRACKS[0].duration === 'string'
        ? TRACKS[0].duration.split(':').reduce((acc: number, part: string) => (60 * acc) + parseInt(part), 0)
        : TRACKS[0].duration || 180
    } as any)
  }

  return (
    <div className="min-h-screen pt-20 pb-24 overflow-x-hidden">
      <div className="pf-container max-w-4xl">
        {/* Header with EQ Visualizer */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-[var(--pf-text)]">Music</h1>
              <p className="text-[var(--pf-text-secondary)]">{TRACKS.length} tracks • {albums.length} albums</p>
            </div>
            <button
              onClick={playAll}
              className="pf-btn pf-btn-primary flex items-center gap-2"
            >
              {isPlaying ? <Icon.Pause /> : <Icon.Play />}
              <span className="hidden sm:inline">Play All</span>
            </button>
          </div>
          
          {/* EQ Visualizer */}
          <div className="bg-[var(--pf-surface)] rounded-xl p-4 border border-[var(--pf-border)]">
            <EQVisualizer isPlaying={isPlaying} />
            {currentTrack && (
              <div className="mt-3 text-center">
                <p className="font-medium text-[var(--pf-text)]">{currentTrack.title}</p>
                <p className="text-sm text-[var(--pf-text-secondary)]">{currentTrack.artist}</p>
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search artists, albums, songs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 pl-10 rounded-xl border border-[var(--pf-border)] bg-[var(--pf-bg)] text-[var(--pf-text)] placeholder:text-[var(--pf-text-muted)] focus:border-[var(--pf-orange)] focus:outline-none"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--pf-text-muted)]">
              <Icon.Search />
            </div>
          </div>
        </div>

        {/* Search Results */}
        {search && (
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-3 text-[var(--pf-text)]">Results for "{search}"</h2>
            {filteredTracks.length === 0 ? (
              <p className="text-[var(--pf-text-secondary)]">No results found</p>
            ) : (
              <div className="space-y-2">
                {filteredTracks.slice(0, 10).map(track => (
                  <button
                    key={track.id}
                    onClick={() => playTrack({
                      ...track,
                      duration: typeof track.duration === 'string'
                        ? track.duration.split(':').reduce((acc: number, part: string) => (60 * acc) + parseInt(part), 0)
                        : track.duration || 180
                    } as any)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                      currentTrack?.id === track.id
                        ? 'bg-[var(--pf-orange)]/10 border border-[var(--pf-orange)]'
                        : 'bg-[var(--pf-surface)] border border-[var(--pf-border)] hover:border-[var(--pf-orange)]'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                      <img src={track.image} alt={track.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className={`font-medium truncate ${currentTrack?.id === track.id ? 'text-[var(--pf-orange)]' : 'text-[var(--pf-text)]'}`}>
                        {track.title}
                      </p>
                      <p className="text-sm text-[var(--pf-text-secondary)] truncate">
                        {track.artist} • {track.album}
                      </p>
                    </div>
                    <span className="text-sm text-[var(--pf-text-secondary)]">${track.price}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        {!search && (
          <>
            <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
              {['artists', 'albums', 'songs'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    activeTab === tab
                      ? 'bg-[var(--pf-orange)] text-white'
                      : 'bg-[var(--pf-surface)] text-[var(--pf-text-secondary)] hover:text-[var(--pf-text)]'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Artists Tab */}
            {activeTab === 'artists' && (
              <div className="mb-8">
                <h2 className="text-lg font-bold mb-4 text-[var(--pf-text)]">Artists</h2>
                <Carousel>
                  {artists.map(artist => (
                    <Link
                      key={artist}
                      href={`/artist/${artist.toLowerCase().replace(/\s+/g, '-')}`}
                      className="flex-shrink-0 w-40"
                    >
                      <div className="bg-[var(--pf-surface)] rounded-xl overflow-hidden border border-[var(--pf-border)] hover:border-[var(--pf-orange)] transition-colors">
                        <div className="aspect-square bg-gradient-to-br from-[var(--pf-orange)]/30 to-purple-600/30 flex items-center justify-center">
                          <span className="text-4xl font-bold text-white/80">
                            {artist.charAt(0)}
                          </span>
                        </div>
                        <div className="p-3">
                          <p className="font-medium text-[var(--pf-text)] truncate">{artist}</p>
                          <p className="text-xs text-[var(--pf-text-secondary)]">
                            {TRACKS.filter(t => t.artist === artist).length} tracks
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </Carousel>
              </div>
            )}

            {/* Albums Tab */}
            {activeTab === 'albums' && (
              <div className="mb-8">
                <h2 className="text-lg font-bold mb-4 text-[var(--pf-text)]">Albums</h2>
                <Carousel>
                  {albums.map(album => {
                    const albumTracks = TRACKS.filter(t => t.album === album.name)
                    return (
                      <div
                        key={album.id}
                        className="flex-shrink-0 w-44"
                      >
                        <div className="bg-[var(--pf-surface)] rounded-xl overflow-hidden border border-[var(--pf-border)] hover:border-[var(--pf-orange)] transition-colors cursor-pointer"
                          onClick={() => {
                            setQueue(albumTracks.map(t => ({
                              ...t,
                              duration: typeof t.duration === 'string'
                                ? t.duration.split(':').reduce((acc: number, part: string) => (60 * acc) + parseInt(part), 0)
                                : t.duration || 180
                            })))
                            playTrack({
                              ...albumTracks[0],
                              duration: typeof albumTracks[0].duration === 'string'
                                ? albumTracks[0].duration.split(':').reduce((acc: number, part: string) => (60 * acc) + parseInt(part), 0)
                                : albumTracks[0].duration || 180
                            } as any)
                          }}
                        >
                          <div className="aspect-square relative">
                            <img 
                              src={album.image} 
                              alt={album.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <div className="w-12 h-12 rounded-full bg-[var(--pf-orange)] flex items-center justify-center">
                                <Icon.Play />
                              </div>
                            </div>
                          </div>
                          <div className="p-3">
                            <p className="font-medium text-[var(--pf-text)] truncate">{album.name}</p>
                            <p className="text-xs text-[var(--pf-text-secondary)]">{albumTracks.length} tracks</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </Carousel>
              </div>
            )}

            {/* Songs Tab */}
            {activeTab === 'songs' && (
              <div className="mb-8">
                <h2 className="text-lg font-bold mb-4 text-[var(--pf-text)]">All Songs</h2>
                <div className="space-y-2">
                  {TRACKS.slice(0, 20).map(track => (
                    <button
                      key={track.id}
                      onClick={() => playTrack({
                        ...track,
                        duration: typeof track.duration === 'string'
                          ? track.duration.split(':').reduce((acc: number, part: string) => (60 * acc) + parseInt(part), 0)
                          : track.duration || 180
                      } as any)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                        currentTrack?.id === track.id
                          ? 'bg-[var(--pf-orange)]/10 border border-[var(--pf-orange)]'
                          : 'bg-[var(--pf-surface)] border border-[var(--pf-border)] hover:border-[var(--pf-orange)]'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                        <img src={track.image} alt={track.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className={`font-medium truncate ${currentTrack?.id === track.id ? 'text-[var(--pf-orange)]' : 'text-[var(--pf-text)]'}`}>
                          {track.title}
                        </p>
                        <p className="text-sm text-[var(--pf-text-secondary)] truncate">
                          {track.artist} • {track.album}
                        </p>
                      </div>
                      <span className="text-sm text-[var(--pf-text-secondary)]">${track.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}