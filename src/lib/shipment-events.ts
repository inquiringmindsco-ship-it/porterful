import { FulfillmentJobRecord } from '@/lib/fulfillment-jobs'

export const SHIPMENT_EVENT_TYPES = [
  'packed',
  'label_created',
  'shipped',
  'in_transit',
  'delivered',
  'exception',
  'returned',
] as const

export const SHIPMENT_EVENT_STATUSES = [
  'recorded',
  'confirmed',
  'exception',
  'returned',
] as const

export type ShipmentEventType = (typeof SHIPMENT_EVENT_TYPES)[number]
export type ShipmentEventStatus = (typeof SHIPMENT_EVENT_STATUSES)[number]

export type ShipmentEventRecord = {
  id: string
  fulfillment_job_id: string
  event_type: ShipmentEventType
  event_status: ShipmentEventStatus
  carrier: string | null
  tracking_number: string | null
  tracking_url: string | null
  location_city: string | null
  location_state: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  fulfillment_job?: FulfillmentJobRecord | null
  creator?: {
    id: string
    full_name?: string | null
    username?: string | null
    email?: string | null
  } | null
}

const EVENT_LABELS: Record<ShipmentEventType, string> = {
  packed: 'Packed',
  label_created: 'Label Created',
  shipped: 'Shipped',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  exception: 'Exception',
  returned: 'Returned',
}

const STATUS_LABELS: Record<ShipmentEventStatus, string> = {
  recorded: 'Recorded',
  confirmed: 'Confirmed',
  exception: 'Exception',
  returned: 'Returned',
}

const DEFAULT_STATUS_BY_TYPE: Record<ShipmentEventType, ShipmentEventStatus> = {
  packed: 'recorded',
  label_created: 'recorded',
  shipped: 'confirmed',
  in_transit: 'confirmed',
  delivered: 'confirmed',
  exception: 'exception',
  returned: 'returned',
}

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] || null
  }

  return value || null
}

export function isShipmentEventType(value: unknown): value is ShipmentEventType {
  return typeof value === 'string' && SHIPMENT_EVENT_TYPES.includes(value.toLowerCase() as ShipmentEventType)
}

export function isShipmentEventStatus(value: unknown): value is ShipmentEventStatus {
  return typeof value === 'string' && SHIPMENT_EVENT_STATUSES.includes(value.toLowerCase() as ShipmentEventStatus)
}

export function normalizeShipmentEventType(value: unknown): ShipmentEventType | null {
  if (typeof value !== 'string') return null
  const normalized = value.trim().toLowerCase()
  return isShipmentEventType(normalized) ? normalized : null
}

export function normalizeShipmentEventStatus(
  value: unknown,
  eventType?: ShipmentEventType | null
): ShipmentEventStatus {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (isShipmentEventStatus(normalized)) {
      return normalized
    }
  }

  if (eventType && DEFAULT_STATUS_BY_TYPE[eventType]) {
    return DEFAULT_STATUS_BY_TYPE[eventType]
  }

  return 'recorded'
}

export function formatShipmentEventType(value?: string | null) {
  if (!value) return 'Unknown'
  const normalized = value.trim().toLowerCase() as ShipmentEventType
  return EVENT_LABELS[normalized] || value
}

export function formatShipmentEventStatus(value?: string | null) {
  if (!value) return 'Unknown'
  const normalized = value.trim().toLowerCase() as ShipmentEventStatus
  return STATUS_LABELS[normalized] || value
}

export function normalizeShipmentEventRecord(event: any): ShipmentEventRecord {
  if (!event) return event

  return {
    ...event,
    fulfillment_job: firstRelation(event.fulfillment_job),
    creator: firstRelation(event.creator),
  } as ShipmentEventRecord
}

export function groupShipmentEventsByJob(events: ShipmentEventRecord[]) {
  return events.reduce((acc, event) => {
    if (!acc[event.fulfillment_job_id]) {
      acc[event.fulfillment_job_id] = []
    }
    acc[event.fulfillment_job_id].push(event)
    return acc
  }, {} as Record<string, ShipmentEventRecord[]>)
}
