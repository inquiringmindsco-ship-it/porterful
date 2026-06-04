'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSupabase } from '@/app/providers'
import { Disc, Settings, Store, Upload, User, Headphones, ShieldCheck, Users } from 'lucide-react'

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
        <header className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold">Your dashboard</h1>
            {isFounder && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-[var(--pf-orange)]/30 bg-[var(--pf-orange)]/10 text-[var(--pf-orange)] text-xs font-semibold uppercase tracking-wide">
                <ShieldCheck size={12} />
                Founder
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--pf-text-secondary)] mt-1">
            {profile?.full_name || profile?.name || (isFounder ? 'Founder' : isArtist ? 'Artist' : 'Supporter')}
          </p>
        </header>

        {/* Primary actions — role-aware */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {isFounder ? (
            <>
              <ActionCard label="Control" href="/dashboard/founder" icon={ShieldCheck} hint="Approvals" />
              <ActionCard label="Artists" href="/dashboard/founder/artists" icon={Users} hint="Access" />
              <ActionCard label="Upload" href="/dashboard/upload" icon={Upload} hint="Release" />
            </>
          ) : isArtist ? (
            <>
              <ActionCard label="Upload" href="/dashboard/upload" icon={Upload} hint="Track" />
              <ActionCard label="Music" href="/dashboard/artist" icon={Disc} hint="Catalog" />
              <ActionCard label="Assets" href="/dashboard/artist/assets" icon={User} hint="Files" />
            </>
          ) : (
            <>
              <ActionCard label="Music" href="/music" icon={Headphones} hint="Listen" />
              <ActionCard label="Store" href="/store" icon={Store} hint="Shop" />
              <ActionCard label="Settings" href="/settings/settings" icon={Settings} hint="Account" />
            </>
          )}
        </div>

        <section className="rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="text-[var(--pf-text-muted)]">Account</span>
            <span className="text-[var(--pf-text)] truncate">{profile?.email}</span>
            <span className="rounded-full border border-[var(--pf-border)] px-2 py-1 text-xs text-[var(--pf-text-muted)] capitalize">
              {role}
            </span>
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
