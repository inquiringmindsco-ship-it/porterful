'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useSupabase } from '@/app/providers'
import { useCart } from '@/lib/cart-context'
import { Menu, X, ChevronDown, User, LogOut, ShoppingCart, Settings } from 'lucide-react'

export function Navbar() {
  const { user, supabase, loading } = useSupabase()
  const pathname = usePathname()
  const hideOnTapRoute = pathname.startsWith('/tap')

  const { items } = useCart()
  const cartCount = items.reduce((s, i) => s + i.quantity, 0)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    if (profileOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [profileOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false)
        setProfileOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut()
      window.location.href = '/'
    }
  }

  const dashboardHref = '/dashboard/artist'
  const dashboardLabel = 'My Dashboard'
  const isActiveLink = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  // Never render auth-dependent state until both:
  // 1. mounted=true (no SSR mismatch)
  // 2. loading=false (session state confirmed)
  // This eliminates the flash of wrong auth state
  const ready = mounted && !loading
  const showUser = ready && !!user
  const showGuest = ready && !user

  const navLinks = [
    { href: '/music', label: 'Music' },
    { href: '/artists', label: 'Artists' },
    { href: '/store', label: 'Store' },
    ...(showGuest ? [{ href: '/apply', label: 'Apply' }] : []),
  ]

  if (hideOnTapRoute) {
    return null
  }

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all ${
        scrolled ? 'bg-[var(--pf-bg)]/95 backdrop-blur-md border-b border-[var(--pf-border)]' : 'bg-[var(--pf-bg)]'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div 
                className="w-8 h-8 transition-transform group-hover:scale-105"
                style={{
                  backgroundColor: 'var(--pf-accent, #f97316)',
                  WebkitMask: 'url(/brand/porterful/porterful_official_p_recolorable_mask_black.png) center / contain no-repeat',
                  mask: 'url(/brand/porterful/porterful_official_p_recolorable_mask_black.png) center / contain no-repeat',
                }}
              />
              <span className="text-lg font-semibold tracking-tight text-[var(--pf-text)]">Porterful</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors duration-200 ease-out relative group ${
                    isActiveLink(link.href)
                      ? 'text-[var(--pf-text)]'
                      : 'text-[var(--pf-text-secondary)] hover:text-[var(--pf-text)]'
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute -bottom-1 left-0 h-0.5 transition-all duration-200 ease-out ${
                      isActiveLink(link.href) ? 'w-full bg-[var(--pf-orange)]' : 'w-0 bg-[var(--pf-orange)] group-hover:w-full'
                    }`}
                  />
                </Link>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">

              {/* Cart Icon */}
              <Link
                href="/cart"
                className="relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors duration-200 ease-out hover:bg-[var(--pf-surface)]"
                aria-label={`Cart (${cartCount} items)`}
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full border border-[var(--pf-border)] bg-[var(--pf-surface)] text-[var(--pf-text)] text-xs font-bold flex items-center justify-center">
                    {mounted ? (cartCount > 9 ? '9+' : cartCount) : '0'}
                  </span>
                )}
              </Link>

              {/* User Menu — only renders once session is confirmed */}
              {showUser && (
                <div className="hidden md:block relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 rounded-lg px-3 py-1.5 transition-colors duration-200 ease-out hover:bg-[var(--pf-surface)]"
                  >
                    <div className="w-8 h-8 rounded-full border border-[var(--pf-border)] bg-[var(--pf-surface)] flex items-center justify-center text-[var(--pf-text)] text-sm font-semibold">
                      {user.email?.[0].toUpperCase()}
                    </div>
                    <ChevronDown size={14} />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-xl shadow-xl overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-[var(--pf-border)]">
                        <p className="text-sm font-medium truncate">{user.email}</p>
                      </div>
                      <div className="py-2">
                        <Link href={dashboardHref} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--pf-text-secondary)] hover:bg-[var(--pf-surface-hover)] hover:text-[var(--pf-text)] transition-colors" onClick={() => setProfileOpen(false)}>
                          <User size={16} />
                          <span>{dashboardLabel}</span>
                        </Link>
                        <Link href="/settings/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--pf-text-secondary)] hover:bg-[var(--pf-surface-hover)] hover:text-[var(--pf-text)] transition-colors" onClick={() => setProfileOpen(false)}>
                          <Settings size={16} />
                          <span>Settings</span>
                        </Link>
                      </div>
                      <div className="border-t border-[var(--pf-border)] py-2">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-3 px-4 py-2.5 w-full text-sm text-[var(--pf-text-secondary)] hover:bg-[var(--pf-surface-hover)] hover:text-[var(--pf-text)] transition-colors"
                        >
                          <LogOut size={16} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Guest — Sign In */}
              {showGuest && (
                <div className="hidden md:flex items-center gap-2">
                  <Link href="/login" className="px-4 py-2 text-sm font-medium text-[var(--pf-text-secondary)] transition-colors duration-200 ease-out hover:text-[var(--pf-text)]">
                    Sign In
                  </Link>
                </div>
              )}

              {/* Loading skeleton — shows only while session is resolving */}
              {!ready && (
                <div className="hidden md:flex items-center gap-2">
                  <div className="h-10 w-24 rounded-lg bg-[var(--pf-surface)] animate-pulse" />
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 rounded-lg transition-colors hover:bg-[var(--pf-surface)] md:hidden"
                aria-label="Menu"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-[100] bg-[var(--pf-bg)] transition-transform duration-300 md:hidden ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div
          className="flex flex-col h-full pt-safe px-6 overflow-y-auto"
          onClick={() => setMobileOpen(false)}
        >
          <div className="flex items-center justify-between mb-6 pt-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--pf-text-muted)]">Menu</p>
              <p className="text-sm font-medium text-[var(--pf-text)]">Porterful</p>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="p-2 rounded-lg border border-[var(--pf-border)] bg-[var(--pf-surface)] text-[var(--pf-text)]"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          {/* Mobile Nav — only items NOT covered by the persistent bottom nav
              (Music / Artists / Store / Dashboard live there). */}
          {(() => {
            const bottomNavHrefs = new Set(['/music', '/artists', '/store', '/dashboard'])
            const drawerLinks = navLinks.filter(l => !bottomNavHrefs.has(l.href))
            if (drawerLinks.length === 0) return null
            return (
              <div className="space-y-1">
                {drawerLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block py-4 text-lg font-medium border-b border-[var(--pf-border)] transition-colors ${
                      isActiveLink(link.href)
                        ? 'text-[var(--pf-text)]'
                        : 'text-[var(--pf-text-secondary)] hover:text-[var(--pf-text)]'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )
          })()}

          {/* Divider */}
          <div className="border-t border-[var(--pf-border)] my-4" />

          {showUser && (
            <div className="space-y-1">
              <Link href={dashboardHref} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 py-3 text-[var(--pf-text-secondary)] hover:text-[var(--pf-text)] transition-colors">
                <User size={20} />
                <span>{dashboardLabel}</span>
              </Link>
              <Link href="/settings/settings" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 py-3 text-[var(--pf-text-secondary)] hover:text-[var(--pf-text)] transition-colors">
                <Settings size={20} />
                <span>Settings</span>
              </Link>
              <button
                onClick={() => { handleSignOut(); setMobileOpen(false); }}
                className="flex items-center gap-3 py-3 w-full text-[var(--pf-text-secondary)] hover:text-[var(--pf-text)] transition-colors"
              >
                <LogOut size={20} />
                <span>Sign Out</span>
              </button>
            </div>
          )}

          {showGuest && (
            <div className="space-y-3">
              <Link href="/login" onClick={() => setMobileOpen(false)} className="block py-4 text-center font-medium border border-[var(--pf-border)] rounded-lg">
                Sign In
              </Link>
            </div>
          )}

          {!ready && (
            <div className="space-y-3">
              <div className="h-12 rounded-lg bg-[var(--pf-surface)] animate-pulse" />
            </div>
          )}
        </div>
      </div>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-[var(--pf-bg)]/60 z-[99] md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  )
}
