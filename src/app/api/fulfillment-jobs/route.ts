import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  FULFILLMENT_JOB_PRIORITIES,
  FULFILLMENT_JOB_STATUSES,
  FulfillmentJobRecord,
  normalizeFulfillmentJobPriority,
  normalizeFulfillmentJobStatus,
  normalizeFulfillmentJobRecord,
} from '@/lib/fulfillment-jobs'

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

function parseLimit(value: unknown, fallback = 150) {
  const parsed = typeof value === 'string' ? Number.parseInt(value, 10) : NaN
  if (Number.isFinite(parsed) && parsed > 0) return Math.min(parsed, 500)
  return fallback
}

function parseBoolean(value: unknown) {
  if (typeof value === 'boolean') return value
  if (typeof value !== 'string') return false
  return ['true', '1', 'yes', 'on'].includes(value.trim().toLowerCase())
}

function parseShippingAddress(value: unknown) {
  if (value == null || value === '') return null
  if (typeof value === 'object') return value as Record<string, any>
  if (typeof value !== 'string') return null

  const trimmed = value.trim()
  if (!trimmed) return null

  try {
    return JSON.parse(trimmed)
  } catch {
    throw new Error('shipping_address must be valid JSON or an object')
  }
}

const JOB_SELECT = `
  id,
  job_number,
  sku_id,
  production_asset_id,
  artist_id,
  quantity,
  status,
  priority,
  customer_name,
  customer_email,
  shipping_address,
  notes,
  created_by,
  assigned_to,
  reserved_at,
  printing_at,
  qc_at,
  packed_at,
  shipped_at,
  delivered_at,
  cancelled_at,
  created_at,
  updated_at,
  sku:product_skus!fulfillment_jobs_sku_id_fkey(
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
    artist:profiles!product_skus_artist_id_fkey(id, full_name, username, email)
  ),
  asset:production_assets!fulfillment_jobs_production_asset_id_fkey(
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
  creator:profiles!fulfillment_jobs_created_by_fkey(id, full_name, username, email),
  assignee:profiles!fulfillment_jobs_assigned_to_fkey(id, full_name, username, email),
  artist_profile:profiles!fulfillment_jobs_artist_id_fkey(id, full_name, username, email)
`

function buildJobFilters(query: URLSearchParams) {
  return {
    status: normalizeFulfillmentJobStatus(query.get('status')),
    skuId: normalizeText(query.get('sku_id')),
    artistId: normalizeText(query.get('artist_id')),
    priority: normalizeText(query.get('priority'))?.toLowerCase() || null,
    limit: parseLimit(query.get('limit')),
  }
}

