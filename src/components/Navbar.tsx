'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useSupabase } from '@/app/providers'
import { useTheme } from '@/lib/theme-context'
import { useWallet } from '@/lib/wallet-context'
import { ArtistSearch } from '@/components/ArtistSearch'
import { Search } from 'lucide-react'
import { Trophy } from 'lucide-react'

// Custom Porterful Icons
const PorterfulIcon = ({ name, size = 24, className = '' }: { name: string; size?: number; className?: string }) => {
  const icons: Record<string, JSX.Element> = {
    // Music - stylized music note with P
    music: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
        <path d="M9 9l12-2" opacity="0.5" />
      </svg>
    ),
    // Shop - shopping bag with P handle
    shop: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
        <circle cx="12" cy="10" r="1" fill="currentColor" />
      </svg>
    ),
    // Radio - broadcast waves with P
    radio: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="2" />
        <path d="M16.24 7.76a6 6 0 010 8.49m-8.48-.01a6 6 0 010-8.49" />
        <path d="M19.07 4.93a10 10 0 010 14.14M4.93 19.07a10 10 0 010-14.14" />
      </svg>
    ),
    // Playlist - stacked bars with P
    playlist: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
        <circle cx="3" cy="6" r="1" fill="currentColor" />
        <circle cx="3" cy="12" r="1" fill="currentColor" />
      </svg>
    ),
    // Artist - mic with P wave
    artist: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
        <path d="M19 10v2a7 7 0 01-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
        <path d="M19 3l-2 2m2-2l2 2" opacity="0.5" />
      </svg>
    ),
    // Trophy - for challenge
    trophy: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M6 9H4.5a2.5 2.5 0 010-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 000-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
        <path d="M18 2H6v7a6 6 0 0012 0V2z" />
      </svg>
    ),
    // Upload - arrow up with P
    upload: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="17,8 12,3 7,8" />
        <line x1="12" y1="3" x2="12" y2="15" />
        <circle cx="12" cy="3" r="1" fill="currentColor" />
      </svg>
    ),
    // Wallet - dollar sign with P border
    wallet: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
        <path d="M12 16v-4m0 0l-2 2m2-2l2 2" />
      </svg>
    ),
    // Dashboard - grid with P
    dashboard: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <circle cx="6.5" cy="6.5" r="1.5" fill="currentColor" />
      </svg>
    ),
    // Heart - for fans/support
    heart: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
      </svg>
    ),
    // Star - for featured
    star: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
      </svg>
    ),
    // Cart - shopping cart with P
    cart: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
        <path d="M16 6l-4 4" opacity="0.5" />
      </svg>
    ),
    // Play - for audio
    play: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polygon points="5,3 19,12 5,21" />
      </svg>
    ),
    // Pause - for audio
    pause: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" />
        <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" />
      </svg>
    ),
    // Earnings - dollar sign with growth arrow
    earnings: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        <path d="M8 19l4 4 4-4" opacity="0.5" />
      </svg>
    ),
    // Shirt - for merch
    shirt: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z" />
      </svg>
    ),
    // Vinyl - for albums
    vinyl: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2a10 10 0 0110 10" opacity="0.5" />
      </svg>
    ),
    // Resources - app grid with dots
    resources: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="2" y="2" width="9" height="9" rx="2" />
        <rect x="13" y="2" width="9" height="9" rx="2" />
        <rect x="2" y="13" width="9" height="9" rx="2" />
        <rect x="13" y="13" width="9" height="9" rx="2" />
      </svg>
    ),
  }

  return icons[name] || <span>?</span>
}

