'use client';
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image';
import Link from 'next/link';
import { Play, Pause, SkipForward, Headphones, Lock, CreditCard } from 'lucide-react';
import { useAudio } from '@/lib/audio-context';
import { TRACKS } from '@/lib/data';

// Mixed radio — cycle through all 4 artists equally
const ALL_TRACKS = TRACKS.filter(t =>
  ['O D Porter', 'Gune', 'Nikee Turbo', 'Rob Soule'].includes(t.artist)
);

export default function DigitalPage() {
  const [radioQueue, setRadioQueue] = useState<typeof ALL_TRACKS>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [countdown, setCountdown] = useState(99);
  const { loadTrack, isPlaying: audioPlaying, currentTrack } = useAudio();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const shuffleRef = useRef<typeof ALL_TRACKS>([]);

  // Shuffle tracks so artists are mixed — Gune, Nikee Turbo, Rob Soule first in order
  useEffect(() => {
    const guneTrack = ALL_TRACKS.find(t => t.id === 'gune-03'); // One More Time
    const nikeeTrack = ALL_TRACKS.find(t => t.id === 'nikee-01'); // Dominique
    const robTrack = ALL_TRACKS.find(t => t.id === 'rob-01'); // Believe In Me
    const rest = ALL_TRACKS.filter(t => !['gune-03', 'nikee-01', 'rob-01'].includes(t.id));
    const shuffled = rest.sort(() => Math.random() - 0.5);
    const ordered = [guneTrack, nikeeTrack, robTrack, ...shuffled].filter((t): t is typeof ALL_TRACKS[0] => t !== undefined);
    shuffleRef.current = ordered;
    setRadioQueue(ordered);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!isPlaying) return;
    intervalRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          // Skip to next track instead of stopping
          setCurrentIndex(i => (i + 1) % radioQueue.length);
          setCountdown(99);
          return 99;
        }
        return c - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, radioQueue.length]);

  const playRadio = () => {
    if (!radioQueue.length) return;
    const track = radioQueue[currentIndex];
    loadTrack({ ...track, duration: 180 });
    setIsPlaying(true);
    setCountdown(99);
    setShowPaywall(false);
  };

  // Load new track when currentIndex changes (skip or auto-skip)
  useEffect(() => {
    if (isPlaying && radioQueue[currentIndex]) {
      loadTrack({ ...radioQueue[currentIndex], duration: 180 });
    }
  }, [currentIndex, isPlaying, radioQueue]);

  const skipTrack = () => {
    const next = (currentIndex + 1) % radioQueue.length;
    setCurrentIndex(next);
    loadTrack({ ...radioQueue[next], duration: 180 });
  };

  const currentTrackData = radioQueue[currentIndex];

  return (
    <div className="min-h-screen pt-20 pb-24">
      {/* Header */}
      <div className="relative py-16 bg-gradient-to-br from-[var(--pf-orange)]/20 via-[var(--pf-bg-secondary)] to-purple-900/20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_var(--pf-orange)_0%,_transparent_50%)]"/>
        </div>
        <div className="pf-container relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--pf-orange)]/20 border border-[var(--pf-orange)]/40 rounded-full text-[var(--pf-orange)] text-sm font-medium mb-4">
            <Headphones size={14} className="fill-current" />
            Porterful Radio
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--pf-orange)] to-yellow-400">Hot 99.9</span>
            <span className="text-white ml-3">Porterful Radio</span>
          </h1>
          <p className="text-[var(--pf-text-secondary)] text-lg max-w-xl mx-auto">
            Listen to all our artists. Pay once, get lifetime access to everything — including your favorite artists.
          </p>
        </div>
      </div>

      <div className="pf-container py-12 max-w-2xl">

        {/* Radio Player Card */}
        <div className="bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-2xl overflow-hidden mb-8">
          {/* Now Playing */}
          <div className="p-6 border-b border-[var(--pf-border)]">
            <div className="text-xs text-[var(--pf-text-muted)] uppercase tracking-wider mb-3">Now Playing</div>
            {currentTrackData ? (
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-[var(--pf-bg-secondary)] shrink-0">
                  <Image src={currentTrackData.image} alt={currentTrackData.title} width={64} height={64} className="object-cover w-full h-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-lg truncate">{currentTrackData.artist}</div>
                  <div className="text-[var(--pf-text-secondary)] text-sm truncate">{currentTrackData.title}</div>
                </div>
                <div className="text-[var(--pf-orange)] text-sm font-medium shrink-0">{currentTrackData.duration}</div>
              </div>
            ) : (
              <div className="text-[var(--pf-text-muted)]">Press play to start listening</div>
            )}
          </div>

          {/* Progress / Countdown */}
          {isPlaying && (
            <div className="px-6 py-4 border-b border-[var(--pf-border)]">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs text-[var(--pf-orange)] font-mono w-8">{countdown}s</span>
                <div className="flex-1 h-1.5 bg-[var(--pf-bg-secondary)] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[var(--pf-orange)] to-yellow-400 rounded-full transition-all duration-1000" style={{ width: `${(countdown / 99) * 100}%` }} />
                </div>
                <Lock size={12} className="text-[var(--pf-text-muted)]" />
              </div>
              <p className="text-xs text-[var(--pf-text-muted)]">Preview limited to 99 seconds. Pay once for unlimited access.</p>
            </div>
          )}

          {/* Controls */}
          <div className="p-6 flex items-center gap-4">
            <button
              onClick={isPlaying ? () => setIsPlaying(false) : playRadio}
              className="w-14 h-14 bg-[var(--pf-orange)] hover:bg-[var(--pf-orange-dark)] text-white rounded-full flex items-center justify-center transition-colors shadow-lg shadow-[var(--pf-orange)]/30"
            >
              {isPlaying ? <Pause size={24} className="fill-current" /> : <Play size={24} className="fill-current ml-1" />}
            </button>
            <button onClick={skipTrack} className="w-10 h-10 bg-[var(--pf-bg-secondary)] hover:bg-[var(--pf-border)] text-[var(--pf-text-secondary)] rounded-full flex items-center justify-center transition-colors">
              <SkipForward size={18} />
            </button>
            <div className="flex-1" />
            <div className="text-right">
              <div className="text-sm font-medium">{radioQueue.filter(t => t.artist === 'O D Porter').length + radioQueue.filter(t => t.artist === 'Gune').length + radioQueue.filter(t => t.artist === 'Nikee Turbo').length + radioQueue.filter(t => t.artist === 'Rob Soule').length} tracks</div>
              <div className="text-xs text-[var(--pf-text-muted)]">Mixed from all artists</div>
            </div>
          </div>
        </div>

        {/* Paywall CTA */}
        {showPaywall && (
          <div className="bg-gradient-to-br from-[var(--pf-orange)]/20 to-purple-500/20 border border-[var(--pf-orange)]/30 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-[var(--pf-orange)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={28} className="text-[var(--pf-orange)]" />
            </div>
            <h2 className="text-2xl font-bold mb-2">That's the Preview</h2>
            <p className="text-[var(--pf-text-secondary)] mb-6">Listen to all tracks from every artist. No limits. Lifetime access.</p>
            <div className="text-3xl font-black mb-6">$5.99 <span className="text-sm font-normal text-[var(--pf-text-muted)]">lifetime</span></div>
            <Link href="/checkout?plan=lifetime" className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--pf-orange)] hover:bg-[var(--pf-orange-dark)] text-white font-bold rounded-xl transition-colors shadow-lg shadow-[var(--pf-orange)]/30">
              <CreditCard size={18} />
              Get Full Access
            </Link>
            <p className="text-xs text-[var(--pf-text-muted)] mt-3">One payment. Everything. Forever.</p>
          </div>
        )}

        {/* Artist Teasers */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Our Artists</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: 'O D Porter', genre: 'Hip-Hop, R&B, Soul', id: 'od-porter', img: '/artist-art/od-porter.jpg' },
              { name: 'Gune', genre: 'Hip-Hop, R&B', id: 'gune', img: '/artist-images/gune/ISIMG-1050533.JPG' },
              { name: 'Nikee Turbo', genre: 'Hip-Hop, R&B', id: 'nikee-turbo', img: '/artist-images/nikee-turbo/ab6761610000e5ebfddbec3845c421474dc2d779.jpeg' },
              { name: 'Rob Soule', genre: 'Hip-Hop, R&B, Blues', id: 'rob-soule', img: '/artist-images/rob-soule/hq720.jpg' },
            ].map(artist => (
              <Link key={artist.id} href={`/artist/${artist.id}`} className="bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-xl p-3 hover:border-[var(--pf-orange)]/50 transition-colors group">
                <div className="w-full aspect-square rounded-lg overflow-hidden bg-[var(--pf-bg-secondary)] mb-2">
                  <Image src={artist.img} alt={artist.name} width={200} height={200} className="object-cover w-full h-full group-hover:scale-105 transition-transform" />
                </div>
                <div className="font-bold text-sm">{artist.name}</div>
                <div className="text-xs text-[var(--pf-text-muted)]">{artist.genre}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Artist Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'O D Porter', tracks: ALL_TRACKS.filter(t => t.artist === 'O D Porter').length },
            { label: 'Gune', tracks: ALL_TRACKS.filter(t => t.artist === 'Gune').length },
            { label: 'Nikee Turbo', tracks: ALL_TRACKS.filter(t => t.artist === 'Nikee Turbo').length },
            { label: 'Rob Soule', tracks: ALL_TRACKS.filter(t => t.artist === 'Rob Soule').length },
          ].map(stat => (
            <div key={stat.label} className="bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-[var(--pf-orange)]">{stat.tracks}</div>
              <div className="text-xs text-[var(--pf-text-muted)]">{stat.label} tracks</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
