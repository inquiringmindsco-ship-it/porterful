import { getAdminClient } from './admin-client'
import { CONTROLLED_MERCH, isControlledMerchProductId } from './controlled-merch'
import { PRODUCTS, isPublicStorefrontProduct, isPurchasable, type Product } from './products'

export type ProductCatalogScope = 'public' | 'store' | 'admin'

export type ProductVisibilityStatus =
  | 'live'
  | 'preview'
  | 'unavailable'
  | 'hidden'
  | 'controlled'

export interface ProductVisibilityRecord {
  id?: string
  product_id: string
  public_visible: boolean | null
  store_visible: boolean | null
  purchasable: boolean | null
  visibility_status: ProductVisibilityStatus | null
  notes: string | null
  updated_by: string | null
  created_at?: string | null
  updated_at?: string | null
}

type VisibilitySettingsValue = {
  controls?: Record<string, ProductVisibilityRecord>
  [key: string]: unknown
}

export interface CatalogProduct extends Product {
  publicVisible: boolean
  storeVisible: boolean
  purchasable: boolean
  visibilityStatus: ProductVisibilityStatus
  visibilitySource: 'default' | 'override'
  visibilityNotes?: string | null
}

type VisibilityPreset = {
  publicVisible: boolean
  storeVisible: boolean
  purchasable: boolean
  visibilityStatus: ProductVisibilityStatus
}

function normalizeStatus(value: unknown): ProductVisibilityStatus | null {
  const status = String(value || '').toLowerCase().trim()
  if (status === 'live' || status === 'preview' || status === 'unavailable' || status === 'hidden' || status === 'controlled') {
    return status
  }
  return null
}

function isMissingVisibilityTableError(error: any) {
  if (!error) return false
  const code = String(error.code || '').trim()
  const message = String(error.message || error.details || '').toLowerCase()

  return (
    code === '42P01'
    || code === 'PGRST202'
    || message.includes('product_visibility_controls')
    || message.includes('schema cache')
    || message.includes('does not exist')
  )
}

function isProductApprovedForLive(product: Pick<Product, 'id' | 'available' | 'fulfillment' | 'skuCode' | 'catalogStatus' | 'fulfillmentType'>) {
  if (isControlledMerchProductId(product.id) || product.skuCode === CONTROLLED_MERCH.skuCode) {
    return true
  }

  if (product.catalogStatus && /controlled|approved|live/i.test(String(product.catalogStatus))) {
    return true
  }

  if (product.available === true && product.fulfillment !== 'mock') {
    return true
  }

  if (product.fulfillmentType === 'img_fulfillment' && product.available === true) {
    return true
  }

  return false
}

function isControlledCatalogProduct(product: Pick<Product, 'id' | 'skuCode' | 'catalogStatus' | 'fulfillmentType' | 'fulfillment'>) {
  return isControlledMerchProductId(product.id)
    || product.skuCode === CONTROLLED_MERCH.skuCode
    || String(product.catalogStatus || '').toLowerCase().includes('controlled')
    || product.fulfillmentType === 'img_fulfillment'
    || product.fulfillment === 'img_fulfillment'
}

function getDefaultVisibility(product: Product): VisibilityPreset {
  const purchasable = isPurchasable(product)
  return {
    publicVisible: true,
    storeVisible: true,
    purchasable,
    visibilityStatus: purchasable
      ? (isControlledCatalogProduct(product) ? 'controlled' : 'live')
      : 'preview',
  }
}

function presetForStatus(status: ProductVisibilityStatus, product: Product): VisibilityPreset {
  if (status === 'live' || status === 'controlled') {
    if (!isProductApprovedForLive(product)) {
      throw new Error(`"${product.name}" is not approved for live purchase`)
    }

    return {
      publicVisible: true,
      storeVisible: true,
      purchasable: true,
      visibilityStatus: status === 'controlled' ? 'controlled' : 'live',
    }
  }

  if (status === 'preview') {
    return {
      publicVisible: true,
      storeVisible: true,
      purchasable: false,
      visibilityStatus: 'preview',
    }
  }

  if (status === 'unavailable') {
    return {
      publicVisible: false,
      storeVisible: false,
      purchasable: false,
      visibilityStatus: 'unavailable',
    }
  }

  return {
    publicVisible: false,
    storeVisible: false,
    purchasable: false,
    visibilityStatus: 'hidden',
  }
}

function deriveStatusFromFlags(flags: VisibilityPreset): ProductVisibilityStatus {
  if (flags.publicVisible === false && flags.storeVisible === false) {
    return flags.purchasable ? 'hidden' : 'hidden'
  }

  if (flags.publicVisible === false && flags.storeVisible === true) {
    return 'unavailable'
  }

  if (flags.purchasable) {
    return flags.visibilityStatus === 'controlled' ? 'controlled' : 'live'
  }

  return 'preview'
}

