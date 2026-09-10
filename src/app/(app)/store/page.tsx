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
import {
  BRANDS,
  PUBLIC_BRANDS,
  PUBLIC_STORE_PRODUCTS,
  isPurchasable,
  type Product,
  getProductGallery,
  requiresSizeSelection,
} from '@/lib/products'

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

function normalizeStoreRole(value: unknown): UserRole {
  if (value === 'artist' || value === 'founder' || value === 'admin' || value === 'member' || value === 'listener') {
    return value
  }

  if (value === 'superfan') {
    return 'member'
  }

  return null
}

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

    const metadataRole = normalizeStoreRole((user.user_metadata as { role?: unknown } | undefined)?.role)
    if (metadataRole) {
      setRole(metadataRole)
    }

    let cancelled = false
    supabase
      ?.from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return
        setRole(normalizeStoreRole(data?.role) || metadataRole || 'listener')
        setLoading(false)
      }, () => {
        if (cancelled) return
        setRole(metadataRole || 'listener')
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [user, supabase])

  return { role, loading }
}

function ProductBadge({ product }: { product: Product }) {
  const purchasable = product.purchasable ?? isPurchasable(product)
  const controlled = product.visibilityStatus === 'controlled'
    || product.fulfillmentType === 'img_fulfillment'
    || product.fulfillment === 'img_fulfillment'

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

function BrandMark({
  brand,
  size = 'md',
}: {
  brand: (typeof BRANDS)[number]
  size?: 'sm' | 'md' | 'lg'
}) {
  const containerClass =
    size === 'lg'
      ? 'h-14 w-14 rounded-2xl'
      : size === 'sm'
        ? 'h-10 w-10 rounded-xl'
        : 'h-12 w-12 rounded-xl'

  return (
    <div className={`relative shrink-0 overflow-hidden border border-[var(--pf-border)] bg-[var(--pf-bg)] ${containerClass}`}>
      {brand.logo ? (
        <Image
          src={brand.logo}
          alt={`${brand.name} logo`}
          fill
          sizes={size === 'lg' ? '56px' : size === 'sm' ? '40px' : '48px'}
          className="object-contain p-1.5"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs font-bold uppercase tracking-[0.2em] text-[var(--pf-text-muted)]">
          {brand.name.slice(0, 2)}
        </div>
      )}
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
  const purchasable = product.purchasable ?? isPurchasable(product)
  const isControlled = product.visibilityStatus === 'controlled'
    || product.fulfillmentType === 'img_fulfillment'
    || product.fulfillment === 'img_fulfillment'
  const needsSize = requiresSizeSelection(product)
  const detailsHref = `/product/${product.id}`

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
      showToast('Checkout failed. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/product/${product.id}`
    const shareData = { title: product.name, text: `Check out ${product.name} by ${product.artist}`, url }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
        return
      }

      await navigator.clipboard.writeText(url)
      showToast('Product link copied. Share it from your dashboard.', 'success')
    } catch (error) {
      console.error('Share error:', error)
      showToast('Could not share this product right now.', 'error')
    }
  }

  // Determine CTA set based on role + product state
  const isAdmin = userRole === 'admin' || userRole === 'founder'
  const isArtistOrMember = userRole === 'artist' || userRole === 'member'
  const canQuickBuy = purchasable && !needsSize
  const gallery = getProductGallery(product)

  return (
    <article
      data-contrast-surface
      className={`group relative overflow-hidden rounded-[28px] border transition-all duration-300 ${
        purchasable
          ? 'border-[var(--pf-border)] bg-[var(--pf-surface)] shadow-[0_18px_60px_rgba(0,0,0,0.12)] hover:-translate-y-1 hover:border-[var(--pf-orange)]/40 hover:shadow-[0_24px_70px_rgba(0,0,0,0.16)]'
          : 'border-[var(--pf-border)] bg-[var(--pf-surface)] shadow-[0_14px_45px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:border-[var(--pf-orange)]/30'
      }`}
      data-tour-id={product.skuCode === 'COMING-HOME-TEE-001' ? 'controlled-merch-card' : undefined}
    >
      <Link href={detailsHref} className="block">
        {/* Image */}
        <div className="relative aspect-[4/5] overflow-hidden bg-[var(--pf-bg-secondary)]">
          <Image
            src={gallery[0] || product.image}
            alt={product.name}
            fill
            className={`object-cover transition-transform duration-300 group-hover:scale-105 ${
              !purchasable ? 'grayscale-[20%]' : ''
            }`}
          />
          <div className={`absolute inset-0 ${!purchasable ? 'bg-gradient-to-b from-black/10 via-black/20 to-black/60' : 'bg-gradient-to-t from-black/45 via-black/10 to-transparent'}`} />
          {purchasable && (
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" />
          )}
          <ProductBadge product={product} />
        </div>

        {/* Content */}
        <div className="space-y-4 p-5 pb-4">
          {/* Category + Title + Price */}
          <div>
            <div className="mb-1 flex items-center justify-between gap-2">
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
              <div className="space-y-1">
                <h2 data-contrast-text className="text-[1.05rem] font-semibold leading-tight text-[var(--pf-text)]">{product.name}</h2>
                <p className="max-w-[18ch] text-xs leading-relaxed text-[var(--pf-text-secondary)]">
                  {purchasable ? 'Available now as a controlled drop.' : 'Preview only. Not live yet.'}
                </p>
              </div>
              <span className={`shrink-0 rounded-2xl px-3 py-2 text-sm font-bold ${
                purchasable
                  ? 'bg-[var(--pf-orange)]/12 text-[var(--pf-orange)]'
                  : 'bg-[var(--pf-bg)] text-[var(--pf-text-muted)]'
              }`}>
                ${product.price.toFixed(2)}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--pf-text-secondary)]">
              {product.description}
            </p>
          </div>
        </div>
      </Link>

      {/* Artist attribution */}
      <div className="flex flex-wrap items-center gap-2 px-5 text-xs text-[var(--pf-text-muted)]">
          <span className="inline-flex items-center gap-1 rounded-full border border-[var(--pf-border)] bg-[var(--pf-bg)] px-2.5 py-1.5">
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
      <div className="flex flex-col gap-2 px-5 pb-5 pt-4">
        {canQuickBuy && (
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

        {purchasable && needsSize && (
          <Link
            href={detailsHref}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--pf-orange)] px-4 py-3 text-sm font-semibold text-[#111111] transition-all hover:brightness-110 active:scale-[0.98]"
          >
            Choose Size
            <ArrowRight size={16} />
          </Link>
        )}

        {!purchasable && (
          <Link
            href={detailsHref}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3 text-sm font-semibold text-[var(--pf-text-muted)] transition-colors hover:border-[var(--pf-orange)]/35 hover:text-[var(--pf-text)]"
          >
            <Clock size={16} />
            Preview — Not Available Yet
          </Link>
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
            href="/dashboard/founder/skus"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--pf-border)] bg-[var(--pf-bg)] px-4 py-2.5 text-sm font-medium text-[var(--pf-text)] transition-colors hover:border-[var(--pf-orange)]/40 hover:bg-[var(--pf-orange)]/5"
          >
            <Settings size={14} />
            Manage Product
          </Link>
        )}
      </div>
    </article>
  )
}

