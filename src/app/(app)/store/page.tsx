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
  Home,
  Star,
} from 'lucide-react'
import { useSupabase } from '@/app/providers'
import { useToast } from '@/components/Toast'
import {
  PRODUCTS,
  isPurchasable,
  type Product,
  BRANDS,
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
      className={`group relative overflow-hidden rounded-[28px] border transition-all duration-300 ${
        purchasable
          ? 'border-[var(--pf-border)]/80 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.08),transparent_36%),linear-gradient(180deg,rgba(18,18,20,0.98),rgba(13,13,14,0.98))] shadow-[0_18px_60px_rgba(0,0,0,0.22)] hover:-translate-y-1 hover:border-[var(--pf-orange)]/40 hover:shadow-[0_24px_80px_rgba(0,0,0,0.3)]'
          : 'border-[var(--pf-border)]/55 bg-[linear-gradient(180deg,rgba(18,18,20,0.78),rgba(13,13,14,0.72))] opacity-85'
      }`}
      data-tour-id={product.skuCode === 'COMING-HOME-TEE-001' ? 'controlled-merch-card' : undefined}
    >
      <Link href={detailsHref} className="block">
        {/* Image */}
        <div className="relative aspect-[4/5] overflow-hidden bg-[var(--pf-bg)]">
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
                <h2 className="text-[1.05rem] font-bold leading-tight text-[var(--pf-text)]">{product.name}</h2>
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
  const [catalogProducts, setCatalogProducts] = useState<Product[]>(PRODUCTS)

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
  const visibleCatalog = catalogProducts.length > 0 ? catalogProducts : PRODUCTS
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
        {/* Header */}
        <div className="mb-8 rounded-[32px] border border-[var(--pf-border)]/70 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.12),transparent_34%),linear-gradient(180deg,rgba(18,18,20,0.96),rgba(11,11,12,0.96))] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.28)] sm:p-8">
          <div className="flex items-center gap-2 mb-2">
            <Package size={20} className="text-[var(--pf-orange)]" />
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--pf-orange)]">
              Porterful Store
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--pf-orange)]/20 bg-[var(--pf-orange)]/10 px-2.5 py-0.5 text-[10px] font-medium text-[var(--pf-orange)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--pf-orange)] animate-pulse" />
              Founding Beta
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl text-white">
            Shop Creator Products
          </h1>
          <p className="mt-3 max-w-2xl text-sm sm:text-base text-[var(--pf-text-secondary)] leading-relaxed">
            Products from independent creators — music, brands, and everything in between.
            <span className="text-[var(--pf-text)]"> Live products</span> can be purchased now.
            <span className="text-[var(--pf-text-muted)]"> Preview products</span> are coming soon.
          </p>

          <div className="mt-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--pf-text-muted)]">Founding Brands</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {BRANDS.filter((b) => b.foundingBrand).map((brand) => (
                <Link
                  key={brand.id}
                  href={`/brands/${brand.slug}`}
                  className="group flex items-center gap-3 rounded-2xl border border-[var(--pf-border)]/80 bg-[linear-gradient(180deg,rgba(20,20,22,0.95),rgba(12,12,13,0.92))] px-3 py-3 transition-all hover:-translate-y-0.5 hover:border-[var(--pf-orange)]/35"
                >
                  <BrandMark brand={brand} size="lg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white transition-colors group-hover:text-[var(--pf-orange)]">{brand.name}</p>
                    <p className="truncate text-xs text-[var(--pf-text-muted)]">{brand.tagline}</p>
                  </div>
                  <ArrowRight size={16} className="shrink-0 text-[var(--pf-text-muted)] transition-colors group-hover:text-[var(--pf-orange)]" />
                </Link>
              ))}
            </div>
          </div>

          {/* Coming Home Collection link */}
          <Link
            href="/collections/coming-home"
            className="mt-4 inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors hover:border-[#C4956A]/50 hover:bg-[#C4956A]/5"
            style={{ borderColor: '#C4956A30', color: '#C4956A' }}
          >
            <Home size={16} />
            Explore the Coming Home Collection™ — Products inspired by resilience and new beginnings
            <ArrowRight size={14} />
          </Link>

          {/* Noble Naturals brand announcement */}
          <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles size={16} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-400">Noble Naturals joins the Founding Beta</p>
              <p className="text-xs text-[var(--pf-text-secondary)] mt-1">
                Noble Naturals brings wellness and hair care products into the Porterful Store. 
                Natural ingredients for all hair types. <span className="text-[var(--pf-text-muted)]">Preview products coming soon.</span>
              </p>
            </div>
          </div>

          {/* Member promo box */}
          {isArtistMember && !roleLoading && (
            <div className="mt-5 rounded-xl border border-[var(--pf-orange)]/20 bg-[var(--pf-orange)]/5 p-4">
              <p className="text-sm font-medium text-[var(--pf-text)]">
                Promote this product to your audience
              </p>
              <p className="mt-1 text-xs text-[var(--pf-text-secondary)]">
                Share the product link from any live product card. Track activity from your dashboard.
              </p>
            </div>
          )}
        </div>

        {/* FEATURED BRANDS SECTION */}
        <section className="mb-12">
          <div className="mb-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--pf-orange)]/20" />
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--pf-orange)]">
              <Star size={12} />
              Featured Brands
            </span>
            <div className="h-px flex-1 bg-[var(--pf-orange)]/20" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BRANDS.filter(b => b.foundingBrand).map(brand => (
              <Link
                key={brand.id}
                href={`/brands/${brand.slug}`}
                className="group flex items-center gap-4 rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-4 transition-all hover:border-[var(--pf-orange)]/30"
              >
                <BrandMark brand={brand} size="lg" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate group-hover:text-[var(--pf-orange)] transition-colors">{brand.name}</p>
                  <p className="text-xs text-[var(--pf-text-muted)] truncate">{brand.tagline}</p>
                </div>
                <ArrowRight size={16} className="text-[var(--pf-text-muted)] group-hover:text-[var(--pf-orange)] transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </section>

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
