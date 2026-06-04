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
  Share2,
  Settings,
  Play,
  Eye,
  Shield,
  Package,
} from 'lucide-react'
import { useSupabase } from '@/app/providers'
import { useToast } from '@/components/Toast'
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

type UserRole = 'artist' | 'founder' | 'admin' | 'member' | 'listener' | null

function useUserRole(): { role: UserRole; loading: boolean } {
  const { user, supabase } = useSupabase()
  const [role, setRole] = useState<UserRole>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setRole(null)
      setLoading(false)
      return
    }

    let cancelled = false
    supabase
      ?.from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (cancelled) return
        setRole((data?.role as UserRole) || 'listener')
        setLoading(false)
      }, () => {
        if (cancelled) return
        setRole('listener')
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [user, supabase])

  return { role, loading }
}

function ProductBadge({ product }: { product: Product }) {
  const purchasable = isPurchasable(product)
  const controlled = product.fulfillmentType === 'img_fulfillment' || product.fulfillment === 'img_fulfillment'

  if (purchasable && controlled) {
    return (
      <div className="absolute left-3 top-3 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-400 backdrop-blur-sm">
          <Shield size={11} />
          Live
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--pf-orange)]/15 border border-[var(--pf-orange)]/30 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--pf-orange)] backdrop-blur-sm">
          <Package size={11} />
          IMG Fulfilled
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
          <Play size={11} />
          Controlled Drop
        </span>
      </div>
    )
  }

  if (purchasable) {
    return (
      <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--pf-orange)]/15 border border-[var(--pf-orange)]/30 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--pf-orange)] backdrop-blur-sm">
        <Play size={11} />
        Live
      </div>
    )
  }

  return (
    <div className="absolute left-3 top-3 flex flex-wrap gap-2">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--pf-bg)]/80 border border-[var(--pf-border)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--pf-text-muted)] backdrop-blur-sm">
        <Eye size={11} />
        Preview
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--pf-bg)]/80 border border-[var(--pf-border)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--pf-text-muted)] backdrop-blur-sm">
        Not live yet
      </span>
    </div>
  )
}

