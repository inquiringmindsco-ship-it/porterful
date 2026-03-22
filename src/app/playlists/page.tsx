'use client';

import { useState, useEffect } from 'react';
import { useAudio } from '@/lib/audio-context';
import { TRACKS } from '@/lib/data';
import { Play, Pause, Plus, Trash2, Share2, Link2, DollarSign, Users } from 'lucide-react';

interface PlaylistTrack {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: string;
  image: string;
}

interface Playlist {
  id: string;
  name: string;
  description: string;
  tracks: PlaylistTrack[];
  createdAt: string;
  plays: number;
  earnings: number;
  isPublic: boolean;
}

export default function PlaylistPage() {
  const { currentTrack, isPlaying, playTrack, setQueue } = useAudio();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);
  const [showTrackPicker, setShowTrackPicker] = useState(false);
  const [shareModal, setShareModal] = useState<Playlist | null>(null);

  // Load playlists from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('porterful-playlists');
    if (saved) {
      setPlaylists(JSON.parse(saved));
    }
  }, []);

  // Save playlists to localStorage
  useEffect(() => {
    localStorage.setItem('porterful-playlists', JSON.stringify(playlists));
  }, [playlists]);

  const createPlaylist = () => {
    if (!newPlaylistName.trim()) return;
    const newPlaylist: Playlist = {
      id: `playlist-${Date.now()}`,
      name: newPlaylistName,
      description: newPlaylistDesc,
      tracks: [],
      createdAt: new Date().toISOString(),
      plays: 0,
      earnings: 0,
      isPublic: false,
    };
    setPlaylists([...playlists, newPlaylist]);
    setNewPlaylistName('');
    setNewPlaylistDesc('');
    setShowCreate(false);
    setActivePlaylist(newPlaylist);
  };

  const deletePlaylist = (id: string) => {
    setPlaylists(playlists.filter(p => p.id !== id));
    if (activePlaylist?.id === id) setActivePlaylist(null);
  };

  const addTrackToPlaylist = (track: typeof TRACKS[0]) => {
    if (!activePlaylist) return;
    const playlistTrack: PlaylistTrack = {
      id: track.id,
      title: track.title,
      artist: track.artist,
      album: track.album,
      duration: track.duration,
      image: track.image,
    };
    if (activePlaylist.tracks.find(t => t.id === track.id)) return; // Already in playlist
    const updated = {
      ...activePlaylist,
      tracks: [...activePlaylist.tracks, playlistTrack],
    };
    setActivePlaylist(updated);
    setPlaylists(playlists.map(p => p.id === updated.id ? updated : p));
    setShowTrackPicker(false);
  };

  const removeTrackFromPlaylist = (trackId: string) => {
    if (!activePlaylist) return;
    const updated = {
      ...activePlaylist,
      tracks: activePlaylist.tracks.filter(t => t.id !== trackId),
    };
    setActivePlaylist(updated);
    setPlaylists(playlists.map(p => p.id === updated.id ? updated : p));
  };

  const playPlaylist = (playlist: Playlist) => {
    if (playlist.tracks.length === 0) return;
    setQueue(playlist.tracks.map(t => ({
      ...t,
      duration: typeof t.duration === 'string' ? 180 : t.duration || 180,
    })));
    playTrack({
      ...playlist.tracks[0],
      duration: 180,
    } as any);
  };

  const getShareLink = (playlist: Playlist) => {
    return `${window.location.origin}/playlist/${playlist.id}`;
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="pf-container max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Playlists</h1>
            <p className="text-[var(--pf-text-secondary)]">Create playlists and earn when others listen</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="pf-btn pf-btn-primary">
            <Plus size={18} className="inline mr-2" />Create Playlist
          </button>
        </div>

        {/* Create Playlist Modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="pf-card p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Create Playlist</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input type="text" value={newPlaylistName} onChange={e => setNewPlaylistName(e.target.value)} placeholder="My Playlist" className="pf-input w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description (optional)</label>
                  <textarea value={newPlaylistDesc} onChange={e => setNewPlaylistDesc(e.target.value)} placeholder="What's this playlist about?" className="pf-input w-full h-20" />
                </div>
                <div className="flex gap-3">
                  <button onClick={createPlaylist} className="pf-btn pf-btn-primary flex-1">Create</button>
                  <button onClick={() => setShowCreate(false)} className="pf-btn pf-btn-secondary">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Track Picker Modal */}
        {showTrackPicker && activePlaylist && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="pf-card p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Add Tracks</h2>
                <button onClick={() => setShowTrackPicker(false)} className="text-[var(--pf-text-muted)] hover:text-white">✕</button>
              </div>
              <div className="space-y-2">
                {TRACKS.map(track => {
                  const inPlaylist = activePlaylist.tracks.find(t => t.id === track.id);
                  return (
                    <div key={track.id} className={`flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--pf-surface-hover)] ${inPlaylist ? 'bg-[var(--pf-orange)]/10' : ''}`}>
                      <div className="w-10 h-10 rounded overflow-hidden bg-[var(--pf-surface)]">
                        <img src={track.image} alt={track.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{track.title}</p>
                        <p className="text-sm text-[var(--pf-text-muted)]">{track.artist} • {track.album}</p>
                      </div>
                      <button onClick={() => addTrackToPlaylist(track)} disabled={!!inPlaylist} className={`pf-btn ${inPlaylist ? 'bg-[var(--pf-surface)] text-[var(--pf-text-muted)]' : 'pf-btn-primary'}`}>
                        {inPlaylist ? 'Added' : 'Add'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Share Modal */}
        {shareModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="pf-card p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Share Playlist</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Share Link</label>
                  <div className="flex gap-2">
                    <input type="text" value={getShareLink(shareModal)} readOnly className="pf-input flex-1" />
                    <button onClick={() => { navigator.clipboard.writeText(getShareLink(shareModal)); }} className="pf-btn pf-btn-secondary">
                      <Link2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="bg-[var(--pf-surface)] p-4 rounded-lg">
                  <p className="text-sm text-[var(--pf-text-muted)] mb-2">💰 Earnings Info</p>
                  <p className="text-sm">When others listen to your playlist, you earn:</p>
                  <ul className="text-sm text-[var(--pf-text-secondary)] mt-2 space-y-1">
                    <li>• 3% of each track purchase from your playlist</li>
                    <li>• Bonus for curating quality playlists</li>
                    <li>• Top playlists get featured placement</li>
                  </ul>
                </div>
                <button onClick={() => setShareModal(null)} className="pf-btn pf-btn-primary w-full">Done</button>
              </div>
            </div>
          </div>
        )}

        {/* Playlist List or Editor */}
        {activePlaylist ? (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => setActivePlaylist(null)} className="text-[var(--pf-text-muted)] hover:text-white">
                ← Back to playlists
              </button>
            </div>
            <div className="pf-card p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{activePlaylist.name}</h2>
                  <p className="text-[var(--pf-text-secondary)]">{activePlaylist.description || 'No description'}</p>
                  <p className="text-sm text-[var(--pf-text-muted)] mt-2">
                    {activePlaylist.tracks.length} tracks • {activePlaylist.plays} plays • ${activePlaylist.earnings.toFixed(2)} earned
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowTrackPicker(true)} className="pf-btn pf-btn-primary">
                    <Plus size={18} className="inline mr-2" />Add Tracks
                  </button>
                </div>
              </div>
              {activePlaylist.tracks.length === 0 ? (
                <div className="text-center py-12 text-[var(--pf-text-muted)]">
                  <p className="mb-4">No tracks yet</p>
                  <button onClick={() => setShowTrackPicker(true)} className="pf-btn pf-btn-secondary">Add your first track</button>
                </div>
              ) : (
                <div className="space-y-2">
                  {activePlaylist.tracks.map((track, i) => (
                    <div key={track.id} className={`flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--pf-surface-hover)] ${currentTrack?.id === track.id ? 'bg-[var(--pf-orange)]/10' : ''}`}>
                      <span className="w-6 text-center text-[var(--pf-text-muted)]">{i + 1}</span>
                      <div className="w-10 h-10 rounded overflow-hidden bg-[var(--pf-surface)]">
                        <img src={track.image} alt={track.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${currentTrack?.id === track.id ? 'text-[var(--pf-orange)]' : ''}`}>{track.title}</p>
                        <p className="text-sm text-[var(--pf-text-muted)]">{track.artist} • {track.album}</p>
                      </div>
                      <span className="text-sm text-[var(--pf-text-muted)]">{track.duration}</span>
                      <button onClick={() => removeTrackFromPlaylist(track.id)} className="p-2 text-[var(--pf-text-muted)] hover:text-red-400">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : playlists.length === 0 ? (
          <div className="pf-card p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-[var(--pf-surface)] mx-auto mb-4 flex items-center justify-center">
              <Play size={32} className="text-[var(--pf-text-muted)]" />
            </div>
            <h2 className="text-xl font-bold mb-2">Create Your First Playlist</h2>
            <p className="text-[var(--pf-text-secondary)] mb-6">Playlists you create can earn you money when others listen</p>
            <button onClick={() => setShowCreate(true)} className="pf-btn pf-btn-primary">
              <Plus size={18} className="inline mr-2" />Create Playlist
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {playlists.map(playlist => (
              <div key={playlist.id} className="pf-card p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold">{playlist.name}</h3>
                    <p className="text-sm text-[var(--pf-text-muted)]">{playlist.tracks.length} tracks</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setShareModal(playlist)} className="p-2 hover:bg-[var(--pf-surface)] rounded-lg">
                      <Share2 size={16} />
                    </button>
                    <button onClick={() => deletePlaylist(playlist.id)} className="p-2 hover:bg-[var(--pf-surface)] rounded-lg text-red-400">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-[var(--pf-text-muted)] mb-4">
                  <span className="flex items-center gap-1"><DollarSign size={14} />{playlist.earnings.toFixed(2)}</span>
                  <span className="flex items-center gap-1"><Users size={14} />{playlist.plays}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => playPlaylist(playlist)} disabled={playlist.tracks.length === 0} className="pf-btn pf-btn-primary flex-1">
                    <Play size={16} className="inline mr-1" />Play
                  </button>
                  <button onClick={() => setActivePlaylist(playlist)} className="pf-btn pf-btn-secondary flex-1">
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}