'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Filter,
  Package,
  Plus,
  Printer,
  RefreshCw,
  Send,
  Shield,
  Truck,
  XCircle,
} from 'lucide-react'
import { useSupabase } from '@/app/providers'
import {
  FULFILLMENT_JOB_PRIORITIES,
  FULFILLMENT_JOB_STATUSES,
  FulfillmentJob,
  formatFulfillmentJobStatus,
} from '@/lib/fulfillment-jobs'
import {
  SHIPMENT_EVENT_TYPES,
  ShipmentEventRecord,
  formatShipmentEventType,
} from '@/lib/shipment-events'
import { StageTracker, NextStepCard, EmptyState, AttentionCard } from '@/components/guidance/GuidedExperience'
import { ShipmentEventTimeline } from '@/components/fulfillment/ShipmentEventTimeline'

type ProductSkuOption = {
  sku_id: string
  sku_code: string
  production_asset_id: string
  product_type: string
  variant_name: string
  size: string | null
  color: string | null
  active: boolean
  asset?: { title?: string | null; production_status?: string | null } | null
  artist?: { full_name?: string | null; username?: string | null } | null
}

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

function priorityBadgeClasses(priority: string) {
  const value = priority.toLowerCase()
  if (value === 'rush') return 'border-red-500/30 bg-red-500/10 text-red-400'
  if (value === 'high') return 'border-amber-500/30 bg-amber-500/10 text-amber-400'
  if (value === 'low') return 'border-slate-500/30 bg-slate-500/10 text-slate-300'
  return 'border-blue-500/30 bg-blue-500/10 text-blue-400'
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

function parseAddressValue(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return null
  return JSON.parse(trimmed)
}

export default function FounderFulfillmentQueuePage() {
  const router = useRouter()
  const { user, supabase, loading: authLoading } = useSupabase()
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [jobs, setJobs] = useState<FulfillmentJob[]>([])
  const [skus, setSkus] = useState<ProductSkuOption[]>([])
  const [shipmentEvents, setShipmentEvents] = useState<ShipmentEventRecord[]>([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedShipmentJobId, setSelectedShipmentJobId] = useState('')

  const [skuId, setSkuId] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'rush'>('normal')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [shippingAddress, setShippingAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [reserveOnCreate, setReserveOnCreate] = useState(false)
  const [shipmentEventType, setShipmentEventType] = useState(SHIPMENT_EVENT_TYPES[1])
  const [shipmentCarrier, setShipmentCarrier] = useState('')
  const [shipmentTrackingNumber, setShipmentTrackingNumber] = useState('')
  const [shipmentTrackingUrl, setShipmentTrackingUrl] = useState('')
  const [shipmentLocationCity, setShipmentLocationCity] = useState('')
  const [shipmentLocationState, setShipmentLocationState] = useState('')
  const [shipmentNotes, setShipmentNotes] = useState('')

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
      const [jobsRes, skusRes] = await Promise.all([
        fetch('/api/fulfillment-jobs?limit=250', {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        }),
        fetch('/api/product-skus?active=true', {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        }),
      ])

      if (!jobsRes.ok) {
        const data = await jobsRes.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to load fulfillment jobs')
      }

      if (!skusRes.ok) {
        const data = await skusRes.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to load SKUs')
      }

      const jobsData: FulfillmentJobsApiResponse = await jobsRes.json()
      const skusData = await skusRes.json()
      setJobs(jobsData.jobs || [])
      setSkus(skusData.skus || [])
      setSkuId((current) => current || skusData.skus?.[0]?.sku_id || '')
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

      if (profileError || !profile || !['admin', 'founder'].includes(profile.role)) {
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

  const summary = useMemo(() => {
    return {
      total: jobs.length,
      pending: jobs.filter((job) => job.status === 'pending').length,
      reserved: jobs.filter((job) => job.status === 'reserved').length,
      printing: jobs.filter((job) => job.status === 'printing').length,
      qc: jobs.filter((job) => job.status === 'qc').length,
      packed: jobs.filter((job) => job.status === 'packed').length,
      shipped: jobs.filter((job) => job.status === 'shipped').length,
      delivered: jobs.filter((job) => job.status === 'delivered').length,
      exception: jobs.filter((job) => job.status === 'exception').length,
      cancelled: jobs.filter((job) => job.status === 'cancelled').length,
    }
  }, [jobs])

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => statusFilter === 'all' || job.status === statusFilter)
  }, [jobs, statusFilter])

  const selectedShipmentJob = useMemo(() => {
    return jobs.find((job) => job.id === selectedShipmentJobId) || null
  }, [jobs, selectedShipmentJobId])

  async function createJob() {
    if (!supabase) return
    if (!skuId) {
      setError('Select a SKU first')
      return
    }

    setSavingId('create')
    setError('')
    setNotice('')

    try {
      const token = await getAuthToken()
      const payload: Record<string, any> = {
        sku_id: skuId,
        quantity: Number(quantity),
        priority,
        customer_name: customerName || null,
        customer_email: customerEmail || null,
        notes: notes || null,
        reserve_inventory: reserveOnCreate,
      }

      if (shippingAddress.trim()) {
        payload.shipping_address = parseAddressValue(shippingAddress)
      }

      const res = await fetch('/api/fulfillment-jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create fulfillment job')
      }

      setNotice(`Fulfillment job ${data.job?.job_number || ''} created`)
      setQuantity('1')
      setCustomerName('')
      setCustomerEmail('')
      setShippingAddress('')
      setNotes('')
      setReserveOnCreate(false)
      await loadData()
    } catch (err: any) {
      setError(err.message || 'Failed to create fulfillment job')
    } finally {
      setSavingId(null)
    }
  }

  async function updateStatus(jobId: string, nextStatus: string) {
    if (!supabase) return

    setSavingId(jobId)
    setError('')
    setNotice('')

    try {
      const token = await getAuthToken()
      const res = await fetch(`/api/fulfillment-jobs/${jobId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: nextStatus,
          notes: notes || null,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update job')
      }

      setNotice(`Job moved to ${formatFulfillmentJobStatus(nextStatus)}`)
      await loadData()
    } catch (err: any) {
      setError(err.message || 'Failed to update fulfillment job')
    } finally {
      setSavingId(null)
    }
  }

  async function createShipmentEvent() {
    if (!supabase) return
    if (!selectedShipmentJobId) {
      setError('Select a fulfillment job first')
      return
    }

    setSavingId('shipment')
    setError('')
    setNotice('')

    try {
      const token = await getAuthToken()
      const res = await fetch('/api/shipment-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fulfillment_job_id: selectedShipmentJobId,
          event_type: shipmentEventType,
          carrier: shipmentCarrier || null,
          tracking_number: shipmentTrackingNumber || null,
          tracking_url: shipmentTrackingUrl || null,
          location_city: shipmentLocationCity || null,
          location_state: shipmentLocationState || null,
          notes: shipmentNotes || null,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create shipment event')
      }

      setNotice(`Shipment event added: ${formatShipmentEventType(shipmentEventType)}`)
      setShipmentCarrier('')
      setShipmentTrackingNumber('')
      setShipmentTrackingUrl('')
      setShipmentLocationCity('')
      setShipmentLocationState('')
      setShipmentNotes('')
      await loadShipmentEvents(selectedShipmentJobId)
    } catch (err: any) {
      setError(err.message || 'Failed to create shipment event')
    } finally {
      setSavingId(null)
    }
  }

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
        <div data-tour-id="founder-fulfillment-overview">
          <StageTracker
            title="Founder Fulfillment Pipeline"
            stages={[
              { label: 'Create Job', status: summary.total > 0 ? 'complete' : 'current' },
              { label: 'Reserve', status: summary.reserved > 0 ? 'complete' : 'pending' },
              { label: 'Print', status: summary.printing > 0 ? 'complete' : 'pending' },
              { label: 'QC', status: summary.qc > 0 ? 'complete' : 'pending' },
              { label: 'Pack', status: summary.packed > 0 ? 'complete' : 'pending' },
              { label: 'Ship', status: summary.shipped > 0 ? 'complete' : 'pending' },
              { label: 'Deliver', status: summary.delivered > 0 ? 'complete' : 'pending' },
            ]}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <AttentionCard
            count={summary.total}
            label="Total Jobs"
            href="#queue"
            severity="info"
          />
          <AttentionCard
            count={summary.pending + summary.reserved}
            label="Pending / Reserved"
            href="#queue"
            severity="warning"
          />
          <AttentionCard
            count={summary.printing + summary.qc + summary.packed}
            label="In Progress"
            href="#queue"
            severity="info"
          />
          <AttentionCard
            count={summary.shipped}
            label="Shipped"
            href="#queue"
            severity="success"
          />
          <AttentionCard
            count={summary.exception}
            label="Exceptions"
            href="#queue"
            severity="error"
          />
        </div>

        <NextStepCard
          title={summary.total === 0 ? "Create Your First Fulfillment Job" : "Manage Active Jobs"}
          description={
            summary.total === 0
              ? "Fulfillment jobs track orders from reservation through delivery. Create a job from an active SKU with available inventory, then move it through the pipeline: reserve stock, print the item, quality check, pack, ship, and mark delivered."
              : "Move jobs through the pipeline using the action buttons. Each status transition records a timestamp for tracking. Handle exceptions by marking problems, and cancel jobs that cannot be fulfilled."
          }
          actionLabel={summary.total === 0 ? "Create Job" : undefined}
          actionHref="#create-job"
          variant={summary.total === 0 ? 'warning' : 'default'}
        />

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <Link href="/dashboard/founder" className="inline-flex items-center gap-2 text-sm text-[var(--pf-text-muted)] hover:text-[var(--pf-text)]">
              <ArrowLeft size={16} />
              Back to Founder Dashboard
            </Link>
            <h1 className="text-3xl font-bold mt-3 flex items-center gap-3">
              <Package className="text-[var(--pf-orange)]" />
              IMG Fulfillment Queue
            </h1>
            <p className="text-[var(--pf-text-muted)] mt-2 max-w-2xl">
              Manual MVP queue for reserving inventory, printing, QC, packing, shipping, and delivery.
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

        <div className="grid grid-cols-2 md:grid-cols-5 xl:grid-cols-9 gap-4" data-tour-id="founder-fulfillment-summary">
          {[
            ['Total', summary.total],
            ['Pending', summary.pending],
            ['Reserved', summary.reserved],
            ['Printing', summary.printing],
            ['QC', summary.qc],
            ['Packed', summary.packed],
            ['Shipped', summary.shipped],
            ['Delivered', summary.delivered],
            ['Exception', summary.exception + summary.cancelled],
          ].map(([label, value]) => (
            <div key={String(label)} className="pf-card p-4">
              <p className="text-xs uppercase text-[var(--pf-text-muted)]">{label}</p>
              <p className="text-2xl font-bold mt-1">{value as number}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          <div className="pf-card p-6 space-y-4" data-tour-id="founder-fulfillment-create">
            <div className="flex items-center gap-2">
              <Plus size={16} className="text-[var(--pf-orange)]" />
              <h2 className="text-xl font-semibold">Create Fulfillment Job</h2>
            </div>
            <p className="text-sm text-[var(--pf-text-muted)]">
              Jobs are created manually for the MVP. Reserve inventory optionally on create.
            </p>

            <label className="block space-y-2">
              <span className="text-sm font-medium">SKU</span>
              <select
                value={skuId}
                onChange={(e) => setSkuId(e.target.value)}
                className="w-full rounded-lg border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3"
              >
                <option value="">Select a SKU</option>
                {skus.map((sku) => (
                  <option key={sku.sku_id} value={sku.sku_id}>
                    {sku.sku_code} - {sku.asset?.title || 'Unknown Asset'}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-medium">Quantity</span>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full rounded-lg border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium">Priority</span>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full rounded-lg border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3"
                >
                  {FULFILLMENT_JOB_PRIORITIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium">Customer Name</span>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full rounded-lg border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium">Customer Email</span>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full rounded-lg border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium">Shipping Address JSON</span>
              <textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder='{"line1":"123 Main St","city":"St. Louis","state":"MO","postal_code":"63101"}'
                rows={4}
                className="w-full rounded-lg border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3 font-mono text-sm"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium">Notes</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3"
              />
            </label>

            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={reserveOnCreate}
                onChange={(e) => setReserveOnCreate(e.target.checked)}
                className="h-4 w-4 rounded border-[var(--pf-border)]"
              />
              Reserve inventory immediately
            </label>

            <button
              onClick={createJob}
              disabled={savingId === 'create'}
              className="pf-btn pf-btn-primary w-full inline-flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Plus size={16} />
              {savingId === 'create' ? 'Creating...' : 'Create Job'}
            </button>
          </div>

          <div className="space-y-4">
            <div className="pf-card p-4 md:p-6" data-tour-id="founder-fulfillment-queue">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-[var(--pf-orange)]" />
                  <h2 className="text-xl font-semibold">Queue</h2>
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
                    icon={<Package size={24} />}
                    title="No fulfillment jobs yet"
                    description="Create your first fulfillment job when a customer places an order."
                    points={[
                      { label: 'What is this?', text: 'The operational queue for turning reserved stock into shipped orders.' },
                      { label: 'Why it matters', text: 'This is where inventory moves from reserved to shipped without manual release.' },
                      { label: 'Next step', text: 'Select an active SKU, create a job, and reserve stock if needed.' },
                    ]}
                    actionLabel="Create Job"
                    actionHref="#create-job"
                  />
                ) : (
                  <table className="w-full text-sm">
                    <thead className="text-xs uppercase text-[var(--pf-text-muted)]">
                      <tr className="border-b border-[var(--pf-border)]">
                        <th className="text-left p-3">Job</th>
                        <th className="text-left p-3">SKU / Asset</th>
                        <th className="text-left p-3">Qty</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Priority</th>
                        <th className="text-left p-3">Timing</th>
                        <th className="text-left p-3">Actions</th>
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
                            <div className="text-xs text-[var(--pf-text-muted)]">
                              {job.customer_email || 'No customer email'}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="font-medium">{job.sku?.sku_code || 'Unknown SKU'}</div>
                            <div className="text-xs text-[var(--pf-text-muted)] mt-1">
                              {job.asset?.title || 'Unknown asset'}
                            </div>
                            <div className="text-xs text-[var(--pf-text-muted)]">
                              {job.sku?.variant_name || 'Variant'}{job.sku?.size ? ` · ${job.sku.size}` : ''}{job.sku?.color ? ` · ${job.sku.color}` : ''}
                            </div>
                          </td>
                          <td className="p-3 font-medium">{job.quantity}</td>
                          <td className="p-3">
                            <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadgeClasses(job.status)}`}>
                              {formatFulfillmentJobStatus(job.status)}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityBadgeClasses(job.priority)}`}>
                              {job.priority}
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
                          <td className="p-3">
                            <div className="flex flex-wrap gap-2">
                              {job.status === 'pending' && (
                                <button
                                  onClick={() => updateStatus(job.id, 'reserved')}
                                  disabled={savingId === job.id}
                                  className="pf-btn pf-btn-primary inline-flex items-center gap-2 text-xs"
                                >
                                  <Shield size={14} />
                                  Reserve
                                </button>
                              )}
                              {job.status === 'reserved' && (
                                <button
                                  onClick={() => updateStatus(job.id, 'printing')}
                                  disabled={savingId === job.id}
                                  className="pf-btn pf-btn-secondary inline-flex items-center gap-2 text-xs"
                                >
                                  <Printer size={14} />
                                  Printing
                                </button>
                              )}
                              {job.status === 'printing' && (
                                <button
                                  onClick={() => updateStatus(job.id, 'qc')}
                                  disabled={savingId === job.id}
                                  className="pf-btn pf-btn-secondary inline-flex items-center gap-2 text-xs"
                                >
                                  <CheckCircle size={14} />
                                  QC
                                </button>
                              )}
                              {job.status === 'qc' && (
                                <button
                                  onClick={() => updateStatus(job.id, 'packed')}
                                  disabled={savingId === job.id}
                                  className="pf-btn pf-btn-secondary inline-flex items-center gap-2 text-xs"
                                >
                                  <Package size={14} />
                                  Packed
                                </button>
                              )}
                              {job.status === 'packed' && (
                                <button
                                  onClick={() => updateStatus(job.id, 'shipped')}
                                  disabled={savingId === job.id}
                                  className="pf-btn pf-btn-primary inline-flex items-center gap-2 text-xs"
                                >
                                  <Send size={14} />
                                  Ship
                                </button>
                              )}
                              {job.status === 'shipped' && (
                                <button
                                  onClick={() => updateStatus(job.id, 'delivered')}
                                  disabled={savingId === job.id}
                                  className="pf-btn pf-btn-secondary inline-flex items-center gap-2 text-xs"
                                >
                                  <Truck size={14} />
                                  Deliver
                                </button>
                              )}
                              {job.status !== 'delivered' && job.status !== 'cancelled' && (
                                <button
                                  onClick={() => updateStatus(job.id, 'exception')}
                                  disabled={savingId === job.id}
                                  className="pf-btn pf-btn-secondary inline-flex items-center gap-2 text-xs"
                                >
                                  <AlertCircle size={14} />
                                  Exception
                                </button>
                              )}
                              {job.status !== 'shipped' && job.status !== 'delivered' && job.status !== 'cancelled' && (
                                <button
                                  onClick={() => updateStatus(job.id, 'cancelled')}
                                  disabled={savingId === job.id}
                                  className="pf-btn pf-btn-secondary inline-flex items-center gap-2 text-xs"
                                >
                                  <XCircle size={14} />
                                  Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="pf-card p-4 md:p-6 space-y-4" id="shipment-events" data-tour-id="founder-shipment-timeline">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2">
                    <Truck size={16} className="text-[var(--pf-orange)]" />
                    <h2 className="text-xl font-semibold">Shipment Event Ledger</h2>
                  </div>
                  <p className="text-sm text-[var(--pf-text-muted)] mt-2 max-w-2xl">
                    Append-only shipment history for the selected fulfillment job.
                  </p>
                </div>
                {selectedShipmentJob && (
                  <div className="text-right text-xs text-[var(--pf-text-muted)]">
                    <div className="font-medium text-[var(--pf-text)]">{selectedShipmentJob.job_number}</div>
                    <div>
                      {selectedShipmentJob.sku?.sku_code || 'Unknown SKU'}
                      {selectedShipmentJob.sku?.variant_name ? ` · ${selectedShipmentJob.sku.variant_name}` : ''}
                    </div>
                    <div>{selectedShipmentJob.asset?.title || 'Unknown asset'}</div>
                  </div>
                )}
              </div>

              {jobs.length === 0 ? (
                <EmptyState
                  icon={<Truck size={24} />}
                  title="No shipment history yet"
                  description="Shipment events appear after a fulfillment job exists and a founder adds label, shipping, transit, or delivery history."
                  points={[
                    { label: 'What is this?', text: 'A read-only history of shipment actions for each fulfillment job.' },
                    { label: 'Why it matters', text: 'It keeps packing, shipping, and delivery history visible without changing inventory math.' },
                    { label: 'Next step', text: 'Create a fulfillment job first, then add shipment events here.' },
                  ]}
                />
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
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

                    <label className="block space-y-2">
                      <span className="text-sm font-medium">Event Type</span>
                      <select
                        value={shipmentEventType}
                        onChange={(e) => setShipmentEventType(e.target.value as typeof shipmentEventType)}
                        className="w-full rounded-lg border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3"
                      >
                        {SHIPMENT_EVENT_TYPES.map((eventType) => (
                          <option key={eventType} value={eventType}>
                            {formatShipmentEventType(eventType)}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block space-y-2">
                      <span className="text-sm font-medium">Carrier</span>
                      <input
                        type="text"
                        value={shipmentCarrier}
                        onChange={(e) => setShipmentCarrier(e.target.value)}
                        placeholder="USPS, UPS, FedEx, local driver"
                        className="w-full rounded-lg border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3"
                      />
                    </label>

                    <label className="block space-y-2">
                      <span className="text-sm font-medium">Tracking Number</span>
                      <input
                        type="text"
                        value={shipmentTrackingNumber}
                        onChange={(e) => setShipmentTrackingNumber(e.target.value)}
                        className="w-full rounded-lg border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3"
                      />
                    </label>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block space-y-2">
                      <span className="text-sm font-medium">Tracking URL</span>
                      <input
                        type="url"
                        value={shipmentTrackingUrl}
                        onChange={(e) => setShipmentTrackingUrl(e.target.value)}
                        className="w-full rounded-lg border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3"
                      />
                    </label>

                    <div className="grid grid-cols-2 gap-4">
                      <label className="block space-y-2">
                        <span className="text-sm font-medium">City</span>
                        <input
                          type="text"
                          value={shipmentLocationCity}
                          onChange={(e) => setShipmentLocationCity(e.target.value)}
                          className="w-full rounded-lg border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3"
                        />
                      </label>
                      <label className="block space-y-2">
                        <span className="text-sm font-medium">State</span>
                        <input
                          type="text"
                          value={shipmentLocationState}
                          onChange={(e) => setShipmentLocationState(e.target.value)}
                          className="w-full rounded-lg border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3"
                        />
                      </label>
                    </div>
                  </div>

                  <label className="block space-y-2">
                    <span className="text-sm font-medium">Notes</span>
                    <textarea
                      value={shipmentNotes}
                      onChange={(e) => setShipmentNotes(e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3"
                    />
                  </label>

                  <button
                    onClick={createShipmentEvent}
                    disabled={savingId === 'shipment'}
                    className="pf-btn pf-btn-primary inline-flex items-center gap-2 disabled:opacity-60"
                  >
                    <Truck size={16} />
                    {savingId === 'shipment' ? 'Adding event...' : 'Add Shipment Event'}
                  </button>

                  <div className="rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)]/40 p-4">
                    <ShipmentEventTimeline
                      events={shipmentEvents}
                      emptyTitle="No shipment events for this job yet"
                      emptyDescription="Add label creation, shipping, transit, or delivery history here for the selected fulfillment job."
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
