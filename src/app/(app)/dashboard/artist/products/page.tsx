'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Plus, Package, Eye, EyeOff, Edit2, Trash2,
  Check, AlertCircle, ExternalLink, MoreHorizontal
} from 'lucide-react'
import { useSupabase } from '@/app/providers'

interface ArtistProduct {
  id: string
  name: string
  description: string | null
  category: string
  base_price: number
  images: string[]
  status: 'draft' | 'live' | 'archived'
  printful_product_id: string | null
  printful_sync_status: string | null
  artist_name: string | null
  created_at: string
}

const STATUS_LABELS = {
  live: { label: 'Live', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
  draft: { label: 'Draft', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  archived: { label: 'Archived', className: 'bg-[var(--pf-bg)] text-[var(--pf-text-muted)] border-[var(--pf-border)]' },
}

const CATEGORY_LABELS: Record<string, string> = {
  apparel: 'Apparel',
  accessories: 'Accessories',
  art: 'Art',
  music: 'Music',
  tech: 'Tech',
  home: 'Home & Living',
  other: 'Other',
}

export default function ArtistProductsPage() {
  const { user, supabase, loading: authLoading } = useSupabase()
  const [products, setProducts] = useState<ArtistProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    if (!user) return
    try {
      const res = await fetch(`/api/products?mine=1`, {
        headers: { Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products || [])
      }
    } catch (err) {
      console.error('Fetch products error:', err)
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    if (!authLoading) fetchProducts()
  }, [authLoading, fetchProducts])

  const toggleStatus = async (product: ArtistProduct) => {
    const newStatus: 'draft' | 'live' | 'archived' =
      product.status === 'live' ? 'draft' : product.status === 'draft' ? 'live' : 'archived'
    if (newStatus === 'archived') return // Don't auto-archive

    setActionLoading(product.id)
    try {
      const res = await fetch(`/api/products/${product.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: newStatus } : p))
      }
    } catch (err) {
      console.error('Toggle status error:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const deleteProduct = async (product: ArtistProduct) => {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return
    setActionLoading(product.id)
    try {
      const res = await fetch(`/api/products/${product.id}`, { method: 'DELETE' })
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== product.id))
      }
    } catch (err) {
      console.error('Delete error:', err)
    } finally {
      setActionLoading(null)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-20 pb-24 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[var(--pf-orange)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const liveCount = products.filter(p => p.status === 'live').length
  const draftCount = products.filter(p => p.status === 'draft').length

  return (
    <div className="min-h-screen pt-20 pb-24 bg-[var(--pf-bg)]">
      <div className="pf-container max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">My Products</h1>
            <p className="text-sm text-[var(--pf-text-muted)] mt-1">
              {products.length === 0
                ? 'No products yet — add your first one'
                : `${liveCount} live · ${draftCount} draft`}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard/artist"
              className="px-4 py-2 border border-[var(--pf-border)] rounded-lg font-medium hover:border-[var(--pf-orange)] transition-colors text-sm"
            >
              ← Back to Dashboard
            </Link>
            <Link
              href="/dashboard/artist/add-product"
              className="px-4 py-2 bg-[var(--pf-orange)] text-white rounded-lg font-medium hover:bg-[var(--pf-orange-dark)] transition-colors text-sm flex items-center gap-2"
            >
              <Plus size={16} /> Add Product
            </Link>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {products.length === 0 && (
          <div className="bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--pf-orange)]/10 flex items-center justify-center mx-auto mb-4">
              <Package size={28} className="text-[var(--pf-orange)]" />
            </div>
            <h2 className="text-xl font-bold mb-2">No products yet</h2>
            <p className="text-[var(--pf-text-secondary)] mb-6 max-w-sm mx-auto">
              Create your first merch product and start earning. Upload artwork, set your price, connect Printful.
            </p>
            <Link
              href="/dashboard/artist/add-product"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--pf-orange)] text-white rounded-xl font-medium hover:bg-[var(--pf-orange-dark)] transition-colors"
            >
              <Plus size={18} /> Add Your First Product
            </Link>
          </div>
        )}

        {/* Products list */}
        {products.length > 0 && (
          <div className="space-y-4">
            {products.map(product => {
              const statusInfo = STATUS_LABELS[product.status]
              return (
                <div
                  key={product.id}
                  className="bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-2xl p-4 hover:border-[var(--pf-orange)]/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* Image */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-[var(--pf-bg)] shrink-0">
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          width={80}
                          height={80}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={24} className="text-[var(--pf-text-muted)]" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{product.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusInfo.className}`}>
                          {statusInfo.label}
                        </span>
                        {product.printful_product_id && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            Printful
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-[var(--pf-text-muted)]">
                        <span>{CATEGORY_LABELS[product.category] || product.category}</span>
                        <span>·</span>
                        <span className="font-medium text-[var(--pf-text)]">${product.base_price?.toFixed(2)}</span>
                        {product.images?.length > 0 && (
                          <>
                            <span>·</span>
                            <span>{product.images.length} image{product.images.length !== 1 ? 's' : ''}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Toggle live/draft */}
                      {product.status !== 'archived' && (
                        <button
                          onClick={() => toggleStatus(product)}
                          disabled={actionLoading === product.id}
                          className="p-2 rounded-lg hover:bg-[var(--pf-bg)] transition-colors disabled:opacity-50"
                          title={product.status === 'live' ? 'Unpublish' : 'Publish'}
                        >
                          {actionLoading === product.id ? (
                            <div className="w-4 h-4 border-2 border-[var(--pf-orange)] border-t-transparent rounded-full animate-spin" />
                          ) : product.status === 'live' ? (
                            <EyeOff size={16} className="text-[var(--pf-text-muted)]" />
                          ) : (
                            <Eye size={16} className="text-[var(--pf-orange)]" />
                          )}
                        </button>
                      )}

                      {/* Edit */}
                      <Link
                        href={`/dashboard/artist/edit-product/${product.id}`}
                        className="p-2 rounded-lg hover:bg-[var(--pf-bg)] transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} className="text-[var(--pf-text-muted)]" />
                      </Link>

                      {/* Delete */}
                      <button
                        onClick={() => deleteProduct(product)}
                        disabled={actionLoading === product.id}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}
