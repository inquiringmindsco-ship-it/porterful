'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingBag, Share2 } from 'lucide-react'

interface ArtistSupportCardProps {
  artist: {
    name: string
    slug: string
    verified: boolean
  }
}

export function ArtistSupportCard({ artist }: ArtistSupportCardProps) {
  const firstName = artist.name.split(' ')[0]

  return (
    <div className="bg-[var(--pf-surface)] rounded-2xl p-5 border border-[var(--pf-border)] min-h-[200px] flex flex-col">
      <p className="text-base font-semibold text-[var(--pf-text)] mb-1">Support this artist</p>
      <p className="text-xs text-[var(--pf-text-muted)] mb-4">Here&apos;s how you can help right now</p>

      <div className="space-y-2.5 flex-1">
        {/* Support Artist */}
        <Link
          href="/music"
          title="Support directly — buy tracks"
          className="flex items-center gap-3 p-5 rounded-xl bg-gradient-to-r from-[var(--pf-orange)] to-orange-400 text-white border border-[var(--pf-orange)] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Heart size={20} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-base">Support This Artist</p>
            <p className="text-sm text-white/80">Buy tracks, directly</p>
          </div>
          <Heart size={16} className="text-white/60 group-hover:text-white transition-colors shrink-0" />
        </Link>

        {/* Buy Music */}
        <Link
          href="/music"
          title="Browse and buy tracks from all artists"
          className="flex items-center gap-3 p-4 rounded-xl bg-[var(--pf-bg)] border border-[var(--pf-border)] hover:border-[var(--pf-orange)]/50 hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-[var(--pf-orange)]/10 flex items-center justify-center shrink-0">
            <ShoppingBag size={18} className="text-[var(--pf-orange)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">Buy Music</p>
            <p className="text-xs text-[var(--pf-text-muted)]">80% goes straight to {firstName}</p>
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

      {/* Direct support message */}
      <div className="mt-4 pt-4 border-t border-[var(--pf-border)]">
        <p className="text-xs text-[var(--pf-text-muted)] text-center">
          Every action here directly supports this artist
        </p>
      </div>
    </div>
  )
}
