'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSupabase } from '@/app/providers'
import { ShieldCheck, Package, Share2, Users } from 'lucide-react'

interface DashboardClientProps {
  serverProfileId: string
  initialProfile: any
}

interface LikenessStatus {
  verified: boolean
  likeness_id?: string
}

const NAV = [
  { label: 'My Vault', href: '/dashboard' },
  { label: 'Social', href: '/dashboard/likeness' },
  { label: 'Access', href: '/dashboard/access' },
]

export default function DashboardClient({ serverProfileId, initialProfile }: DashboardClientProps) {
  const { supabase } = useSupabase()
  const pathname = usePathname()

  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [earnings, setEarnings] = useState(0)
  const [likeness, setLikeness] = useState<LikenessStatus>({ verified: false })

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted || !serverProfileId) return
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, serverProfileId])

  async function load() {
    try {
      const [likenessRes, ordersRes] = await Promise.all([
        fetch('/api/likeness/status'),
        supabase
          ?.from('order_items')
          .select('price, quantity')
          .eq('seller_id', serverProfileId),
      ])

      if (likenessRes?.ok) {
        const lk = await likenessRes.json()
        setLikeness(lk)
      }

      if (ordersRes?.data) {
        const total = (ordersRes.data as any[]).reduce(
          (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
          0
        )
        setEarnings(total)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  if (!mounted || loading) {
    return (
      <div className="min-h-screen pt-20">
        <div className="max-w-3xl mx-auto px-6 pt-8 space-y-4">
          <div className="h-10 bg-[var(--pf-surface)] rounded-xl animate-pulse" />
          <div className="h-24 bg-[var(--pf-surface)] rounded-xl animate-pulse" />
          <div className="h-32 bg-[var(--pf-surface)] rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  const isVerified = likeness.verified
  const likenessId = likeness.likeness_id ?? 'Not Set'

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-3xl mx-auto px-6">

        {/* Tab Nav */}
        <nav className="flex gap-1 mb-8 border-b border-[var(--pf-border)]">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                pathname === n.href
                  ? 'border-[var(--pf-orange)] text-[var(--pf-text)]'
                  : 'border-transparent text-[var(--pf-text-muted)] hover:text-[var(--pf-text)]'
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        {/* Stat Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard label="Status" value="Active" valueClass="text-green-400" />
          <StatCard label="Likeness ID" value={likenessId} valueClass="font-mono text-sm" />
          <StatCard label="Verified Accounts" value={isVerified ? '1' : '0'} />
          <StatCard label="Earnings" value={`$${earnings.toFixed(2)}`} />
        </div>

        {/* Conditional Section */}
        {!isVerified ? (
          <div className="border border-[var(--pf-border)] rounded-2xl p-6">
            <p className="text-xs uppercase tracking-widest text-[var(--pf-text-muted)] mb-1">Start here</p>
            <p className="text-lg font-bold mb-5">Verify your first account</p>
            <Link
              href="/dashboard/likeness"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--pf-orange)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--pf-orange-dark)] transition-colors"
            >
              <ShieldCheck size={16} />
              Verify Account
            </Link>
          </div>
        ) : (
          <div className="border border-[var(--pf-border)] rounded-2xl p-6">
            <p className="text-xs uppercase tracking-widest text-[var(--pf-text-muted)] mb-4">Next move</p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard/catalog"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--pf-orange)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--pf-orange-dark)] transition-colors"
              >
                <Package size={16} />
                Sell
              </Link>
              <Link
                href="/dashboard/access"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-[var(--pf-border)] text-sm font-semibold rounded-xl hover:border-[var(--pf-orange)]/50 transition-colors"
              >
                <Share2 size={16} />
                Share Access
              </Link>
              <Link
                href="/artists"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-[var(--pf-border)] text-sm font-semibold rounded-xl hover:border-[var(--pf-orange)]/50 transition-colors"
              >
                <Users size={16} />
                Grow Audience
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="border border-[var(--pf-border)] rounded-xl p-4">
      <p className="text-xs text-[var(--pf-text-muted)] mb-1">{label}</p>
      <p className={`font-bold truncate ${valueClass ?? 'text-base'}`}>{value}</p>
    </div>
  )
}
