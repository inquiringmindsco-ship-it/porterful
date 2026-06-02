import { ProductSkuRecord } from '@/lib/product-skus'

export const INVENTORY_MOVEMENT_TYPES = [
  'receive',
  'reserve',
  'release',
  'adjust',
  'pack',
  'ship',
  'return',
] as const

export type InventoryMovementType = (typeof INVENTORY_MOVEMENT_TYPES)[number]

export const INVENTORY_MANAGEMENT_MOVEMENT_TYPES = [
  'receive',
  'reserve',
  'release',
  'adjust',
] as const

export type InventoryManagementMovementType = (typeof INVENTORY_MANAGEMENT_MOVEMENT_TYPES)[number]

export type InventoryLedgerRecord = {
  id: string
  sku_id: string
  movement_type: InventoryMovementType
  quantity: number
  reason: string
  reference_type: string | null
  reference_id: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  sku?: ProductSkuRecord | null
  creator?: {
    id: string
    full_name?: string | null
    username?: string | null
    email?: string | null
  } | null
}

export type InventorySkuSummary = {
  sku_id: string
  sku_code: string
  production_asset_id: string
  product_type: string
  variant_name: string
  size: string | null
  color: string | null
  active: boolean
  asset_title: string
  asset_type: string
  production_status: string
  artist_name: string
  on_hand: number
  reserved: number
  available: number
  shipped: number
  returned: number
  event_count: number
  last_movement_at: string | null
}

const INVENTORY_MOVEMENT_LABELS: Record<InventoryMovementType, string> = {
  receive: 'Receive',
  reserve: 'Reserve',
  release: 'Release',
  adjust: 'Adjust',
  pack: 'Pack',
  ship: 'Ship',
  return: 'Return',
}

export function formatInventoryMovementType(value?: string | null) {
  if (!value) return 'Unknown'
  const normalized = String(value).trim().toLowerCase() as InventoryMovementType
  return INVENTORY_MOVEMENT_LABELS[normalized] || value
}

export function isInventoryMovementType(value: unknown): value is InventoryMovementType {
  return typeof value === 'string' && INVENTORY_MOVEMENT_TYPES.includes(value as InventoryMovementType)
}

export function isInventoryManagementMovementType(value: unknown): value is InventoryManagementMovementType {
  return typeof value === 'string' && INVENTORY_MANAGEMENT_MOVEMENT_TYPES.includes(value as InventoryManagementMovementType)
}

export function parseInventoryQuantity(value: unknown, movementType: InventoryMovementType) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const parsed = Math.trunc(value)
    if (movementType === 'adjust') {
      return parsed === 0 ? null : parsed
    }
    return parsed > 0 ? parsed : null
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number.parseInt(value, 10)
    if (!Number.isNaN(parsed)) {
      if (movementType === 'adjust') {
        return parsed === 0 ? null : parsed
      }
      return parsed > 0 ? parsed : null
    }
  }

  return null
}

function createSummaryFromSku(sku: ProductSkuRecord): InventorySkuSummary {
  return {
    sku_id: sku.sku_id,
    sku_code: sku.sku_code,
    production_asset_id: sku.production_asset_id,
    product_type: sku.product_type,
    variant_name: sku.variant_name,
    size: sku.size,
    color: sku.color,
    active: sku.active,
    asset_title: sku.asset?.title || 'Unknown Asset',
    asset_type: sku.asset?.asset_type || 'unknown',
    production_status: sku.asset?.production_status || 'unknown',
    artist_name:
      sku.artist?.full_name ||
      sku.artist?.username ||
      sku.asset?.artist_id ||
      sku.asset?.creator_id ||
      'Unassigned',
    on_hand: 0,
    reserved: 0,
    available: 0,
    shipped: 0,
    returned: 0,
    event_count: 0,
    last_movement_at: null,
  }
}

export function summarizeInventoryLedger(
  skus: ProductSkuRecord[],
  entries: InventoryLedgerRecord[]
) {
  const summaries = new Map<string, InventorySkuSummary>()

  for (const sku of skus) {
    summaries.set(sku.sku_id, createSummaryFromSku(sku))
  }

  for (const entry of entries) {
    const sku = entry.sku || skus.find((item) => item.sku_id === entry.sku_id)
    if (!sku) continue

    let summary = summaries.get(entry.sku_id)
    if (!summary) {
      summary = createSummaryFromSku(sku)
      summaries.set(entry.sku_id, summary)
    }

    const quantity = entry.quantity || 0
    const movementType = String(entry.movement_type).toLowerCase() as InventoryMovementType

    switch (movementType) {
      case 'receive':
        summary.on_hand += quantity
        break
      case 'reserve':
        summary.reserved += quantity
        break
      case 'release':
        summary.reserved -= quantity
        break
      case 'adjust':
        summary.on_hand += quantity
        break
      case 'pack':
        break
      case 'ship':
        summary.on_hand -= quantity
        summary.shipped += quantity
        break
      case 'return':
        summary.on_hand += quantity
        summary.returned += quantity
        break
    }

    summary.event_count += 1
    if (!summary.last_movement_at || entry.created_at > summary.last_movement_at) {
      summary.last_movement_at = entry.created_at
    }
  }

  Array.from(summaries.values()).forEach((summary) => {
    summary.available = summary.on_hand - summary.reserved
  })

  return Array.from(summaries.values()).sort((a, b) => {
    if (a.asset_title === b.asset_title) {
      return a.sku_code.localeCompare(b.sku_code)
    }
    return a.asset_title.localeCompare(b.asset_title)
  })
}
