export const ARTIST_VIDEO_CATEGORIES = [
  'featured',
  'music_video',
  'interview',
  'live_performance',
] as const

export type ArtistVideoCategory = (typeof ARTIST_VIDEO_CATEGORIES)[number]

export const ARTIST_VIDEO_CATEGORY_LABELS: Record<ArtistVideoCategory, string> = {
  featured: 'Featured Videos',
  music_video: 'Music Videos',
  interview: 'Interviews',
  live_performance: 'Live Performances',
}

export const ARTIST_VIDEO_CATEGORY_ORDER: ArtistVideoCategory[] = [
  'featured',
  'music_video',
  'interview',
  'live_performance',
]

export type ArtistVideoVisibility = 'visible' | 'hidden' | 'archived'

export interface ArtistVideoRecord {
  video_id: string
  artist_id: string
  creator_id: string | null
  source_url: string
  youtube_video_id: string
  embed_url: string
  title: string
  thumbnail_url: string
  channel_name: string | null
  published_at: string | null
  video_category: ArtistVideoCategory
  visibility_status: ArtistVideoVisibility
  sort_order: number
  notes: string | null
  source: string
  created_at: string
  updated_at: string
}

export interface ArtistVideoGroup {
  category: ArtistVideoCategory
  label: string
  videos: ArtistVideoRecord[]
}

export function isArtistVideoCategory(value: unknown): value is ArtistVideoCategory {
  return typeof value === 'string' && ARTIST_VIDEO_CATEGORIES.includes(value as ArtistVideoCategory)
}

export function normalizeArtistVideoCategory(value: unknown): ArtistVideoCategory {
  if (typeof value !== 'string') return 'music_video'
  const normalized = value.trim().toLowerCase().replace(/[\s-]+/g, '_')
  if (isArtistVideoCategory(normalized)) return normalized
  if (normalized === 'featured_video') return 'featured'
  return 'music_video'
}

export function normalizeArtistVideoVisibility(value: unknown): ArtistVideoVisibility {
  if (typeof value !== 'string') return 'visible'
  const normalized = value.trim().toLowerCase()
  if (normalized === 'hidden' || normalized === 'archived') return normalized
  return 'visible'
}

export function groupArtistVideosByCategory(videos: ArtistVideoRecord[]) {
  const map = new Map<ArtistVideoCategory, ArtistVideoRecord[]>()
  ARTIST_VIDEO_CATEGORY_ORDER.forEach((category) => map.set(category, []))

  for (const video of videos) {
    const category = normalizeArtistVideoCategory(video.video_category)
    const list = map.get(category) || []
    list.push(video)
    map.set(category, list)
  }

  return ARTIST_VIDEO_CATEGORY_ORDER
    .map((category) => ({
      category,
      label: ARTIST_VIDEO_CATEGORY_LABELS[category],
      videos: (map.get(category) || []).slice().sort((a, b) => {
        const aTime = new Date(a.published_at || a.created_at).getTime()
        const bTime = new Date(b.published_at || b.created_at).getTime()
        return bTime - aTime
      }),
    }))
    .filter((group) => group.videos.length > 0)
}

export function countVisibleArtistVideos(videos: ArtistVideoRecord[]) {
  return videos.filter((video) => video.visibility_status === 'visible').length
}

export function countVisibleFeaturedVideos(videos: ArtistVideoRecord[]) {
  return videos.filter(
    (video) =>
      video.visibility_status === 'visible' &&
      normalizeArtistVideoCategory(video.video_category) === 'featured',
  ).length
}
