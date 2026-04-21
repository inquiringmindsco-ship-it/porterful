'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useSupabase } from '@/app/providers'
import { useCart } from '@/lib/cart-context'
import { useTheme } from '@/lib/theme-context'
import { Menu, X, ChevronDown, User, LogOut, ShoppingCart, Moon, SunMedium, Palette } from 'lucide-react'
import { THEMES } from '@/lib/theme'
import type { Theme } from '@/lib/theme'

export function Navbar() {
  const { user, supabase, loading } = useSupabase()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { items } = useCart()
  const cartCount = items.reduce((s, i) => s + i.quantity, 0)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const themeRef = useRef<HTMLDivElement>(null)

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
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setThemeOpen(false)
      }
    }
    if (profileOpen || themeOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [profileOpen, themeOpen])

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut()
      window.location.href = '/'
    }
  }

  const isLikenessSurface =
    pathname === '/dashboard' ||
    pathname.startsWith('/dashboard/likeness') ||
    pathname.startsWith('/dashboard/access') ||
    pathname.startsWith('/dashboard/payout') ||
    pathname.startsWith('/signal') ||
    pathname.startsWith('/tap-in') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/verify')

  const navLinks = isLikenessSurface
    ? [
        { href: '/register', label: 'Register' },
        { href: '/dashboard', label: 'Verify' },
        { href: '/signal', label: 'Signal' },
        { href: '/dashboard/access', label: 'Access' },
      ]
    : [
        { href: '/store', label: 'Shop' },
        { href: '/artists', label: 'Artists' },
        { href: '/music', label: 'Music' },
        { href: '/support', label: 'Support' },
      ]
  const themeLabel = theme === 'creator' ? 'Creator' : theme === 'dark' ? 'Dark' : 'Light'
  const ThemeIcon = theme === 'creator' ? Palette : theme === 'dark' ? Moon : SunMedium
  const themeOptions: Array<{ value: Theme; label: string }> = THEMES.map((value) => ({
    value,
    label: value === 'creator' ? 'Creator' : value === 'dark' ? 'Dark' : 'Light',
  }))
  const brandLabel = isLikenessSurface ? 'Likeness™' : 'Porterful'
  const brandLetter = isLikenessSurface ? 'L' : 'P'
  const dashboardHref = isLikenessSurface ? '/dashboard' : '/dashboard/artist'
  const dashboardLabel = isLikenessSurface ? 'Dashboard' : 'My Dashboard'

  // Never render auth-dependent state until both:
  // 1. mounted=true (no SSR mismatch)
  // 2. loading=false (session state confirmed)
  // This eliminates the flash of wrong auth state
  const ready = mounted && !loading
  const showUser = ready && !!user
  const showGuest = ready && !user

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all ${
        scrolled ? 'bg-[var(--pf-bg)]/95 backdrop-blur-md border-b border-[var(--pf-border)]' : 'bg-[var(--pf-bg)]'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-lg bg-[var(--pf-orange)] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <span className="text-[#111111] font-bold text-sm">{brandLetter}</span>
              </div>
              <span className="font-semibold text-lg tracking-tight hidden sm:block">{brandLabel}</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-[var(--pf-text-secondary)] transition-colors duration-200 ease-out relative group hover:text-[var(--pf-orange)]"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-[var(--pf-orange)] transition-all duration-200 ease-out group-hover:w-full" />
                </Link>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">

              {/* Cart Icon */}
              {!isLikenessSurface && (
                <Link
                  href="/cart"
                  className="relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors duration-200 ease-out hover:bg-[var(--pf-surface)]"
                  aria-label={`Cart (${cartCount} items)`}
                >
                  <ShoppingCart size={20} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[var(--pf-orange)] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {mounted ? (cartCount > 9 ? '9+' : cartCount) : '0'}
                    </span>
                  )}
                </Link>
              )}

              <div className="relative hidden md:block" ref={themeRef}>
                <button
                  onClick={() => setThemeOpen(prev => !prev)}
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 transition-colors duration-200 ease-out hover:bg-[var(--pf-surface)]"
                  aria-label={`Theme: ${themeLabel}`}
                  aria-haspopup="menu"
                  aria-expanded={themeOpen}
                >
                  <ThemeIcon size={18} />
                  <span className="hidden lg:inline text-sm font-medium">{themeLabel}</span>
                  <ChevronDown size={14} />
                </button>

                {themeOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-xl shadow-xl overflow-hidden z-50">
                    {themeOptions.map(option => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setTheme(option.value)
                          setThemeOpen(false)
                        }}
                        className={`flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                          theme === option.value
                            ? 'bg-[var(--pf-surface-hover)] text-[var(--pf-text)]'
                            : 'text-[var(--pf-text-secondary)] hover:bg-[var(--pf-bg)] hover:text-[var(--pf-text)]'
                        }`}
                      >
                        <span>{option.label}</span>
                        {theme === option.value && <span className="text-[var(--pf-orange)]">•</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* User Menu — only renders once session is confirmed */}
              {showUser && (
                <div className="hidden md:block relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 rounded-lg px-3 py-1.5 transition-colors duration-200 ease-out hover:bg-[var(--pf-surface)]"
                  >
                    <div className="w-8 h-8 rounded-full bg-[var(--pf-orange)] flex items-center justify-center text-[#111111] text-sm font-semibold">
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
                        <Link href={dashboardHref} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[var(--pf-bg)] transition-colors" onClick={() => setProfileOpen(false)}>
                          <User size={16} />
                          <span>{dashboardLabel}</span>
                        </Link>
                      </div>
                      <div className="border-t border-[var(--pf-border)] py-2">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-3 px-4 py-2.5 w-full text-sm text-red-400 hover:bg-[var(--pf-bg)] transition-colors"
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
                className="p-2 md:hidden"
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
        <div className="flex flex-col h-full pt-20 px-6">

          {/* Mobile Nav Links */}
          <div className="space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block py-4 text-lg font-medium text-[var(--pf-text-secondary)] hover:text-[var(--pf-orange)] border-b border-[var(--pf-border)]"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/cart"
              onClick={() => setMobileOpen(false)}
                className="block py-4 text-lg font-medium text-[var(--pf-text-secondary)] hover:text-[var(--pf-orange)] border-b border-[var(--pf-border)] flex items-center justify-between"
              >
              Cart
              {cartCount > 0 && (
                <span className="bg-[var(--pf-orange)] text-white text-sm font-bold px-2 py-0.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Divider */}
          <div className="border-t border-[var(--pf-border)] my-4" />

          {/* User Section */}
          <div className="py-3 border-b border-[var(--pf-border)]">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--pf-text-muted)]">
              Theme
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {themeOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => {
                    setTheme(option.value)
                    setMobileOpen(false)
                  }}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    theme === option.value
                    ? 'border-transparent bg-[var(--pf-orange)] text-[#111111]'
                      : 'border-[var(--pf-border)] text-[var(--pf-text-secondary)] hover:border-[var(--pf-orange)] hover:text-[var(--pf-text)]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {showUser && (
            <div className="space-y-1">
              <Link href={dashboardHref} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 py-3 text-[var(--pf-text-secondary)]">
                <User size={20} />
                <span>{dashboardLabel}</span>
              </Link>
              <button
                onClick={() => { handleSignOut(); setMobileOpen(false); }}
                className="flex items-center gap-3 py-3 w-full text-red-400"
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
          className="fixed inset-0 bg-black/50 z-[99] md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  )
}
