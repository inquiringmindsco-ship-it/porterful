'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAudio } from '@/lib/audio-context'
import { TRACKS } from '@/lib/data'

// Custom Porterful Icons
const Icon = {
  Play: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  ),
  Pause: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  ),
  Plus: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Trash: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3,6 5,6 21,6" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  ),
  Share: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  ),
  Link: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  ),
  Dollar: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  ),
  Users: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  Music: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  ),
  X: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  List: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <circle cx="3" cy="6" r="1" fill="currentColor" />
      <circle cx="3" cy="12" r="1" fill="currentColor" />
      <circle cx="3" cy="18" r="1" fill="currentColor" />
    </svg>
  ),
}

interface PlaylistTrack {
  id: string
  title: string
  artist: string
  album?: string
  duration: string
  image: string
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

export default function PlaylistPage() {
  const { currentTrack, isPlaying, playTrack, setQueue } = useAudio()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('')
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null)
  const [showTrackPicker, setShowTrackPicker] = useState(false)
  const [shareModal, setShareModal] = useState<Playlist | null>(null)

  // Load playlists from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('porterful-playlists')
    if (saved) {
      setPlaylists(JSON.parse(saved))
    }
  }, [])

  // Save playlists to localStorage
  useEffect(() => {
    localStorage.setItem('porterful-playlists', JSON.stringify(playlists))
  }, [playlists])

  const createPlaylist = () => {
    if (!newPlaylistName.trim()) return
    const newPlaylist: Playlist = {
      id: `playlist-${Date.now()}`,
      name: newPlaylistName,
      description: newPlaylistDesc,
      tracks: [],
      createdAt: new Date().toISOString(),
      plays: 0,
      earnings: 0,
      isPublic: false,
    }
    setPlaylists([...playlists, newPlaylist])
    setNewPlaylistName('')
    setNewPlaylistDesc('')
    setShowCreate(false)
    setActivePlaylist(newPlaylist)
  }

  const deletePlaylist = (id: string) => {
    setPlaylists(playlists.filter(p => p.id !== id))
    if (activePlaylist?.id === id) setActivePlaylist(null)
  }

  const addTrackToPlaylist = (track: typeof TRACKS[0]) => {
    if (!activePlaylist) return
    const playlistTrack: PlaylistTrack = {
      id: track.id,
      title: track.title,
      artist: track.artist,
      album: track.album,
      duration: track.duration,
      image: track.image,
    }
    if (activePlaylist.tracks.find(t => t.id === track.id)) return
    const updated = {
      ...activePlaylist,
      tracks: [...activePlaylist.tracks, playlistTrack],
    }
    setActivePlaylist(updated)
    setPlaylists(playlists.map(p => p.id === updated.id ? updated : p))
    setShowTrackPicker(false)
  }

  const removeTrackFromPlaylist = (trackId: string) => {
    if (!activePlaylist) return
    const updated = {
      ...activePlaylist,
      tracks: activePlaylist.tracks.filter(t => t.id !== trackId),
    }
    setActivePlaylist(updated)
    setPlaylists(playlists.map(p => p.id === updated.id ? updated : p))
  }

  const playPlaylist = (playlist: Playlist) => {
    if (playlist.tracks.length === 0) return
    setQueue(playlist.tracks.map(t => ({
      ...t,
      duration: typeof t.duration === 'string' ? 180 : t.duration || 180,
    })))
    playTrack({
      ...playlist.tracks[0],
      duration: 180,
    } as any)
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="pf-container max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[var(--pf-text)]">My Playlists</h1>
            <p className="text-[var(--pf-text-secondary)] mt-1">Create playlists and earn when others listen</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="pf-btn pf-btn-primary flex items-center gap-2">
            <Icon.Plus /> Create Playlist
          </button>
        </div>

        {/* Earnings Info */}
        <div className="bg-gradient-to-br from-[var(--pf-orange)]/10 to-purple-600/10 rounded-2xl p-6 mb-8 border border-[var(--pf-orange)]/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[var(--pf-orange)]/20 flex items-center justify-center">
              <Icon.Dollar />
            </div>
            <h3 className="text-lg font-bold text-[var(--pf-text)]">Playlist Earnings</h3>
          </div>
          <p className="text-[var(--pf-text-secondary)]">
            Earn <span className="text-[var(--pf-orange)] font-bold">3%</span> of track purchases when someone buys from your playlist.
            Share your playlists and grow your earnings.
          </p>
        </div>

        {/* Create Playlist Modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[var(--pf-text)]">Create Playlist</h2>
                <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-[var(--pf-surface)] rounded-lg">
                  <Icon.X />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--pf-text)] mb-2">Name</label>
                  <input 
                    type="text" 
                    value={newPlaylistName} 
                    onChange={e => setNewPlaylistName(e.target.value)} 
                    placeholder="My Playlist"
                    className="w-full px-4 py-3 rounded-xl border border-[var(--pf-border)] bg-[var(--pf-bg)] text-[var(--pf-text)] placeholder:text-[var(--pf-text-muted)] focus:border-[var(--pf-orange)] focus:outline-none focus:ring-2 focus:ring-[var(--pf-orange)]/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--pf-text)] mb-2">Description (optional)</label>
                  <textarea 
                    value={newPlaylistDesc} 
                    onChange={e => setNewPlaylistDesc(e.target.value)} 
                    placeholder="What's this playlist about?"
                    className="w-full px-4 py-3 rounded-xl border border-[var(--pf-border)] bg-[var(--pf-bg)] text-[var(--pf-text)] placeholder:text-[var(--pf-text-muted)] focus:border-[var(--pf-orange)] focus:outline-none focus:ring-2 focus:ring-[var(--pf-orange)]/20 h-20 resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={createPlaylist} className="pf-btn pf-btn-primary flex-1">Create</button>
                  <button onClick={() => setShowCreate(false)} className="pf-btn pf-btn-secondary">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Track Picker Modal */}
        {showTrackPicker && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[var(--pf-text)]">Add Track</h2>
                <button onClick={() => setShowTrackPicker(false)} className="p-2 hover:bg-[var(--pf-surface)] rounded-lg">
                  <Icon.X />
                </button>
              </div>
              <div className="space-y-2">
                {TRACKS.map(track => (
                  <button 
                    key={track.id}
                    onClick={() => addTrackToPlaylist(track)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--pf-surface)] transition-colors text-left border border-[var(--pf-border)]"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                      <img src={track.image} alt={track.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--pf-text)] truncate">{track.title}</p>
                      <Link href={`/artist/${track.artist.toLowerCase().replace(/\s+/g, '-')}`} className="text-sm text-[var(--pf-text-secondary)] truncate hover:text-[var(--pf-orange)] transition-colors block">
                        {track.artist}
                      </Link>
                    </div>
                    <span className="text-sm text-[var(--pf-text-secondary)] shrink-0">{track.duration}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Playlists Grid */}
        {playlists.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--pf-surface)] flex items-center justify-center">
              <Icon.List />
            </div>
            <h3 className="text-xl font-bold text-[var(--pf-text)] mb-2">No playlists yet</h3>
            <p className="text-[var(--pf-text-secondary)] mb-6">Create your first playlist to start earning</p>
            <button onClick={() => setShowCreate(true)} className="pf-btn pf-btn-primary">
              <Icon.Plus /> Create Playlist
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {playlists.map(playlist => (
              <div key={playlist.id} className="bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-2xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-[var(--pf-text)]">{playlist.name}</h3>
                    <p className="text-sm text-[var(--pf-text-secondary)]">{playlist.description || 'No description'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShareModal(playlist)} className="p-2 hover:bg-[var(--pf-bg)] rounded-lg text-[var(--pf-text-secondary)] hover:text-[var(--pf-text)]">
                      <Icon.Share />
                    </button>
                    <button onClick={() => deletePlaylist(playlist.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-[var(--pf-text-secondary)] hover:text-red-400">
                      <Icon.Trash />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-[var(--pf-text-secondary)] mb-3">
                  <span className="flex items-center gap-1">
                    <Icon.Music />
                    {playlist.tracks.length} tracks
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon.Dollar />
                    ${playlist.earnings.toFixed(2)} earned
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon.Users />
                    {playlist.plays} plays
                  </span>
                </div>

                {playlist.tracks.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {playlist.tracks.slice(0, 4).map(track => (
                      <div key={track.id} className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                        <img src={track.image} alt={track.title} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {playlist.tracks.length > 4 && (
                      <div className="w-12 h-12 rounded-lg bg-[var(--pf-bg)] flex items-center justify-center text-sm text-[var(--pf-text-secondary)] shrink-0">
                        +{playlist.tracks.length - 4}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2 mt-3">
                  <button onClick={() => playPlaylist(playlist)} className="pf-btn pf-btn-primary flex-1 flex items-center justify-center gap-2">
                    <Icon.Play /> Play
                  </button>
                  <button onClick={() => setActivePlaylist(playlist)} className="pf-btn pf-btn-secondary flex items-center gap-2">
                    <Icon.Plus /> Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Share Modal */}
        {shareModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[var(--pf-text)]">Share Playlist</h2>
                <button onClick={() => setShareModal(null)} className="p-2 hover:bg-[var(--pf-surface)] rounded-lg">
                  <Icon.X />
                </button>
              </div>
              <p className="text-[var(--pf-text-secondary)] mb-4">Share this link to earn 3% when someone makes a purchase:</p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={`${window.location.origin}/playlist/${shareModal.id}`}
                  readOnly
                  className="flex-1 px-4 py-3 rounded-xl border border-[var(--pf-border)] bg-[var(--pf-bg)] text-[var(--pf-text)] text-sm"
                />
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/playlist/${shareModal.id}`)
                  }}
                  className="pf-btn pf-btn-primary"
                >
                  <Icon.Link /> Copy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}