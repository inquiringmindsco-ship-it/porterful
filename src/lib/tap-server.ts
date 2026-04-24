import { createServerClient } from '@/lib/supabase'
import {
  buildTapHref,
  cleanTapValue,
  normalizeTapSlug,
  sanitizeTapImageUrl,
  type TapProfileRow,
  type TapQueryParams,
} from '@/lib/tap'
import { getProductById } from '@/lib/products'

export type TapEventType = 'visit' | 'register' | 'store' | 'learn'

export interface TapEventInput {
  eventType: TapEventType
  path: string
  slug?: string | null
  ref?: string | null
  product?: string | null
  campaign?: string | null
  destinationHref?: string | null
}

export interface TapActionLink {
  label: string
  href: string
  eventType: TapEventType
}

export interface TapResolvedProfile {
  slug: string
  displayName: string
  heroImageUrl: string | null
  productLabel: string | null
  primaryActionHref: string
  params: TapQueryParams
}

const TAP_RATE_LIMIT_WINDOW_MS = 60_000
const TAP_RATE_LIMIT_MAX_REQUESTS = 30

type RateBucket = {
  timestamps: number[]
}

type TapRateStore = {
  buckets: Map<string, RateBucket>
}

function getTapRateStore(): TapRateStore {
  const globalStore = globalThis as typeof globalThis & {
    __porterfulTapRateStore?: TapRateStore
  }

  if (!globalStore.__porterfulTapRateStore) {
    globalStore.__porterfulTapRateStore = {
      buckets: new Map<string, RateBucket>(),
    }
  }

  return globalStore.__porterfulTapRateStore
}

export function getTapRequestIp(headers: Headers | HeadersInit | null | undefined): string {
  const headerBag = headers instanceof Headers ? headers : new Headers(headers ?? undefined)
  const forwardedFor = headerBag.get('cf-connecting-ip')
    || headerBag.get('x-real-ip')
    || headerBag.get('x-forwarded-for')

  if (!forwardedFor) return 'unknown'

  return forwardedFor.split(',')[0]?.trim() || 'unknown'
}

export function allowTapRequest(scope: string, ip: string): boolean {
  const store = getTapRateStore()
  const key = `${scope}:${ip}`
  const now = Date.now()
  const bucket = store.buckets.get(key) || { timestamps: [] }
  const activeTimestamps = bucket.timestamps.filter((timestamp) => now - timestamp < TAP_RATE_LIMIT_WINDOW_MS)

  if (activeTimestamps.length >= TAP_RATE_LIMIT_MAX_REQUESTS) {
    store.buckets.set(key, { timestamps: activeTimestamps })
    return false
  }

  activeTimestamps.push(now)
  store.buckets.set(key, { timestamps: activeTimestamps })
  return true
}

export async function fetchTapProfile(slug: string): Promise<TapProfileRow | null> {
  const normalizedSlug = normalizeTapSlug(slug)
  if (!normalizedSlug) return null

  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('tap_profiles')
      .select('slug, display_name, hero_image_url, primary_product_id, store_url, ref_code, is_active, created_at')
      .eq('slug', normalizedSlug)
      .maybeSingle()

    if (error || !data) {
      return null
    }

    return data as TapProfileRow
  } catch {
    return null
  }
}

export async function insertTapEvent(input: TapEventInput): Promise<boolean> {
  try {
    const supabase = createServerClient()
    await supabase.from('tap_events').insert({
      event_type: input.eventType,
      path: input.path,
      slug: cleanTapValue(input.slug),
      ref: cleanTapValue(input.ref),
      product: cleanTapValue(input.product),
      campaign: cleanTapValue(input.campaign),
      destination_href: cleanTapValue(input.destinationHref),
    })

    return true
  } catch (error) {
    console.warn('[tap] failed to insert analytics event', error)
    return false
  }
}

export function resolveTapEffectiveParams(
  profile: TapProfileRow | null,
  params: TapQueryParams,
): TapQueryParams {
  return {
    ref: cleanTapValue(params.ref) ?? cleanTapValue(profile?.ref_code) ?? undefined,
    product: cleanTapValue(params.product) ?? cleanTapValue(profile?.primary_product_id) ?? undefined,
    campaign: cleanTapValue(params.campaign) ?? undefined,
  }
}

export function resolveTapProductLabel(
  profile: TapProfileRow | null,
  params: TapQueryParams,
): string | null {
  const productId = cleanTapValue(params.product) ?? cleanTapValue(profile?.primary_product_id)
  if (!productId) return null

  const product = getProductById(productId)
  return product?.name || productId
}

function appendQueryParamsToHref(href: string | null | undefined, params: TapQueryParams): string | null {
  const cleanedHref = cleanTapValue(href)
  if (!cleanedHref) return null

  if (cleanedHref.startsWith('//')) return null

  try {
    const url = new URL(cleanedHref, 'https://porterful.com')
    if (!['http:', 'https:'].includes(url.protocol)) {
      return null
    }

    for (const [key, value] of Object.entries(params)) {
      const cleanValue = cleanTapValue(value)
      if (cleanValue) {
        url.searchParams.set(key, cleanValue)
      }
    }

    const sameOrigin = url.origin === 'https://porterful.com'
    return sameOrigin ? `${url.pathname}${url.search}${url.hash}` : url.toString()
  } catch {
    return null
  }
}

export function resolveTapPrimaryActionHref(
  profile: TapProfileRow | null,
  params: TapQueryParams,
): string {
  const effectiveParams = resolveTapEffectiveParams(profile, params)
  const productId = cleanTapValue(params.product) ?? cleanTapValue(profile?.primary_product_id)

  if (productId && getProductById(productId)) {
    return buildTapHref(`/product/${productId}`, effectiveParams)
  }

  const safeStoreUrl = appendQueryParamsToHref(profile?.store_url || null, effectiveParams)
  if (safeStoreUrl) {
    return safeStoreUrl
  }

  if (productId) {
    return buildTapHref('/store', { ...effectiveParams, product: productId })
  }

  return buildTapHref('/store', effectiveParams)
}

export function sanitizeTapHeroImageUrl(value: string | null | undefined): string | null {
  return sanitizeTapImageUrl(value)
}
