import { NextRequest, NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { loadArtistMediaBundleFromClient } from '@/lib/server/artist-media'
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
import { parseYouTubeUrl, resolveYouTubeVideoMetadata } from '@/lib/youtube'

export const dynamic = 'force-dynamic'

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

async function resolveMediaContext(
  supabase: SupabaseClient,
  role: string,
  userId: string,
  requestedArtistId?: string | null,
) {
  const targetArtistId = requestedArtistId && requestedArtistId.trim()
    ? requestedArtistId.trim()
    : userId

  if (!isFounderOrAdmin(role) && targetArtistId !== userId) {
    throw new Error('Forbidden')
  }

  const artist = await getArtistVideoArtist(supabase, targetArtistId)

  if (!artist) {
    return { artist: null, progression: null, targetArtistId }
  }

  const bundle = await loadArtistMediaBundleFromClient(artist, supabase)
  return {
    artist,
    progression: bundle.progression,
    targetArtistId,
    videos: bundle.videos,
  }
}

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url)
    const requestedArtistId = searchParams.get('artist_id')
    const limit = parseLimit(searchParams.get('limit'))

    const mediaContext = await resolveMediaContext(auth.userClient, profileRole, auth.user.id, requestedArtistId)
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

    const videos = (mediaContext.videos || []).slice(0, limit)
    return NextResponse.json({
      success: true,
      artist: mediaContext.artist,
      videos,
      progression: mediaContext.progression,
      counts: {
        total: videos.length,
        visible: videos.filter((video) => video.visibility_status === 'visible').length,
        featured: videos.filter((video) => video.visibility_status === 'visible' && video.video_category === 'featured').length,
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

    const body = await req.json().catch(() => ({}))
    const requestedArtistId = normalizeText(body.artist_id) || null
    const targetArtistId = isFounderOrAdmin(profileRole) ? (requestedArtistId || auth.user.id) : auth.user.id
    if (!isFounderOrAdmin(profileRole) && requestedArtistId && requestedArtistId !== auth.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const mediaContext = await resolveMediaContext(auth.userClient, profileRole, auth.user.id, targetArtistId)
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

    // Accept the legacy front-end field name 'youtube_url' alongside the
    // canonical 'source_url'. The dashboard media form sends 'youtube_url';
    // older callers may send 'url' or 'video_url'. We resolve the value,
    // then immediately canonicalize to the canonical YouTube watch URL via
    // the parser so downstream storage and validation are consistent.
    const sourceInput = normalizeText(
      body.source_url || body.youtube_url || body.url || body.video_url,
    )
    const parsed = parseYouTubeUrl(sourceInput)
    if (!parsed) {
      return NextResponse.json({ error: 'Only YouTube URLs are supported for artist videos.' }, { status: 400 })
    }

    const metadata = await resolveYouTubeVideoMetadata(sourceInput)
    const notes = normalizeText(body.notes)
    const { data: existingVideos, error: existingVideosError } = await auth.userClient
      .from('artist_videos')
      .select('video_id, sort_order')
      .eq('artist_id', mediaContext.targetArtistId)
      .order('sort_order', { ascending: true })

    if (existingVideosError) {
      return NextResponse.json({ error: existingVideosError.message || 'Failed to load existing videos' }, { status: 500 })
    }

    const { data, error } = await auth.userClient
      .from('artist_videos')
      .insert({
        artist_id: mediaContext.targetArtistId,
        creator_id: auth.user.id,
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
