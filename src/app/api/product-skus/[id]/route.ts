import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  isProductSkuProductType,
  normalizeSkuCode,
  parsePositiveInteger,
  parsePositiveNumber,
} from '@/lib/product-skus'

export const dynamic = 'force-dynamic'

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase admin configuration')
  }

  return createClient(url, key, { auth: { persistSession: false } })
}

async function getUserFromRequest(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.replace('Bearer ', '')
    : null

  const supabase = createAdminClient()
  if (!token) return { user: null, supabase }

  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return { user: null, supabase }

  return { user, supabase }
}

async function getProfile(supabase: any, userId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('id, role, full_name, username, email')
    .eq('id', userId)
    .single()

  return data || null
}

function isFounderOrAdmin(role?: string | null) {
  return role === 'founder' || role === 'admin'
}

function parseBooleanValue(value: unknown) {
  if (typeof value === 'boolean') return value
  if (typeof value !== 'string') return null

  const normalized = value.trim().toLowerCase()
  if (['true', '1', 'yes', 'on'].includes(normalized)) return true
  if (['false', '0', 'no', 'off'].includes(normalized)) return false
  return null
}

function normalizeText(value: unknown) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed || null
}

const SKU_SELECT = `
  sku_id,
  sku_code,
  production_asset_id,
  product_id,
  artist_id,
  product_type,
  variant_name,
  size,
  color,
  unit_cost_cents,
  retail_price_cents,
  weight_oz,
  package_type,
  print_location,
  active,
  created_at,
  updated_at,
  asset:production_assets(
    asset_id,
    title,
    asset_type,
    approval_status,
    production_status,
    creator_id,
    artist_id,
    source_song_id,
    source_campaign,
    version_number,
    is_current_version
  ),
  artist:profiles(id, full_name, username, email),
  product:products(id, name, category, price, is_active)
`

async function skuCodeExists(supabase: any, skuCode: string, excludeSkuId?: string | null) {
  let query = supabase
    .from('product_skus')
    .select('sku_id')
    .eq('sku_code', skuCode)

  if (excludeSkuId) {
    query = query.neq('sku_id', excludeSkuId)
  }

  const { data, error } = await query.maybeSingle()
  if (error) {
    throw error
  }

  return !!data
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { user, supabase } = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await getProfile(supabase, user.id)
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (!['artist', 'admin', 'founder'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    let query = supabase
      .from('product_skus')
      .select(SKU_SELECT)
      .eq('sku_id', id)

    if (!isFounderOrAdmin(profile.role)) {
      query = query.eq('artist_id', user.id)
    }

    const { data, error } = await query.maybeSingle()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'SKU not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, sku: data })
  } catch (err: any) {
    console.error('[product-skus:get-by-id] Exception:', err)
    return NextResponse.json({ error: err.message || 'Failed to fetch SKU' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { user, supabase } = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await getProfile(supabase, user.id)
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (!isFounderOrAdmin(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()

    if (Object.prototype.hasOwnProperty.call(body, 'production_asset_id') || Object.prototype.hasOwnProperty.call(body, 'artist_id')) {
      return NextResponse.json(
        { error: 'production_asset_id and artist_id cannot be changed on an SKU' },
        { status: 400 }
      )
    }

    const updatePayload: Record<string, any> = {}

    const skuCodeValue = normalizeText(body.sku_code)
    if (skuCodeValue) {
      const normalized = normalizeSkuCode(skuCodeValue)
      if (!normalized) {
        return NextResponse.json({ error: 'sku_code is invalid' }, { status: 400 })
      }

      const exists = await skuCodeExists(supabase, normalized, id)
      if (exists) {
        return NextResponse.json({ error: 'sku_code already exists' }, { status: 409 })
      }

      updatePayload.sku_code = normalized
    }

    const productIdValue = Object.prototype.hasOwnProperty.call(body, 'product_id')
      ? normalizeText(body.product_id)
      : undefined
    if (productIdValue !== undefined) {
      if (productIdValue) {
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('id')
          .eq('id', productIdValue)
          .maybeSingle()

        if (productError) {
          return NextResponse.json({ error: productError.message }, { status: 500 })
        }

        if (!product) {
          return NextResponse.json({ error: 'Product not found' }, { status: 404 })
        }
      }

      updatePayload.product_id = productIdValue || null
    }

    const textFields = ['product_type', 'variant_name', 'size', 'color', 'package_type', 'print_location'] as const
    for (const field of textFields) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        const value = normalizeText(body[field])
      if (field === 'product_type' || field === 'variant_name') {
        if (!value) {
          return NextResponse.json({ error: `${field} is required` }, { status: 400 })
        }
        if (field === 'product_type' && !isProductSkuProductType(value)) {
          return NextResponse.json(
            {
              error: `product_type must be one of: shirt, hoodie, poster, sticker, bundle, hat, tote, other`,
            },
            { status: 400 }
          )
        }
        updatePayload[field] = field === 'product_type' ? value.toLowerCase() : value
      } else {
        updatePayload[field] = value
      }
      }
    }

    if (Object.prototype.hasOwnProperty.call(body, 'unit_cost_cents')) {
      const value = parsePositiveInteger(body.unit_cost_cents)
      if (value === null) {
        return NextResponse.json({ error: 'unit_cost_cents is invalid' }, { status: 400 })
      }
      updatePayload.unit_cost_cents = value
    }

    if (Object.prototype.hasOwnProperty.call(body, 'retail_price_cents')) {
      const value = parsePositiveInteger(body.retail_price_cents)
      if (value === null) {
        return NextResponse.json({ error: 'retail_price_cents is invalid' }, { status: 400 })
      }
      updatePayload.retail_price_cents = value
    }

    if (Object.prototype.hasOwnProperty.call(body, 'weight_oz')) {
      const value = parsePositiveNumber(body.weight_oz)
      updatePayload.weight_oz = value === null ? null : value
    }

    if (Object.prototype.hasOwnProperty.call(body, 'active')) {
      const activeValue = parseBooleanValue(body.active)
      if (activeValue === null) {
        return NextResponse.json({ error: 'active is invalid' }, { status: 400 })
      }
      updatePayload.active = activeValue
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: 'No updatable fields provided' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('product_skus')
      .update(updatePayload)
      .eq('sku_id', id)
      .select(SKU_SELECT)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'SKU not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, sku: data })
  } catch (err: any) {
    console.error('[product-skus:patch] Exception:', err)
    return NextResponse.json({ error: err.message || 'Failed to update SKU' }, { status: 500 })
  }
}
