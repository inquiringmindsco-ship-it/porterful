import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  PRODUCTION_APPROVAL_STATUSES,
  PRODUCTION_STATUSES,
} from '@/lib/production-assets'

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

const ASSET_SELECT = `
  asset_id,
  asset_group_id,
  prior_version_id,
  creator_id,
  artist_id,
  asset_type,
  title,
  description,
  source_song_id,
  source_campaign,
  file_url,
  reference_url,
  version_number,
  is_current_version,
  change_notes,
  approval_status,
  production_status,
  approved_by,
  approved_at,
  rights_notes,
  usage_notes,
  review_notes,
  created_at,
  updated_at,
  creator:profiles!production_assets_creator_id_fkey(id, full_name, username, email, role),
  artist:profiles!production_assets_artist_id_fkey(id, full_name, username, email, role),
  approver:profiles!production_assets_approved_by_fkey(id, full_name, username, email)
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

    const body = await req.json()
    const approvalStatus = typeof body.approval_status === 'string'
      ? body.approval_status.trim()
      : undefined
    const productionStatus = typeof body.production_status === 'string'
      ? body.production_status.trim()
      : undefined
    const reviewNotes = typeof body.review_notes === 'string' ? body.review_notes.trim() : undefined
    const rightsNotes = typeof body.rights_notes === 'string' ? body.rights_notes.trim() : undefined
    const usageNotes = typeof body.usage_notes === 'string' ? body.usage_notes.trim() : undefined
    const title = typeof body.title === 'string' ? body.title.trim() : undefined
    const description = typeof body.description === 'string' ? body.description.trim() : undefined
    const fileUrl = typeof body.file_url === 'string' ? body.file_url.trim() : undefined
    const referenceUrl = typeof body.reference_url === 'string' ? body.reference_url.trim() : undefined
    const sourceCampaign = typeof body.source_campaign === 'string' ? body.source_campaign.trim() : undefined
    const changeNotes = typeof body.change_notes === 'string' ? body.change_notes.trim() : undefined

    const isFounderOrAdmin = profile.role === 'founder' || profile.role === 'admin'
    const isArtist = profile.role === 'artist'

    const { data: asset, error: assetError } = await supabase
      .from('production_assets')
      .select(ASSET_SELECT)
      .eq('asset_id', id)
      .maybeSingle()

    if (assetError) {
      return NextResponse.json({ error: assetError.message }, { status: 500 })
    }
    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    const updates: Record<string, any> = {}
    const nextApprovalStatus = approvalStatus ?? asset.approval_status

    if (approvalStatus !== undefined) {
      if (!PRODUCTION_APPROVAL_STATUSES.includes(approvalStatus as any)) {
        return NextResponse.json({ error: 'Invalid approval_status' }, { status: 400 })
      }

      if (!isFounderOrAdmin) {
        if (!isArtist || asset.artist_id !== user.id) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        if (approvalStatus !== 'submitted') {
          return NextResponse.json(
            { error: 'Artists can only submit their own asset versions' },
            { status: 403 }
          )
        }
      }

      updates.approval_status = approvalStatus

      if (approvalStatus === 'approved') {
        updates.approved_by = user.id
        updates.approved_at = new Date().toISOString()
      } else {
        updates.approved_by = null
        updates.approved_at = null
      }

      if (approvalStatus === 'rejected' || approvalStatus === 'revision_needed' || reviewNotes) {
        updates.review_notes = reviewNotes || null
      }

      if (
        nextApprovalStatus !== 'approved' &&
        productionStatus === undefined &&
        asset.production_status === 'production_approved'
      ) {
        updates.production_status = 'not_ready'
      }
    }

    if (productionStatus !== undefined) {
      if (!PRODUCTION_STATUSES.includes(productionStatus as any)) {
        return NextResponse.json({ error: 'Invalid production_status' }, { status: 400 })
      }

      if (!isFounderOrAdmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      if (productionStatus === 'production_approved' && nextApprovalStatus !== 'approved') {
        return NextResponse.json(
          { error: 'Asset must be approved before production approval' },
          { status: 400 }
        )
      }

      updates.production_status = productionStatus
    }

    if (isFounderOrAdmin) {
      if (rightsNotes !== undefined) updates.rights_notes = rightsNotes || null
      if (usageNotes !== undefined) updates.usage_notes = usageNotes || null
      if (title !== undefined) updates.title = title
      if (description !== undefined) updates.description = description || null
      if (fileUrl !== undefined) updates.file_url = fileUrl || null
      if (referenceUrl !== undefined) updates.reference_url = referenceUrl || null
      if (sourceCampaign !== undefined) updates.source_campaign = sourceCampaign || null
      if (changeNotes !== undefined) updates.change_notes = changeNotes || null
    }

    if (!Object.keys(updates).length) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('production_assets')
      .update(updates)
      .eq('asset_id', id)
      .select(ASSET_SELECT)
      .single()

    if (error) {
      console.error('[production-assets:patch] Update error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, asset: data })
  } catch (err: any) {
    console.error('[production-assets:patch] Exception:', err)
    return NextResponse.json({ error: err.message || 'Failed to update asset' }, { status: 500 })
  }
}
