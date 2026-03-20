'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, Shuffle, Repeat, DollarSign, X, Check } from 'lucide-react';
import { TRACKS, ARTISTS } from '@/lib/data';

export default function RadioPage() {
  const [playing, setPlaying] = useState<string | null>(null);
  const [liked, setLiked] = useState<string[]>([]);
  const [volume, setVolume] = useState(80);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tipModal, setTipModal] = useState<{ show: boolean; artistId: string; artistName: string } | null>(null);
  const [tipAmount, setTipAmount] = useState(5);
  const [tipSent, setTipSent] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const artist = ARTISTS[0];

  const currentTrack = TRACKS.find(t => t.id === playing);

  // Simulate playback progress
  useEffect(() => {
    if (playing) {
      progressInterval.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            // Auto-play next track
            const currentIndex = TRACKS.findIndex(t => t.id === playing);
            if (shuffle) {
              const randomIndex = Math.floor(Math.random() * TRACKS.length);
              setPlaying(TRACKS[randomIndex].id);
            } else if (repeat || currentIndex < TRACKS.length - 1) {
              const nextIndex = repeat ? 0 : currentIndex + 1;
              setPlaying(TRACKS[nextIndex].id);
            } else {
              setPlaying(null);
            }
            return 0;
          }
          return prev + 0.5;
        });
      }, 1000);
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      setProgress(0);
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [playing, shuffle, repeat]);

  const togglePlay = (trackId: string) => {
    if (playing === trackId) {
      setPlaying(null);
    } else {
      setPlaying(trackId);
      setProgress(0);
    }
  };

  const toggleLike = (trackId: string) => {
    setLiked(prev => 
      prev.includes(trackId) 
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    );
  };

  const playNext = useCallback(() => {
    if (!playing) return;
    const currentIndex = TRACKS.findIndex(t => t.id === playing);
    if (shuffle) {
      const randomIndex = Math.floor(Math.random() * TRACKS.length);
      setPlaying(TRACKS[randomIndex].id);
    } else {
      const nextIndex = (currentIndex + 1) % TRACKS.length;
      setPlaying(TRACKS[nextIndex].id);
    }
    setProgress(0);
  }, [playing, shuffle]);

  const playPrev = useCallback(() => {
    if (!playing) return;
    const currentIndex = TRACKS.findIndex(t => t.id === playing);
    const prevIndex = (currentIndex - 1 + TRACKS.length) % TRACKS.length;
    setPlaying(TRACKS[prevIndex].id);
    setProgress(0);
  }, [playing]);

  const handleTip = () => {
    if (tipModal) {
      // Simulate sending tip
      setTipSent(true);
      setTimeout(() => {
        setTipModal(null);
        setTipSent(false);
      }, 2000);
    }
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
              className={`p-2 rounded-lg transition-colors ${
                shuffle ? 'bg-[var(--pf-orange)] text-white' : 'text-[var(--pf-text-muted)] hover:text-white'
              }`}
              title="Shuffle"
            >
              <Shuffle size={20} />
            </button>
            <button
              onClick={() => setRepeat(!repeat)}
              className={`p-2 rounded-lg transition-colors ${
                repeat ? 'bg-[var(--pf-orange)] text-white' : 'text-[var(--pf-text-muted)] hover:text-white'
              }`}
              title="Repeat"
            >
              <Repeat size={20} />
            </button>
          </div>
        </div>

        {/* Now Playing - Full View */}
        {playing && currentTrack && (
          <div className="pf-card p-6 mb-8 bg-gradient-to-r from-[var(--pf-orange)]/10 to-purple-500/10">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                <img 
                  src={currentTrack.image}
                  alt="Now playing"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--pf-text-muted)] mb-1">NOW PLAYING</p>
                <p className="text-xl font-bold truncate">{currentTrack.title}</p>
                <p className="text-[var(--pf-text-secondary)]">{currentTrack.artist}</p>
              </div>
              
              {/* Controls */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={playPrev}
                  className="p-2 rounded-full hover:bg-[var(--pf-surface)]"
                  title="Previous"
                >
                  <SkipBack size={24} />
                </button>
                <button 
                  onClick={() => togglePlay(playing)}
                  className="w-14 h-14 rounded-full bg-[var(--pf-orange)] flex items-center justify-center"
                  title={playing ? "Pause" : "Play"}
                >
                  <Pause size={24} className="text-white" />
                </button>
                <button 
                  onClick={playNext}
                  className="p-2 rounded-full hover:bg-[var(--pf-surface)]"
                  title="Next"
                >
                  <SkipForward size={24} />
                </button>
              </div>

              {/* Tip Button */}
              <button 
                onClick={() => setTipModal({ show: true, artistId: 'od-porter', artistName: currentTrack.artist })}
                className="pf-btn pf-btn-secondary flex items-center gap-2"
              >
                <DollarSign size={18} />
                Tip Artist
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="h-1 bg-[var(--pf-surface)] rounded-full overflow-hidden cursor-pointer">
                <div 
                  className="h-full bg-[var(--pf-orange)] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-[var(--pf-text-muted)] mt-1">
                <span>{Math.floor(progress * 0.3)}:{String(Math.floor((progress * 0.3 * 60) % 60)).padStart(2, '0')}</span>
                <span>{currentTrack.duration}</span>
              </div>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-4 mt-4">
              <button
                onClick={() => setVolume(volume === 0 ? 80 : 0)}
                className="text-[var(--pf-text-muted)] hover:text-white"
              >
                {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="flex-1 h-1 bg-[var(--pf-surface)] rounded-full appearance-none cursor-pointer"
              />
              <span className="text-sm text-[var(--pf-text-muted)]">{volume}%</span>
            </div>
          </div>
        )}

        {/* Featured Station */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Featured Station</h2>
          <div className="pf-card p-8 bg-gradient-to-r from-[var(--pf-orange)]/20 to-purple-600/20">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-32 h-32 rounded-2xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300"
                  alt="Ambiguous Radio"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold mb-2">Ambiguous Radio</h3>
                <p className="text-[var(--pf-text-secondary)] mb-4">
                  The complete collection from O D Porter. All 5 tracks from the Ambiguous EP.
                </p>
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <button 
                    onClick={() => setPlaying(TRACKS[0].id)}
                    className="pf-btn pf-btn-primary"
                  >
                    <Play className="inline mr-2" size={18} />
                    Play All
                  </button>
                  <Link href="/digital" className="pf-btn pf-btn-secondary">
                    View Album
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* All Tracks */}
        <section>
          <h2 className="text-xl font-bold mb-4">All Tracks</h2>
          <div className="pf-card overflow-hidden">
            <div className="divide-y divide-[var(--pf-border)]">
              {TRACKS.map((track, i) => (
                <div 
                  key={track.id}
                  className={`flex items-center gap-4 p-4 hover:bg-[var(--pf-surface-hover)] transition-colors group ${
                    playing === track.id ? 'bg-[var(--pf-orange)]/5' : ''
                  }`}
                >
                  <span className="w-8 text-center text-[var(--pf-text-muted)] font-bold">{i + 1}</span>
                  
                  <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0">
                    <img 
                      src={track.image}
                      alt={track.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <button 
                    onClick={() => togglePlay(track.id)}
                    className="w-10 h-10 rounded-full bg-[var(--pf-surface)] flex items-center justify-center group-hover:bg-[var(--pf-orange)] transition-colors shrink-0"
                    title={playing === track.id ? "Pause" : "Play"}
                  >
                    {playing === track.id ? (
                      <Pause size={16} className="text-white" />
                    ) : (
                      <Play size={16} className="text-white ml-0.5" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold truncate ${playing === track.id ? 'text-[var(--pf-orange)]' : ''}`}>
                      {track.title}
                    </p>
                    <p className="text-sm text-[var(--pf-text-muted)]">{track.artist} • {track.album}</p>
                  </div>

                  <span className="text-sm text-[var(--pf-text-muted)] hidden sm:block">
                    {(track.plays / 1000).toFixed(0)}K plays
                  </span>
                  
                  <span className="text-sm text-[var(--pf-text-muted)]">{track.duration}</span>
                  
                  <span className="font-bold">${track.price}+</span>

                  <button 
                    onClick={() => toggleLike(track.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      liked.includes(track.id) 
                        ? 'text-red-500' 
                        : 'text-[var(--pf-text-muted)] hover:text-white'
                    }`}
                    title="Like"
                  >
                    <Heart size={18} fill={liked.includes(track.id) ? 'currentColor' : 'none'} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Support CTA */}
        <section className="mt-12">
          <div className="pf-card p-8 text-center">
            <h3 className="text-xl font-bold mb-2">Want Your Music Here?</h3>
            <p className="text-[var(--pf-text-secondary)] mb-4">
              Upload your tracks and reach fans directly. Keep 80% of every sale.
            </p>
            <Link href="/signup?role=artist" className="pf-btn pf-btn-primary">
              Upload Your Music
            </Link>
          </div>
        </section>
      </div>

      {/* Tip Modal */}
      {tipModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--pf-surface)] rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Tip {tipModal.artistName}</h3>
              <button 
                onClick={() => setTipModal(null)}
                className="p-2 rounded-lg hover:bg-[var(--pf-bg)]"
              >
                <X size={20} />
              </button>
            </div>

            {tipSent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <Check size={32} className="text-green-500" />
                </div>
                <p className="text-lg font-semibold">Tip Sent!</p>
                <p className="text-[var(--pf-text-secondary)]">Thank you for supporting {tipModal.artistName}</p>
              </div>
            ) : (
              <>
                <p className="text-[var(--pf-text-secondary)] mb-6">
                  Support the artist directly. 100% of tips go to them.
                </p>

                {/* Preset Amounts */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {[1, 5, 10, 20].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setTipAmount(amount)}
                      className={`py-3 rounded-lg font-bold transition-colors ${
                        tipAmount === amount
                          ? 'bg-[var(--pf-orange)] text-white'
                          : 'bg-[var(--pf-bg)] hover:bg-[var(--pf-orange)]/20'
                      }`}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>

                {/* Custom Amount */}
                <div className="mb-6">
                  <label className="block text-sm text-[var(--pf-text-muted)] mb-2">Or enter custom amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--pf-text-muted)]">$</span>
                    <input
                      type="number"
                      min="1"
                      value={tipAmount}
                      onChange={(e) => setTipAmount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg py-3 pl-8 pr-4 focus:border-[var(--pf-orange)] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setTipModal(null)}
                    className="flex-1 pf-btn pf-btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTip}
                    className="flex-1 pf-btn pf-btn-primary flex items-center justify-center gap-2"
                  >
                    <DollarSign size={18} />
                    Send ${tipAmount} Tip
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Mini Player - Shows when scrolled or minimized */}
      {playing && currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--pf-bg)] border-t border-[var(--pf-border)] shadow-lg">
          <div className="pf-container py-3">
            <div className="flex items-center gap-4">
              {/* Track Info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                  <img 
                    src={currentTrack.image}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{currentTrack.title}</p>
                  <p className="text-sm text-[var(--pf-text-muted)] truncate">{currentTrack.artist}</p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={playPrev}
                  className="p-2 rounded-full hover:bg-[var(--pf-surface)]"
                  title="Previous"
                >
                  <SkipBack size={18} />
                </button>
                <button 
                  onClick={() => togglePlay(playing)}
                  className="w-10 h-10 rounded-full bg-[var(--pf-orange)] flex items-center justify-center"
                  title="Pause"
                >
                  <Pause size={18} className="text-white" />
                </button>
                <button 
                  onClick={playNext}
                  className="p-2 rounded-full hover:bg-[var(--pf-surface)]"
                  title="Next"
                >
                  <SkipForward size={18} />
                </button>
              </div>

              {/* Progress (hidden on mobile) */}
              <div className="hidden md:flex items-center gap-4 flex-1 max-w-xs">
                <div className="flex-1 h-1 bg-[var(--pf-surface)] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[var(--pf-orange)] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs text-[var(--pf-text-muted)]">{currentTrack.duration}</span>
              </div>

              {/* Tip Button */}
              <button 
                onClick={() => setTipModal({ show: true, artistId: 'od-porter', artistName: currentTrack.artist })}
                className="hidden sm:flex pf-btn pf-btn-secondary text-sm"
              >
                <DollarSign size={16} className="mr-1" />
                Tip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}