async function fetchJobs(supabase: any, filters: ReturnType<typeof buildJobFilters>, role: string, userId: string) {
  let query = supabase.from('fulfillment_jobs').select(JOB_SELECT)

  if (isFounderOrAdmin(role)) {
    if (filters.status) query = query.eq('status', filters.status)
    if (filters.skuId) query = query.eq('sku_id', filters.skuId)
    if (filters.artistId) query = query.eq('artist_id', filters.artistId)
    if (filters.priority && FULFILLMENT_JOB_PRIORITIES.includes(filters.priority as any)) {
      query = query.eq('priority', filters.priority)
    }
  } else {
    query = query.eq('artist_id', userId)
    if (filters.status) query = query.eq('status', filters.status)
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(filters.limit)

  if (error) {
    throw new Error(error.message)
  }

  return (data || []).map((job: any) => normalizeFulfillmentJobRecord(job)) as FulfillmentJobRecord[]
}

function summarizeJobs(jobs: FulfillmentJobRecord[]) {
  return FULFILLMENT_JOB_STATUSES.reduce(
    (acc, status) => {
      acc[status] = jobs.filter((job) => job.status === status).length
      return acc
    },
    {} as Record<(typeof FULFILLMENT_JOB_STATUSES)[number], number>
  )
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
    const filters = buildJobFilters(searchParams)
    const jobs = await fetchJobs(supabase, filters, profile.role, user.id)

    return NextResponse.json({
      success: true,
      jobs,
      counts: {
        total: jobs.length,
        ...summarizeJobs(jobs),
      },
      statuses: FULFILLMENT_JOB_STATUSES,
      priorities: FULFILLMENT_JOB_PRIORITIES,
    })
  } catch (err: any) {
    console.error('[fulfillment-jobs:get] Exception:', err)
    return NextResponse.json({ error: err.message || 'Failed to fetch fulfillment jobs' }, { status: 500 })
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
    const quantity = typeof body.quantity === 'number'
      ? Math.trunc(body.quantity)
      : typeof body.quantity === 'string'
        ? Number.parseInt(body.quantity, 10)
        : NaN
    const priority = normalizeFulfillmentJobPriority(body.priority)
    const customerName = normalizeText(body.customer_name)
    const customerEmail = normalizeText(body.customer_email)
    const notes = normalizeText(body.notes)
    const assignedTo = normalizeText(body.assigned_to)
    const reserveInventory = parseBoolean(body.reserve_inventory)
    const shippingAddress = parseShippingAddress(body.shipping_address)

    if (!skuId) {
      return NextResponse.json({ error: 'sku_id is required' }, { status: 400 })
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      return NextResponse.json({ error: 'quantity must be a positive integer' }, { status: 400 })
    }

    const { data: sku, error: skuError } = await supabase
      .from('product_skus')
      .select(`
        sku_id,
        sku_code,
        production_asset_id,
        artist_id,
        active,
        asset:production_assets!product_skus_production_asset_id_fkey(
          asset_id,
          title,
          approval_status,
          production_status,
          creator_id,
          artist_id
        )
      `)
      .eq('sku_id', skuId)
      .maybeSingle()

    if (skuError) {
      return NextResponse.json({ error: skuError.message }, { status: 500 })
    }

    if (!sku) {
      return NextResponse.json({ error: 'SKU not found' }, { status: 404 })
    }

    if (!sku.active) {
      return NextResponse.json({ error: 'SKU must be active before it can be queued for fulfillment' }, { status: 400 })
    }

    const assetRecord = Array.isArray(sku.asset) ? sku.asset[0] : sku.asset

    if (!assetRecord || assetRecord.production_status !== 'production_approved') {
      return NextResponse.json(
        { error: 'SKU must reference a production-approved asset' },
        { status: 400 }
      )
    }

    const artistId = sku.artist_id || assetRecord.artist_id || assetRecord.creator_id || null
    if (!artistId) {
      return NextResponse.json(
        { error: 'Unable to resolve artist for fulfillment job' },
        { status: 400 }
      )
    }

    let assignedToValue: string | null = null
    if (assignedTo) {
      const { data: assignee, error: assigneeError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', assignedTo)
        .maybeSingle()

      if (assigneeError) {
        return NextResponse.json({ error: assigneeError.message }, { status: 500 })
      }

      if (!assignee) {
        return NextResponse.json({ error: 'assigned_to profile not found' }, { status: 404 })
      }

      assignedToValue = assignee.id
    }

    const { data: createdJob, error: createError } = await supabase
      .from('fulfillment_jobs')
      .insert({
        sku_id: sku.sku_id,
        production_asset_id: sku.production_asset_id,
        artist_id: artistId,
        quantity,
        status: 'pending',
        priority,
        customer_name: customerName,
        customer_email: customerEmail,
        shipping_address: shippingAddress,
        notes,
        created_by: user.id,
        assigned_to: assignedToValue,
      })
      .select(JOB_SELECT)
      .single()

    if (createError) {
      console.error('[fulfillment-jobs:post] Insert error:', createError.message)
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }

    let job = normalizeFulfillmentJobRecord(createdJob) as FulfillmentJobRecord

    if (reserveInventory) {
      const { data: reservedJob, error: reserveError } = await supabase.rpc('advance_fulfillment_job_status', {
        p_job_id: job.id,
        p_actor_id: user.id,
        p_next_status: 'reserved',
        p_notes: notes || null,
      })

      if (reserveError) {
        await supabase.from('fulfillment_jobs').delete().eq('id', job.id)
        return NextResponse.json({ error: reserveError.message }, { status: 500 })
      }

      const transitionedJob = normalizeFulfillmentJobRecord(Array.isArray(reservedJob) ? reservedJob[0] : reservedJob)
      job = (transitionedJob || job) as FulfillmentJobRecord
    }

    return NextResponse.json({ success: true, job }, { status: 201 })
  } catch (err: any) {
    console.error('[fulfillment-jobs:post] Exception:', err)
    return NextResponse.json({ error: err.message || 'Failed to create fulfillment job' }, { status: 500 })
  }
}
