import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  normalizeArtistVideoCategory,
  normalizeArtistVideoVisibility,
  type ArtistVideoRecord,
} from '@/lib/artist-videos'

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

async function loadVideo(supabase: any, videoId: string) {
  const { data, error } = await supabase
    .from('artist_videos')
    .select(`
      video_id,
      artist_id,
      creator_id,
      source_url,
      youtube_video_id,
      embed_url,
      title,
      thumbnail_url,
      channel_name,
      published_at,
      video_category,
      visibility_status,
      sort_order,
      notes,
      source,
      created_at,
      updated_at
    `)
    .eq('video_id', videoId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data || null
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
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

    const existing = await loadVideo(supabase, params.id)
    if (!existing) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    if (!isFounderOrAdmin(profile.role) && existing.artist_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json().catch(() => ({}))
    const visibility = typeof body.visibility_status === 'string'
      ? normalizeArtistVideoVisibility(body.visibility_status)
      : undefined
    const category = typeof body.video_category === 'string'
      ? normalizeArtistVideoCategory(body.video_category)
      : undefined
    const notes = typeof body.notes === 'string' ? body.notes.trim() : undefined
    const sortOrder = typeof body.sort_order === 'number'
      ? Math.trunc(body.sort_order)
      : typeof body.sort_order === 'string'
        ? Number.parseInt(body.sort_order, 10)
        : undefined

    const updatePayload: Record<string, any> = {}
    if (visibility) updatePayload.visibility_status = visibility
    if (category) updatePayload.video_category = category
    if (notes !== undefined) updatePayload.notes = notes || null
    if (typeof sortOrder === 'number' && Number.isFinite(sortOrder)) {
      updatePayload.sort_order = sortOrder
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('artist_videos')
      .update(updatePayload)
      .eq('video_id', params.id)
      .select(`
        video_id,
        artist_id,
        creator_id,
        source_url,
        youtube_video_id,
        embed_url,
        title,
        thumbnail_url,
        channel_name,
        published_at,
        video_category,
        visibility_status,
        sort_order,
        notes,
        source,
        created_at,
        updated_at
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message || 'Failed to update video' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      video: {
        ...(data as ArtistVideoRecord),
        video_category: normalizeArtistVideoCategory(data.video_category),
        visibility_status: normalizeArtistVideoVisibility(data.visibility_status),
      },
    })
  } catch (err: any) {
    console.error('[artist-videos:patch] Exception:', err)
    return NextResponse.json({ error: err.message || 'Failed to update video' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
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

    const existing = await loadVideo(supabase, params.id)
    if (!existing) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    if (!isFounderOrAdmin(profile.role) && existing.artist_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('artist_videos')
      .update({ visibility_status: 'archived' })
      .eq('video_id', params.id)
      .select(`
        video_id,
        artist_id,
        creator_id,
        source_url,
        youtube_video_id,
        embed_url,
        title,
        thumbnail_url,
        channel_name,
        published_at,
        video_category,
        visibility_status,
        sort_order,
        notes,
        source,
        created_at,
        updated_at
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message || 'Failed to archive video' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      video: {
        ...(data as ArtistVideoRecord),
        video_category: normalizeArtistVideoCategory(data.video_category),
        visibility_status: normalizeArtistVideoVisibility(data.visibility_status),
      },
    })
  } catch (err: any) {
    console.error('[artist-videos:delete] Exception:', err)
    return NextResponse.json({ error: err.message || 'Failed to archive video' }, { status: 500 })
  }
}
