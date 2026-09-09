'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Clock3, Flame, Package, Sparkles } from 'lucide-react'
import { PRODUCTS, type Product, isPurchasable } from '@/lib/products'

const CATALOG_LIMIT = 12

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}

export default function TrendingPage() {
  const [products, setProducts] = useState<Product[]>(PRODUCTS)
  const [selectedCategory, setSelectedCategory] = useState('All')

  useEffect(() => {
    let cancelled = false

    async function loadCatalog() {
      try {
        const response = await fetch(`/api/products?scope=store&limit=${CATALOG_LIMIT}`, {
          cache: 'no-store',
        })
        const payload = await response.json().catch(() => ({}))
        if (!cancelled && response.ok && Array.isArray(payload.products)) {
          setProducts(payload.products)
        }
      } catch {
        // Keep the verified local catalog as a resilient visual fallback.
      }
    }

    void loadCatalog()
    return () => {
      cancelled = true
    }
  }, [])

  const visibleProducts = useMemo(() => {
    return products
      .filter((product) => product.storeVisible !== false)
      .sort((left, right) => Number(isPurchasable(right)) - Number(isPurchasable(left)))
      .slice(0, CATALOG_LIMIT)
  }, [products])

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(visibleProducts.map((product) => product.category)))],
    [visibleProducts]
  )

  const filteredProducts = selectedCategory === 'All'
    ? visibleProducts
    : visibleProducts.filter((product) => product.category === selectedCategory)

  return (
    <main className="min-h-screen bg-[var(--pf-bg)] pb-20 pt-20">
      <div className="pf-container max-w-6xl">
        <section className="relative overflow-hidden rounded-[32px] border border-[var(--pf-border)]/70 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.18),transparent_35%),linear-gradient(145deg,rgba(18,18,20,0.98),rgba(10,10,11,0.98))] px-6 py-10 shadow-[0_24px_90px_rgba(0,0,0,0.24)] sm:px-10 sm:py-14">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--pf-orange)]/25 bg-[var(--pf-orange)]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--pf-orange)]">
              <Flame size={14} />
              Featured now
            </div>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">
              Creator products worth discovering.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
              A current look at products from Porterful creators and founding brands. Availability is shown clearly on every item.
            </p>
            <Link
              href="/store"
              className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--pf-orange)] px-5 py-3 text-sm font-semibold text-[#111111] transition-all hover:brightness-110 active:scale-[0.98]"
            >
              Shop the full store
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        <section className="py-10 sm:py-12">
          <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--pf-orange)]">Porterful catalog</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Featured products</h2>
            </div>
            <div className="flex max-w-full items-center gap-2 overflow-x-auto pb-1">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`min-h-11 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'border-[var(--pf-orange)] bg-[var(--pf-orange)] text-[#111111]'
                      : 'border-[var(--pf-border)] bg-[var(--pf-surface)] text-[var(--pf-text-secondary)] hover:border-[var(--pf-orange)]/35 hover:text-[var(--pf-text)]'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => {
              const purchasable = product.purchasable ?? isPurchasable(product)
              return (
                <article
                  key={product.id}
                  className="group overflow-hidden rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)] shadow-sm transition-all hover:-translate-y-1 hover:border-[var(--pf-orange)]/30 hover:shadow-xl"
                >
                  <Link href={`/product/${product.id}`} className="block">
                    <div className="relative aspect-square overflow-hidden bg-[var(--pf-bg-secondary)]">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                      <div className="absolute left-3 top-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold backdrop-blur-md ${
                          purchasable
                            ? 'border-emerald-400/30 bg-emerald-950/80 text-emerald-300'
                            : 'border-white/15 bg-black/65 text-white/80'
                        }`}>
                          {purchasable ? <CheckCircle2 size={13} /> : <Clock3 size={13} />}
                          {purchasable ? 'Available now' : 'Preview'}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--pf-text-muted)]">{product.category}</p>
                      <h3 className="mt-2 line-clamp-2 text-base font-semibold text-[var(--pf-text)]">{product.name}</h3>
                      <p className="mt-1 text-sm text-[var(--pf-text-secondary)]">{product.artist}</p>
                      <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--pf-border)] pt-4">
                        <span className="font-bold text-[var(--pf-text)]">{formatPrice(product.price)}</span>
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--pf-orange)]">
                          View
                          <ArrowRight size={14} />
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              )
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-10 text-center">
              <Package className="mx-auto text-[var(--pf-text-muted)]" size={28} />
              <h3 className="mt-4 text-lg font-semibold">No products in this category yet</h3>
              <p className="mt-2 text-sm text-[var(--pf-text-secondary)]">Choose another category or browse the full store.</p>
            </div>
          )}
        </section>

        <section className="rounded-[28px] border border-[var(--pf-border)] bg-[var(--pf-surface)] p-6 sm:p-8">
          <div className="grid gap-6 md:grid-cols-[auto_1fr_auto] md:items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--pf-orange)]/10 text-[var(--pf-orange)]">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">One catalog. Clear availability.</h2>
              <p className="mt-1 text-sm leading-relaxed text-[var(--pf-text-secondary)]">
                This page uses the same product catalog as the Porterful Store, so preview products are never presented as available purchases.
              </p>
            </div>
            <Link href="/store" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--pf-border)] px-4 py-3 text-sm font-semibold hover:border-[var(--pf-orange)]/40">
              Browse store
              <ArrowRight size={15} />
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
