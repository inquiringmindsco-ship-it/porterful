import type { Track } from '@/lib/audio-context'
import { TRACKS as STATIC_TRACKS } from '@/lib/data'
import { canonicalAlbum, canonicalTitle } from '@/lib/duration-formatter'

const OD_SOURCE_ALBUMS = new Set([
  'Ambiguous',
  'From Feast to Famine',
  'God Is Good',
  'One Day',
  'Streets Thought I Left',
  'Roxanity',
  'Levi',
  'Artgasm',
])

const OD_SOURCE_SINGLE_TITLES = new Set(
  [
    'Too Stingy',
    'After Effects',
    'Embrace',
    'TLF',
    'Twerk-A-Thon',
    'Good Bye Kisses',
    'Spoken Word',
    'Outsider',
    'Only Real Niggaz',
    'No Limits',
    'Lust',
    'Lifestyle',
    'Keep It Real',
    'Hero',
    'Sometime',
    'On Errthang',
    'Issues',
    'Forever Young',
    'Cutta Money',
    'Bounce Dat Azz',
    'Aired Em Out',
    'Aint Gone Let Up',
    'Intro To My World',
    'TBT',
    'Change Up',
    'Unchained Melodies',
    'Funeral',
    'Trust',
    'IJKFBO',
    'Ride',
    'Feel This Pain',
    'Heal',
    'Breathe',
    'Mike Tyson',
    'Plus',
    'Tracey Porter',
    'Street Love',
    'Silhouette',
    'The Interlude',
    'Artgasm',
  ].map((title) => canonicalTitle(title))
)

const STATIC_TRACK_LOOKUP = new Map<string, Track>()

STATIC_TRACKS.forEach((track) => {
  const key = `${canonicalAlbum(track.album) || ''}|${canonicalTitle(track.title)}`
  if (!STATIC_TRACK_LOOKUP.has(key)) {
    STATIC_TRACK_LOOKUP.set(key, track)
  }
})

function normalizeArtistName(artist: string | null | undefined): string {
  const value = artist?.trim()
  if (!value || value === 'Unknown' || value === 'null' || value === 'undefined') {
    return ''
  }
  return value
}

export function resolveCanonicalTrackArtist(track: { artist: string | null | undefined; album?: string | null; title: string }): string {
  const album = canonicalAlbum(track.album) || ''
  const title = canonicalTitle(track.title)

  // The O D source-of-truth catalog should collapse to O D Porter even if a
  // legacy DB/static row still carries an older artist label.
  if (OD_SOURCE_ALBUMS.has(album)) {
    return 'O D Porter'
  }

  if (album === 'Singles' && OD_SOURCE_SINGLE_TITLES.has(title)) {
    return 'O D Porter'
  }

  const staticMatch = STATIC_TRACK_LOOKUP.get(`${album}|${title}`)
  const staticArtist = normalizeArtistName(staticMatch?.artist)
  if (staticArtist) {
    return staticArtist
  }

  return normalizeArtistName(track.artist) || 'Unknown'
}

