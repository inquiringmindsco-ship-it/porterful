'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUp, ShoppingCart, Check } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useToast } from '@/components/Toast'
import Script from 'next/script'

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

// Category mapping: URL slug -> product category value
const CATEGORY_MAP: Record<string, string> = {
  'all': '',
  'apparel': 'Apparel',
  'tech': 'Tech',
  'home-living': 'Home & Living',
  'art': 'Art',
  'accessories': 'Accessories',
  'music': 'Music',
  'trending': '', // Special: sort by trending, no category filter
}

const CATEGORIES = [
  { id: 'all', name: 'All Products', count: 0 },
  { id: 'trending', name: '🔥 Trending', count: 0 },
  { id: 'apparel', name: 'Apparel', count: 0 },
  { id: 'tech', name: 'Tech', count: 0 },
  { id: 'home-living', name: 'Home & Living', count: 0 },
  { id: 'art', name: 'Art', count: 0 },
  { id: 'accessories', name: 'Accessories', count: 0 },
  { id: 'music', name: 'Music', count: 0 },
]

// Price range filter options
const PRICE_RANGES = [
  { id: 'under-10', label: 'Under $10', min: 0, max: 10 },
  { id: '10-25', label: '$10 - $25', min: 10, max: 25 },
  { id: '25-50', label: '$25 - $50', min: 25, max: 50 },
  { id: 'over-50', label: 'Over $50', min: 50, max: Infinity },
]

