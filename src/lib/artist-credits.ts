import { ARTISTS, getArtistSlugByName } from '@/lib/artists'

export type ArtistCreditRole = 'primary' | 'featured' | 'producer' | 'writer' | 'engineer' | 'collaborator'

export interface ArtistCredit {
  id?: string | null
  name: string
  image?: string | null
  href?: string | null
  role?: ArtistCreditRole
  isPrimary?: boolean
}

type TrackLike = Record<string, any> | null | undefined

function firstNonEmpty(...values: Array<string | null | undefined>) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

function normalizeRole(value: unknown, fallback: ArtistCreditRole = 'collaborator'): ArtistCreditRole {
  const role = typeof value === 'string' ? value.trim().toLowerCase() : ''
  if (role === 'primary' || role === 'featured' || role === 'producer' || role === 'writer' || role === 'engineer') {
    return role
  }
  return fallback
}

function normalizeArtistName(value: unknown): string {
  if (typeof value === 'string') return value.trim()
  return ''
}

function buildArtistHref(name?: string | null, artistId?: string | null) {
  if (artistId) {
    const staticArtist = ARTISTS.find((artist) => artist.id === artistId || artist.slug === artistId)
    if (staticArtist?.slug) {
      return `/artist/${staticArtist.slug}`
    }
  }

  const slug = getArtistSlugByName(name)
  return slug ? `/artist/${slug}` : null
}

export function resolveArtistAvatarSource(name?: string | null, artistId?: string | null): string | null {
  const normalizedName = name?.trim().toLowerCase() || ''
  const normalizedId = artistId?.trim().toLowerCase() || ''

  const match = ARTISTS.find((artist) => {
    const artistName = artist.name.trim().toLowerCase()
    const artistSlug = artist.slug.trim().toLowerCase()
    const artistIdValue = artist.id.trim().toLowerCase()

    return (
      (normalizedName && artistName === normalizedName) ||
      (normalizedName && artistSlug === normalizedName) ||
      (normalizedName && artistIdValue === normalizedName) ||
      (normalizedId && artistSlug === normalizedId) ||
      (normalizedId && artistIdValue === normalizedId)
    )
  })

  return match?.image || null
}

function normalizeCreditEntry(entry: any, fallbackRole: ArtistCreditRole = 'collaborator'): ArtistCredit | null {
  if (!entry) return null

  if (typeof entry === 'string') {
    const name = entry.trim()
    if (!name) return null
    return {
      name,
      role: fallbackRole,
      href: buildArtistHref(name, null),
      isPrimary: fallbackRole === 'primary',
    }
  }

  if (typeof entry !== 'object') return null

  const name = firstNonEmpty(
    entry.name,
    entry.artist_name,
    entry.artist,
    entry.full_name,
    entry.display_name,
  )

  if (!name) return null

  const id = firstNonEmpty(entry.id, entry.artist_id, entry.user_id)
  const role = normalizeRole(entry.role || entry.credit_role || entry.type, fallbackRole)
  const image = firstNonEmpty(
    entry.image,
    entry.avatar_url,
    entry.avatar,
    entry.profile_image_url,
    entry.picture,
  ) || resolveArtistAvatarSource(name, id) || null

  return {
    id: id || null,
    name,
    image,
    href: buildArtistHref(name, id || null),
    role,
    isPrimary: role === 'primary',
  }
}

