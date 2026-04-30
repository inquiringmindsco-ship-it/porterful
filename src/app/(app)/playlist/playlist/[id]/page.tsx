'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useAudio } from '@/lib/audio-context'
import { TRACKS } from '@/lib/data'

interface PlaylistTrack {
  id: string
  title: string
  artist: string
  album?: string
  duration: string
  image: string
  audioUrl?: string
}

interface Playlist {
  id: string
  name: string
  description: string
  tracks: PlaylistTrack[]
  createdAt: string
  plays: number
  earnings: number
  isPublic: boolean
}

function resolvePlaylistTrack(track: PlaylistTrack): PlaylistTrack {
  const existingAudioUrl = track.audioUrl || (track as any).audio_url
  if (existingAudioUrl) {
    return {
      ...track,
      audioUrl: existingAudioUrl,
    }
  }

  const catalogTrack = TRACKS.find((candidate) => candidate.id === track.id)
    ?? TRACKS.find((candidate) => candidate.title === track.title && candidate.artist === track.artist)

  if (!catalogTrack?.audio_url) return track

  return {
    ...track,
    audioUrl: catalogTrack.audio_url,
  }
}

function resolvePlaylistTracks(tracks: PlaylistTrack[]): PlaylistTrack[] {
  return tracks.map(resolvePlaylistTrack)
}

const Icon = {
  Play: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  ),
  Pause: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  ),
  ArrowLeft: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="15,18 9,12 15,6" />
    </svg>
  ),
}

export default function PlaylistDetailPage() {
  const params = useParams()
  const { currentTrack, isPlaying, playTrack, setQueue } = useAudio()
  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = params.id as string
    if (!id) {
      setLoading(false)
      return
    }

    const saved = localStorage.getItem('porterful-playlists')
    if (saved) {
      const playlists: Playlist[] = JSON.parse(saved)
      const found = playlists.find(p => p.id === id)
      setPlaylist(found ? {
        ...found,
        tracks: resolvePlaylistTracks(found.tracks),
      } : null)
    }
    setLoading(false)
  }, [params.id])

  const playPlaylist = () => {
    if (!playlist) return
    const playableTracks = resolvePlaylistTracks(playlist.tracks).filter((track) => track.audioUrl)
    if (playableTracks.length === 0) return

    setQueue(playableTracks.map(t => ({
      ...t,
      audio_url: t.audioUrl,
      duration: typeof t.duration === 'string' ? 180 : t.duration || 180,
    })))
    playTrack({
      ...playableTracks[0],
      audio_url: playableTracks[0].audioUrl || '',
      duration: 180,
    } as any)
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--pf-orange)] border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!playlist) {
    return (
      <div className="min-h-screen pt-24">
        <div className="pf-container max-w-2xl text-center py-16">
          <h1 className="text-3xl font-bold text-[var(--pf-text)] mb-4">Playlist Not Found</h1>
          <p className="text-[var(--pf-text-secondary)] mb-6">
            This playlist doesn't exist or may have been deleted.
          </p>
          <Link href="/playlists" className="pf-btn pf-btn-primary">
            Go to My Playlists
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="pf-container max-w-4xl">
        <Link href="/playlists" className="inline-flex items-center gap-2 text-[var(--pf-text-secondary)] hover:text-[var(--pf-text)] mb-6 transition-colors">
          <Icon.ArrowLeft /> Back to Playlists
        </Link>

        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="w-full md:w-64 h-64 bg-gradient-to-br from-[var(--pf-orange)] to-purple-600 rounded-2xl flex items-center justify-center relative overflow-hidden">
            {playlist.tracks.length > 0 ? (
              <Image src={playlist.tracks[0].image} alt={playlist.name} fill sizes="(max-width: 768px) 100vw, 256px" className="object-cover rounded-2xl" />
            ) : (
              <div className="text-6xl">🎵</div>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-[var(--pf-text)] mb-2">{playlist.name}</h1>
            <p className="text-[var(--pf-text-secondary)] mb-4">{playlist.description || 'No description'}</p>
            <div className="flex items-center gap-6 text-sm text-[var(--pf-text-secondary)]">
              <span>{playlist.tracks.length} tracks</span>
              <span>{playlist.plays} plays</span>
              <span className="text-[var(--pf-orange)]">${playlist.earnings.toFixed(2)} earned</span>
            </div>
            <button onClick={playPlaylist} className="pf-btn pf-btn-primary mt-6 flex items-center gap-2">
              <Icon.Play /> Play
            </button>
          </div>
        </div>

        {playlist.tracks.length === 0 ? (
          <div className="text-center py-12 bg-[var(--pf-surface)] rounded-2xl">
            <p className="text-[var(--pf-text-secondary)]">No tracks added yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {playlist.tracks.map((track, index) => (
              <div
                key={track.id}
                className="flex items-center gap-4 p-4 bg-[var(--pf-surface)] rounded-xl hover:bg-[var(--pf-border)] transition-colors cursor-pointer"
                onClick={() => {
                  const playableTracks = resolvePlaylistTracks(playlist.tracks).filter((item) => item.audioUrl)
                  const resolvedTrack = resolvePlaylistTrack(track)
                  if (!resolvedTrack.audioUrl) return
                  setQueue(playableTracks.map(t => ({ ...t, audio_url: t.audioUrl, duration: 180 })))
                  playTrack({ ...resolvedTrack, audio_url: resolvedTrack.audioUrl, duration: 180 } as any)
                }}
              >
                <span className="w-8 text-center text-[var(--pf-text-secondary)]">{index + 1}</span>
                <div className="w-12 h-12 rounded-lg overflow-hidden relative">
                  <Image src={track.image} alt={track.title} fill sizes="48px" className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[var(--pf-text)]">{track.title}</p>
                  <Link href={`/artist/${track.artist.toLowerCase().replace(/\s+/g, '-')}`} className="text-sm text-[var(--pf-text-secondary)] hover:text-[var(--pf-orange)]">
                    {track.artist}
                  </Link>
                </div>
                <span className="text-sm text-[var(--pf-text-secondary)]">{track.duration}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
