'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSupabase } from '@/app/providers';
import { Play, Pause, Heart, Star } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  duration: string;
  price: number;
  audio_url: string;
  cover_url?: string;
  plays: number;
}

// Demo tracks as fallback
const DEMO_TRACKS: Track[] = [
  { id: '1', title: 'Oddysee', artist: 'O D Porter', album: 'Ambiguous EP', duration: '3:42', price: 5, audio_url: '', plays: 12400 },
  { id: '2', title: 'Midnight Drive', artist: 'O D Porter', album: 'Ambiguous EP', duration: '4:15', price: 5, audio_url: '', plays: 8900 },
  { id: '3', title: 'Movement', artist: 'O D Porter', album: 'Ambiguous EP', duration: '3:58', price: 5, audio_url: '', plays: 15600 },
  { id: '4', title: 'Lost in Transit', artist: 'O D Porter', album: 'Ambiguous EP', duration: '3:21', price: 5, audio_url: '', plays: 6200 },
  { id: '5', title: 'Ambiguous', artist: 'O D Porter', album: 'Ambiguous EP', duration: '4:02', price: 5, audio_url: '', plays: 9800 },
];

export default function DigitalPage() {
  const { supabase } = useSupabase();
  const [tracks, setTracks] = useState<Track[]>(DEMO_TRACKS);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState<string | null>(null);
  const [liked, setLiked] = useState<string[]>([]);

  const artist = { name: 'O D Porter', bio: 'Independent artist from New Orleans', location: 'New Orleans, LA' };
  const album = { title: 'Ambiguous', type: 'EP', year: '2026', tracks: 5, price: 5 };

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
          setTracks(data as Track[]);
        }
      } catch (err) {
        console.error('Failed to load tracks:', err);
      } finally {
        setLoading(false);
      }
    }
    
    loadTracks();
  }, [supabase]);

  const togglePlay = (trackId: string) => {
    setPlaying(playing === trackId ? null : trackId);
  };

  const toggleLike = (trackId: string) => {
    setLiked(prev => prev.includes(trackId) ? prev.filter(id => id !== trackId) : [...prev, trackId]);
  };

  return (
    <div className="min-h-screen bg-[var(--pf-bg)]">
      {/* Hero */}
      <section className="py-12 md:py-20">
        <div className="pf-container">
          <div className="max-w-4xl mx-auto">
            <Link href="/" className="text-[var(--pf-text-muted)] hover:text-white transition-colors mb-6 inline-block">
              ← Back to home
            </Link>

            <div className="grid md:grid-cols-[300px_1fr] gap-8 md:gap-12">
              {/* Cover */}
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl shadow-[var(--pf-orange)]/20 bg-[var(--pf-surface)] flex items-center justify-center">
                {tracks[0]?.cover_url ? (
                  <img src={tracks[0].cover_url} alt={album.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[var(--pf-orange)]/30 to-purple-600/30 flex items-center justify-center">
                    <span className="text-8xl">💿</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col justify-center">
                <span className="text-sm text-[var(--pf-orange)] font-medium mb-2">
                  {album.type} • {album.year}
                </span>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">{tracks[0]?.album || album.title}</h1>
                <p className="text-xl text-[var(--pf-text-secondary)] mb-2">{artist.name}</p>
                <p className="text-[var(--pf-text-muted)] mb-6">
                  {tracks.length} tracks • {tracks.reduce((sum, t) => sum + (typeof t.play_count === 'number' ? t.play_count : parseInt(t.play_count as any) || 0), 0).toLocaleString()} total plays
                </p>

                <div className="mb-8">
                  <span className="text-4xl font-bold">${album.price}</span>
                  <span className="text-[var(--pf-text-muted)] ml-2">minimum • pay what you want</span>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button className="pf-btn pf-btn-primary">
                    <Play className="inline mr-2" size={18} />
                    Play All
                  </button>
                  <button className="pf-btn pf-btn-secondary">
                    <Heart className="inline mr-2" size={18} />
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tracklist */}
      <section className="py-12 bg-[var(--pf-bg-secondary)]">
        <div className="pf-container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold mb-6">Tracklist</h2>

            {loading && (
              <div className="text-center py-12">
                <p className="text-[var(--pf-text-muted)]">Loading tracks...</p>
              </div>
            )}

            {!loading && tracks.length === 0 && (
              <div className="pf-card p-12 text-center">
                <h3 className="text-xl font-bold mb-2">No Tracks Yet</h3>
                <p className="text-[var(--pf-text-secondary)] mb-4">Upload your first track to get started!</p>
                <Link href="/dashboard/upload" className="pf-btn pf-btn-primary">Upload Music</Link>
              </div>
            )}

            {!loading && tracks.length > 0 && (
              <div className="pf-card overflow-hidden">
                <div className="divide-y divide-[var(--pf-border)]">
                  {tracks.map((track, i) => (
                    <div key={track.id} className={`flex items-center gap-4 p-4 hover:bg-[var(--pf-surface-hover)] transition-colors ${playing === track.id ? 'bg-[var(--pf-orange)]/5' : ''}`}>
                      <span className="w-8 text-center text-[var(--pf-text-muted)] font-bold">{i + 1}</span>
                      
                      <button onClick={() => togglePlay(track.id)} className="w-10 h-10 rounded-full bg-[var(--pf-surface)] flex items-center justify-center hover:bg-[var(--pf-orange)] transition-colors">
                        {playing === track.id ? <Pause size={16} className="text-white" /> : <Play size={16} className="text-white ml-0.5" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold truncate ${playing === track.id ? 'text-[var(--pf-orange)]' : ''}`}>{track.title}</p>
                        <p className="text-sm text-[var(--pf-text-muted)]">{track.artist}</p>
                      </div>

                      <span className="text-sm text-[var(--pf-text-muted)] hidden sm:block">{(track.play_count / 1000).toFixed(0)}K plays</span>
                      <span className="text-sm text-[var(--pf-text-muted)]">{track.duration}</span>
                      
                      <button onClick={() => toggleLike(track.id)} className={`p-2 rounded-lg transition-colors ${liked.includes(track.id) ? 'text-red-500' : 'text-[var(--pf-text-muted)] hover:text-white'}`}>
                        <Heart size={18} fill={liked.includes(track.id) ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Artist */}
      <section className="py-12">
        <div className="pf-container">
          <div className="max-w-4xl mx-auto">
            <div className="pf-card p-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--pf-orange)] to-purple-600 flex items-center justify-center text-3xl">
                  🎤
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1">{artist.name}</h3>
                  <p className="text-[var(--pf-text-muted)]">{artist.location}</p>
                </div>
                <div className="ml-auto">
                  <Link href="/artist/od-porter" className="pf-btn pf-btn-secondary">View Profile</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proud to Pay */}
      <section className="py-12 bg-[var(--pf-bg-secondary)]">
        <div className="pf-container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-sm font-medium mb-6">
              <Star size={14} />
              PROUD TO PAY
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">80% Goes to the Artist</h2>
            <p className="text-xl text-[var(--pf-text-secondary)] mb-8 max-w-2xl mx-auto">
              When you buy music here, the artist keeps the majority. No label, no middlemen. Just direct support.
            </p>
            <div className="flex justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-[var(--pf-orange)]">80%</div>
                <div className="text-sm text-[var(--pf-text-muted)]">To Artist</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[var(--pf-text-secondary)]">20%</div>
                <div className="text-sm text-[var(--pf-text-muted)]">Platform Fee</div>
              </div>
            </div>
            <Link href="/support" className="pf-btn pf-btn-primary">Find Artists to Support</Link>
          </div>
        </div>
      </section>
    </div>
  );
}