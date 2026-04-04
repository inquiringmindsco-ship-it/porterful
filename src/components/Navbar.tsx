'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useSupabase } from '@/app/providers'
import { useCart } from '@/lib/cart-context'
import { Menu, X, ChevronDown, User, LogOut, ShoppingCart } from 'lucide-react'

export function Navbar() {
  const { user, supabase } = useSupabase()
  const { items } = useCart()
  const cartCount = items.reduce((s, i) => s + i.quantity, 0)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

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

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const navLinks = [
    { href: '/music', label: 'Music' },
    { href: '/marketplace', label: 'Marketplace' },
    { href: '/systems', label: 'Systems' },
    { href: '/learn', label: 'Learn' },
    { href: '/competition', label: 'Competition' },
  ]

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all ${
        scrolled ? 'bg-[var(--pf-bg)]/95 backdrop-blur-md border-b border-[var(--pf-border)]' : 'bg-[var(--pf-bg)]'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--pf-orange)] to-[var(--pf-purple)] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="font-bold text-lg tracking-tight hidden sm:block">PORTERFUL</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-[var(--pf-text-secondary)] hover:text-[var(--pf-orange)] transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--pf-orange)] group-hover:w-full transition-all" />
                </Link>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">

              {/* Cart Icon */}
              <Link
                href="/cart"
                className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-[var(--pf-surface)] transition-colors"
                aria-label={`Cart (${cartCount} items)`}
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[var(--pf-orange)] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              {user ? (
                <div className="hidden md:block relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[var(--pf-surface)] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--pf-orange)] to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
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
                        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[var(--pf-bg)] transition-colors" onClick={() => setProfileOpen(false)}>
                          <User size={16} />
                          <span>Dashboard</span>
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
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link href="/login" className="px-4 py-2 text-sm font-medium text-[var(--pf-text-secondary)] hover:text-white transition-colors">
                    Sign In
                  </Link>
                  <Link href="/apply" className="px-4 py-2 text-sm font-semibold bg-[var(--pf-orange)] text-white rounded-lg hover:bg-[var(--pf-orange-dark)] transition-colors">
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2"
                aria-label="Menu"
              >
                {mobileOpen ? (
                  <X size={22} />
                ) : (
                  <Menu size={22} />
                )}
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
          {user ? (
            <div className="space-y-1">
              <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 py-3 text-[var(--pf-text-secondary)]">
                <User size={20} />
                <span>Dashboard</span>
              </Link>
              <button
                onClick={() => { handleSignOut(); setMobileOpen(false); }}
                className="flex items-center gap-3 py-3 w-full text-red-400"
              >
                <LogOut size={20} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <Link href="/login" onClick={() => setMobileOpen(false)} className="block py-4 text-center font-medium border border-[var(--pf-border)] rounded-lg">
                Sign In
              </Link>
              <Link href="/apply" onClick={() => setMobileOpen(false)} className="block py-4 text-center font-semibold bg-[var(--pf-orange)] text-white rounded-lg">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Overlay for mobile menu */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[99] md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  )
}
