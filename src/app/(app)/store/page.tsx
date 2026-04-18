'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Search, SlidersHorizontal, ShoppingBag, Music, Users, BookOpen, Package, X } from 'lucide-react'
import { PRODUCTS, FEATURED_PRODUCTS, type Product } from '@/lib/products'

const CATEGORIES = [
  { id: 'all', label: 'All', icon: Package },
  { id: 'tech', label: 'Tech', icon: Music },
  { id: 'merch', label: 'Merch', icon: Package },
  { id: 'book', label: 'Books', icon: BookOpen },
  { id: 'music', label: 'Music', icon: Music },
  { id: 'apparel', label: 'Apparel', icon: Users },
]

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(0)}`
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/checkout/checkout?product=${product.id}`}
      className="group block bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-2xl overflow-hidden hover:border-[var(--pf-orange)]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[var(--pf-orange)]/5"
    >
      <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-[var(--pf-orange)]/5 to-purple-500/5">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {product.featured && (
          <span className="absolute top-3 left-3 px-2 py-1 bg-[var(--pf-orange)] text-white text-xs font-bold rounded-full">
            Featured
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-white group-hover:text-[var(--pf-orange)] transition-colors line-clamp-1">
            {product.name}
          </h3>
          <span className="text-lg font-black text-[var(--pf-orange)] shrink-0">
            {formatPrice(product.price * 100)}
          </span>
        </div>
        <p className="text-sm text-[var(--pf-text-muted)] mb-3 line-clamp-2 leading-relaxed">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--pf-text-muted)] bg-[var(--pf-bg)] px-2 py-1 rounded-full">
            {product.category}
          </span>
          <span className="text-xs text-[var(--pf-text-muted)] flex items-center gap-1">
            <ShoppingBag className="w-3 h-3" /> Shop
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function CentralStore() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [referralParam, setReferralParam] = useState<string | null>(null)

  // Capture ?ref= parameter and store in cookie
  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) {
      setReferralParam(ref)
      // Store ref in cookie for checkout tracking
      document.cookie = `porterful_referral=${ref}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`
      // Clean URL without reloading
      router.replace('/store', { scroll: false })
    }
  }, [searchParams, router])

  const filteredProducts = useMemo(() => {
    let products = PRODUCTS

    if (activeCategory !== 'all') {
      products = products.filter(p => 
        p.category.toLowerCase() === activeCategory.toLowerCase()
      )
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      products = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.artist.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      )
    }

    return products
  }, [search, activeCategory])

  return (
    <main className="min-h-screen bg-[var(--pf-bg)]">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--pf-orange)]/10 via-transparent to-purple-500/10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[var(--pf-orange)]/5 rounded-full blur-3xl -translate-y-1/2" />
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-12 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-black mb-6">
              Porterful <span className="text-[var(--pf-orange)]">Store</span>
            </h1>
            <p className="text-xl text-[var(--pf-text-muted)] mb-8">
              Discover products from the Porterful ecosystem. Every purchase supports artists directly.
            </p>
            {referralParam && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-sm mb-4">
                <span>Shopping with referral from <strong>@{referralParam}</strong></span>
              </div>
            )}
          </div>

          {/* Search */}
          <div className="max-w-2xl mx-auto mt-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--pf-text-muted)]" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-2xl text-white placeholder:text-[var(--pf-text-muted)] focus:outline-none focus:border-[var(--pf-orange)]/50 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--pf-text-muted)] hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="border-b border-[var(--pf-border)] sticky top-0 bg-[var(--pf-bg)]/80 backdrop-blur-xl z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 py-4 overflow-x-auto scrollbar-none">
            {CATEGORIES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveCategory(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
                  activeCategory === id
                    ? 'bg-[var(--pf-orange)] text-white'
                    : 'bg-[var(--pf-surface)] text-[var(--pf-text-muted)] hover:text-white hover:bg-[var(--pf-surface-hover)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 mx-auto text-[var(--pf-text-muted)] mb-4" />
            <h3 className="text-xl font-bold mb-2">No products found</h3>
            <p className="text-[var(--pf-text-muted)]">Try a different search or category</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-[var(--pf-text-muted)]">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* How it works */}
      <div className="border-t border-[var(--pf-border)]">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-center mb-12">How Porterful Store Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Browse Products', desc: 'Explore our curated catalog of digital products, memberships, and physical goods.', icon: '🛍️' },
              { title: 'Support Artists', desc: 'Every purchase includes a 20% artist fund contribution — you directly support creators.', icon: '🎵' },
              { title: 'Earn Rewards', desc: 'Sign up as a superfan and share products with your unique link to earn commission.', icon: '💰' },
            ].map(({ title, desc, icon }) => (
              <div key={title} className="text-center p-6">
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-[var(--pf-text-muted)] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}