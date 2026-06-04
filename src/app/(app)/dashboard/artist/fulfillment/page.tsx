'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Package, RefreshCw, Shield, Truck } from 'lucide-react'
import { useSupabase } from '@/app/providers'
import { FULFILLMENT_JOB_STATUSES, FulfillmentJob, formatFulfillmentJobStatus } from '@/lib/fulfillment-jobs'
import { ShipmentEventRecord } from '@/lib/shipment-events'
import { StageTracker, NextStepCard, EmptyState } from '@/components/guidance/GuidedExperience'
import { ShipmentEventTimeline } from '@/components/fulfillment/ShipmentEventTimeline'

type FulfillmentJobsApiResponse = {
  jobs: FulfillmentJob[]
  counts: Record<string, number> & { total: number }
  statuses: string[]
  priorities: string[]
}

function statusBadgeClasses(status: string) {
  const value = status.toLowerCase()
  if (value === 'reserved') return 'border-blue-500/30 bg-blue-500/10 text-blue-500'
  if (value === 'printing') return 'border-violet-500/30 bg-violet-500/10 text-violet-400'
  if (value === 'qc') return 'border-amber-500/30 bg-amber-500/10 text-amber-400'
  if (value === 'packed') return 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400'
  if (value === 'shipped') return 'border-sky-500/30 bg-sky-500/10 text-sky-400'
  if (value === 'delivered') return 'border-green-500/30 bg-green-500/10 text-green-500'
  if (value === 'exception') return 'border-red-500/30 bg-red-500/10 text-red-400'
  if (value === 'cancelled') return 'border-slate-500/30 bg-slate-500/10 text-slate-300'
  return 'border-[var(--pf-border)] bg-[var(--pf-surface)] text-[var(--pf-text-muted)]'
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

export default function ArtistFulfillmentQueuePage() {
  const router = useRouter()
  const { user, supabase, loading: authLoading } = useSupabase()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [jobs, setJobs] = useState<FulfillmentJob[]>([])
  const [shipmentEvents, setShipmentEvents] = useState<ShipmentEventRecord[]>([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedShipmentJobId, setSelectedShipmentJobId] = useState('')

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
      const res = await fetch('/api/fulfillment-jobs?limit=250', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to load fulfillment queue')
      }

      const data: FulfillmentJobsApiResponse = await res.json()
      setJobs(data.jobs || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load fulfillment queue')
    }
  }, [getAuthToken, supabase])

  const loadShipmentEvents = useCallback(
    async (fulfillmentJobId?: string) => {
      if (!supabase || !fulfillmentJobId) {
        setShipmentEvents([])
        return
      }

      try {
        const token = await getAuthToken()
        const params = new URLSearchParams({ limit: '300', fulfillment_job_id: fulfillmentJobId })
        const res = await fetch(`/api/shipment-events?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || 'Failed to load shipment events')
        }

        const data = await res.json()
        setShipmentEvents(data.events || [])
      } catch (err: any) {
        setShipmentEvents([])
        setError(err.message || 'Failed to load shipment events')
      }
    },
    [getAuthToken, supabase]
  )

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

  useEffect(() => {
    if (!jobs.length) {
      setSelectedShipmentJobId('')
      setShipmentEvents([])
      return
    }

    setSelectedShipmentJobId((current) => {
      if (current && jobs.some((job) => job.id === current)) {
        return current
      }
      return jobs[0]?.id || ''
    })
  }, [jobs])

  useEffect(() => {
    void loadShipmentEvents(selectedShipmentJobId)
  }, [loadShipmentEvents, selectedShipmentJobId])

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => statusFilter === 'all' || job.status === statusFilter)
  }, [jobs, statusFilter])

  const totals = useMemo(() => {
    return jobs.reduce(
      (acc, job) => {
        acc.total += 1
        if (job.status === 'reserved') acc.reserved += 1
        if (job.status === 'packed') acc.packed += 1
        if (job.status === 'shipped') acc.shipped += 1
        if (job.status === 'delivered') acc.delivered += 1
        return acc
      },
      { total: 0, reserved: 0, packed: 0, shipped: 0, delivered: 0 }
    )
  }, [jobs])

  const selectedShipmentJob = useMemo(() => {
    return jobs.find((job) => job.id === selectedShipmentJobId) || null
  }, [jobs, selectedShipmentJobId])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <div className="animate-pulse text-[var(--pf-text-muted)]">Loading fulfillment queue...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="pf-container max-w-7xl space-y-8">
        <div data-tour-id="artist-fulfillment-overview">
          <StageTracker
            title="Orders & Shipping Journey"
            stages={[
              { label: 'Asset Submitted', status: 'complete' },
              { label: 'Asset Approved', status: 'complete' },
              { label: 'SKU Created', status: 'complete' },
              { label: 'Inventory Added', status: 'complete' },
              { label: 'Job Created', status: totals.total > 0 ? 'complete' : 'current' },
              { label: 'Shipped', status: totals.shipped > 0 ? 'complete' : 'pending' },
              { label: 'Delivered', status: totals.delivered > 0 ? 'complete' : 'pending' },
            ]}
          />
        </div>

        <NextStepCard
          title={totals.total === 0 ? "Orders & Shipping Not Yet Started" : "Track Your Orders & Shipping"}
          description={
            totals.total === 0
              ? "Orders are created by founders when customers buy your product versions. Once an order is created, you'll see its progress through printing, quality control, packing, shipping, and delivery."
              : "Your products have active orders. Reserved means stock is committed. Packed means it's boxed and ready. Shipped means it's on the way. Delivered means the customer received it."
          }
          variant={totals.total === 0 ? 'warning' : 'default'}
        />

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <Link href="/dashboard/artist" className="inline-flex items-center gap-2 text-sm text-[var(--pf-text-muted)] hover:text-[var(--pf-text)]">
              <ArrowLeft size={16} />
              Back to Artist Dashboard
            </Link>
            <h1 className="text-3xl font-bold mt-3 flex items-center gap-3">
              <Package className="text-[var(--pf-orange)]" />
              My Orders & Shipping
            </h1>
            <p className="text-[var(--pf-text-muted)] mt-2 max-w-2xl">
              Read-only visibility into orders tied to your product versions and approved files.
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

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4" data-tour-id="artist-fulfillment-summary">
          <div className="pf-card p-4">
            <p className="text-xs uppercase text-[var(--pf-text-muted)]">Total</p>
            <p className="text-2xl font-bold mt-1">{totals.total}</p>
          </div>
          <div className="pf-card p-4">
            <p className="text-xs uppercase text-[var(--pf-text-muted)]">Reserved</p>
            <p className="text-2xl font-bold mt-1">{totals.reserved}</p>
          </div>
          <div className="pf-card p-4">
            <p className="text-xs uppercase text-[var(--pf-text-muted)]">Packed</p>
            <p className="text-2xl font-bold mt-1">{totals.packed}</p>
          </div>
          <div className="pf-card p-4">
            <p className="text-xs uppercase text-[var(--pf-text-muted)]">Shipped</p>
            <p className="text-2xl font-bold mt-1">{totals.shipped}</p>
          </div>
          <div className="pf-card p-4">
            <p className="text-xs uppercase text-[var(--pf-text-muted)]">Delivered</p>
            <p className="text-2xl font-bold mt-1">{totals.delivered}</p>
          </div>
        </div>

        <div className="pf-card p-4 md:p-6" data-tour-id="artist-fulfillment-queue">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-[var(--pf-orange)]" />
              <h2 className="text-xl font-semibold">Queue Status</h2>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-2"
            >
              <option value="all">All Statuses</option>
              {FULFILLMENT_JOB_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {formatFulfillmentJobStatus(status)}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 overflow-x-auto">
            {filteredJobs.length === 0 ? (
              <EmptyState
                icon={<Shield size={24} />}
                title="No fulfillment jobs assigned to your catalog yet"
                description="Fulfillment jobs track the lifecycle of customer orders for your products."
                points={[
                  { label: 'What is this?', text: 'A read-only view of the jobs tied to your SKUs and assets.' },
                  { label: 'Why it matters', text: 'It shows when a product moves from inventory into shipping.' },
                  { label: 'Next step', text: 'Wait for founders to create a fulfillment job.' },
                ]}
              />
            ) : (
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-[var(--pf-text-muted)]">
                  <tr className="border-b border-[var(--pf-border)]">
                    <th className="text-left p-3">Job</th>
                    <th className="text-left p-3">SKU / Asset</th>
                    <th className="text-left p-3">Qty</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Timing</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map((job) => (
                    <tr key={job.id} className="border-b border-[var(--pf-border)] align-top">
                      <td className="p-3">
                        <div className="font-medium">{job.job_number}</div>
                        <div className="text-xs text-[var(--pf-text-muted)] mt-1">
                          {job.customer_name || 'No customer name'}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium">{job.sku?.sku_code || 'Unknown SKU'}</div>
                        <div className="text-xs text-[var(--pf-text-muted)] mt-1">
                          {job.asset?.title || 'Unknown asset'}
                        </div>
                        <div className="text-xs text-[var(--pf-text-muted)] mt-1">
                          {job.sku?.variant_name || 'Variant'}{job.sku?.size ? ` · ${job.sku.size}` : ''}{job.sku?.color ? ` · ${job.sku.color}` : ''}
                        </div>
                      </td>
                      <td className="p-3 font-medium">{job.quantity}</td>
                      <td className="p-3">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadgeClasses(job.status)}`}>
                          {formatFulfillmentJobStatus(job.status)}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-[var(--pf-text-muted)] space-y-1">
                        <div>Reserved: {formatDate(job.reserved_at)}</div>
                        <div>Printing: {formatDate(job.printing_at)}</div>
                        <div>QC: {formatDate(job.qc_at)}</div>
                        <div>Packed: {formatDate(job.packed_at)}</div>
                        <div>Shipped: {formatDate(job.shipped_at)}</div>
                        <div>Delivered: {formatDate(job.delivered_at)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="pf-card p-4 md:p-6 space-y-4" data-tour-id="artist-shipment-timeline">
            <div className="flex items-center gap-2">
              <Truck className="text-[var(--pf-orange)]" size={16} />
              <h2 className="text-xl font-semibold">Shipment History</h2>
            </div>
            <p className="text-sm text-[var(--pf-text-muted)] max-w-2xl">
              Read-only shipment timeline for jobs tied to your SKUs and approved assets.
            </p>

            {jobs.length === 0 ? (
              <EmptyState
                icon={<Package size={24} />}
                title="No shipment history yet"
                description="Shipment events appear after founders create fulfillment jobs and add shipment updates."
                points={[
                  { label: 'What is this?', text: 'A timeline of shipment actions for each fulfillment job.' },
                  { label: 'Why it matters', text: 'It shows when your products are packed, shipped, and delivered.' },
                  { label: 'Next step', text: 'Wait for a founder to create a job and add shipment history.' },
                ]}
              />
            ) : (
              <div className="space-y-4">
                <label className="block space-y-2">
                  <span className="text-sm font-medium">Fulfillment Job</span>
                  <select
                    value={selectedShipmentJobId}
                    onChange={(e) => setSelectedShipmentJobId(e.target.value)}
                    className="w-full rounded-lg border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3"
                  >
                    <option value="">Select a job</option>
                    {jobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.job_number} · {job.sku?.sku_code || 'Unknown SKU'}
                      </option>
                    ))}
                  </select>
                </label>

                {selectedShipmentJob && (
                  <div className="rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)]/40 p-4 text-sm">
                    <div className="font-medium text-[var(--pf-text)]">{selectedShipmentJob.job_number}</div>
                    <div className="text-[var(--pf-text-muted)] mt-1">
                      {selectedShipmentJob.sku?.sku_code || 'Unknown SKU'}
                      {selectedShipmentJob.sku?.variant_name ? ` · ${selectedShipmentJob.sku.variant_name}` : ''}
                      {selectedShipmentJob.asset?.title ? ` · ${selectedShipmentJob.asset.title}` : ''}
                    </div>
                  </div>
                )}

                <ShipmentEventTimeline
                  events={shipmentEvents}
                  emptyTitle="No shipment events for this job yet"
                  emptyDescription="Shipment history will appear here after a founder adds packing, shipping, transit, or delivery updates."
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
