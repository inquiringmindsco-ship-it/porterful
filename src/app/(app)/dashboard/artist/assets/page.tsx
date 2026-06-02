'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, RefreshCw, Send } from 'lucide-react'
import { useSupabase } from '@/app/providers'
import {
  formatProductionApprovalStatus,
  formatProductionAssetType,
  formatProductionStatus,
  PRODUCTION_ASSET_TYPES,
} from '@/lib/production-assets'
import { StageTracker, NextStepCard, EmptyState } from '@/components/guidance/GuidedExperience'

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

export default function ArtistProductionAssetsPage() {
  const router = useRouter()
  const { user, supabase, loading: authLoading } = useSupabase()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [assets, setAssets] = useState<ProductionAssetRecord[]>([])

  const [assetType, setAssetType] = useState('merch_design')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [sourceSongId, setSourceSongId] = useState('')
  const [sourceCampaign, setSourceCampaign] = useState('')
  const [fileUrl, setFileUrl] = useState('')
  const [referenceUrl, setReferenceUrl] = useState('')
  const [rightsNotes, setRightsNotes] = useState('')
  const [usageNotes, setUsageNotes] = useState('')
  const [changeNotes, setChangeNotes] = useState('')
  const [priorVersionId, setPriorVersionId] = useState('')

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

      if (profileError || !profile || !['artist', 'admin', 'founder'].includes(profile.role)) {
        router.push('/dashboard')
        return
      }

      await loadAssets()
      setLoading(false)
    }

    void checkAccess()
  }, [authLoading, loadAssets, router, supabase, user])

  async function submitAsset() {
    if (!supabase) return
    setSaving(true)
    setError('')
    setNotice('')

    try {
      const token = await getAuthToken()
      const payload: Record<string, any> = {
        asset_type: assetType,
        title,
        description: description || null,
        source_song_id: sourceSongId || null,
        source_campaign: sourceCampaign || null,
        file_url: fileUrl || null,
        reference_url: referenceUrl || null,
        rights_notes: rightsNotes || null,
        usage_notes: usageNotes || null,
        change_notes: changeNotes || null,
      }

      if (priorVersionId) {
        payload.prior_version_id = priorVersionId
      }

      const res = await fetch('/api/production-assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit asset')
      }

      setNotice('Production asset submitted for review')
      setAssetType('merch_design')
      setTitle('')
      setDescription('')
      setSourceSongId('')
      setSourceCampaign('')
      setFileUrl('')
      setReferenceUrl('')
      setRightsNotes('')
      setUsageNotes('')
      setChangeNotes('')
      setPriorVersionId('')
      await loadAssets()
    } catch (err: any) {
      setError(err.message || 'Failed to submit asset')
    } finally {
      setSaving(false)
    }
  }

  const currentAssets = useMemo(() => {
    return assets.filter((asset) => asset.is_current_version)
  }, [assets])

  const summary = useMemo(() => {
    return {
      total: assets.length,
      submitted: assets.filter((asset) => asset.approval_status === 'submitted').length,
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
      <div className="pf-container max-w-6xl space-y-8">
        {/* GUIDANCE: Artist Asset Path */}
        <StageTracker
          title="Your Asset Journey"
          stages={[
            { label: 'Submit', status: assets.length > 0 ? 'complete' : 'current' },
            { label: 'Review', status: assets.some((a) => a.approval_status === 'under_review') ? 'current' : assets.some((a) => ['approved', 'production_approved'].includes(a.approval_status)) ? 'complete' : 'pending' },
            { label: 'Approved', status: assets.some((a) => a.approval_status === 'approved') ? 'current' : assets.some((a) => a.production_status === 'production_approved') ? 'complete' : 'pending' },
            { label: 'Production OK', status: assets.some((a) => a.production_status === 'production_approved') ? 'complete' : 'pending' },
          ]}
        />

        <NextStepCard
          title={assets.length === 0 ? "Submit Your First Production Asset" : "Track Your Asset Status"}
          description={
            assets.length === 0
              ? "Upload artwork, designs, or music for founder review. Assets must be approved before they can become products."
              : "Your assets are under review. Founders will approve, reject, or request revisions. Check back for status updates."
          }
          actionLabel={assets.length === 0 ? "Submit Asset" : undefined}
          actionHref={assets.length === 0 ? "#submit-form" : undefined}
        />

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <Link href="/dashboard/artist" className="inline-flex items-center gap-2 text-sm text-[var(--pf-text-muted)] hover:text-[var(--pf-text)]">
              <ArrowLeft size={16} />
              Back to Artist Dashboard
            </Link>
            <h1 className="text-3xl font-bold mt-3">Production Asset Registry</h1>
            <p className="text-[var(--pf-text-muted)] mt-2 max-w-2xl">
              Submit artwork, likeness, campaign, and merch assets for review before they ever become products.
            </p>
          </div>
          <button
            onClick={loadAssets}
            className="pf-btn pf-btn-secondary inline-flex items-center gap-2"
          >
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
            <p className="text-xs uppercase text-[var(--pf-text-muted)]">Submitted</p>
            <p className="text-2xl font-bold mt-1">{summary.submitted}</p>
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

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="pf-card p-6 space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Submit a production asset</h2>
              <p className="text-sm text-[var(--pf-text-muted)] mt-1">
                Assets stay in approval flow until a founder marks them production approved.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm text-[var(--pf-text-muted)]">Asset Type</span>
                <select
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value)}
                  className="w-full rounded-lg border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3"
                >
                  {PRODUCTION_ASSET_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {formatProductionAssetType(type)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm text-[var(--pf-text-muted)]">Title</span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3"
                  placeholder="Coming Home Tour Poster"
                />
              </label>

              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm text-[var(--pf-text-muted)]">Description</span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3"
                  placeholder="Short description of the asset"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm text-[var(--pf-text-muted)]">Source Song ID (optional)</span>
                <input
                  value={sourceSongId}
                  onChange={(e) => setSourceSongId(e.target.value)}
                  className="w-full rounded-lg border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3"
                  placeholder="Track UUID"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm text-[var(--pf-text-muted)]">Source Campaign (optional)</span>
                <input
                  value={sourceCampaign}
                  onChange={(e) => setSourceCampaign(e.target.value)}
                  className="w-full rounded-lg border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3"
                  placeholder="Summer Tour 2026"
                />
              </label>

              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm text-[var(--pf-text-muted)]">File URL</span>
                <input
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  className="w-full rounded-lg border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3"
                  placeholder="https://..."
                />
              </label>

              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm text-[var(--pf-text-muted)]">Reference URL (optional)</span>
                <input
                  value={referenceUrl}
                  onChange={(e) => setReferenceUrl(e.target.value)}
                  className="w-full rounded-lg border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3"
                  placeholder="Alternative source or preview link"
                />
              </label>

              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm text-[var(--pf-text-muted)]">Base on existing asset (optional)</span>
                <select
                  value={priorVersionId}
                  onChange={(e) => setPriorVersionId(e.target.value)}
                  className="w-full rounded-lg border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3"
                >
                  <option value="">Start a new asset lineage</option>
                  {currentAssets.map((asset) => (
                    <option key={asset.asset_id} value={asset.asset_id}>
                      {asset.title} v{asset.version_number} ({formatProductionApprovalStatus(asset.approval_status)})
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm text-[var(--pf-text-muted)]">Rights Notes</span>
                <textarea
                  value={rightsNotes}
                  onChange={(e) => setRightsNotes(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3"
                  placeholder="Ownership, licensing, and usage constraints"
                />
              </label>

              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm text-[var(--pf-text-muted)]">Usage Notes</span>
                <textarea
                  value={usageNotes}
                  onChange={(e) => setUsageNotes(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3"
                  placeholder="How the asset can be used across products and campaigns"
                />
              </label>

              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm text-[var(--pf-text-muted)]">Change Notes</span>
                <textarea
                  value={changeNotes}
                  onChange={(e) => setChangeNotes(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3"
                  placeholder="What changed in this revision?"
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={submitAsset}
                disabled={saving}
                className="pf-btn pf-btn-primary inline-flex items-center gap-2 disabled:opacity-60"
              >
                <Send size={16} />
                {saving ? 'Submitting...' : 'Submit for Review'}
              </button>
              <button
                onClick={() => {
                  setAssetType('merch_design')
                  setTitle('')
                  setDescription('')
                  setSourceSongId('')
                  setSourceCampaign('')
                  setFileUrl('')
                  setReferenceUrl('')
                  setRightsNotes('')
                  setUsageNotes('')
                  setChangeNotes('')
                  setPriorVersionId('')
                }}
                className="pf-btn pf-btn-secondary"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="pf-card p-6 space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Your submitted assets</h2>
              <p className="text-sm text-[var(--pf-text-muted)] mt-1">
                Review status updates live as founders move assets through approval.
              </p>
            </div>

            {assets.length === 0 ? (
              <EmptyState
                icon={<Send size={24} />}
                title="No assets submitted yet"
                description="Production assets are artwork, designs, photographs, and other creative files that founders review before they become sellable products."
                points={[
                  { label: 'What is this?', text: 'A registry for the creative files you want reviewed.' },
                  { label: 'Why it matters', text: 'Founders need an approved asset before they can create a SKU.' },
                  { label: 'Next step', text: 'Submit your first asset to start the review process.' },
                ]}
                actionLabel="Submit Asset"
                actionHref="#submit-form"
              />
            ) : (
              <div className="space-y-3">
                {assets.map((asset) => (
                  <div key={asset.asset_id} className="rounded-xl border border-[var(--pf-border)] p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{asset.title}</p>
                        <p className="text-sm text-[var(--pf-text-muted)]">
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

                    <div className="text-sm text-[var(--pf-text-secondary)] space-y-1">
                      <p>Asset ID: {asset.asset_id}</p>
                      <p>Artist: {asset.artist?.full_name || asset.artist?.username || 'Unassigned'}</p>
                      {asset.review_notes && <p>Founder notes: {asset.review_notes}</p>}
                      {asset.change_notes && <p>Revision notes: {asset.change_notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
