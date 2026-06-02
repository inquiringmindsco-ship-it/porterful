'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, Package, RefreshCw, Save, Shield, TrendingUp } from 'lucide-react'
import { useSupabase } from '@/app/providers'
import {
  formatInventoryMovementType,
  INVENTORY_MANAGEMENT_MOVEMENT_TYPES,
  InventoryLedgerRecord,
  InventorySkuSummary,
} from '@/lib/inventory-ledger'
import { formatProductionAssetType, formatProductionStatus } from '@/lib/production-assets'
import { StageTracker, NextStepCard, EmptyState, AttentionCard } from '@/components/guidance/GuidedExperience'

type InventoryApiResponse = {
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
  summaries: InventorySkuSummary[]
  entries: Array<InventoryLedgerRecord & { sku?: any }>
  counts: { skus: number; entries: number }
}

function movementBadgeClasses(movementType: string) {
  if (movementType === 'receive') return 'border-green-500/30 bg-green-500/10 text-green-500'
  if (movementType === 'reserve') return 'border-blue-500/30 bg-blue-500/10 text-blue-500'
  if (movementType === 'release') return 'border-amber-500/30 bg-amber-500/10 text-amber-500'
  if (movementType === 'adjust') return 'border-purple-500/30 bg-purple-500/10 text-purple-400'
  if (movementType === 'return') return 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400'
  if (movementType === 'ship' || movementType === 'pack') return 'border-slate-500/30 bg-slate-500/10 text-slate-300'
  return 'border-[var(--pf-border)] bg-[var(--pf-surface)] text-[var(--pf-text-muted)]'
}

