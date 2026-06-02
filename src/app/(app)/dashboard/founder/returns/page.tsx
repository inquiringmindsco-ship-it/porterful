'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertCircle, ArrowLeft, CheckCircle, Filter, Package, RefreshCw, Shield, Truck, XCircle } from 'lucide-react'
import { useSupabase } from '@/app/providers'
import { StageTracker, NextStepCard, EmptyState } from '@/components/guidance/GuidedExperience'
import {
  RETURN_AUTHORIZATION_STATUSES,
  ReturnAuthorizationRecord,
  formatReturnAuthorizationStatus,
  formatReturnDisposition,
} from '@/lib/return-authorizations'

type FulfillmentJobOption = {
  id: string
  job_number: string
  status: string
  quantity: number
  sku?: {
    sku_id: string
    sku_code: string
    product_type: string
    variant_name: string
    size: string | null
    color: string | null
    active: boolean
  } | null
  asset?: { title?: string | null } | null
  customer_name?: string | null
  customer_email?: string | null
}

type ReturnsApiResponse = {
  returns: ReturnAuthorizationRecord[]
  count: number
  statuses: string[]
  dispositions: string[]
}

function statusBadgeClasses(status: string) {
  const value = status.toLowerCase()
  if (value === 'requested') return 'border-blue-500/30 bg-blue-500/10 text-blue-300'
  if (value === 'under_review') return 'border-amber-500/30 bg-amber-500/10 text-amber-300'
  if (value === 'approved') return 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300'
  if (value === 'rejected') return 'border-red-500/30 bg-red-500/10 text-red-300'
  if (value === 'received') return 'border-sky-500/30 bg-sky-500/10 text-sky-300'
  if (value === 'inspected') return 'border-violet-500/30 bg-violet-500/10 text-violet-300'
  if (value === 'restocked') return 'border-green-500/30 bg-green-500/10 text-green-300'
  if (value === 'replacement_needed') return 'border-amber-500/30 bg-amber-500/10 text-amber-300'
  if (value === 'refund_pending') return 'border-orange-500/30 bg-orange-500/10 text-orange-300'
  if (value === 'closed') return 'border-slate-500/30 bg-slate-500/10 text-slate-300'
  return 'border-[var(--pf-border)] bg-[var(--pf-surface)] text-[var(--pf-text-muted)]'
}

