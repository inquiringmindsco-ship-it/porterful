'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useSupabase } from '@/app/providers'
import { Menu, X, User, LogOut, Music, ShoppingBag, Headphones, Upload } from 'lucide-react'

export function Navbar() {
  const { user, supabase } = useSupabase()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  // Handle scroll
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20)
      // Close menus on scroll
      setMobileOpen(false)
      setProfileOpen(false)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menus on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all ${
      scrolled ? 'bg-[var(--pf-bg)]/95 backdrop-blur-md border-b border-[var(--pf-border)]' : 'bg-transparent'
    }`}>
      <div className="pf-container">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group" onClick={() => { setMobileOpen(false); setProfileOpen(false) }}>
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
            <Link href="/marketplace" className="px-4 py-2 rounded-lg text-[var(--pf-text-secondary)] hover:text-white hover:bg-[var(--pf-surface)] transition-all">
              Shop
            </Link>
            <Link href="/digital" className="px-4 py-2 rounded-lg text-[var(--pf-text-secondary)] hover:text-white hover:bg-[var(--pf-surface)] transition-all">
              Music
            </Link>
            <Link href="/radio" className="px-4 py-2 rounded-lg text-[var(--pf-text-secondary)] hover:text-white hover:bg-[var(--pf-surface)] transition-all">
              Radio
            </Link>
            {user && (
              <Link href="/dashboard/upload" className="px-4 py-2 rounded-lg bg-[var(--pf-orange)] text-white hover:bg-[var(--pf-orange-light)] transition-all">
                Upload
              </Link>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative" ref={profileRef}>
                <button 
                  onClick={(e) => { e.stopPropagation(); setProfileOpen(!profileOpen) }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--pf-surface)] border border-[var(--pf-border)] hover:border-[var(--pf-orange)]"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--pf-orange)] to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                    {user.email?.[0].toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm">{user.email?.split('@')[0]}</span>
                </button>
                
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-xl shadow-xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-[var(--pf-border)]">
                      <p className="text-sm font-medium truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link href="/dashboard/artist" className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--pf-text-secondary)] hover:bg-[var(--pf-bg)] hover:text-white" onClick={() => setProfileOpen(false)}>
                        <User size={16} /> Dashboard
                      </Link>
                      <Link href="/dashboard/upload" className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--pf-orange)] hover:bg-[var(--pf-bg)]" onClick={() => setProfileOpen(false)}>
                        <Upload size={16} /> Upload Music
                      </Link>
                      <Link href="/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--pf-text-secondary)] hover:bg-[var(--pf-bg)] hover:text-white" onClick={() => setProfileOpen(false)}>
                        <User size={16} /> Settings
                      </Link>
                    </div>
                    <div className="border-t border-[var(--pf-border)] py-1">
                      <button onClick={handleSignOut} className="flex items-center gap-2 px-4 py-2 w-full text-sm text-[var(--pf-text-secondary)] hover:bg-[var(--pf-bg)] hover:text-red-400">
                        <LogOut size={16} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="px-4 py-2 text-[var(--pf-text-secondary)] hover:text-white">Sign In</Link>
                <Link href="/signup" className="pf-btn pf-btn-primary">Get Started</Link>
              </div>
            )}

            {/* Mobile Toggle */}
            <button 
              onClick={(e) => { e.stopPropagation(); setMobileOpen(!mobileOpen) }}
              className="md:hidden p-2 rounded-lg hover:bg-[var(--pf-surface)]"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-[var(--pf-border)]" ref={mobileMenuRef}>
            <div className="flex flex-col gap-1">
              <Link href="/marketplace" className="px-4 py-2 text-[var(--pf-text-secondary)] hover:text-white" onClick={() => setMobileOpen(false)}>
                Shop
              </Link>
              <Link href="/digital" className="px-4 py-2 text-[var(--pf-text-secondary)] hover:text-white" onClick={() => setMobileOpen(false)}>
                Music
              </Link>
              <Link href="/radio" className="px-4 py-2 text-[var(--pf-text-secondary)] hover:text-white" onClick={() => setMobileOpen(false)}>
                Radio
              </Link>
              {user && (
                <>
                  <div className="border-t border-[var(--pf-border)] my-2" />
                  <Link href="/dashboard/artist" className="px-4 py-2 text-[var(--pf-text-secondary)] hover:text-white" onClick={() => setMobileOpen(false)}>
                    Dashboard
                  </Link>
                  <Link href="/dashboard/upload" className="px-4 py-2 text-[var(--pf-orange)] font-medium" onClick={() => setMobileOpen(false)}>
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