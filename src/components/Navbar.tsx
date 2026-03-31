'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useSupabase } from '@/app/providers'
import { useTheme } from '@/lib/theme-context'
import { useWallet } from '@/lib/wallet-context'
import { ArtistSearch } from '@/components/ArtistSearch'
import { Search, Menu, X, ChevronDown, User, Upload, LogOut, LayoutDashboard } from 'lucide-react'

export function Navbar() {
  const { user, supabase } = useSupabase()
  const { theme, toggleTheme } = useTheme()
  const { formatBalance: formatWalletBalance } = useWallet()
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
    { href: '/marketplace', label: 'Shop' },
    { href: '/artists', label: 'Artists' },
    { href: '/digital', label: 'Music' },
    { href: '/services', label: 'Services' },
    { href: '/tap-in', label: 'Tap In' },
  ]

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all ${
        scrolled ? 'bg-[var(--pf-bg)]/95 backdrop-blur-md border-b border-[var(--pf-border)]' : 'bg-[var(--pf-bg)]'
      }`}>
        <div className="pf-container">
          <div className="flex items-center justify-between h-16 md:h-18">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--pf-orange)] to-[var(--pf-purple)] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="font-bold text-lg tracking-tight hidden sm:block">PORTERFUL</span>
            </Link>

            {/* Desktop Nav - Clean and Simple */}
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
              <Link 
                href="/challenge" 
                className="text-sm font-bold px-4 py-1.5 rounded-full bg-[var(--pf-orange)] text-white hover:bg-[var(--pf-orange-dark)] transition-colors"
              >
                $10K Challenge
              </Link>
            </div>

            {/* Search - Desktop */}
            <div className="hidden lg:block w-72">
              <ArtistSearch />
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              
              {/* Mobile Search */}
              <button className="md:hidden p-2 -mr-2">
                <Search size={20} className="text-[var(--pf-text-secondary)]" />
              </button>

              {/* Wallet - Desktop */}
              <Link href="/wallet" className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] hover:border-[var(--pf-orange)] transition-colors">
                <span className="text-sm font-medium">{formatWalletBalance()}</span>
              </Link>
              
              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme} 
                className="p-2 -mr-1 rounded-lg hover:bg-[var(--pf-surface)] transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--pf-text)]">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--pf-text)]">
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                  </svg>
                )}
              </button>
              
              {/* User Menu - Desktop */}
              {user ? (
                <div className="hidden md:block relative" ref={profileRef}>
                  <button 
                    onClick={() => setProfileOpen(!profileOpen)} 
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[var(--pf-surface)] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--pf-orange)] to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                      {user.email?.[0].toUpperCase()}
                    </div>
                    <ChevronDown size={14} className="text-[var(--pf-text-muted)]" />
                  </button>
                  
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-xl shadow-xl overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-[var(--pf-border)]">
                        <p className="text-sm font-medium truncate">{user.email}</p>
                      </div>
                      <div className="py-2">
                        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[var(--pf-bg)] transition-colors" onClick={() => setProfileOpen(false)}>
                          <LayoutDashboard size={16} className="text-[var(--pf-text-muted)]" />
                          <span>Dashboard</span>
                        </Link>
                        <Link href="/dashboard/upload" className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--pf-orange)] hover:bg-[var(--pf-bg)] transition-colors" onClick={() => setProfileOpen(false)}>
                          <Upload size={16} />
                          <span>Upload Music</span>
                        </Link>
                        <Link href={`/artist/${user.user_metadata?.username || user.email?.split('@')[0]}`} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[var(--pf-bg)] transition-colors" onClick={() => setProfileOpen(false)}>
                          <User size={16} className="text-[var(--pf-text-muted)]" />
                          <span>My Artist Page</span>
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
                className="md:hidden p-2 -mr-2"
                aria-label="Menu"
              >
                {mobileOpen ? (
                  <X size={22} className="text-[var(--pf-text)]" />
                ) : (
                  <Menu size={22} className="text-[var(--pf-text)]" />
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
              href="/challenge" 
              onClick={() => setMobileOpen(false)}
              className="block py-4 text-lg font-bold text-[var(--pf-orange)]"
            >
              $10K Challenge
            </Link>
          </div>

          {/* Divider */}
          <div className="border-t border-[var(--pf-border)] my-4" />

          {/* User Section */}
          {user ? (
            <div className="space-y-1">
              <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 py-3 text-[var(--pf-text-secondary)]">
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </Link>
              <Link href="/dashboard/upload" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 py-3 text-[var(--pf-orange)] font-medium">
                <Upload size={20} />
                <span>Upload Music</span>
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

          {/* Wallet at bottom */}
          <div className="mt-auto pb-8">
            <Link href="/wallet" onClick={() => setMobileOpen(false)} className="flex items-center justify-center gap-2 py-4 bg-[var(--pf-surface)] rounded-lg font-medium">
              Wallet: {formatWalletBalance()}
            </Link>
          </div>
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
