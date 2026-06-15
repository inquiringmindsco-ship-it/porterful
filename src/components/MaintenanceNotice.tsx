'use client'

import Link from 'next/link'
import { RotateCcw } from 'lucide-react'

interface MaintenanceNoticeProps {
  onRetry?: () => void
}

export function MaintenanceNotice({ onRetry }: MaintenanceNoticeProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry()
      return
    }

    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-[#070707] text-white flex flex-col">
      <header className="px-6 pt-6">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(249,115,22,0.22))] shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
            <span className="text-lg font-semibold text-white">P</span>
          </div>
          <div className="text-left">
            <p className="text-[10px] uppercase tracking-[0.32em] text-white/50">Porterful</p>
            <p className="text-sm font-medium text-white/90">System update</p>
          </div>
        </Link>
      </header>

      <main className="flex-1 px-6 py-10 md:py-16 flex items-center justify-center">
        <div className="w-full max-w-2xl rounded-[32px] border border-white/10 bg-white/[0.03] px-6 py-8 md:px-10 md:py-12 shadow-2xl backdrop-blur-sm">
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(249,115,22,0.28)] bg-[rgba(249,115,22,0.08)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--pf-orange)]">
            Porterful is currently undergoing a system upgrade.
          </div>

          <h1 className="mt-6 text-3xl md:text-5xl font-semibold tracking-tight text-white">
            We’re improving platform performance, artist tools, and creator experiences.
          </h1>

          <p className="mt-4 text-base md:text-lg text-white/72 leading-relaxed max-w-xl">
            Some features may be temporarily unavailable while maintenance is completed.
          </p>

          <div className="mt-8 rounded-3xl border border-white/8 bg-black/30 p-5 md:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-white/45">What we’re working on</p>
            <ul className="mt-4 space-y-3 text-sm md:text-base text-white/78">
              <li>Platform performance improvements</li>
              <li>Artist dashboard enhancements</li>
              <li>Storefront updates</li>
              <li>Music discovery improvements</li>
              <li>Reliability upgrades</li>
            </ul>
          </div>

          <p className="mt-6 text-sm text-white/60">
            We expect normal service to return shortly. Thank you for your patience while we complete upgrades.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--pf-orange)] px-6 py-3 text-sm font-semibold text-[#111111] transition-colors hover:bg-[var(--pf-orange-dark)]"
            >
              Return Home
            </Link>
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-[rgba(249,115,22,0.35)] hover:bg-white/[0.07]"
            >
              <RotateCcw size={16} />
              Check Back Soon
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
