export type ArtistProgressionAccessState = 'auto' | 'granted' | 'revoked'

export type ArtistProgressionMetrics = {
  accountAgeDays: number
  profileComplete: boolean
  publishedTracks: number
  totalPlays: number
  totalSales: number
  verified: boolean
  founderApproved: boolean
  visibleVideos: number
  featuredVideos: number
}

export type ArtistProgressionLevel = 1 | 2 | 3 | 4

export type ArtistProgressionLimits = {
  videoSlotLimit: number | null
  featuredVideoLimit: number | null
}

export type ArtistProgressionSummary = {
  artist_id: string
  artist_name: string
  access_state: ArtistProgressionAccessState
  level: ArtistProgressionLevel | 0
  level_label: string
  level_title: string
  effective_limits: ArtistProgressionLimits
  manual_level: ArtistProgressionLevel | null
  manual_video_slot_limit: number | null
  manual_featured_video_limit: number | null
  manual_notes: string | null
  unlocked_capabilities: string[]
  next_unlocks: string[]
  next_required_step: string
  metrics: ArtistProgressionMetrics
  can_upload_videos: boolean
  can_feature_video: boolean
  is_manual_override: boolean
}

export type ArtistProgressionOverrides = {
  access_state?: ArtistProgressionAccessState
  manual_level?: ArtistProgressionLevel | null
  manual_video_slot_limit?: number | null
  manual_featured_video_limit?: number | null
  manual_notes?: string | null
}

type ProgressionConfig = {
  level: ArtistProgressionLevel
  title: string
  capabilities: string[]
  videoSlotLimit: number | null
  featuredVideoLimit: number | null
  nextRequiredStep: string
  nextUnlocks: string[]
}

export const ARTIST_PROGRESSION_CONFIG: Record<ArtistProgressionLevel, ProgressionConfig> = {
  1: {
    level: 1,
    title: 'Starter',
    capabilities: ['Basic profile', 'Music uploads'],
    videoSlotLimit: 3,
    featuredVideoLimit: 1,
    nextRequiredStep: 'Complete your profile, publish music, and build real activity.',
    nextUnlocks: ['6 video slots', 'Custom theme', 'Featured releases'],
  },
  2: {
    level: 2,
    title: 'Momentum',
    capabilities: ['Custom theme', 'Featured releases'],
    videoSlotLimit: 6,
    featuredVideoLimit: 1,
    nextRequiredStep: 'Keep publishing music and grow plays to unlock advanced controls.',
    nextUnlocks: ['10 video slots', 'Advanced customization', 'Featured playlists'],
  },
  3: {
    level: 3,
    title: 'Signature',
    capabilities: ['Advanced customization', 'Featured playlists'],
    videoSlotLimit: 10,
    featuredVideoLimit: 2,
    nextRequiredStep: 'Sustain real plays and sales to unlock premium media access.',
    nextUnlocks: ['Unlimited media', 'Premium profile controls', 'Advanced storefront options'],
  },
  4: {
    level: 4,
    title: 'Premium',
    capabilities: ['Unlimited media', 'Premium profile controls', 'Advanced storefront options'],
    videoSlotLimit: null,
    featuredVideoLimit: 3,
    nextRequiredStep: 'Premium access is fully unlocked. Founder overrides can still tune limits.',
    nextUnlocks: ['Founder-managed overrides', 'Expanded support lanes', 'Future profile modules'],
  },
}

function normalizePositiveLimit(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.trunc(value))
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number.parseInt(value, 10)
    if (Number.isFinite(parsed)) return Math.max(0, parsed)
  }
  return null
}

function clampLevel(value: unknown): ArtistProgressionLevel {
  const parsed = typeof value === 'number' ? value : Number.parseInt(String(value || ''), 10)
  if (parsed >= 4) return 4
  if (parsed === 3) return 3
  if (parsed === 2) return 2
  return 1
}

