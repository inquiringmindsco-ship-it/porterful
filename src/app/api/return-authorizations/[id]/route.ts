import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  RETURN_AUTHORIZATION_STATUSES,
  RETURN_DISPOSITIONS,
  normalizeReturnAuthorizationRecord,
  normalizeReturnAuthorizationStatus,
  normalizeReturnDisposition,
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
    const status = normalizeReturnAuthorizationStatus(body.status)
    const disposition = normalizeReturnDisposition(body.disposition)
    const inspectionNotes = typeof body.inspection_notes === 'string' ? body.inspection_notes.trim() : null
    const reasonNotes = typeof body.reason_notes === 'string' ? body.reason_notes.trim() : null

    if (!status) {
      return NextResponse.json(
        {
          error: `status must be one of: ${RETURN_AUTHORIZATION_STATUSES.join(', ')}`,
        },
        { status: 400 }
      )
    }

    if (disposition && !RETURN_DISPOSITIONS.includes(disposition)) {
      return NextResponse.json(
        {
          error: `disposition must be one of: ${RETURN_DISPOSITIONS.join(', ')}`,
        },
        { status: 400 }
      )
    }

    const { data: current, error: loadError } = await supabase
      .from('return_authorizations')
      .select(RETURN_SELECT)
      .eq('id', id)
      .maybeSingle()

    if (loadError) {
      return NextResponse.json({ error: loadError.message }, { status: 500 })
    }

    if (!current) {
      return NextResponse.json({ error: 'Return authorization not found' }, { status: 404 })
    }

    const rpcArgs: Record<string, any> = {
      p_return_id: id,
      p_actor_id: user.id,
      p_next_status: status,
      p_disposition: disposition || null,
      p_inspection_notes: inspectionNotes || null,
      p_reason_notes: reasonNotes || null,
    }

    const { data, error } = await supabase.rpc('advance_return_authorization_status', rpcArgs)
    if (error) {
      console.error('[return-authorizations:patch] RPC error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      returnAuthorization: normalizeReturnAuthorizationRecord(data),
    })
  } catch (err: any) {
    console.error('[return-authorizations:patch] Exception:', err)
    return NextResponse.json({ error: err.message || 'Failed to update return authorization' }, { status: 500 })
  }
}
