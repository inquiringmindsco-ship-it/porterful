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
    throw error
  }

  return data || null
}

async function loadArtistMetrics(supabase: ReturnType<typeof createServiceClient>, artist: ArtistLookup) {
  const createdAt = parseDate(artist.created_at)

  const [tracksResult, playsResult, purchasesResult, orderItemsResult, videosResult] = await Promise.all([
    supabase
      .from('tracks')
      .select('id', { count: 'exact', head: true })
      .eq('artist_id', artist.id)
      .eq('is_active', true),
    supabase
      .from('plays')
      .select('id', { count: 'exact', head: true })
      .eq('artist_id', artist.id),
    supabase
      .from('music_purchases')
      .select('id', { count: 'exact', head: true })
      .ilike('artist_name', artist.name),
    supabase
      .from('order_items')
      .select('id', { count: 'exact', head: true })
      .eq('artist_id', artist.id),
    supabase
      .from('artist_videos')
      .select('video_id, video_category, visibility_status')
      .eq('artist_id', artist.id),
  ])

  if (tracksResult.error) throw tracksResult.error
  if (playsResult.error) throw playsResult.error
  if (purchasesResult.error) throw purchasesResult.error
  if (orderItemsResult.error) throw orderItemsResult.error
  if (videosResult.error) throw videosResult.error

  const visibleVideos = (videosResult.data || []).filter((video: any) => normalizeArtistVideoVisibility(video.visibility_status) === 'visible')
  const featuredVideos = visibleVideos.filter(
    (video: any) => normalizeArtistVideoCategory(video.video_category) === 'featured'
  )

  return {
    accountAgeDays: daysBetween(createdAt),
    profileComplete: Boolean(artist.bio?.trim() && artist.avatar_url?.trim() && artist.public_profile_enabled === true),
    publishedTracks: tracksResult.count || 0,
    totalPlays: playsResult.count || 0,
    totalSales: (purchasesResult.count || 0) + (orderItemsResult.count || 0),
    verified: Boolean(artist.verified || artist.likeness_verified),
    founderApproved: artist.status === 'active' || artist.public_profile_enabled === true,
    visibleVideos: visibleVideos.length,
    featuredVideos: featuredVideos.length,
  }
}

export async function loadArtistMediaBundle(artist: ArtistLookup) {
  const supabase = createServiceClient()

  const [videosResult, overrides, metrics] = await Promise.all([
    supabase
      .from('artist_videos')
      .select('video_id, artist_id, creator_id, source_url, youtube_video_id, embed_url, title, thumbnail_url, channel_name, published_at, video_category, visibility_status, sort_order, notes, source, created_at, updated_at')
      .eq('artist_id', artist.id)
      .eq('visibility_status', 'visible')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false }),
    loadArtistProgressionOverrides(supabase, artist.id),
    loadArtistMetrics(supabase, artist),
  ])

  if (videosResult.error) {
    throw videosResult.error
  }

  const videos = (videosResult.data || []).map((video: any) => ({
    ...video,
    video_category: normalizeArtistVideoCategory(video.video_category),
    visibility_status: normalizeArtistVideoVisibility(video.visibility_status),
  })) as ArtistVideoRecord[]

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
