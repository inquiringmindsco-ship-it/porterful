import { NextRequest, NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  normalizeArtistVideoCategory,
  normalizeArtistVideoVisibility,
  type ArtistVideoRecord,
} from '@/lib/artist-videos'
import {
  getArtistVideoArtist,
  getArtistVideoProfile,
  getArtistVideoRequestAuth,
  isFounderOrAdmin,
} from '@/lib/artist-video-access'

export const dynamic = 'force-dynamic'

async function loadVideo(supabase: SupabaseClient, videoId: string) {
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
    const auth = await getArtistVideoRequestAuth(req)
    if (!auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await getArtistVideoProfile(auth.userClient, auth.user.id)
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const profileRole = String(profile.role || '').toLowerCase()

    if (!['artist', 'admin', 'founder'].includes(profileRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const existing = await loadVideo(auth.userClient, params.id)
    if (!existing) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    if (!isFounderOrAdmin(profileRole) && existing.artist_id !== auth.user.id) {
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

    const { data, error } = await auth.userClient
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
    const auth = await getArtistVideoRequestAuth(req)
    if (!auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await getArtistVideoProfile(auth.userClient, auth.user.id)
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const profileRole = String(profile.role || '').toLowerCase()

    if (!['artist', 'admin', 'founder'].includes(profileRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const existing = await loadVideo(auth.userClient, params.id)
    if (!existing) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    if (!isFounderOrAdmin(profileRole) && existing.artist_id !== auth.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data, error } = await auth.userClient
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
