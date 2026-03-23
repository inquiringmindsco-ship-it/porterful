'use client'

import { useState, useRef, useEffect } from 'react'
import { useAudio } from '@/lib/audio-context'
import { TRACKS, ALBUMS } from '@/lib/data'
import Link from 'next/link'

// Custom Porterful Icons
const Icon = {
  Play: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>,
  Pause: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>,
  Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  ChevronLeft: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15,18 9,12 15,6"/></svg>,
  ChevronRight: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9,18 15,12 9,6"/></svg>,
  X: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Plus: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Minus: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>,
}

// Buy Button with Quantity and Custom Amount
function BuyButton({ track }: { track: typeof TRACKS[0] }) {
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [tip, setTip] = useState(0)
  const [customTip, setCustomTip] = useState('')
  const [error, setError] = useState('')
  
  const handleBuy = async () => {
    setLoading(true)
    setError('')
    
    try {
      const totalTip = tip + (customTip ? parseFloat(customTip) || 0 : 0)
      const totalPrice = (track.price * quantity) + totalTip
      
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{
            productId: track.id,
            name: track.title,
            artist: track.artist,
            image: track.image,
            price: totalPrice,
            quantity: quantity,
            type: 'track'
          }]
        })
      })
      
      const data = await res.json()
      
      if (data.error) {
        setError(data.error)
        setLoading(false)
        return
      }
      
      if (data.url) {
        window.location.href = data.url
      } else {
        setError('Could not create checkout session. Please try again.')
        setLoading(false)
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }
  
  const totalTip = tip + (customTip ? parseFloat(customTip) || 0 : 0)
  const totalPrice = (track.price * quantity) + totalTip
  
  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-gradient-to-r from-[var(--pf-orange)] to-orange-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg"
      >
        Buy ${track.price}
      </button>
      
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-[var(--pf-bg)] rounded-2xl p-6 w-full max-w-md shadow-2xl border border-[var(--pf-border)]" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[var(--pf-text)]">Buy "{track.title}"</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-[var(--pf-surface)] rounded-lg transition-colors">
                <Icon.X />
              </button>
            </div>
            
            <p className="text-[var(--pf-text-secondary)] mb-4">by {track.artist}</p>
            
            {/* Track preview */}
            <div className="flex items-center gap-3 p-3 bg-[var(--pf-surface)] rounded-xl mb-4">
              <img src={track.image} alt={track.title} className="w-16 h-16 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="font-medium text-[var(--pf-text)]">{track.title}</p>
                <p className="text-sm text-[var(--pf-text-secondary)]">{track.artist}</p>
                {track.album && <p className="text-xs text-[var(--pf-text-muted)]">{track.album}</p>}
              </div>
            </div>
            
            {/* Quantity Selector */}
            <div className="mb-4">
              <p className="text-sm text-[var(--pf-text-secondary)] mb-2">Quantity</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] flex items-center justify-center hover:border-[var(--pf-orange)] transition-colors"
                  disabled={quantity <= 1}
                >
                  <Icon.Minus />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 h-10 text-center rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] text-[var(--pf-text)] font-medium"
                  min="1"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] flex items-center justify-center hover:border-[var(--pf-orange)] transition-colors"
                >
                  <Icon.Plus />
                </button>
              </div>
            </div>
            
            {/* Tip Options */}
            <div className="mb-4">
              <p className="text-sm text-[var(--pf-text-secondary)] mb-2">Add a tip (supports the artist)</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {[0, 1, 2, 5, 10].map(amount => (
                  <button
                    key={amount}
                    onClick={() => { setTip(amount); setCustomTip(''); }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      tip === amount && !customTip
                        ? 'bg-[var(--pf-orange)] text-white'
                        : 'bg-[var(--pf-surface)] text-[var(--pf-text-secondary)] border border-[var(--pf-border)] hover:border-[var(--pf-orange)]'
                    }`}
                  >
                    {amount === 0 ? 'No tip' : `+$${amount}`}
                  </button>
                ))}
              </div>
              {/* Custom tip input */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--pf-text-secondary)]">Custom:</span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--pf-text-muted)]">$</span>
                  <input
                    type="number"
                    value={customTip}
                    onChange={(e) => { setCustomTip(e.target.value); setTip(0); }}
                    placeholder="0"
                    className="w-24 h-10 pl-7 pr-3 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] text-[var(--pf-text)] focus:border-[var(--pf-orange)] focus:outline-none"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
            
            {/* Total Breakdown */}
            <div className="bg-[var(--pf-surface)] rounded-xl p-4 mb-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[var(--pf-text-secondary)]">{track.title} × {quantity}</span>
                <span className="text-[var(--pf-text)]">${(track.price * quantity).toFixed(2)}</span>
              </div>
              {totalTip > 0 && (
                <div className="flex justify-between items-center mt-2 text-sm">
                  <span className="text-[var(--pf-text-secondary)]">Tip</span>
                  <span className="text-green-400">+${totalTip.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-[var(--pf-border)]">
                <span className="font-medium text-[var(--pf-text)]">Total</span>
                <span className="font-bold text-xl text-[var(--pf-orange)]">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
            
            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}
            
            {/* Buy button */}
            <button
              onClick={handleBuy}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[var(--pf-orange)] to-orange-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Processing...
                </span>
              ) : (
                `Pay $${totalPrice.toFixed(2)}`
              )}
            </button>
            
            {/* One-time payment message */}
            <div className="mt-4 text-center">
              <p className="text-xs text-[var(--pf-text-muted)] mb-1">
                One-time payment. No subscription.
              </p>
              <p className="text-xs text-[var(--pf-text-muted)]">
                You'll receive a download link after purchase.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Carousel Component
function Carousel({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', checkScroll)
    checkScroll()
    return () => el.removeEventListener('scroll', checkScroll)
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const scrollAmount = scrollRef.current.clientWidth * 0.8
    scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      {canScrollLeft && (
        <button onClick={() => scroll('left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/80 rounded-full flex items-center justify-center text-white hover:bg-black">
          <Icon.ChevronLeft />
        </button>
      )}
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth" style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
        {children}
      </div>
      {canScrollRight && (
        <button onClick={() => scroll('right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/80 rounded-full flex items-center justify-center text-white hover:bg-black">
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

  const filteredTracks = search 
    ? TRACKS.filter(t => 
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.artist.toLowerCase().includes(search.toLowerCase()) ||
        t.album?.toLowerCase().includes(search.toLowerCase())
      )
    : []

  const artists = Array.from(new Set(TRACKS.map(t => t.artist)))
  const albums = Object.values(ALBUMS)

  const playAll = () => {
    setQueue(TRACKS.map(t => ({
      ...t,
      duration: typeof t.duration === 'string' ? t.duration.split(':').reduce((acc: number, part: string) => (60 * acc) + parseInt(part), 0) : t.duration || 180
    })))
    playTrack({
      ...TRACKS[0],
      duration: typeof TRACKS[0].duration === 'string' ? TRACKS[0].duration.split(':').reduce((acc: number, part: string) => (60 * acc) + parseInt(part), 0) : TRACKS[0].duration || 180
    } as any)
  }

  return (
    <div className="min-h-screen pt-20 pb-24 overflow-x-hidden">
      <div className="pf-container max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-[var(--pf-text)]">Music</h1>
              <p className="text-[var(--pf-text-secondary)]">{TRACKS.length} tracks • {albums.length} albums</p>
            </div>
            <button onClick={playAll} className="pf-btn pf-btn-primary flex items-center gap-2">
              {isPlaying ? <Icon.Pause /> : <Icon.Play />}
              <span className="hidden sm:inline">Play All</span>
            </button>
          </div>
          
          {/* Now Playing */}
          {currentTrack && (
            <div className="bg-gradient-to-br from-[var(--pf-orange)]/10 to-purple-600/10 rounded-xl p-4 mb-4 border border-[var(--pf-orange)]/20">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                  <img src={currentTrack.image} alt={currentTrack.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--pf-text)] truncate">{currentTrack.title}</p>
                  <p className="text-sm text-[var(--pf-text-secondary)]">{currentTrack.artist}</p>
                  {currentTrack.album && <p className="text-xs text-[var(--pf-text-muted)]">{currentTrack.album}</p>}
                </div>
                <BuyButton track={currentTrack as any} />
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
                {filteredTracks.slice(0, 20).map(track => (
                  <div
                    key={track.id}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                      currentTrack?.id === track.id
                        ? 'bg-[var(--pf-orange)]/10 border border-[var(--pf-orange)]'
                        : 'bg-[var(--pf-surface)] border border-[var(--pf-border)] hover:border-[var(--pf-orange)]'
                    }`}
                    onClick={() => playTrack({
                      ...track,
                      duration: typeof track.duration === 'string' ? track.duration.split(':').reduce((acc: number, part: string) => (60 * acc) + parseInt(part), 0) : track.duration || 180
                    } as any)}
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                      <img src={track.image} alt={track.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${currentTrack?.id === track.id ? 'text-[var(--pf-orange)]' : 'text-[var(--pf-text)]'}`}>
                        {track.title}
                      </p>
                      <p className="text-sm text-[var(--pf-text-secondary)] truncate">{track.artist} • {track.album}</p>
                    </div>
                    <BuyButton track={track} />
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
                    <Link key={artist} href={`/artist/${artist.toLowerCase().replace(/\s+/g, '-')}`} className="flex-shrink-0 w-40">
                      <div className="bg-[var(--pf-surface)] rounded-xl overflow-hidden border border-[var(--pf-border)] hover:border-[var(--pf-orange)] transition-colors">
                        <div className="aspect-square bg-gradient-to-br from-[var(--pf-orange)]/30 to-purple-600/30 flex items-center justify-center">
                          <span className="text-4xl font-bold text-white/80">{artist.charAt(0)}</span>
                        </div>
                        <div className="p-3">
                          <p className="font-medium text-[var(--pf-text)] truncate">{artist}</p>
                          <p className="text-xs text-[var(--pf-text-secondary)]">{TRACKS.filter(t => t.artist === artist).length} tracks</p>
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
                      <div key={album.id} className="flex-shrink-0 w-44">
                        <div className="bg-[var(--pf-surface)] rounded-xl overflow-hidden border border-[var(--pf-border)] hover:border-[var(--pf-orange)] transition-colors cursor-pointer"
                          onClick={() => {
                            setQueue(albumTracks.map(t => ({
                              ...t,
                              duration: typeof t.duration === 'string' ? t.duration.split(':').reduce((acc: number, part: string) => (60 * acc) + parseInt(part), 0) : t.duration || 180
                            })))
                            playTrack({
                              ...albumTracks[0],
                              duration: typeof albumTracks[0].duration === 'string' ? albumTracks[0].duration.split(':').reduce((acc: number, part: string) => (60 * acc) + parseInt(part), 0) : albumTracks[0].duration || 180
                            } as any)
                          }}
                        >
                          <div className="aspect-square relative">
                            <img src={album.image} alt={album.name} className="w-full h-full object-cover" />
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
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                        currentTrack?.id === track.id
                          ? 'bg-[var(--pf-orange)]/10 border border-[var(--pf-orange)]'
                          : 'bg-[var(--pf-surface)] border border-[var(--pf-border)] hover:border-[var(--pf-orange)]'
                      }`}
                      onClick={() => playTrack({
                        ...track,
                        duration: typeof track.duration === 'string' ? track.duration.split(':').reduce((acc: number, part: string) => (60 * acc) + parseInt(part), 0) : track.duration || 180
                      } as any)}
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                        <img src={track.image} alt={track.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${currentTrack?.id === track.id ? 'text-[var(--pf-orange)]' : 'text-[var(--pf-text)]'}`}>
                          {track.title}
                        </p>
                        <p className="text-sm text-[var(--pf-text-secondary)] truncate">{track.artist} • {track.album}</p>
                      </div>
                      <BuyButton track={track} />
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