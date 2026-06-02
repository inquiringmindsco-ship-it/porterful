import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  generateSkuCode,
  normalizeSkuCode,
  isProductSkuProductType,
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

async function resolveGeneratedSkuCode(supabase: any, baseCode: string) {
  const normalized = normalizeSkuCode(baseCode)
  if (!normalized) {
    throw new Error('Unable to generate a sku_code')
  }

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidate = attempt === 0 ? normalized : `${normalized}-${attempt + 1}`
    const exists = await skuCodeExists(supabase, candidate)
    if (!exists) {
      return candidate
    }
  }

  throw new Error('Unable to generate a unique sku_code')
}

export async function GET(req: NextRequest) {
  try {
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

    const { searchParams } = new URL(req.url)
    const artistId = searchParams.get('artist_id')
    const productionAssetId = searchParams.get('production_asset_id')
    const productId = searchParams.get('product_id')
    const activeParam = searchParams.get('active')

    let query = supabase
      .from('product_skus')
      .select(SKU_SELECT)

    if (isFounderOrAdmin(profile.role)) {
      if (artistId) query = query.eq('artist_id', artistId)
      if (productionAssetId) query = query.eq('production_asset_id', productionAssetId)
      if (productId) query = query.eq('product_id', productId)
    } else {
      query = query.eq('artist_id', user.id)
    }

    const activeValue = parseBooleanValue(activeParam)
    if (activeValue !== null) {
      query = query.eq('active', activeValue)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) {
      console.error('[product-skus:get] Query error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      skus: data || [],
      count: (data || []).length,
    })
  } catch (err: any) {
    console.error('[product-skus:get] Exception:', err)
    return NextResponse.json({ error: err.message || 'Failed to fetch SKUs' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
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
    const productionAssetId = normalizeText(body.production_asset_id)
    const productId = normalizeText(body.product_id)
    const productType = normalizeText(body.product_type)
    const variantName = normalizeText(body.variant_name)
    const size = normalizeText(body.size)
    const color = normalizeText(body.color)
    const packageType = normalizeText(body.package_type)
    const printLocation = normalizeText(body.print_location)
    const providedSkuCode = normalizeText(body.sku_code)
    const unitCostCents = parsePositiveInteger(body.unit_cost_cents)
    const retailPriceCents = parsePositiveInteger(body.retail_price_cents)
    const weightOz = parsePositiveNumber(body.weight_oz)
    const activeValue = parseBooleanValue(body.active)

    if (!productionAssetId) {
      return NextResponse.json({ error: 'production_asset_id is required' }, { status: 400 })
    }

    if (!productType) {
      return NextResponse.json({ error: 'product_type is required' }, { status: 400 })
    }

    if (!isProductSkuProductType(productType)) {
      return NextResponse.json(
        {
          error: `product_type must be one of: shirt, hoodie, poster, sticker, bundle, hat, tote, other`,
        },
        { status: 400 }
      )
    }
    const normalizedProductType = productType.toLowerCase()

    if (!variantName) {
      return NextResponse.json({ error: 'variant_name is required' }, { status: 400 })
    }

    if (unitCostCents === null || retailPriceCents === null) {
      return NextResponse.json(
        { error: 'unit_cost_cents and retail_price_cents are required' },
        { status: 400 }
      )
    }

    const { data: asset, error: assetError } = await supabase
      .from('production_assets')
      .select('asset_id, title, approval_status, production_status, creator_id, artist_id, is_current_version')
      .eq('asset_id', productionAssetId)
      .maybeSingle()

    if (assetError) {
      return NextResponse.json({ error: assetError.message }, { status: 500 })
    }

    if (!asset) {
      return NextResponse.json({ error: 'Production asset not found' }, { status: 404 })
    }

    if (asset.production_status !== 'production_approved') {
      return NextResponse.json(
        {
          error: 'Only production-approved assets can become SKUs',
          code: 'ASSET_NOT_PRODUCTION_APPROVED',
        },
        { status: 400 }
      )
    }

    const { data: product, error: productError } = productId
      ? await supabase
          .from('products')
          .select('id')
          .eq('id', productId)
          .maybeSingle()
      : { data: null, error: null }

    if (productError) {
      return NextResponse.json({ error: productError.message }, { status: 500 })
    }

    if (productId && !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const artistId = asset.artist_id || asset.creator_id || null
    if (!artistId) {
      return NextResponse.json(
        { error: 'The production asset must be tied to an artist or creator' },
        { status: 400 }
      )
    }

    let skuCode: string
    if (providedSkuCode) {
      skuCode = normalizeSkuCode(providedSkuCode)
      if (!skuCode) {
        return NextResponse.json({ error: 'sku_code is invalid' }, { status: 400 })
      }

      const exists = await skuCodeExists(supabase, skuCode)
      if (exists) {
        return NextResponse.json({ error: 'sku_code already exists' }, { status: 409 })
      }
    } else {
      skuCode = await resolveGeneratedSkuCode(
        supabase,
        generateSkuCode({
          assetTitle: asset.title,
          variantName,
          size,
          color,
          assetId: asset.asset_id,
        })
      )
    }

    const { data, error } = await supabase
      .from('product_skus')
      .insert({
        sku_code: skuCode,
        production_asset_id: productionAssetId,
        product_id: productId || null,
        artist_id: artistId,
        product_type: normalizedProductType,
        variant_name: variantName,
        size,
        color,
        unit_cost_cents: unitCostCents,
        retail_price_cents: retailPriceCents,
        weight_oz: weightOz,
        package_type: packageType,
        print_location: printLocation,
        active: activeValue ?? false,
      })
      .select(SKU_SELECT)
      .single()

    if (error) {
      console.error('[product-skus:post] Insert error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, sku: data }, { status: 201 })
  } catch (err: any) {
    console.error('[product-skus:post] Exception:', err)
    return NextResponse.json({ error: err.message || 'Failed to create SKU' }, { status: 500 })
  }
}
