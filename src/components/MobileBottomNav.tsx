'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, Music, Store, Users } from 'lucide-react'
import { useAudio } from '@/lib/audio-context'

// Approximate height of GlobalPlayer's mini bar (controls row + progress
// strip + 1px top border). When the player is present we sit above it
// so tap targets don't overlap.
const PLAYER_OFFSET_PX = 96

const ITEMS = [
  { href: '/music', label: 'Music', icon: Music },
  { href: '/artists', label: 'Artists', icon: Users },
  { href: '/store', label: 'Store', icon: Store },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
]

function isActiveRoute(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(href + '/')
}

export function MobileBottomNav() {
  const pathname = usePathname() || '/'
  const { currentTrack } = useAudio()
  const hasPlayer = !!currentTrack

  // Hide on tap routes (existing convention) so the nav doesn't bleed into
  // standalone tap-in flows.
  if (pathname.startsWith('/tap')) return null

  return (
    <nav
      aria-label="Primary"
      className="fixed left-0 right-0 z-40 md:hidden bg-[var(--pf-bg)] border-t border-[var(--pf-border)]"
      style={{
        bottom: hasPlayer ? `${PLAYER_OFFSET_PX}px` : 0,
        paddingBottom: hasPlayer ? 0 : 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <ul className="flex items-stretch">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActiveRoute(pathname, href)
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition-colors ${
                  active
                    ? 'text-[var(--pf-orange)]'
                    : 'text-[var(--pf-text-secondary)] hover:text-[var(--pf-text)]'
                }`}
              >
                <Icon size={20} aria-hidden />
                <span>{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
