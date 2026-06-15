import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { loadArtistMediaBundle } from '@/lib/server/artist-media'
import {
  normalizeArtistVideoCategory,
  normalizeArtistVideoVisibility,
  type ArtistVideoRecord,
} from '@/lib/artist-videos'
import { resolveYouTubeVideoMetadata, parseYouTubeUrl } from '@/lib/youtube'

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

async function getArtistRow(supabase: any, artistId: string) {
  const { data, error } = await supabase
    .from('artists')
    .select('id, name, slug, created_at, status, public_profile_enabled, verified, likeness_verified, bio, avatar_url, cover_url')
    .eq('id', artistId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data || null
}

function isFounderOrAdmin(role?: string | null) {
  return role === 'founder' || role === 'admin'
}

function normalizeText(value: unknown) {
  if (typeof value !== 'string') return ''
  return value.trim()
}

function parseLimit(value: unknown, fallback = 50) {
  const parsed = typeof value === 'string' ? Number.parseInt(value, 10) : NaN
  if (Number.isFinite(parsed) && parsed > 0) return Math.min(parsed, 200)
  return fallback
}

function nextSortOrder(records: Array<{ sort_order: number | null }>) {
  const values = records
    .map((record) => Number(record.sort_order ?? 0))
    .filter((value) => Number.isFinite(value))

  return values.length > 0 ? Math.max(...values) + 1 : 0
}

async function resolveMediaContext(supabase: any, role: string, userId: string, requestedArtistId?: string | null) {
  const targetArtistId = requestedArtistId && requestedArtistId.trim()
    ? requestedArtistId.trim()
    : userId

  if (!isFounderOrAdmin(role) && targetArtistId !== userId) {
    throw new Error('Forbidden')
  }

  const artist = await getArtistRow(supabase, targetArtistId)

  if (!artist) {
    return { artist: null, progression: null, targetArtistId }
  }

  const bundle = await loadArtistMediaBundle(artist)
  return {
    artist,
    progression: bundle.progression,
    targetArtistId,
  }
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
    const requestedArtistId = searchParams.get('artist_id')
    const limit = parseLimit(searchParams.get('limit'))

    const mediaContext = await resolveMediaContext(supabase, profile.role, user.id, requestedArtistId)
    if (!mediaContext.artist) {
      return NextResponse.json({
        success: true,
        artist: null,
        videos: [],
        progression: null,
        counts: { total: 0, visible: 0, featured: 0 },
        targetArtistId: mediaContext.targetArtistId,
      })
    }

    const { data: videos, error } = await supabase
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
      .eq('artist_id', mediaContext.targetArtistId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      return NextResponse.json({ error: error.message || 'Failed to load artist videos' }, { status: 500 })
    }

    const normalizedVideos = ((videos || []) as ArtistVideoRecord[]).map((video) => ({
      ...video,
      video_category: normalizeArtistVideoCategory(video.video_category),
      visibility_status: normalizeArtistVideoVisibility(video.visibility_status),
    }))

    return NextResponse.json({
      success: true,
      artist: mediaContext.artist,
      videos: normalizedVideos,
      progression: mediaContext.progression,
      counts: {
        total: normalizedVideos.length,
        visible: normalizedVideos.filter((video) => video.visibility_status === 'visible').length,
        featured: normalizedVideos.filter((video) => video.visibility_status === 'visible' && video.video_category === 'featured').length,
      },
      targetArtistId: mediaContext.targetArtistId,
    })
  } catch (err: any) {
    if (String(err?.message || '').toLowerCase() === 'forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    console.error('[artist-videos:get] Exception:', err)
    return NextResponse.json({ error: err.message || 'Failed to load artist videos' }, { status: 500 })
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

    if (!['artist', 'admin', 'founder'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json().catch(() => ({}))
    const requestedArtistId = normalizeText(body.artist_id) || null
    const targetArtistId = isFounderOrAdmin(profile.role) ? (requestedArtistId || user.id) : user.id
    if (!isFounderOrAdmin(profile.role) && requestedArtistId && requestedArtistId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const mediaContext = await resolveMediaContext(supabase, profile.role, user.id, targetArtistId)
    if (!mediaContext.artist) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 })
    }

    if (!mediaContext.progression?.can_upload_videos) {
      return NextResponse.json(
        { error: 'This artist has reached the current video slot limit.' },
        { status: 400 },
      )
    }

    const category = normalizeArtistVideoCategory(body.video_category || body.category)
    if (category === 'featured' && !mediaContext.progression.can_feature_video) {
      return NextResponse.json(
        { error: 'Featured video slots are full for this artist.' },
        { status: 400 },
      )
    }

    const sourceUrl = normalizeText(body.youtube_url || body.source_url || body.url)
    if (!sourceUrl) {
      return NextResponse.json({ error: 'youtube_url is required' }, { status: 400 })
    }

    if (!parseYouTubeUrl(sourceUrl)) {
      return NextResponse.json({ error: 'Only YouTube URLs are allowed.' }, { status: 400 })
    }

    const metadata = await resolveYouTubeVideoMetadata(sourceUrl)
    const notes = normalizeText(body.notes) || null

    const { data: existingVideos, error: listError } = await supabase
      .from('artist_videos')
      .select('sort_order')
      .eq('artist_id', mediaContext.targetArtistId)
      .order('sort_order', { ascending: false })
      .limit(1)

    if (listError) {
      return NextResponse.json({ error: listError.message || 'Failed to inspect existing videos' }, { status: 500 })
    }

    const { data, error } = await supabase
      .from('artist_videos')
      .insert({
        artist_id: mediaContext.targetArtistId,
        creator_id: user.id,
        source_url: metadata.canonicalUrl,
        youtube_video_id: metadata.videoId,
        embed_url: metadata.embedUrl,
        title: metadata.title,
        thumbnail_url: metadata.thumbnailUrl,
        channel_name: metadata.channelName,
        published_at: metadata.publishedAt,
        video_category: category,
        visibility_status: 'visible',
        sort_order: nextSortOrder(existingVideos || []),
        notes,
        source: 'youtube',
      })
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
      return NextResponse.json({ error: error.message || 'Failed to create artist video' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      video: {
        ...(data as ArtistVideoRecord),
        video_category: normalizeArtistVideoCategory(data.video_category),
        visibility_status: normalizeArtistVideoVisibility(data.visibility_status),
      },
      progression: mediaContext.progression,
      targetArtistId: mediaContext.targetArtistId,
    })
  } catch (err: any) {
    console.error('[artist-videos:post] Exception:', err)
    return NextResponse.json({ error: err.message || 'Failed to create artist video' }, { status: 500 })
  }
}
