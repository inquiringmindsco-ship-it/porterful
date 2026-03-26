// Artist data - in production this would come from Supabase
import { TRACKS } from './data'

export interface ArtistData {
  id: string
  name: string
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
  social?: {
    instagram?: string
    twitter?: string
    tiktok?: string
    youtube?: string
  }
}

// Demo artists - matches the ARTISTS array in /artists/page.tsx
export const ARTISTS_DATA: Record<string, ArtistData> = {
  'od-porter': {
    id: 'od-porter',
    name: 'O D Porter',
    genre: 'Hip-Hop, R&B, Soul',
    location: 'St. Louis, MO',
    bio: `Independent artist and founder of Porterful. Born in Miami, raised between New Orleans and St. Louis — most known from the STL. I've seen firsthand how the music industry exploits artists—taking the majority of profits while leaving creators with scraps.`,
    shortBio: 'Independent artist and founder of Porterful. Born in Miami, raised in New Orleans & St. Louis.',
    verified: true,
    image: '🎤',
    coverGradient: 'from-[var(--pf-orange)] to-purple-600',
    followers: 2847,
    supporters: null,
    earnings: null,
    products: 12,
    social: {
      instagram: 'odporter',
      twitter: 'odporter',
      youtube: '@odporter',
    },
  },
  'alex': {
    id: 'alex',
    name: 'Alex Rivers',
    genre: 'Indie Pop',
    location: 'Los Angeles, CA',
    bio: 'Indie pop songwriter crafting dreamy melodies and heartfelt lyrics. Building a community of dreamers through music.',
    shortBio: 'Indie pop songwriter from LA.',
    verified: false,
    image: '🎸',
    coverGradient: 'from-pink-500 to-orange-400',
    followers: 1205,
    supporters: null,
    earnings: null,
    products: 8,
  },
  'maya': {
    id: 'maya',
    name: 'Maya Sol',
    genre: 'Electronic',
    location: 'Brooklyn, NY',
    bio: 'Electronic producer blending house, techno, and ambient soundscapes. Sonically exploring the intersection of human emotion and digital sound.',
    shortBio: 'Electronic producer from Brooklyn.',
    verified: false,
    image: '🎹',
    coverGradient: 'from-cyan-500 to-blue-600',
    followers: 983,
    supporters: null,
    earnings: null,
    products: 5,
  },
  'jordan': {
    id: 'jordan',
    name: 'Jordan Blake',
    genre: 'Alternative',
    location: 'Seattle, WA',
    bio: 'Alternative artist pushing boundaries with experimental rock and electronic fusion. Formally trained, independently minded.',
    shortBio: 'Alternative artist from Seattle.',
    verified: false,
    image: '🎷',
    coverGradient: 'from-green-500 to-teal-600',
    followers: 756,
    supporters: null,
    earnings: null,
    products: 3,
  },
  'luna': {
    id: 'luna',
    name: 'Luna Wave',
    genre: 'Lo-Fi',
    location: 'Austin, TX',
    bio: 'Lo-fi beats for late night thoughts. Creating chill soundscapes for study, sleep, and introspection.',
    shortBio: 'Lo-fi beats from Austin.',
    verified: false,
    image: '🎧',
    coverGradient: 'from-purple-500 to-indigo-600',
    followers: 1562,
    supporters: null,
    earnings: null,
    products: 6,
  },
  'cruz': {
    id: 'cruz',
    name: 'Cruz Martinez',
    genre: 'Latin',
    location: 'Miami, FL',
    bio: 'Latin music artist blending reggaeton, salsa, and urban sounds. Bringing the heat from the 305.',
    shortBio: 'Latin artist from Miami.',
    verified: false,
    image: '🎺',
    coverGradient: 'from-red-500 to-yellow-500',
    followers: 2104,
    supporters: null,
    earnings: null,
    products: 9,
  },
}

// Get artist by ID, returns undefined if not found
export function getArtistById(id: string): ArtistData | undefined {
  return ARTISTS_DATA[id]
}

// Get all artist IDs for routing
export function getAllArtistIds(): string[] {
  return Object.keys(ARTISTS_DATA)
}

// Get tracks for a specific artist
export function getArtistTracks(artistId: string): typeof TRACKS {
  return TRACKS.filter(t => t.artist === artistId)
}

// Get products for a specific artist (placeholder - would be from DB)
export function getArtistProducts(artistId: string): number {
  const artist = ARTISTS_DATA[artistId]
  return artist?.products || 0
}
