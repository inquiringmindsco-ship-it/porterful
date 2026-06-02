import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  isProductionAssetType,
  PRODUCTION_APPROVAL_STATUSES,
  PRODUCTION_ASSET_TYPES,
  PRODUCTION_STATUSES,
  normalizeProductionAssetType,
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

function isFounderOrAdmin(role?: string | null) {
  return role === 'founder' || role === 'admin'
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

// GET /api/production-assets — list assets with optional filters
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
    const approvalStatus = searchParams.get('approval_status') || searchParams.get('status')
    const productionStatus = searchParams.get('production_status')
    const assetType = searchParams.get('asset_type') || searchParams.get('type')
    const artistId = searchParams.get('artist_id')
    const creatorId = searchParams.get('creator_id')
    const currentOnly = searchParams.get('current_only')

    let query = supabase
      .from('production_assets')
      .select(ASSET_SELECT)

    if (!isFounderOrAdmin(profile.role)) {
      query = query.eq('artist_id', user.id)
    } else {
      if (artistId) query = query.eq('artist_id', artistId)
      if (creatorId) query = query.eq('creator_id', creatorId)
    }

    if (approvalStatus && PRODUCTION_APPROVAL_STATUSES.includes(approvalStatus as any)) {
      query = query.eq('approval_status', approvalStatus)
    }

    if (productionStatus && PRODUCTION_STATUSES.includes(productionStatus as any)) {
      query = query.eq('production_status', productionStatus)
    }

    if (assetType && isProductionAssetType(assetType)) {
      query = query.eq('asset_type', normalizeProductionAssetType(assetType))
    }

    if (currentOnly === 'true' || currentOnly === '1') {
      query = query.eq('is_current_version', true)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('[production-assets:get] Query error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      assets: data || [],
      count: (data || []).length,
    })
  } catch (err: any) {
    console.error('[production-assets:get] Exception:', err)
    return NextResponse.json({ error: err.message || 'Failed to fetch assets' }, { status: 500 })
  }
}

// POST /api/production-assets — submit a new asset version
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

    if (!['artist', 'admin', 'founder'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const normalizedAssetType = normalizeProductionAssetType(body.asset_type)
    const title = typeof body.title === 'string' ? body.title.trim() : ''
    const description = typeof body.description === 'string' ? body.description.trim() : null
    const sourceSongId = typeof body.source_song_id === 'string' && body.source_song_id.trim()
      ? body.source_song_id.trim()
      : null
    const sourceCampaign = typeof body.source_campaign === 'string' ? body.source_campaign.trim() : null
    const fileUrl = typeof body.file_url === 'string' ? body.file_url.trim() : null
    const referenceUrl = typeof body.reference_url === 'string' ? body.reference_url.trim() : null
    const rightsNotes = typeof body.rights_notes === 'string' ? body.rights_notes.trim() : null
    const usageNotes = typeof body.usage_notes === 'string' ? body.usage_notes.trim() : null
    const changeNotes = typeof body.change_notes === 'string' ? body.change_notes.trim() : null
    const priorVersionId = typeof body.prior_version_id === 'string' && body.prior_version_id.trim()
      ? body.prior_version_id.trim()
      : null
    const providedArtistId = typeof body.artist_id === 'string' && body.artist_id.trim()
      ? body.artist_id.trim()
      : null

    if (!normalizedAssetType) {
      return NextResponse.json(
        {
          error: `asset_type must be one of: ${PRODUCTION_ASSET_TYPES.join(', ')}`,
        },
        { status: 400 }
      )
    }

    if (!title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 })
    }

    if (!fileUrl && !referenceUrl) {
      return NextResponse.json(
        { error: 'file_url or reference_url is required' },
        { status: 400 }
      )
    }

    let artistId: string | null = null
    if (profile.role === 'artist') {
      artistId = user.id
    } else {
      artistId = providedArtistId || null
    }

    let assetGroupId: string | null = null
    let versionNumber = 1
    let priorVersionResolved: string | null = null

    if (priorVersionId) {
      const { data: priorAsset, error: priorError } = await supabase
        .from('production_assets')
        .select('asset_id, asset_group_id, version_number, artist_id, creator_id')
        .eq('asset_id', priorVersionId)
        .maybeSingle()

      if (priorError) {
        return NextResponse.json({ error: priorError.message }, { status: 500 })
      }

      if (!priorAsset) {
        return NextResponse.json({ error: 'Prior version not found' }, { status: 404 })
      }

      if (!isFounderOrAdmin(profile.role) && priorAsset.artist_id !== user.id) {
        return NextResponse.json({ error: 'You can only version your own assets' }, { status: 403 })
      }

      assetGroupId = priorAsset.asset_group_id
      versionNumber = (priorAsset.version_number || 1) + 1
      priorVersionResolved = priorAsset.asset_id
      if (!artistId) {
        artistId = priorAsset.artist_id || user.id
      }
    }

    const insertPayload: Record<string, any> = {
      asset_group_id: assetGroupId || undefined,
      prior_version_id: priorVersionResolved,
      creator_id: user.id,
      artist_id: artistId,
      asset_type: normalizedAssetType,
      title,
      description,
      source_song_id: sourceSongId,
      source_campaign: sourceCampaign,
      file_url: fileUrl,
      reference_url: referenceUrl,
      version_number: versionNumber,
      is_current_version: true,
      change_notes: changeNotes,
      approval_status: 'submitted',
      production_status: 'not_ready',
      rights_notes: rightsNotes,
      usage_notes: usageNotes,
    }

    if (!insertPayload.asset_group_id) {
      delete insertPayload.asset_group_id
    }
    if (!insertPayload.artist_id) {
      delete insertPayload.artist_id
    }

    const { data, error } = await supabase
      .from('production_assets')
      .insert(insertPayload)
      .select(ASSET_SELECT)
      .single()

    if (error) {
      console.error('[production-assets:post] Insert error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const warnings: string[] = []

    if (priorVersionResolved) {
      const { error: priorUpdateError } = await supabase
        .from('production_assets')
        .update({ is_current_version: false })
        .eq('asset_id', priorVersionResolved)

      if (priorUpdateError) {
        console.warn('[production-assets:post] Prior version update warning:', priorUpdateError.message)
        warnings.push('New version created, but previous version could not be marked inactive')
      }
    }

    return NextResponse.json(
      {
        success: true,
        asset: data,
        warnings,
      },
      { status: 201 }
    )
  } catch (err: any) {
    console.error('[production-assets:post] Exception:', err)
    return NextResponse.json({ error: err.message || 'Failed to create asset' }, { status: 500 })
  }
}
