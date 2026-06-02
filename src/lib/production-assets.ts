export const PRODUCTION_ASSET_TYPES = [
  'song',
  'album_cover',
  'artist_logo',
  'merch_design',
  'campaign_artwork',
  'photograph',
  'video_still',
  'catchphrase',
  'signature',
  'likeness_asset',
  'tour_artwork',
  'limited_edition_design',
] as const

export type ProductionAssetType = (typeof PRODUCTION_ASSET_TYPES)[number]

export const PRODUCTION_APPROVAL_STATUSES = [
  'draft',
  'submitted',
  'under_review',
  'approved',
  'rejected',
  'revision_needed',
] as const

export type ProductionApprovalStatus = (typeof PRODUCTION_APPROVAL_STATUSES)[number]

export const PRODUCTION_STATUSES = [
  'not_ready',
  'production_approved',
  'retired',
] as const

export type ProductionStatus = (typeof PRODUCTION_STATUSES)[number]

const PRODUCTION_ASSET_TYPE_LABELS: Record<ProductionAssetType, string> = {
  song: 'Song',
  album_cover: 'Album Cover',
  artist_logo: 'Artist Logo',
  merch_design: 'Merch Design',
  campaign_artwork: 'Campaign Artwork',
  photograph: 'Photograph',
  video_still: 'Video Still',
  catchphrase: 'Catchphrase',
  signature: 'Signature',
  likeness_asset: 'Likeness Asset',
  tour_artwork: 'Tour Artwork',
  limited_edition_design: 'Limited Edition Design',
}

const APPROVAL_STATUS_LABELS: Record<ProductionApprovalStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
  revision_needed: 'Revision Needed',
}

const PRODUCTION_STATUS_LABELS: Record<ProductionStatus, string> = {
  not_ready: 'Not Ready',
  production_approved: 'Production Approved',
  retired: 'Retired',
}

const ASSET_TYPE_ALIASES: Record<string, ProductionAssetType> = {
  song: 'song',
  album_cover: 'album_cover',
  albumcover: 'album_cover',
  album_art: 'album_cover',
  artist_logo: 'artist_logo',
  merch_design: 'merch_design',
  campaign_artwork: 'campaign_artwork',
  photograph: 'photograph',
  photo: 'photograph',
  video_still: 'video_still',
  still: 'video_still',
  catchphrase: 'catchphrase',
  signature: 'signature',
  likeness_asset: 'likeness_asset',
  likeness: 'likeness_asset',
  tour_artwork: 'tour_artwork',
  limited_edition_design: 'limited_edition_design',
  limitededitiondesign: 'limited_edition_design',
}

export function normalizeProductionAssetType(value: unknown): ProductionAssetType | null {
  if (typeof value !== 'string') return null

  const normalized = value.trim().toLowerCase().replace(/[\s-]+/g, '_')
  const alias = ASSET_TYPE_ALIASES[normalized]
  if (alias) return alias

  if ((PRODUCTION_ASSET_TYPES as readonly string[]).includes(normalized)) {
    return normalized as ProductionAssetType
  }

  return null
}

export function isProductionAssetType(value: unknown): value is ProductionAssetType {
  return normalizeProductionAssetType(value) !== null
}

export function formatProductionAssetType(value?: string | null): string {
  if (!value) return 'Unknown Asset'
  const normalized = normalizeProductionAssetType(value)
  const resolved = normalized ? PRODUCTION_ASSET_TYPE_LABELS[normalized] : value
  return resolved
}

export function formatProductionApprovalStatus(value?: string | null): string {
  if (!value) return 'Unknown'
  const normalized = String(value).trim().toLowerCase() as ProductionApprovalStatus
  return APPROVAL_STATUS_LABELS[normalized] || value
}

export function formatProductionStatus(value?: string | null): string {
  if (!value) return 'Unknown'
  const normalized = String(value).trim().toLowerCase() as ProductionStatus
  return PRODUCTION_STATUS_LABELS[normalized] || value
}

export function isProductionApprovalStatus(value: unknown): value is ProductionApprovalStatus {
  return typeof value === 'string' && PRODUCTION_APPROVAL_STATUSES.includes(value as ProductionApprovalStatus)
}

export function isProductionStatus(value: unknown): value is ProductionStatus {
  return typeof value === 'string' && PRODUCTION_STATUSES.includes(value as ProductionStatus)
}