// Rating filter options
const RATING_OPTIONS = [
  { id: '4-plus', label: '4+ Stars', minRating: 4 },
  { id: '3-plus', label: '3+ Stars', minRating: 3 },
]

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [addedProducts, setAddedProducts] = useState<Set<string>>(new Set())
  const searchTimeoutRef = useRef<NodeJS.Timeout>()
  const { addItem, subtotal } = useCart()
  const FREE_SHIPPING_THRESHOLD = 50
  const shippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)
  const shippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const hasFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD
  const { showToast } = useToast()

  // Active filters state
  const [activePriceRanges, setActivePriceRanges] = useState<string[]>([])
  const [activeMinRating, setActiveMinRating] = useState<number | null>(null)

  // Set page title for SEO — only override when meaningful (preserves default title for /shop)
  useEffect(() => {
    // Skip if default state (no filters, no search) — let metadata title serve for better SEO
    if (selectedCategory === 'all' && !search) return
    
    const categoryLabel = selectedCategory === 'trending' 
      ? '🔥 Trending' 
      : CATEGORIES.find(c => c.id === selectedCategory)?.name || 'Shop'
    const title = search 
      ? `Search: "${search}" — ${categoryLabel} — Porterful`
      : `${categoryLabel} — Porterful`
    document.title = title
  }, [selectedCategory, search])

  // Debounce search input
  useEffect(() => {
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(search)
    }, 350)
    return () => clearTimeout(searchTimeoutRef.current)
  }, [search])

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      // Handle category filter (skip for 'trending' which sorts by popularity)
      if (selectedCategory !== 'all' && selectedCategory !== 'trending') {
        params.append('category', CATEGORY_MAP[selectedCategory] || selectedCategory)
      }
      // Trending uses 'trending' sort; otherwise use selected sort
      const effectiveSort = selectedCategory === 'trending' ? 'trending' : sortBy
      if (debouncedSearch) params.append('search', debouncedSearch)
      params.append('sort', effectiveSort)
      params.append('limit', '200')

      const res = await fetch(`/api/products?${params}`)
      const data = await res.json()
      setProducts(data.products || [])
    } catch (err) {
      console.error('Failed to fetch products:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, debouncedSearch, sortBy])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Apply client-side filters (API handles sorting)
  const sortedProducts = useMemo(() => {
    let result = [...products]
    
    // Apply price range filter (only if any ranges selected)
    if (activePriceRanges.length > 0) {
      result = result.filter(p => {
        const price = (p as any).salePrice || (p as any).price || 0
        return activePriceRanges.some(rangeId => {
          const range = PRICE_RANGES.find(r => r.id === rangeId)
          return range && price >= range.min && price < range.max
        })
      })
    }
    
    // Apply rating filter
    if (activeMinRating !== null) {
      result = result.filter(p => p.rating >= activeMinRating)
    }
    
    // Note: Sorting is now handled server-side via API
    return result
  }, [products, activePriceRanges, activeMinRating])

  // Toggle price range filter
  const togglePriceRange = (rangeId: string) => {
    setActivePriceRanges(prev =>
      prev.includes(rangeId)
        ? prev.filter(id => id !== rangeId)
        : [...prev, rangeId]
    )
  }

  // Toggle rating filter
  const toggleRating = (minRating: number | null) => {
    setActiveMinRating(prev => prev === minRating ? null : minRating)
  }

  // Clear all filters
  const clearFilters = () => {
    setActivePriceRanges([])
    setActiveMinRating(null)
    setSearch('')
    setSelectedCategory('all')
  }

  const hasActiveFilters = activePriceRanges.length > 0 || activeMinRating !== null

  // Quick add to cart (no size/color selection for simple products)
  const handleQuickAdd = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      // If product has multiple colors/sizes, link to product page for proper selection
      if ((product.colors?.length ?? 0) > 1 || (product.sizes?.length ?? 0) > 1) {
        window.location.href = `/product/${product.id}`
        return
      }
      // Auto-select single color or size if present
      const selectedColor = product.colors?.[0]
      const selectedSize = product.sizes?.[0]
      // Use proper cart context
      addItem({
        productId: product.id,
        price: (product as any).salePrice || (product as any).price || 9.99,
        name: product.name,
        artist: 'Porterful',
        image: product.images[0],
        artistCut: ((product as any).salePrice || (product as any).price || 9.99) * 0.80,
        ...(selectedColor && { color: selectedColor }),
        ...(selectedSize && { size: selectedSize }),
      })
      setAddedProducts(prev => new Set(prev).add(product.id))
      showToast(`${product.name} added to cart!`, 'success')
      setTimeout(() => {
        setAddedProducts(prev => {
          const next = new Set(prev)
          next.delete(product.id)
          return next
        })
      }, 2000)
    } catch (err) {
      console.error('Failed to add to cart:', err)
      showToast('Failed to add item', 'error')
    }
  }

  // Get category counts
  const categoryCounts = CATEGORIES.map(cat => ({
    ...cat,
    count: cat.id === 'all' 
      ? products.length 
      : products.filter(p => p.category.toLowerCase() === (CATEGORY_MAP[cat.id] || cat.id).toLowerCase()).length
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
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setSearch('')
                    setShowFilters(false)
                  }
                }}
                className="w-full px-4 py-2.5 pl-10 pr-10 rounded-lg border border-[var(--pf-border)] bg-[var(--pf-bg)] text-[var(--pf-text)] focus:border-[var(--pf-orange)] focus:outline-none"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--pf-text-muted)]">
                <Icon.Search />
              </div>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--pf-text-muted)] hover:text-[var(--pf-text)] transition-colors"
                  aria-label="Clear search"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>

            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              aria-expanded={showFilters}
              aria-controls="filter-sidebar"
              aria-label="Toggle filters"
              className={`p-2.5 rounded-lg border transition-colors relative ${
                showFilters 
                  ? 'bg-[var(--pf-orange)] text-white border-[var(--pf-orange)]' 
                  : 'border-[var(--pf-border)] text-[var(--pf-text-secondary)] hover:border-[var(--pf-orange)]'
              }`}
            >
              <Icon.Filter />
              {hasActiveFilters && !showFilters && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--pf-orange)] text-white text-xs rounded-full flex items-center justify-center">
                  {activeMinRating !== null ? '!' : '✓'}
                </span>
              )}
            </button>

            {/* Sort */}
            <div className="flex items-center gap-2">
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
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2.5 text-sm text-[var(--pf-orange)] hover:bg-[var(--pf-orange)]/10 rounded-lg transition-colors whitespace-nowrap"
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* View Mode */}
            <div className="flex items-center gap-1 border border-[var(--pf-border)] rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 sm:p-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-[var(--pf-orange)] text-white' : 'text-[var(--pf-text-secondary)]'
                }`}
                aria-label="Grid view"
              >
                <Icon.Grid />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 sm:p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-[var(--pf-orange)] text-white' : 'text-[var(--pf-text-secondary)]'
                }`}
                aria-label="List view"
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
          {/* Mobile Filter Drawer */}
          {showFilters && (
            <div className="fixed inset-0 z-50 md:hidden">
              {/* Backdrop */}
              <div 
                className="absolute inset-0 bg-black/50" 
                onClick={() => setShowFilters(false)}
              />
              {/* Drawer */}
              <div className="absolute bottom-0 left-0 right-0 bg-[var(--pf-surface)] rounded-t-2xl max-h-[70vh] overflow-auto">
                <div className="sticky top-0 bg-[var(--pf-surface)] border-b border-[var(--pf-border)] p-4 flex items-center justify-between">
                  <h3 className="font-bold text-[var(--pf-text)]">Filters</h3>
                  <button 
                    onClick={() => setShowFilters(false)}
                    className="p-2 hover:bg-[var(--pf-bg)] rounded-lg"
                    aria-label="Close filters"
                  >
                    <Icon.X />
                  </button>
                </div>
                <div className="p-4">
                  {/* Price Range */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold mb-2 text-[var(--pf-text)]">Price Range</h4>
                    <div className="space-y-2">
                      {PRICE_RANGES.map(range => (
                        <label key={range.id} className="flex items-center gap-2 text-sm text-[var(--pf-text-secondary)] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={activePriceRanges.includes(range.id)}
                            onChange={() => togglePriceRange(range.id)}
                            className="rounded border-[var(--pf-border)] text-[var(--pf-orange)] focus:ring-[var(--pf-orange)]"
                          />
                          {range.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold mb-2 text-[var(--pf-text)]">Rating</h4>
                    <div className="space-y-2">
                      {RATING_OPTIONS.map(opt => (
                        <label key={opt.id} className="flex items-center gap-2 text-sm text-[var(--pf-text-secondary)] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={activeMinRating === opt.minRating}
                            onChange={() => toggleRating(opt.minRating)}
                            className="rounded border-[var(--pf-border)] text-[var(--pf-orange)] focus:ring-[var(--pf-orange)]"
                          />
                          <span className="flex items-center">
                            {opt.label} <Icon.Star />
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="sticky bottom-0 bg-[var(--pf-surface)] border-t border-[var(--pf-border)] p-4 flex gap-3">
                  <button
                    onClick={clearFilters}
                    className="flex-1 py-3 border border-[var(--pf-border)] rounded-xl font-semibold text-[var(--pf-text)]"
                  >
                    Clear all
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="flex-1 py-3 bg-[var(--pf-orange)] text-white rounded-xl font-semibold"
                  >
                    Show {sortedProducts.length} results
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Desktop Sidebar Filters */}
          {showFilters && (
            <div id="filter-sidebar" className="w-64 shrink-0 hidden md:block">
              <div className="bg-[var(--pf-surface)] rounded-xl p-4 sticky top-40">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[var(--pf-text)]">Filters</h3>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-[var(--pf-orange)] hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                
                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold mb-2 text-[var(--pf-text)]">Price Range</h4>
                  <div className="space-y-2">
                    {PRICE_RANGES.map(range => (
                      <label key={range.id} className="flex items-center gap-2 text-sm text-[var(--pf-text-secondary)] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={activePriceRanges.includes(range.id)}
                          onChange={() => togglePriceRange(range.id)}
                          className="rounded border-[var(--pf-border)] text-[var(--pf-orange)] focus:ring-[var(--pf-orange)]"
                        />
                        {range.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-[var(--pf-text)]">Rating</h4>
                  <div className="space-y-2">
                    {RATING_OPTIONS.map(opt => (
                      <label key={opt.id} className="flex items-center gap-2 text-sm text-[var(--pf-text-secondary)] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={activeMinRating === opt.minRating}
                          onChange={() => toggleRating(opt.minRating)}
                          className="rounded border-[var(--pf-border)] text-[var(--pf-orange)] focus:ring-[var(--pf-orange)]"
                        />
                        <span className="flex items-center">
                          {opt.label} <Icon.Star />
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
                <p className="text-[var(--pf-text-secondary)] mb-4">Try adjusting your search or filters</p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-6 py-2 bg-[var(--pf-orange)] text-white rounded-lg hover:bg-[var(--pf-orange-dark)] transition-colors"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                : 'space-y-3'
              }>
                {sortedProducts.map((product, idx) => (
                  <Link 
                    key={product.id}
                    href={`/product/${product.id}`}
                    className={`bg-[var(--pf-surface)] rounded-xl overflow-hidden group ${
                      viewMode === 'list' ? 'flex gap-4' : ''
                    }`}
                  >
                    {/* Product Image */}
                    <div className={`${viewMode === 'list' ? 'w-32 h-32 shrink-0' : 'aspect-square'} relative bg-[var(--pf-bg)]`}>
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform"
                        priority={idx < 8} // Prioritize above-the-fold images for LCP
                      />
                      {product.category && (
                        <div className="absolute top-2 left-2 bg-[var(--pf-orange)] text-white text-xs px-2 py-0.5 rounded-full">
                          {product.category}
                        </div>
                      )}
                      {product.colors && product.colors.length > 1 && (
                        <div className="absolute top-2 right-2 bg-[var(--pf-surface)]/90 backdrop-blur-sm text-[var(--pf-text)] text-xs px-2 py-0.5 rounded-full">
                          {product.colors.length} colors
                        </div>
                      )}
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="bg-white/90 text-gray-800 text-sm font-bold px-3 py-1 rounded-full">
                            Sold Out
                          </span>
                        </div>
                      )}
                      {/* Quick Add — always visible on mobile (touch can't hover), hover on desktop */}
                      {product.inStock && (
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 sm:opacity-0 transition-opacity flex items-center justify-center">
                          <button
                            onClick={(e) => handleQuickAdd(e, product)}
                            disabled={addedProducts.has(product.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all active:scale-95 ${
                              addedProducts.has(product.id)
                                ? 'bg-green-500 text-white'
                                : 'bg-[var(--pf-orange)] text-white hover:bg-[var(--pf-orange-dark)]'
                            }`}
                          >
                            {addedProducts.has(product.id) ? (
                              <>
                                <Check size={16} />
                                Added!
                              </>
                            ) : (
                              <>
                                <ShoppingCart size={16} />
                                Quick Add
                              </>
                            )}
                          </button>
                        </div>
                      )}
                      {/* Mobile persistent quick-add pill — only on grid, visible on touch devices */}
                      {product.inStock && (
                        <div className="absolute bottom-2 left-2 right-2 sm:hidden">
                          <button
                            onClick={(e) => handleQuickAdd(e, product)}
                            disabled={addedProducts.has(product.id)}
                            className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
                              addedProducts.has(product.id)
                                ? 'bg-green-500 text-white'
                                : 'bg-[var(--pf-orange)] text-white'
                            }`}
                          >
                            {addedProducts.has(product.id) ? <Check size={12} /> : <ShoppingCart size={12} />}
                            {addedProducts.has(product.id) ? 'Added!' : 'Quick Add'}
                          </button>
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
                        <span className={`text-xs font-medium ${
                          !product.inStock 
                            ? 'text-red-500' 
                            : product.reviews < 10 
                              ? 'text-yellow-500' 
                              : 'text-green-500'
                        }`}>
                          {!product.inStock ? 'Out of Stock' : product.reviews < 10 ? 'Low Stock' : 'In Stock'}
                        </span>
                      </div>

                      {viewMode === 'list' && (
                        <p className="text-sm text-[var(--pf-text-secondary)] mt-2 line-clamp-2">
                          Premium quality {product.category.toLowerCase()} with custom design. Perfect for everyday use.
                        </p>
                      )}

                      {/* List view: Quick Add button */}
                      {viewMode === 'list' && product.inStock && (
                        <div className="mt-3">
                          <button
                            onClick={(e) => handleQuickAdd(e, product)}
                            disabled={addedProducts.has(product.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
                              addedProducts.has(product.id)
                                ? 'bg-green-500 text-white'
                                : 'bg-[var(--pf-orange)] text-white hover:brightness-110'
                            }`}
                          >
                            {addedProducts.has(product.id) ? <Check size={12} /> : <ShoppingCart size={12} />}
                            {addedProducts.has(product.id) ? 'Added!' : 'Add to Cart'}
                          </button>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Products count */}
            {!loading && sortedProducts.length > 0 && (
              <p className="text-center text-[var(--pf-text-muted)] mt-6 text-sm">
                Showing {sortedProducts.length} of {products.length} product{products.length !== 1 ? 's' : ''}
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="ml-2 text-[var(--pf-orange)] hover:underline">
                    Clear filters
                  </button>
                )}
              </p>
            )}

            {/* Free Shipping Progress */}
            {subtotal > 0 && (
              <div className="mt-6 max-w-md mx-auto">
                <div className="flex items-center justify-between text-xs text-[var(--pf-text-secondary)] mb-1.5">
                  <span>{hasFreeShipping ? '🎉 FREE shipping unlocked!' : 'Free shipping progress'}</span>
                  <span>{hasFreeShipping ? '✓' : `$${shippingRemaining.toFixed(2)} away`}</span>
                </div>
                <div className="h-2 bg-[var(--pf-surface)] rounded-full overflow-hidden border border-[var(--pf-border)]">
                  <div 
                    className="h-full bg-gradient-to-r from-[var(--pf-orange)] to-[var(--pf-orange-light)] transition-all duration-500 rounded-full"
                    style={{ width: `${hasFreeShipping ? 100 : shippingProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Back to Top */}
            <BackToTop />

            {/* Product Schema for SEO */}
            <ProductSchema products={sortedProducts} />
          </div>
        </div>
      </div>
    </div>
  )
}

// Product structured data for Google Shopping
function ProductSchema({ products }: { products: any[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: products.slice(0, 50).map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: product.name,
        image: product.images?.[0],
        description: `${product.category} - ${product.subcategory || 'Premium quality merchandise'}`,
        brand: { '@type': 'Brand', name: 'Porterful' },
        offers: {
          '@type': 'Offer',
          price: ((product as any).salePrice || (product as any).price || 9.99).toFixed(2),
          priceCurrency: 'USD',
          availability: product.inStock
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        },
        aggregateRating: product.rating > 0 ? {
          '@type': 'AggregateRating',
          ratingValue: product.rating.toFixed(1),
          reviewCount: product.reviews,
        } : undefined,
      },
    })),
  }

  return (
    <Script
      id="product-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Back to Top component
function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      setVisible(window.scrollY > 600)
    }
    window.addEventListener('scroll', toggleVisibility, { passive: true })
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!visible) return null

  return (
    <button
      onClick={scrollTop}
      aria-label="Back to top"
      className="fixed bottom-24 right-6 w-12 h-12 bg-[var(--pf-orange)] text-white rounded-full shadow-lg hover:bg-[var(--pf-orange-dark)] transition-all hover:scale-110 flex items-center justify-center z-50"
    >
      <ArrowUp size={20} />
    </button>
  )
}