'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
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
  const [loaded, setLoaded] = useState(false)
  const supportAmounts = [1, 5, 10]

  useEffect(() => {
    setLoaded(true)
  }, [])

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
        {supportAmounts.map((amount, index) => (
          <button
            key={amount}
            type="button"
            onClick={() => setSelectedAmount(amount)}
            className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition-all duration-200 ease-out ${
              selectedAmount === amount
                ? 'border-[var(--pf-orange)] bg-[var(--pf-orange)] text-[#111111]'
                : 'border-[var(--pf-border)] bg-[var(--pf-bg)] text-[var(--pf-text-secondary)] hover:border-[var(--pf-orange)] hover:text-[var(--pf-text)]'
            } ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`}
            style={{ transitionDelay: `${index * 60}ms` }}
          >
            ${amount}
          </button>
        ))}
      </div>

      <button
        onClick={handleSupport}
        disabled={loading}
        className={`mb-3 flex items-center gap-3 rounded-xl bg-gradient-to-r from-[var(--pf-orange)] to-[var(--pf-orange-light)] p-4 text-left text-[#111111] transition-all duration-200 ease-out hover:scale-[1.03] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 ${
          loaded
            ? 'opacity-100 shadow-[0_14px_30px_-18px_rgba(198,167,94,0.62)]'
            : 'opacity-95 shadow-[0_0_0_1px_rgba(198,167,94,0.14)]'
        }`}
      >
        <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center shrink-0">
          <Heart size={20} className="text-[#111111]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-base">{loading ? 'Processing…' : `Support $${selectedAmount}`}</p>
          <p className="text-sm text-[#111111]/70">Direct support for {artist.name.split(' ')[0]}</p>
        </div>
        <Heart size={16} className="text-[#111111]/60 transition-colors shrink-0" />
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
          <div className="w-9 h-9 rounded-lg bg-[var(--pf-orange)]/10 flex items-center justify-center shrink-0">
            <Share2 size={18} className="text-[var(--pf-orange)]" />
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
