import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  SHIPMENT_EVENT_TYPES,
  SHIPMENT_EVENT_STATUSES,
  ShipmentEventRecord,
  formatShipmentEventStatus,
  formatShipmentEventType,
  isShipmentEventType,
  isShipmentEventStatus,
  normalizeShipmentEventRecord,
  normalizeShipmentEventStatus,
  normalizeShipmentEventType,
} from '@/lib/shipment-events'

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

const SHIPMENT_EVENT_SELECT = `
  id,
  fulfillment_job_id,
  event_type,
  event_status,
  carrier,
  tracking_number,
  tracking_url,
  location_city,
  location_state,
  notes,
  created_by,
  created_at,
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
  )
`

async function loadShipmentEvents(supabase: any, user: any, profile: any, req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const fulfillmentJobId = normalizeText(searchParams.get('fulfillment_job_id'))
  const eventTypeFilter = normalizeShipmentEventType(searchParams.get('event_type'))
  const eventStatusFilter = normalizeText(searchParams.get('event_status'))
  const limit = parseLimit(searchParams.get('limit'))

  let query = supabase
    .from('shipment_events')
    .select(SHIPMENT_EVENT_SELECT)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (eventTypeFilter && isShipmentEventType(eventTypeFilter)) {
    query = query.eq('event_type', eventTypeFilter)
  }

  if (eventStatusFilter && isShipmentEventStatus(eventStatusFilter)) {
    query = query.eq('event_status', normalizeShipmentEventStatus(eventStatusFilter))
  }

  if (isFounderOrAdmin(profile.role)) {
    if (fulfillmentJobId) {
      query = query.eq('fulfillment_job_id', fulfillmentJobId)
    }
  } else {
    const { data: jobs, error: jobsError } = await supabase
      .from('fulfillment_jobs')
      .select('id')
      .eq('artist_id', user.id)

    if (jobsError) {
      return { error: jobsError.message, status: 500 as const }
    }

    const jobIds = (jobs || []).map((job: { id: string }) => job.id)
    if (fulfillmentJobId) {
      if (!jobIds.includes(fulfillmentJobId)) {
        return { error: 'Shipment job not found', status: 404 as const }
      }
      query = query.eq('fulfillment_job_id', fulfillmentJobId)
    } else if (jobIds.length === 0) {
      return { events: [] as ShipmentEventRecord[], count: 0 }
    } else {
      query = query.in('fulfillment_job_id', jobIds)
    }
  }

  const { data, error } = await query
  if (error) {
    return { error: error.message, status: 500 as const }
  }

  const events = (data || []).map(normalizeShipmentEventRecord)
  return { events, count: events.length }
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

    const result = await loadShipmentEvents(supabase, user, profile, req)
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json({
      success: true,
      events: result.events,
      count: result.count,
      eventTypes: SHIPMENT_EVENT_TYPES,
      eventStatuses: SHIPMENT_EVENT_STATUSES,
      labels: {
        eventTypes: SHIPMENT_EVENT_TYPES.reduce((acc, type) => {
          acc[type] = formatShipmentEventType(type)
          return acc
        }, {} as Record<string, string>),
        eventStatuses: SHIPMENT_EVENT_STATUSES.reduce((acc, status) => {
          acc[status] = formatShipmentEventStatus(status)
          return acc
        }, {} as Record<string, string>),
      },
    })
  } catch (err: any) {
    console.error('[shipment-events:get] Exception:', err)
    return NextResponse.json({ error: err.message || 'Failed to fetch shipment events' }, { status: 500 })
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
    const eventType = normalizeShipmentEventType(body.event_type)
    const eventStatus = normalizeShipmentEventStatus(body.event_status, eventType)
    const carrier = normalizeText(body.carrier)
    const trackingNumber = normalizeText(body.tracking_number)
    const trackingUrl = normalizeText(body.tracking_url)
    const locationCity = normalizeText(body.location_city)
    const locationState = normalizeText(body.location_state)
    const notes = normalizeText(body.notes)

    if (!fulfillmentJobId) {
      return NextResponse.json({ error: 'fulfillment_job_id is required' }, { status: 400 })
    }

    if (!eventType) {
      return NextResponse.json(
        {
          error: `event_type must be one of: ${SHIPMENT_EVENT_TYPES.join(', ')}`,
        },
        { status: 400 }
      )
    }

    const { data: job, error: jobError } = await supabase
      .from('fulfillment_jobs')
      .select('id')
      .eq('id', fulfillmentJobId)
      .maybeSingle()

    if (jobError) {
      return NextResponse.json({ error: jobError.message }, { status: 500 })
    }

    if (!job) {
      return NextResponse.json({ error: 'Fulfillment job not found' }, { status: 404 })
    }

    const { data, error } = await supabase
      .from('shipment_events')
      .insert({
        fulfillment_job_id: fulfillmentJobId,
        event_type: eventType,
        event_status: eventStatus,
        carrier,
        tracking_number: trackingNumber,
        tracking_url: trackingUrl,
        location_city: locationCity,
        location_state: locationState,
        notes,
        created_by: user.id,
      })
      .select(SHIPMENT_EVENT_SELECT)
      .single()

    if (error) {
      console.error('[shipment-events:post] Insert error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      event: normalizeShipmentEventRecord(data),
    })
  } catch (err: any) {
    console.error('[shipment-events:post] Exception:', err)
    return NextResponse.json({ error: err.message || 'Failed to create shipment event' }, { status: 500 })
  }
}
