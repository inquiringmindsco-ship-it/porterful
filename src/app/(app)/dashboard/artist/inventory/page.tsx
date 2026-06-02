'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Package, RefreshCw, TrendingUp } from 'lucide-react'
import { useSupabase } from '@/app/providers'
import { InventorySkuSummary } from '@/lib/inventory-ledger'
import { formatProductionAssetType, formatProductionStatus } from '@/lib/production-assets'

type InventoryApiResponse = {
  summaries: InventorySkuSummary[]
  skus: Array<{
    sku_id: string
    sku_code: string
    production_asset_id: string
    product_type: string
    variant_name: string
    size: string | null
    color: string | null
    active: boolean
    asset?: { title?: string | null; asset_type?: string | null; production_status?: string | null } | null
    artist?: { full_name?: string | null; username?: string | null } | null
  }>
  counts: { skus: number; entries: number }
}

export default function ArtistInventoryPage() {
  const router = useRouter()
  const { user, supabase, loading: authLoading } = useSupabase()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [summaries, setSummaries] = useState<InventorySkuSummary[]>([])

  const getAuthToken = useCallback(async () => {
    if (!supabase) return ''
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token || ''
  }, [supabase])

  const loadData = useCallback(async () => {
    if (!supabase) return
    setError('')

    try {
      const token = await getAuthToken()
      const res = await fetch('/api/inventory-ledger?limit=200', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to load inventory summary')
      }

      const data: InventoryApiResponse = await res.json()
      setSummaries(data.summaries || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load inventory summary')
    }
  }, [getAuthToken, supabase])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login')
      return
    }

    async function checkAccess() {
      if (!supabase || !user) return

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', user.id)
        .single()

      if (profileError || !profile || !['artist', 'admin', 'founder'].includes(profile.role)) {
        router.push('/dashboard')
        return
      }

      await loadData()
      setLoading(false)
    }

    void checkAccess()
  }, [authLoading, loadData, router, supabase, user])

  const totals = useMemo(() => {
    return summaries.reduce(
      (acc, summary) => {
        acc.on_hand += summary.on_hand
        acc.reserved += summary.reserved
        acc.available += summary.available
        return acc
      },
      { on_hand: 0, reserved: 0, available: 0 }
    )
  }, [summaries])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <div className="animate-pulse text-[var(--pf-text-muted)]">Loading inventory summary...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="pf-container max-w-7xl space-y-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <Link href="/dashboard/artist" className="inline-flex items-center gap-2 text-sm text-[var(--pf-text-muted)] hover:text-[var(--pf-text)]">
              <ArrowLeft size={16} />
              Back to Artist Dashboard
            </Link>
            <h1 className="text-3xl font-bold mt-3 flex items-center gap-3">
              <Package className="text-[var(--pf-orange)]" />
              Inventory Summary
            </h1>
            <p className="text-[var(--pf-text-muted)] mt-2 max-w-2xl">
              Read-only inventory counts for SKUs connected to your approved assets.
            </p>
          </div>
          <button onClick={loadData} className="pf-btn pf-btn-secondary inline-flex items-center gap-2">
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="pf-card p-4">
            <p className="text-xs uppercase text-[var(--pf-text-muted)]">On Hand</p>
            <p className="text-2xl font-bold mt-1">{totals.on_hand}</p>
          </div>
          <div className="pf-card p-4">
            <p className="text-xs uppercase text-[var(--pf-text-muted)]">Reserved</p>
            <p className="text-2xl font-bold mt-1">{totals.reserved}</p>
          </div>
          <div className="pf-card p-4">
            <p className="text-xs uppercase text-[var(--pf-text-muted)]">Available</p>
            <p className="text-2xl font-bold mt-1">{totals.available}</p>
          </div>
        </div>

        <div className="pf-card overflow-hidden">
          <div className="p-4 border-b border-[var(--pf-border)]">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-[var(--pf-orange)]" />
              <h2 className="text-lg font-semibold">Your SKU Inventory</h2>
            </div>
            <p className="text-sm text-[var(--pf-text-muted)]">Counts are derived from the inventory ledger.</p>
          </div>

          {summaries.length === 0 ? (
            <div className="p-8 text-center text-[var(--pf-text-muted)]">
              No inventory activity recorded for your SKUs yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[var(--pf-surface)]/60 text-[var(--pf-text-muted)] uppercase text-xs">
                  <tr>
                    <th className="text-left p-4">SKU</th>
                    <th className="text-left p-4">Asset</th>
                    <th className="text-left p-4">On Hand</th>
                    <th className="text-left p-4">Reserved</th>
                    <th className="text-left p-4">Available</th>
                    <th className="text-left p-4">Production</th>
                  </tr>
                </thead>
                <tbody>
                  {summaries.map((summary) => (
                    <tr key={summary.sku_id} className="border-t border-[var(--pf-border)] align-top">
                      <td className="p-4">
                        <div className="font-medium">{summary.sku_code}</div>
                        <div className="text-xs text-[var(--pf-text-muted)] mt-1">
                          {summary.product_type}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{summary.asset_title}</div>
                        <div className="text-xs text-[var(--pf-text-muted)] mt-1">
                          {formatProductionAssetType(summary.asset_type)}
                        </div>
                      </td>
                      <td className="p-4 font-medium">{summary.on_hand}</td>
                      <td className="p-4 font-medium">{summary.reserved}</td>
                      <td className="p-4 font-medium">{summary.available}</td>
                      <td className="p-4">
                        <div className="text-sm font-medium">{formatProductionStatus(summary.production_status)}</div>
                        <div className="text-xs text-[var(--pf-text-muted)] mt-1">
                          {summary.variant_name}{summary.size ? ` · ${summary.size}` : ''}{summary.color ? ` · ${summary.color}` : ''}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