// Canonical dedupe key: normalized artist + canonical album + canonical title
// Normalizes: casing, punctuation, extra spaces, apostrophes/smart quotes
export function getTrackDedupeKey(track: { artist: string | null | undefined; album?: string | null; title: string }): string {
  const normalize = (s: string) => s
    .toLowerCase()
    .trim()
    .replace(/[\u2018\u2019\u201a\u201b]/g, "'") // smart quotes to apostrophe
    .replace(/[\u201c\u201d\u201e\u201f]/g, '"') // smart double quotes
    .replace(/[^\w\s']/g, '') // keep apostrophes, remove other punctuation
    .replace(/\s+/g, ' ') // collapse multiple spaces
  
  const artist = normalize(resolveCanonicalTrackArtist(track))
  const album = normalize(canonicalAlbum(track.album) || '')
  const title = normalize(canonicalTitle(track.title))
    .replace(/\s*\([^)]*\)\s*$/, '') // remove parentheticals at end for dedupe
    .trim()
  
  return `${artist}|${album}|${title}`
}

const CANONICAL_ALBUM_ORDER = [
  'Ambiguous',
  'From Feast to Famine',
  'God Is Good',
  'One Day',
  'Streets Thought I Left',
  'Roxanity',
  'Artgasm',
  'Levi',
  'Singles',
]

function getAlbumSortRank(album: string | null | undefined): number {
  const canonical = canonicalAlbum(album) || ''
  const rank = CANONICAL_ALBUM_ORDER.indexOf(canonical)
  return rank >= 0 ? rank : CANONICAL_ALBUM_ORDER.length
}

// Check whether a track has a playable audio URL.
// We intentionally keep this lightweight so we do not block on network checks.
export function hasPlayableAudio(track: Pick<Track, 'audio_url'> | null | undefined): track is Track & { audio_url: string } {
  const audioUrl = track?.audio_url?.trim()
  return !!audioUrl && audioUrl !== 'null' && audioUrl !== 'undefined'
}

export function filterPlayableTracks<T extends Track>(tracks: T[]): T[] {
  return tracks.filter((track) => hasPlayableAudio(track))
}

// Shared sorting helper for consistent track ordering
// Priority: 1) canonical album release order, 2) track_number ascending, 3) title
export function sortTracksByAlbumOrder(tracks: Track[]): Track[] {
  return [...tracks].sort((a, b) => {
    const albumRankA = getAlbumSortRank(a.album)
    const albumRankB = getAlbumSortRank(b.album)
    if (albumRankA !== albumRankB) {
      return albumRankA - albumRankB
    }
    
    // Second: sort by track_number if available
    const trackNumA = (a as any).track_number ?? null
    const trackNumB = (b as any).track_number ?? null
    if (trackNumA !== null && trackNumB !== null) {
      return trackNumA - trackNumB
    }
    if (trackNumA !== null) return -1
    if (trackNumB !== null) return 1
    
    // Third: sort by canonicalized title so renamed variants stay adjacent.
    const titleCompare = canonicalTitle(a.title).localeCompare(canonicalTitle(b.title))
    if (titleCompare !== 0) return titleCompare
    return a.artist.localeCompare(b.artist)
  })
}

// Merge DB tracks with static, applying canonical rules:
// 1. Static/CDN tracks win when they have playable audio.
// 2. Playable tracks win over missing/broken audio for the same canonical key.
// 3. Inactive DB rows stay hidden when public display is requested.
// 4. Deduplicate by canonical artist + album + title to prevent renamed duplicates.
export function mergeCanonicalTracks(
  dbTracks: (Track & { is_active?: boolean })[],
  staticTracks: Track[],
  options: { includeInactive?: boolean } = {}
): Track[] {
  const { includeInactive = false } = options
  type TrackSource = 'static' | 'db'
  type Candidate = { track: Track; source: TrackSource; playable: boolean }

  const merged = new Map<string, Candidate>()

  const upsertCandidate = (track: Track, source: TrackSource) => {
    const normalizedTrack: Track = {
      ...track,
      title: canonicalTitle(track.title),
      artist: resolveCanonicalTrackArtist(track),
      album: canonicalAlbum(track.album),
    }
    const key = getTrackDedupeKey(normalizedTrack)
    const candidate: Candidate = {
      track: normalizedTrack,
      source,
      playable: hasPlayableAudio(normalizedTrack),
    }

    const current = merged.get(key)
    if (!current) {
      merged.set(key, candidate)
      return
    }

    // Prefer playable audio over empty/broken audio.
    if (current.playable !== candidate.playable) {
      if (candidate.playable) {
        merged.set(key, candidate)
      }
      return
    }

    // When both are equally playable, prefer static/CDN over DB rows.
    if (current.source !== candidate.source) {
      if (candidate.source === 'static') {
        merged.set(key, candidate)
      }
      return
    }

    // Same source and same playability: keep the first candidate.
  }

  // Static/CDN tracks go first so they win over duplicate DB rows.
  staticTracks.forEach((staticTrack) => {
    upsertCandidate(staticTrack, 'static')
  })

  dbTracks.forEach((dbTrack) => {
    if (!dbTrack.is_active && !includeInactive) {
      return
    }

    upsertCandidate({
      id: dbTrack.id,
      title: dbTrack.title,
      artist: dbTrack.artist,
      album: dbTrack.album,
      duration: dbTrack.duration,
      audio_url: dbTrack.audio_url,
      cover_url: dbTrack.cover_url,
      image: dbTrack.cover_url || dbTrack.image,
      plays: (dbTrack as any).plays || (dbTrack as any).play_count || 0,
      proud_to_pay_min: (dbTrack as any).proud_to_pay_min || (dbTrack as any).price || 1,
      price: (dbTrack as any).price || (dbTrack as any).proud_to_pay_min || 1,
      track_number: (dbTrack as any).track_number,
      playback_mode: (dbTrack as any).playback_mode || 'full',
      preview_duration_seconds: (dbTrack as any).preview_duration_seconds || 60,
      unlock_required: (dbTrack as any).unlock_required || false,
    }, 'db')
  })

  return sortTracksByAlbumOrder(
    filterPlayableTracks(Array.from(merged.values()).map((candidate) => candidate.track))
  )
}

// Deduplicate queue tracks to prevent repeats
export function dedupeQueueTracks(tracks: Track[]): Track[] {
  const seen = new Set<string>()
  return tracks.filter((track) => {
    const key = getTrackDedupeKey(track)
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}
