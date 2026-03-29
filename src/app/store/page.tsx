'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, Heart, Star, ArrowRight } from 'lucide-react'

// Platform-curated featured products
const FEATURED_PRODUCTS = [
  { id: 'book-tiigh', name: 'There It Is, Here It Go', price: 25, category: 'Book', artist: 'O D Porter', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500', featured: true },
  { id: 'odp-tee-classic-black', name: 'Porterful Classic Tee', price: 28, category: 'Apparel', artist: 'Various Artists', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', featured: true },
  { id: 'odp-hoodie-classic-black', name: 'Porterful Classic Hoodie', price: 55, category: 'Apparel', artist: 'Various Artists', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500', featured: false },
  { id: 'odp-mug-11oz-black', name: 'Porterful Mug', price: 18, category: 'Home', artist: 'Various Artists', image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500', featured: false },
  { id: 'odp-canvas-16x20', name: 'Porterful Canvas', price: 55, category: 'Art', artist: 'Various Artists', image: 'https://images.unsplash.com/photo-1549497538-303791108f95?w=500', featured: false },
  { id: 'odp-poster-18x24', name: 'Porterful Poster', price: 22, category: 'Art', artist: 'Various Artists', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500', featured: false },
]

// Featured artists
const FEATURED_ARTISTS = [
  { id: 'od-porter', name: 'O D Porter', specialty: 'Hip-Hop / R&B / Soul', location: 'St. Louis, MO', avatar: 'OD' },
  { id: 'jai-jai', name: 'Jai Jai', specialty: 'Hip-Hop', location: 'St. Louis, MO', avatar: 'JJ' },
]

export default function StorePage() {
  const [activeCategory, setActiveCategory] = useState('All')

  const categories = ['All', 'Apparel', 'Art', 'Books', 'Home']

  const filteredProducts = activeCategory === 'All'
    ? FEATURED_PRODUCTS
    : FEATURED_PRODUCTS.filter(p => p.category === activeCategory)

  return (
    <div className="min-h-screen pt-20 pb-24 bg-[var(--pf-bg)]">
      {/* Hero Banner */}
      <section className="relative py-16 bg-gradient-to-br from-[var(--pf-orange)]/10 via-purple-500/5 to-[var(--pf-bg)]">
        <div className="pf-container">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Porterful <span className="text-[var(--pf-orange)]">Store</span>
            </h1>
            <p className="text-lg text-[var(--pf-text-secondary)] mb-2">
              Curated merch and products from independent artists on the platform.
            </p>
            <p className="text-[var(--pf-text-muted)]">
              Every purchase supports artists directly — they keep 80%.
            </p>
          </div>
        </div>
      </section>

      <div className="pf-container py-8">
        {/* Featured Products Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <Link href="/marketplace" className="text-[var(--pf-orange)] hover:underline flex items-center gap-1 text-sm font-medium">
              Browse All <ArrowRight size={14} />
            </Link>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-[var(--pf-orange)] text-white'
                    : 'bg-[var(--pf-surface)] text-[var(--pf-text-secondary)] hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="group"
              >
                <div className="aspect-square rounded-xl bg-[var(--pf-surface)] border border-[var(--pf-border)] overflow-hidden mb-3 relative">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.featured && (
                    <div className="absolute top-3 left-3 bg-[var(--pf-orange)] text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                      <Star size={10} /> Featured
                    </div>
                  )}
                </div>
                <p className="text-xs text-[var(--pf-text-muted)] uppercase tracking-wider mb-1">
                  {product.category} • {product.artist}
                </p>
                <h3 className="font-semibold group-hover:text-[var(--pf-orange)] transition-colors line-clamp-1">
                  {product.name}
                </h3>
                <p className="font-bold text-[var(--pf-orange)] mt-1">${product.price}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Artists */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured Artists</h2>
            <Link href="/marketplace" className="text-[var(--pf-orange)] hover:underline flex items-center gap-1 text-sm font-medium">
              View All Artists <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {FEATURED_ARTISTS.map(artist => (
              <Link
                key={artist.id}
                href={`/artist/${artist.id}`}
                className="bg-gradient-to-r from-[var(--pf-orange)]/10 to-purple-500/10 rounded-2xl p-6 border border-[var(--pf-border)] hover:border-[var(--pf-orange)] transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--pf-orange)] to-purple-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
                    {artist.avatar}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold group-hover:text-[var(--pf-orange)] transition-colors">{artist.name}</h3>
                    <p className="text-sm text-[var(--pf-text-secondary)]">{artist.specialty}</p>
                    <p className="text-xs text-[var(--pf-text-muted)]">{artist.location}</p>
                  </div>
                  <div className="text-[var(--pf-text-muted)] group-hover:text-[var(--pf-orange)] transition-colors">
                    <ArrowRight size={20} />
                  </div>
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
                We handle printing, shipping, and customer service.
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <Link href="/signup?role=artist" className="pf-btn pf-btn-primary">
                  Start Selling Today
                </Link>
                <Link href="/artist/od-porter" className="pf-btn pf-btn-secondary">
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
