import { createClient, SupabaseClient } from '@supabase/supabase-js'

/**
 * Server-side helper for track collaborator queries.
 *
 * Reads from the `track_collaborators` junction table (migration 042/044) and
 * returns collaborator data in a shape the existing UI (CollaboratorStack)
 * already understands via lib/artist-credits.ts.
 *
 * Two-step pattern used by the consumers:
 *   1. const map = await loadTrackCollaboratorMap(supabase, trackIds)
 *   2. const enriched = attachTrackCollaborators(tracks, map)
 *
 * Gracefully degrades: if the `track_collaborators` table doesn't exist
 * (migration not yet applied), returns empty data so the UI shows
 * 'no collaborators' instead of throwing 500s.
 */

export type CollaboratorRole =
  | 'primary'
  | 'featured'
  | 'producer'
  | 'writer'
  | 'collaborator'

export interface TrackCollaboratorRow {
  id: string
  track_id: string
  artist_id: string
  role: CollaboratorRole
  display_order: number
  created_at: string
}

export interface TrackCollaboratorWithArtist extends TrackCollaboratorRow {
  artist: {
    id: string
    slug: string
    name: string
    avatar_url: string | null
  }
}

/**
 * Fetch collaborators for many tracks at once (batch).
 * Returns a Map keyed by track_id for O(1) lookup.
 *
 * This is the API name the parallel session's consumers use.
 * Alias: getTrackCollaboratorsBatch (older name, kept for back-compat).
 */
export async function loadTrackCollaboratorMap(
  supabase: SupabaseClient,
  trackIds: string[],
): Promise<Map<string, TrackCollaboratorWithArtist[]>> {
  if (trackIds.length === 0) return new Map()

  const { data, error } = await supabase
    .from('track_collaborators')
    .select(`
      id,
      track_id,
      artist_id,
      role,
      display_order,
      created_at,
      artist:artists!inner (
        id,
        slug,
        name,
        avatar_url
      )
    `)
    .in('track_id', trackIds)
    .order('display_order', { ascending: true })

  if (error) {
    // Graceful degradation: table doesn't exist → empty map
    if (error.code === 'PGRST205' || /track_collaborators.*does not exist/i.test(error.message || '')) {
      return new Map()
    }
    throw error
  }

  const out = new Map<string, TrackCollaboratorWithArtist[]>()
  for (const row of (data ?? []) as unknown as TrackCollaboratorWithArtist[]) {
    const list = out.get(row.track_id) ?? []
    list.push(row)
    out.set(row.track_id, list)
  }
  return out
}

/**
 * Alias for loadTrackCollaboratorMap (older naming).
 */
export const getTrackCollaboratorsBatch = loadTrackCollaboratorMap

/**
 * Fetch collaborators for a single track.
 * Alias of getTrackCollaborators (older naming).
 */
export async function getTrackCollaborators(
  supabase: SupabaseClient,
  trackId: string,
): Promise<TrackCollaboratorWithArtist[]> {
  const map = await loadTrackCollaboratorMap(supabase, [trackId])
  return map.get(trackId) ?? []
}

/**
 * Adapter: convert a TrackCollaboratorWithArtist to the ArtistCredit shape
 * that lib/artist-credits.ts (and the CollaboratorStack) expects.
 */
export interface ArtistCreditLike {
  id?: string | null
  name: string
  image?: string | null
  href?: string | null
  role: CollaboratorRole
  isPrimary?: boolean
}

export function collaboratorToArtistCredit(
  c: TrackCollaboratorWithArtist,
): ArtistCreditLike {
  return {
    id: c.artist.id,
    name: c.artist.name,
    image: c.artist.avatar_url ?? null,
    href: c.artist.slug ? `/artist/${c.artist.slug}` : null,
    role: c.role,
    isPrimary: c.role === 'primary',
  }
}

/**
 * Attach collaborators to a batch of track rows. Each track gets three
 * pre-populated arrays that lib/artist-credits.ts (and therefore
 * CollaboratorStack) already understands:
 *   - collaborators: all collaborator credits for the track
 *   - featured_artists: just the ones with role === 'featured'
 *   - artist_credits: same as collaborators (legacy field name)
 *
 * API name used by the parallel session's consumers.
 */
export type TrackWithCollaborators<T = Record<string, any>> = T & {
  collaborators: ArtistCreditLike[]
  featured_artists: ArtistCreditLike[]
  artist_credits: ArtistCreditLike[]
}

export function attachTrackCollaborators<T extends { id: string }>(
  tracks: T[],
  collaboratorMap: Map<string, TrackCollaboratorWithArtist[]>,
): TrackWithCollaborators<T>[] {
  return tracks.map((track) => {
    const collaborators = collaboratorMap.get(track.id) ?? []
    const credits = collaborators.map(collaboratorToArtistCredit)
    const featured = credits.filter((c) => c.role === 'featured')
    return {
      ...track,
      collaborators: credits,
      featured_artists: featured,
      artist_credits: credits,
    }
  })
}

/**
 * Single-track variant. Equivalent to attachTrackCollaborators([track], map)[0].
 * Kept for symmetry with the single-fetch function above.
 */
export function enrichTrackWithCollaborators<T extends { id: string }>(
  track: T,
  collaborators: TrackCollaboratorWithArtist[],
): TrackWithCollaborators<T> {
  const map = new Map<string, TrackCollaboratorWithArtist[]>()
  map.set(track.id, collaborators)
  const [enriched] = attachTrackCollaborators([track], map)
  return enriched
}

