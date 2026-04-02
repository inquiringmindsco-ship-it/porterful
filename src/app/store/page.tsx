'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Star, ArrowRight } from 'lucide-react'
import { PRODUCTS, FEATURED_PRODUCTS, Product } from '@/lib/products'
import { ARTISTS } from '@/lib/artists'

export default function StorePage() {
  const [activeCategory, setActiveCategory] = useState('All')

  const categories = ['All', 'Apparel', 'Art', 'Books', 'Home', 'Tech', 'Merch']

  const filteredProducts = activeCategory === 'All'
    ? FEATURED_PRODUCTS
    : FEATURED_PRODUCTS.filter(p => p.category === activeCategory)

  return (
    <div className="min-h-screen pt-20 pb-24 bg-[var(--pf-bg)]">

      {/* Book Hero — #1 Product */}
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
              <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                New Release
              </div>
              <h1 className="text-3xl md:text-4xl font-black mb-3">
                "There It Is, Here It Go."
              </h1>
              <p className="text-white/90 text-sm md:text-base mb-4 max-w-xl">
                The memoir. Raw, honest, deeply personal. The story of an artist from St. Louis who refused to quit — and what he learned when everything fell apart.
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
              <p className="text-[var(--pf-text-muted)] text-sm mb-3">
                Book + Tee = $45 <span className="line-through text-[var(--pf-text-muted)]">$53</span> — Save $8
              </p>
              <p className="text-[var(--pf-text-secondary)] text-sm">
                Get the memoir plus the Ambiguous tour tee. The full O D Porter experience.
              </p>
            </div>
            <Link href="/product/bundle-starter" className="px-6 py-3 bg-[var(--pf-orange)] text-white font-bold rounded-lg hover:bg-[var(--pf-orange)]/90 transition text-sm flex items-center gap-2">
              Get Bundle <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* Featured Products */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured Products</h2>
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
                    : 'bg-[var(--pf-surface)] text-[var(--pf-text-secondary)] hover:text-white border border-[var(--pf-border)]'
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
                  {product.sales && product.sales > 50 && (
                    <div className="absolute top-3 right-3 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
                      {product.sales} sold
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
            <Link href="/artists" className="text-[var(--pf-orange)] hover:underline flex items-center gap-1 text-sm font-medium">
              View All Artists <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ARTISTS.map(artist => (
              <Link
                key={artist.id}
                href={`/artist/${artist.id}`}
                className="bg-gradient-to-r from-[var(--pf-orange)]/10 to-purple-500/10 rounded-2xl p-5 border border-[var(--pf-border)] hover:border-[var(--pf-orange)] transition-colors group"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[var(--pf-border)] group-hover:border-[var(--pf-orange)] mb-3">
                    <Image
                      src={artist.image}
                      alt={artist.name}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
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
                We handle printing, shipping, and customer service.
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
