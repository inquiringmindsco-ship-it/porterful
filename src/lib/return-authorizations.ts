import { FulfillmentJobRecord } from '@/lib/fulfillment-jobs'
import { ProductSkuRecord } from '@/lib/product-skus'

export const RETURN_AUTHORIZATION_STATUSES = [
  'requested',
  'under_review',
  'approved',
  'rejected',
  'received',
  'inspected',
  'restocked',
  'replacement_needed',
  'refund_pending',
  'closed',
] as const

export const RETURN_DISPOSITIONS = [
  'restock',
  'replace',
  'discard',
  'manual_refund',
  'no_action',
] as const

export type ReturnAuthorizationStatus = (typeof RETURN_AUTHORIZATION_STATUSES)[number]
export type ReturnDisposition = (typeof RETURN_DISPOSITIONS)[number]

export type ReturnAuthorizationRecord = {
  id: string
  return_number: string
  fulfillment_job_id: string
  sku_id: string
  artist_id: string | null
  quantity: number
  customer_name: string | null
  customer_email: string | null
  reason_code: string
  reason_notes: string | null
  status: ReturnAuthorizationStatus
  requested_at: string
  approved_at: string | null
  received_at: string | null
  inspected_at: string | null
  closed_at: string | null
  inspection_notes: string | null
  disposition: ReturnDisposition | null
  created_by: string
  updated_by: string
  created_at: string
  updated_at: string
  fulfillment_job?: FulfillmentJobRecord | null
  sku?: ProductSkuRecord | null
  artist?: { id: string; full_name?: string | null; username?: string | null; email?: string | null } | null
  creator?: { id: string; full_name?: string | null; username?: string | null; email?: string | null } | null
  updater?: { id: string; full_name?: string | null; username?: string | null; email?: string | null } | null
}

const STATUS_LABELS: Record<ReturnAuthorizationStatus, string> = {
  requested: 'Requested',
  under_review: 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
  received: 'Received',
  inspected: 'Inspected',
  restocked: 'Restocked',
  replacement_needed: 'Replacement Needed',
  refund_pending: 'Refund Pending',
  closed: 'Closed',
}

const DISPOSITION_LABELS: Record<ReturnDisposition, string> = {
  restock: 'Restock',
  replace: 'Replace',
  discard: 'Discard',
  manual_refund: 'Manual Refund',
  no_action: 'No Action',
}

export const RETURN_STATUS_TRANSITIONS: Record<ReturnAuthorizationStatus, ReturnAuthorizationStatus[]> = {
  requested: ['under_review'],
  under_review: ['approved', 'rejected'],
  approved: ['received', 'closed'],
  rejected: ['closed'],
  received: ['inspected', 'closed'],
  inspected: ['restocked', 'replacement_needed', 'refund_pending', 'closed'],
  restocked: ['closed'],
  replacement_needed: ['closed'],
  refund_pending: ['closed'],
  closed: [],
}

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] || null
  }

  return value || null
}

export function isReturnAuthorizationStatus(value: unknown): value is ReturnAuthorizationStatus {
  return typeof value === 'string' && RETURN_AUTHORIZATION_STATUSES.includes(value.toLowerCase() as ReturnAuthorizationStatus)
}

export function isReturnDisposition(value: unknown): value is ReturnDisposition {
  return typeof value === 'string' && RETURN_DISPOSITIONS.includes(value.toLowerCase() as ReturnDisposition)
}

export function normalizeReturnAuthorizationStatus(value: unknown): ReturnAuthorizationStatus | null {
  if (typeof value !== 'string') return null
  const normalized = value.trim().toLowerCase()
  return isReturnAuthorizationStatus(normalized) ? normalized : null
}

export function normalizeReturnDisposition(value: unknown): ReturnDisposition | null {
  if (typeof value !== 'string') return null
  const normalized = value.trim().toLowerCase()
  return isReturnDisposition(normalized) ? normalized : null
}

export function formatReturnAuthorizationStatus(value?: string | null) {
  if (!value) return 'Unknown'
  const normalized = value.trim().toLowerCase() as ReturnAuthorizationStatus
  return STATUS_LABELS[normalized] || value
}

export function formatReturnDisposition(value?: string | null) {
  if (!value) return 'Unknown'
  const normalized = value.trim().toLowerCase() as ReturnDisposition
  return DISPOSITION_LABELS[normalized] || value
}

export function canTransitionReturnAuthorizationStatus(
  currentStatus: ReturnAuthorizationStatus,
  nextStatus: ReturnAuthorizationStatus
) {
  return RETURN_STATUS_TRANSITIONS[currentStatus]?.includes(nextStatus) || false
}

export function parseReturnQuantity(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const parsed = Math.trunc(value)
    return parsed > 0 ? parsed : null
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number.parseInt(value, 10)
    if (!Number.isNaN(parsed) && parsed > 0) {
      return parsed
    }
  }

  return null
}

export function normalizeReturnAuthorizationRecord(record: any): ReturnAuthorizationRecord {
  if (!record) return record

  return {
    ...record,
    fulfillment_job: firstRelation(record.fulfillment_job),
    sku: firstRelation(record.sku),
    artist: firstRelation(record.artist),
    creator: firstRelation(record.creator),
    updater: firstRelation(record.updater),
  } as ReturnAuthorizationRecord
}

export function groupReturnAuthorizationsByJob(records: ReturnAuthorizationRecord[]) {
  return records.reduce((acc, record) => {
    if (!acc[record.fulfillment_job_id]) {
      acc[record.fulfillment_job_id] = []
    }
    acc[record.fulfillment_job_id].push(record)
    return acc
  }, {} as Record<string, ReturnAuthorizationRecord[]>)
}
