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
    bio: `O D Porter is a St. Louis-born artist who grew up between the音乐 of New Orleans and the streets of the Lou. Born in Miami, raised between NOLA and the Lou — most known from the STL.

After years of grinding in the underground, O D Porter built Porterful out of frustration. Frustration with platforms that take 80% of what artists earn. Frustration with labels that own your work before you see a dollar. Frustration with watching money leave the community within 24 hours.

He wrote his story down — the real one, unfiltered — in his book "There It Is, Here It Go." It's the story of a kid who refused to quit even when everything said stop. Loss in the family. Momentum derailed. And then the stubbornness kicked in.

That stubbornness is the through-line. When O D Porter sets his mind to something, it gets done. Porterful is proof — a platform where artists keep 80%+, where superfans earn 3% on everything their referrals buy, where money recirculates through the community instead of leaking out.

The plan: make Porterful the artist's retirement. Build it once, let it work forever.`,
    shortBio: 'St. Louis artist. Born in Miami, raised in NOLA + the Lou. Founder of Porterful. Stubborn when he sets his mind to something.',
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
    bio: `Gune is what happens when you give a St. Louis kid a drum machine and tell him he can't make it. He made it anyway.

Raw, unapologetic hip-hop from the Lou — the kind that comes from living it, not watching it through a screen. Gune brings a sound that cuts through the noise: hard drums,mean bass lines, and lyrics that don't flinch.

On Porterful, he's not competing with the algorithm. He's building something real with fans who actually show up. 80% of every sale goes straight to the artist. Gune's keeping every cent of that.`,
    shortBio: 'Raw St. Louis hip-hop. Gune doesn\'t make music for everyone — just for the ones who get it.',
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
    bio: `Nikee Turbo is the St. Louis rapper who turned rhythm into a movement. Featured in the Riverfront Times for his distinctive flow — the kind that inspired a dance craze before the algorithm caught on.

He's proof that in the Lou, we don't wait for permission. We build our own thing and let the world catch up. His rhythm-first approach to hip-hop has earned him a following that's more like a movement.

On Porterful, Nikee Turbo's fans are superfans — earning rewards every time they bring someone new to the platform. Because in St. Louis, we look out for our own.`,
    shortBio: 'St. Louis rapper. Rhythm first. Flow second. The dance craze was just the beginning.',
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
    id: 'atm-trap',
    name: 'ATM Trap',
    slug: 'atm-trap',
    genre: 'Hip-Hop',
    location: 'St. Louis, MO',
    bio: `ATM Trap is a St. Louis hip-hop artist bringing authentic street sound to the Porterful platform. Building with the STL crew and focused on real rap for real people. No frills, just music.`,
    shortBio: 'St. Louis hip-hop artist. Real rap, real STL.',
    verified: true,
    image: '/artists/atm-trap/images/avatar.jpg',
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
      { src: '/artists/atm-trap/avatar.jpg', alt: 'ATM Trap' },
    ],
  },
  {
    id: 'rob-soule',
    name: 'Rob Soule',
    slug: 'rob-soule',
    genre: 'Hip-Hop / R&B / Blues',
    location: 'St. Louis, MO',
    bio: `Rob Soule is a St. Louis hip-hop and R&B artist who blends the blues into a soulful sound you won't find anywhere else. Growing up immersed in the city's musical legacy — the soul, the struggle, the stories — he didn't just absorb it, he translated it into something new.

His music sits at the intersection where hip-hop meets the blues. Where the 808 meets the guitar. Where the street meets the soul. It's St. Louis music because it could only come from here — from the blocks, the history, the people. The result is a soulful sound rooted in the blues, filtered through hip-hop and R&B.

Rob's been building his sound track by track, learning what works and what doesn't, and Porterful is where he's planting his flag. This is STL music for STL people and everyone else who can feel it.`,
    shortBio: 'St. Louis hip-hop and R&B artist blending blues into a soulful sound.',
    verified: true,
    image: '/artists/rob-soule/hq720.jpg',
    coverGradient: 'from-purple-600 to-blue-600',
    followers: 412,
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
