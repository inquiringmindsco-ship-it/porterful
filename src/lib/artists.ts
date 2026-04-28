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
  likeness_verified?: boolean
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
    bio: `O D Porter is a St. Louis-born artist who grew up between the音乐 of New Orleans and the streets of the Lou. Born in Miami, raised between NOLA and the Lou — most known from the STL.

After years of grinding in the underground, O D Porter built Porterful out of frustration. Frustration with platforms that take 80% of what artists earn. Frustration with labels that own your work before you see a dollar. Frustration with watching money leave the community within 24 hours.

He wrote his story down — the real one, unfiltered — in his book "There It Is, Here It Go." It's the story of a kid who refused to quit even when everything said stop. Loss in the family. Momentum derailed. And then the stubbornness kicked in.

That stubbornness is the through-line. When O D Porter sets his mind to something, it gets done. Porterful is proof — a platform where artists keep 80%+, where superfans earn 3% on everything their referrals buy, where money recirculates through the community instead of leaking out.

The plan: make Porterful the artist's retirement. Build it once, let it work forever.`,
    shortBio: 'St. Louis artist. Born in Miami, raised in NOLA + the Lou. Founder of Porterful. Stubborn when he sets his mind to something.',
    verified: true,
    likeness_verified: true,
    image: '/artist-images/od-porter/avatar.jpg',
    coverGradient: 'from-[var(--pf-orange)] to-purple-600',
    followers: 0,
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
      { src: '/artist-images/od-porter/avatar.jpg', alt: 'O D Porter' },
      { src: '/artist-images/od-porter/tlf-cover.png', alt: 'O D Porter - TLF' },
    ],
  },
  {
    id: 'gune',
    name: 'Gune',
    slug: 'gune',
    genre: 'Hip-Hop / R&B / Blues',
    location: 'St. Louis, MO',
    bio: `Gune is what happens when you give a St. Louis kid a drum machine and tell him he can't make it. He made it anyway.

Raw, unapologetic hip-hop from the Lou — the kind that comes from living it, not watching it through a screen. Gune brings a sound that cuts through the noise: hard drums,mean bass lines, and lyrics that don't flinch.

On Porterful, he's not competing with the algorithm. He's building something real with fans who actually show up. 80% of every sale goes straight to the artist. Gune's keeping every cent of that.`,
    shortBio: 'Raw St. Louis hip-hop. Gune doesn\'t make music for everyone — just for the ones who get it.',
    verified: true,
    likeness_verified: false,
    image: '/artist-images/gune/avatar.jpg',
    coverGradient: 'from-red-600 to-orange-600',
    followers: 0,
    supporters: null,
    earnings: null,
    products: 0,
    trackCount: TRACKS.filter(t => t.artist === 'Gune').length,
    social: {
      instagram: 'gunebugtheplug',
    },
    coverSlides: [
      { src: '/artist-images/gune/avatar.jpg', alt: 'Gune' },
      { src: '/artist-images/gune/ISIMG-1050533.JPG', alt: 'Gune' },
      { src: '/artist-images/gune/EL8A6131.JPG', alt: 'Gune' },
    ],
  },
  {
    id: 'atm-trap',
    name: 'ATM Trap',
    slug: 'atm-trap',
    genre: 'Hip-Hop',
    location: 'St. Louis, MO',
    bio: `ATM Trap is a St. Louis hip-hop artist bringing authentic street sound to the Porterful platform. Building with the STL crew and focused on real rap for real people. No frills, just music.`,
    shortBio: 'St. Louis hip-hop artist. Real rap, real STL.',
    verified: true,
    image: '/artist-images/atm-trap/avatar.jpg',
    coverGradient: 'from-gray-800 to-gray-900',
    followers: 0,
    supporters: null,
    earnings: null,
    products: 0,
    trackCount: 4,
    social: {
      instagram: 'atm_trap',
    },
    coverSlides: [
      { src: '/artist-images/atm-trap/avatar.jpg', alt: 'ATM Trap' },
    ],
  },
  {
    id: 'rob-soule',
    name: 'Rob Soule',
    slug: 'rob-soule',
    genre: 'Hip-Hop / R&B / Blues',
    location: 'St. Louis, MO',
    bio: `Rob Soule is a St. Louis hip-hop and R&B artist blending blues into a soulful sound. From the heart of the city, Rob brings together smooth R&B melodies, hard-hitting hip-hop beats, and the raw emotional truth of blues to create something uniquely STL.`,
    shortBio: 'St. Louis hip-hop and R&B artist blending blues into a soulful sound.',
    verified: true,
    likeness_verified: false,
    image: '/artist-images/rob-soule/avatar.jpg',
    coverGradient: 'from-blue-600 to-purple-600',
    followers: 0,
    supporters: null,
    earnings: null,
    products: 1,
    trackCount: 0,
    social: {
      instagram: 'robsoule',
      twitter: 'robsoule',
      youtube: '@robsoule',
      tiktok: 'robsoule',
    },
    coverSlides: [
      { src: '/artist-images/rob-soule/avatar.jpg', alt: 'Rob Soule' },
    ],
  },
]

export const PUBLIC_ARTIST_SLUGS = ARTISTS
  .filter((artist) => artist.trackCount && artist.trackCount > 0)
  .map((artist) => artist.slug)
export const PUBLIC_ARTIST_NAMES = ARTISTS.map((artist) => artist.name)

export function isPublicArtistSlug(value?: string | null) {
  if (!value) return false
  return PUBLIC_ARTIST_SLUGS.includes(value)
}

export function isPublicArtistName(value?: string | null) {
  if (!value) return false
  return PUBLIC_ARTIST_NAMES.some((name) => name.toLowerCase() === value.toLowerCase())
}

export function isPublicArtistRecord(artist: {
  id?: string | null
  slug?: string | null
  username?: string | null
  full_name?: string | null
  name?: string | null
}) {
  return isPublicArtistSlug(artist.id)
    || isPublicArtistSlug(artist.slug)
    || isPublicArtistSlug(artist.username)
    || isPublicArtistName(artist.full_name)
    || isPublicArtistName(artist.name)
}

export function isPublicTrackArtist(trackArtist?: string | null) {
  return isPublicArtistName(trackArtist)
}

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

export function getArtistSlugByName(name?: string | null): string | null {
  if (!name) return null

  const match = ARTISTS.find((artist) => artist.name.toLowerCase() === name.toLowerCase())
  if (match) return match.slug

  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}
