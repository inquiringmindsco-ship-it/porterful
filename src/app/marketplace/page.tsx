'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, Heart, Share2, Filter } from 'lucide-react'

// Curated O D Porter merch products
const PRODUCTS = [
  { id: 'odp-tee-classic-black', name: 'O D Porter Classic Tee', price: 28, category: 'Apparel', image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/71/71/mockup_71.png', inStock: true },
  { id: 'odp-hoodie-classic-black', name: 'O D Porter Classic Hoodie', price: 55, category: 'Apparel', image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/156/156/mockup_156_black.png', inStock: true },
  { id: 'odp-snapback-black', name: 'O D Porter Snapback', price: 28, category: 'Accessories', image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/15/15/mockup_15.png', inStock: true },
  { id: 'odp-beanie-black', name: 'O D Porter Beanie', price: 24, category: 'Accessories', image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/31/31/mockup_31.png', inStock: true },
  { id: 'odp-mug-11oz-black', name: 'O D Porter Mug', price: 18, category: 'Home', image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/14/14/mockup_14.png', inStock: true },
  { id: 'odp-sticker-pack', name: 'O D Porter Sticker Pack', price: 15, category: 'Accessories', image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/86/86/mockup_86.png', inStock: true },
  { id: 'odp-poster-18x24', name: 'O D Porter Poster', price: 22, category: 'Art', image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/69/69/mockup_69.png', inStock: true },
  { id: 'odp-canvas-16x20', name: 'O D Porter Canvas', price: 55, category: 'Art', image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/101/101/mockup_101.png', inStock: true },
  { id: 'odp-book-tiigh', name: 'There It Is, Here It Go', price: 25, category: 'Books', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500', inStock: true },
  { id: 'odp-tote-black', name: 'O D Porter Tote Bag', price: 20, category: 'Accessories', image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/18/18/mockup_18.png', inStock: true },
  { id: 'odp-hoodie-zip-black', name: 'O D Porter Zip Hoodie', price: 62, category: 'Apparel', image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/179/179/mockup_179.png', inStock: true },
  { id: 'odp-tee-vintage-black', name: 'O D Porter Vintage Tee', price: 32, category: 'Apparel', image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/171/171/mockup_171.png', inStock: true },
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
            <span className="text-[var(--pf-orange)]">O D Porter</span> Store
          </h1>
          <p className="text-[var(--pf-text-secondary)]">
            Official merch from St. Louis artist O D Porter. Every purchase supports independent music.
          </p>
        </div>

        {/* Artist Banner */}
        <div className="bg-gradient-to-r from-[var(--pf-orange)]/10 to-purple-500/10 rounded-2xl p-6 mb-8 border border-[var(--pf-border)]">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[var(--pf-orange)] to-purple-600 flex items-center justify-center text-3xl font-bold text-white shrink-0">
              OD
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-bold mb-1">Support Independent Music</h2>
              <p className="text-[var(--pf-text-secondary)] text-sm">
                80% of every sale goes directly to O D Porter. Print-on-demand — no inventory waste.
              </p>
            </div>
            <Link href="/artist/od-porter" className="pf-btn pf-btn-secondary">
              View Artist Profile
            </Link>
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
            <Link href="/dashboard/upload?type=product" className="pf-btn pf-btn-primary whitespace-nowrap">
              Submit Design
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
