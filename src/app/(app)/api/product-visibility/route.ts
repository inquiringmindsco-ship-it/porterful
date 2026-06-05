import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient, verifyAdminAccess } from '@/lib/admin-client'
import {
  loadCatalogProductById,
  loadProductVisibilityControls,
  mergeProductVisibility,
  type ProductVisibilityStatus,
} from '@/lib/product-visibility'

export const dynamic = 'force-dynamic'

function normalizeBoolean(value: unknown): boolean | null {
  if (typeof value === 'boolean') return value
  return null
}

function normalizeStatus(value: unknown): ProductVisibilityStatus | null {
  const status = String(value || '').toLowerCase().trim()
  if (status === 'live' || status === 'preview' || status === 'unavailable' || status === 'hidden' || status === 'controlled') {
    return status
  }
  return null
}

function isProductApprovedForLive(product: { available?: boolean; fulfillment?: string | null; skuCode?: string | null; catalogStatus?: string | null; fulfillmentType?: string | null }) {
  if (product.skuCode === 'COMING-HOME-TEE-001') return true
  if (product.catalogStatus && /controlled|approved|live/i.test(String(product.catalogStatus))) return true
  if (product.available === true && product.fulfillment !== 'mock') return true
  if (product.fulfillmentType === 'img_fulfillment' && product.available === true) return true
  return false
}

export async function GET(request: NextRequest) {
  const productId = request.nextUrl.searchParams.get('productId')
  if (!productId) {
    return NextResponse.json({ error: 'productId is required' }, { status: 400 })
  }

  const product = await loadCatalogProductById(productId, 'admin')
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  return NextResponse.json({
    product,
    visibility: {
      public_visible: product.publicVisible,
      store_visible: product.storeVisible,
      purchasable: product.purchasable,
      visibility_status: product.visibilityStatus,
    },
  })
}

export async function PATCH(request: NextRequest) {
  const access = await verifyAdminAccess(request)
  if (!access.authorized || !access.userId) {
    return NextResponse.json({ error: access.error || 'Forbidden' }, { status: access.authorized ? 403 : 401 })
  }

  const body = await request.json().catch(() => ({}))
  const productId = String(body?.productId || '').trim()
  if (!productId) {
    return NextResponse.json({ error: 'productId is required' }, { status: 400 })
  }

  const product = await loadCatalogProductById(productId, 'admin')
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  const preset = normalizeStatus(body?.preset || body?.visibilityStatus)
  const currentControls = await loadProductVisibilityControls([productId])
  const current = mergeProductVisibility(product, currentControls[productId] || null)

  let publicVisible = normalizeBoolean(body?.publicVisible)
  let storeVisible = normalizeBoolean(body?.storeVisible)
  let purchasable = normalizeBoolean(body?.purchasable)
  let visibilityStatus: ProductVisibilityStatus = current.visibilityStatus

  if (preset) {
    visibilityStatus = preset
    if ((preset === 'live' || preset === 'controlled') && !isProductApprovedForLive(product)) {
      return NextResponse.json(
        { error: `${product.name} is not approved for live purchase yet.` },
        { status: 400 },
      )
    }

    if (preset === 'live' || preset === 'controlled') {
      publicVisible = true
      storeVisible = true
      purchasable = true
    } else if (preset === 'preview') {
      publicVisible = true
      storeVisible = true
      purchasable = false
    } else {
      publicVisible = false
      storeVisible = false
      purchasable = false
    }
  }

  const nextPublicVisible = publicVisible ?? current.publicVisible
  const nextStoreVisible = storeVisible ?? current.storeVisible
  let nextPurchasable = purchasable ?? current.purchasable

  if (!nextPublicVisible && !nextStoreVisible) {
    nextPurchasable = false
    visibilityStatus = 'hidden'
  } else if (!nextPublicVisible && nextStoreVisible) {
    nextPurchasable = false
    visibilityStatus = 'unavailable'
  } else if (!nextPurchasable) {
    visibilityStatus = 'preview'
  } else {
    if (!isProductApprovedForLive(product)) {
      return NextResponse.json(
        { error: `${product.name} is not approved for live purchase yet.` },
        { status: 400 },
      )
    }

    visibilityStatus = product.visibilityStatus === 'controlled' || product.skuCode === 'COMING-HOME-TEE-001'
      ? 'controlled'
      : 'live'
  }

  const notes = typeof body?.notes === 'string' ? body.notes.trim() : null
  const admin = getAdminClient()

  const { data, error } = await admin
    .from('product_visibility_controls')
    .upsert({
      product_id: productId,
      public_visible: nextPublicVisible,
      store_visible: nextStoreVisible,
      purchasable: nextPurchasable,
      visibility_status: visibilityStatus,
      notes,
      updated_by: access.userId,
    }, { onConflict: 'product_id' })
    .select('id, product_id, public_visible, store_visible, purchasable, visibility_status, notes, updated_by, created_at, updated_at')
    .single()

  if (error) {
    console.error('[product-visibility] update error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const merged = await loadCatalogProductById(productId, 'admin')

  return NextResponse.json({
    success: true,
    visibility: data,
    product: merged,
  })
}
