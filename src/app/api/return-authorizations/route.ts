import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  RETURN_AUTHORIZATION_STATUSES,
  RETURN_DISPOSITIONS,
  ReturnAuthorizationRecord,
  formatReturnAuthorizationStatus,
  formatReturnDisposition,
  normalizeReturnAuthorizationRecord,
  normalizeReturnAuthorizationStatus,
  normalizeReturnDisposition,
  parseReturnQuantity,
} from '@/lib/return-authorizations'

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
  const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null

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

function parseLimit(value: string | null) {
  const parsed = Number.parseInt(value || '', 10)
  if (!Number.isFinite(parsed) || Number.isNaN(parsed) || parsed <= 0) return 250
  return Math.min(parsed, 500)
}

const RETURN_SELECT = `
  id,
  return_number,
  fulfillment_job_id,
  sku_id,
  artist_id,
  quantity,
  customer_name,
  customer_email,
  reason_code,
  reason_notes,
  status,
  requested_at,
  approved_at,
  received_at,
  inspected_at,
  closed_at,
  inspection_notes,
  disposition,
  created_by,
  updated_by,
  created_at,
  updated_at,
  fulfillment_job:fulfillment_jobs(
    id,
    job_number,
    status,
    quantity,
    sku_id,
    production_asset_id,
    artist_id,
    sku:product_skus(
      sku_id,
      sku_code,
      product_type,
      variant_name,
      size,
      color,
      active
    ),
    asset:production_assets(
      asset_id,
      title,
      asset_type,
      approval_status,
      production_status
    )
  ),
  sku:product_skus(
    sku_id,
    sku_code,
    product_type,
    variant_name,
    size,
    color,
    active,
    production_asset_id
  ),
  artist:profiles(id, full_name, username, email),
  creator:profiles!return_authorizations_created_by_fkey(id, full_name, username, email),
  updater:profiles!return_authorizations_updated_by_fkey(id, full_name, username, email)
`

function buildDispositionLabels() {
  return RETURN_DISPOSITIONS.reduce((acc, disposition) => {
    acc[disposition] = formatReturnDisposition(disposition)
    return acc
  }, {} as Record<string, string>)
}

function buildStatusLabels() {
  return RETURN_AUTHORIZATION_STATUSES.reduce((acc, status) => {
    acc[status] = formatReturnAuthorizationStatus(status)
    return acc
  }, {} as Record<string, string>)
}

async function loadReturnAuthorizations(supabase: any, user: any, profile: any, req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const fulfillmentJobId = normalizeText(searchParams.get('fulfillment_job_id'))
  const skuId = normalizeText(searchParams.get('sku_id'))
  const statusFilter = normalizeReturnAuthorizationStatus(searchParams.get('status'))
  const dispositionFilter = normalizeReturnDisposition(searchParams.get('disposition'))
  const limit = parseLimit(searchParams.get('limit'))

  let query = supabase
    .from('return_authorizations')
    .select(RETURN_SELECT)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (!isFounderOrAdmin(profile.role)) {
    query = query.eq('artist_id', user.id)
  } else {
    const artistId = normalizeText(searchParams.get('artist_id'))
    if (artistId) query = query.eq('artist_id', artistId)
  }

  if (fulfillmentJobId) {
    query = query.eq('fulfillment_job_id', fulfillmentJobId)
  }

  if (skuId) {
    query = query.eq('sku_id', skuId)
  }

  if (statusFilter) {
    query = query.eq('status', statusFilter)
  }

  if (dispositionFilter) {
    query = query.eq('disposition', dispositionFilter)
  }

  const { data, error } = await query
  if (error) {
    return { error: error.message, status: 500 as const }
  }

  const returns = (data || []).map(normalizeReturnAuthorizationRecord)
  return { returns, count: returns.length }
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

    const result = await loadReturnAuthorizations(supabase, user, profile, req)
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json({
      success: true,
      returns: result.returns,
      count: result.count,
      statuses: RETURN_AUTHORIZATION_STATUSES,
      dispositions: RETURN_DISPOSITIONS,
      labels: {
        statuses: buildStatusLabels(),
        dispositions: buildDispositionLabels(),
      },
    })
  } catch (err: any) {
    console.error('[return-authorizations:get] Exception:', err)
    return NextResponse.json({ error: err.message || 'Failed to fetch return authorizations' }, { status: 500 })
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
    const fulfillmentJobId = normalizeText(body.fulfillment_job_id)
    const reasonCode = normalizeText(body.reason_code)
    const reasonNotes = normalizeText(body.reason_notes)
    const customerName = normalizeText(body.customer_name)
    const customerEmail = normalizeText(body.customer_email)
    const quantity = parseReturnQuantity(body.quantity) || 1

    if (!fulfillmentJobId) {
      return NextResponse.json({ error: 'fulfillment_job_id is required' }, { status: 400 })
    }

    if (!reasonCode) {
      return NextResponse.json({ error: 'reason_code is required' }, { status: 400 })
    }

    const { data: job, error: jobError } = await supabase
      .from('fulfillment_jobs')
      .select(`
        id,
        job_number,
        status,
        quantity,
        sku_id,
        production_asset_id,
        artist_id,
        customer_name,
        customer_email,
        sku:product_skus(
          sku_id,
          artist_id,
          production_asset_id,
          active
        )
      `)
      .eq('id', fulfillmentJobId)
      .maybeSingle()

    if (jobError) {
      return NextResponse.json({ error: jobError.message }, { status: 500 })
    }

    if (!job) {
      return NextResponse.json({ error: 'Fulfillment job not found' }, { status: 404 })
    }

    if (job.status !== 'delivered') {
      return NextResponse.json({ error: 'Return authorizations can only be created for delivered jobs' }, { status: 400 })
    }

    const jobSku = Array.isArray(job.sku) ? job.sku[0] || null : job.sku || null
    const artistId = job.artist_id || jobSku?.artist_id || null
    const skuId = job.sku_id || jobSku?.sku_id || null

    if (!skuId) {
      return NextResponse.json({ error: 'Unable to resolve SKU for fulfillment job' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('return_authorizations')
      .insert({
        fulfillment_job_id: fulfillmentJobId,
        sku_id: skuId,
        artist_id: artistId,
        quantity,
        customer_name: customerName || job.customer_name || null,
        customer_email: customerEmail || job.customer_email || null,
        reason_code: reasonCode,
        reason_notes: reasonNotes,
        created_by: user.id,
        updated_by: user.id,
      })
      .select(RETURN_SELECT)
      .single()

    if (error) {
      console.error('[return-authorizations:post] Insert error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      returnAuthorization: normalizeReturnAuthorizationRecord(data),
    })
  } catch (err: any) {
    console.error('[return-authorizations:post] Exception:', err)
    return NextResponse.json({ error: err.message || 'Failed to create return authorization' }, { status: 500 })
  }
}
