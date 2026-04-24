export const TAP_QUERY_KEYS = ['ref', 'product', 'campaign'] as const

export type TapQueryKey = (typeof TAP_QUERY_KEYS)[number]

export type TapQueryParams = Partial<Record<TapQueryKey, string | null | undefined>>

export type TapSearchSource =
  | { get(name: string): string | null }
  | Record<string, string | string[] | null | undefined>
  | null
  | undefined

const ALLOWED_TAP_IMAGE_HOSTS = ['images.unsplash.com', 'img.freepik.com', 'picsum.photos']

export interface TapProfileRow {
  slug: string
  display_name: string
  hero_image_url: string | null
  primary_product_id: string | null
  store_url: string | null
  ref_code: string
  is_active: boolean
  created_at: string
  bio?: string | null
  secondary_products?: unknown
}

export function cleanTapValue(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export function normalizeTapSlug(value: string | null | undefined): string {
  const cleaned = cleanTapValue(value)
  if (!cleaned) return ''

  return cleaned
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function readTapSourceValue(source: TapSearchSource, key: TapQueryKey): string | null {
  if (!source) return null

  if (typeof (source as { get?: (name: string) => string | null }).get === 'function') {
    return cleanTapValue((source as { get(name: string): string | null }).get(key))
  }

  const value = (source as Record<string, string | string[] | null | undefined>)[key]
  if (Array.isArray(value)) {
    return cleanTapValue(value[0])
  }

  if (typeof value === 'string') {
    return cleanTapValue(value)
  }

  return null
}

export function getTapParams(source?: TapSearchSource): TapQueryParams {
  const params: TapQueryParams = {}

  for (const key of TAP_QUERY_KEYS) {
    const value = readTapSourceValue(source, key)
    if (value) {
      params[key] = value
    }
  }

  return params
}

export function mergeTapParams(
  base: TapQueryParams,
  override: TapQueryParams,
): TapQueryParams {
  return getTapParams({
    ref: override.ref ?? base.ref ?? undefined,
    product: override.product ?? base.product ?? undefined,
    campaign: override.campaign ?? base.campaign ?? undefined,
  })
}

export function buildTapQueryString(params: TapQueryParams = {}): string {
  const searchParams = new URLSearchParams()

  for (const key of TAP_QUERY_KEYS) {
    const value = cleanTapValue(params[key])
    if (value) {
      searchParams.set(key, value)
    }
  }

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

export function buildTapHref(pathname: string, params: TapQueryParams = {}, hash?: string): string {
  const cleanHash = cleanTapValue(hash?.replace(/^#/, ''))
  const query = buildTapQueryString(params)
  return `${pathname}${query}${cleanHash ? `#${cleanHash}` : ''}`
}

export function isAllowedTapImageUrl(value: string | null | undefined): boolean {
  const cleaned = cleanTapValue(value)
  if (!cleaned) return false

  if (cleaned.startsWith('/') && !cleaned.startsWith('//')) {
    return true
  }

  try {
    const url = new URL(cleaned)
    if (!['http:', 'https:'].includes(url.protocol)) return false
    if (ALLOWED_TAP_IMAGE_HOSTS.includes(url.hostname)) return true
    return url.hostname.endsWith('.supabase.co')
  } catch {
    return false
  }
}

export function sanitizeTapImageUrl(value: string | null | undefined): string | null {
  const cleaned = cleanTapValue(value)
  if (!cleaned) return null

  return isAllowedTapImageUrl(cleaned) ? cleaned : null
}

