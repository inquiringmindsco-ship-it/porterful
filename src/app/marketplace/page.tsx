'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, Filter } from 'lucide-react'

// Platform-curated featured products
const PRODUCTS = [
  { id: 'odp-tee-classic-black', name: 'Porterful Classic Tee', price: 28, category: 'Apparel', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', inStock: true },
  { id: 'odp-hoodie-classic-black', name: 'Porterful Classic Hoodie', price: 55, category: 'Apparel', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500', inStock: true },
  { id: 'odp-snapback-black', name: 'Porterful Snapback', price: 28, category: 'Accessories', image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500', inStock: true },
  { id: 'odp-beanie-black', name: 'Porterful Beanie', price: 24, category: 'Accessories', image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=500', inStock: true },
  { id: 'odp-mug-11oz-black', name: 'Porterful Mug', price: 18, category: 'Home', image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500', inStock: true },
  { id: 'odp-sticker-pack', name: 'Porterful Sticker Pack', price: 15, category: 'Accessories', image: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=500', inStock: true },
  { id: 'odp-poster-18x24', name: 'Porterful Poster', price: 22, category: 'Art', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500', inStock: true },
  { id: 'odp-canvas-16x20', name: 'Porterful Canvas', price: 55, category: 'Art', image: 'https://images.unsplash.com/photo-1549497538-303791108f95?w=500', inStock: true },
  { id: 'odp-book-tiigh', name: 'There It Is, Here It Go', price: 25, category: 'Books', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500', inStock: true },
  { id: 'odp-tote-black', name: 'Porterful Tote Bag', price: 20, category: 'Accessories', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', inStock: true },
  { id: 'odp-hoodie-zip-black', name: 'Porterful Zip Hoodie', price: 62, category: 'Apparel', image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500', inStock: true },
  { id: 'odp-tee-vintage-black', name: 'Porterful Vintage Tee', price: 32, category: 'Apparel', image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500', inStock: true },
]

// Featured artists on the platform
const FEATURED_ARTISTS = [
  { id: 'od-porter', name: 'O D Porter', location: 'St. Louis, MO', specialty: 'Hip-Hop / R&B', avatar: 'OD' },
  { id: 'jai-jai', name: 'Jai Jai', location: 'St. Louis, MO', specialty: 'Hip-Hop', avatar: 'JJ' },
]

const CATEGORIES = ['All', 'Apparel', 'Accessories', 'Home', 'Art', 'Books']

export default function MarketplacePage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [sortBy, setSortBy] = useState('featured')

  const filteredProducts = activeCategory === 'All' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === activeCategory)

  return (
    <div className="min-h-screen pt-20 pb-24 bg-[var(--pf-bg)]">
      <div className="pf-container max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-[var(--pf-orange)]">Porterful</span> Marketplace
          </h1>
          <p className="text-[var(--pf-text-secondary)]">
            Discover music and merch from independent artists. 80% of every sale goes directly to creators.
          </p>
        </div>

        {/* Featured Artists Sidebar */}
        <div className="bg-gradient-to-r from-[var(--pf-orange)]/10 to-purple-500/10 rounded-2xl p-6 mb-8 border border-[var(--pf-border)]">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="shrink-0">
              <h2 className="text-lg font-bold mb-3">Featured Artists</h2>
              <div className="flex gap-3">
                {FEATURED_ARTISTS.map(artist => (
                  <Link 
                    key={artist.id}
                    href={`/artist/${artist.id}`}
                    className="flex items-center gap-3 bg-[var(--pf-bg)] rounded-xl p-3 hover:bg-[var(--pf-surface)] transition-colors border border-transparent hover:border-[var(--pf-border)]"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--pf-orange)] to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                      {artist.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{artist.name}</p>
                      <p className="text-xs text-[var(--pf-text-muted)]">{artist.specialty}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex-1 text-center md:text-left border-t md:border-t-0 md:border-l border-[var(--pf-border)] md:pl-6 md:ml-6 pt-4 md:pt-0">
              <h2 className="text-lg font-bold mb-1">Open Your Own Store</h2>
              <p className="text-[var(--pf-text-secondary)] text-sm mb-3">
                Are you an artist? Start selling your own merch with 80% earnings. Print-on-demand — no inventory needed.
              </p>
              <Link href="/signup?role=artist" className="pf-btn pf-btn-primary whitespace-nowrap">
                Start Selling
              </Link>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
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

          {/* Sort */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-[var(--pf-text-muted)]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-lg px-3 py-2 text-sm text-[var(--pf-text)] focus:outline-none focus:border-[var(--pf-orange)]"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
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
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-[var(--pf-text)] text-[var(--pf-bg)] px-3 py-1 rounded text-sm font-medium">
                      Sold Out
                    </span>
                  </div>
                )}
              </div>
              <h3 className="font-medium text-sm mb-1 group-hover:text-[var(--pf-orange)] transition-colors line-clamp-1">
                {product.name}
              </h3>
              <p className="text-[var(--pf-text-muted)] text-xs mb-2">{product.category}</p>
              <p className="font-bold">${product.price}</p>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <ShoppingBag size={48} className="mx-auto text-[var(--pf-text-muted)] mb-4" />
            <p className="text-[var(--pf-text-secondary)]">No products in this category yet.</p>
          </div>
        )}

        {/* Artist CTA */}
        <div className="bg-[var(--pf-surface)] rounded-2xl p-6 border border-[var(--pf-border)]">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="text-4xl">🎨</div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-bold mb-1">Are you an artist?</h3>
              <p className="text-[var(--pf-text-secondary)] text-sm">
                Submit your own designs for print-on-demand merch. No inventory needed — we handle printing and shipping.
              </p>
            </div>
            <Link href="/signup?role=artist" className="pf-btn pf-btn-primary whitespace-nowrap">
              Open Your Store
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-[var(--pf-text-muted)]">
            Secure checkout powered by Porterful
          </p>
          <p className="text-xs text-[var(--pf-text-muted)] mt-1">
            Questions? Contact support@porterful.com
          </p>
        </div>
      </div>
    </div>
  )
}
