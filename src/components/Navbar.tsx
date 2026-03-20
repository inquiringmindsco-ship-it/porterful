'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useSupabase } from '@/app/providers'
import { Menu, X, User, LogOut, Music, ShoppingBag, Headphones } from 'lucide-react'

export function Navbar() {
  const { user, supabase } = useSupabase()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
      // Close mobile menu on scroll
      if (mobileOpen) setMobileOpen(false)
      if (profileOpen) setProfileOpen(false)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [mobileOpen, profileOpen])

  // Close menus when clicking outside
  useEffect(() => {
    const handleClick = () => {
      setMobileOpen(false)
      setProfileOpen(false)
    }
    if (mobileOpen || profileOpen) {
      document.addEventListener('click', handleClick)
      return () => document.removeEventListener('click', handleClick)
    }
  }, [mobileOpen, profileOpen])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-[var(--pf-bg)]/95 backdrop-blur-md border-b border-[var(--pf-border)]' : 'bg-transparent'
    }`}>
      <div className="pf-container">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--pf-orange)] to-[var(--pf-orange-dark)] flex items-center justify-center shadow-lg shadow-[var(--pf-orange)]/20 group-hover:shadow-[var(--pf-orange)]/40 transition-shadow">
              <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                <rect x="55" y="45" width="15" height="110" rx="4" fill="white" />
                <rect x="78" y="60" width="55" height="12" rx="3" fill="white" />
                <rect x="78" y="82" width="40" height="12" rx="3" fill="white" />
                <rect x="78" y="104" width="55" height="12" rx="3" fill="white" />
                <rect x="78" y="126" width="28" height="12" rx="3" fill="white" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-xl tracking-tight">PORTERFUL</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/marketplace" className="flex items-center gap-2 px-4 py-2 rounded-lg text-[var(--pf-text-secondary)] hover:text-white hover:bg-[var(--pf-surface)] transition-all">
              <ShoppingBag size={18} />
              <span>Shop</span>
            </Link>
            <Link href="/digital" className="flex items-center gap-2 px-4 py-2 rounded-lg text-[var(--pf-text-secondary)] hover:text-white hover:bg-[var(--pf-surface)] transition-all">
              <Music size={18} />
              <span>Music</span>
            </Link>
            <Link href="/radio" className="flex items-center gap-2 px-4 py-2 rounded-lg text-[var(--pf-text-secondary)] hover:text-white hover:bg-[var(--pf-surface)] transition-all">
              <Headphones size={18} />
              <span>Radio</span>
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    setProfileOpen(!profileOpen)
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--pf-surface)] border border-[var(--pf-border)] hover:border-[var(--pf-orange)] transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--pf-orange)] to-[var(--pf-orange-dark)] flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user.email?.[0].toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium">{user.email?.split('@')[0]}</span>
                </button>
                
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-xl overflow-hidden shadow-xl shadow-black/20" onClick={e => e.stopPropagation()}>
                    <div className="px-4 py-3 border-b border-[var(--pf-border)]">
                      <p className="text-sm font-medium">{user.email}</p>
                      <p className="text-xs text-[var(--pf-text-muted)]">Welcome back</p>
                    </div>
                    <div className="py-2">
                      <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-[var(--pf-text-secondary)] hover:bg-[var(--pf-bg)] hover:text-white transition-colors" onClick={() => setProfileOpen(false)}>
                        <User size={16} />
                        Dashboard
                      </Link>
                      <Link href="/dashboard/upload" className="flex items-center gap-3 px-4 py-2.5 text-[var(--pf-text-secondary)] hover:bg-[var(--pf-bg)] hover:text-white transition-colors" onClick={() => setProfileOpen(false)}>
                        <Music size={16} />
                        Upload Music
                      </Link>
                      <Link href="/settings" className="flex items-center gap-3 px-4 py-2.5 text-[var(--pf-text-secondary)] hover:bg-[var(--pf-bg)] hover:text-white transition-colors" onClick={() => setProfileOpen(false)}>
                        <User size={16} />
                        Settings
                      </Link>
                    </div>
                    <div className="border-t border-[var(--pf-border)] py-2">
                      <button 
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-4 py-2.5 w-full text-left text-[var(--pf-text-secondary)] hover:bg-[var(--pf-bg)] hover:text-red-400 transition-colors"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="px-4 py-2 text-[var(--pf-text-secondary)] hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link href="/signup" className="pf-btn pf-btn-primary">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button 
              onClick={(e) => {
                e.stopPropagation()
                setMobileOpen(!mobileOpen)
              }}
              className="md:hidden p-2 rounded-lg hover:bg-[var(--pf-surface)] transition-colors"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-[var(--pf-border)]" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col gap-2">
              <Link href="/marketplace" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-[var(--pf-text-secondary)] hover:bg-[var(--pf-surface)] hover:text-white transition-colors" onClick={() => setMobileOpen(false)}>
                <ShoppingBag size={18} />
                Shop
              </Link>
              <Link href="/digital" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-[var(--pf-text-secondary)] hover:bg-[var(--pf-surface)] hover:text-white transition-colors" onClick={() => setMobileOpen(false)}>
                <Music size={18} />
                Music
              </Link>
              <Link href="/radio" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-[var(--pf-text-secondary)] hover:bg-[var(--pf-surface)] hover:text-white transition-colors" onClick={() => setMobileOpen(false)}>
                <Headphones size={18} />
                Radio
              </Link>
              {user && (
                <>
                  <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-[var(--pf-text-secondary)] hover:bg-[var(--pf-surface)] hover:text-white transition-colors" onClick={() => setMobileOpen(false)}>
                    <User size={18} />
                    Dashboard
                  </Link>
                  <Link href="/dashboard/upload" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-[var(--pf-text-secondary)] hover:bg-[var(--pf-surface)] hover:text-white transition-colors" onClick={() => setMobileOpen(false)}>
                    <Music size={18} />
                    Upload Music
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
} 
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-4 py-2.5 w-full text-left text-[var(--pf-text-secondary)] hover:bg-[var(--pf-bg)] hover:text-white transition-colors"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="px-4 py-2 text-[var(--pf-text-secondary)] hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link href="/signup" className="pf-btn pf-btn-primary">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-[var(--pf-surface)] transition-colors"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-[var(--pf-border)]">
            <div className="flex flex-col gap-1">
              <Link href="/artists" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--pf-text-secondary)] hover:bg-[var(--pf-surface)] hover:text-white transition-colors">
                <Music size={20} />
                Artists
              </Link>
              <Link href="/shop" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--pf-text-secondary)] hover:bg-[var(--pf-surface)] hover:text-white transition-colors">
                <ShoppingBag size={20} />
                Marketplace
              </Link>
              <Link href="/radio" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--pf-text-secondary)] hover:bg-[var(--pf-surface)] hover:text-white transition-colors">
                <Music size={20} />
                Radio
              </Link>
              <Link href="/trending" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--pf-text-secondary)] hover:bg-[var(--pf-surface)] hover:text-white transition-colors">
                <TrendingUp size={20} />
                Trending
              </Link>
              
              {/* Mobile CTAs */}
              <div className="mt-4 pt-4 border-t border-[var(--pf-border)] px-4">
                <p className="text-xs text-[var(--pf-text-muted)] uppercase tracking-wider mb-3">Join as</p>
                <Link href="/signup?role=artist" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[var(--pf-orange)]/10 text-[var(--pf-orange)] hover:bg-[var(--pf-orange)]/20 transition-colors mb-2">
                  <Music size={20} />
                  Artist
                </Link>
                <Link href="/signup?role=business" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors">
                  <Store size={20} />
                  Business
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}