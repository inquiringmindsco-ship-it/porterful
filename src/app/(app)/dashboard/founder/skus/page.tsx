'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, Plus, RefreshCw, Save, Shield } from 'lucide-react'
import { useSupabase } from '@/app/providers'
import {
  formatCurrencyFromCents,
  PRODUCT_SKU_PRODUCT_TYPES,
  ProductSkuRecord,
} from '@/lib/product-skus'
import {
  formatProductionAssetType,
  formatProductionStatus,
} from '@/lib/production-assets'
import { StageTracker, NextStepCard, EmptyState, AttentionCard } from '@/components/guidance/GuidedExperience'

type ProductionAssetRecord = {
  asset_id: string
  asset_group_id: string
  prior_version_id: string | null
  creator_id: string | null
  artist_id: string | null
  asset_type: string
  title: string
  description: string | null
  source_song_id: string | null
  source_campaign: string | null
  file_url: string | null
  reference_url: string | null
  version_number: number
  is_current_version: boolean
  change_notes: string | null
  approval_status: string
  production_status: string
  approved_by: string | null
  approved_at: string | null
  rights_notes: string | null
  usage_notes: string | null
  review_notes: string | null
  created_at: string
  updated_at: string
  creator?: { full_name?: string | null; username?: string | null; email?: string | null } | null
  artist?: { full_name?: string | null; username?: string | null; email?: string | null } | null
}

type SkuDraft = {
  sku_code: string
  product_id: string
  product_type: string
  variant_name: string
  size: string
  color: string
  unit_cost_cents: string
  retail_price_cents: string
  weight_oz: string
  package_type: string
  print_location: string
  active: boolean
}

function badgeClasses(active: boolean) {
  return active
    ? 'border-green-500/30 bg-green-500/10 text-green-500'
    : 'border-red-500/30 bg-red-500/10 text-red-400'
}

function assetLabel(asset: ProductionAssetRecord) {
  const owner = asset.artist?.full_name || asset.artist?.username || asset.creator?.full_name || asset.creator?.username || asset.artist_id || asset.creator_id || 'Unassigned'
  return `${asset.title} · ${formatProductionAssetType(asset.asset_type)} · ${owner}`
}

function buildDraft(): SkuDraft {
  return {
    sku_code: '',
    product_id: '',
    product_type: 'shirt',
    variant_name: 'Standard',
    size: '',
    color: '',
    unit_cost_cents: '0',
    retail_price_cents: '0',
    weight_oz: '',
    package_type: '',
    print_location: '',
    active: false,
  }
}

