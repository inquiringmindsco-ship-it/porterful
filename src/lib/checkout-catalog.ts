import { TRACKS } from '@/lib/data'
import { PRODUCTS, isPurchasable } from '@/lib/products'

type CheckoutInputItem = {
  id?: string
  productId?: string
  name?: string
  title?: string
  artist?: string
  image?: string
  audioUrl?: string
  audio_url?: string
  price?: number | string
  quantity?: number | string
  type?: string
}

export type CheckoutResolvedItemKind = 'track' | 'product' | 'wallet' | 'support' | 'digital'

export type CheckoutResolvedItem = {
  kind: CheckoutResolvedItemKind
  id: string
  productId: string | null
  name: string
  artist: string | null
  image: string | null
  audioUrl: string | null
  description: string | null
  unitAmountCents: number
  quantity: number
  requiresShipping: boolean
  skuId: string | null
  skuCode: string | null
  productionAssetId: string | null
  artistId: string | null
  fulfillmentType: string | null
  catalogStatus: string | null
}

export type CheckoutResolution = {
  items: CheckoutResolvedItem[]
  subtotalCents: number
  requiresShipping: boolean
}

export class CheckoutCatalogError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CheckoutCatalogError'
  }
}

const WALLET_PACKAGES = {
  starter: { label: '$5.00', priceCents: 500 },
  basic: { label: '$10.50 value', priceCents: 1000 },
  popular: { label: '$30.00 value', priceCents: 2500 },
  best: { label: '$65.00 value', priceCents: 5000 },
} as const

const SUPPORT_MIN_CENTS = 100
const FULL_ACCESS_MIN_CENTS = 599

function toStringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeQuantity(value: CheckoutInputItem['quantity']): number {
  const quantity = Number(value ?? 1)
  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new CheckoutCatalogError('Quantity must be at least 1.')
  }

  return Math.max(1, Math.floor(quantity))
}

function normalizePriceCents(value: CheckoutInputItem['price']): number {
  const price = Number(value)
  if (!Number.isFinite(price) || price <= 0) {
    throw new CheckoutCatalogError('Checkout item price must be greater than 0.')
  }

  return Math.round(price * 100)
}

function resolveItemId(item: CheckoutInputItem): string {
  return toStringValue(item.id) || toStringValue(item.productId)
}

function buildResolvedItem(params: {
  kind: CheckoutResolvedItemKind
  id: string
  productId?: string | null
  name: string
  artist?: string | null
  image?: string | null
  audioUrl?: string | null
  description?: string | null
  unitAmountCents: number
  quantity: number
  requiresShipping?: boolean
  skuId?: string | null
  skuCode?: string | null
  productionAssetId?: string | null
  artistId?: string | null
  fulfillmentType?: string | null
  catalogStatus?: string | null
}): CheckoutResolvedItem {
  return {
    kind: params.kind,
    id: params.id,
    productId: params.productId ?? null,
    name: params.name,
    artist: params.artist ?? null,
    image: params.image ?? null,
    audioUrl: params.audioUrl ?? null,
    description: params.description ?? null,
    unitAmountCents: params.unitAmountCents,
    quantity: params.quantity,
    requiresShipping: params.requiresShipping ?? false,
    skuId: params.skuId ?? null,
    skuCode: params.skuCode ?? null,
    productionAssetId: params.productionAssetId ?? null,
    artistId: params.artistId ?? null,
    fulfillmentType: params.fulfillmentType ?? null,
    catalogStatus: params.catalogStatus ?? null,
  }
}

function resolveTrack(item: CheckoutInputItem, id: string, quantity: number): CheckoutResolvedItem {
  const track = TRACKS.find((entry) => entry.id === id)

  if (track) {
    if ((track as any)?.is_active === false || !track.audio_url?.trim() || track.audio_url === 'null' || track.audio_url === 'undefined') {
      throw new CheckoutCatalogError(`This track is not available for purchase: ${track.title}`)
    }

    return buildResolvedItem({
      kind: 'track',
      id: track.id,
      productId: null,
      name: track.title,
      artist: track.artist,
      image: track.image ?? null,
      audioUrl: track.audio_url ?? null,
      description: 'Digital track purchase',
      unitAmountCents: Math.round(Number(track.price ?? 0) * 100),
      quantity,
    })
  }

  // Fallback: if the frontend passes a DB UUID or unknown ID,
  // construct the track from the item payload (name, artist, price).
  const name = item.name || item.title || 'Track'
  const artist = item.artist || 'Unknown Artist'
  const priceCents = normalizePriceCents(item.price)

  return buildResolvedItem({
    kind: 'track',
    id,
    productId: null,
    name,
    artist,
    image: item.image ?? null,
    audioUrl: item.audioUrl ?? item.audio_url ?? null,
    description: 'Digital track purchase',
    unitAmountCents: priceCents,
    quantity,
  })
}

function resolveProduct(item: CheckoutInputItem, id: string, quantity: number): CheckoutResolvedItem {
  const product = PRODUCTS.find((entry) => entry.id === id)
  if (!product) {
    throw new CheckoutCatalogError(`Unknown product: ${id}`)
  }

  if (!isPurchasable(product)) {
    throw new CheckoutCatalogError(`This product is not available for purchase yet: ${product.name}`)
  }

  return buildResolvedItem({
    kind: 'product',
    id: product.id,
    productId: product.id,
    name: product.name,
    artist: product.artist,
    image: product.image ?? null,
    description: product.description ?? null,
    unitAmountCents: Math.round(Number(product.price || 0) * 100),
    quantity,
    requiresShipping: true,
    skuId: product.skuId || null,
    skuCode: product.skuCode || null,
    productionAssetId: product.productionAssetId || null,
    artistId: product.artistId || null,
    fulfillmentType: product.fulfillmentType || product.fulfillment || null,
    catalogStatus: product.catalogStatus || null,
  })
}