export function mergeProductVisibility(product: Product, control?: ProductVisibilityRecord | null): CatalogProduct {
  const defaults = getDefaultVisibility(product)

  if (!control) {
    return {
      ...product,
      publicVisible: defaults.publicVisible,
      storeVisible: defaults.storeVisible,
      purchasable: defaults.purchasable,
      visibilityStatus: defaults.visibilityStatus,
      visibilitySource: 'default',
    }
  }

  const controlStatus = normalizeStatus(control.visibility_status)
  let resolved = { ...defaults }

  if (controlStatus) {
    try {
      resolved = presetForStatus(controlStatus, product)
    } catch {
      resolved = {
        publicVisible: false,
        storeVisible: false,
        purchasable: false,
        visibilityStatus: 'hidden',
      }
    }
  } else {
    if (typeof control.public_visible === 'boolean') {
      resolved.publicVisible = control.public_visible
    }

    if (typeof control.store_visible === 'boolean') {
      resolved.storeVisible = control.store_visible
    }

    if (typeof control.purchasable === 'boolean') {
      resolved.purchasable = control.purchasable
    }
  }

  if (!resolved.publicVisible && !resolved.storeVisible) {
    resolved.purchasable = false
  }

  if (!resolved.purchasable && controlStatus === 'controlled') {
    resolved.visibilityStatus = 'controlled'
  } else if (controlStatus) {
    resolved.visibilityStatus = controlStatus
  } else {
    resolved.visibilityStatus = deriveStatusFromFlags(resolved)
  }

  return {
    ...product,
    publicVisible: resolved.publicVisible,
    storeVisible: resolved.storeVisible,
    purchasable: resolved.purchasable,
    visibilityStatus: resolved.visibilityStatus,
    visibilitySource: 'override',
    visibilityNotes: control.notes,
  }
}

export function filterCatalogByScope(products: CatalogProduct[], scope: ProductCatalogScope) {
  if (scope === 'admin') {
    return products
  }

  const publicField = scope === 'public' ? 'publicVisible' : 'storeVisible'
  return products.filter((product) => (
    isPublicStorefrontProduct(product.id) && product[publicField] !== false
  ))
}

export function isCatalogPurchasable(product: Pick<CatalogProduct, 'available' | 'fulfillment' | 'purchasable'>) {
  if (typeof product.purchasable === 'boolean') {
    return product.purchasable === true
  }

  return isPurchasable(product)
}

export async function loadProductVisibilityControls(productIds?: string[]) {
  try {
    const admin = getAdminClient()
    let query = admin
      .from('product_visibility_controls')
      .select('id, product_id, public_visible, store_visible, purchasable, visibility_status, notes, updated_by, created_at, updated_at')

    if (productIds && productIds.length > 0) {
      query = query.in('product_id', productIds)
    }

    const { data, error } = await query
    if (error) {
      if (!isMissingVisibilityTableError(error)) {
        console.error('[product-visibility] load controls error:', error)
        return {}
      }

      return await loadProductVisibilityControlsFromSettings(productIds)
    }

    const records = (data || []) as ProductVisibilityRecord[]
    const mapped = records.reduce<Record<string, ProductVisibilityRecord>>((acc, record) => {
      acc[record.product_id] = record
      return acc
    }, {})

    const settingsFallback = await loadProductVisibilityControlsFromSettings(productIds)
    return filterVisibilityControlsByProductIds({
      ...settingsFallback,
      ...mapped,
    }, productIds)
  } catch (error) {
    if (!isMissingVisibilityTableError(error)) {
      console.error('[product-visibility] load controls exception:', error)
    }
    return await loadProductVisibilityControlsFromSettings(productIds)
  }
}

function filterVisibilityControlsByProductIds(
  controls: Record<string, ProductVisibilityRecord>,
  productIds?: string[],
) {
  if (!productIds || productIds.length === 0) {
    return controls
  }

  return productIds.reduce<Record<string, ProductVisibilityRecord>>((acc, productId) => {
    const record = controls[productId]
    if (record) {
      acc[productId] = record
    }
    return acc
  }, {})
}

async function loadProductVisibilityControlsFromSettings(productIds?: string[]) {
  try {
    const admin = getAdminClient()
    const { data, error } = await admin
      .from('site_settings')
      .select('value')
      .eq('key', 'product_visibility_controls')
      .maybeSingle()

    if (error) {
      console.error('[product-visibility] settings fallback load error:', error)
      return {}
    }

    const value = (data?.value || {}) as VisibilitySettingsValue
    const rawControls = value.controls && typeof value.controls === 'object'
      ? value.controls
      : value as Record<string, ProductVisibilityRecord>

    const controls = Object.entries(rawControls || {}).reduce<Record<string, ProductVisibilityRecord>>((acc, [productId, record]) => {
      if (!record || typeof record !== 'object') return acc
      acc[productId] = {
        ...record,
        product_id: record.product_id || productId,
      } as ProductVisibilityRecord
      return acc
    }, {})

    return filterVisibilityControlsByProductIds(controls, productIds)
  } catch (error) {
    console.error('[product-visibility] settings fallback exception:', error)
    return {}
  }
}

