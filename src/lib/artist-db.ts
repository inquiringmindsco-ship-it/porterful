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

function firstNonEmpty(...values: Array<string | null | undefined>) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }
  return undefined
}

function buildDbSocial(dbArtist: any, staticArtist?: ArtistData) {
  const socialLinks = typeof dbArtist.social_links === 'object' && dbArtist.social_links ? dbArtist.social_links : {}
  const staticSocial = staticArtist?.social || {}

  return {
    instagram: firstNonEmpty(dbArtist.instagram_url, socialLinks.instagram, staticSocial.instagram),
    twitter: firstNonEmpty(dbArtist.twitter_url, socialLinks.twitter, staticSocial.twitter),
    youtube: firstNonEmpty(dbArtist.youtube_url, socialLinks.youtube, staticSocial.youtube),
    tiktok: firstNonEmpty(dbArtist.tiktok_url, socialLinks.tiktok, staticSocial.tiktok),
    website: firstNonEmpty(dbArtist.website_url, dbArtist.website, socialLinks.website, staticSocial.website),
  }
}

function buildDbArtistData(dbArtist: any, staticArtist?: ArtistData): ArtistData {
  const name = firstNonEmpty(dbArtist.name, dbArtist.full_name, staticArtist?.name) || 'Unknown artist'
  const bio = firstNonEmpty(dbArtist.bio, staticArtist?.bio) || ''
  const avatarUrl = firstNonEmpty(dbArtist.avatar_url, staticArtist?.image) || '/artist-images/default-avatar.jpg'
  const bannerUrl = firstNonEmpty(dbArtist.banner_url, dbArtist.cover_url, staticArtist?.bannerUrl, staticArtist?.coverUrl, staticArtist?.coverSlides?.[0]?.src)
  const slug = firstNonEmpty(dbArtist.slug, staticArtist?.slug, dbArtist.id) || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  return {
    id: dbArtist.id || staticArtist?.id || slug,
    name,
    slug,
    genre: normalizeGenre(dbArtist.genre) || staticArtist?.genre || '',
    location: firstNonEmpty(dbArtist.location, staticArtist?.location) || '',
    bio,
    shortBio: firstNonEmpty(dbArtist.short_bio, staticArtist?.shortBio) || bio.slice(0, 100),
    verified: Boolean(dbArtist.verified ?? staticArtist?.verified),
    likeness_verified: Boolean(dbArtist.likeness_verified ?? staticArtist?.likeness_verified),
    image: avatarUrl,
    bannerUrl,
    coverUrl: bannerUrl,
    coverGradient: 'from-gray-700 to-gray-900',
    followers: 0,
    supporters: null,
    earnings: null,
    products: staticArtist?.products || 0,
    artist_tier: dbArtist.artist_tier || staticArtist?.artist_tier,
    status: dbArtist.status || staticArtist?.status,
    public_profile_enabled: typeof dbArtist.public_profile_enabled === 'boolean'
      ? dbArtist.public_profile_enabled
      : staticArtist?.public_profile_enabled,
    auto_publish: typeof dbArtist.auto_publish === 'boolean'
      ? dbArtist.auto_publish
      : staticArtist?.auto_publish,
    social: buildDbSocial(dbArtist),
    coverSlides: staticArtist?.coverSlides,
    videos: staticArtist?.videos,
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
    return buildDbArtistData(dbArtist, staticArtist)
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
