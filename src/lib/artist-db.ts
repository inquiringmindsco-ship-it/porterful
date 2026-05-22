import { createClient } from '@supabase/supabase-js'
import { ARTISTS, ArtistData } from './artists'

// Server-side Supabase client
function getServerSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

function normalizeGenre(value: unknown): string {
  if (Array.isArray(value)) {
    return value.filter(Boolean).join(', ')
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return ''

    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed)) {
          return parsed.filter(Boolean).join(', ')
        }
      } catch {
        // Fall through to the raw string below.
      }
    }

    return trimmed
  }

  return ''
}

function buildDbSocial(dbArtist: any) {
  const socialLinks = typeof dbArtist.social_links === 'object' && dbArtist.social_links ? dbArtist.social_links : {}

  return {
    instagram: dbArtist.instagram_url || socialLinks.instagram || undefined,
    twitter: dbArtist.twitter_url || socialLinks.twitter || undefined,
    youtube: dbArtist.youtube_url || socialLinks.youtube || undefined,
    tiktok: dbArtist.tiktok_url || socialLinks.tiktok || undefined,
    website: dbArtist.website_url || dbArtist.website || socialLinks.website || undefined,
  }
}

function buildDbArtistData(dbArtist: any): ArtistData {
  const name = dbArtist.name || dbArtist.full_name || 'Unknown artist'
  const bio = dbArtist.bio || ''

  return {
    id: dbArtist.id || dbArtist.slug || name,
    name,
    slug: dbArtist.slug || dbArtist.id || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    genre: normalizeGenre(dbArtist.genre),
    location: dbArtist.location || '',
    bio,
    shortBio: bio.slice(0, 100),
    verified: Boolean(dbArtist.verified),
    likeness_verified: Boolean(dbArtist.likeness_verified),
    image: dbArtist.avatar_url || dbArtist.cover_url || '/artist-images/default-avatar.jpg',
    coverGradient: 'from-gray-700 to-gray-900',
    followers: 0,
    supporters: null,
    earnings: null,
    products: 0,
    social: buildDbSocial(dbArtist),
  }
}

// Fetch artist from DB by slug
export async function getServerArtistBySlug(slug: string) {
  const supabase = getServerSupabase()
  
  // Try artists table first
  const { data: artistRow, error } = await supabase
    .from('artists')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()
  
  if (error) {
    console.error('[getServerArtistBySlug] Error:', error)
    return null
  }
  
  return artistRow
}

// Merge DB artist data with static fallback
export function mergeArtistData(dbArtist: any | null, staticArtist: ArtistData | undefined): ArtistData | null {
  if (dbArtist) {
    return buildDbArtistData(dbArtist)
  }

  if (staticArtist) {
    return staticArtist
  }

  return null
}

// Get merged artist data (DB + static)
export async function getArtistWithDb(slug: string): Promise<ArtistData | null> {
  const staticArtist = ARTISTS.find(a => a.slug === slug || a.id === slug)
  const dbArtist = await getServerArtistBySlug(slug)
  return mergeArtistData(dbArtist, staticArtist)
}
