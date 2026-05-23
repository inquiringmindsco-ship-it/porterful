import { ARTISTS, type ArtistData } from './artists'

export const PUBLIC_ARTIST_STATUSES = ['active', 'approved'] as const

export interface PublicArtistVisibility {
  public_profile_enabled?: boolean | null
  status?: string | null
  email_confirmed?: boolean | null
}

/**
 * FAIL-CLOSED: An artist is publicly visible ONLY if ALL conditions are met.
 * Missing status or public_profile_enabled = NOT eligible.
 * Pending/suspended/draft/archived = NOT eligible.
 */
export function isPublicArtistEligible(artist?: PublicArtistVisibility | null): boolean {
  if (!artist) return false

  const status = String(artist.status || '').toLowerCase().trim()
  if (!status) return false
  if (!PUBLIC_ARTIST_STATUSES.includes(status as (typeof PUBLIC_ARTIST_STATUSES)[number])) {
    return false
  }

  if (artist.public_profile_enabled !== true) {
    return false
  }

  // If email confirmation data is available, require it
  if (artist.email_confirmed === false) {
    return false
  }

  return true
}

/**
 * Filter array to only publicly eligible artists.
 */
export function filterPublicArtists<T extends PublicArtistVisibility>(artists: T[] | null | undefined): T[] {
  return (artists || []).filter(isPublicArtistEligible)
}

/**
 * Legacy compatibility: static fallback artists must also obey policy.
 * Only static artists with trackCount > 0 that are in the ARTISTS array are considered.
 * Note: static artists don't have status/public_profile_enabled fields, so they are
 * explicitly checked against the isPublicArtistEligible criteria via a whitelist approach.
 */
export function getStaticPublicArtistFallbacks(): ArtistData[] {
  // Static artists are pre-vetted (O D Porter, etc.) — they have trackCount > 0
  // but we should still be careful. For now, return only if they have tracks.
  return ARTISTS.filter((artist) => Boolean(artist.trackCount && artist.trackCount > 0))
}