export function computeArtistProgressionLevel(metrics: ArtistProgressionMetrics): ArtistProgressionLevel {
  if (
    metrics.accountAgeDays >= 90 &&
    metrics.publishedTracks >= 5 &&
    metrics.totalPlays >= 5000 &&
    metrics.totalSales >= 5 &&
    metrics.founderApproved
  ) {
    return 4
  }

  if (
    metrics.accountAgeDays >= 30 &&
    metrics.publishedTracks >= 3 &&
    metrics.totalPlays >= 1000 &&
    metrics.totalSales >= 1 &&
    (metrics.verified || metrics.founderApproved)
  ) {
    return 3
  }

  if (
    metrics.accountAgeDays >= 7 &&
    metrics.profileComplete &&
    metrics.publishedTracks >= 1 &&
    metrics.totalPlays >= 100
  ) {
    return 2
  }

  return 1
}

export function resolveArtistProgressionSummary(input: {
  artistId: string
  artistName: string
  metrics: ArtistProgressionMetrics
  overrides?: ArtistProgressionOverrides | null
}): ArtistProgressionSummary {
  const autoLevel = computeArtistProgressionLevel(input.metrics)
  const override = input.overrides || {}
  const manualLevel = override.manual_level ? clampLevel(override.manual_level) : null
  const accessState: ArtistProgressionAccessState = override.access_state || 'auto'
  const effectiveLevel = accessState === 'revoked'
    ? 0
    : manualLevel || autoLevel

  const baseConfig = effectiveLevel > 0 ? ARTIST_PROGRESSION_CONFIG[effectiveLevel as ArtistProgressionLevel] : null
  const manualVideoSlotLimit = normalizePositiveLimit(override.manual_video_slot_limit)
  const manualFeaturedVideoLimit = normalizePositiveLimit(override.manual_featured_video_limit)

  const effectiveLimits: ArtistProgressionLimits = {
    videoSlotLimit:
      accessState === 'revoked'
        ? 0
        : manualVideoSlotLimit ?? baseConfig?.videoSlotLimit ?? ARTIST_PROGRESSION_CONFIG[1].videoSlotLimit,
    featuredVideoLimit:
      accessState === 'revoked'
        ? 0
        : manualFeaturedVideoLimit ?? baseConfig?.featuredVideoLimit ?? ARTIST_PROGRESSION_CONFIG[1].featuredVideoLimit,
  }

  const unlockedCapacities = effectiveLevel > 0
    ? ARTIST_PROGRESSION_CONFIG[effectiveLevel].capabilities
    : []

  const nextUnlocks = effectiveLevel >= 4
    ? ARTIST_PROGRESSION_CONFIG[4].nextUnlocks
    : ARTIST_PROGRESSION_CONFIG[(Math.min(4, Math.max(1, effectiveLevel + 1)) as ArtistProgressionLevel)].nextUnlocks

  const nextRequiredStep = accessState === 'revoked'
    ? 'Access is paused. Founder approval is required to re-enable video imports.'
    : baseConfig?.nextRequiredStep || ARTIST_PROGRESSION_CONFIG[1].nextRequiredStep

  return {
    artist_id: input.artistId,
    artist_name: input.artistName,
    access_state: accessState,
    level: effectiveLevel as ArtistProgressionLevel | 0,
    level_label: effectiveLevel > 0 ? `Level ${effectiveLevel}` : 'Blocked',
    level_title: effectiveLevel > 0 ? ARTIST_PROGRESSION_CONFIG[effectiveLevel as ArtistProgressionLevel].title : 'Revoked',
    effective_limits: effectiveLimits,
    manual_level: manualLevel,
    manual_video_slot_limit: manualVideoSlotLimit,
    manual_featured_video_limit: manualFeaturedVideoLimit,
    manual_notes: override.manual_notes || null,
    unlocked_capabilities: unlockedCapacities,
    next_unlocks: nextUnlocks,
    next_required_step: nextRequiredStep,
    metrics: input.metrics,
    can_upload_videos:
      accessState !== 'revoked' &&
      (effectiveLimits.videoSlotLimit === null || input.metrics.visibleVideos < effectiveLimits.videoSlotLimit),
    can_feature_video:
      accessState !== 'revoked' &&
      (effectiveLimits.featuredVideoLimit === null || input.metrics.featuredVideos < effectiveLimits.featuredVideoLimit),
    is_manual_override: accessState !== 'auto' || manualLevel !== null || manualVideoSlotLimit !== null || manualFeaturedVideoLimit !== null,
  }
}