function dedupeCredits(credits: ArtistCredit[]) {
  const seen = new Set<string>()
  return credits.filter((credit) => {
    const key = (credit.id || credit.name).trim().toLowerCase()
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function parseExplicitFeatureCredits(trackArtist: string): { primary: string; featured: string[] } | null {
  const featureMatch = trackArtist.match(/\b(?:feat(?:\.|uring)?|ft\.?)\b/i)
  if (!featureMatch || typeof featureMatch.index !== 'number') return null

  const primary = trackArtist
    .slice(0, featureMatch.index)
    .replace(/[\s,–—:-]+$/g, '')
    .trim()

  const featuredText = trackArtist
    .slice(featureMatch.index + featureMatch[0].length)
    .replace(/^[\s:,-]+/g, '')
    .trim()

  if (!featuredText) {
    return primary ? { primary, featured: [] } : null
  }

  const featured = featuredText
    .split(/\s*(?:,|&|\+| and | x )\s*/i)
    .map((value) => value.trim())
    .filter(Boolean)

  return {
    primary: primary || trackArtist.trim(),
    featured,
  }
}

export function buildTrackArtistCredits(track: TrackLike): ArtistCredit[] {
  if (!track) return []

  const credits: ArtistCredit[] = []
  const artistId = firstNonEmpty(track.artist_id, track.primary_artist_id, track.primaryArtist?.id)
  const primaryName = firstNonEmpty(
    track.primary_artist_name,
    track.primaryArtist?.name,
    track.artist_name,
    track.artist,
  )
  const explicitFeatureCredits = typeof track.artist === 'string'
    ? parseExplicitFeatureCredits(track.artist.trim())
    : null

  if (primaryName) {
    credits.push({
      id: artistId || null,
      name: primaryName,
      image: firstNonEmpty(
        track.artist_image,
        track.artist_avatar_url,
        track.primary_artist?.image,
      ) || resolveArtistAvatarSource(primaryName, artistId || null),
      href: buildArtistHref(primaryName, artistId || null),
      role: 'primary',
      isPrimary: true,
    })
  }

  const creditSources: Array<{ value: any; fallbackRole: ArtistCreditRole }> = [
    { value: track.featured_artists, fallbackRole: 'featured' },
    { value: track.featuredArtists, fallbackRole: 'featured' },
    { value: track.collaborators, fallbackRole: 'collaborator' },
    { value: track.artist_credits, fallbackRole: 'collaborator' },
    { value: track.track_credits, fallbackRole: 'collaborator' },
    { value: track.credits, fallbackRole: 'collaborator' },
  ]

  if (track.collaboration?.collaborators) {
    creditSources.push({ value: track.collaboration.collaborators, fallbackRole: 'collaborator' })
  }

  for (const source of creditSources) {
    if (!Array.isArray(source.value)) continue
    for (const entry of source.value) {
      const normalized = normalizeCreditEntry(entry, source.fallbackRole)
      if (normalized) credits.push(normalized)
    }
  }

  if (explicitFeatureCredits && ![
    track.featured_artists,
    track.featuredArtists,
    track.collaborators,
    track.artist_credits,
    track.track_credits,
    track.credits,
    track.collaboration?.collaborators,
  ].some((value) => Array.isArray(value) && value.length > 0)) {
    if (credits.length > 0 && credits[0]?.name === track.artist?.trim() && explicitFeatureCredits.primary) {
      credits[0] = {
        ...credits[0],
        name: explicitFeatureCredits.primary,
        href: buildArtistHref(explicitFeatureCredits.primary, artistId || null),
        image: credits[0].image || resolveArtistAvatarSource(explicitFeatureCredits.primary, artistId || null),
      }
    } else if (credits.length === 0 && explicitFeatureCredits.primary) {
      credits.push({
        id: artistId || null,
        name: explicitFeatureCredits.primary,
        image: resolveArtistAvatarSource(explicitFeatureCredits.primary, artistId || null),
        href: buildArtistHref(explicitFeatureCredits.primary, artistId || null),
        role: 'primary',
        isPrimary: true,
      })
    }

    explicitFeatureCredits.featured.forEach((name) => {
      credits.push({
        name,
        image: resolveArtistAvatarSource(name, null),
        href: buildArtistHref(name, null),
        role: 'featured',
      })
    })
  }

  return dedupeCredits(credits)
}

export function summarizeArtistCredits(credits: ArtistCredit[]) {
  return credits.map((credit) => credit.name).join(' · ')
}
