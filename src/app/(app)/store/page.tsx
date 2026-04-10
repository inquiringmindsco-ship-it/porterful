'use client'

import { useState, useCallback } from 'react'
import { useAudio } from '@/lib/audio-context'
import Link from 'next/link'
import Image from 'next/image'
import { Star, ArrowRight, Truck, Shield, RefreshCw, ShoppingBag, Music2, Users } from 'lucide-react'
import { FEATURED_PRODUCTS, type Product } from '@/lib/products'
import { ARTISTS } from '@/lib/artists'

// ─── Identity Builder ─────────────────────────────────────────────────────────

const METALS = [
  { id: 'silver', label: 'Sterling Silver', price: 45, hex: 'bg-gray-300' },
  { id: 'gold', label: '14K Gold Vermeil', price: 55, hex: 'bg-yellow-400' },
  { id: 'rosegold', label: 'Rose Gold', price: 50, hex: 'bg-pink-400' },
]

const LENGTHS = [
  { value: 16, label: '16"', desc: 'Choker' },
  { value: 18, label: '18"', desc: 'Standard' },
  { value: 20, label: '20"', desc: 'Loose' },
  { value: 22, label: '22"', desc: 'Extended' },
]

function IdentityBuilder() {
  const [name, setName] = useState('')
  const [metal, setMetal] = useState(METALS[0])
  const [length, setLength] = useState(18)
  const [loading, setLoading] = useState(false)

  const maxChars = 12
  const displayName = name.trim() || 'YOUR NAME'
  const price = metal.price

  const handleCheckout = useCallback(async () => {
    if (!name.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{
            id: `chain-${metal.id}-${length}`,
            name: `Custom Name Chain — ${displayName}`,
            price,
            type: 'physical',
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800',
            metal: metal.label,
            length,
          }],
        }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (err) {
      console.error('Checkout error:', err)
    } finally {
      setLoading(false)
    }
  }, [name, metal, length, displayName, price])

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      {/* Preview */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className={`text-4xl lg:text-6xl font-bold tracking-wider mb-8 transition-colors duration-300 ${
            metal.id === 'gold' ? 'text-yellow-400' :
            metal.id === 'rosegold' ? 'text-pink-400' :
            'text-[var(--pf-text-secondary)]'
          }`}>
            {displayName.toUpperCase()}
          </div>
          <div className="flex items-center justify-center gap-4">
            <div className={`w-28 h-0.5 rounded-full ${metal.hex}`} />
            <div className={`w-3 h-3 rounded-full ${metal.hex}`} />
            <div className={`w-28 h-0.5 rounded-full ${metal.hex}`} />
          </div>
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            metal.id === 'gold' ? 'bg-yellow-400/20 text-yellow-400' :
            metal.id === 'rosegold' ? 'bg-pink-400/20 text-pink-400' :
            'bg-gray-400/20 text-[var(--pf-text-secondary)]'
          }`}>
            {metal.label}
          </span>
          <span className="text-white/50 text-sm">{length}&quot; chain</span>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-[var(--pf-text-secondary)]">Your Name</label>
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, maxChars))}
              placeholder="Type any name..."
              className="w-full px-5 py-3.5 bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-xl text-lg font-medium focus:outline-none focus:border-yellow-400/60 transition-colors placeholder:text-[var(--pf-text-secondary)]"
              maxLength={maxChars}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--pf-text-secondary)]">
              {name.length}/{maxChars}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-[var(--pf-text-secondary)]">Metal</label>
          <div className="grid grid-cols-3 gap-2">
            {METALS.map((m) => (
              <button
                key={m.id}
                onClick={() => setMetal(m)}
                className={`p-3 rounded-xl border-2 transition-all text-center ${
                  metal.id === m.id
                    ? 'border-yellow-400/60 bg-yellow-400/5'
                    : 'border-[var(--pf-border)] hover:border-[var(--pf-text-secondary)]'
                }`}
              >
                <div className={`w-8 h-8 rounded-full ${m.hex} mx-auto mb-1.5 shadow-lg`} />
                <p className="text-xs font-medium">{m.label}</p>
                <p className="text-xs text-[var(--pf-text-secondary)]">${m.price}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-[var(--pf-text-secondary)]">Chain Length</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {LENGTHS.map((l) => (
              <button
                key={l.value}
                onClick={() => setLength(l.value)}
                className={`p-2.5 rounded-xl border-2 transition-all text-center ${
                  length === l.value
                    ? 'border-yellow-400/60 bg-yellow-400/5'
                    : 'border-[var(--pf-border)] hover:border-[var(--pf-text-secondary)]'
                }`}
              >
                <p className="font-medium text-sm">{l.label}</p>
                <p className="text-xs text-[var(--pf-text-secondary)]">{l.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[var(--pf-bg)] border border-[var(--pf-border)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[var(--pf-text-secondary)]">Custom Name Chain</span>
            <span className="font-bold text-lg">${price}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={!name.trim() || loading}
            className={`w-full py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm ${
              !name.trim() || loading
                ? 'bg-[var(--pf-surface)] text-[var(--pf-text-secondary)] cursor-not-allowed'
                : 'bg-yellow-500/90 hover:bg-yellow-400 text-black'
            }`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>Buy Chain — ${price} <ArrowRight size={16} /></>
            )}
          </button>
          <p className="text-xs text-center text-[var(--pf-text-secondary)] mt-2">Ships in 5–7 days · Free shipping</p>
        </div>
      </div>
    </div>
  )
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product }: { product: Product }) {
  const [loading, setLoading] = useState(false)

  const handleBuy = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{
            id: product.id,
            name: product.name,
            price: product.price,
            type: 'physical',
            quantity: 1,
            image: product.image,
          }],
        }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (err) {
      console.error('Checkout error:', err)
    } finally {
      setLoading(false)
    }
  }, [product])

  return (
    <div className="group rounded-2xl overflow-hidden bg-[var(--pf-surface)] border border-[var(--pf-border)] hover:border-[var(--pf-border-hover)] transition-all">
      <div className="relative aspect-square overflow-hidden">
        <Image src={product.image} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
      <div className="p-4">
        <p className="text-xs text-[var(--pf-text-secondary)] uppercase tracking-wider mb-1">{product.category}</p>
        <h3 className="font-bold text-base mb-1 leading-tight">{product.name}</h3>
        <p className="text-sm text-[var(--pf-text-secondary)] mb-4 line-clamp-2 leading-snug">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold">${product.price}</span>
          <button
            onClick={handleBuy}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-[var(--pf-bg)] border border-[var(--pf-border)] hover:border-yellow-400/50 text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            {loading ? (
              <div className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>Buy <ArrowRight size={14} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Store Page ─────────────────────────────────────────────────────────

export default function StorePage() {
  const { currentTrack, isPlaying, togglePlay } = useAudio()
  const [activeCategory, setActiveCategory] = useState('All')
  const categories = ['All', 'Apparel', 'Art', 'Books', 'Home', 'Tech', 'Merch']
  const filteredProducts = activeCategory === 'All'
    ? FEATURED_PRODUCTS
    : FEATURED_PRODUCTS.filter(p => p.category === activeCategory)
  const essentialsProducts = FEATURED_PRODUCTS.filter(p => p.category !== 'Book')

  return (
    <div className="min-h-screen pt-20 pb-24 bg-[var(--pf-bg)]">

      {/* Now Playing Banner */}
      {currentTrack && (
        <div className="bg-gradient-to-r from-[var(--pf-orange)]/10 to-purple-500/10 border-b border-[var(--pf-orange)]/20 py-2 px-4">
          <div className="pf-container">
            <div className="flex items-center justify-center gap-3 text-sm">
              <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-400 animate-pulse' : 'bg-[var(--pf-text-muted)]'}`} />
              <span className="text-[var(--pf-text-secondary)]">Now playing:</span>
              <span className="font-medium text-[var(--pf-orange)]">{currentTrack.title}</span>
              <span className="text-[var(--pf-text-muted)]">by {currentTrack.artist}</span>
              <button
                onClick={togglePlay}
                className="ml-2 px-3 py-1 rounded-full bg-[var(--pf-orange)] text-white text-xs font-semibold hover:bg-[var(--pf-orange-dark)] transition-colors"
              >
                {isPlaying ? 'Pause' : 'Resume'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Book Hero */}
      <section className="relative bg-gradient-to-r from-[var(--pf-orange)] to-purple-600 text-white py-12 px-6">
        <div className="pf-container">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <div className="w-32 h-44 rounded-lg bg-white/20 flex items-center justify-center text-center p-3 shadow-2xl">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">O D Porter</div>
                  <div className="text-sm font-black leading-tight">There It Is,<br/>Here It Go.</div>
                </div>
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider mb-3">New Release</div>
              <h1 className="text-3xl md:text-4xl font-black mb-3">"There It Is, Here It Go."</h1>
              <p className="text-white/90 text-sm md:text-base mb-4 max-w-xl">
                The memoir. Raw, honest, deeply personal. The story of an artist from St. Louis who refused to quit.
              </p>
              <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                <Link href="/product/book-tiigh" className="px-6 py-3 bg-white text-[var(--pf-orange)] font-black rounded-lg hover:bg-white/90 transition flex items-center gap-2">
                  Get the Book — $25 <ArrowRight size={16} />
                </Link>
                <span className="text-white/80 text-sm">Free shipping • Direct from O D</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Limited Drop Banner */}
      <div className="bg-[var(--pf-surface)] border-y border-[var(--pf-border)] py-3 px-4">
        <div className="pf-container text-center">
          <p className="text-xs md:text-sm text-[var(--pf-text-muted)]">
            <span className="text-[var(--pf-orange)] font-bold">Limited First Edition</span> — Books ship within 5 business days. Merch made fresh to order.
          </p>
        </div>
      </div>

      <div className="pf-container py-8">

        {/* Bundle Offer */}
        <section className="mb-12 bg-gradient-to-r from-[var(--pf-orange)]/10 to-purple-500/10 rounded-2xl p-6 border border-[var(--pf-border)]">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="text-5xl shrink-0">📦</div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-bold mb-1">Starter Bundle</h2>
              <p className="text-[var(--pf-text-muted)] text-sm mb-3">Book + Tee = $45 <span className="line-through">$53</span> — Save $8</p>
              <p className="text-[var(--pf-text-secondary)] text-sm">Get the memoir plus the Ambiguous tour tee. The full O D Porter experience.</p>
            </div>
            <Link href="/product/bundle-starter" className="px-6 py-3 bg-[var(--pf-orange)] text-white font-bold rounded-lg hover:bg-[var(--pf-orange)]/90 transition text-sm flex items-center gap-2">
              Get Bundle <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* Featured Products + Category Filter */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">All Products</h2>
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-[var(--pf-orange)] text-white'
                    : 'bg-[var(--pf-surface)] text-[var(--pf-text-secondary)] hover:text-white border border-[var(--pf-border)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Identity Builder */}
        <section className="mb-12 border-t border-[var(--pf-border)] pt-12">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-widest text-yellow-400/60 mb-2">Custom Piece</p>
            <h2 className="text-3xl lg:text-4xl font-bold mb-2">Your Name. In Metal.</h2>
            <p className="text-[var(--pf-text-secondary)] max-w-md mx-auto">
              Sterling silver, 14K gold vermeil, or rose gold. Handcrafted to order. Yours alone.
            </p>
          </div>
          <IdentityBuilder />
        </section>

        {/* Featured Artists */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured Artists</h2>
            <Link href="/artists" className="text-[var(--pf-orange)] hover:underline flex items-center gap-1 text-sm font-medium">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ARTISTS.map(artist => (
              <Link
                key={artist.id}
                href={`/artist/${artist.slug || artist.id}`}
                className="bg-gradient-to-r from-[var(--pf-orange)]/10 to-purple-500/10 rounded-2xl p-5 border border-[var(--pf-border)] hover:border-[var(--pf-orange)] transition-colors group"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[var(--pf-border)] group-hover:border-[var(--pf-orange)] mb-3">
                    <Image src={artist.image} alt={artist.name} width={64} height={64} className="object-cover w-full h-full" />
                  </div>
                  <h3 className="font-bold group-hover:text-[var(--pf-orange)] transition-colors">{artist.name}</h3>
                  <p className="text-xs text-[var(--pf-text-muted)] mt-1">{artist.genre}</p>
                  <p className="text-xs text-[var(--pf-text-muted)]">{artist.location}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Artist CTA */}
        <section className="bg-gradient-to-r from-purple-500/10 to-[var(--pf-orange)]/10 rounded-2xl p-8 border border-[var(--pf-border)]">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="text-5xl shrink-0">🎤</div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold mb-2">Open Your Own Store</h2>
              <p className="text-[var(--pf-text-secondary)] mb-4">
                Are you an artist? Sell your own merch with Porterful. You keep 80% of every sale.
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <Link href="/signup?role=artist" className="px-6 py-3 bg-[var(--pf-orange)] text-white font-bold rounded-lg hover:bg-[var(--pf-orange)]/90 transition">
                  Start Selling Today
                </Link>
                <Link href="/artist/od-porter" className="px-6 py-3 border border-[var(--pf-border)] text-[var(--pf-text-secondary)] rounded-lg hover:border-[var(--pf-orange)] hover:text-white transition">
                  See Example Store
                </Link>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
