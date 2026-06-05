export type PresenceNowPlaying = {
  trackId: string
  trackTitle: string
  artistName: string
  album?: string | null
  playbackMode?: string | null
  playbackState?: 'playing' | 'paused' | 'stopped' | null
}

export type ParsedPresencePath = {
  currentPath: string | null
  nowPlaying: PresenceNowPlaying | null
}

const NOW_PLAYING_MARKER = '#np='
const MAX_CURRENT_PATH_LENGTH = 500

function trimValue(value: unknown, limit: number): string {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, limit)
}

function normalizeCurrentPath(value: unknown): string | null {
  const path = trimValue(value, MAX_CURRENT_PATH_LENGTH)
  return path || null
}

export function buildPresencePath(
  currentPath: unknown,
  nowPlaying: PresenceNowPlaying | null = null
): string | null {
  const path = normalizeCurrentPath(currentPath)
  if (!path) return null
  if (!nowPlaying) return path

  const payload = {
    i: trimValue(nowPlaying.trackId, 80),
    t: trimValue(nowPlaying.trackTitle, 120),
    a: trimValue(nowPlaying.artistName, 120),
    al: trimValue(nowPlaying.album ?? '', 120),
    m: trimValue(nowPlaying.playbackMode ?? '', 24),
    s: trimValue(nowPlaying.playbackState ?? '', 24),
  }

  return `${path}${NOW_PLAYING_MARKER}${encodeURIComponent(JSON.stringify(payload))}`
}

export function parsePresencePath(rawValue: unknown): ParsedPresencePath {
  const raw = normalizeCurrentPath(rawValue)
  if (!raw) {
    return { currentPath: null, nowPlaying: null }
  }

  const markerIndex = raw.indexOf(NOW_PLAYING_MARKER)
  if (markerIndex < 0) {
    return { currentPath: raw, nowPlaying: null }
  }

  const currentPath = raw.slice(0, markerIndex).trim() || null
  const encodedPayload = raw.slice(markerIndex + NOW_PLAYING_MARKER.length).trim()
  if (!encodedPayload) {
    return { currentPath, nowPlaying: null }
  }

  try {
    const decoded = JSON.parse(decodeURIComponent(encodedPayload))
    if (!decoded || typeof decoded !== 'object') {
      return { currentPath, nowPlaying: null }
    }

    const payload = decoded as Record<string, unknown>
    const trackId = trimValue(payload.i ?? payload.track_id, 80)
    const trackTitle = trimValue(payload.t ?? payload.track_title, 120)
    const artistName = trimValue(payload.a ?? payload.artist_name, 120)

    if (!trackId && !trackTitle && !artistName) {
      return { currentPath, nowPlaying: null }
    }

    return {
      currentPath,
      nowPlaying: {
        trackId: trackId || 'unknown',
        trackTitle: trackTitle || 'Unknown Track',
        artistName: artistName || 'Unknown Artist',
        album: trimValue(payload.al ?? payload.album, 120) || null,
        playbackMode: trimValue(payload.m ?? payload.playback_mode, 24) || null,
        playbackState: (trimValue(payload.s ?? payload.playback_state, 24) as PresenceNowPlaying['playbackState']) || null,
      },
    }
  } catch {
    return { currentPath, nowPlaying: null }
  }
}
