type QueryResult<T> = Promise<{ data: T | null; error?: unknown }>

export interface ArtistAccessContext {
  profile: any | null
  artistById: any | null
  artistByUserId: any | null
  artist: any | null
  isArtist: boolean
  artistIds: Set<string>
}

function buildArtistIdSet(userId: string, profile: any | null, artistById: any | null, artistByUserId: any | null) {
  return new Set(
    [
      userId,
      profile?.id,
      artistById?.id,
      artistById?.user_id,
      artistByUserId?.id,
      artistByUserId?.user_id,
    ].filter((value): value is string => Boolean(value)),
  )
}

export async function getArtistAccessContext(supabase: any, userId: string): Promise<ArtistAccessContext> {
  const [profileResult, artistByIdResult] = await Promise.all([
    supabase.from('profiles').select('id, role, email, name, full_name').eq('id', userId).maybeSingle() as QueryResult<any>,
    supabase.from('artists').select('*').eq('id', userId).maybeSingle() as QueryResult<any>,
  ])

  const profile = profileResult.data || null
  const artistById = artistByIdResult.data || null
  const artistByUserId = null // artists table has no user_id column
  const artist = artistById || null
  const artistIds = buildArtistIdSet(userId, profile, artistById, artistByUserId)

  return {
    profile,
    artistById,
    artistByUserId,
    artist,
    isArtist: profile?.role === 'artist' || !!artist,
    artistIds,
  }
}

export function trackBelongsToArtist(trackArtistId: string | null | undefined, context: ArtistAccessContext) {
  if (!trackArtistId) return false
  return context.artistIds.has(trackArtistId)
}
