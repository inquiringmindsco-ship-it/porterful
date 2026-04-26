'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSupabase } from '@/app/providers'
import { Disc, Music, Settings, Store, Upload, User } from 'lucide-react'

interface PorterfulDashboardProps {
  serverProfileId: string
  initialProfile: any
}

const PRIMARY_ACTIONS = [
  { label: 'Upload Track', href: '/dashboard/upload', icon: Upload, hint: 'Add a new track' },
  { label: 'Manage Catalog', href: '/dashboard/artist', icon: Disc, hint: 'Tracks & products' },
  { label: 'Edit Profile', href: '/dashboard/artist/edit', icon: User, hint: 'Public artist info' },
]

const SUPPORTING_LINKS = [
  { label: 'Music', href: '/music', icon: Music },
  { label: 'Store', href: '/store', icon: Store },
  { label: 'Settings', href: '/settings/settings', icon: Settings },
]

export default function PorterfulDashboard({ serverProfileId, initialProfile }: PorterfulDashboardProps) {
  // useSupabase is referenced so the provider is exercised on this surface;
  // profile data comes from props (already auth-gated server-side).
  useSupabase()
  const [mounted, setMounted] = useState(false)
  const [profile] = useState(initialProfile)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen pt-20">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 pt-8 space-y-4">
          <div className="h-10 bg-[var(--pf-surface)] rounded-xl animate-pulse" />
          <div className="h-24 bg-[var(--pf-surface)] rounded-xl animate-pulse" />
          <div className="h-32 bg-[var(--pf-surface)] rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-32">
      <div className="max-w-3xl mx-auto px-5 sm:px-6">
        {/* Header */}
        <header className="mb-7">
          <h1 className="text-2xl sm:text-3xl font-bold">Porterful Dashboard</h1>
          <p className="text-sm text-[var(--pf-text-secondary)] mt-1">
            Welcome back, {profile?.name || 'Artist'}
          </p>
        </header>

        {/* Primary actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {PRIMARY_ACTIONS.map(({ label, href, icon: Icon, hint }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 p-4 rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)] hover:border-[var(--pf-text-muted)] transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--pf-bg)] border border-[var(--pf-border)] flex items-center justify-center text-[var(--pf-text-secondary)] shrink-0">
                <Icon size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--pf-text)] truncate">{label}</p>
                <p className="text-xs text-[var(--pf-text-muted)] truncate">{hint}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Supporting links */}
        <div className="flex flex-wrap gap-2 mb-10">
          {SUPPORTING_LINKS.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-[var(--pf-border)] bg-[var(--pf-bg)] text-sm text-[var(--pf-text-secondary)] hover:text-[var(--pf-text)] hover:border-[var(--pf-text-muted)] transition-colors"
            >
              <Icon size={14} />
              {label}
            </Link>
          ))}
        </div>

        {/* Account — quiet, below */}
        <section>
          <p className="text-xs uppercase tracking-widest text-[var(--pf-text-secondary)] mb-3">Account</p>
          <div className="rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)] divide-y divide-[var(--pf-border)]">
            <div className="flex justify-between items-center text-sm px-4 py-3 gap-3">
              <span className="text-[var(--pf-text-muted)]">Email</span>
              <span className="text-[var(--pf-text)] truncate">{profile?.email}</span>
            </div>
            <div className="flex justify-between items-center text-sm px-4 py-3 gap-3">
              <span className="text-[var(--pf-text-muted)]">Role</span>
              <span className="text-[var(--pf-text)] capitalize">{profile?.role || 'Supporter'}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
