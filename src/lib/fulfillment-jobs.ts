export const FULFILLMENT_JOB_STATUSES = [
  'pending',
  'reserved',
  'printing',
  'qc',
  'packed',
  'shipped',
  'delivered',
  'exception',
  'cancelled',
] as const

export const FULFILLMENT_JOB_PRIORITIES = ['low', 'normal', 'high', 'rush'] as const

export type FulfillmentJobStatus = (typeof FULFILLMENT_JOB_STATUSES)[number]
export type FulfillmentJobPriority = (typeof FULFILLMENT_JOB_PRIORITIES)[number]

export type FulfillmentJob = {
  id: string
  job_number: string
  sku_id: string
  production_asset_id: string
  artist_id: string | null
  quantity: number
  status: FulfillmentJobStatus
  priority: FulfillmentJobPriority
  customer_name: string | null
  customer_email: string | null
  shipping_address: Record<string, any> | null
  notes: string | null
  created_by: string
  assigned_to: string | null
  reserved_at: string | null
  printing_at: string | null
  qc_at: string | null
  packed_at: string | null
  shipped_at: string | null
  delivered_at: string | null
  cancelled_at: string | null
  created_at: string
  updated_at: string
  sku?: {
    sku_id: string
    sku_code: string
    production_asset_id: string
    product_type: string
    variant_name: string
    size: string | null
    color: string | null
    unit_cost_cents: number
    retail_price_cents: number
    weight_oz: number | null
    package_type: string | null
    print_location: string | null
    active: boolean
    artist?: { id: string; full_name?: string | null; username?: string | null; email?: string | null } | null
  } | null
  asset?: {
    asset_id: string
    title: string
    asset_type: string
    approval_status: string
    production_status: string
    creator_id: string | null
    artist_id: string | null
    source_song_id: string | null
    source_campaign: string | null
    version_number: number
    is_current_version: boolean
  } | null
  creator?: { id: string; full_name?: string | null; username?: string | null; email?: string | null } | null
  assignee?: { id: string; full_name?: string | null; username?: string | null; email?: string | null } | null
  artist_profile?: { id: string; full_name?: string | null; username?: string | null; email?: string | null } | null
}

export type FulfillmentJobRecord = FulfillmentJob

const STATUS_LABELS: Record<FulfillmentJobStatus, string> = {
  pending: 'Pending',
  reserved: 'Reserved',
  printing: 'Printing',
  qc: 'QC',
  packed: 'Packed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  exception: 'Exception',
  cancelled: 'Cancelled',
}

export const FULFILLMENT_JOB_TRANSITIONS: Record<FulfillmentJobStatus, FulfillmentJobStatus[]> = {
  pending: ['reserved', 'exception', 'cancelled'],
  reserved: ['printing', 'exception', 'cancelled'],
  printing: ['qc', 'exception', 'cancelled'],
  qc: ['packed', 'exception', 'cancelled'],
  packed: ['shipped', 'exception', 'cancelled'],
  shipped: ['delivered', 'exception'],
  delivered: [],
  exception: ['cancelled'],
  cancelled: [],
}

export const FULFILLMENT_JOB_STATUS_TIMESTAMP_KEYS: Record<
  Exclude<FulfillmentJobStatus, 'pending' | 'exception'>,
  'reserved_at' | 'printing_at' | 'qc_at' | 'packed_at' | 'shipped_at' | 'delivered_at' | 'cancelled_at'
> = {
  reserved: 'reserved_at',
  printing: 'printing_at',
  qc: 'qc_at',
  packed: 'packed_at',
  shipped: 'shipped_at',
  delivered: 'delivered_at',
  cancelled: 'cancelled_at',
}

export function isFulfillmentJobStatus(value: unknown): value is FulfillmentJobStatus {
  return typeof value === 'string' && FULFILLMENT_JOB_STATUSES.includes(value.toLowerCase() as FulfillmentJobStatus)
}

export function isFulfillmentJobPriority(value: unknown): value is FulfillmentJobPriority {
  return typeof value === 'string' && FULFILLMENT_JOB_PRIORITIES.includes(value.toLowerCase() as FulfillmentJobPriority)
}

export function normalizeFulfillmentJobStatus(value: unknown): FulfillmentJobStatus | null {
  if (typeof value !== 'string') return null
  const normalized = value.trim().toLowerCase()
  return isFulfillmentJobStatus(normalized) ? normalized : null
}

export function normalizeFulfillmentJobPriority(value: unknown): FulfillmentJobPriority {
  if (typeof value !== 'string') return 'normal'
  const normalized = value.trim().toLowerCase()
  return isFulfillmentJobPriority(normalized) ? normalized : 'normal'
}

export function formatFulfillmentJobStatus(value?: string | null) {
  if (!value) return 'Unknown'
  const normalized = value.trim().toLowerCase() as FulfillmentJobStatus
  return STATUS_LABELS[normalized] || value
}

export function canTransitionFulfillmentJobStatus(
  currentStatus: FulfillmentJobStatus,
  nextStatus: FulfillmentJobStatus
) {
  return FULFILLMENT_JOB_TRANSITIONS[currentStatus]?.includes(nextStatus) || false
}

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] || null
  }

  return value || null
}

export function normalizeFulfillmentJobRecord(job: any): FulfillmentJobRecord {
  if (!job) return job

  return {
    ...job,
    sku: firstRelation(job.sku),
    asset: firstRelation(job.asset),
    creator: firstRelation(job.creator),
    assignee: firstRelation(job.assignee),
    artist_profile: firstRelation(job.artist_profile),
  } as FulfillmentJobRecord
}
