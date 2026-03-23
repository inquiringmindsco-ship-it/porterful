'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// Custom Porterful Icons
const Icon = {
  Search: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  ShoppingCart: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
    </svg>
  ),
  Filter: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />
    </svg>
  ),
  Grid: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  List: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
  Star: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </svg>
  ),
  ChevronDown: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6,9 12,15 18,9" />
    </svg>
  ),
  X: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
}

interface Product {
  id: string
  name: string
  category: string
  subcategory?: string
  basePrice?: number
  price?: number
  salePrice?: number
  colors?: string[]
  sizes?: string[]
  images: string[]
  rating: number
  reviews: number
  inStock: boolean
}

const CATEGORIES = [
  { id: 'all', name: 'All Products', count: 0 },
  { id: 'apparel', name: 'Apparel', count: 0 },
  { id: 'tech', name: 'Tech', count: 0 },
  { id: 'home-living', name: 'Home & Living', count: 0 },
  { id: 'art', name: 'Art', count: 0 },
  { id: 'accessories', name: 'Accessories', count: 0 },
  { id: 'music', name: 'Music', count: 0 },
]

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [cart, setCart] = useState<{[key: string]: number}>({})

  // Fetch products from API
  useEffect(() => {
    fetchProducts()
  }, [selectedCategory, search])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory !== 'all') params.append('category', selectedCategory)
      if (search) params.append('search', search)
      params.append('limit', '200')
      
      const res = await fetch(`/api/products?${params}`)
      const data = await res.json()
      setProducts(data.products || [])
    } catch (err) {
      console.error('Failed to fetch products:', err)
    } finally {
      setLoading(false)
    }
  }

  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
    const aPrice = (a as any).salePrice || (a as any).price || 0
    const bPrice = (b as any).salePrice || (b as any).price || 0
    switch (sortBy) {
      case 'price-low': return aPrice - bPrice
      case 'price-high': return bPrice - aPrice
      case 'rating': return b.rating - a.rating
      case 'newest': return 0 // Already sorted by newest
      default: return b.reviews - a.reviews // popular
    }
  })

  // Get category counts
  const categoryCounts = CATEGORIES.map(cat => ({
    ...cat,
    count: cat.id === 'all' 
      ? products.length 
      : products.filter(p => p.category.toLowerCase() === cat.id).length
  }))

  return (
    <div className="min-h-screen bg-[var(--pf-bg-secondary)] pt-20">
      {/* Header */}
      <div className="bg-[var(--pf-surface)] border-b border-[var(--pf-border)] sticky top-16 z-40">
        <div className="pf-container">
          <div className="flex items-center gap-4 py-3">
            {/* Search */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2.5 pl-10 rounded-lg border border-[var(--pf-border)] bg-[var(--pf-bg)] text-[var(--pf-text)] focus:border-[var(--pf-orange)] focus:outline-none"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--pf-text-muted)]">
                <Icon.Search />
              </div>
            </div>

            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 rounded-lg border transition-colors ${
                showFilters 
                  ? 'bg-[var(--pf-orange)] text-white border-[var(--pf-orange)]' 
                  : 'border-[var(--pf-border)] text-[var(--pf-text-secondary)] hover:border-[var(--pf-orange)]'
              }`}
            >
              <Icon.Filter />
            </button>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-[var(--pf-border)] bg-[var(--pf-bg)] text-[var(--pf-text)] focus:outline-none focus:border-[var(--pf-orange)]"
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>

            {/* View Mode */}
            <div className="hidden md:flex items-center gap-1 border border-[var(--pf-border)] rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-[var(--pf-orange)] text-white' : 'text-[var(--pf-text-secondary)]'
                }`}
              >
                <Icon.Grid />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-[var(--pf-orange)] text-white' : 'text-[var(--pf-text-secondary)]'
                }`}
              >
                <Icon.List />
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
            {categoryCounts.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-[var(--pf-orange)] text-white'
                    : 'bg-[var(--pf-bg)] text-[var(--pf-text-secondary)] hover:bg-[var(--pf-surface)]'
                }`}
              >
                {cat.name}
                <span className="ml-2 text-xs opacity-70">({cat.count})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pf-container py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          {showFilters && (
            <div className="w-64 shrink-0 hidden md:block">
              <div className="bg-[var(--pf-surface)] rounded-xl p-4 sticky top-40">
                <h3 className="font-bold mb-4 text-[var(--pf-text)]">Filters</h3>
                
                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold mb-2 text-[var(--pf-text)]">Price Range</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm text-[var(--pf-text-secondary)]">
                      <input type="checkbox" className="rounded border-[var(--pf-border)]" defaultChecked />
                      Under $10
                    </label>
                    <label className="flex items-center gap-2 text-sm text-[var(--pf-text-secondary)]">
                      <input type="checkbox" className="rounded border-[var(--pf-border)]" defaultChecked />
                      $10 - $25
                    </label>
                    <label className="flex items-center gap-2 text-sm text-[var(--pf-text-secondary)]">
                      <input type="checkbox" className="rounded border-[var(--pf-border)]" defaultChecked />
                      $25 - $50
                    </label>
                    <label className="flex items-center gap-2 text-sm text-[var(--pf-text-secondary)]">
                      <input type="checkbox" className="rounded border-[var(--pf-border)]" defaultChecked />
                      Over $50
                    </label>
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-[var(--pf-text)]">Rating</h4>
                  <div className="space-y-2">
                    {[4, 3, 2].map(rating => (
                      <label key={rating} className="flex items-center gap-2 text-sm text-[var(--pf-text-secondary)]">
                        <input type="checkbox" className="rounded border-[var(--pf-border)]" />
                        <span className="flex items-center">
                          {rating}+ <Icon.Star />
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-[var(--pf-surface)] rounded-xl animate-pulse">
                    <div className="aspect-square bg-[var(--pf-border)]" />
                    <div className="p-3 space-y-2">
                      <div className="h-4 bg-[var(--pf-border)] rounded w-3/4" />
                      <div className="h-3 bg-[var(--pf-border)] rounded w-1/2" />
                      <div className="h-5 bg-[var(--pf-border)] rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-[var(--pf-text)] mb-2">No products found</h3>
                <p className="text-[var(--pf-text-secondary)]">Try a different search or category</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                : 'space-y-3'
              }>
                {sortedProducts.map(product => (
                  <Link 
                    key={product.id}
                    href={`/product/${product.id}`}
                    className={`bg-[var(--pf-surface)] rounded-xl overflow-hidden group ${
                      viewMode === 'list' ? 'flex gap-4' : ''
                    }`}
                  >
                    {/* Product Image */}
                    <div className={`${viewMode === 'list' ? 'w-32 h-32 shrink-0' : 'aspect-square'} relative bg-[var(--pf-bg)]`}>
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {product.category && (
                        <div className="absolute top-2 left-2 bg-[var(--pf-orange)] text-white text-xs px-2 py-0.5 rounded-full">
                          {product.category}
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className={`p-3 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                      <h3 className="font-medium text-[var(--pf-text)] truncate group-hover:text-[var(--pf-orange)] transition-colors">
                        {product.name}
                      </h3>
                      
                      {product.subcategory && (
                        <p className="text-xs text-[var(--pf-text-muted)] mt-0.5">
                          {product.subcategory}
                        </p>
                      )}

                      <div className="flex items-center gap-1 mt-1">
                        <Icon.Star />
                        <span className="text-xs text-[var(--pf-text-secondary)]">
                          {product.rating.toFixed(1)} ({product.reviews})
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div>
                          <span className="font-bold text-[var(--pf-orange)]">${((product as any).salePrice || (product as any).price || 9.99).toFixed(2)}</span>
                          {product.colors && product.colors.length > 1 && (
                            <span className="text-xs text-[var(--pf-text-muted)] ml-2">
                              {product.colors.length} colors
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-green-500">In Stock</span>
                      </div>

                      {viewMode === 'list' && (
                        <p className="text-sm text-[var(--pf-text-secondary)] mt-2 line-clamp-2">
                          Premium quality {product.category.toLowerCase()} with custom design. Perfect for everyday use.
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Load More */}
            {!loading && sortedProducts.length >= 50 && (
              <div className="text-center mt-8">
                <button className="pf-btn pf-btn-secondary px-8">
                  Load More Products
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}