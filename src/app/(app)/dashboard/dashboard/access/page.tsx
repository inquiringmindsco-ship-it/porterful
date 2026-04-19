'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { label: 'My Vault', href: '/dashboard' },
  { label: 'Social', href: '/dashboard/dashboard/likeness' },
  { label: 'Access', href: '/dashboard/dashboard/access' },
]

const PLATFORMS = [
  {
    name: 'Porterful',
    tags: ['Sell', 'Create'],
    cta: { label: 'Open', href: '/dashboard/dashboard/catalog' },
    status: null,
  },
  {
    name: 'CreditKlimb',
    tags: ['Offer Access'],
    cta: null,
    status: 'Coming Soon',
  },
  {
    name: 'Land System',
    tags: ['Offer Access'],
    cta: null,
    status: 'Coming Soon',
  },
  {
    name: 'Daily Supply',
    tags: ['Essentials'],
    cta: null,
    status: 'Coming Soon',
  },
]

export default function AccessPage() {
  const pathname = usePathname()

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-3xl mx-auto px-6">

        {/* Tab Nav */}
        <nav className="flex gap-1 mb-8 border-b border-[var(--pf-border)]">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                pathname === n.href
                  ? 'border-[var(--pf-orange)] text-[var(--pf-text)]'
                  : 'border-transparent text-[var(--pf-text-muted)] hover:text-[var(--pf-text)]'
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <h1 className="text-xl font-bold mb-6">Access</h1>

        <div className="grid gap-3 sm:grid-cols-2">
          {PLATFORMS.map((p) => (
            <div
              key={p.name}
              className="border border-[var(--pf-border)] rounded-2xl p-5 flex flex-col gap-4"
            >
              <div>
                <p className="font-bold mb-2">{p.name}</p>
                <div className="flex flex-wrap gap-1.5">
                  {p.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-medium px-2 py-0.5 bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {p.status ? (
                <span className="text-xs font-semibold text-[var(--pf-text-muted)]">{p.status}</span>
              ) : p.cta ? (
                <Link
                  href={p.cta.href}
                  className="self-start inline-flex items-center gap-2 px-4 py-2 bg-[var(--pf-orange)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--pf-orange-dark)] transition-colors"
                >
                  {p.cta.label}
                </Link>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
