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
    website?: string
  }
  coverSlides?: Array<{
    src: string
    alt: string
    isVideo?: boolean
  }>
  videos?: Array<{
    youtubeId: string
    title: string
    album?: string
  }>
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
      instagram: 'od.porter',
      twitter: 'odporter',
      youtube: '@odporter',
      tiktok: 'odporter',
    },
    coverSlides: [
      { src: '/artists/od-porter/tlf-cover.png', alt: 'O D Porter - TLF' },
      { src: '/artist-art/od-porter.jpg', alt: 'O D Porter' },
    ],
  },
  {
    id: 'gune',
    name: 'Gune',
    slug: 'gune',
    genre: 'Hip-Hop, R&B',
    location: 'St. Louis, MO',
    bio: `St. Louis rapper with a raw sound. Bringing authentic hip-hop and R&B to Porterful.`,
    shortBio: 'St. Louis rapper bringing authentic hip-hop.',
    verified: true,
    image: '/artists/gune/ISIMG-1050533.JPG',
    coverGradient: 'from-red-600 to-orange-600',
    followers: 0,
    supporters: null,
    earnings: null,
    products: 0,
    trackCount: 3,
    social: {
      instagram: 'gunebugtheplug',
    },
    coverSlides: [
      { src: '/artists/gune/ISIMG-1050533.JPG', alt: 'Gune' },
      { src: '/artists/gune/EL8A6131.JPG', alt: 'Gune' },
    ],
  },
  {
    id: 'nikee-turbo',
    name: 'Nikee Turbo',
    slug: 'nikee-turbo',
    genre: 'Hip-Hop',
    location: 'St. Louis, MO',
    bio: `St. Louis rapper known for rhythm and flow. Featured in Riverfront Times for his turn on rhythm and flow that inspired a dance craze.`,
    shortBio: 'St. Louis rapper known for rhythm, flow, and dance-craze hits.',
    verified: true,
    image: '/artists/nikee-turbo/ab6761610000e5ebfddbec3845c421474dc2d779.jpeg',
    coverGradient: 'from-yellow-500 to-orange-500',
    followers: 0,
    supporters: null,
    earnings: null,
    products: 1,
    trackCount: 3,
    social: {
      instagram: 'nikeeturbo',
      youtube: '@nikeeturbostl',
    },
    coverSlides: [
      { src: '/artists/nikee-turbo/Cover Art.png', alt: 'Nikee Turbo' },
      { src: '/artists/nikee-turbo/For Banner.jpg', alt: 'Nikee Turbo - METTLE' },
    ],
  },
  {
    id: 'rob-soule',
    name: 'Rob Soule',
    slug: 'rob-soule',
    genre: 'Hip-Hop / R&B / Blues',
    location: 'St. Louis, MO',
    bio: 'St. Louis hip-hop and R&B artist blending blues into a soulful sound. Known for melodic, powerful, guitar-driven performances.',
    shortBio: 'St. Louis hip-hop and R&B artist blending blues into a soulful sound. Known for melodic, powerful, guitar-driven performances.',
    verified: true,
    image: '/artists/rob-soule/hq720.jpg',
    coverGradient: 'from-purple-600 to-blue-600',
    followers: 0,
    supporters: null,
    earnings: null,
    products: 0,
    trackCount: 3,
    social: {
      youtube: '@RobSouleMusic',
      instagram: 'RobSouleMusic',
    },
    coverSlides: [
      { src: '/artists/rob-soule/hq720.jpg', alt: 'Rob Soule' },
    ],
    videos: [
      { youtubeId: 'LC4l6_-IR8w', title: 'Believe In Me', album: 'Believe In Me' },
    ],
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
