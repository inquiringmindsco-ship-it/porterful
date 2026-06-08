'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/app/providers'
import Link from 'next/link'
import { ArrowLeft, Music, Package, Upload } from 'lucide-react'
import { GuidanceRoadmap, StageTracker, EmptyState } from '@/components/guidance/GuidedExperience'
import { useGuidedTour } from '@/components/guidance/GuidedTour'
import { canonicalAlbum } from '@/lib/duration-formatter'
import { CollaboratorStack } from '@/components/artist/CollaboratorStack'
import { buildTrackArtistCredits } from '@/lib/artist-credits'

const Icon = {
  Music: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>,
  Package: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27,6.96 12,12.01 20.73,6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>,
  Upload: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17,8 12,3 7,8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
  Star: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" /></svg>,
  Eye: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
  Edit: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
  Trash: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,6 5,6 21,6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>,
  Plus: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  ChevronUp: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18,15 12,9 6,15" /></svg>,
  ChevronDown: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6,9 12,15 18,9" /></svg>,
}

export default function ArtistDashboardPage() {
  const router = useRouter()
  const { user, supabase, loading: authLoading } = useSupabase()
  const { restartTour } = useGuidedTour()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'tracks' | 'products'>('tracks')
  const [dbTracks, setDbTracks] = useState<any[]>([])
  const [dbProducts, setDbProducts] = useState<any[]>([])
  const [productionAssets, setProductionAssets] = useState<any[]>([])
  const [artistSkus, setArtistSkus] = useState<any[]>([])
  const [inventorySummaries, setInventorySummaries] = useState<any[]>([])
  const [fulfillmentJobs, setFulfillmentJobs] = useState<any[]>([])
  const [featured, setFeatured] = useState<string[]>([])
  
  // Search and filter states
  const [trackSearch, setTrackSearch] = useState('')
  const [trackStatusFilter, setTrackStatusFilter] = useState<'all' | 'live' | 'hidden'>('all')
  const [trackSort, setTrackSort] = useState<'newest' | 'oldest'>('newest')
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([])
  const [selectedAlbums, setSelectedAlbums] = useState<string[]>([])
  const [bulkPrice, setBulkPrice] = useState('0.50')
  const [bulkSaving, setBulkSaving] = useState(false)
  const [bulkNotice, setBulkNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const getProductTitle = (product: any) => product.title || product.name || 'Untitled product'
  const getProductImage = (product: any) => {
    if (product.image_url) return product.image_url
    const metadataImages = product.metadata?.images
    return Array.isArray(metadataImages) && metadataImages.length > 0 ? metadataImages[0] : null
  }
  const getProductPrice = (product: any) => Number(product.price ?? product.base_price ?? 0)

  const loadTracks = useCallback(async () => {
    if (!supabase || !user) return

    const { data } = await supabase
      .from('tracks')
      .select('*')
      .eq('artist_id', user.id)
      .order('created_at', { ascending: false })

    setDbTracks(data || [])
  }, [supabase, user])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login')
      return
    }

    async function loadProducts() {
      const { data } = await supabase!
        .from('products')
        .select('*')
        .eq('seller_id', user!.id)
        .order('created_at', { ascending: false })
      setDbProducts(data || [])
    }

    async function loadGuidance() {
      const { data: { session } } = await supabase!.auth.getSession()
      const headers = { Authorization: `Bearer ${session?.access_token || ''}` }

      const [assetsRes, skusRes, inventoryRes, jobsRes] = await Promise.all([
        fetch('/api/production-assets?current_only=true', {
          headers,
          cache: 'no-store',
        }),
        fetch('/api/product-skus', {
          headers,
          cache: 'no-store',
        }),
        fetch('/api/inventory-ledger?limit=200', {
          headers,
          cache: 'no-store',
        }),
        fetch('/api/fulfillment-jobs?limit=200', {
          headers,
          cache: 'no-store',
        }),
      ])

      if (assetsRes.ok) {
        const data = await assetsRes.json().catch(() => ({}))
        setProductionAssets(data.assets || [])
      }

      if (skusRes.ok) {
        const data = await skusRes.json().catch(() => ({}))
        setArtistSkus(data.skus || [])
      }

      if (inventoryRes.ok) {
        const data = await inventoryRes.json().catch(() => ({}))
        setInventorySummaries(data.summaries || [])
      }

      if (jobsRes.ok) {
        const data = await jobsRes.json().catch(() => ({}))
        setFulfillmentJobs(data.jobs || [])
      }
    }

    async function checkAccess() {
      if (!supabase || !user) return
      try {
        const { data: serverUser, error: profileError } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('id', user.id)
          .single()

        if (profileError || !serverUser) {
          router.push('/login')
          return
        }

        if (!['artist', 'admin', 'founder'].includes(serverUser.role)) {
          router.push('/dashboard')
          return
        }

        setProfile(serverUser)
        await Promise.all([loadTracks(), loadProducts(), loadGuidance()])
      } catch {
        router.push('/login')
        return
      }

      setLoading(false)
    }

    void checkAccess()
  }, [user, supabase, authLoading, router, loadTracks])

  const guidance = useMemo(() => {
    const submittedAssets = productionAssets.filter((asset: any) =>
      ['submitted', 'under_review'].includes(asset.approval_status)
    )
    const productionApprovedAssets = productionAssets.filter((asset: any) =>
      asset.production_status === 'production_approved'
    )
    const activeSkus = artistSkus.filter((sku: any) => sku.active)
    const availableInventory = inventorySummaries.reduce(
      (sum: number, summary: any) => sum + Number(summary.available || 0),
      0
    )
    const openJobs = fulfillmentJobs.filter((job: any) =>
      ['pending', 'reserved', 'printing', 'qc', 'packed'].includes(job.status)
    )
    const shippedJobs = fulfillmentJobs.filter((job: any) =>
      ['shipped', 'delivered'].includes(job.status)
    )
    const exceptionJobs = fulfillmentJobs.filter((job: any) => job.status === 'exception')

    let currentStage = 'Ready to upload'
    let nextStep = 'Upload your first track.'
    let actionLabel = 'Upload'
    let actionHref = '/dashboard/upload'

    if (dbTracks.length > 0 && dbTracks.filter((t: any) => t.is_active).length === 0) {
      currentStage = 'Track uploaded'
      nextStep = 'Make it live when you are ready.'
      actionLabel = 'Files'
      actionHref = '/dashboard/artist/assets'
    } else if (dbTracks.filter((t: any) => t.is_active).length > 0) {
      currentStage = 'Music live'
      nextStep = 'Share your link and track results.'
      actionLabel = 'View Store'
      actionHref = '/store'
    }

    return {
      currentStage,
      nextStep,
      actionLabel,
      actionHref,
      submittedAssets,
      productionApprovedAssets,
      activeSkus,
      availableInventory,
      openJobs,
      shippedJobs,
      exceptionJobs,
    }
  }, [artistSkus, fulfillmentJobs, inventorySummaries, productionAssets])

  const visibleTracks = useMemo(() => {
    return dbTracks
      .filter((track) => {
        const matchesSearch = !trackSearch ||
          track.title?.toLowerCase().includes(trackSearch.toLowerCase()) ||
          track.artist?.toLowerCase().includes(trackSearch.toLowerCase())
        const matchesStatus = trackStatusFilter === 'all' ||
          (trackStatusFilter === 'live' && track.is_active) ||
          (trackStatusFilter === 'hidden' && !track.is_active)
        return matchesSearch && matchesStatus
      })
      .sort((a, b) => {
        if (trackSort === 'newest') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        }
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      })
  }, [dbTracks, trackSearch, trackStatusFilter, trackSort])

  const albumGroups = useMemo(() => {
    const groups = new Map<string, {
      name: string
      trackCount: number
      liveCount: number
      hiddenCount: number
      coverUrl: string | null
      minPrice: number | null
      maxPrice: number | null
    }>()

    dbTracks.forEach((track: any) => {
      const name = canonicalAlbum(track.album) || 'Singles'
      const next = groups.get(name) || {
        name,
        trackCount: 0,
        liveCount: 0,
        hiddenCount: 0,
        coverUrl: null,
        minPrice: null,
        maxPrice: null,
      }

      next.trackCount += 1
      if (track.is_active) {
        next.liveCount += 1
      } else {
        next.hiddenCount += 1
      }

      const price = Number(track.proud_to_pay_min ?? 0)
      if (Number.isFinite(price)) {
        next.minPrice = next.minPrice === null ? price : Math.min(next.minPrice, price)
        next.maxPrice = next.maxPrice === null ? price : Math.max(next.maxPrice, price)
      }

      if (!next.coverUrl && track.cover_url) {
        next.coverUrl = track.cover_url
      }

      groups.set(name, next)
    })

    return Array.from(groups.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [dbTracks])

  const selectedAlbumTrackIds = useMemo(() => {
    const selected = new Set<string>()
    const albumSet = new Set(selectedAlbums)

    dbTracks.forEach((track: any) => {
      const name = canonicalAlbum(track.album) || 'Singles'
      if (albumSet.has(name)) {
        selected.add(track.id)
      }
    })

    return selected
  }, [dbTracks, selectedAlbums])

  const bulkSelectionCount = useMemo(() => {
    return new Set<string>([...selectedTrackIds, ...Array.from(selectedAlbumTrackIds)]).size
  }, [selectedTrackIds, selectedAlbumTrackIds])

  function clearBulkSelection() {
    setSelectedTrackIds([])
    setSelectedAlbums([])
    setBulkNotice(null)
  }

  function toggleTrackSelection(trackId: string) {
    setBulkNotice(null)
    setSelectedTrackIds((current) =>
      current.includes(trackId)
        ? current.filter((id) => id !== trackId)
        : [...current, trackId]
    )
  }

  function toggleAlbumSelection(albumName: string) {
    setBulkNotice(null)
    setSelectedAlbums((current) =>
      current.includes(albumName)
        ? current.filter((name) => name !== albumName)
        : [...current, albumName]
    )
  }

  async function applyBulkUpdate(action: 'hide' | 'show' | 'set_price') {
    if (!supabase || bulkSaving) return

    if (selectedTrackIds.length === 0 && selectedAlbums.length === 0) {
      setBulkNotice({ type: 'error', text: 'Select at least one track or album first.' })
      return
    }

    const parsedPrice = Number.parseFloat(bulkPrice)
    if (action === 'set_price' && (!Number.isFinite(parsedPrice) || parsedPrice < 0)) {
      setBulkNotice({ type: 'error', text: 'Enter a valid price before updating selected items.' })
      return
    }

    setBulkSaving(true)
    setBulkNotice(null)

    try {
      const res = await fetch('/api/tracks/bulk', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          action,
          price: action === 'set_price' ? Math.max(0, parsedPrice) : undefined,
          track_ids: selectedTrackIds,
          album_names: selectedAlbums,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'Bulk update failed')
      }

      const updatedCount = Number(data.updated_count || 0)
      setBulkNotice({
        type: 'success',
        text:
          action === 'hide'
            ? `Hidden ${updatedCount} track${updatedCount === 1 ? '' : 's'}`
            : action === 'show'
              ? `Made ${updatedCount} track${updatedCount === 1 ? '' : 's'} live`
              : `Updated price on ${updatedCount} track${updatedCount === 1 ? '' : 's'}`,
      })
      clearBulkSelection()
      await loadTracks()
    } catch (err: any) {
      setBulkNotice({ type: 'error', text: err.message || 'Failed to update selected items.' })
    } finally {
      setBulkSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="pf-container">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-[var(--pf-surface)] rounded w-1/4" />
            <div className="h-32 bg-[var(--pf-surface)] rounded" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="pf-container max-w-4xl">

        {/* GUIDANCE: Artist Path */}
        <div data-tour-id="artist-dashboard-guidance">
          <StageTracker
            title="Your Progress"
            stages={[
              { label: 'Upload', status: dbTracks.length > 0 ? 'complete' : 'current' },
              { label: 'In Review', status: guidance.submittedAssets.length > 0 ? 'current' : productionAssets.length > 0 ? 'complete' : 'pending' },
              { label: 'Live', status: dbTracks.filter((t: any) => t.is_active).length > 0 ? 'complete' : 'pending' },
            ]}
          />
        </div>

        <GuidanceRoadmap
          eyebrow="Next step"
          title={dbTracks.length === 0 ? "Start with one song" : "Your music is live"}
          description={dbTracks.length === 0 
            ? "Upload a track, add cover art, and set a price."
            : "Share your link and watch activity come in."
          }
          currentStage={guidance.currentStage}
          nextStep={dbTracks.length === 0 ? "Upload your first track." : guidance.nextStep}
          signals={[
            {
              label: 'My Files',
              value: `${productionAssets.length} items`,
              tone: productionAssets.length > 0 ? 'success' : 'neutral',
            },
            {
              label: 'Tracks live',
              value: `${dbTracks.filter((t: any) => t.is_active).length}`,
              tone: dbTracks.filter((t: any) => t.is_active).length > 0 ? 'success' : 'neutral',
            },
          ]}
          actionLabel={dbTracks.length === 0 ? "Upload" : guidance.actionLabel}
          actionHref={dbTracks.length === 0 ? "/dashboard/upload" : guidance.actionHref}
        />

        <div className="mb-8 flex flex-wrap gap-2">
          {[
            { href: '/dashboard/artist', label: 'My Music' },
            { href: '/dashboard/artist/assets', label: 'My Files' },
            { href: '/dashboard/artist/edit', label: 'Appearance' },
            { href: '/dashboard/artist/inventory', label: 'Inventory' },
            { href: '/dashboard/artist/fulfillment', label: 'Fulfillment' },
            { href: '/store', label: 'Store' },
            { href: '/settings/settings', label: 'Settings' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-2 text-sm font-medium text-[var(--pf-text-secondary)] transition-colors hover:border-[var(--pf-orange)] hover:text-[var(--pf-text)]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Music</h1>
            <p className="text-sm text-[var(--pf-text-secondary)]">Tracks, products, and status</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/dashboard/artist/assets" className="pf-btn pf-btn-secondary flex items-center gap-2" data-tour-id="artist-assets-link">
                <Icon.Package /> My Files
              </Link>
              <Link href="/dashboard/artist/edit" className="pf-btn pf-btn-secondary flex items-center gap-2">
                <Icon.Edit /> Appearance
              </Link>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/upload" className="pf-btn pf-btn-primary flex items-center gap-2 text-lg px-6 py-3">
              <Icon.Upload /> Upload
            </Link>
            <Link href="/store" className="pf-btn pf-btn-secondary flex items-center gap-2">
              <Icon.Package /> View Store
            </Link>
          </div>
        </div>

        {/* Summary row — compact, single row, no big stat cards */}
        <div className="rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)] divide-x divide-[var(--pf-border)] grid grid-cols-3 mb-8 overflow-hidden" data-tour-id="artist-dashboard-summary">
          <div className="px-4 py-3">
            <p className="text-xl font-bold">{dbTracks.length}</p>
            <p className="text-xs text-[var(--pf-text-muted)]">Tracks</p>
          </div>
          <div className="px-4 py-3">
            <p className="text-xl font-bold">{dbProducts.length}</p>
            <p className="text-xs text-[var(--pf-text-muted)]">Products</p>
          </div>
          <div className="px-4 py-3">
            <p className="text-xl font-bold">{dbProducts.filter((p: any) => p.status === 'live').length}</p>
            <p className="text-xs text-[var(--pf-text-muted)]">Live Products</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-[var(--pf-border)] mb-6">
          <div className="flex gap-8">
            {(['tracks', 'products'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={
                  'pb-4 font-semibold capitalize transition-colors ' +
                  (activeTab === tab
                    ? 'text-[var(--pf-orange)] border-b-2 border-[var(--pf-orange)]'
                    : 'text-[var(--pf-text-muted)] hover:text-[var(--pf-text)]')
                }
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tracks Tab — REAL DB DATA */}
        {activeTab === 'tracks' && (
          <div className="space-y-5">
            {bulkNotice && (
              <div className={`rounded-xl border p-4 text-sm ${
                bulkNotice.type === 'success'
                  ? 'border-green-500/20 bg-green-500/10 text-green-300'
                  : 'border-red-500/20 bg-red-500/10 text-red-300'
              }`}>
                {bulkNotice.text}
              </div>
            )}

            {(selectedTrackIds.length > 0 || selectedAlbums.length > 0) && (
              <div className="pf-card p-4 border border-[var(--pf-orange)]/20 bg-[var(--pf-orange)]/5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-semibold text-[var(--pf-text)]">
                      {selectedTrackIds.length} track{selectedTrackIds.length === 1 ? '' : 's'} and {selectedAlbums.length} album{selectedAlbums.length === 1 ? '' : 's'} selected
                    </p>
                    <p className="text-sm text-[var(--pf-text-muted)] mt-1">
                      Use bulk actions to hide selected work or update the price across the chosen tracks and albums. Affects {bulkSelectionCount} track{bulkSelectionCount === 1 ? '' : 's'}.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2 rounded-lg border border-[var(--pf-border)] bg-[var(--pf-surface)] px-3 py-2">
                      <span className="text-sm text-[var(--pf-text-muted)]">$</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={bulkPrice}
                        onChange={(e) => setBulkPrice(e.target.value)}
                        className="w-20 bg-transparent text-sm outline-none"
                        aria-label="Bulk price"
                        placeholder="0.50"
                      />
                    </div>
                    <button
                      onClick={() => applyBulkUpdate('hide')}
                      disabled={bulkSaving}
                      className="pf-btn pf-btn-secondary text-sm disabled:opacity-60"
                    >
                      Hide
                    </button>
                    <button
                      onClick={() => applyBulkUpdate('show')}
                      disabled={bulkSaving}
                      className="pf-btn pf-btn-secondary text-sm disabled:opacity-60"
                    >
                      Show
                    </button>
                    <button
                      onClick={() => applyBulkUpdate('set_price')}
                      disabled={bulkSaving}
                      className="pf-btn pf-btn-primary text-sm disabled:opacity-60"
                    >
                      {bulkSaving ? 'Updating...' : 'Set Price'}
                    </button>
                    <button
                      onClick={clearBulkSelection}
                      disabled={bulkSaving}
                      className="pf-btn pf-btn-secondary text-sm disabled:opacity-60"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={trackSearch}
                  onChange={(e) => setTrackSearch(e.target.value)}
                  placeholder="Search tracks..."
                  className="w-full px-4 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] text-sm focus:border-[var(--pf-orange)] focus:outline-none"
                />
              </div>
              <select
                value={trackStatusFilter}
                onChange={(e) => setTrackStatusFilter(e.target.value as any)}
                className="px-4 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] text-sm focus:border-[var(--pf-orange)] focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="live">Live</option>
                <option value="hidden">Hidden</option>
              </select>
              <select
                value={trackSort}
                onChange={(e) => setTrackSort(e.target.value as any)}
                className="px-4 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] text-sm focus:border-[var(--pf-orange)] focus:outline-none"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
              <Link href="/dashboard/upload" className="pf-btn pf-btn-primary flex items-center gap-2 whitespace-nowrap">
                <Icon.Plus /> Upload
              </Link>
            </div>

            {dbTracks.length === 0 ? (
              <EmptyState
                icon={<Music size={24} />}
                title="No tracks yet"
                description="Upload one track to get started. Add cover art and a price."
                points={[
                  { label: 'What is this?', text: 'Your music library and product view.' },
                  { label: 'Why it matters', text: 'This is where your work becomes visible.' },
                  { label: 'Next step', text: 'Upload your first track.' },
                ]}
                actionLabel="Upload"
                actionHref="/dashboard/upload"
              />
            ) : (
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold">Albums</h2>
                      <p className="text-sm text-[var(--pf-text-muted)]">Select an album to hide or reprice every track inside it.</p>
                    </div>
                  </div>

                  {albumGroups.length === 0 ? (
                    <EmptyState
                      icon={<Package size={24} />}
                      title="No albums yet"
                      description="Albums appear when your tracks are grouped under an album name."
                      points={[
                        { label: 'What is this?', text: 'Album-level controls for grouped tracks.' },
                        { label: 'Why it matters', text: 'One change can affect every track in the album.' },
                        { label: 'Next step', text: 'Add an album name to tracks you want grouped.' },
                      ]}
                    />
                  ) : (
                    <div className="grid gap-3 md:grid-cols-2">
                      {albumGroups.map((album) => {
                        const albumSelected = selectedAlbums.includes(album.name)
                        const priceLabel =
                          album.minPrice !== null && album.maxPrice !== null && album.minPrice === album.maxPrice
                            ? `$${album.minPrice.toFixed(2)}`
                            : album.minPrice !== null && album.maxPrice !== null
                              ? `$${album.minPrice.toFixed(2)} - $${album.maxPrice.toFixed(2)}`
                              : 'No price set'

                        return (
                          <div
                            key={album.name}
                            onClick={() => toggleAlbumSelection(album.name)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                toggleAlbumSelection(album.name)
                              }
                            }}
                            role="button"
                            tabIndex={0}
                            className={`text-left pf-card p-4 border transition-colors ${albumSelected ? 'border-[var(--pf-orange)]/40 bg-[var(--pf-orange)]/8' : 'border-[var(--pf-border)] hover:border-[var(--pf-orange)]/25'}`}
                          >
                            <div className="flex items-start gap-4">
                              <input
                                type="checkbox"
                                checked={albumSelected}
                                onChange={() => toggleAlbumSelection(album.name)}
                                onClick={(e) => e.stopPropagation()}
                                className="mt-1"
                                aria-label={`Select album ${album.name}`}
                              />
                              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[var(--pf-surface)] shrink-0">
                                {album.coverUrl ? (
                                  <Image src={album.coverUrl} alt={album.name} fill sizes="56px" className="object-cover" />
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center text-[var(--pf-text-muted)]">
                                    <Icon.Package />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className="font-semibold truncate">{album.name}</p>
                                    <p className="text-sm text-[var(--pf-text-muted)]">
                                      {album.trackCount} track{album.trackCount === 1 ? '' : 's'} • {album.liveCount} live • {album.hiddenCount} hidden
                                    </p>
                                  </div>
                                  <span className="text-xs px-2 py-1 rounded-full border border-[var(--pf-border)] bg-[var(--pf-surface)] text-[var(--pf-text-muted)]">
                                    Album
                                  </span>
                                </div>
                                <p className="mt-2 text-sm text-[var(--pf-text-secondary)]">
                                  Price range: {priceLabel}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold">Tracks</h2>
                      <p className="text-sm text-[var(--pf-text-muted)]">
                        Select one or many tracks to hide them or change their price together.
                      </p>
                    </div>
                    <p className="text-xs text-[var(--pf-text-muted)]">
                      {visibleTracks.length} track{visibleTracks.length === 1 ? '' : 's'} shown
                    </p>
                  </div>

                  {visibleTracks.length === 0 ? (
                    <EmptyState
                      icon={<Music size={24} />}
                      title="No tracks match the current filters"
                      description="Try a different search, status, or sort setting to find the tracks you want to update."
                      points={[
                        { label: 'What is this?', text: 'A filtered view of your track catalog.' },
                        { label: 'Why it matters', text: 'Filters help you find the exact items you want to change.' },
                        { label: 'Next step', text: 'Clear the filters or search for a different title.' },
                      ]}
                    />
                  ) : (
                    <div className="space-y-3">
                      {visibleTracks.map((track) => (
                        <div key={track.id} className="pf-card p-4 flex items-center gap-4">
                          <input
                            type="checkbox"
                            checked={selectedTrackIds.includes(track.id)}
                            onChange={() => toggleTrackSelection(track.id)}
                            aria-label={`Select track ${track.title}`}
                            className="shrink-0"
                          />
                          <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-[var(--pf-surface)] shrink-0">
                            {track.cover_url ? (
                              <Image src={track.cover_url} alt={track.title} fill sizes="56px" className="object-cover" />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-[var(--pf-text-muted)]">
                                <Icon.Music />
                              </div>
                            )}
                          </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{track.title}</p>
                        <p className="text-sm text-[var(--pf-text-muted)]">
                          {(track.proud_to_pay_min ?? track.price) === 0
                            ? 'Free'
                            : `$${Number(track.proud_to_pay_min ?? track.price ?? 0.50).toFixed(2)}`}
                          {track.description && ` • ${track.description.slice(0, 50)}${track.description.length > 50 ? '...' : ''}`}
                        </p>
                        {(() => {
                          const artistCredits = buildTrackArtistCredits(track)
                          return artistCredits.length > 1 ? (
                            <CollaboratorStack artists={artistCredits} size="xs" className="mt-2" />
                          ) : null
                        })()}
                      </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs border ${track.is_active ? 'border-green-500/30 bg-green-500/10 text-green-400' : 'border-[var(--pf-border)] bg-[var(--pf-surface)] text-[var(--pf-text-muted)]'}`}>
                              {track.is_active ? 'Live' : 'Hidden'}
                            </span>
                            {track.featured && (
                              <span className="px-2 py-1 rounded text-xs border border-[var(--pf-orange)]/30 bg-[var(--pf-orange)]/10 text-[var(--pf-orange)]">
                                Featured
                              </span>
                            )}
                            <Link
                              href={`/dashboard/artist/tracks/${track.id}/edit`}
                              className="pf-btn pf-btn-secondary text-[var(--pf-text-secondary)]"
                              title="Edit track"
                            >
                              <Icon.Edit />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Products Tab — REAL DB DATA */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Products</h2>
              <Link href="/dashboard/catalog" className="pf-btn pf-btn-primary flex items-center gap-2">
                <Icon.Plus /> Products
              </Link>
            </div>
            {dbProducts.length === 0 ? (
              <EmptyState
                icon={<Package size={24} />}
                title="No products selected"
                description="Products appear here when founders create them from your work."
                points={[
                  { label: 'What is this?', text: 'A read-only view of items made from your work.' },
                  { label: 'Why it matters', text: 'It keeps your storefront aligned with founder approval.' },
                  { label: 'Next step', text: 'Upload music first.' },
                ]}
                actionLabel="Upload"
                actionHref="/dashboard/upload"
              />
            ) : (
              <div className="space-y-3">
                {dbProducts.map((product: any) => {
                  const productTitle = getProductTitle(product)
                  const productImage = getProductImage(product)
                  const productPrice = getProductPrice(product)

                  return (
                    <div key={product.id} className="pf-card p-4 flex items-center gap-4">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-[var(--pf-surface)] shrink-0">
                        {productImage ? (
                          <Image src={productImage} alt={productTitle} fill sizes="64px" className="object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-[var(--pf-text-muted)]">
                            <Icon.Package />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{productTitle}</h3>
                        <p className="text-sm text-[var(--pf-text-muted)]">
                          {product.category} • ${productPrice.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded text-xs border border-[var(--pf-border)] bg-[var(--pf-surface)] text-[var(--pf-text-muted)]">
                          {product.status === 'live' ? 'Live' : 'Draft'}
                        </span>
                        <button className="pf-btn pf-btn-secondary"><Icon.Edit /></button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
