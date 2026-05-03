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
  if (!staticArtist && !dbArtist) return null
  
  // If no static data, create from DB only (won't have tracks count, etc)
  if (!staticArtist && dbArtist) {
    return {
      id: dbArtist.id || dbArtist.slug,
      name: dbArtist.name || dbArtist.full_name || 'Unknown',
      slug: dbArtist.slug,
      genre: dbArtist.genre || '',
      location: dbArtist.location || '',
      bio: dbArtist.bio || '',
      shortBio: dbArtist.bio?.slice(0, 100) || '',
      verified: true,
      likeness_verified: false,
      image: dbArtist.avatar_url || '/artist-images/default-avatar.jpg',
      coverGradient: 'from-gray-700 to-gray-900',
      followers: 0,
      supporters: null,
      earnings: null,
      products: 0,
      social: {
        instagram: dbArtist.instagram_url,
        twitter: dbArtist.twitter_url,
        youtube: dbArtist.youtube_url,
        tiktok: dbArtist.tiktok_url,
        website: dbArtist.website_url,
      },
    }
  }
  
  // If no DB data, return static only
  if (!dbArtist && staticArtist) {
    return staticArtist
  }
  
  // Merge: DB values override static values
  return {
    ...staticArtist!,
    // DB overrides
    bio: dbArtist.bio || staticArtist!.bio,
    shortBio: dbArtist.bio?.slice(0, 100) || staticArtist!.shortBio,
    image: dbArtist.avatar_url || dbArtist.image || staticArtist!.image,
    // Merge social links (DB overrides individual fields)
    social: {
      ...staticArtist!.social,
      ...(dbArtist.instagram_url && { instagram: dbArtist.instagram_url }),
      ...(dbArtist.twitter_url && { twitter: dbArtist.twitter_url }),
      ...(dbArtist.youtube_url && { youtube: dbArtist.youtube_url }),
      ...(dbArtist.tiktok_url && { tiktok: dbArtist.tiktok_url }),
      ...(dbArtist.website_url && { website: dbArtist.website_url }),
    },
    // Update genre/location if DB has values
    genre: dbArtist.genre || staticArtist!.genre,
    location: dbArtist.location || staticArtist!.location,
  }
}

// Get merged artist data (DB + static)
export async function getArtistWithDb(slug: string): Promise<ArtistData | null> {
  const staticArtist = ARTISTS.find(a => a.slug === slug || a.id === slug)
  const dbArtist = await getServerArtistBySlug(slug)
  return mergeArtistData(dbArtist, staticArtist)
}
