'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Package, RefreshCw, Shield } from 'lucide-react'
import { useSupabase } from '@/app/providers'
import { StageTracker, NextStepCard, EmptyState } from '@/components/guidance/GuidedExperience'
import {
  RETURN_AUTHORIZATION_STATUSES,
  ReturnAuthorizationRecord,
  formatReturnAuthorizationStatus,
  formatReturnDisposition,
} from '@/lib/return-authorizations'

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

export default function ArtistReturnsPage() {
  const router = useRouter()
  const { user, supabase, loading: authLoading } = useSupabase()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [returns, setReturns] = useState<ReturnAuthorizationRecord[]>([])
  const [statusFilter, setStatusFilter] = useState('all')

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
      const res = await fetch('/api/return-authorizations?limit=250', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to load returns')
      }

      const data: ReturnsApiResponse = await res.json()
      setReturns(data.returns || [])
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

      if (profileError || !profile || !['artist', 'admin', 'founder'].includes(profile.role)) {
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
      closed: returns.filter((item) => item.status === 'closed').length,
    }
  }, [returns])

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
            { label: 'Closed', status: summary.closed > 0 ? 'complete' : 'pending' },
          ]}
        />

        <NextStepCard
          title={returns.length === 0 ? 'No Returns Yet' : 'Track Your Returns'}
          description={
            returns.length === 0
              ? 'Founders create and manage return authorizations. You can view the status of returns tied to your own SKUs and fulfillment jobs.'
              : 'Returns move through review, approval, receipt, inspection, and closure. You can see the current status and disposition here.'
          }
          variant={returns.length === 0 ? 'warning' : 'default'}
        />

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <Link href="/dashboard/artist" className="inline-flex items-center gap-2 text-sm text-[var(--pf-text-muted)] hover:text-[var(--pf-text)]">
              <ArrowLeft size={16} />
              Back to Artist Dashboard
            </Link>
            <h1 className="text-3xl font-bold mt-3 flex items-center gap-3">
              <Package className="text-[var(--pf-orange)]" />
              Returns
            </h1>
            <p className="text-[var(--pf-text-muted)] mt-2 max-w-2xl">
              Read-only visibility into returns connected to your SKUs and fulfillment jobs.
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="pf-card p-4">
            <p className="text-xs uppercase text-[var(--pf-text-muted)]">Total</p>
            <p className="text-2xl font-bold mt-1">{summary.total}</p>
          </div>
          <div className="pf-card p-4">
            <p className="text-xs uppercase text-[var(--pf-text-muted)]">Requested</p>
            <p className="text-2xl font-bold mt-1">{summary.requested}</p>
          </div>
          <div className="pf-card p-4">
            <p className="text-xs uppercase text-[var(--pf-text-muted)]">Approved</p>
            <p className="text-2xl font-bold mt-1">{summary.approved}</p>
          </div>
          <div className="pf-card p-4">
            <p className="text-xs uppercase text-[var(--pf-text-muted)]">Closed</p>
            <p className="text-2xl font-bold mt-1">{summary.closed}</p>
          </div>
        </div>

        <div className="pf-card p-4 md:p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-[var(--pf-orange)]" />
              <h2 className="text-xl font-semibold">My Return Authorizations</h2>
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
                icon={<Package size={24} />}
                title="No return authorizations yet"
                description="Returns will appear here when founders create them for your delivered fulfillment jobs."
                points={[
                  { label: 'What is this?', text: 'A return is an internal authorization tied to a delivered job.' },
                  { label: 'Why it matters', text: 'It keeps return handling visible without changing checkout or payouts.' },
                  { label: 'Next step', text: 'Wait for a founder to create and review the return.' },
                ]}
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
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