export default function FounderInventoryPage() {
  const router = useRouter()
  const { user, supabase, loading: authLoading } = useSupabase()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [skus, setSkus] = useState<InventoryApiResponse['skus']>([])
  const [summaries, setSummaries] = useState<InventorySkuSummary[]>([])
  const [entries, setEntries] = useState<(InventoryLedgerRecord & { sku?: any })[]>([])
  const [selectedSkuId, setSelectedSkuId] = useState('')
  const [movementType, setMovementType] = useState<'receive' | 'reserve' | 'release' | 'adjust'>('receive')
  const [quantity, setQuantity] = useState('1')
  const [reason, setReason] = useState('')
  const [referenceType, setReferenceType] = useState('')
  const [referenceId, setReferenceId] = useState('')
  const [notes, setNotes] = useState('')

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
      const res = await fetch('/api/inventory-ledger?limit=300', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to load inventory ledger')
      }

      const data: InventoryApiResponse = await res.json()
      setSkus(data.skus || [])
      setSummaries(data.summaries || [])
      setEntries(data.entries || [])
      if (data.skus?.length) {
        setSelectedSkuId((current) => current || data.skus[0].sku_id)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load inventory ledger')
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

  const totals = useMemo(() => {
    return summaries.reduce(
      (acc, summary) => {
        acc.on_hand += summary.on_hand
        acc.reserved += summary.reserved
        acc.available += summary.available
        acc.shipped += summary.shipped
        acc.returned += summary.returned
        return acc
      },
      { on_hand: 0, reserved: 0, available: 0, shipped: 0, returned: 0 }
    )
  }, [summaries])

  const selectedSummary = useMemo(() => {
    return summaries.find((summary) => summary.sku_id === selectedSkuId) || null
  }, [selectedSkuId, summaries])

  async function submitEvent() {
    if (!supabase) return
    if (!selectedSkuId) {
      setError('Select a SKU first')
      return
    }

    setSaving(true)
    setError('')
    setNotice('')

    try {
      const token = await getAuthToken()
      const res = await fetch('/api/inventory-ledger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sku_id: selectedSkuId,
          movement_type: movementType,
          quantity: Number(quantity),
          reason,
          reference_type: referenceType || null,
          reference_id: referenceId || null,
          notes: notes || null,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create inventory event')
      }

      setNotice(`${formatInventoryMovementType(movementType)} recorded`)
      setQuantity('1')
      setReason('')
      setReferenceType('')
      setReferenceId('')
      setNotes('')
      await loadData()
    } catch (err: any) {
      setError(err.message || 'Failed to create inventory event')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <div className="animate-pulse text-[var(--pf-text-muted)]">Loading inventory ledger...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="pf-container max-w-7xl space-y-8">
        <StageTracker
          title="Founder Inventory Pipeline"
          stages={[
            { label: 'SKUs Created', status: skus.length > 0 ? 'complete' : 'current' },
            { label: 'Receive Stock', status: totals.on_hand > 0 ? 'complete' : 'current' },
            { label: 'Reserve Stock', status: totals.reserved > 0 ? 'complete' : 'pending' },
            { label: 'Ship Orders', status: totals.shipped > 0 ? 'complete' : 'pending' },
            { label: 'Track Returns', status: 'pending' },
          ]}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AttentionCard
            count={skus.length}
            label="SKUs Available"
            href="#create-event"
            severity="info"
          />
          <AttentionCard
            count={totals.on_hand}
            label="Total On Hand"
            href="#sku-summary"
            severity={totals.on_hand > 0 ? 'success' : 'warning'}
          />
          <AttentionCard
            count={totals.reserved}
            label="Reserved for Orders"
            href="#ledger-history"
            severity="info"
          />
        </div>

        <NextStepCard
          title={skus.length > 0 ? totals.on_hand === 0 ? "Add Inventory to Your SKUs" : "Manage Inventory Events" : "Create SKUs First"}
          description={
            skus.length > 0
              ? totals.on_hand === 0
                ? "You have SKUs but no recorded inventory. Use the form below to receive stock, reserve units for orders, or adjust counts. Every inventory event is logged in the ledger for auditability."
                : "Inventory is tracked through events: receive (add stock), reserve (commit to orders), release (uncommit), and adjust (correct counts). All changes are append-only and auditable."
              : "SKUs must be created before inventory can be managed. Go to the SKU Registry to create sellable variants from production-approved assets."
          }
          actionLabel={skus.length > 0 ? (totals.on_hand === 0 ? "Receive Stock" : undefined) : "Go to SKU Registry"}
          actionHref={skus.length > 0 ? "#create-event" : "/dashboard/founder/skus"}
          variant={skus.length > 0 ? (totals.on_hand === 0 ? 'warning' : 'default') : 'warning'}
        />

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <Link href="/dashboard/founder" className="inline-flex items-center gap-2 text-sm text-[var(--pf-text-muted)] hover:text-[var(--pf-text)]">
              <ArrowLeft size={16} />
              Back to Founder Dashboard
            </Link>
            <h1 className="text-3xl font-bold mt-3 flex items-center gap-3">
              <Package className="text-[var(--pf-orange)]" />
              Inventory Ledger
            </h1>
            <p className="text-[var(--pf-text-muted)] mt-2 max-w-2xl">
              Event-based inventory truth for verified SKUs.
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

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
          <div className="pf-card p-4">
            <p className="text-xs uppercase text-[var(--pf-text-muted)]">Shipped</p>
            <p className="text-2xl font-bold mt-1">{totals.shipped}</p>
          </div>
          <div className="pf-card p-4">
            <p className="text-xs uppercase text-[var(--pf-text-muted)]">Returned</p>
            <p className="text-2xl font-bold mt-1">{totals.returned}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="pf-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Save size={16} className="text-[var(--pf-orange)]" />
              <h2 className="text-xl font-semibold">Create Inventory Event</h2>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <label className="space-y-1 text-sm">
                <span className="text-[var(--pf-text-muted)]">SKU</span>
                <select
                  value={selectedSkuId}
                  onChange={(e) => setSelectedSkuId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] focus:border-[var(--pf-orange)] focus:outline-none"
                >
                  {skus.map((sku) => (
                    <option key={sku.sku_id} value={sku.sku_id}>
                      {sku.sku_code} · {sku.asset?.title || 'Untitled asset'}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-sm">
                <span className="text-[var(--pf-text-muted)]">Movement Type</span>
                <select
                  value={movementType}
                  onChange={(e) => setMovementType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] focus:border-[var(--pf-orange)] focus:outline-none"
                >
                  {INVENTORY_MANAGEMENT_MOVEMENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {formatInventoryMovementType(type)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-sm">
                <span className="text-[var(--pf-text-muted)]">Quantity</span>
                <input
                  type="number"
                  step="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] focus:border-[var(--pf-orange)] focus:outline-none"
                />
              </label>

              <label className="space-y-1 text-sm">
                <span className="text-[var(--pf-text-muted)]">Reason</span>
                <input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Restock, count correction, manual reserve..."
                  className="w-full px-3 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] focus:border-[var(--pf-orange)] focus:outline-none"
                />
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="space-y-1 text-sm">
                  <span className="text-[var(--pf-text-muted)]">Reference Type Optional</span>
                  <input
                    value={referenceType}
                    onChange={(e) => setReferenceType(e.target.value)}
                    placeholder="manual, correction, purchase"
                    className="w-full px-3 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] focus:border-[var(--pf-orange)] focus:outline-none"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="text-[var(--pf-text-muted)]">Reference ID Optional</span>
                  <input
                    value={referenceId}
                    onChange={(e) => setReferenceId(e.target.value)}
                    placeholder="UUID or external reference"
                    className="w-full px-3 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] focus:border-[var(--pf-orange)] focus:outline-none"
                  />
                </label>
              </div>

              <label className="space-y-1 text-sm">
                <span className="text-[var(--pf-text-muted)]">Notes Optional</span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] focus:border-[var(--pf-orange)] focus:outline-none"
                />
              </label>
            </div>

            <button
              onClick={submitEvent}
              disabled={saving}
              className="pf-btn pf-btn-primary inline-flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle size={16} />
              Record Event
            </button>
          </div>

          <div className="space-y-4">
            <div className="pf-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} className="text-[var(--pf-orange)]" />
                <h2 className="text-xl font-semibold">Selected SKU Summary</h2>
              </div>
              {!selectedSummary ? (
                <div className="text-sm text-[var(--pf-text-muted)]">Select a SKU to view inventory summary.</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                  <div className="rounded-lg border border-[var(--pf-border)] p-3">
                    <p className="text-xs text-[var(--pf-text-muted)]">On Hand</p>
                    <p className="text-lg font-semibold mt-1">{selectedSummary.on_hand}</p>
                  </div>
                  <div className="rounded-lg border border-[var(--pf-border)] p-3">
                    <p className="text-xs text-[var(--pf-text-muted)]">Reserved</p>
                    <p className="text-lg font-semibold mt-1">{selectedSummary.reserved}</p>
                  </div>
                  <div className="rounded-lg border border-[var(--pf-border)] p-3">
                    <p className="text-xs text-[var(--pf-text-muted)]">Available</p>
                    <p className="text-lg font-semibold mt-1">{selectedSummary.available}</p>
                  </div>
                  <div className="rounded-lg border border-[var(--pf-border)] p-3">
                    <p className="text-xs text-[var(--pf-text-muted)]">Shipped</p>
                    <p className="text-lg font-semibold mt-1">{selectedSummary.shipped}</p>
                  </div>
                  <div className="rounded-lg border border-[var(--pf-border)] p-3">
                    <p className="text-xs text-[var(--pf-text-muted)]">Returned</p>
                    <p className="text-lg font-semibold mt-1">{selectedSummary.returned}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="pf-card overflow-hidden">
              <div className="p-4 border-b border-[var(--pf-border)]">
                <h2 className="text-lg font-semibold">SKU Inventory Summary</h2>
                <p className="text-sm text-[var(--pf-text-muted)]">Ledger-derived counts by verified SKU.</p>
              </div>
              {summaries.length === 0 ? (
                <EmptyState
                  icon={<TrendingUp size={24} />}
                  title="No inventory activity recorded yet"
                  description="The inventory ledger tracks every stock movement for your SKUs."
                  points={[
                    { label: 'What is this?', text: 'An event-based record of stock movement for verified SKUs.' },
                    { label: 'Why it matters', text: 'It keeps on-hand, reserved, and available counts mathematically correct.' },
                    { label: 'Next step', text: 'Create SKUs, then log your first receive event.' },
                  ]}
                  actionLabel="Create SKU"
                  actionHref="/dashboard/founder/skus"
                />
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
                        <th className="text-left p-4">Shipped</th>
                        <th className="text-left p-4">Returned</th>
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
                              {formatProductionAssetType(summary.asset_type)} · {formatProductionStatus(summary.production_status)}
                            </div>
                          </td>
                          <td className="p-4 font-medium">{summary.on_hand}</td>
                          <td className="p-4 font-medium">{summary.reserved}</td>
                          <td className="p-4 font-medium">{summary.available}</td>
                          <td className="p-4 font-medium">{summary.shipped}</td>
                          <td className="p-4 font-medium">{summary.returned}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="pf-card overflow-hidden">
              <div className="p-4 border-b border-[var(--pf-border)]">
                <h2 className="text-lg font-semibold">Ledger History</h2>
                <p className="text-sm text-[var(--pf-text-muted)]">Append-only event stream for founders and admins.</p>
              </div>
              {entries.length === 0 ? (
                <EmptyState
                  icon={<Save size={24} />}
                  title="No ledger entries yet"
                  description="The ledger is an append-only record of every inventory movement."
                  points={[
                    { label: 'What is this?', text: 'A history of receive, reserve, release, adjust, pack, ship, and return events.' },
                    { label: 'Why it matters', text: 'It gives you an auditable trail for every stock change.' },
                    { label: 'Next step', text: 'Create your first inventory event to start the log.' },
                  ]}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[var(--pf-surface)]/60 text-[var(--pf-text-muted)] uppercase text-xs">
                      <tr>
                        <th className="text-left p-4">When</th>
                        <th className="text-left p-4">SKU</th>
                        <th className="text-left p-4">Movement</th>
                        <th className="text-left p-4">Qty</th>
                        <th className="text-left p-4">Reason</th>
                        <th className="text-left p-4">Reference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry) => (
                        <tr key={entry.id} className="border-t border-[var(--pf-border)] align-top">
                          <td className="p-4 text-xs text-[var(--pf-text-muted)]">
                            {new Date(entry.created_at).toLocaleString()}
                          </td>
                          <td className="p-4">
                            <div className="font-medium">{entry.sku?.sku_code || entry.sku_id}</div>
                            <div className="text-xs text-[var(--pf-text-muted)] mt-1">
                              {entry.sku?.asset?.title || 'Unknown asset'}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${movementBadgeClasses(entry.movement_type)}`}>
                              {formatInventoryMovementType(entry.movement_type)}
                            </span>
                          </td>
                          <td className="p-4 font-medium">{entry.quantity}</td>
                          <td className="p-4">{entry.reason}</td>
                          <td className="p-4 text-xs text-[var(--pf-text-muted)]">
                            <div>{entry.reference_type || 'Manual'}</div>
                            <div>{entry.reference_id || '—'}</div>
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
      </div>
    </div>
  )
}
