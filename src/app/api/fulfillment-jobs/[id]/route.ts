import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  FULFILLMENT_JOB_STATUSES,
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
    const nextStatus = normalizeFulfillmentJobStatus(body.status)
    const notes = typeof body.notes === 'string' ? body.notes.trim() : null

    if (!nextStatus) {
      return NextResponse.json(
        {
          error: `status must be one of: ${FULFILLMENT_JOB_STATUSES.join(', ')}`,
        },
        { status: 400 }
      )
    }

    const { data: job, error: jobError } = await supabase
      .from('fulfillment_jobs')
      .select('id, artist_id')
      .eq('id', id)
      .maybeSingle()

    if (jobError) {
      return NextResponse.json({ error: jobError.message }, { status: 500 })
    }

    if (!job) {
      return NextResponse.json({ error: 'Fulfillment job not found' }, { status: 404 })
    }

    const { data, error } = await supabase.rpc('advance_fulfillment_job_status', {
      p_job_id: id,
      p_actor_id: user.id,
      p_next_status: nextStatus,
      p_notes: notes || null,
    })

    if (error) {
      console.error('[fulfillment-jobs:patch] RPC error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data: updatedJob, error: reloadError } = await supabase
      .from('fulfillment_jobs')
      .select(JOB_SELECT)
      .eq('id', id)
      .single()

    if (reloadError) {
      return NextResponse.json({ error: reloadError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      job: normalizeFulfillmentJobRecord(updatedJob),
      transition: nextStatus,
      rpc_result: Array.isArray(data) ? data[0] : data || null,
    })
  } catch (err: any) {
    console.error('[fulfillment-jobs:patch] Exception:', err)
    return NextResponse.json({ error: err.message || 'Failed to update fulfillment job' }, { status: 500 })
  }
}
