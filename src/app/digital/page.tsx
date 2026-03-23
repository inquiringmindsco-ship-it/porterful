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
  Heart: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  ),
  DollarSign: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  ),
  ShoppingCart: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
    </svg>
  ),
  Plus: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  X: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
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

// Buy Button Component
function BuyButton({ track, onBuy }: { track: typeof TRACKS[0], onBuy: (track: typeof TRACKS[0], tip: number) => void }) {
  const [showTip, setShowTip] = useState(false)
  const [tip, setTip] = useState(0)
  
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setShowTip(true)}
        className="px-3 py-1.5 bg-[var(--pf-orange)] text-white rounded-lg text-sm font-medium hover:bg-[var(--pf-orange)]/80 transition-colors flex items-center gap-1"
      >
        <Icon.DollarSign />
        ${track.price}
      </button>
      <button
        onClick={() => setShowTip(true)}
        className="p-1.5 rounded-lg text-[var(--pf-text-secondary)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
        title="Tip artist"
      >
        <Icon.Heart />
      </button>
      
      {showTip && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--pf-bg)] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[var(--pf-text)]">Support {track.artist}</h3>
              <button onClick={() => setShowTip(false)} className="p-2 hover:bg-[var(--pf-surface)] rounded-lg">
                <Icon.X />
              </button>
            </div>
            
            <p className="text-[var(--pf-text-secondary)] mb-4">{track.title}</p>
            
            <div className="mb-4">
              <p className="text-sm text-[var(--pf-text-secondary)] mb-2">Add a tip (optional)</p>
              <div className="flex gap-2">
                {[0, 1, 2, 5, 10].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setTip(amount)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      tip === amount
                        ? 'bg-[var(--pf-orange)] text-white'
                        : 'bg-[var(--pf-surface)] text-[var(--pf-text-secondary)] hover:border-[var(--pf-orange)] border border-[var(--pf-border)]'
                    }`}
                  >
                    {amount === 0 ? 'No tip' : `+$${amount}`}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="bg-[var(--pf-surface)] rounded-xl p-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-[var(--pf-text-secondary)]">Track price</span>
                <span className="font-bold text-[var(--pf-text)]">${track.price}.00</span>
              </div>
              {tip > 0 && (
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[var(--pf-text-secondary)]">Tip</span>
                  <span className="font-bold text-green-400">+${tip}.00</span>
                </div>
              )}
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-[var(--pf-border)]">
                <span className="font-medium text-[var(--pf-text)]">Total</span>
                <span className="font-bold text-xl text-[var(--pf-orange)]">${track.price + tip}.00</span>
              </div>
            </div>
            
            <button
              onClick={() => {
                onBuy(track, tip)
                setShowTip(false)
              }}
              className="w-full py-3 bg-[var(--pf-orange)] text-white rounded-xl font-medium hover:bg-[var(--pf-orange-dark)] transition-colors"
            >
              Buy Now — One-Time Payment
            </button>
            
            <p className="text-center text-xs text-[var(--pf-text-muted)] mt-3">
              One-time payment. No subscription. You own it forever.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function MusicPage() {
  const { currentTrack, isPlaying, playTrack, pause, setQueue } = useAudio()
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'artists' | 'albums' | 'songs'>('artists')
  const [previewEnded, setPreviewEnded] = useState(false)
  const [showSupportPrompt, setShowSupportPrompt] = useState(false)
  const previewTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Filter tracks by search
  const filteredTracks = search 
    ? TRACKS.filter(t => 
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.artist.toLowerCase().includes(search.toLowerCase()) ||
        t.album?.toLowerCase().includes(search.toLowerCase())
      )
    : []

  // Get unique artists
  const artists = Array.from(new Set(TRACKS.map(t => t.artist)))
  
  // Group albums
  const albums = Object.values(ALBUMS)

  // Play track with preview
  const handlePlayTrack = (track: typeof TRACKS[0]) => {
    setPreviewEnded(false)
    setShowSupportPrompt(false)
    
    playTrack({
      ...track,
      duration: typeof track.duration === 'string'
        ? track.duration.split(':').reduce((acc: number, part: string) => (60 * acc) + parseInt(part), 0)
        : track.duration || 180
    } as any)
  }

  // Handle buy
  const handleBuy = (track: typeof TRACKS[0], tip: number) => {
    // TODO: Integrate with cart/checkout
    console.log('Buying track:', track.title, 'with tip:', tip)
    // For now, redirect to checkout with track
    window.location.href = `/checkout?track=${track.id}&tip=${tip}`
  }

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
        {/* Header */}
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
          
          {/* Now Playing - Simple */}
          {currentTrack && (
            <div className="bg-[var(--pf-surface)] rounded-xl p-4 border border-[var(--pf-border)]">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                  <img 
                    src={currentTrack.image || '/album-art/default.jpg'} 
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${isPlaying ? 'text-[var(--pf-orange)]' : 'text-[var(--pf-text)]'}`}>
                    {currentTrack.title}
                  </p>
                  <p className="text-sm text-[var(--pf-text-secondary)]">{currentTrack.artist}</p>
                  <p className="text-xs text-[var(--pf-text-muted)]">{currentTrack.album}</p>
                </div>
                <div className="flex items-center gap-3">
                  <BuyButton track={currentTrack as any} onBuy={handleBuy} />
                </div>
              </div>
            </div>
          )}
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
                  <div
                    key={track.id}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer ${
                      currentTrack?.id === track.id
                        ? 'bg-[var(--pf-orange)]/10 border border-[var(--pf-orange)]'
                        : 'bg-[var(--pf-surface)] border border-[var(--pf-border)] hover:border-[var(--pf-orange)]'
                    }`}
                    onClick={() => handlePlayTrack(track)}
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
                    <BuyButton track={track} onBuy={handleBuy} />
                  </div>
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
                          onClick={() => handlePlayTrack(albumTracks[0])}
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
                  {TRACKS.slice(0, 50).map(track => (
                    <div
                      key={track.id}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer ${
                        currentTrack?.id === track.id
                          ? 'bg-[var(--pf-orange)]/10 border border-[var(--pf-orange)]'
                          : 'bg-[var(--pf-surface)] border border-[var(--pf-border)] hover:border-[var(--pf-orange)]'
                      }`}
                      onClick={() => handlePlayTrack(track)}
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
                      <BuyButton track={track} onBuy={handleBuy} />
                    </div>
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