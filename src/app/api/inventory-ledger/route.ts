import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  formatInventoryMovementType,
  INVENTORY_MOVEMENT_TYPES,
  InventoryLedgerRecord,
  isInventoryMovementType,
  parseInventoryQuantity,
  summarizeInventoryLedger,
} from '@/lib/inventory-ledger'
import { ProductSkuRecord } from '@/lib/product-skus'

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

function normalizeText(value: unknown) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed || null
}

function parseLimit(value: unknown, fallback = 200) {
  const parsed = typeof value === 'string' ? Number.parseInt(value, 10) : NaN
  if (Number.isFinite(parsed) && parsed > 0) return Math.min(parsed, 500)
  return fallback
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
  product:products(id, title, category, price, is_active)
`

const LEDGER_SELECT = `
  id,
  sku_id,
  movement_type,
  quantity,
  reason,
  reference_type,
  reference_id,
  notes,
  created_by,
  created_at,
  creator:profiles(id, full_name, username, email)
`

async function fetchAccessibleSkus(
  supabase: any,
  profile: { role?: string | null; id: string },
  query: URLSearchParams
) {
  const skuId = normalizeText(query.get('sku_id'))
  const artistId = normalizeText(query.get('artist_id'))

  let skuQuery = supabase.from('product_skus').select(SKU_SELECT)

  if (isFounderOrAdmin(profile.role)) {
    if (skuId) {
      skuQuery = skuQuery.eq('sku_id', skuId)
    } else if (artistId) {
      skuQuery = skuQuery.eq('artist_id', artistId)
    }
  } else {
    skuQuery = skuQuery.eq('artist_id', profile.id)
    if (skuId) {
      skuQuery = skuQuery.eq('sku_id', skuId)
    }
  }

  const { data, error } = await skuQuery.order('created_at', { ascending: false })
  if (error) {
    throw new Error(error.message)
  }

  return (data || []) as ProductSkuRecord[]
}

async function fetchLedgerEntries(
  supabase: any,
  skuIds: string[],
  movementType: string | null,
  limit: number
) {
  if (skuIds.length === 0) return []

  let ledgerQuery = supabase
    .from('inventory_ledger')
    .select(LEDGER_SELECT)
    .in('sku_id', skuIds)

  if (movementType && INVENTORY_MOVEMENT_TYPES.includes(movementType as any)) {
    ledgerQuery = ledgerQuery.eq('movement_type', movementType)
  }

  const { data, error } = await ledgerQuery
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(error.message)
  }

  return (data || []) as InventoryLedgerRecord[]
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
    const movementType = normalizeText(searchParams.get('movement_type'))
    const limit = parseLimit(searchParams.get('limit'))

    if (movementType && !INVENTORY_MOVEMENT_TYPES.includes(movementType as any)) {
      return NextResponse.json(
        {
          error: `movement_type must be one of: ${INVENTORY_MOVEMENT_TYPES.join(', ')}`,
        },
        { status: 400 }
      )
    }

    const skus = await fetchAccessibleSkus(supabase, profile, searchParams)
    const skuIds = skus.map((sku) => sku.sku_id)
    const entries = await fetchLedgerEntries(supabase, skuIds, movementType, limit)

    const entriesWithSku = entries.map((entry) => ({
      ...entry,
      sku: skus.find((sku) => sku.sku_id === entry.sku_id) || null,
    }))

    const summaries = summarizeInventoryLedger(skus, entries)

    return NextResponse.json({
      success: true,
      skus,
      summaries,
      entries: isFounderOrAdmin(profile.role) ? entriesWithSku : [],
      counts: {
        skus: skus.length,
        entries: entries.length,
      },
      movementTypes: INVENTORY_MOVEMENT_TYPES,
    })
  } catch (err: any) {
    console.error('[inventory-ledger:get] Exception:', err)
    return NextResponse.json({ error: err.message || 'Failed to fetch inventory ledger' }, { status: 500 })
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
    const skuId = normalizeText(body.sku_id)
    const movementTypeRaw = normalizeText(body.movement_type)
    const reason = normalizeText(body.reason)
    const referenceType = normalizeText(body.reference_type)
    const referenceId = normalizeText(body.reference_id)
    const notes = normalizeText(body.notes)

    if (!skuId) {
      return NextResponse.json({ error: 'sku_id is required' }, { status: 400 })
    }

    if (!movementTypeRaw || !isInventoryMovementType(movementTypeRaw)) {
      return NextResponse.json(
        {
          error: `movement_type must be one of: ${INVENTORY_MOVEMENT_TYPES.join(', ')}`,
        },
        { status: 400 }
      )
    }

    const movementType = movementTypeRaw
    const quantity = parseInventoryQuantity(body.quantity, movementType)
    if (quantity === null) {
      return NextResponse.json({ error: 'quantity is invalid for this movement type' }, { status: 400 })
    }

    if (!reason) {
      return NextResponse.json({ error: 'reason is required' }, { status: 400 })
    }

    const { data: sku, error: skuError } = await supabase
      .from('product_skus')
      .select(SKU_SELECT)
      .eq('sku_id', skuId)
      .maybeSingle()

    if (skuError) {
      return NextResponse.json({ error: skuError.message }, { status: 500 })
    }

    if (!sku) {
      return NextResponse.json({ error: 'SKU not found' }, { status: 404 })
    }

    const { data, error } = await supabase
      .from('inventory_ledger')
      .insert({
        sku_id: skuId,
        movement_type: movementType,
        quantity,
        reason,
        reference_type: referenceType,
        reference_id: referenceId,
        notes,
        created_by: user.id,
      })
      .select(LEDGER_SELECT)
      .single()

    if (error) {
      console.error('[inventory-ledger:post] Insert error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      {
        success: true,
        inventory_event: {
          ...data,
          sku,
        },
        movement_label: formatInventoryMovementType(movementType),
      },
      { status: 201 }
    )
  } catch (err: any) {
    console.error('[inventory-ledger:post] Exception:', err)
    return NextResponse.json({ error: err.message || 'Failed to create inventory event' }, { status: 500 })
  }
}
