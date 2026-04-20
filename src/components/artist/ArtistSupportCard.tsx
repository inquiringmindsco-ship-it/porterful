'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Heart, ShoppingBag, Share2 } from 'lucide-react'

interface ArtistSupportCardProps {
  artist: {
    name: string
    slug: string
    image?: string
  }
}

export function ArtistSupportCard({ artist }: ArtistSupportCardProps) {
  const [selectedAmount, setSelectedAmount] = useState(5)
  const [loading, setLoading] = useState(false)
  const supportAmounts = [1, 5, 10]

  const handleSupport = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{
            id: `support-${artist.slug}-${selectedAmount}`,
            name: `Support ${artist.name}`,
            artist: artist.name,
            price: selectedAmount,
            quantity: 1,
            type: 'digital',
            image: artist.image || '/logo.svg',
          }],
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error('Support checkout error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[var(--pf-surface)] rounded-2xl p-5 border border-[var(--pf-border)] flex flex-col">
      <p className="text-base font-semibold text-[var(--pf-text)] mb-1">Support</p>
      <p className="text-xs text-[var(--pf-text-muted)] mb-4">Pick an amount and tap in.</p>

      <div className="mb-4 flex gap-2">
        {supportAmounts.map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => setSelectedAmount(amount)}
            className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
              selectedAmount === amount
                ? 'border-[var(--pf-orange)] bg-[var(--pf-orange)] text-white'
                : 'border-[var(--pf-border)] bg-[var(--pf-bg)] text-[var(--pf-text-secondary)] hover:border-[var(--pf-orange)] hover:text-[var(--pf-text)]'
            }`}
          >
            ${amount}
          </button>
        ))}
      </div>

      <button
        onClick={handleSupport}
        disabled={loading}
        className="mb-3 flex items-center gap-3 rounded-xl bg-gradient-to-r from-[var(--pf-orange)] to-orange-400 p-4 text-left text-white transition-all hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
      >
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <Heart size={20} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-base">{loading ? 'Processing…' : `Support $${selectedAmount}`}</p>
          <p className="text-sm text-white/80">Direct support for {artist.name.split(' ')[0]}</p>
        </div>
        <Heart size={16} className="text-white/60 transition-colors shrink-0" />
      </button>

      <div className="space-y-2.5">
        <Link
          href="/music"
          title="Browse tracks"
          className="flex items-center gap-3 p-4 rounded-xl bg-[var(--pf-bg)] border border-[var(--pf-border)] hover:border-[var(--pf-orange)]/50 hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-[var(--pf-orange)]/10 flex items-center justify-center shrink-0">
            <ShoppingBag size={18} className="text-[var(--pf-orange)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">Browse Music</p>
            <p className="text-xs text-[var(--pf-text-muted)]">Pick a track or album</p>
          </div>
          <Share2 size={14} className="text-[var(--pf-text-muted)] group-hover:text-[var(--pf-orange)] transition-colors shrink-0" />
        </Link>

        {/* Share */}
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: artist.name, url: window.location.href })
            } else {
              navigator.clipboard.writeText(window.location.href)
            }
          }}
          title="Copy link or share to social media"
          className="w-full flex items-center gap-3 p-4 rounded-xl bg-[var(--pf-bg)] border border-[var(--pf-border)] hover:border-[var(--pf-orange)]/50 hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all text-left cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
            <Share2 size={18} className="text-purple-500" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">Share Artist</p>
            <p className="text-xs text-[var(--pf-text-muted)]">Spread the word</p>
          </div>
        </button>
      </div>
    </div>
  )
}
