import { ARTISTS, type ArtistData } from './artists'

export const PUBLIC_ARTIST_STATUSES = ['active', 'approved'] as const

export interface PublicArtistVisibility {
  public_profile_enabled?: boolean | null
  status?: string | null
}

export function isPublicArtistVisible(artist?: PublicArtistVisibility | null): boolean {
  if (!artist) return false

  const status = String(artist.status || '').toLowerCase()
  return artist.public_profile_enabled === true && PUBLIC_ARTIST_STATUSES.includes(status as (typeof PUBLIC_ARTIST_STATUSES)[number])
}

export function filterPublicArtists(artists: any[] | null | undefined): any[] {
  return (artists || []).filter(isPublicArtistVisible)
}

export function getStaticPublicArtistFallbacks(): ArtistData[] {
  return ARTISTS.filter((artist) => Boolean(artist.trackCount && artist.trackCount > 0))
}
