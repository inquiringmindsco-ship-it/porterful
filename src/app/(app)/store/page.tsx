'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import {
  ArrowRight,
  Clock,
  Search,
  Sparkles,
  Tag,
} from 'lucide-react'
import { PRODUCTS, isPurchasable, type Product } from '@/lib/products'

const REFERRAL_COOKIE = 'porterful_referral'
const REFERRAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 30

function normalizeReferralHandle(value: string | null | undefined) {
  const handle = value?.trim().toLowerCase()
  return handle ? handle : null
}

function readReferralCookie() {
  if (typeof document === 'undefined') return null

  const match = document.cookie
    .split('; ')
    .find((part) => part.startsWith(`${REFERRAL_COOKIE}=`))

  if (!match) return null
  return normalizeReferralHandle(decodeURIComponent(match.slice(REFERRAL_COOKIE.length + 1)))
}

function StoreProductCard({
  product,
  referralHandle,
}: {
  product: Product
  referralHandle: string | null
}) {
  const [loading, setLoading] = useState(false)
  const purchasable = isPurchasable(product)

  const handleBuy = async () => {
    setLoading(true)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            {
              id: product.id,
              name: product.name,
              artist: product.artist,
              price: product.price,
              image: product.image,
              quantity: 1,
              type: 'product',
              artistCut: product.artistCut || 0,
            },
          ],
          referralCode: referralHandle || undefined,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'Checkout failed')
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('Checkout URL missing')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Checkout failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <article className="pf-card overflow-hidden border border-[var(--pf-border)] transition-colors hover:border-[var(--pf-text-muted)]">
      <div className="relative aspect-square bg-[var(--pf-surface)]">
        <Image src={product.image} alt={product.name} fill className="object-cover" />
        {!purchasable && (
          <div className="absolute left-3 top-3 rounded-full bg-[var(--pf-bg)]/80 border border-[var(--pf-border)] px-2 py-1 text-xs font-medium text-[var(--pf-text)] backdrop-blur">
            Coming Soon
          </div>
        )}
      </div>

      <div className="space-y-4 p-4">
        <div>
          <p className="mb-1 text-xs uppercase tracking-[0.2em] text-[var(--pf-text-muted)]">
            {product.category}
          </p>
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-bold leading-tight text-[var(--pf-text)]">{product.name}</h2>
            <span className="shrink-0 font-bold text-[var(--pf-text)]">${product.price.toFixed(2)}</span>
          </div>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--pf-text-secondary)]">
            {product.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--pf-text-muted)]">
          <span className="inline-flex items-center gap-1">
            <Tag size={12} /> {product.artist}
          </span>
        </div>

        {purchasable ? (
          <button
            type="button"
            onClick={handleBuy}
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--pf-orange)] px-4 py-3 text-sm font-semibold text-[var(--pf-text)] transition-colors hover:bg-[var(--pf-orange)]/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Redirecting...
              </>
            ) : (
              <>
                Buy Now
                <ArrowRight size={16} />
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3 text-sm font-semibold text-[var(--pf-text-secondary)]"
          >
            <Clock size={16} />
            Coming Soon
          </button>
        )}
      </div>
    </article>
  )
}

export default function StorePage() {
  const searchParams = useSearchParams()
  const queryRef = normalizeReferralHandle(searchParams.get('ref'))

  const [referralHandle, setReferralHandle] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    const ref = queryRef || readReferralCookie()
    if (!ref) return

    setReferralHandle(ref)

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(REFERRAL_COOKIE, ref)
      document.cookie = `${REFERRAL_COOKIE}=${encodeURIComponent(ref)}; path=/; max-age=${REFERRAL_COOKIE_MAX_AGE}; samesite=lax`
    }
  }, [queryRef])

  useEffect(() => {
    if (queryRef || typeof window === 'undefined') return
    const stored = normalizeReferralHandle(window.localStorage.getItem(REFERRAL_COOKIE))
    if (stored) setReferralHandle(stored)
  }, [queryRef])

  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(PRODUCTS.map((product) => product.category)))]
  }, [])

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    return PRODUCTS.filter((product) => {
      const matchesCategory = activeCategory === 'All' || product.category === activeCategory
      if (!matchesCategory) return false

      if (!term) return true

      const haystack = [
        product.name,
        product.category,
        product.artist,
        product.description || '',
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(term)
    })
  }, [activeCategory, searchTerm])

  return (
    <main className="min-h-screen bg-[var(--pf-bg)] pt-20 pb-16">
      <div className="pf-container max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            Shop Porterful
          </h1>
          <p className="mt-2 max-w-2xl text-sm sm:text-base text-[var(--pf-text-secondary)]">
            Merch and goods from real artists.
          </p>
        </div>

        <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--pf-text-muted)]" size={16} />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search products…"
              className="w-full rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)] py-3 pl-11 pr-4 text-sm text-[var(--pf-text)] outline-none transition-colors placeholder:text-[var(--pf-text-muted)] focus:border-[var(--pf-orange)]/50"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:justify-end">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`whitespace-nowrap rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
                  activeCategory === category
                    ? 'border-[var(--pf-orange)] bg-[var(--pf-orange)] text-[var(--pf-text)]'
                    : 'border-[var(--pf-border)] bg-[var(--pf-surface)] text-[var(--pf-text-secondary)] hover:text-[var(--pf-text)]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <StoreProductCard
              key={product.id}
              product={product}
              referralHandle={referralHandle}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-10 text-center">
            <Sparkles className="mx-auto mb-3 text-[var(--pf-text-muted)]" size={24} />
            <p className="text-base font-semibold">No products found</p>
            <p className="mt-2 text-sm text-[var(--pf-text-secondary)]">Try a different search term or clear the category filter.</p>
          </div>
        )}


      </div>
    </main>
  )
}
