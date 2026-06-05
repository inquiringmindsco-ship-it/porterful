'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useSupabase } from '@/app/providers'
import { ArrowLeft, Eye, EyeOff, Package, Search, ToggleLeft, ToggleRight } from 'lucide-react'
import { Product, isPurchasable } from '@/lib/products'

type CatalogProduct = Product & {
  publicVisible: boolean
  storeVisible: boolean
  purchasable: boolean
  visibilityStatus: 'live' | 'preview' | 'unavailable' | 'hidden' | 'controlled'
  salePrice?: number
}

function statusTone(status: CatalogProduct['visibilityStatus']) {
  if (status === 'controlled' || status === 'live') return 'text-emerald-300 border-emerald-400/20 bg-emerald-500/10'
  if (status === 'preview') return 'text-[var(--pf-text-muted)] border-[var(--pf-border)] bg-[var(--pf-surface)]'
  if (status === 'unavailable') return 'text-amber-300 border-amber-400/20 bg-amber-500/10'
  return 'text-red-300 border-red-400/20 bg-red-500/10'
}

export default function FounderProductsPage() {
  const router = useRouter()
  const { user, supabase, loading: authLoading } = useSupabase()
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | CatalogProduct['visibilityStatus']>('all')

  useEffect(() => {
    async function loadProducts() {
      if (authLoading) return
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || (profile.role !== 'founder' && profile.role !== 'admin')) {
        router.push('/dashboard')
        return
      }

      const res = await fetch('/api/products?scope=admin&limit=500', {
        cache: 'no-store',
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(data.error || 'Failed to load products')
      } else {
        setProducts(Array.isArray(data.products) ? data.products : [])
      }

      setLoading(false)
    }

    loadProducts()
  }, [authLoading, router, supabase, user])

  async function updateVisibility(product: CatalogProduct, patch: Partial<Pick<CatalogProduct, 'publicVisible' | 'storeVisible' | 'purchasable'>> & { preset?: string }) {
    setSaving((prev) => ({ ...prev, [product.id]: true }))
    setError('')
    setNotice('')

    try {
      const res = await fetch('/api/product-visibility', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          productId: product.id,
          ...patch,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update visibility')
      }

      if (data.product) {
        setProducts((prev) => prev.map((entry) => entry.id === product.id ? { ...entry, ...data.product } : entry))
      } else {
        await reloadProducts()
      }

      setNotice(`${product.name} updated.`)
      window.setTimeout(() => setNotice(''), 2500)
    } catch (err: any) {
      setError(err.message || 'Failed to update product')
    } finally {
      setSaving((prev) => ({ ...prev, [product.id]: false }))
    }
  }

  async function reloadProducts() {
    const res = await fetch('/api/products?scope=admin&limit=500', { cache: 'no-store' })
    const data = await res.json().catch(() => ({}))
    if (res.ok && Array.isArray(data.products)) {
      setProducts(data.products)
    }
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        !search ||
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.artist.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase()) ||
        String(product.skuCode || '').toLowerCase().includes(search.toLowerCase())

      const matchesFilter = filter === 'all' || product.visibilityStatus === filter
      return matchesSearch && matchesFilter
    })
  }, [products, search, filter])

  const counts = useMemo(() => ({
    live: products.filter((product) => product.visibilityStatus === 'live' || product.visibilityStatus === 'controlled').length,
    preview: products.filter((product) => product.visibilityStatus === 'preview').length,
    unavailable: products.filter((product) => product.visibilityStatus === 'unavailable').length,
    hidden: products.filter((product) => product.visibilityStatus === 'hidden').length,
    controlled: products.filter((product) => product.visibilityStatus === 'controlled').length,
  }), [products])

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-32">
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <div className="h-8 bg-[var(--pf-surface)] rounded-xl animate-pulse mb-6" />
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-56 bg-[var(--pf-surface)] rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-32 overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-5 sm:px-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/founder" className="p-2 rounded-lg hover:bg-[var(--pf-surface)] transition-colors">
            <ArrowLeft size={20} className="text-[var(--pf-text-secondary)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Product Visibility</h1>
            <p className="text-sm text-[var(--pf-text-secondary)]">
              Control what shows publicly, what stays in the store, and what can be purchased.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300">
            {error}
          </div>
        )}

        {notice && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-300">
            {notice}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <Stat label="Live" value={counts.live} tone="emerald" />
          <Stat label="Controlled" value={counts.controlled} tone="emerald" />
          <Stat label="Preview" value={counts.preview} tone="muted" />
          <Stat label="Unavailable" value={counts.unavailable} tone="amber" />
          <Stat label="Hidden" value={counts.hidden} tone="red" />
        </div>

        <div className="flex flex-col lg:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--pf-text-muted)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products, artists, or SKUs..."
              className="w-full rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)] pl-9 pr-4 py-3 text-sm focus:border-[var(--pf-orange)] focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(['all', 'controlled', 'live', 'preview', 'unavailable', 'hidden'] as const).map((value) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${
                  filter === value
                    ? 'bg-[var(--pf-orange)] text-white'
                    : 'border border-[var(--pf-border)] bg-[var(--pf-surface)] text-[var(--pf-text-secondary)]'
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredProducts.map((product) => {
            const canGoLive = product.visibilityStatus === 'controlled'
              || product.visibilityStatus === 'live'
              || product.purchasable
              || product.available === true
            return (
              <div key={product.id} className="rounded-[24px] border border-[var(--pf-border)] bg-[var(--pf-surface)] p-4 md:p-5">
                <div className="flex flex-col gap-4 lg:flex-row">
                  <div className="relative h-48 w-full overflow-hidden rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-bg)] lg:h-44 lg:w-44 lg:shrink-0">
                    <Image src={product.image} alt={product.name} fill sizes="176px" className="object-cover" />
                  </div>

                  <div className="min-w-0 flex-1 space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] ${statusTone(product.visibilityStatus)}`}>
                            {product.visibilityStatus}
                          </span>
                          {product.skuCode && (
                            <span className="rounded-full border border-[var(--pf-border)] bg-[var(--pf-bg)] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--pf-text-muted)]">
                              {product.skuCode}
                            </span>
                          )}
                        </div>
                        <h2 className="text-xl font-bold text-white">{product.name}</h2>
                        <p className="text-sm text-[var(--pf-text-secondary)]">
                          {product.artist} • {product.category} • ${Number(product.price || 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-[0.18em] text-[var(--pf-text-muted)]">Visibility</p>
                        <p className="mt-1 text-sm font-semibold text-white">
                          {product.publicVisible ? 'Public' : 'Private'} / {product.storeVisible ? 'Store' : 'Hidden'} / {product.purchasable ? 'Purchasable' : 'Not purchasable'}
                        </p>
                      </div>
                    </div>

                    {product.description && (
                      <p className="max-w-3xl text-sm leading-relaxed text-[var(--pf-text-secondary)]">
                        {product.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => updateVisibility(product, {
                          publicVisible: !product.publicVisible,
                          storeVisible: product.storeVisible,
                          purchasable: product.purchasable,
                        })}
                        disabled={saving[product.id]}
                        className="inline-flex items-center gap-2 rounded-xl border border-[var(--pf-border)] bg-[var(--pf-bg)] px-3 py-2 text-sm font-medium text-[var(--pf-text)] transition-colors hover:border-[var(--pf-orange)]/40"
                      >
                        {product.publicVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                        Public: {product.publicVisible ? 'On' : 'Off'}
                      </button>
                      <button
                        type="button"
                        onClick={() => updateVisibility(product, {
                          publicVisible: product.publicVisible,
                          storeVisible: !product.storeVisible,
                          purchasable: product.purchasable,
                        })}
                        disabled={saving[product.id]}
                        className="inline-flex items-center gap-2 rounded-xl border border-[var(--pf-border)] bg-[var(--pf-bg)] px-3 py-2 text-sm font-medium text-[var(--pf-text)] transition-colors hover:border-[var(--pf-orange)]/40"
                      >
                        {product.storeVisible ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                        Store Visible: {product.storeVisible ? 'On' : 'Off'}
                      </button>
                      <button
                        type="button"
                        onClick={() => updateVisibility(product, {
                          publicVisible: product.publicVisible,
                          storeVisible: product.storeVisible,
                          purchasable: !product.purchasable,
                        })}
                        disabled={saving[product.id] || !canGoLive && !product.purchasable}
                        className="inline-flex items-center gap-2 rounded-xl border border-[var(--pf-border)] bg-[var(--pf-bg)] px-3 py-2 text-sm font-medium text-[var(--pf-text)] transition-colors hover:border-[var(--pf-orange)]/40 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Package size={14} />
                        Purchasable: {product.purchasable ? 'On' : 'Off'}
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 border-t border-[var(--pf-border)] pt-4">
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--pf-text-muted)]">Set state</span>
                      {[
                        { label: 'Live', preset: 'live' },
                        { label: 'Controlled', preset: 'controlled' },
                        { label: 'Preview', preset: 'preview' },
                        { label: 'Unavailable', preset: 'unavailable' },
                        { label: 'Hidden', preset: 'hidden' },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => updateVisibility(product, { preset: preset.preset })}
                          disabled={saving[product.id] || ((preset.preset === 'live' || preset.preset === 'controlled') && !(product.purchasable || product.available))}
                          className="rounded-lg border border-[var(--pf-border)] bg-[var(--pf-surface)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--pf-text-secondary)] transition-colors hover:border-[var(--pf-orange)]/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {preset.label}
                        </button>
                      ))}
                      {saving[product.id] && (
                        <span className="text-xs text-[var(--pf-text-muted)]">Saving...</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, tone }: { label: string; value: number; tone: 'emerald' | 'muted' | 'amber' | 'red' }) {
  const classes = {
    emerald: 'border-emerald-400/20 bg-emerald-500/10 text-emerald-300',
    muted: 'border-[var(--pf-border)] bg-[var(--pf-surface)] text-[var(--pf-text-muted)]',
    amber: 'border-amber-400/20 bg-amber-500/10 text-amber-300',
    red: 'border-red-400/20 bg-red-500/10 text-red-300',
  }

  return (
    <div className={`rounded-2xl border px-4 py-3 ${classes[tone]}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] opacity-80">{label}</p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
    </div>
  )
}