function resolveWallet(item: CheckoutInputItem, id: string, quantity: number): CheckoutResolvedItem {
  const packageId = id.replace(/^wallet-/, '')
  const walletPackage = WALLET_PACKAGES[packageId as keyof typeof WALLET_PACKAGES]

  if (!walletPackage) {
    throw new CheckoutCatalogError(`Unknown wallet package: ${id}`)
  }

    return buildResolvedItem({
      kind: 'wallet',
      id,
      productId: null,
      name: toStringValue(item.name) || `Wallet Credit: ${walletPackage.label}`,
      artist: toStringValue(item.artist) || 'Porterful',
      image: item.image ? toStringValue(item.image) : '/logo.svg',
    description: 'Wallet funding',
    unitAmountCents: walletPackage.priceCents,
    quantity,
  })
}

function resolveSupport(item: CheckoutInputItem, id: string, quantity: number): CheckoutResolvedItem {
  const match = id.match(/-(\d+(?:\.\d{1,2})?)$/)
  if (!match) {
    throw new CheckoutCatalogError(`Support item is missing a valid amount: ${id}`)
  }

  const amount = Number(match[1])
  if (!Number.isFinite(amount) || amount < SUPPORT_MIN_CENTS / 100) {
    throw new CheckoutCatalogError('Support contributions must be at least $1.00.')
  }

    return buildResolvedItem({
      kind: 'support',
      id,
      productId: null,
      name: toStringValue(item.name) || 'Support',
      artist: toStringValue(item.artist) || 'Various Artists',
      image: item.image ? toStringValue(item.image) : '/logo.svg',
    description: 'Direct support contribution',
    unitAmountCents: Math.round(amount * 100),
    quantity,
  })
}

function resolveDigital(item: CheckoutInputItem, id: string, quantity: number): CheckoutResolvedItem {
  if (id === 'full-access' || /full access/i.test(`${item.name || item.title || ''}`)) {
    const priceCents = normalizePriceCents(item.price)

    if (priceCents < FULL_ACCESS_MIN_CENTS) {
      throw new CheckoutCatalogError('Minimum contribution is $5.99.')
    }

    return buildResolvedItem({
      kind: 'digital',
      id: 'full-access',
      productId: null,
      name: 'Full Access - All Music Unlocked',
      artist: toStringValue(item.artist) || 'Porterful',
      image: item.image ? toStringValue(item.image) : '/logo.svg',
      description: 'Unlock full catalog access',
      unitAmountCents: priceCents,
      quantity,
    })
  }

  if (id.startsWith('support-') || /support/i.test(`${item.name || item.title || ''}`)) {
    return resolveSupport(item, id, quantity)
  }

  throw new CheckoutCatalogError(`Unsupported digital checkout item: ${id || item.name || 'unknown item'}`)
}

function resolveByType(item: CheckoutInputItem, id: string, quantity: number): CheckoutResolvedItem {
  const type = toStringValue(item.type).toLowerCase()

  if (type === 'track') return resolveTrack(item, id, quantity)
  if (type === 'product') return resolveProduct(item, id, quantity)
  if (type === 'wallet') return resolveWallet(item, id, quantity)
  if (type === 'digital') return resolveDigital(item, id, quantity)

  if (TRACKS.some((entry) => entry.id === id)) return resolveTrack(item, id, quantity)
  if (PRODUCTS.some((entry) => entry.id === id)) return resolveProduct(item, id, quantity)
  if (id.startsWith('wallet-')) return resolveWallet(item, id, quantity)
  if (id.startsWith('support-') || /support/i.test(`${item.name || item.title || ''}`)) {
    return resolveSupport(item, id, quantity)
  }
  if (id === 'full-access' || /full access/i.test(`${item.name || item.title || ''}`)) {
    return resolveDigital(item, id, quantity)
  }

  throw new CheckoutCatalogError(`Unsupported checkout item: ${id || item.name || 'unknown item'}`)
}

export function resolveCheckoutCart(rawItems: unknown): CheckoutResolution {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new CheckoutCatalogError('No items in cart.')
  }

  const items = rawItems.map((rawItem) => {
    const item = rawItem as CheckoutInputItem
    const id = resolveItemId(item)

    if (!id) {
      throw new CheckoutCatalogError('Each checkout item must include an id or productId.')
    }

    const quantity = normalizeQuantity(item.quantity)
    return resolveByType(item, id, quantity)
  })

  const subtotalCents = items.reduce((sum, item) => sum + item.unitAmountCents * item.quantity, 0)
  const requiresShipping = items.some((item) => item.requiresShipping)

  return {
    items,
    subtotalCents,
    requiresShipping,
  }
}

export function buildStripeLineItems(
  items: CheckoutResolvedItem[],
  options: { baseUrl?: string } = {},
) {
  const baseUrl = options.baseUrl?.replace(/\/$/, '') || ''

  const resolveImageUrl = (value: string | null) => {
    if (!value) return undefined
    if (/^https?:\/\//i.test(value)) return value
    return baseUrl ? `${baseUrl}${value.startsWith('/') ? value : `/${value}`}` : value
  }

  return items.map((item) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.name,
        description: item.description ?? undefined,
        images: resolveImageUrl(item.image) ? [resolveImageUrl(item.image)!] : undefined,
      },
      unit_amount: item.unitAmountCents,
    },
    quantity: item.quantity,
  }))
}
