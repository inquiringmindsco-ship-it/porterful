export type ProductSkuRecord = {
  sku_id: string
  sku_code: string
  production_asset_id: string
  product_id: string | null
  artist_id: string | null
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
  created_at: string
  updated_at: string
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
  artist?: { id: string; full_name?: string | null; username?: string | null; email?: string | null } | null
  product?: {
    id: string
    title?: string | null
    name?: string | null
    category?: string | null
    price?: number | null
    is_active?: boolean | null
  } | null
}

export const PRODUCT_SKU_PRODUCT_TYPES = [
  'shirt',
  'hoodie',
  'poster',
  'sticker',
  'bundle',
  'hat',
  'tote',
  'other',
] as const

export type ProductSkuProductType = (typeof PRODUCT_SKU_PRODUCT_TYPES)[number]

export function isProductSkuProductType(value: unknown): value is ProductSkuProductType {
  return typeof value === 'string' && PRODUCT_SKU_PRODUCT_TYPES.includes(value.toLowerCase() as ProductSkuProductType)
}

function normalizeFragment(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function normalizeSkuCode(value: string) {
  return normalizeFragment(value)
}

export function generateSkuCode(input: {
  assetTitle: string
  variantName: string
  size?: string | null
  color?: string | null
  assetId: string
}) {
  const parts = [
    'SKU',
    input.assetTitle,
    input.variantName,
    input.size || '',
    input.color || '',
    input.assetId.slice(0, 8),
  ]

  return normalizeFragment(parts.filter(Boolean).join('-')).slice(0, 90)
}

export function parsePositiveInteger(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.trunc(value))
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number.parseInt(value, 10)
    if (!Number.isNaN(parsed)) {
      return Math.max(0, parsed)
    }
  }

  return null
}

export function parsePositiveNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, value)
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number.parseFloat(value)
    if (!Number.isNaN(parsed)) {
      return Math.max(0, parsed)
    }
  }

  return null
}

export function formatCurrencyFromCents(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format((cents || 0) / 100)
}
