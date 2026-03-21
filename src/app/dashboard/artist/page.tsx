'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSupabase } from '@/app/providers';
import { useRouter } from 'next/navigation';
import { Music, Package, DollarSign, Users, Upload, Settings, ChevronRight, Headphones, Mic2, Star, Search, Play, Pause, Trash2, Edit } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  duration: string;
  price: number;
  file_url: string;
  art_url?: string;
  plays: number;
  created_at: string;
}

export default function ArtistDashboardPage() {
  const { user, supabase } = useSupabase()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<{
    name: string
    email: string
    role: string
  } | null>(null)
  const [tracks, setTracks] = useState<Track[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [playing, setPlaying] = useState<string | null>(null)

  useEffect(() => {
    if (supabase && user) {
      loadProfile()
      loadTracks()
    } else {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, user])

  async function loadProfile() {
    try {
      const { data } = await supabase!
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single()

      if (data?.role !== 'artist') {
        router.push('/dashboard')
        return
      }

      setProfile({
        name: data.full_name || data.username || 'Artist',
        email: data.email || user!.email || '',
        role: data.role
      })
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadTracks() {
    if (!supabase || !user) return
    
    try {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('artist_id', user.id)
        .order('created_at', { ascending: false })
      
      if (data) {
        setTracks(data as Track[])
      }
    } catch (error) {
      console.error('Error loading tracks:', error)
    }
  }

  async function deleteTrack(trackId: string) {
    if (!supabase || !user) return
    
    if (!confirm('Are you sure you want to delete this track?')) return
    
    try {
      // Delete from storage
      const track = tracks.find(t => t.id === trackId)
      if (track?.file_url) {
        // Extract file path from URL
        const url = new URL(track.file_url)
        const pathParts = url.pathname.split('/')
        const bucketIndex = pathParts.findIndex(p => p === 'storage' || p === 'object')
        if (bucketIndex !== -1 && pathParts.length > bucketIndex + 3) {
          const filePath = pathParts.slice(bucketIndex + 3).join('/')
          await supabase.storage.from('music').remove([filePath])
        }
      }
      
      // Delete from database
      await supabase.from('tracks').delete().eq('id', trackId)
      
      // Refresh tracks
      loadTracks()
    } catch (error) {
      console.error('Error deleting track:', error)
    }
  }

  const filteredTracks = tracks.filter(track => 
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (track.album && track.album.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const stats = {
    totalEarnings: 0,
    tracks: tracks.length,
    totalPlays: tracks.reduce((sum, t) => sum + (t.plays || 0), 0),
    supporters: 0
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="pf-container">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-[var(--pf-surface)] rounded w-1/4" />
            <div className="h-32 bg-[var(--pf-surface)] rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="pf-container">
          <div className="pf-card p-12 text-center">
            <Mic2 size={48} className="mx-auto mb-4 text-purple-400" />
            <h1 className="text-2xl font-bold mb-4">Artist Dashboard</h1>
            <p className="text-[var(--pf-text-secondary)] mb-6">
              Sign in to manage your music, merch, and earnings.
            </p>
            <Link href="/login" className="pf-btn pf-btn-primary">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="pf-container">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--pf-orange)] to-purple-600 flex items-center justify-center text-2xl">
              🎤
            </div>
            <div>
              <h1 className="text-2xl font-bold">Welcome, {profile?.name || 'Artist'}</h1>
              <p className="text-[var(--pf-text-secondary)]">Your artist dashboard</p>
            </div>
          </div>
          <Link href="/dashboard/upload" className="pf-btn pf-btn-primary">
            <Upload className="inline mr-2" size={18} />
            Upload Music
          </Link>
        </div>

        {/* Upload CTA (only show if no tracks) */}
        {tracks.length === 0 && (
          <div className="pf-card p-8 mb-8 text-center bg-gradient-to-r from-purple-500/10 to-[var(--pf-orange)]/10 border border-purple-500/30">
            <Music size={48} className="mx-auto mb-4 text-purple-400" />
            <h2 className="text-2xl font-bold mb-2">Upload Your First Track</h2>
            <p className="text-[var(--pf-text-secondary)] mb-6 max-w-md mx-auto">
              Start earning from your music. Set your price, upload your tracks, and let fans support you directly. Keep 80% of every sale.
            </p>
            <Link href="/dashboard/upload" className="pf-btn pf-btn-primary text-lg px-8 py-4 inline-flex items-center gap-2">
              <Upload size={20} />
              Upload Music
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="pf-card p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[var(--pf-text-muted)]">Total Earnings</span>
              <DollarSign className="text-green-400" size={20} />
            </div>
            <p className="text-3xl font-bold">${stats.totalEarnings.toFixed(2)}</p>
            <p className="text-sm text-[var(--pf-text-muted)] mt-1">Lifetime earnings</p>
          </div>

          <div className="pf-card p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[var(--pf-text-muted)]">Tracks</span>
              <Music className="text-purple-400" size={20} />
            </div>
            <p className="text-3xl font-bold">{stats.tracks}</p>
            <p className="text-sm text-[var(--pf-text-muted)] mt-1">Uploaded tracks</p>
          </div>

          <div className="pf-card p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[var(--pf-text-muted)]">Total Plays</span>
              <Headphones className="text-blue-400" size={20} />
            </div>
            <p className="text-3xl font-bold">{(stats.totalPlays / 1000).toFixed(1)}K</p>
            <p className="text-sm text-[var(--pf-text-muted)] mt-1">All-time plays</p>
          </div>

          <div className="pf-card p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[var(--pf-text-muted)]">Supporters</span>
              <Users className="text-[var(--pf-orange)]" size={20} />
            </div>
            <p className="text-3xl font-bold">{stats.supporters}</p>
            <p className="text-sm text-[var(--pf-text-muted)] mt-1">Total supporters</p>
          </div>
        </div>

        {/* Your Tracks */}
        <div className="pf-card mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-b border-[var(--pf-border)]">
            <h2 className="font-semibold text-lg">Your Tracks ({tracks.length})</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--pf-text-muted)]" size={18} />
              <input
                type="text"
                placeholder="Search your tracks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg focus:border-[var(--pf-orange)] focus:outline-none w-full sm:w-64"
              />
            </div>
          </div>

          {tracks.length === 0 ? (
            <div className="p-8 text-center text-[var(--pf-text-muted)]">
              <Headphones size={32} className="mx-auto mb-2 opacity-50" />
              <p>No tracks uploaded yet</p>
              <p className="text-sm mt-1">Upload your first track to get started</p>
            </div>
          ) : filteredTracks.length === 0 ? (
            <div className="p-8 text-center text-[var(--pf-text-muted)]">
              <Search size={32} className="mx-auto mb-2 opacity-50" />
              <p>No tracks found for "{searchQuery}"</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--pf-border)]">
              {filteredTracks.map((track) => (
                <div key={track.id} className={`flex items-center gap-4 p-4 hover:bg-[var(--pf-surface-hover)] transition-colors ${playing === track.id ? 'bg-[var(--pf-orange)]/5' : ''}`}>
                  {/* Art */}
                  <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-[var(--pf-surface)] flex items-center justify-center">
                    {track.art_url ? (
                      <img src={track.art_url} alt={track.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">🎵</span>
                    )}
                  </div>

                  {/* Play Button */}
                  <button
                    onClick={() => setPlaying(playing === track.id ? null : track.id)}
                    className="w-10 h-10 rounded-full bg-[var(--pf-surface)] flex items-center justify-center hover:bg-[var(--pf-orange)] transition-colors shrink-0"
                    title={playing === track.id ? 'Pause' : 'Play'}
                  >
                    {playing === track.id ? (
                      <Pause size={16} className="text-white" />
                    ) : (
                      <Play size={16} className="text-white ml-0.5" />
                    )}
                  </button>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold truncate ${playing === track.id ? 'text-[var(--pf-orange)]' : ''}`}>
                      {track.title}
                    </p>
                    <p className="text-sm text-[var(--pf-text-muted)]">
                      {track.album || 'Single'} • {track.duration || '0:00'}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="hidden sm:block text-right">
                    <p className="font-bold">${track.price}</p>
                    <p className="text-sm text-[var(--pf-text-muted)]">{(track.plays || 0).toLocaleString()} plays</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/upload?edit=${track.id}`}
                      className="p-2 rounded-lg hover:bg-[var(--pf-surface)] transition-colors"
                      title="Edit"
                    >
                      <Edit size={16} className="text-[var(--pf-text-muted)]" />
                    </Link>
                    <button
                      onClick={() => deleteTrack(track.id)}
                      className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} className="text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-2 gap-4">
          <Link href="/dashboard/upload" className="pf-card p-6 hover:border-purple-500/50 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                <Music className="text-purple-400" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold group-hover:text-[var(--pf-orange)] transition-colors">Upload Music</h3>
                <p className="text-sm text-[var(--pf-text-muted)]">Add tracks, set prices, earn 80%</p>
              </div>
              <ChevronRight className="text-[var(--pf-text-muted)]" size={20} />
            </div>
          </Link>

          <Link href="/dashboard/add-product" className="pf-card p-6 hover:border-[var(--pf-orange)]/50 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--pf-orange)]/20 flex items-center justify-center shrink-0">
                <Package className="text-[var(--pf-orange)]" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold group-hover:text-[var(--pf-orange)] transition-colors">Add Merch</h3>
                <p className="text-sm text-[var(--pf-text-muted)]">Sell products, reach fans</p>
              </div>
              <ChevronRight className="text-[var(--pf-text-muted)]" size={20} />
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 pf-card">
          <div className="p-4 border-b border-[var(--pf-border)]">
            <h2 className="font-semibold">Recent Activity</h2>
          </div>
          <div className="p-8 text-center text-[var(--pf-text-muted)]">
            <Star size={32} className="mx-auto mb-2 opacity-50" />
            <p>No activity yet</p>
            <p className="text-sm mt-1">Activity will appear here when you have sales or supporters</p>
          </div>
        </div>
      </div>
    </div>
  )
}