async function saveProductVisibilityControlToSettings(record: ProductVisibilityRecord) {
  const admin = getAdminClient()
  const current = await loadProductVisibilityControlsFromSettings()
  const next = {
    ...current,
    [record.product_id]: record,
  }

  const { error } = await admin
    .from('site_settings')
    .upsert({
      key: 'product_visibility_controls',
      value: { controls: next, updated_at: new Date().toISOString() },
    }, { onConflict: 'key' })

  if (error) {
    throw error
  }
}

function mapDbProductToCatalogProduct(row: any): Product | null {
  if (!row?.id) return null

  const metadata = row.metadata && typeof row.metadata === 'object' ? row.metadata : {}
  const images = Array.isArray(row.images)
    ? row.images.filter(Boolean)
    : Array.isArray(metadata.images)
      ? metadata.images.filter(Boolean)
      : []
  const firstImage = row.image_url || images[0] || '/logo.svg'
  const priceValue = Number(row.price ?? row.base_price ?? 0)

  return {
    id: row.id,
    name: row.title || row.name || 'Untitled Product',
    price: Number.isFinite(priceValue) ? priceValue : 0,
    category: row.category || metadata.category || 'Merch',
    artist: metadata.artist_name || metadata.artist || metadata.artist_handle || 'Porterful',
    image: firstImage,
    images: images.length > 0 ? images : [firstImage],
    description: row.description || metadata.description || '',
    featured: false,
    colors: metadata.color ? [metadata.color] : undefined,
    sizes: metadata.size ? [metadata.size] : undefined,
    fulfillment: metadata.fulfillment_type || (row.printful_product_id ? 'printful' : 'img_fulfillment'),
    fulfillmentType: metadata.fulfillment_type || (row.printful_product_id ? 'printful' : 'img_fulfillment'),
    catalogStatus: metadata.catalog_status || row.status || null,
    skuId: metadata.sku_id || null,
    skuCode: metadata.sku_code || null,
    productionAssetId: metadata.production_asset_id || null,
    artistId: metadata.artist_id || row.seller_id || null,
    available: row.is_active !== false && String(row.status || '').toLowerCase() === 'live',
    inStock: row.is_active !== false,
    offerEligible: true,
  }
}

export async function loadCatalogProducts(
  scope: ProductCatalogScope = 'store',
  options: {
    category?: string | null
    search?: string | null
    limit?: number | null
  } = {},
) {
  const controls = await loadProductVisibilityControls(PRODUCTS.map((product) => product.id))
  const catalog = PRODUCTS.map((product) => mergeProductVisibility(product, controls[product.id] || null))

  let products = filterCatalogByScope(catalog, scope)

  if (scope === 'admin') {
    try {
      const admin = getAdminClient()
      const { data: dbProducts, error } = await admin
        .from('products')
        .select('id, seller_id, seller_type, category, title, description, price, images, variants, image_url, metadata, status, is_active, printful_product_id, printful_sync_status, created_at')
        .order('created_at', { ascending: false })

      if (!error && Array.isArray(dbProducts)) {
        for (const row of dbProducts) {
          if (products.some((product) => product.id === row.id)) {
            continue
          }

          const mapped = mapDbProductToCatalogProduct(row)
          if (!mapped) continue
          products.push(mergeProductVisibility(mapped, controls[mapped.id] || null))
        }
      }
    } catch (error) {
      console.error('[product-visibility] admin product load failed:', error)
    }
  }

  if (options.category && options.category !== 'all') {
    const categoryLower = options.category.toLowerCase()
    products = products.filter((product) => product.category.toLowerCase() === categoryLower)
  }

  if (options.search) {
    const term = options.search.toLowerCase().trim()
    products = products.filter((product) => {
      if (!term) return true
      const haystack = [
        product.name,
        product.artist,
        product.category,
        product.description || '',
        product.visibilityStatus,
      ].join(' ').toLowerCase()
      return haystack.includes(term)
    })
  }

  products = products
    .map((product) => ({
      ...product,
      salePrice: Math.round((product.price || 5) * 1.3 * 100) / 100,
    }))
    .slice(0, options.limit || 200)

  return products
}

export async function loadCatalogProductById(id: string, scope: ProductCatalogScope = 'store') {
  const products = await loadCatalogProducts(scope)
  return products.find((product) => product.id === id) || null
}

export async function upsertProductVisibilityControl(record: ProductVisibilityRecord) {
  const admin = getAdminClient()
  const payload = {
    product_id: record.product_id,
    public_visible: record.public_visible,
    store_visible: record.store_visible,
    purchasable: record.purchasable,
    visibility_status: record.visibility_status,
    notes: record.notes,
    updated_by: record.updated_by,
  }

  const { data, error } = await admin
    .from('product_visibility_controls')
    .upsert(payload, { onConflict: 'product_id' })
    .select('id, product_id, public_visible, store_visible, purchasable, visibility_status, notes, updated_by, created_at, updated_at')
    .single()

  if (!error && data) {
    return data as ProductVisibilityRecord
  }

  if (!isMissingVisibilityTableError(error)) {
    throw error
  }

  await saveProductVisibilityControlToSettings({
    ...record,
    id: record.id,
  })

  return {
    ...record,
    id: record.id,
  } as ProductVisibilityRecord
}