export default function FounderSkuPage() {
  const router = useRouter()
  const { user, supabase, loading: authLoading } = useSupabase()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [assets, setAssets] = useState<ProductionAssetRecord[]>([])
  const [skus, setSkus] = useState<ProductSkuRecord[]>([])
  const [selectedAssetId, setSelectedAssetId] = useState('')
  const [selectedSkuId, setSelectedSkuId] = useState('')
  const [createDraft, setCreateDraft] = useState<SkuDraft>(buildDraft())
  const [editDraft, setEditDraft] = useState<SkuDraft | null>(null)

  const getAuthToken = useCallback(async () => {
    if (!supabase) return ''
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token || ''
  }, [supabase])

  const loadAssets = useCallback(async () => {
    if (!supabase) return

    const token = await getAuthToken()
    const res = await fetch('/api/production-assets?production_status=production_approved&current_only=true', {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || 'Failed to load production assets')
    }

    const data = await res.json()
    setAssets(data.assets || [])
  }, [getAuthToken, supabase])

  const loadSkus = useCallback(async () => {
    if (!supabase) return

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
  }, [getAuthToken, supabase])

  const loadData = useCallback(async () => {
    if (!supabase || !user) return
    setLoading(true)
    setError('')

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', user.id)
        .single()

      if (!profile || (profile.role !== 'admin' && profile.role !== 'founder')) {
        router.push('/dashboard')
        return
      }

      await Promise.all([loadAssets(), loadSkus()])
    } catch (err: any) {
      setError(err.message || 'Failed to load SKU registry')
    } finally {
      setLoading(false)
    }
  }, [loadAssets, loadSkus, router, supabase, user])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login')
      return
    }

    void loadData()
  }, [authLoading, loadData, router, user])

  useEffect(() => {
    if (!selectedAssetId && assets.length > 0) {
      setSelectedAssetId(assets[0].asset_id)
    }
  }, [assets, selectedAssetId])

  const selectedSku = useMemo(() => {
    return skus.find((sku) => sku.sku_id === selectedSkuId) || null
  }, [selectedSkuId, skus])

  useEffect(() => {
    if (!selectedSku) {
      setEditDraft(null)
      return
    }

    setEditDraft({
      sku_code: selectedSku.sku_code || '',
      product_id: selectedSku.product_id || '',
      product_type: selectedSku.product_type || '',
      variant_name: selectedSku.variant_name || '',
      size: selectedSku.size || '',
      color: selectedSku.color || '',
      unit_cost_cents: String(selectedSku.unit_cost_cents ?? 0),
      retail_price_cents: String(selectedSku.retail_price_cents ?? 0),
      weight_oz: selectedSku.weight_oz === null || selectedSku.weight_oz === undefined ? '' : String(selectedSku.weight_oz),
      package_type: selectedSku.package_type || '',
      print_location: selectedSku.print_location || '',
      active: selectedSku.active,
    })
  }, [selectedSku])

  const approvedAssets = useMemo(() => {
    return assets.filter((asset) => asset.production_status === 'production_approved' && asset.is_current_version)
  }, [assets])

  const summary = useMemo(() => {
    return {
      assets: approvedAssets.length,
      skus: skus.length,
      active: skus.filter((sku) => sku.active).length,
    }
  }, [approvedAssets.length, skus])

  async function submitSku() {
    if (!supabase) return
    if (!selectedAssetId) {
      setError('Select a production-approved asset first')
      return
    }

    setSaving(true)
    setError('')
    setNotice('')

    try {
      const token = await getAuthToken()
      const res = await fetch('/api/product-skus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          production_asset_id: selectedAssetId,
          product_id: createDraft.product_id || null,
          sku_code: createDraft.sku_code || null,
          product_type: createDraft.product_type,
          variant_name: createDraft.variant_name,
          size: createDraft.size || null,
          color: createDraft.color || null,
          unit_cost_cents: Number(createDraft.unit_cost_cents),
          retail_price_cents: Number(createDraft.retail_price_cents),
          weight_oz: createDraft.weight_oz ? Number(createDraft.weight_oz) : null,
          package_type: createDraft.package_type || null,
          print_location: createDraft.print_location || null,
          active: createDraft.active,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create SKU')
      }

      setNotice('SKU created from approved production asset')
      setCreateDraft(buildDraft())
      setSelectedSkuId(data.sku?.sku_id || '')
      await loadSkus()
    } catch (err: any) {
      setError(err.message || 'Failed to create SKU')
    } finally {
      setSaving(false)
    }
  }

  async function saveSelectedSku() {
    if (!supabase || !selectedSku || !editDraft) return

    setSaving(true)
    setError('')
    setNotice('')

    try {
      const token = await getAuthToken()
      const res = await fetch(`/api/product-skus/${selectedSku.sku_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sku_code: editDraft.sku_code,
          product_id: editDraft.product_id,
          product_type: editDraft.product_type,
          variant_name: editDraft.variant_name,
          size: editDraft.size,
          color: editDraft.color,
          unit_cost_cents: Number(editDraft.unit_cost_cents),
          retail_price_cents: Number(editDraft.retail_price_cents),
          weight_oz: editDraft.weight_oz ? Number(editDraft.weight_oz) : null,
          package_type: editDraft.package_type,
          print_location: editDraft.print_location,
          active: editDraft.active,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update SKU')
      }

      setNotice('SKU updated')
      setSelectedSkuId(data.sku?.sku_id || selectedSku.sku_id)
      await loadSkus()
    } catch (err: any) {
      setError(err.message || 'Failed to update SKU')
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(sku: ProductSkuRecord) {
    if (!supabase) return

    setSaving(true)
    setError('')
    setNotice('')

    try {
      const token = await getAuthToken()
      const res = await fetch(`/api/product-skus/${sku.sku_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ active: !sku.active }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update SKU')
      }

      setNotice(`${sku.sku_code} is now ${data.sku?.active ? 'active' : 'inactive'}`)
      if (selectedSkuId === sku.sku_id) {
        setEditDraft((current) => current ? { ...current, active: !!data.sku?.active } : current)
      }
      await loadSkus()
    } catch (err: any) {
      setError(err.message || 'Failed to update SKU')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <div className="animate-pulse text-[var(--pf-text-muted)]">Loading SKU registry...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="pf-container max-w-7xl space-y-8">
        <StageTracker
          title="Founder SKU Pipeline"
          stages={[
            { label: 'Asset Production OK', status: summary.assets > 0 ? 'complete' : 'current' },
            { label: 'Create SKU', status: summary.skus > 0 ? 'complete' : 'current' },
            { label: 'Add Inventory', status: 'pending' },
            { label: 'Fulfillment Ready', status: 'pending' },
          ]}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AttentionCard
            count={approvedAssets.length}
            label="Assets Ready for SKU Creation"
            href="#create-sku"
            severity={approvedAssets.length > 0 ? 'warning' : 'success'}
          />
          <AttentionCard
            count={summary.skus}
            label="Total SKUs Created"
            href="#sku-list"
            severity="info"
          />
          <AttentionCard
            count={summary.active}
            label="Active SKUs"
            href="#sku-list"
            severity="success"
          />
        </div>

        <NextStepCard
          title={approvedAssets.length > 0 ? "Create SKUs from Approved Assets" : "Waiting for Production-Approved Assets"}
          description={
            approvedAssets.length > 0
              ? "You have production-approved assets ready. Create SKUs to define sellable variants (size, color, price). SKUs connect assets to inventory and fulfillment."
              : "No production-approved assets are available yet. Artists must submit assets, and you must approve them and mark them production-ready before SKUs can be created."
          }
          actionLabel={approvedAssets.length > 0 ? "Create SKU" : "Review Assets"}
          actionHref={approvedAssets.length > 0 ? "#create-sku" : "/dashboard/founder/assets"}
          variant={approvedAssets.length > 0 ? 'warning' : 'default'}
        />

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <Link href="/dashboard/founder" className="inline-flex items-center gap-2 text-sm text-[var(--pf-text-muted)] hover:text-[var(--pf-text)]">
              <ArrowLeft size={16} />
              Back to Founder Dashboard
            </Link>
            <h1 className="text-3xl font-bold mt-3 flex items-center gap-3">
              <Shield className="text-[var(--pf-orange)]" />
              SKU Registry
            </h1>
            <p className="text-[var(--pf-text-muted)] mt-2 max-w-2xl">
              Create and control sellable variants from production-approved assets only.
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
        {notice && (
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
            {notice}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="pf-card p-4">
            <p className="text-xs uppercase text-[var(--pf-text-muted)]">Approved Assets</p>
            <p className="text-2xl font-bold mt-1">{summary.assets}</p>
          </div>
          <div className="pf-card p-4">
            <p className="text-xs uppercase text-[var(--pf-text-muted)]">Total SKUs</p>
            <p className="text-2xl font-bold mt-1">{summary.skus}</p>
          </div>
          <div className="pf-card p-4">
            <p className="text-xs uppercase text-[var(--pf-text-muted)]">Active SKUs</p>
            <p className="text-2xl font-bold mt-1">{summary.active}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="pf-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Plus size={16} className="text-[var(--pf-orange)]" />
              <h2 className="text-xl font-semibold">Create SKU</h2>
            </div>
            {approvedAssets.length === 0 ? (
              <EmptyState
                icon={<CheckCircle size={24} />}
                title="No production-approved assets available"
                description="SKUs can only be created from assets that have been marked production-approved."
                points={[
                  { label: 'What is this?', text: 'A list of approved assets that are eligible for SKU creation.' },
                  { label: 'Why it matters', text: 'No SKU should exist until an asset is production approved.' },
                  { label: 'Next step', text: 'Review assets, then mark the right ones production approved.' },
                ]}
                actionLabel="Review Assets"
                actionHref="/dashboard/founder/assets"
              />
            ) : (
              <>
                <div className="grid grid-cols-1 gap-3">
                  <label className="space-y-1 text-sm">
                    <span className="text-[var(--pf-text-muted)]">Production Asset</span>
                    <select
                      value={selectedAssetId}
                      onChange={(e) => setSelectedAssetId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] focus:border-[var(--pf-orange)] focus:outline-none"
                    >
                      {approvedAssets.map((asset) => (
                        <option key={asset.asset_id} value={asset.asset_id}>
                          {assetLabel(asset)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-1 text-sm">
                    <span className="text-[var(--pf-text-muted)]">SKU Code Optional</span>
                    <input
                      value={createDraft.sku_code}
                      onChange={(e) => setCreateDraft((current) => ({ ...current, sku_code: e.target.value }))}
                      placeholder="Leave blank to auto-generate"
                      className="w-full px-3 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] focus:border-[var(--pf-orange)] focus:outline-none"
                    />
                  </label>

                  <label className="space-y-1 text-sm">
                    <span className="text-[var(--pf-text-muted)]">Product ID Optional</span>
                    <input
                      value={createDraft.product_id}
                      onChange={(e) => setCreateDraft((current) => ({ ...current, product_id: e.target.value }))}
                      placeholder="Existing product UUID"
                      className="w-full px-3 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] focus:border-[var(--pf-orange)] focus:outline-none"
                    />
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="space-y-1 text-sm">
                      <span className="text-[var(--pf-text-muted)]">Product Type</span>
                      <select
                        value={createDraft.product_type}
                        onChange={(e) => setCreateDraft((current) => ({ ...current, product_type: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] focus:border-[var(--pf-orange)] focus:outline-none"
                      >
                        {PRODUCT_SKU_PRODUCT_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-1 text-sm">
                      <span className="text-[var(--pf-text-muted)]">Variant Name</span>
                      <input
                        value={createDraft.variant_name}
                        onChange={(e) => setCreateDraft((current) => ({ ...current, variant_name: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] focus:border-[var(--pf-orange)] focus:outline-none"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="space-y-1 text-sm">
                      <span className="text-[var(--pf-text-muted)]">Size</span>
                      <input
                        value={createDraft.size}
                        onChange={(e) => setCreateDraft((current) => ({ ...current, size: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] focus:border-[var(--pf-orange)] focus:outline-none"
                      />
                    </label>
                    <label className="space-y-1 text-sm">
                      <span className="text-[var(--pf-text-muted)]">Color</span>
                      <input
                        value={createDraft.color}
                        onChange={(e) => setCreateDraft((current) => ({ ...current, color: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] focus:border-[var(--pf-orange)] focus:outline-none"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="space-y-1 text-sm">
                      <span className="text-[var(--pf-text-muted)]">Unit Cost Cents</span>
                      <input
                        type="number"
                        min="0"
                        value={createDraft.unit_cost_cents}
                        onChange={(e) => setCreateDraft((current) => ({ ...current, unit_cost_cents: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] focus:border-[var(--pf-orange)] focus:outline-none"
                      />
                    </label>
                    <label className="space-y-1 text-sm">
                      <span className="text-[var(--pf-text-muted)]">Retail Price Cents</span>
                      <input
                        type="number"
                        min="0"
                        value={createDraft.retail_price_cents}
                        onChange={(e) => setCreateDraft((current) => ({ ...current, retail_price_cents: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] focus:border-[var(--pf-orange)] focus:outline-none"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="space-y-1 text-sm">
                      <span className="text-[var(--pf-text-muted)]">Weight Oz Optional</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={createDraft.weight_oz}
                        onChange={(e) => setCreateDraft((current) => ({ ...current, weight_oz: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] focus:border-[var(--pf-orange)] focus:outline-none"
                      />
                    </label>
                    <label className="space-y-1 text-sm">
                      <span className="text-[var(--pf-text-muted)]">Package Type</span>
                      <input
                        value={createDraft.package_type}
                        onChange={(e) => setCreateDraft((current) => ({ ...current, package_type: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] focus:border-[var(--pf-orange)] focus:outline-none"
                      />
                    </label>
                  </div>

                  <label className="space-y-1 text-sm">
                    <span className="text-[var(--pf-text-muted)]">Print Location</span>
                    <input
                      value={createDraft.print_location}
                      onChange={(e) => setCreateDraft((current) => ({ ...current, print_location: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] focus:border-[var(--pf-orange)] focus:outline-none"
                    />
                  </label>

                  <label className="inline-flex items-center gap-2 text-sm text-[var(--pf-text-muted)]">
                    <input
                      type="checkbox"
                      checked={createDraft.active}
                      onChange={(e) => setCreateDraft((current) => ({ ...current, active: e.target.checked }))}
                    />
                    Active
                  </label>
                </div>

                <button
                  onClick={submitSku}
                  disabled={saving}
                  className="pf-btn pf-btn-primary inline-flex items-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle size={16} />
                  Create SKU
                </button>
              </>
            )}
          </div>

          <div className="pf-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Save size={16} className="text-[var(--pf-orange)]" />
              <h2 className="text-xl font-semibold">Edit SKU</h2>
            </div>
            {!selectedSku || !editDraft ? (
              <div className="rounded-lg border border-dashed border-[var(--pf-border)] p-4 text-sm text-[var(--pf-text-muted)]">
                Pick a SKU from the list below to edit cost, price, or active state.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] p-3 text-sm">
                  <div className="font-medium">{selectedSku.sku_code}</div>
                  <div className="text-[var(--pf-text-muted)] mt-1">
                    {selectedSku.asset?.title || 'Untitled asset'} · {formatProductionAssetType(selectedSku.asset?.asset_type)} · {formatProductionStatus(selectedSku.asset?.production_status)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="space-y-1 text-sm">
                    <span className="text-[var(--pf-text-muted)]">SKU Code</span>
                    <input
                      value={editDraft.sku_code}
                      onChange={(e) => setEditDraft((current) => current ? { ...current, sku_code: e.target.value } : current)}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] focus:border-[var(--pf-orange)] focus:outline-none"
                    />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span className="text-[var(--pf-text-muted)]">Product ID Optional</span>
                    <input
                      value={editDraft.product_id}
                      onChange={(e) => setEditDraft((current) => current ? { ...current, product_id: e.target.value } : current)}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] focus:border-[var(--pf-orange)] focus:outline-none"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="space-y-1 text-sm">
                    <span className="text-[var(--pf-text-muted)]">Product Type</span>
                    <select
                      value={editDraft.product_type}
                      onChange={(e) => setEditDraft((current) => current ? { ...current, product_type: e.target.value } : current)}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] focus:border-[var(--pf-orange)] focus:outline-none"
                    >
                      {PRODUCT_SKU_PRODUCT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1 text-sm">
                    <span className="text-[var(--pf-text-muted)]">Variant Name</span>
                    <input
                      value={editDraft.variant_name}
                      onChange={(e) => setEditDraft((current) => current ? { ...current, variant_name: e.target.value } : current)}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] focus:border-[var(--pf-orange)] focus:outline-none"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="space-y-1 text-sm">
                    <span className="text-[var(--pf-text-muted)]">Size</span>
                    <input
                      value={editDraft.size}
                      onChange={(e) => setEditDraft((current) => current ? { ...current, size: e.target.value } : current)}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] focus:border-[var(--pf-orange)] focus:outline-none"
                    />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span className="text-[var(--pf-text-muted)]">Color</span>
                    <input
                      value={editDraft.color}
                      onChange={(e) => setEditDraft((current) => current ? { ...current, color: e.target.value } : current)}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] focus:border-[var(--pf-orange)] focus:outline-none"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="space-y-1 text-sm">
                    <span className="text-[var(--pf-text-muted)]">Unit Cost Cents</span>
                    <input
                      type="number"
                      min="0"
                      value={editDraft.unit_cost_cents}
                      onChange={(e) => setEditDraft((current) => current ? { ...current, unit_cost_cents: e.target.value } : current)}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] focus:border-[var(--pf-orange)] focus:outline-none"
                    />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span className="text-[var(--pf-text-muted)]">Retail Price Cents</span>
                    <input
                      type="number"
                      min="0"
                      value={editDraft.retail_price_cents}
                      onChange={(e) => setEditDraft((current) => current ? { ...current, retail_price_cents: e.target.value } : current)}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] focus:border-[var(--pf-orange)] focus:outline-none"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="space-y-1 text-sm">
                    <span className="text-[var(--pf-text-muted)]">Weight Oz Optional</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editDraft.weight_oz}
                      onChange={(e) => setEditDraft((current) => current ? { ...current, weight_oz: e.target.value } : current)}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] focus:border-[var(--pf-orange)] focus:outline-none"
                    />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span className="text-[var(--pf-text-muted)]">Package Type</span>
                    <input
                      value={editDraft.package_type}
                      onChange={(e) => setEditDraft((current) => current ? { ...current, package_type: e.target.value } : current)}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] focus:border-[var(--pf-orange)] focus:outline-none"
                    />
                  </label>
                </div>

                <label className="space-y-1 text-sm block">
                  <span className="text-[var(--pf-text-muted)]">Print Location</span>
                  <input
                    value={editDraft.print_location}
                    onChange={(e) => setEditDraft((current) => current ? { ...current, print_location: e.target.value } : current)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] focus:border-[var(--pf-orange)] focus:outline-none"
                  />
                </label>

                <label className="inline-flex items-center gap-2 text-sm text-[var(--pf-text-muted)]">
                  <input
                    type="checkbox"
                    checked={editDraft.active}
                    onChange={(e) => setEditDraft((current) => current ? { ...current, active: e.target.checked } : current)}
                  />
                  Active
                </label>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={saveSelectedSku}
                    disabled={saving}
                    className="pf-btn pf-btn-primary inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save size={16} />
                    Save Changes
                  </button>
                  <button
                    onClick={() => toggleActive(selectedSku)}
                    disabled={saving}
                    className="pf-btn pf-btn-secondary inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    {selectedSku.active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pf-card overflow-hidden">
          <div className="p-4 border-b border-[var(--pf-border)] flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">All SKUs</h2>
              <p className="text-sm text-[var(--pf-text-muted)]">Founder/admin control surface for registry state.</p>
            </div>
          </div>

          {skus.length === 0 ? (
            <EmptyState
              icon={<Shield size={24} />}
              title="No SKUs created yet"
              description="SKUs are the sellable product variants that connect production-approved assets to inventory and fulfillment."
              points={[
                { label: 'What is this?', text: 'The registry for sellable variants built from approved assets.' },
                { label: 'Why it matters', text: 'SKUs are the bridge between an approved asset and inventory.' },
                { label: 'Next step', text: 'Create the first SKU from a production-approved asset.' },
              ]}
              actionLabel="Create SKU"
              actionHref="#create-sku"
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
                    <th className="text-left p-4">State</th>
                    <th className="text-left p-4">Actions</th>
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
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => setSelectedSkuId(sku.sku_id)}
                            className="pf-btn pf-btn-secondary text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => toggleActive(sku)}
                            className="pf-btn pf-btn-secondary text-xs"
                          >
                            {sku.active ? 'Deactivate' : 'Activate'}
                          </button>
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
