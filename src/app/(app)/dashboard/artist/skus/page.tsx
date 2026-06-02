'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Package, RefreshCw } from 'lucide-react'
import { useSupabase } from '@/app/providers'
import { formatCurrencyFromCents, ProductSkuRecord } from '@/lib/product-skus'
import { formatProductionAssetType, formatProductionStatus } from '@/lib/production-assets'
import { StageTracker, NextStepCard, EmptyState } from '@/components/guidance/GuidedExperience'

type ArtistSkuRecord = ProductSkuRecord

function badgeClasses(active: boolean) {
  return active
    ? 'border-green-500/30 bg-green-500/10 text-green-500'
    : 'border-red-500/30 bg-red-500/10 text-red-400'
}

export default function ArtistSkuPage() {
  const router = useRouter()
  const { user, supabase, loading: authLoading } = useSupabase()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [skus, setSkus] = useState<ArtistSkuRecord[]>([])

  const getAuthToken = useCallback(async () => {
    if (!supabase) return ''
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token || ''
  }, [supabase])

  const loadSkus = useCallback(async () => {
    if (!supabase) return
    setError('')

    try {
      const token = await getAuthToken()
      const res = await fetch('/api/product-skus', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to load SKUs')
      }

      const data = await res.json()
      setSkus(data.skus || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load SKUs')
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

      await loadSkus()
      setLoading(false)
    }

    void checkAccess()
  }, [authLoading, loadSkus, router, supabase, user])

  const summary = useMemo(() => {
    return {
      total: skus.length,
      active: skus.filter((sku) => sku.active).length,
      productionApproved: skus.filter((sku) => sku.asset?.production_status === 'production_approved').length,
    }
  }, [skus])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <div className="animate-pulse text-[var(--pf-text-muted)]">Loading SKUs...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="pf-container max-w-7xl space-y-8">
        <StageTracker
          title="Your SKU Journey"
          stages={[
            { label: 'Asset Approved', status: summary.productionApproved > 0 ? 'complete' : 'pending' },
            { label: 'SKU Created', status: summary.total > 0 ? 'complete' : 'pending' },
            { label: 'Active', status: summary.active > 0 ? 'complete' : 'pending' },
            { label: 'Inventory', status: summary.total > 0 ? 'current' : 'pending' },
            { label: 'Fulfillment', status: 'pending' },
          ]}
        />

        <NextStepCard
          title={summary.total === 0 ? "SKUs Created by Founders" : "Your SKU Registry"}
          description={
            summary.total === 0
              ? "SKUs are sellable variants created by founders from your production-approved assets. Once an asset is approved and production-ready, founders create SKUs for it. Check back to see your registered products."
              : "These are the sellable variants tied to your approved assets. Founders manage SKU creation and inventory — you have read-only visibility into what exists and its current status."
          }
          variant={summary.total === 0 ? 'warning' : 'default'}
        />

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <Link href="/dashboard/artist" className="inline-flex items-center gap-2 text-sm text-[var(--pf-text-muted)] hover:text-[var(--pf-text)]">
              <ArrowLeft size={16} />
              Back to Artist Dashboard
            </Link>
            <h1 className="text-3xl font-bold mt-3 flex items-center gap-3">
              <Package className="text-[var(--pf-orange)]" />
              SKU Registry
            </h1>
            <p className="text-[var(--pf-text-muted)] mt-2 max-w-2xl">
              View the sellable variants tied to your production-approved assets.
            </p>
          </div>
          <button onClick={loadSkus} className="pf-btn pf-btn-secondary inline-flex items-center gap-2">
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
            <p className="text-xs uppercase text-[var(--pf-text-muted)]">Total SKUs</p>
            <p className="text-2xl font-bold mt-1">{summary.total}</p>
          </div>
          <div className="pf-card p-4">
            <p className="text-xs uppercase text-[var(--pf-text-muted)]">Active SKUs</p>
            <p className="text-2xl font-bold mt-1">{summary.active}</p>
          </div>
          <div className="pf-card p-4">
            <p className="text-xs uppercase text-[var(--pf-text-muted)]">Production Approved Assets</p>
            <p className="text-2xl font-bold mt-1">{summary.productionApproved}</p>
          </div>
        </div>

        <div className="pf-card overflow-hidden">
          <div className="p-4 border-b border-[var(--pf-border)] flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Your SKUs</h2>
              <p className="text-sm text-[var(--pf-text-muted)]">Read-only access to registry entries tied to your assets.</p>
            </div>
          </div>

          {skus.length === 0 ? (
            <EmptyState
              icon={<Package size={24} />}
              title="No SKUs have been created yet"
              description="SKUs (Stock Keeping Units) are the sellable product variants that founders create from your production-approved assets."
              points={[
                { label: 'What is this?', text: 'A read-only list of sellable variants tied to your assets.' },
                { label: 'Why it matters', text: 'A SKU is the step between an approved asset and future inventory.' },
                { label: 'Next step', text: 'Wait for founders to create a SKU from your approved asset.' },
              ]}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[var(--pf-surface)]/60 text-[var(--pf-text-muted)] uppercase text-xs">
                  <tr>
                    <th className="text-left p-4">SKU</th>
                    <th className="text-left p-4">Asset</th>
                    <th className="text-left p-4">Variant</th>
                    <th className="text-left p-4">Price</th>
                    <th className="text-left p-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {skus.map((sku) => (
                    <tr key={sku.sku_id} className="border-t border-[var(--pf-border)] align-top">
                      <td className="p-4">
                        <div className="font-medium">{sku.sku_code}</div>
                        <div className="text-xs text-[var(--pf-text-muted)] mt-1">
                          {sku.product_type}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{sku.asset?.title || 'Untitled asset'}</div>
                        <div className="text-xs text-[var(--pf-text-muted)] mt-1">
                          {formatProductionAssetType(sku.asset?.asset_type)} · {formatProductionStatus(sku.asset?.production_status)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div>{sku.variant_name}</div>
                        <div className="text-xs text-[var(--pf-text-muted)] mt-1">
                          {sku.size || 'No size'}{sku.color ? ` · ${sku.color}` : ''}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{formatCurrencyFromCents(sku.retail_price_cents)}</div>
                        <div className="text-xs text-[var(--pf-text-muted)] mt-1">
                          Cost {formatCurrencyFromCents(sku.unit_cost_cents)}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeClasses(sku.active)}`}>
                          {sku.active ? 'Active' : 'Inactive'}
                        </span>
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
