'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSupabase } from '@/app/providers'
import { ArrowRight, Disc, Settings, Store, Upload, User, Headphones, ShieldCheck, Users } from 'lucide-react'

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
  const nextAction = useMemo(() => {
    if (isFounder) return { label: 'Open Founder View', href: '/dashboard/founder', hint: 'Review assets and keep things moving.' }
    if (isArtist) return { label: 'Upload Music', href: '/dashboard/upload', hint: 'Start with a new track or asset.' }
    return { label: 'Explore Store', href: '/store', hint: 'See live products and previews.' }
  }, [isArtist, isFounder])

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
        {/* Hero */}
        <section className="mb-6 overflow-hidden rounded-[32px] border border-[var(--pf-border)] bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.14),transparent_32%),linear-gradient(180deg,rgba(18,18,20,0.98),rgba(11,11,12,0.96))] p-5 sm:p-7 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-xl">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[var(--pf-orange)]/25 bg-[var(--pf-orange)]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--pf-orange)]">
                Porterful Home
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                {isFounder ? 'Keep Porterful moving.' : isArtist ? 'Build your next release.' : 'Start here.'}
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-6 text-[var(--pf-text-secondary)] sm:text-base">
                {isFounder
                  ? 'Review assets, approve work, and keep fulfillment on track from one place.'
                  : isArtist
                    ? 'Upload music, approve assets, and turn your ideas into sellable products.'
                    : 'Listen, browse, and explore live products from the Porterful catalog.'}
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)]/90 px-4 py-3 min-w-[220px]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--pf-text-muted)]">Next up</p>
              <p className="mt-1 text-base font-semibold text-white">{nextAction.label}</p>
              <p className="mt-1 text-sm text-[var(--pf-text-secondary)]">{nextAction.hint}</p>
              <Link
                href={nextAction.href}
                className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[var(--pf-orange)] transition-colors hover:text-[#ff9a4d]"
              >
                Continue
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

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

        <section className="rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)]/85 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <div>
              <p className="text-[var(--pf-text-muted)]">Account</p>
              <p className="mt-1 font-medium text-white truncate">{profile?.email}</p>
            </div>
            <span className="rounded-full border border-[var(--pf-border)] px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--pf-text-muted)] capitalize">
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
      className="group flex items-center gap-3 rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-4 transition-all hover:-translate-y-0.5 hover:border-[var(--pf-orange)]/30 hover:shadow-[0_16px_48px_rgba(0,0,0,0.18)]"
    >
      <div className="w-10 h-10 rounded-xl bg-[var(--pf-bg)] border border-[var(--pf-border)] flex items-center justify-center text-[var(--pf-text-secondary)] shrink-0 transition-colors group-hover:border-[var(--pf-orange)]/30 group-hover:text-[var(--pf-orange)]">
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[var(--pf-text)] truncate transition-colors group-hover:text-white">{label}</p>
        <p className="text-xs text-[var(--pf-text-muted)] truncate">{hint}</p>
      </div>
    </Link>
  )
}
