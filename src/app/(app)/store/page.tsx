'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import {
  ArrowRight,
  Check,
  Copy,
  Search,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
} from 'lucide-react'
import { PRODUCTS, type Product } from '@/lib/products'

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
    <article className="pf-card overflow-hidden border border-[var(--pf-border)] transition-colors hover:border-[var(--pf-orange)]/40">
      <div className="relative aspect-square bg-gradient-to-br from-[var(--pf-orange)]/10 to-purple-500/10">
        <Image src={product.image} alt={product.name} fill className="object-cover" />
        {product.featured && (
          <div className="absolute left-3 top-3 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur">
            Featured
          </div>
        )}
        {product.dropship && (
          <div className="absolute right-3 top-3 rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-medium text-emerald-300">
            Partner
          </div>
        )}
      </div>

      <div className="space-y-4 p-4">
        <div>
          <p className="mb-1 text-xs uppercase tracking-[0.2em] text-[var(--pf-text-muted)]">
            {product.category}
          </p>
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-bold leading-tight">{product.name}</h2>
            <span className="shrink-0 font-bold text-[var(--pf-orange)]">${product.price.toFixed(2)}</span>
          </div>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--pf-text-secondary)]">
            {product.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--pf-text-muted)]">
          <span className="inline-flex items-center gap-1">
            <Tag size={12} /> Porterful inventory
          </span>
          <span className="inline-flex items-center gap-1">
            <ShieldCheck size={12} /> Verification only for payouts
          </span>
        </div>

        <button
          type="button"
          onClick={handleBuy}
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--pf-orange)] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--pf-orange-dark)] disabled:cursor-not-allowed disabled:opacity-60"
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
  const [copied, setCopied] = useState(false)

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

  const copyStoreLink = async () => {
    const url = referralHandle
      ? `${window.location.origin}/store?ref=${encodeURIComponent(referralHandle)}`
      : `${window.location.origin}/store`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <main className="min-h-screen bg-[var(--pf-bg)] pt-20 pb-16">
      <div className="pf-container max-w-6xl">
        <div className="mb-8 grid gap-6 rounded-3xl border border-[var(--pf-border)] bg-gradient-to-r from-[var(--pf-orange)]/10 to-purple-500/10 p-6 lg:grid-cols-[1.4fr_0.8fr] lg:items-end">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--pf-border)] bg-[var(--pf-surface)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--pf-text-muted)]">
              <ShoppingBag size={12} />
              Store — part of Porterful™
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Choose Products to Sell</h1>
              <p className="max-w-2xl text-sm text-[var(--pf-text-secondary)] sm:text-base">
                Curated Porterful inventory only. Pick a product, share the link, and keep the flow simple.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3">
            <p className="flex items-center gap-2 text-sm font-medium text-[var(--pf-text)]">
              <ShieldCheck size={16} className="text-[var(--pf-orange)]" />
              Payout verification is only required to withdraw earnings.
            </p>
          </div>
        </div>

        {referralHandle && (
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--pf-orange)]">Referral active</p>
              <p className="text-sm text-[var(--pf-text-secondary)]">@{referralHandle} will get credit for this visit.</p>
            </div>
            <button
              type="button"
              onClick={copyStoreLink}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--pf-border)] px-4 py-2 text-sm font-semibold text-[var(--pf-text)] transition-colors hover:border-[var(--pf-orange)]/40"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy Store Link'}
            </button>
          </div>
        )}

        <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--pf-text-muted)]" size={16} />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search products..."
              className="w-full rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)] py-3 pl-11 pr-4 text-sm text-[var(--pf-text)] outline-none transition-colors placeholder:text-[var(--pf-text-muted)] focus:border-[var(--pf-orange)]/40"
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
                    ? 'border-[var(--pf-orange)] bg-[var(--pf-orange)] text-white'
                    : 'border-[var(--pf-border)] bg-[var(--pf-surface)] text-[var(--pf-text-secondary)] hover:text-white'
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
            <Sparkles className="mx-auto mb-3 text-[var(--pf-orange)]" size={28} />
            <p className="text-lg font-semibold">No products found</p>
            <p className="mt-2 text-sm text-[var(--pf-text-secondary)]">Try a different search term or clear the category filter.</p>
          </div>
        )}

        <div className="mt-10 rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--pf-text)]">Need your own link?</p>
              <p className="text-sm text-[var(--pf-text-secondary)]">Grab your store link from the dashboard and share it anywhere.</p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--pf-orange)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--pf-orange-dark)]"
              >
                Dashboard <ArrowRight size={14} />
              </Link>
              <button
                type="button"
                onClick={copyStoreLink}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--pf-border)] px-4 py-2 text-sm font-semibold text-[var(--pf-text)] transition-colors hover:border-[var(--pf-orange)]/40"
              >
                <Share2 size={14} />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