function dispositionBadgeClasses(disposition: string) {
  const value = disposition.toLowerCase()
  if (value === 'restock') return 'border-green-500/30 bg-green-500/10 text-green-300'
  if (value === 'replace') return 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300'
  if (value === 'manual_refund') return 'border-orange-500/30 bg-orange-500/10 text-orange-300'
  if (value === 'discard') return 'border-red-500/30 bg-red-500/10 text-red-300'
  if (value === 'no_action') return 'border-slate-500/30 bg-slate-500/10 text-slate-300'
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

export default function FounderReturnsPage() {
  const router = useRouter()
  const { user, supabase, loading: authLoading } = useSupabase()
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [returns, setReturns] = useState<ReturnAuthorizationRecord[]>([])
  const [jobs, setJobs] = useState<FulfillmentJobOption[]>([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [fulfillmentJobId, setFulfillmentJobId] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [reasonCode, setReasonCode] = useState('')
  const [reasonNotes, setReasonNotes] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')

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
      const [returnsRes, jobsRes] = await Promise.all([
        fetch('/api/return-authorizations?limit=250', {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        }),
        fetch('/api/fulfillment-jobs?limit=250', {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        }),
      ])

      if (!returnsRes.ok) {
        const data = await returnsRes.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to load returns')
      }

      if (!jobsRes.ok) {
        const data = await jobsRes.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to load fulfillment jobs')
      }

      const returnsData: ReturnsApiResponse = await returnsRes.json()
      const jobsData = await jobsRes.json()
      setReturns(returnsData.returns || [])
      setJobs(jobsData.jobs || [])
      const firstDeliveredJob = (jobsData.jobs || []).find((job: FulfillmentJobOption) => job.status === 'delivered')
      setFulfillmentJobId((current) => current || firstDeliveredJob?.id || '')
      setCustomerName((current) => current || firstDeliveredJob?.customer_name || '')
      setCustomerEmail((current) => current || firstDeliveredJob?.customer_email || '')
    } catch (err: any) {
      setError(err.message || 'Failed to load returns')
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

      await loadData()
      setLoading(false)
    }

    void checkAccess()
  }, [authLoading, loadData, router, supabase, user])

  const filteredReturns = useMemo(() => {
    return returns.filter((item) => statusFilter === 'all' || item.status === statusFilter)
  }, [returns, statusFilter])

  const summary = useMemo(() => {
    return {
      total: returns.length,
      requested: returns.filter((item) => item.status === 'requested').length,
      review: returns.filter((item) => item.status === 'under_review').length,
      approved: returns.filter((item) => item.status === 'approved').length,
      received: returns.filter((item) => item.status === 'received').length,
      inspected: returns.filter((item) => item.status === 'inspected').length,
      restocked: returns.filter((item) => item.status === 'restocked').length,
      replacement_needed: returns.filter((item) => item.status === 'replacement_needed').length,
      refund_pending: returns.filter((item) => item.status === 'refund_pending').length,
      closed: returns.filter((item) => item.status === 'closed').length,
    }
  }, [returns])

  const deliveredJobs = useMemo(
    () => jobs.filter((job) => job.status === 'delivered'),
    [jobs]
  )

  async function createReturnAuthorization() {
    if (!supabase) return
    if (!fulfillmentJobId) {
      setError('Select a delivered fulfillment job first')
      return
    }

    setSavingId('create')
    setError('')
    setNotice('')

    try {
      const token = await getAuthToken()
      const res = await fetch('/api/return-authorizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fulfillment_job_id: fulfillmentJobId,
          quantity: Number(quantity),
          reason_code: reasonCode,
          reason_notes: reasonNotes || null,
          customer_name: customerName || null,
          customer_email: customerEmail || null,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create return authorization')
      }

      setNotice(`Return authorization ${data.returnAuthorization?.return_number || ''} created`)
      setReasonCode('')
      setReasonNotes('')
      setQuantity('1')
      await loadData()
    } catch (err: any) {
      setError(err.message || 'Failed to create return authorization')
    } finally {
      setSavingId(null)
    }
  }

  async function updateReturnStatus(returnId: string, status: string, disposition?: string) {
    if (!supabase) return

    setSavingId(returnId)
    setError('')
    setNotice('')

    try {
      const token = await getAuthToken()
      const res = await fetch(`/api/return-authorizations/${returnId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          disposition: disposition || null,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update return')
      }

      setNotice(`Return moved to ${formatReturnAuthorizationStatus(status)}`)
      await loadData()
    } catch (err: any) {
      setError(err.message || 'Failed to update return')
    } finally {
      setSavingId(null)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <div className="animate-pulse text-[var(--pf-text-muted)]">Loading returns...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="pf-container max-w-7xl space-y-8">
        <StageTracker
          title="Return Lifecycle"
          stages={[
            { label: 'Requested', status: summary.requested > 0 ? 'complete' : 'current' },
            { label: 'Review', status: summary.review > 0 ? 'complete' : 'pending' },
            { label: 'Approved', status: summary.approved > 0 ? 'complete' : 'pending' },
            { label: 'Received', status: summary.received > 0 ? 'complete' : 'pending' },
            { label: 'Inspected', status: summary.inspected > 0 ? 'complete' : 'pending' },
            { label: 'Disposition', status: (summary.restocked + summary.replacement_needed + summary.refund_pending) > 0 ? 'complete' : 'pending' },
            { label: 'Closed', status: summary.closed > 0 ? 'complete' : 'pending' },
          ]}
        />

        <NextStepCard
          title={returns.length === 0 ? 'Create a Return Authorization' : 'Manage Active Returns'}
          description={
            returns.length === 0
              ? 'Create a return authorization from a delivered fulfillment job, then move it through review, receipt, inspection, and final disposition.'
              : 'Use the queue to review return requests, mark them received, record inspection notes, choose a disposition, and close them when complete.'
          }
          variant={returns.length === 0 ? 'warning' : 'default'}
        />

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <Link href="/dashboard/founder" className="inline-flex items-center gap-2 text-sm text-[var(--pf-text-muted)] hover:text-[var(--pf-text)]">
              <ArrowLeft size={16} />
              Back to Founder Dashboard
            </Link>
            <h1 className="text-3xl font-bold mt-3 flex items-center gap-3">
              <Package className="text-[var(--pf-orange)]" />
              Returns
            </h1>
            <p className="text-[var(--pf-text-muted)] mt-2 max-w-2xl">
              Internal return authorizations for delivered orders. No automatic refunds, no carrier integration.
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

        <div className="grid grid-cols-2 md:grid-cols-5 xl:grid-cols-9 gap-4">
          {[
            ['Total', summary.total],
            ['Requested', summary.requested],
            ['Review', summary.review],
            ['Approved', summary.approved],
            ['Received', summary.received],
            ['Inspected', summary.inspected],
            ['Restocked', summary.restocked],
            ['Refund Pending', summary.refund_pending],
            ['Closed', summary.closed],
          ].map(([label, value]) => (
            <div key={String(label)} className="pf-card p-4">
              <p className="text-xs uppercase text-[var(--pf-text-muted)]">{label}</p>
              <p className="text-2xl font-bold mt-1">{value as number}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          <div className="pf-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Package size={16} className="text-[var(--pf-orange)]" />
              <h2 className="text-xl font-semibold">Create Return Authorization</h2>
            </div>
            <p className="text-sm text-[var(--pf-text-muted)]">
              Returns are created manually from delivered jobs. Choose the job, add a reason, and start the review flow.
            </p>

            {deliveredJobs.length === 0 ? (
              <EmptyState
                icon={<Truck size={24} />}
                title="No delivered jobs available"
                description="A return authorization can only be created from a delivered fulfillment job."
                points={[
                  { label: 'What is this?', text: 'A return needs a completed fulfillment job to attach to.' },
                  { label: 'Why it matters', text: 'The return system stays tied to a real shipped item.' },
                  { label: 'Next step', text: 'Deliver a fulfillment job first, then create the return.' },
                ]}
              />
            ) : (
              <>
                <label className="block space-y-2">
                  <span className="text-sm font-medium">Fulfillment Job</span>
                  <select
                    value={fulfillmentJobId}
                    onChange={(e) => setFulfillmentJobId(e.target.value)}
                    className="w-full rounded-lg border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3"
                  >
                    <option value="">Select a delivered job</option>
                    {deliveredJobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.job_number} · {job.sku?.sku_code || 'Unknown SKU'}
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
                    <span className="text-sm font-medium">Reason Code</span>
                    <input
                      type="text"
                      value={reasonCode}
                      onChange={(e) => setReasonCode(e.target.value)}
                      placeholder="damaged, wrong_item, defective"
                      className="w-full rounded-lg border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3"
                    />
                  </label>
                </div>

                <label className="block space-y-2">
                  <span className="text-sm font-medium">Reason Notes</span>
                  <textarea
                    value={reasonNotes}
                    onChange={(e) => setReasonNotes(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3"
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
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
                </div>

                <button
                  onClick={createReturnAuthorization}
                  disabled={savingId === 'create'}
                  className="pf-btn pf-btn-primary w-full inline-flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Package size={16} />
                  {savingId === 'create' ? 'Creating...' : 'Create Return Authorization'}
                </button>
              </>
            )}
          </div>

          <div className="space-y-4">
            <div className="pf-card p-4 md:p-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-[var(--pf-orange)]" />
                  <h2 className="text-xl font-semibold">Returns Queue</h2>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-2"
                >
                  <option value="all">All Statuses</option>
                  {RETURN_AUTHORIZATION_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {formatReturnAuthorizationStatus(status)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4 overflow-x-auto">
                {filteredReturns.length === 0 ? (
                  <EmptyState
                    icon={<Shield size={24} />}
                    title="No return authorizations yet"
                    description="Create a return authorization from a delivered fulfillment job to start the review flow."
                    points={[
                      { label: 'What is this?', text: 'An internal authorization for a returned item.' },
                      { label: 'Why it matters', text: 'It keeps customer support, inventory, and shipment history aligned.' },
                      { label: 'Next step', text: 'Create a return from a delivered job and move it through review.' },
                    ]}
                    actionLabel="Create Return"
                    actionHref="#"
                  />
                ) : (
                  <table className="w-full text-sm">
                    <thead className="text-xs uppercase text-[var(--pf-text-muted)]">
                      <tr className="border-b border-[var(--pf-border)]">
                        <th className="text-left p-3">Return</th>
                        <th className="text-left p-3">Job / SKU</th>
                        <th className="text-left p-3">Reason</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Disposition</th>
                        <th className="text-left p-3">Timing</th>
                        <th className="text-left p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReturns.map((item) => (
                        <tr key={item.id} className="border-b border-[var(--pf-border)] align-top">
                          <td className="p-3">
                            <div className="font-medium">{item.return_number}</div>
                            <div className="text-xs text-[var(--pf-text-muted)] mt-1">
                              {item.customer_name || 'No customer name'}
                            </div>
                            <div className="text-xs text-[var(--pf-text-muted)]">
                              {item.customer_email || 'No customer email'}
                            </div>
                            <div className="text-xs text-[var(--pf-text-muted)] mt-1">Qty: {item.quantity}</div>
                          </td>
                          <td className="p-3">
                            <div className="font-medium">{item.fulfillment_job?.job_number || 'Unknown job'}</div>
                            <div className="text-xs text-[var(--pf-text-muted)] mt-1">
                              {item.sku?.sku_code || 'Unknown SKU'}
                            </div>
                            <div className="text-xs text-[var(--pf-text-muted)] mt-1">
                              {item.fulfillment_job?.asset?.title || 'Unknown asset'}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="font-medium">{item.reason_code}</div>
                            <div className="text-xs text-[var(--pf-text-muted)] mt-1">{item.reason_notes || '—'}</div>
                          </td>
                          <td className="p-3">
                            <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadgeClasses(item.status)}`}>
                              {formatReturnAuthorizationStatus(item.status)}
                            </span>
                          </td>
                          <td className="p-3">
                            {item.disposition ? (
                              <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${dispositionBadgeClasses(item.disposition)}`}>
                                {formatReturnDisposition(item.disposition)}
                              </span>
                            ) : (
                              <span className="text-xs text-[var(--pf-text-muted)]">—</span>
                            )}
                          </td>
                          <td className="p-3 text-xs text-[var(--pf-text-muted)] space-y-1">
                            <div>Requested: {formatDate(item.requested_at)}</div>
                            <div>Approved: {formatDate(item.approved_at)}</div>
                            <div>Received: {formatDate(item.received_at)}</div>
                            <div>Inspected: {formatDate(item.inspected_at)}</div>
                            <div>Closed: {formatDate(item.closed_at)}</div>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-2">
                              {item.status === 'requested' && (
                                <button
                                  onClick={() => updateReturnStatus(item.id, 'under_review')}
                                  disabled={savingId === item.id}
                                  className="pf-btn pf-btn-primary inline-flex items-center gap-2 text-xs"
                                >
                                  <Shield size={14} />
                                  Under Review
                                </button>
                              )}
                              {item.status === 'under_review' && (
                                <>
                                  <button
                                    onClick={() => updateReturnStatus(item.id, 'approved')}
                                    disabled={savingId === item.id}
                                    className="pf-btn pf-btn-primary inline-flex items-center gap-2 text-xs"
                                  >
                                    <CheckCircle size={14} />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => updateReturnStatus(item.id, 'rejected')}
                                    disabled={savingId === item.id}
                                    className="pf-btn pf-btn-secondary inline-flex items-center gap-2 text-xs"
                                  >
                                    <XCircle size={14} />
                                    Reject
                                  </button>
                                </>
                              )}
                              {item.status === 'approved' && (
                                <button
                                  onClick={() => updateReturnStatus(item.id, 'received')}
                                  disabled={savingId === item.id}
                                  className="pf-btn pf-btn-secondary inline-flex items-center gap-2 text-xs"
                                >
                                  <Truck size={14} />
                                  Mark Received
                                </button>
                              )}
                              {item.status === 'received' && (
                                <button
                                  onClick={() => updateReturnStatus(item.id, 'inspected')}
                                  disabled={savingId === item.id}
                                  className="pf-btn pf-btn-secondary inline-flex items-center gap-2 text-xs"
                                >
                                  <CheckCircle size={14} />
                                  Inspect
                                </button>
                              )}
                              {item.status === 'inspected' && (
                                <>
                                  <button
                                    onClick={() => updateReturnStatus(item.id, 'restocked', 'restock')}
                                    disabled={savingId === item.id}
                                    className="pf-btn pf-btn-primary inline-flex items-center gap-2 text-xs"
                                  >
                                    <Package size={14} />
                                    Restock
                                  </button>
                                  <button
                                    onClick={() => updateReturnStatus(item.id, 'replacement_needed', 'replace')}
                                    disabled={savingId === item.id}
                                    className="pf-btn pf-btn-secondary inline-flex items-center gap-2 text-xs"
                                  >
                                    <AlertCircle size={14} />
                                    Replace
                                  </button>
                                  <button
                                    onClick={() => updateReturnStatus(item.id, 'refund_pending', 'manual_refund')}
                                    disabled={savingId === item.id}
                                    className="pf-btn pf-btn-secondary inline-flex items-center gap-2 text-xs"
                                  >
                                    <AlertCircle size={14} />
                                    Refund Pending
                                  </button>
                                  <button
                                    onClick={() => updateReturnStatus(item.id, 'closed', 'discard')}
                                    disabled={savingId === item.id}
                                    className="pf-btn pf-btn-secondary inline-flex items-center gap-2 text-xs"
                                  >
                                    <XCircle size={14} />
                                    Discard
                                  </button>
                                  <button
                                    onClick={() => updateReturnStatus(item.id, 'closed', 'no_action')}
                                    disabled={savingId === item.id}
                                    className="pf-btn pf-btn-secondary inline-flex items-center gap-2 text-xs"
                                  >
                                    <XCircle size={14} />
                                    Close
                                  </button>
                                </>
                              )}
                              {['rejected', 'restocked', 'replacement_needed', 'refund_pending'].includes(item.status) && (
                                <button
                                  onClick={() => updateReturnStatus(item.id, 'closed', item.disposition || 'no_action')}
                                  disabled={savingId === item.id}
                                  className="pf-btn pf-btn-secondary inline-flex items-center gap-2 text-xs"
                                >
                                  <XCircle size={14} />
                                  Close
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
          </div>
        </div>
      </div>
    </div>
  )
}
