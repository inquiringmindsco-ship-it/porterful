// Centralized artwork resolution so the player UI, track rows, and the
// native lock-screen mediaSession all show the same image for a given track.
//
// Fallback order:
//   1. track.image / track.cover_url
//   2. matching artist's profile image (by name or id)
//   3. default Porterful art

import { ARTISTS } from '@/lib/artists'

import type { Track } from '@/lib/audio-context'

export const DEFAULT_TRACK_ART = '/album-art/default.jpg'

export function getTrackArtwork(track: Pick<Track, 'image' | 'cover_url' | 'artist'> | null | undefined): string {
  if (!track) return DEFAULT_TRACK_ART

  const cover = (track.image || track.cover_url || '').trim()
  if (cover) return cover

  const artistKey = (track.artist || '').trim().toLowerCase()
  if (artistKey) {
    const artist = ARTISTS.find(
      (a) => a.name.toLowerCase() === artistKey || a.id.toLowerCase() === artistKey
    )
    if (artist?.image) return artist.image
  }

  return DEFAULT_TRACK_ART
}
