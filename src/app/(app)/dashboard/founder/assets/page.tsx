'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, RefreshCw, Shield, Trash2 } from 'lucide-react'
import { useSupabase } from '@/app/providers'
import {
  formatProductionApprovalStatus,
  formatProductionAssetType,
  formatProductionStatus,
  PRODUCTION_ASSET_TYPES,
  PRODUCTION_APPROVAL_STATUSES,
  PRODUCTION_STATUSES,
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
  approver?: { full_name?: string | null; username?: string | null; email?: string | null } | null
}

function badgeClasses(status: string) {
  const value = status.toLowerCase()
  if (value === 'approved' || value === 'production_approved') return 'border-green-500/30 bg-green-500/10 text-green-500'
  if (value === 'submitted' || value === 'under_review') return 'border-blue-500/30 bg-blue-500/10 text-blue-500'
  if (value === 'revision_needed') return 'border-amber-500/30 bg-amber-500/10 text-amber-500'
  if (value === 'rejected' || value === 'retired') return 'border-red-500/30 bg-red-500/10 text-red-500'
  return 'border-[var(--pf-border)] bg-[var(--pf-surface)] text-[var(--pf-text-muted)]'
}

export default function FounderProductionAssetsPage() {
  const router = useRouter()
  const { user, supabase, loading: authLoading } = useSupabase()
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [assets, setAssets] = useState<ProductionAssetRecord[]>([])

  const [approvalFilter, setApprovalFilter] = useState('all')
  const [productionFilter, setProductionFilter] = useState('all')
  const [artistFilter, setArtistFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [currentOnly, setCurrentOnly] = useState(false)

  const getAuthToken = useCallback(async () => {
    if (!supabase) return ''
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token || ''
  }, [supabase])

  const loadAssets = useCallback(async () => {
    if (!supabase) return
    setError('')

    try {
      const token = await getAuthToken()
      const res = await fetch('/api/production-assets?current_only=false', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to load production assets')
      }

      const data = await res.json()
      setAssets(data.assets || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load production assets')
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

      if (profileError || !profile || !['admin', 'founder'].includes(profile.role)) {
        router.push('/dashboard')
        return
      }

      await loadAssets()
      setLoading(false)
    }

    void checkAccess()
  }, [authLoading, loadAssets, router, supabase, user])

  async function updateAsset(assetId: string, payload: Record<string, any>) {
    if (!supabase) return
    setSavingId(assetId)
    setError('')
    setNotice('')

    try {
      const token = await getAuthToken()
      const res = await fetch(`/api/production-assets/${assetId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update asset')
      }

      setNotice('Production asset updated')
      await loadAssets()
    } catch (err: any) {
      setError(err.message || 'Failed to update asset')
    } finally {
      setSavingId(null)
    }
  }

  async function removeAsset(assetId: string, assetTitle: string) {
    if (!supabase) return

    const confirmed = window.confirm(
      `Remove "${assetTitle}" from the registry? This only works if it is not linked to any SKUs or fulfillment jobs.`
    )
    if (!confirmed) return

    setSavingId(assetId)
    setError('')
    setNotice('')

    try {
      const token = await getAuthToken()
      const res = await fetch(`/api/production-assets/${assetId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'Failed to remove asset')
      }

      setNotice(`Removed "${assetTitle}" from the registry`)
      await loadAssets()
    } catch (err: any) {
      setError(err.message || 'Failed to remove asset')
    } finally {
      setSavingId(null)
    }
  }

  const artistOptions = useMemo(() => {
    const labels = new Map<string, string>()
    assets.forEach((asset) => {
      const artistLabel = asset.artist?.full_name || asset.artist?.username || asset.artist_id || 'Unassigned'
      const key = asset.artist_id || artistLabel
      if (!labels.has(key)) {
        labels.set(key, artistLabel)
      }
    })
    return Array.from(labels.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [assets])

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesApproval = approvalFilter === 'all' || asset.approval_status === approvalFilter
      const matchesProduction = productionFilter === 'all' || asset.production_status === productionFilter
      const matchesArtist = artistFilter === 'all' || (asset.artist_id || '') === artistFilter
      const matchesType = typeFilter === 'all' || asset.asset_type === typeFilter
      const matchesCurrent = !currentOnly || asset.is_current_version
      return matchesApproval && matchesProduction && matchesArtist && matchesType && matchesCurrent
    })
  }, [assets, approvalFilter, productionFilter, artistFilter, typeFilter, currentOnly])

  const summary = useMemo(() => {
    return {
      total: assets.length,
      review: assets.filter((asset) => asset.approval_status === 'submitted' || asset.approval_status === 'under_review').length,
      approved: assets.filter((asset) => asset.approval_status === 'approved').length,
      productionApproved: assets.filter((asset) => asset.production_status === 'production_approved').length,
    }
  }, [assets])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <div className="animate-pulse text-[var(--pf-text-muted)]">Loading production assets...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="pf-container max-w-7xl space-y-8">
        <div data-tour-id="founder-dashboard-guidance">
          <StageTracker
            title="Founder Review Pipeline"
            stages={[
              { label: 'Submitted', status: assets.some((a) => a.approval_status === 'submitted') ? 'current' : 'pending' },
              { label: 'Under Review', status: assets.some((a) => a.approval_status === 'under_review') ? 'current' : 'pending' },
              { label: 'Approved', status: assets.some((a) => a.approval_status === 'approved') ? 'current' : 'pending' },
              { label: 'Production OK', status: assets.some((a) => a.production_status === 'production_approved') ? 'complete' : 'pending' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-tour-id="founder-assets-review-queue">
          <AttentionCard
            count={summary.review}
            label="Assets in Review Queue"
            href="#review-queue"
            severity="warning"
          />
          <AttentionCard
            count={summary.approved}
            label="Approved — Ready for Production"
            href="#approved"
            severity="info"
          />
          <AttentionCard
            count={summary.productionApproved}
            label="Production Approved"
            href="#production-approved"
            severity="success"
          />
        </div>

        <NextStepCard
          title={summary.review > 0 ? "Review Assets Waiting for Approval" : "No Assets Currently in Review"}
          description={
            summary.review > 0
              ? "Artists have submitted assets that need your review. Approve quality work, request revisions for issues, or reject submissions that don't meet standards."
              : "All submitted assets have been reviewed. When artists submit new assets, they will appear here for your attention."
          }
          actionLabel={summary.review > 0 ? "Jump to Review Queue" : undefined}
          actionHref="#review-queue"
          variant={summary.review > 0 ? 'warning' : 'success'}
        />

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <Link href="/dashboard/founder" className="inline-flex items-center gap-2 text-sm text-[var(--pf-text-muted)] hover:text-[var(--pf-text)]">
              <ArrowLeft size={16} />
              Back to Founder Dashboard
            </Link>
            <h1 className="text-3xl font-bold mt-3 flex items-center gap-3">
              <Shield className="text-[var(--pf-orange)]" />
              Production Asset Review
            </h1>
            <p className="text-[var(--pf-text-muted)] mt-2 max-w-2xl">
              Approve creative assets before they can become production-ready products.
            </p>
          </div>
          <button onClick={loadAssets} className="pf-btn pf-btn-secondary inline-flex items-center gap-2">
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="pf-card p-4">
            <p className="text-xs uppercase text-[var(--pf-text-muted)]">Total Assets</p>
            <p className="text-2xl font-bold mt-1">{summary.total}</p>
          </div>
          <div className="pf-card p-4">
            <p className="text-xs uppercase text-[var(--pf-text-muted)]">Review Queue</p>
            <p className="text-2xl font-bold mt-1">{summary.review}</p>
          </div>
          <div className="pf-card p-4">
            <p className="text-xs uppercase text-[var(--pf-text-muted)]">Approved</p>
            <p className="text-2xl font-bold mt-1">{summary.approved}</p>
          </div>
          <div className="pf-card p-4">
            <p className="text-xs uppercase text-[var(--pf-text-muted)]">Production Approved</p>
            <p className="text-2xl font-bold mt-1">{summary.productionApproved}</p>
          </div>
        </div>

        <div className="pf-card p-4 md:p-6" data-tour-id="founder-assets-actions">
          <div className="grid gap-3 md:grid-cols-5">
            <select
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value)}
              className="rounded-lg border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3"
            >
              <option value="all">All Approval Status</option>
              {PRODUCTION_APPROVAL_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {formatProductionApprovalStatus(status)}
                </option>
              ))}
            </select>

            <select
              value={productionFilter}
              onChange={(e) => setProductionFilter(e.target.value)}
              className="rounded-lg border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3"
            >
              <option value="all">All Production Status</option>
              {PRODUCTION_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {formatProductionStatus(status)}
                </option>
              ))}
            </select>

            <select
              value={artistFilter}
              onChange={(e) => setArtistFilter(e.target.value)}
              className="rounded-lg border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3"
            >
              <option value="all">All Artists</option>
              {artistOptions.map((artist) => (
                <option key={artist.value} value={artist.value}>
                  {artist.label}
                </option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-lg border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3"
            >
              <option value="all">All Asset Types</option>
              {PRODUCTION_ASSET_TYPES.map((type) => (
                <option key={type} value={type}>
                  {formatProductionAssetType(type)}
                </option>
              ))}
            </select>

            <label className="flex items-center gap-3 rounded-lg border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3 text-sm">
              <input
                type="checkbox"
                checked={currentOnly}
                onChange={(e) => setCurrentOnly(e.target.checked)}
              />
              Current versions only
            </label>
          </div>
        </div>

        {filteredAssets.length === 0 ? (
          <EmptyState
            icon={<Shield size={24} />}
            title="No assets match the current filters"
            description="This is where artist submissions appear. Use the filters above to find assets by approval status, production status, artist, or type."
            points={[
              { label: 'What is this?', text: 'The review queue for creative assets submitted by artists.' },
              { label: 'Why it matters', text: 'Approved assets are the only ones that can move into SKU creation.' },
              { label: 'Next step', text: 'Clear the filters or review new submissions when they arrive.' },
            ]}
          />
        ) : (
          <div className="space-y-4">
            {filteredAssets.map((asset) => (
              <div key={asset.asset_id} className="pf-card p-5 space-y-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h2 className="text-xl font-semibold">{asset.title}</h2>
                    <p className="text-sm text-[var(--pf-text-muted)] mt-1">
                      {formatProductionAssetType(asset.asset_type)} • v{asset.version_number}{' '}
                      {asset.is_current_version ? '• current' : '• previous'}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <span className={`text-xs px-2 py-1 rounded-full border ${badgeClasses(asset.approval_status)}`}>
                      {formatProductionApprovalStatus(asset.approval_status)}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full border ${badgeClasses(asset.production_status)}`}>
                      {formatProductionStatus(asset.production_status)}
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2 text-sm">
                  <div className="space-y-1 text-[var(--pf-text-secondary)]">
                    <p><span className="text-[var(--pf-text-muted)]">Artist:</span> {asset.artist?.full_name || asset.artist?.username || asset.artist_id || 'Unassigned'}</p>
                    <p><span className="text-[var(--pf-text-muted)]">Creator:</span> {asset.creator?.full_name || asset.creator?.username || asset.creator_id || 'Unknown'}</p>
                    <p><span className="text-[var(--pf-text-muted)]">Asset ID:</span> {asset.asset_id}</p>
                    <p><span className="text-[var(--pf-text-muted)]">Asset Group:</span> {asset.asset_group_id}</p>
                    <p><span className="text-[var(--pf-text-muted)]">Source Song:</span> {asset.source_song_id || 'None'}</p>
                    <p><span className="text-[var(--pf-text-muted)]">Source Campaign:</span> {asset.source_campaign || 'None'}</p>
                  </div>
                  <div className="space-y-1 text-[var(--pf-text-secondary)]">
                    <p><span className="text-[var(--pf-text-muted)]">Rights:</span> {asset.rights_notes || 'None'}</p>
                    <p><span className="text-[var(--pf-text-muted)]">Usage:</span> {asset.usage_notes || 'None'}</p>
                    <p><span className="text-[var(--pf-text-muted)]">Review Notes:</span> {asset.review_notes || 'None'}</p>
                    <p><span className="text-[var(--pf-text-muted)]">Change Notes:</span> {asset.change_notes || 'None'}</p>
                    <p><span className="text-[var(--pf-text-muted)]">Approved At:</span> {asset.approved_at ? new Date(asset.approved_at).toLocaleString() : 'Not yet approved'}</p>
                    <p><span className="text-[var(--pf-text-muted)]">Approved By:</span> {asset.approver?.full_name || asset.approver?.username || asset.approved_by || 'None'}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => updateAsset(asset.asset_id, { approval_status: 'under_review' })}
                    disabled={savingId === asset.asset_id}
                    className="pf-btn pf-btn-secondary text-sm disabled:opacity-60"
                  >
                    Under Review
                  </button>
                  <button
                    onClick={() => updateAsset(asset.asset_id, { approval_status: 'approved' })}
                    disabled={savingId === asset.asset_id}
                    className="pf-btn pf-btn-primary text-sm disabled:opacity-60"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateAsset(asset.asset_id, { approval_status: 'revision_needed' })}
                    disabled={savingId === asset.asset_id}
                    className="pf-btn pf-btn-secondary text-sm disabled:opacity-60"
                  >
                    Revision Needed
                  </button>
                  <button
                    onClick={() => updateAsset(asset.asset_id, { approval_status: 'rejected' })}
                    disabled={savingId === asset.asset_id}
                    className="pf-btn pf-btn-secondary text-sm disabled:opacity-60"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => updateAsset(asset.asset_id, { production_status: 'production_approved' })}
                    disabled={savingId === asset.asset_id || asset.approval_status !== 'approved'}
                    className="pf-btn pf-btn-secondary text-sm disabled:opacity-60"
                  >
                    Mark Production Approved
                  </button>
                  <button
                    onClick={() => updateAsset(asset.asset_id, { production_status: 'retired' })}
                    disabled={savingId === asset.asset_id}
                    className="pf-btn pf-btn-secondary text-sm disabled:opacity-60"
                  >
                    Retire
                  </button>
                  <button
                    onClick={() => removeAsset(asset.asset_id, asset.title)}
                    disabled={savingId === asset.asset_id}
                    className="pf-btn pf-btn-secondary text-sm border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 disabled:opacity-60 inline-flex items-center gap-2"
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
