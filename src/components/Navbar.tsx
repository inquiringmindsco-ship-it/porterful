'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useSupabase } from '@/app/providers'
import { useTheme } from '@/lib/theme-context'
import { useWallet } from '@/lib/wallet-context'
import { Menu, X, User, LogOut, Upload, Sun, Moon, DollarSign } from 'lucide-react'

export function Navbar() {
  const { user, supabase } = useSupabase()
  const { theme, toggleTheme } = useTheme()
  const { balance, formatBalance: formatWalletBalance } = useWallet()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  // Handle scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const toggleMobile = () => {
    console.log('Toggle mobile menu:', !mobileOpen)
    setMobileOpen(!mobileOpen)
  }
  
  const closeMobile = () => setMobileOpen(false)

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all ${
        scrolled ? 'bg-[var(--pf-bg)]/95 backdrop-blur-md border-b border-[var(--pf-border)]' : 'bg-transparent'
      }`}>
        <div className="pf-container">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--pf-orange)] to-[var(--pf-orange-dark)] flex items-center justify-center shadow-lg shadow-[var(--pf-orange)]/20">
                <svg viewBox="0 0 200 200" fill="none" className="w-6 h-6">
                  <rect x="55" y="45" width="15" height="110" rx="4" fill="white" />
                  <rect x="78" y="60" width="55" height="12" rx="3" fill="white" />
                  <rect x="78" y="82" width="40" height="12" rx="3" fill="white" />
                  <rect x="78" y="104" width="55" height="12" rx="3" fill="white" />
                  <rect x="78" y="126" width="28" height="12" rx="3" fill="white" />
                </svg>
              </div>
              <span className="hidden sm:block font-bold text-xl">PORTERFUL</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              <Link href="/marketplace" className="px-4 py-2 rounded-lg text-[var(--pf-text-secondary)] hover:text-white hover:bg-[var(--pf-surface)] transition-all">Shop</Link>
              <Link href="/digital" className="px-4 py-2 rounded-lg text-[var(--pf-text-secondary)] hover:text-white hover:bg-[var(--pf-surface)] transition-all">Music</Link>
              <Link href="/radio" className="px-4 py-2 rounded-lg text-[var(--pf-text-secondary)] hover:text-white hover:bg-[var(--pf-surface)] transition-all">Radio</Link>
              <Link href="/playlists" className="px-4 py-2 rounded-lg text-[var(--pf-text-secondary)] hover:text-white hover:bg-[var(--pf-surface)] transition-all">Playlists</Link>
              {user && <Link href="/dashboard/upload" className="px-4 py-2 rounded-lg bg-[var(--pf-orange)] text-white hover:bg-[var(--pf-orange-light)] transition-all">Upload</Link>}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2 md:gap-3">
              <Link href="/wallet" className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--pf-surface)] border border-[var(--pf-border)] hover:border-[var(--pf-orange)] transition-colors">
                <DollarSign className="text-[var(--pf-orange)]" size={18} />
                <span className="font-medium">{formatWalletBalance()}</span>
              </Link>
              
              <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-[var(--pf-surface)] transition-colors">
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              {user ? (
                <div className="hidden md:block relative">
                  <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--pf-surface)] border border-[var(--pf-border)] hover:border-[var(--pf-orange)]">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--pf-orange)] to-purple-600 flex items-center justify-center text-white text-sm font-semibold">{user.email?.[0].toUpperCase()}</div>
                    <span className="hidden lg:block text-sm">{user.email?.split('@')[0]}</span>
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-xl shadow-xl overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-[var(--pf-border)]"><p className="text-sm font-medium truncate">{user.email}</p></div>
                      <div className="py-1">
                        <Link href="/dashboard/artist" className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--pf-text-secondary)] hover:bg-[var(--pf-bg)] hover:text-white" onClick={() => setProfileOpen(false)}><User size={16} /> Dashboard</Link>
                        <Link href="/dashboard/upload" className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--pf-orange)] hover:bg-[var(--pf-bg)]" onClick={() => setProfileOpen(false)}><Upload size={16} /> Upload Music</Link>
                      </div>
                      <div className="border-t border-[var(--pf-border)] py-1">
                        <button onClick={handleSignOut} className="flex items-center gap-2 px-4 py-2 w-full text-sm text-[var(--pf-text-secondary)] hover:bg-[var(--pf-bg)] hover:text-red-400"><LogOut size={16} /> Sign Out</button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link href="/login" className="px-4 py-2 text-[var(--pf-text-secondary)] hover:text-white">Sign In</Link>
                  <Link href="/signup" className="pf-btn pf-btn-primary">Get Started</Link>
                </div>
              )}

              {/* Mobile Toggle - Always visible */}
              <button onClick={toggleMobile} className="p-2 rounded-lg hover:bg-[var(--pf-surface)] transition-colors touch-manipulation" aria-label="Toggle menu">
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu - Always in DOM, controlled by state */}
      <div 
        className={`fixed left-0 right-0 bottom-0 z-[100] bg-[var(--pf-bg)] overflow-y-auto transition-all duration-300 ${
          mobileOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'
        }`}
        style={{ top: '64px' }}
      >
        <div className="p-4 space-y-2">
          {/* Wallet */}
          <Link href="/wallet" className="flex items-center gap-3 px-4 py-4 bg-[var(--pf-orange)]/10 rounded-xl text-[var(--pf-orange)] font-medium" onClick={closeMobile}>
            <DollarSign size={20} />
            <span>Wallet: {formatWalletBalance()}</span>
          </Link>

          {/* Nav Links */}
          <div className="pt-2 space-y-1">
            <Link href="/marketplace" className="flex items-center gap-3 px-4 py-4 text-[var(--pf-text-secondary)] hover:text-white hover:bg-[var(--pf-surface)] rounded-xl transition-colors" onClick={closeMobile}>
              <span className="text-xl">🛒</span> Shop
            </Link>
            <Link href="/digital" className="flex items-center gap-3 px-4 py-4 text-[var(--pf-text-secondary)] hover:text-white hover:bg-[var(--pf-surface)] rounded-xl transition-colors" onClick={closeMobile}>
              <span className="text-xl">🎵</span> Music
            </Link>
            <Link href="/radio" className="flex items-center gap-3 px-4 py-4 text-[var(--pf-text-secondary)] hover:text-white hover:bg-[var(--pf-surface)] rounded-xl transition-colors" onClick={closeMobile}>
              <span className="text-xl">📻</span> Radio
            </Link>
            <Link href="/playlists" className="flex items-center gap-3 px-4 py-4 text-[var(--pf-text-secondary)] hover:text-white hover:bg-[var(--pf-surface)] rounded-xl transition-colors" onClick={closeMobile}>
              <span className="text-xl">📋</span> Playlists
            </Link>
            <Link href="/artist/od-porter" className="flex items-center gap-3 px-4 py-4 text-[var(--pf-text-secondary)] hover:text-white hover:bg-[var(--pf-surface)] rounded-xl transition-colors" onClick={closeMobile}>
              <span className="text-xl">🎤</span> Artist Profile
            </Link>
          </div>

          {/* Divider */}
          <div className="border-t border-[var(--pf-border)] my-2" />

          {/* User Actions */}
          {user ? (
            <div className="space-y-1">
              <Link href="/dashboard/artist" className="flex items-center gap-3 px-4 py-4 text-[var(--pf-text-secondary)] hover:text-white hover:bg-[var(--pf-surface)] rounded-xl transition-colors" onClick={closeMobile}>
                <User size={20} /> Dashboard
              </Link>
              <Link href="/dashboard/upload" className="flex items-center gap-3 px-4 py-4 text-[var(--pf-orange)] font-medium hover:bg-[var(--pf-orange)]/10 rounded-xl transition-colors" onClick={closeMobile}>
                <Upload size={20} /> Upload Music
              </Link>
              <Link href="/settings" className="flex items-center gap-3 px-4 py-4 text-[var(--pf-text-secondary)] hover:text-white hover:bg-[var(--pf-surface)] rounded-xl transition-colors" onClick={closeMobile}>
                ⚙️ Settings
              </Link>
              <button onClick={() => { handleSignOut(); closeMobile(); }} className="flex items-center gap-3 px-4 py-4 w-full text-left text-red-400 hover:bg-[var(--pf-surface)] rounded-xl transition-colors">
                <LogOut size={20} /> Sign Out
              </button>
            </div>
          ) : (
            <div className="space-y-2 pt-2">
              <Link href="/login" className="flex items-center justify-center px-4 py-4 text-[var(--pf-text-secondary)] hover:text-white border border-[var(--pf-border)] rounded-xl transition-colors" onClick={closeMobile}>
                Sign In
              </Link>
              <Link href="/signup" className="flex items-center justify-center px-4 py-4 bg-[var(--pf-orange)] text-white rounded-xl font-medium" onClick={closeMobile}>
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}