export default function StorePage() {
  const searchParams = useSearchParams()
  const queryRef = normalizeReferralHandle(searchParams.get('ref'))
  const { user } = useSupabase()
  const { role: userRole, loading: roleLoading } = useUserRole()
  const authMetadataRole = normalizeStoreRole((user?.user_metadata as { role?: unknown } | undefined)?.role)
  const effectiveUserRole = userRole && userRole !== 'listener' ? userRole : authMetadataRole

  const [referralHandle, setReferralHandle] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [catalogProducts, setCatalogProducts] = useState<Product[]>(PUBLIC_STORE_PRODUCTS)

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

  useEffect(() => {
    let cancelled = false

    async function loadCatalog() {
      try {
        const res = await fetch('/api/products?scope=store&limit=200', {
          cache: 'no-store',
        })
        const data = await res.json().catch(() => ({}))
        if (!cancelled && res.ok && Array.isArray(data.products)) {
          setCatalogProducts(data.products)
        }
      } catch (error) {
        console.error('[store] failed to load catalog', error)
      }
    }

    loadCatalog()

    return () => {
      cancelled = true
    }
  }, [])

  // Separate live from preview
  const visibleCatalog = catalogProducts.length > 0 ? catalogProducts : PUBLIC_STORE_PRODUCTS
  const liveProducts = useMemo(() => visibleCatalog.filter((p) => (p.purchasable ?? isPurchasable(p))), [visibleCatalog])
  const previewProducts = useMemo(() => visibleCatalog.filter((p) => !(p.purchasable ?? isPurchasable(p))), [visibleCatalog])

  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(visibleCatalog.map((product) => product.category)))]
  }, [visibleCatalog])

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
  const isArtistMember = effectiveUserRole === 'artist' || effectiveUserRole === 'member'
  const isAdmin = effectiveUserRole === 'admin' || effectiveUserRole === 'founder'

  return (
    <main className="min-h-screen bg-[var(--pf-bg)] pt-20 pb-16">
      <div className="pf-container max-w-6xl">
        {/* Curated storefront hero */}
        <section data-contrast-surface className="relative mb-10 overflow-hidden rounded-[36px] border border-[var(--pf-border)] bg-[var(--pf-surface)] shadow-[0_30px_90px_rgba(0,0,0,0.12)]">
          <div className="grid items-center lg:grid-cols-[1.05fr_0.95fr]">
            <div className="relative z-10 px-7 py-10 sm:px-12 sm:py-14 lg:pr-4">
              <div className="mb-6 flex items-center gap-3">
                <BrandMark brand={PUBLIC_BRANDS[0]} size="lg" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--pf-orange)]">Noble Naturals on Porterful</p>
                  <p className="mt-1 text-sm text-[var(--pf-text-muted)]">Wellness &amp; hair care</p>
                </div>
              </div>
              <h1 data-contrast-text className="max-w-xl text-4xl font-semibold tracking-[-0.045em] text-[var(--pf-text)] sm:text-6xl sm:leading-[1.02]">
                Care, made intentional.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-[var(--pf-text-secondary)] sm:text-lg">
                A focused collection of natural hair-care essentials, presented directly by an independent founding brand.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a href="#noble-collection" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--pf-text)] px-5 py-3 text-sm font-semibold text-[var(--pf-bg)] transition-transform hover:-translate-y-0.5">
                  Explore the collection
                  <ArrowRight size={16} />
                </a>
                <Link href="/brands/noble-naturals" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--pf-border)] px-5 py-3 text-sm font-semibold text-[var(--pf-text)] transition-colors hover:border-[var(--pf-orange)]/50">
                  About Noble Naturals
                </Link>
              </div>
              {isArtistMember && !roleLoading && (
                <p className="mt-6 text-xs text-[var(--pf-text-muted)]">Share any available product from its product page and track activity in your dashboard.</p>
              )}
            </div>
            <div className="relative min-h-[340px] overflow-hidden bg-[linear-gradient(145deg,#f7f3ea,#e9dfce)] sm:min-h-[460px] lg:h-full">
              <Image src="/images/products/noble-naturals-2oz.png" alt="Noble Naturals premium hair growth oil" fill priority className="object-contain p-8 sm:p-12" sizes="(max-width: 1024px) 100vw, 46vw" />
              <div className="absolute bottom-5 left-5 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-xs font-medium text-[#1b1b1b] shadow-sm backdrop-blur-md">
                Founding brand · Coming soon
              </div>
            </div>
          </div>
        </section>

        {/* Search + Filter */}
        <div id="noble-collection" className="mb-8 scroll-mt-24">
          <div className="mb-5 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--pf-orange)]">The collection</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-[var(--pf-text)] sm:text-3xl">Noble Naturals essentials</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--pf-text-secondary)]">Three thoughtfully selected products. Availability is shown clearly on every item.</p>
          </div>
          <div className="relative max-w-xl">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--pf-text-muted)]" size={16} />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search products…"
              className="w-full rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)] py-3 pl-11 pr-4 text-sm text-[var(--pf-text)] outline-none transition-colors placeholder:text-[var(--pf-text-muted)] focus:border-[var(--pf-orange)]/50"
            />
          </div>

          <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
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
                  userRole={effectiveUserRole}
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
            <div className="mb-4 rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)]/70 p-4 text-sm text-[var(--pf-text-secondary)]">
              Preview products are visible for context only. They are not live yet and cannot be purchased.
            </div>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredPreview.map((product) => (
                <StoreProductCard
                  key={product.id}
                  product={product}
                  referralHandle={referralHandle}
                  userRole={effectiveUserRole}
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