function StoreProductCard({
  product,
  referralHandle,
  userRole,
}: {
  product: Product
  referralHandle: string | null
  userRole: UserRole
}) {
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()
  const purchasable = isPurchasable(product)
  const isControlled = product.fulfillmentType === 'img_fulfillment' || product.fulfillment === 'img_fulfillment'

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
      if (!res.ok) throw new Error(data.error || 'Checkout failed')
      if (data.url) window.location.href = data.url
      else throw new Error('Checkout URL missing')
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Checkout failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleShare = () => {
    const url = `${window.location.origin}/product/${product.id}`
    if (navigator.share) {
      navigator.share({ title: product.name, text: `Check out ${product.name} by ${product.artist}`, url })
    } else {
      navigator.clipboard.writeText(url)
      showToast('Product link copied. Share it from your dashboard.', 'success')
    }
  }

  // Determine CTA set based on role + product state
  const isAdmin = userRole === 'admin' || userRole === 'founder'
  const isArtistOrMember = userRole === 'artist' || userRole === 'member'

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-200 hover:shadow-lg ${
        purchasable
          ? 'border-[var(--pf-border)] hover:border-[var(--pf-orange)]/40 bg-[var(--pf-surface)]'
          : 'border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/60 opacity-90'
      }`}
      data-tour-id={product.skuCode === 'COMING-HOME-TEE-001' ? 'controlled-merch-card' : undefined}
    >
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--pf-bg)]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className={`object-cover transition-transform duration-300 group-hover:scale-105 ${
            !purchasable ? 'grayscale-[20%]' : ''
          }`}
        />
        <div className={`absolute inset-0 ${!purchasable ? 'bg-black/10' : 'bg-gradient-to-t from-black/20 via-transparent to-transparent'}`} />
        <ProductBadge product={product} />
      </div>

      {/* Content */}
      <div className="space-y-3 p-4">
        {/* Category + Title + Price */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--pf-text-muted)]">
              {product.category}
            </p>
            {isControlled && purchasable && (
              <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-wider">
                Controlled Drop
              </span>
            )}
          </div>
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-bold leading-snug text-[var(--pf-text)] text-base">{product.name}</h2>
            <span className="shrink-0 font-bold text-[var(--pf-text)] text-lg">${product.price.toFixed(2)}</span>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--pf-text-secondary)]">
            {product.description}
          </p>
        </div>

        {/* Artist attribution */}
        <div className="flex items-center gap-2 text-xs text-[var(--pf-text-muted)]">
          <span className="inline-flex items-center gap-1 rounded-full border border-[var(--pf-border)] bg-[var(--pf-bg)] px-2 py-1">
            <Tag size={10} />
            {product.artist}
          </span>
          {product.colors && (
            <span className="text-[var(--pf-text-faint)]">
              {product.colors.length} color{product.colors.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* CTAs — role-aware */}
        <div className="flex flex-col gap-2 pt-1">
          {purchasable && (
            <button
              type="button"
              onClick={handleBuy}
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--pf-orange)] px-4 py-3 text-sm font-semibold text-[#111111] transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
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
          )}

          {!purchasable && (
            <button
              type="button"
              disabled
              className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3 text-sm font-semibold text-[var(--pf-text-muted)]"
            >
              <Clock size={16} />
              Preview — Not Available Yet
            </button>
          )}

          {/* Role-aware secondary actions */}
          {isArtistOrMember && purchasable && (
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--pf-border)] bg-[var(--pf-bg)] px-4 py-2.5 text-sm font-medium text-[var(--pf-text)] transition-colors hover:border-[var(--pf-orange)]/40 hover:bg-[var(--pf-orange)]/5"
            >
              <Share2 size={14} />
              Promote
            </button>
          )}

          {isAdmin && purchasable && (
            <Link
              href="/dashboard/founder"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--pf-border)] bg-[var(--pf-bg)] px-4 py-2.5 text-sm font-medium text-[var(--pf-text)] transition-colors hover:border-[var(--pf-orange)]/40 hover:bg-[var(--pf-orange)]/5"
            >
              <Settings size={14} />
              Manage Product
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}

export default function StorePage() {
  const searchParams = useSearchParams()
  const queryRef = normalizeReferralHandle(searchParams.get('ref'))
  const { user } = useSupabase()
  const { role: userRole, loading: roleLoading } = useUserRole()

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

  // Separate live from preview
  const liveProducts = useMemo(() => PRODUCTS.filter((p) => isPurchasable(p)), [])
  const previewProducts = useMemo(() => PRODUCTS.filter((p) => !isPurchasable(p)), [])

  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(PRODUCTS.map((product) => product.category)))]
  }, [])

  const filteredLive = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return liveProducts.filter((product) => {
      const matchesCategory = activeCategory === 'All' || product.category === activeCategory
      if (!matchesCategory) return false
      if (!term) return true
      const haystack = [product.name, product.category, product.artist, product.description || ''].join(' ').toLowerCase()
      return haystack.includes(term)
    })
  }, [liveProducts, activeCategory, searchTerm])

  const filteredPreview = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return previewProducts.filter((product) => {
      const matchesCategory = activeCategory === 'All' || product.category === activeCategory
      if (!matchesCategory) return false
      if (!term) return true
      const haystack = [product.name, product.category, product.artist, product.description || ''].join(' ').toLowerCase()
      return haystack.includes(term)
    })
  }, [previewProducts, activeCategory, searchTerm])

  const isLoggedIn = !!user
  const isArtistMember = userRole === 'artist' || userRole === 'member'
  const isAdmin = userRole === 'admin' || userRole === 'founder'

  return (
    <main className="min-h-screen bg-[var(--pf-bg)] pt-20 pb-16">
      <div className="pf-container max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Package size={20} className="text-[var(--pf-orange)]" />
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--pf-orange)]">
              Porterful Store
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl text-white">
            Shop Music-Linked Products
          </h1>
          <p className="mt-3 max-w-2xl text-sm sm:text-base text-[var(--pf-text-secondary)] leading-relaxed">
            Music-linked products from independent artists.
            <span className="text-[var(--pf-text)]"> Live products</span> can be purchased now.
            <span className="text-[var(--pf-text-muted)]"> Preview products</span> are not available yet.
          </p>

          {/* Member promo box */}
          {isArtistMember && !roleLoading && (
            <div className="mt-5 rounded-xl border border-[var(--pf-orange)]/20 bg-[var(--pf-orange)]/5 p-4">
              <p className="text-sm font-medium text-[var(--pf-text)]">
                Promote products to your audience
              </p>
              <p className="mt-1 text-xs text-[var(--pf-text-secondary)]">
                Share the product link from any live product card. Track activity from your dashboard.
              </p>
            </div>
          )}
        </div>

        {/* Search + Filter */}
        <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
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
                    ? 'border-[var(--pf-orange)] bg-[var(--pf-orange)] text-[#111111]'
                    : 'border-[var(--pf-border)] bg-[var(--pf-surface)] text-[var(--pf-text-secondary)] hover:text-[var(--pf-text)]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* LIVE PRODUCTS SECTION */}
        {filteredLive.length > 0 && (
          <section className="mb-10">
            <div className="mb-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-emerald-500/20" />
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                <Play size={12} />
                Live Now — Available to Purchase
              </span>
              <div className="h-px flex-1 bg-emerald-500/20" />
            </div>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" data-tour-id="store-products-grid">
              {filteredLive.map((product) => (
                <StoreProductCard
                  key={product.id}
                  product={product}
                  referralHandle={referralHandle}
                  userRole={userRole}
                />
              ))}
            </div>
          </section>
        )}

        {/* PREVIEW PRODUCTS SECTION */}
        {filteredPreview.length > 0 && (
          <section className="mb-10">
            <div className="mb-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-[var(--pf-border)]/60" />
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--pf-text-muted)]">
                <Eye size={12} />
                Preview — Coming Soon
              </span>
              <div className="h-px flex-1 bg-[var(--pf-border)]/60" />
            </div>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredPreview.map((product) => (
                <StoreProductCard
                  key={product.id}
                  product={product}
                  referralHandle={referralHandle}
                  userRole={userRole}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {filteredLive.length === 0 && filteredPreview.length === 0 && (
          <div className="rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-10 text-center">
            <Sparkles className="mx-auto mb-3 text-[var(--pf-text-muted)]" size={24} />
            <p className="text-base font-semibold">No products found</p>
            <p className="mt-2 text-sm text-[var(--pf-text-secondary)]">Try a different search term or clear the category filter.</p>
          </div>
        )}

        {/* Admin hint */}
        {isAdmin && !roleLoading && (
          <div className="mt-8 rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-4 text-center">
            <p className="text-sm text-[var(--pf-text-secondary)]">
              Founder view:{' '}
              <Link href="/dashboard/founder" className="text-[var(--pf-orange)] hover:underline font-medium">
                Manage products →
              </Link>
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