export function Navbar() {
  const { user, supabase } = useSupabase()
  const { theme, toggleTheme } = useTheme()
  const { balance, formatBalance: formatWalletBalance } = useWallet()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const toggleMobile = () => setMobileOpen(!mobileOpen)
  const closeMobile = () => setMobileOpen(false)

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all ${
        scrolled ? 'bg-[var(--pf-bg)]/95 backdrop-blur-md border-b border-[var(--pf-border)]' : 'bg-transparent'
      }`}>
        <div className="pf-container">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo - Always visible */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--pf-orange)] to-[var(--pf-purple)] flex items-center justify-center shadow-lg">
                <svg viewBox="0 0 200 200" fill="none" className="w-6 h-6">
                  <rect x="55" y="45" width="15" height="110" rx="4" fill="white" />
                  <rect x="78" y="60" width="55" height="12" rx="3" fill="white" />
                  <rect x="78" y="82" width="40" height="12" rx="3" fill="white" />
                  <rect x="78" y="104" width="55" height="12" rx="3" fill="white" />
                  <rect x="78" y="126" width="28" height="12" rx="3" fill="white" />
                </svg>
              </div>
              <span className="hidden sm:block font-bold text-xl logo-text">PORTERFUL</span>
            </Link>

            {/* Search - Center */}
            <div className="hidden lg:flex flex-1 justify-center px-8">
              <div className="w-full max-w-md">
                <ArtistSearch />
              </div>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              <Link href="/marketplace" aria-label="Shop" className="flex items-center gap-2 px-4 py-2 rounded-lg text-[var(--pf-text-secondary)] hover:text-[var(--pf-orange)] hover:bg-[var(--pf-surface)] transition-colors">
                <PorterfulIcon name="shop" size={18} />
                <span>Shop</span>
              </Link>
              <Link href="/digital" aria-label="Music" className="flex items-center gap-2 px-4 py-2 rounded-lg text-[var(--pf-text-secondary)] hover:text-[var(--pf-orange)] hover:bg-[var(--pf-surface)] transition-colors">
                <PorterfulIcon name="music" size={18} />
                <span>Music</span>
              </Link>
              <Link href="/radio" aria-label="Radio" className="flex items-center gap-2 px-4 py-2 rounded-lg text-[var(--pf-text-secondary)] hover:text-[var(--pf-orange)] hover:bg-[var(--pf-surface)] transition-colors">
                <PorterfulIcon name="radio" size={18} />
                <span>Radio</span>
              </Link>
              <Link href="/playlists" aria-label="Playlists" className="flex items-center gap-2 px-4 py-2 rounded-lg text-[var(--pf-text-secondary)] hover:text-[var(--pf-orange)] hover:bg-[var(--pf-surface)] transition-colors">
                <PorterfulIcon name="playlist" size={18} />
                <span>Playlists</span>
              </Link>
              <Link href="/resources" className="flex items-center gap-2 px-4 py-2 rounded-lg text-[var(--pf-text-secondary)] hover:text-[var(--pf-orange)] hover:bg-[var(--pf-surface)] transition-colors">
                <PorterfulIcon name="resources" size={18} />
                <span>Resources</span>
              </Link>
              <Link href="/challenge" className="flex items-center gap-2 px-4 py-2 rounded-lg text-[var(--pf-orange)] bg-[var(--pf-orange)]/10 hover:bg-[var(--pf-orange)]/20 transition-colors font-semibold">
                <PorterfulIcon name="trophy" size={18} />
                <span>$10K Challenge</span>
              </Link>
              {user && (
                <Link href="/dashboard/upload" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--pf-orange)] text-white hover:bg-[var(--pf-orange-dark)] transition-colors">
                  <PorterfulIcon name="upload" size={18} />
                  <span>Upload</span>
                </Link>
              )}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Mobile Search */}
              <button 
                onClick={() => {
                  const searchEl = document.getElementById('mobile-search');
                  if (searchEl) searchEl.classList.remove('hidden');
                  const input = document.querySelector('#mobile-search input') as HTMLInputElement;
                  if (input) input.focus();
                }}
                className="lg:hidden p-2 rounded-lg hover:bg-[var(--pf-surface)] transition-colors"
                aria-label="Search"
              >
                <Search size={20} className="text-[var(--pf-text-secondary)]" />
              </button>

              <Link href="/wallet" className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--pf-surface)] border border-[var(--pf-border)] hover:border-[var(--pf-orange)] transition-colors">
                <PorterfulIcon name="wallet" size={18} className="text-[var(--pf-orange)]" />
                <span className="font-medium text-[var(--pf-text)]">{formatWalletBalance()}</span>
              </Link>
              
              <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-[var(--pf-surface)] transition-colors">
                {theme === 'dark' ? (
                  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--pf-text)]">
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
                  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--pf-text)]">
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                  </svg>
                )}
              </button>
              
              {user ? (
                <div className="hidden md:block relative">
                  <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--pf-surface)] border border-[var(--pf-border)] hover:border-[var(--pf-orange)]">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--pf-orange)] to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                      {user.email?.[0].toUpperCase()}
                    </div>
                    <span className="hidden lg:block text-sm text-[var(--pf-text)]">{user.email?.split('@')[0]}</span>
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-xl shadow-xl overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-[var(--pf-border)]">
                        <p className="text-sm font-medium text-[var(--pf-text)] truncate">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <Link href="/dashboard/artist" className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--pf-text-secondary)] hover:bg-[var(--pf-bg)] hover:text-[var(--pf-text)]" onClick={() => setProfileOpen(false)}>
                          <PorterfulIcon name="dashboard" size={16} /> Dashboard
                        </Link>
                        <Link href="/dashboard/upload" className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--pf-orange)] hover:bg-[var(--pf-bg)]" onClick={() => setProfileOpen(false)}>
                          <PorterfulIcon name="upload" size={16} /> Upload Music
                        </Link>
                      </div>
                      <div className="border-t border-[var(--pf-border)] py-1">
                        <button onClick={handleSignOut} className="flex items-center gap-2 px-4 py-2 w-full text-sm text-[var(--pf-text-secondary)] hover:bg-[var(--pf-bg)] hover:text-red-400">
                          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16,17 21,12 16,7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link href="/login" className="px-4 py-2 text-[var(--pf-text-secondary)] hover:text-[var(--pf-text)]">Sign In</Link>
                  <Link href="/signup" className="pf-btn pf-btn-primary">Get Started</Link>
                </div>
              )}

              {/* Mobile Search Toggle */}
              <button onClick={() => setMobileSearchOpen(!mobileSearchOpen)} className="p-2 rounded-lg hover:bg-[var(--pf-surface)] transition-colors touch-manipulation md:hidden" aria-label="Search">
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--pf-text)]">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>

              {/* Mobile Toggle */}
              <button onClick={toggleMobile} className="p-2 rounded-lg hover:bg-[var(--pf-surface)] transition-colors touch-manipulation" aria-label="Toggle menu">
                {mobileOpen ? (
                  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--pf-text)]">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                ) : (
                  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--pf-text)]">
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Search Bar */}
      <div className={`fixed top-16 left-0 right-0 z-[90] bg-[var(--pf-bg)] p-4 border-b border-[var(--pf-border)] transition-all duration-300 md:hidden ${mobileSearchOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <ArtistSearch />
      </div>

      {/* Mobile Menu */}
      <div 
        className={`fixed left-0 right-0 bottom-0 z-[100] bg-[var(--pf-bg)] overflow-y-auto transition-all duration-300 ${
          mobileOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'
        }`}
        style={{ top: '80px' }}
      >
        <div className="p-4 space-y-2">
          {/* Wallet */}
          <Link href="/wallet" className="flex items-center gap-3 px-4 py-4 bg-[var(--pf-orange)]/10 rounded-xl text-[var(--pf-orange)] font-medium" onClick={closeMobile}>
            <PorterfulIcon name="wallet" size={20} />
            <span>Wallet: {formatWalletBalance()}</span>
          </Link>

          {/* Nav Links */}
          <div className="pt-2 space-y-1">
            <Link href="/marketplace" className="flex items-center gap-3 px-4 py-4 text-[var(--pf-text-secondary)] hover:text-[var(--pf-orange)] hover:bg-[var(--pf-surface)] rounded-xl transition-colors" onClick={closeMobile}>
              <PorterfulIcon name="shop" size={20} />
              <span>Shop</span>
            </Link>
            <Link href="/digital" className="flex items-center gap-3 px-4 py-4 text-[var(--pf-text-secondary)] hover:text-[var(--pf-orange)] hover:bg-[var(--pf-surface)] rounded-xl transition-colors" onClick={closeMobile}>
              <PorterfulIcon name="music" size={20} />
              <span>Music</span>
            </Link>
            <Link href="/radio" className="flex items-center gap-3 px-4 py-4 text-[var(--pf-text-secondary)] hover:text-[var(--pf-orange)] hover:bg-[var(--pf-surface)] rounded-xl transition-colors" onClick={closeMobile}>
              <PorterfulIcon name="radio" size={20} />
              <span>Radio</span>
            </Link>
            <Link href="/playlists" className="flex items-center gap-3 px-4 py-4 text-[var(--pf-text-secondary)] hover:text-[var(--pf-orange)] hover:bg-[var(--pf-surface)] rounded-xl transition-colors" onClick={closeMobile}>
              <PorterfulIcon name="playlist" size={20} />
              <span>Playlists</span>
            </Link>
            <Link href="/challenge" className="flex items-center gap-3 px-4 py-4 text-[var(--pf-orange)] bg-[var(--pf-orange)]/10 font-semibold hover:bg-[var(--pf-orange)]/20 rounded-xl transition-colors" onClick={closeMobile}>
              <PorterfulIcon name="trophy" size={20} />
              <span>$10K Challenge</span>
            </Link>
            <Link href="/artist/od-porter" className="flex items-center gap-3 px-4 py-4 text-[var(--pf-text-secondary)] hover:text-[var(--pf-orange)] hover:bg-[var(--pf-surface)] rounded-xl transition-colors" onClick={closeMobile}>
              <PorterfulIcon name="artist" size={20} />
              <span>Artist Profile</span>
            </Link>
          </div>

          {/* Divider */}
          <div className="border-t border-[var(--pf-border)] my-2" />

          {/* User Actions */}
          {user ? (
            <div className="space-y-1">
              <Link href="/dashboard/artist" className="flex items-center gap-3 px-4 py-4 text-[var(--pf-text-secondary)] hover:text-[var(--pf-orange)] hover:bg-[var(--pf-surface)] rounded-xl transition-colors" onClick={closeMobile}>
                <PorterfulIcon name="dashboard" size={20} /> Dashboard
              </Link>
              <Link href="/dashboard/upload" className="flex items-center gap-3 px-4 py-4 text-[var(--pf-orange)] font-medium hover:bg-[var(--pf-orange)]/10 rounded-xl transition-colors" onClick={closeMobile}>
                <PorterfulIcon name="upload" size={20} /> Upload Music
              </Link>
              <button onClick={() => { handleSignOut(); closeMobile(); }} className="flex items-center gap-3 px-4 py-4 w-full text-left text-red-400 hover:bg-[var(--pf-surface)] rounded-xl transition-colors">
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16,17 21,12 16,7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                Sign Out
              </button>
            </div>
          ) : (
            <div className="space-y-2 pt-2">
              <Link href="/login" className="flex items-center justify-center px-4 py-4 text-[var(--pf-text-secondary)] hover:text-[var(--pf-text)] border border-[var(--pf-border)] rounded-xl transition-colors" onClick={closeMobile}>
                Sign In
              </Link>
              <Link href="/signup" className="flex items-center justify-center px-4 py-4 bg-[var(--pf-orange)] text-white rounded-xl font-medium hover:bg-[var(--pf-orange-dark)] transition-colors" onClick={closeMobile}>
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}