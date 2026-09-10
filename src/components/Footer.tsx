'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Footer() {
  const pathname = usePathname()
  const hideOnTapRoute = pathname.startsWith('/tap')

  if (hideOnTapRoute) {
    return null
  }

  const links = [
    { href: '/music', label: 'Music' },
    { href: '/artists', label: 'Artists' },
    { href: '/store', label: 'Store' },
    { href: '/brands', label: 'Brands' },
    { href: '/contact', label: 'Contact' },
    { href: '/terms', label: 'Terms' },
    { href: '/privacy', label: 'Privacy' },
    { href: '/refund', label: 'Refunds' },
    { href: '/dmca', label: 'Copyright' },
  ]

  return (
    <footer className="border-t border-[var(--pf-border)] bg-[var(--pf-bg-secondary)] py-8 mt-12">
      <div className="max-w-6xl mx-auto px-6 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7"
              style={{
                backgroundColor: 'var(--pf-accent, #f97316)',
                WebkitMask: 'url(/brand/porterful/porterful_official_p_recolorable_mask_black.png) center / contain no-repeat',
                mask: 'url(/brand/porterful/porterful_official_p_recolorable_mask_black.png) center / contain no-repeat',
              }}
            />
            <span className="text-lg font-semibold text-[var(--pf-text)]">Porterful</span>
          </div>
          <p className="text-[var(--pf-text-secondary)] text-sm mt-1">
            Music. Directly from the artists.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-[var(--pf-text-secondary)] hover:text-[var(--pf-text)] transition-colors">
              {link.label}
            </Link>
          ))}
        </div>
        <div className="mt-6 pt-6 border-t border-[var(--pf-border)]/50">
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--pf-text-muted)]">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Founding Beta
            </span>
            <span className="hidden sm:inline text-[var(--pf-border)]">|</span>
            <span className="inline-flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secure Checkout
            </span>
            <span className="hidden sm:inline text-[var(--pf-border)]">|</span>
            <span className="inline-flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              IMG Fulfilled
            </span>
            <span className="hidden sm:inline text-[var(--pf-border)]">|</span>
            <span className="inline-flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Independent Creators
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
