import { Track } from '@/lib/audio-context'
import { canonicalAlbum, canonicalTitle } from '@/lib/duration-formatter'

// Canonical dedupe key: normalized artist + canonical album + canonical title
// Normalizes: casing, punctuation, extra spaces, apostrophes/smart quotes
export function getTrackDedupeKey(track: { artist: string; album?: string | null; title: string }): string {
  const normalize = (s: string) => s
    .toLowerCase()
    .trim()
    .replace(/[\u2018\u2019\u201a\u201b]/g, "'") // smart quotes to apostrophe
    .replace(/[\u201c\u201d\u201e\u201f]/g, '"') // smart double quotes
    .replace(/[^\w\s']/g, '') // keep apostrophes, remove other punctuation
    .replace(/\s+/g, ' ') // collapse multiple spaces
  
  const artist = normalize(track.artist)
  const album = normalize(canonicalAlbum(track.album) || '')
  const title = normalize(canonicalTitle(track.title))
    .replace(/\s*\([^)]*\)\s*$/, '') // remove parentheticals at end for dedupe
    .trim()
  
  return `${artist}|${album}|${title}`
}

// Check if a track has a verified CDN audio URL
function hasVerifiedAudio(track: Track): boolean {
  if (!track.audio_url) return false
  // Check for Supabase CDN URLs
  return track.audio_url.includes('supabase.co/storage/v1/object/audio/albums/') ||
         track.audio_url.includes('supabase.co/storage/v1/object/audio/artists/')
}

// Shared sorting helper for consistent track ordering
// Priority: 1) album (canonical), 2) track_number ascending, 3) title
export function sortTracksByAlbumOrder(tracks: Track[]): Track[] {
  return [...tracks].sort((a, b) => {
    // First: sort by canonical album
    const albumA = canonicalAlbum(a.album) || 'ZZZ'
    const albumB = canonicalAlbum(b.album) || 'ZZZ'
    if (albumA !== albumB) {
      return albumA.localeCompare(albumB)
    }
    
    // Second: sort by track_number if available
    const trackNumA = (a as any).track_number ?? null
    const trackNumB = (b as any).track_number ?? null
    if (trackNumA !== null && trackNumB !== null) {
      return trackNumA - trackNumB
    }
    if (trackNumA !== null) return -1
    if (trackNumB !== null) return 1
    
    // Third: sort by title
    return a.title.localeCompare(b.title)
  })
}

// Merge DB tracks with static, applying canonical rules:
// 1. DB tracks are PRIMARY source (canonical)
// 2. Static tracks only added if no active DB equivalent exists
// 3. Inactive DB tracks block matching static from public display (for Artgasm, etc.)
// 4. Deduplicate by album + track_number for O D Porter to prevent duplicates like IJKFBO/yOurs
export function mergeCanonicalTracks(
  dbTracks: (Track & { is_active?: boolean })[],
  staticTracks: Track[],
  options: { includeInactive?: boolean } = {}
): Track[] {
  const { includeInactive = false } = options
  const merged = new Map<string, Track>()
  const blockedKeys = new Set<string>()

  // First pass: identify blocked keys from inactive DB tracks (Artgasm, etc.)
  dbTracks.forEach((dbTrack) => {
    if (!dbTrack.is_active && !includeInactive) {
      const key = getTrackDedupeKey(dbTrack)
      blockedKeys.add(key)
    }
  })

  // Second pass: add DB tracks FIRST (canonical source)
  dbTracks.forEach((dbTrack) => {
    const key = getTrackDedupeKey(dbTrack)
    
    // Skip inactive tracks
    if (!dbTrack.is_active && !includeInactive) {
      return
    }
    
    // Skip if blocked
    if (blockedKeys.has(key)) {
      return
    }
    
    // DB tracks have priority - add them
    merged.set(key, {
      id: dbTrack.id,
      title: dbTrack.title,
      artist: dbTrack.artist,
      album: dbTrack.album,
      duration: dbTrack.duration,
      audio_url: dbTrack.audio_url,
      cover_url: dbTrack.cover_url,
      image: dbTrack.cover_url || dbTrack.image,
      plays: (dbTrack as any).plays || (dbTrack as any).play_count || 0,
      price: (dbTrack as any).price || (dbTrack as any).proud_to_pay_min || 1,
      track_number: (dbTrack as any).track_number,
    })
  })

  // Third pass: add static tracks only if no DB equivalent exists
  staticTracks.forEach((staticTrack) => {
    const key = getTrackDedupeKey(staticTrack)
    
    // Skip if blocked by inactive DB track (e.g., Artgasm)
    if (blockedKeys.has(key)) {
      return
    }
    
    // Skip if already have DB track for this key
    if (merged.has(key)) {
      return
    }
    
    // This is a static-only track - add it
    merged.set(key, staticTrack)
  })

  return Array.from(merged.values())
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
