'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  Loader2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { FEATURED_PRODUCTS } from '@/lib/products'

type OfferCardState = {
  creating: boolean
  offerLink: string | null
  copied: boolean
  error: string
}

function CatalogCard({ product }: { product: (typeof FEATURED_PRODUCTS)[number] }) {
  const [state, setState] = useState<OfferCardState>({
    creating: false,
    offerLink: null,
    copied: false,
    error: '',
  })

  const handleCreateOffer = async () => {
    setState((prev) => ({ ...prev, creating: true, error: '' }))

    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create offer')
      }

      setState({
        creating: false,
        offerLink: data.offer_url || data.offer_link || null,
        copied: false,
        error: '',
      })

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          'porterful_recent_offer',
          JSON.stringify({
            offerId: data.offer_id,
            offerLink: data.offer_url || data.offer_link || null,
            productId: product.id,
            productName: product.name,
            createdAt: Date.now(),
          })
        )
      }
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        creating: false,
        error: error?.message || 'Failed to create offer',
      }))
    }
  }

  const handleCopy = async () => {
    if (!state.offerLink) return
    await navigator.clipboard.writeText(state.offerLink)
    setState((prev) => ({ ...prev, copied: true }))
    window.setTimeout(() => {
      setState((prev) => ({ ...prev, copied: false }))
    }, 1500)
  }

  return (
    <div className="pf-card overflow-hidden border border-[var(--pf-border)] hover:border-[var(--pf-orange)]/40 transition-colors">
      <div className="relative aspect-square bg-gradient-to-br from-[var(--pf-orange)]/10 to-purple-500/10">
        <Image src={product.image} alt={product.name} fill className="object-cover" />
        {product.featured && (
          <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-black/60 text-white text-xs font-medium backdrop-blur">
            Featured
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--pf-text-muted)] mb-1">
            {product.category}
          </p>
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-bold text-base leading-tight">{product.name}</h3>
            <span className="shrink-0 text-[var(--pf-orange)] font-bold">${product.price}</span>
          </div>
          <p className="mt-2 text-sm text-[var(--pf-text-secondary)] leading-relaxed line-clamp-3">
            {product.description}
          </p>
        </div>

        {state.offerLink ? (
          <div className="space-y-2 rounded-xl border border-green-500/30 bg-green-500/5 p-3">
            <p className="flex items-center gap-2 text-sm font-medium text-green-400">
              <Check size={16} /> Offer link ready
            </p>
            <div className="flex gap-2">
              <input
                readOnly
                value={state.offerLink}
                className="min-w-0 flex-1 rounded-lg border border-[var(--pf-border)] bg-[var(--pf-bg)] px-3 py-2 text-xs font-mono text-[var(--pf-text-muted)]"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center justify-center rounded-lg bg-[var(--pf-orange)] px-3 py-2 text-white transition-colors hover:bg-[var(--pf-orange-dark)]"
                aria-label="Copy offer link"
              >
                {state.copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
            <Link
              href={state.offerLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--pf-bg)] px-3 py-2 text-sm font-medium text-[var(--pf-text)] transition-colors hover:bg-[var(--pf-surface-hover)]"
            >
              Open offer <ExternalLink size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {state.error && (
              <p className="text-sm text-red-400">{state.error}</p>
            )}
            <button
              type="button"
              onClick={handleCreateOffer}
              disabled={state.creating}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--pf-orange)] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--pf-orange-dark)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {state.creating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Create Offer
                </>
              )}
            </button>
            <p className="text-center text-xs text-[var(--pf-text-muted)]">
              Porterful manages the inventory. You choose the product, share the link, and earn.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CatalogPage() {
  return (
    <main className="min-h-screen bg-[var(--pf-bg)] pt-20 pb-16">
      <div className="pf-container max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm text-[var(--pf-text-muted)] transition-colors hover:text-[var(--pf-text)]"
            >
              <ArrowLeft size={16} />
              Back to dashboard
            </Link>
            <div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Choose Products to Sell</h1>
              <p className="mt-2 max-w-2xl text-sm text-[var(--pf-text-secondary)] sm:text-base">
                Porterful-managed products. Create an offer link, share it anywhere, and keep the flow simple.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3">
            <p className="flex items-center gap-2 text-sm font-medium text-[var(--pf-text)]">
              <ShieldCheck size={16} className="text-[var(--pf-orange)]" />
              Verification is only required to withdraw earnings.
            </p>
          </div>
        </div>

        <div className="mb-8 rounded-2xl border border-[var(--pf-border)] bg-gradient-to-r from-[var(--pf-orange)]/10 to-purple-500/10 p-4">
          <p className="text-sm text-[var(--pf-text-secondary)]">
            Browse the curated catalog below. If a product fits your audience, create the offer and share the link.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {FEATURED_PRODUCTS.map((product) => (
            <CatalogCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </main>
  )
}
