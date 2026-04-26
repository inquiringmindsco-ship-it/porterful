'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

function isLikenessSurface(pathname: string | null) {
  if (!pathname) return false
  return (
    pathname.startsWith('/dashboard/likeness') ||
    pathname.startsWith('/dashboard/access') ||
    pathname.startsWith('/dashboard/payout') ||
    pathname.startsWith('/signal') ||
    pathname.startsWith('/tap-in') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/verify')
  )
}

export function Footer() {
  const pathname = usePathname()
  const hideOnTapRoute = pathname.startsWith('/tap')
  const likenessSurface = isLikenessSurface(pathname)

  if (hideOnTapRoute) {
    return null
  }

  const links = likenessSurface
    ? [
        { href: '/register', label: 'Register' },
        { href: '/signal', label: 'Signal' },
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/login', label: 'Sign In' },
      ]
    : [
        { href: '/music', label: 'Music' },
        { href: '/store', label: 'Store' },
        { href: '/artists', label: 'Artists' },
        { href: '/contact', label: 'Contact' },
      ]

  return (
    <footer className="border-t border-[var(--pf-border)] bg-[var(--pf-bg-secondary)] py-8 mt-12">
      <div className="max-w-6xl mx-auto px-6 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="font-bold text-lg text-[var(--pf-text)]">Porterful</h3>
          <p className="text-[var(--pf-text-secondary)] text-sm mt-1">
            Music. Directly from the artists.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-[var(--pf-text-secondary)] hover:text-[var(--pf-orange)] transition-colors">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
