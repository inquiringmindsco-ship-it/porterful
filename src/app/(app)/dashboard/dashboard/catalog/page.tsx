'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Package, Check, ExternalLink } from 'lucide-react'
import { useSupabase } from '@/app/providers'

interface CatalogProduct {
  id: string
  name: string
  category: string
  base_price: number
  images: string[]
  description: string | null
  seller_id: string
}

const MOCK_CATALOG: CatalogProduct[] = [
  {
    id: 'catalog-1',
    name: 'Artist NFC Wristband',
    category: 'Tech',
    base_price: 15,
    images: ['https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800'],
    description: 'Physical connect tool for fans',
    seller_id: 'porterful',
  },
  {
    id: 'catalog-2',
    name: 'There It Is, Here It Go (Book)',
    category: 'Book',
    base_price: 25,
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800'],
    description: 'O D Porter memoir',
    seller_id: 'porterful',
  },
  {
    id: 'catalog-3',
    name: 'Credit Klimb',
    category: 'Service',
    base_price: 49,
    images: ['https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800'],
    description: 'Credit repair guidance system',
    seller_id: 'partner',
  },
  {
    id: 'catalog-4',
    name: 'TeachYoung',
    category: 'Education',
    base_price: 19,
    images: ['https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800'],
    description: 'Homeschool learning platform',
    seller_id: 'partner',
  },
]

export default function CatalogPage() {
  const { user, supabase, loading: authLoading } = useSupabase()
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const toggleProduct = (id: string) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
    setSaved(false)
  }

  const handleSaveSelection = async () => {
    if (!user || selectedProducts.length === 0) return
    setSaving(true)

    try {
      // For now, just mark selection - actual linking would come in phase 2
      // The selected products are Porterful-owned, so no need to create rows
      setSaved(true)
    } catch (err) {
      console.error('Save error:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleShare = (productId: string) => {
    const storeUrl = `${window.location.origin}/store/${user?.id || 'you'}?product=${productId}`
    navigator.clipboard.writeText(storeUrl)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--pf-orange)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-12 bg-[var(--pf-bg)]">
      <div className="pf-container max-w-4xl mx-auto">
        <Link
          href="/dashboard/dashboard"
          className="inline-flex items-center gap-2 text-[var(--pf-text-muted)] hover:text-white mb-6"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Product Catalog</h1>
          <p className="text-[var(--pf-text-muted)]">
            Choose products to sell. Inventory and fulfillment handled by Porterful.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {MOCK_CATALOG.map(product => {
            const isSelected = selectedProducts.includes(product.id)
            return (
              <div
                key={product.id}
                className={`pf-card p-4 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-[var(--pf-orange)] bg-[var(--pf-orange)]/5'
                    : 'hover:border-[var(--pf-border-hover)]'
                }`}
                onClick={() => toggleProduct(product.id)}
              >
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-[var(--pf-surface)]">
                    {product.images[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-sm">{product.name}</h3>
                        <span className="text-xs text-[var(--pf-text-muted)]">{product.category}</span>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[var(--pf-orange)] flex items-center justify-center flex-shrink-0">
                          <Check size={12} className="text-white" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-[var(--pf-text-muted)] mt-1 line-clamp-2">
                      {product.description}
                    </p>
                    <p className="font-bold text-sm mt-2 text-[var(--pf-orange)]">
                      ${product.base_price}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {selectedProducts.length > 0 && (
          <div className="sticky bottom-20 bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-xl p-4 flex items-center justify-between">
            <p className="text-sm">
              <span className="font-bold text-[var(--pf-orange)]">{selectedProducts.length}</span> product(s) selected
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleShare(selectedProducts[0])}
                className="px-4 py-2 rounded-lg border border-[var(--pf-border)] hover:bg-[var(--pf-bg)] transition-colors text-sm"
              >
                <ExternalLink size={16} className="inline mr-1" />
                Share Link
              </button>
              <button
                onClick={handleSaveSelection}
                disabled={saving || saved}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                  saved
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-[var(--pf-orange)] hover:bg-[var(--pf-orange-dark)] text-white'
                }`}
              >
                {saved ? 'Saved!' : saving ? 'Saving...' : 'Start Selling'}
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 p-4 bg-[var(--pf-surface)] rounded-xl border border-[var(--pf-border)]">
          <h3 className="font-semibold mb-2">How it works</h3>
          <ul className="text-sm text-[var(--pf-text-muted)] space-y-2">
            <li>✅ Choose products from Porterful's catalog</li>
            <li>✅ Share your unique link with fans</li>
            <li>✅ Fans purchase directly from Porterful</li>
            <li>✅ You earn commission on each sale</li>
            <li>❌ No inventory management needed</li>
            <li>❌ No shipping or fulfillment</li>
          </ul>
        </div>
      </div>
    </div>
  )
}