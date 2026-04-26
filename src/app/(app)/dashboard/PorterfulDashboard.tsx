'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSupabase } from '@/app/providers'
import { Music, Store, Users, Settings, Home, ShoppingCart } from 'lucide-react'

interface PorterfulDashboardProps {
  serverProfileId: string
  initialProfile: any
}

const NAV_LINKS = [
  { label: 'Music', href: '/music', icon: Music },
  { label: 'Store', href: '/store', icon: Store },
  { label: 'Artists', href: '/artists', icon: Users },
  { label: 'Cart', href: '/cart', icon: ShoppingCart },
  { label: 'Settings', href: '/settings/settings', icon: Settings },
]

export default function PorterfulDashboard({ serverProfileId, initialProfile }: PorterfulDashboardProps) {
  const { supabase } = useSupabase()
  const [mounted, setMounted] = useState(false)
  const [profile, setProfile] = useState(initialProfile)

  useEffect(() => { 
    setMounted(true) 
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen pt-20">
        <div className="max-w-4xl mx-auto px-6 pt-8 space-y-4">
          <div className="h-10 bg-[var(--pf-surface)] rounded-xl animate-pulse" />
          <div className="h-24 bg-[var(--pf-surface)] rounded-xl animate-pulse" />
          <div className="h-32 bg-[var(--pf-surface)] rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--accent)] via-[var(--pf-pink)] to-[var(--pf-purple)] flex items-center justify-center">
              <span className="text-[#111111] font-bold">P</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Porterful Dashboard</h1>
              <p className="text-sm text-[var(--pf-text-muted)]">Welcome back, {profile?.name || 'Artist'}</p>
            </div>
          </div>
          
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-[var(--accent)] hover:underline"
          >
            <Home size={16} />
            Back to Homepage
          </Link>
        </div>

        {/* Quick Nav Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className="p-4 rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)] hover:border-[var(--accent)] transition-colors"
              >
                <Icon className="mb-2" size={24} style={{ color: 'var(--accent)' }} />
                <span className="font-medium">{link.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Settings CTA */}
        <div className="p-6 rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)]">
          <h2 className="text-lg font-semibold mb-2">Personalize Your Experience</h2>
          <p className="text-[var(--pf-text-muted)] mb-4">
            Customize your accent color and other preferences in Settings.
          </p>
          <Link
            href="/settings/settings"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-[#111111] transition-all hover:scale-[1.03]"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <Settings size={18} />
            Open Settings
          </Link>
        </div>

        {/* Account Info */}
        <div className="mt-8 p-6 rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)]">
          <h2 className="text-lg font-semibold mb-4">Account</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--pf-text-muted)]">Email</span>
              <span>{profile?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--pf-text-muted)]">Role</span>
              <span className="capitalize">{profile?.role || 'Supporter'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
