'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSupabase } from '@/app/providers'
import { Disc, Music, Settings, Store, Upload, User, Headphones, Heart, Gift, Wallet, ShieldCheck, BarChart3, Users, Inbox } from 'lucide-react'

interface PorterfulDashboardProps {
  serverProfileId: string
  initialProfile: any
}

export default function PorterfulDashboard({ serverProfileId, initialProfile }: PorterfulDashboardProps) {
  // useSupabase is referenced so the provider is exercised on this surface;
  // profile data comes from props (already auth-gated server-side).
  useSupabase()
  const [mounted, setMounted] = useState(false)
  const [profile] = useState(initialProfile)
  const role = profile?.role || 'supporter'
  const isArtist = role === 'artist'
  const isFounder = role === 'admin' || role === 'founder'

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
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold">Porterful Dashboard</h1>
            {isFounder && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-[var(--pf-orange)]/30 bg-[var(--pf-orange)]/10 text-[var(--pf-orange)] text-xs font-semibold uppercase tracking-wide">
                <ShieldCheck size={12} />
                Founder Access
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--pf-text-secondary)] mt-1">
            Welcome back, {profile?.full_name || profile?.name || (isFounder ? 'Founder' : isArtist ? 'Artist' : 'Supporter')}
          </p>
        </header>

        {/* Primary actions — role-aware */}
        <div className={`grid grid-cols-1 ${isFounder ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3'} gap-3 mb-8`}>
          {isFounder ? (
            <>
              <ActionCard label="Founder View" href="/dashboard/founder" icon={ShieldCheck} hint="Control tower for the whole platform" />
              <ActionCard label="Artist Dashboard" href="/dashboard/artist" icon={Disc} hint="Your own catalog and uploads" />
              <ActionCard label="Upload Track" href="/dashboard/upload" icon={Upload} hint="Direct Supabase upload" />
              <ActionCard label="Review Queue" href="/dashboard/dashboard/submissions" icon={Inbox} hint="Artist signups and reviews" />
            </>
          ) : isArtist ? (
            <>
              <ActionCard label="Upload Track" href="/dashboard/upload" icon={Upload} hint="Add a new track" />
              <ActionCard label="Manage Catalog" href="/dashboard/artist" icon={Disc} hint="Tracks & products" />
              <ActionCard label="Edit Artist Profile" href="/dashboard/dashboard/artist/edit" icon={User} hint="Public artist info" />
            </>
          ) : (
            <>
              <ActionCard label="My Music" href="/music" icon={Headphones} hint="Tracks you\u0027ve purchased" />
              <ActionCard label="Browse Artists" href="/artists" icon={Heart} hint="Discover new music" />
              <ActionCard label="Referral Hub" href="/superfan" icon={Gift} hint="Share & earn" />
            </>
          )}
        </div>

        {/* Supporting links */}
        <div className="flex flex-wrap gap-2 mb-10">
          <SupportLink label="Music" href="/music" icon={Music} />
          <SupportLink label="Store" href="/store" icon={Store} />
          <SupportLink label="Settings" href="/settings/settings" icon={Settings} />
          {isFounder && <SupportLink label="Founder View" href="/dashboard/founder" icon={BarChart3} />}
          {isFounder && <SupportLink label="Review Queue" href="/dashboard/dashboard/submissions" icon={Inbox} />}
          {!isArtist && !isFounder && (
            <SupportLink label="Earnings" href="/dashboard/dashboard/payout" icon={Wallet} />
          )}
          {isFounder && <SupportLink label="Earnings" href="/dashboard/dashboard/payout" icon={Wallet} />}
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
              <span className="text-[var(--pf-text)] capitalize">{role}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

function ActionCard({ label, href, icon: Icon, hint }: { label: string; href: string; icon: any; hint: string }) {
  return (
    <Link
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
  )
}

function SupportLink({ label, href, icon: Icon }: { label: string; href: string; icon: any }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-[var(--pf-border)] bg-[var(--pf-bg)] text-sm text-[var(--pf-text-secondary)] hover:text-[var(--pf-text)] hover:border-[var(--pf-text-muted)] transition-colors"
    >
      <Icon size={14} />
      {label}
    </Link>
  )
}
