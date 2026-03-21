'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSupabase } from '@/app/providers';
import { useAudio } from '@/lib/audio-context';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, Shuffle, Repeat, DollarSign, X, Check } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  duration: number;
  audio_url: string;
  cover_url?: string;
  play_count: number;
}

// Demo tracks as fallback
const DEMO_TRACKS: Track[] = [
  { id: '1', title: 'Oddysee', artist: 'O D Porter', album: 'Ambiguous EP', duration: 222, audio_url: '', play_count: 12400 },
  { id: '2', title: 'Midnight Drive', artist: 'O D Porter', album: 'Ambiguous EP', duration: 255, audio_url: '', play_count: 8900 },
  { id: '3', title: 'Movement', artist: 'O D Porter', album: 'Ambiguous EP', duration: 238, audio_url: '', play_count: 15600 },
  { id: '4', title: 'Lost in Transit', artist: 'O D Porter', album: 'Ambiguous EP', duration: 201, audio_url: '', play_count: 6200 },
  { id: '5', title: 'Ambiguous', artist: 'O D Porter', album: 'Ambiguous EP', duration: 242, audio_url: '', play_count: 9800 },
];

export default function RadioPage() {
  const { supabase } = useSupabase();
  const { currentTrack, isPlaying, playTrack, togglePlay, playNext, playPrev, queue, setQueue, currentIndex } = useAudio();
  const [tracks, setTracks] = useState<Track[]>(DEMO_TRACKS);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState<string[]>([]);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [tipModal, setTipModal] = useState<{ show: boolean; artistId: string; artistName: string } | null>(null);
  const [tipAmount, setTipAmount] = useState(5);
  const [tipSent, setTipSent] = useState(false);

  // Load real tracks from Supabase
  useEffect(() => {
    async function loadTracks() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('tracks')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (data && data.length > 0) {
          const formattedTracks = data.map((t: any) => ({
            ...t,
            duration: t.duration || 180,
          }));
          setTracks(formattedTracks);
          setQueue(formattedTracks);
        }
      } catch (err) {
        console.error('Failed to load tracks:', err);
      } finally {
        setLoading(false);
      }
    }
    
    loadTracks();
  }, [supabase, setQueue]);

  const toggleLike = (trackId: string) => {
    setLiked(prev => prev.includes(trackId) ? prev.filter(id => id !== trackId) : [...prev, trackId]);
  };

  const handleTip = () => {
    if (tipModal) {
      setTipSent(true);
      setTimeout(() => {
        setTipModal(null);
        setTipSent(false);
      }, 2000);
    }
  };

  // Format duration
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen pt-24 pb-32">
      <div className="pf-container">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Radio</h1>
            <p className="text-[var(--pf-text-secondary)]">
              Stream music from independent artists
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShuffle(!shuffle)}
              className={`p-2 rounded-lg transition-colors ${shuffle ? 'bg-[var(--pf-orange)] text-white' : 'text-[var(--pf-text-muted)] hover:text-white'}`}
              title="Shuffle"
            >
              <Shuffle size={20} />
            </button>
            <button
              onClick={() => setRepeat(!repeat)}
              className={`p-2 rounded-lg transition-colors ${repeat ? 'bg-[var(--pf-orange)] text-white' : 'text-[var(--pf-text-muted)] hover:text-white'}`}
              title="Repeat"
            >
              <Repeat size={20} />
            </button>
          </div>
        </div>

        {/* Now Playing */}
        {currentTrack && (
          <div className="pf-card p-6 mb-8 bg-gradient-to-r from-[var(--pf-orange)]/10 to-purple-500/10">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-[var(--pf-surface)] flex items-center justify-center">
                {currentTrack.cover_url ? (
                  <img src={currentTrack.cover_url} alt={currentTrack.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">🎵</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--pf-text-muted)] mb-1">NOW PLAYING</p>
                <p className="text-xl font-bold truncate">{currentTrack.title}</p>
                <p className="text-[var(--pf-text-secondary)]">{currentTrack.artist}</p>
              </div>
              <button onClick={() => setTipModal({ show: true, artistId: 'od-porter', artistName: currentTrack.artist })} className="pf-btn pf-btn-secondary flex items-center gap-2">
                <DollarSign size={18} />
                Tip Artist
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-[var(--pf-text-muted)]">Loading tracks...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && tracks.length === 0 && (
          <div className="pf-card p-12 text-center">
            <h3 className="text-xl font-bold mb-2">No Tracks Yet</h3>
            <p className="text-[var(--pf-text-secondary)] mb-4">Upload your first track to get started!</p>
            <Link href="/dashboard/upload" className="pf-btn pf-btn-primary">Upload Your Music</Link>
          </div>
        )}

        {/* Tracks List */}
        {!loading && tracks.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-4">{tracks.some(t => t.audio_url) ? 'Your Tracks' : 'Featured Tracks'}</h2>
            <div className="pf-card overflow-hidden">
              <div className="divide-y divide-[var(--pf-border)]">
                {tracks.map((track, i) => (
                  <div key={track.id} className={`flex items-center gap-4 p-4 hover:bg-[var(--pf-surface-hover)] transition-colors group ${currentTrack?.id === track.id ? 'bg-[var(--pf-orange)]/5' : ''}`}>
                    <span className="w-8 text-center text-[var(--pf-text-muted)] font-bold">{i + 1}</span>
                    
                    <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-[var(--pf-surface)] flex items-center justify-center">
                      {track.cover_url ? (
                        <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">🎵</span>
                      )}
                    </div>
                    
                    <button onClick={() => playTrack(track)} className="w-10 h-10 rounded-full bg-[var(--pf-surface)] flex items-center justify-center group-hover:bg-[var(--pf-orange)] transition-colors shrink-0" title={currentTrack?.id === track.id && isPlaying ? 'Pause' : 'Play'}>
                      {currentTrack?.id === track.id && isPlaying ? (
                        <Pause size={16} className="text-white" />
                      ) : (
                        <Play size={16} className="text-white ml-0.5" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold truncate ${currentTrack?.id === track.id ? 'text-[var(--pf-orange)]' : ''}`}>{track.title}</p>
                      <p className="text-sm text-[var(--pf-text-muted)]">{track.artist}{track.album ? ` • ${track.album}` : ''}</p>
                    </div>

                    <span className="text-sm text-[var(--pf-text-muted)] hidden sm:block">{(track.play_count / 1000).toFixed(0)}K plays</span>
                    <span className="text-sm text-[var(--pf-text-muted)]">{formatDuration(track.duration)}</span>
                    <span className="font-bold text-[var(--pf-orange)]">$5+</span>

                    <button onClick={() => toggleLike(track.id)} className={`p-2 rounded-lg transition-colors ${liked.includes(track.id) ? 'text-red-500' : 'text-[var(--pf-text-muted)] hover:text-white'}`} title="Like">
                      <Heart size={18} fill={liked.includes(track.id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Support CTA */}
        <section className="mt-12">
          <div className="pf-card p-8 text-center">
            <h3 className="text-xl font-bold mb-2">Want Your Music Here?</h3>
            <p className="text-[var(--pf-text-secondary)] mb-4">Upload your tracks and reach fans directly. Keep 80% of every sale.</p>
            <Link href="/signup?role=artist" className="pf-btn pf-btn-primary">Upload Your Music</Link>
          </div>
        </section>
      </div>

      {/* Tip Modal */}
      {tipModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--pf-surface)] rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Tip {tipModal.artistName}</h3>
              <button onClick={() => setTipModal(null)} className="p-2 rounded-lg hover:bg-[var(--pf-bg)]"><X size={20} /></button>
            </div>

            {tipSent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4"><Check size={32} className="text-green-500" /></div>
                <p className="text-lg font-semibold">Tip Sent!</p>
                <p className="text-[var(--pf-text-secondary)]">Thank you for supporting {tipModal.artistName}</p>
              </div>
            ) : (
              <>
                <p className="text-[var(--pf-text-secondary)] mb-6">Support the artist directly. 100% of tips go to them.</p>
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {[1, 5, 10, 20].map((amount) => (
                    <button key={amount} onClick={() => setTipAmount(amount)} className={`py-3 rounded-lg font-bold transition-colors ${tipAmount === amount ? 'bg-[var(--pf-orange)] text-white' : 'bg-[var(--pf-bg)] hover:bg-[var(--pf-orange)]/20'}`}>${amount}</button>
                  ))}
                </div>
                <div className="mb-6">
                  <label className="block text-sm text-[var(--pf-text-muted)] mb-2">Or enter custom amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--pf-text-muted)]">$</span>
                    <input type="number" min="1" value={tipAmount} onChange={(e) => setTipAmount(Math.max(1, parseInt(e.target.value) || 1))} className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg py-3 pl-8 pr-4 focus:border-[var(--pf-orange)] focus:outline-none" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setTipModal(null)} className="flex-1 pf-btn pf-btn-secondary">Cancel</button>
                  <button onClick={handleTip} className="flex-1 pf-btn pf-btn-primary flex items-center justify-center gap-2"><DollarSign size={18} />Send ${tipAmount} Tip</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}