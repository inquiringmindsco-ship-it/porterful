// Artist data - in production this would come from Supabase
import { TRACKS } from './data'

export interface ArtistData {
  id: string
  name: string
  slug: string
  genre: string
  location: string
  bio: string
  shortBio: string
  verified: boolean
  image: string
  coverGradient: string
  followers: number
  supporters: number | null
  earnings: number | null
  products: number
  trackCount?: number
  social?: {
    instagram?: string
    twitter?: string
    tiktok?: string
    youtube?: string
  }
}

// Array of artists for listing pages
export const ARTISTS: ArtistData[] = [
  {
    id: 'od-porter',
    name: 'O D Porter',
    slug: 'od-porter',
    genre: 'Hip-Hop, R&B, Soul',
    location: 'St. Louis, MO',
    bio: `Independent artist and founder of Porterful. Born in Miami, raised between New Orleans and St. Louis — most known from the STL.`,
    shortBio: 'Independent artist and founder of Porterful. Born in Miami, raised in New Orleans & St. Louis.',
    verified: true,
    image: '/artist-art/od-porter.jpg',
    coverGradient: 'from-[var(--pf-orange)] to-purple-600',
    followers: 2847,
    supporters: null,
    earnings: null,
    products: 12,
    trackCount: TRACKS.filter(t => t.artist === 'O D Porter').length,
    social: {
      instagram: 'odporter',
      twitter: 'odporter',
      youtube: '@odporter',
    },
  },
]

// Get artist by ID, returns undefined if not found
export function getArtistById(id: string): ArtistData | undefined {
  return ARTISTS.find(a => a.id === id || a.slug === id)
}

// Get all artist IDs for routing
export function getAllArtistIds(): string[] {
  return ARTISTS.map(a => a.id)
}

// Get tracks for a specific artist
export function getArtistTracks(artistId: string): typeof TRACKS {
  const artist = getArtistById(artistId)
  if (!artist) return []
  return TRACKS.filter(t => t.artist === artist.name || t.artist === artist.id)
}

// Get products for a specific artist (placeholder - would be from DB)
export function getArtistProducts(artistId: string): number {
  const artist = getArtistById(artistId)
  return artist?.products || 0
}
