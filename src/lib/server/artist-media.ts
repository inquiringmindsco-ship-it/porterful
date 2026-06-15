import { createClient } from '@supabase/supabase-js'
import { resolveArtistProgressionSummary, type ArtistProgressionSummary } from '@/lib/artist-progression'
import {
  normalizeArtistVideoCategory,
  normalizeArtistVideoVisibility,
  type ArtistVideoRecord,
} from '@/lib/artist-videos'

type ArtistLookup = {
  id: string
  name: string
  slug?: string | null
  created_at?: string | null
  status?: string | null
  public_profile_enabled?: boolean | null
  verified?: boolean | null
  likeness_verified?: boolean | null
  bio?: string | null
  avatar_url?: string | null
  cover_url?: string | null
  social_links?: Record<string, any> | null
}

function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase service credentials')
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  })
}

function parseDate(value: unknown): Date | null {
  if (typeof value !== 'string' || !value.trim()) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function daysBetween(start: Date | null, end = new Date()) {
  if (!start) return 0
  const diffMs = end.getTime() - start.getTime()
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
}

function normalizeArtistName(value: string | null | undefined) {
  return (value || '').trim().toLowerCase()
}

async function loadArtistProgressionOverrides(supabase: ReturnType<typeof createServiceClient>, artistId: string) {
  const { data, error } = await supabase
    .from('artist_progressions')
    .select('artist_id, access_state, manual_level, manual_video_slot_limit, manual_featured_video_limit, manual_notes, updated_by, created_at, updated_at')
    .eq('artist_id', artistId)
    .maybeSingle()

  if (error) {
    const message = String(error.message || '').toLowerCase()
    if (message.includes('artist_progressions') || message.includes('pgrst205')) {
      console.warn('[artist-media] artist_progressions unavailable, falling back to defaults:', error.message)
      return null
    }
    throw error
  }

  return data || null
}

async function loadArtistMetrics(
  supabase: ReturnType<typeof createServiceClient>,
  artist: ArtistLookup,
  options: { visibleVideoCount?: number; featuredVideoCount?: number } = {},
) {
  const createdAt = parseDate(artist.created_at)

  const countQuery = async (promise: any, label: string) => {
    const result = await promise
    if (result.error) {
      console.warn(`[artist-media] ${label} unavailable, falling back to 0:`, result.error.message)
      return 0
    }
    return result.count || 0
  }

  const [publishedTracks, totalPlays, totalSalesPurchases, totalSalesOrderItems] = await Promise.all([
    countQuery(
      supabase
        .from('tracks')
        .select('id', { count: 'exact', head: true })
        .eq('artist_id', artist.id)
        .eq('is_active', true),
      'tracks',
    ),
    countQuery(
      supabase
        .from('plays')
        .select('id', { count: 'exact', head: true })
        .eq('artist_id', artist.id),
      'plays',
    ),
    countQuery(
      supabase
        .from('music_purchases')
        .select('id', { count: 'exact', head: true })
        .ilike('artist_name', artist.name),
      'music_purchases',
    ),
    countQuery(
      supabase
        .from('order_items')
        .select('id', { count: 'exact', head: true })
        .eq('artist_id', artist.id),
      'order_items',
    ),
  ])

  return {
    accountAgeDays: daysBetween(createdAt),
    profileComplete: Boolean(artist.bio?.trim() && artist.avatar_url?.trim() && artist.public_profile_enabled === true),
    publishedTracks,
    totalPlays,
    totalSales: totalSalesPurchases + totalSalesOrderItems,
    verified: Boolean(artist.verified || artist.likeness_verified),
    founderApproved: artist.status === 'active' || artist.public_profile_enabled === true,
    visibleVideos: options.visibleVideoCount || 0,
    featuredVideos: options.featuredVideoCount || 0,
  }
}

export async function loadArtistMediaBundleFromClient(
  artist: ArtistLookup,
  supabase: ReturnType<typeof createServiceClient>,
) {
  const [videosResult, overrides] = await Promise.all([
    supabase
      .from('artist_videos')
      .select('video_id, artist_id, creator_id, source_url, youtube_video_id, embed_url, title, thumbnail_url, channel_name, published_at, video_category, visibility_status, sort_order, notes, source, created_at, updated_at')
      .eq('artist_id', artist.id)
      .eq('visibility_status', 'visible')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false }),
    loadArtistProgressionOverrides(supabase, artist.id),
  ])

  if (videosResult.error) {
    console.warn('[artist-media] visible artist_videos unavailable, falling back to empty list:', videosResult.error.message)
  }

  const videos = (videosResult.data || []).map((video: any) => ({
    ...video,
    video_category: normalizeArtistVideoCategory(video.video_category),
    visibility_status: normalizeArtistVideoVisibility(video.visibility_status),
  })) as ArtistVideoRecord[]

  const metrics = await loadArtistMetrics(supabase, artist, {
    visibleVideoCount: videos.length,
    featuredVideoCount: videos.filter(
      (video) =>
        normalizeArtistVideoVisibility(video.visibility_status) === 'visible' &&
        normalizeArtistVideoCategory(video.video_category) === 'featured',
    ).length,
  })

  const progression: ArtistProgressionSummary = resolveArtistProgressionSummary({
    artistId: artist.id,
    artistName: artist.name,
    metrics,
    overrides,
  })

  return {
    videos,
    progression,
  }
}

export async function loadArtistMediaBundle(artist: ArtistLookup) {
  const supabase = createServiceClient()
  return loadArtistMediaBundleFromClient(artist, supabase)
}
