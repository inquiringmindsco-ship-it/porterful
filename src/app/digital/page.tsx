'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Play, Pause, SkipBack, SkipForward, Heart, Share2 } from 'lucide-react';

// Artist data (will come from database)
const ARTIST = {
  name: 'O D Porter',
  location: 'New Orleans',
  bio: 'Hip-hop and R&B from the heart of New Orleans.',
  image: '🎤',
  supporters: 2847,
};

// Album data (will come from database)
const ALBUM = {
  title: 'Ambiguous',
  type: 'EP',
  year: '2026',
  tracks: 5,
  price: 5,
  cover: '💿',
};

// Tracks (will come from database / user uploads)
const TRACKS = [
  { id: '1', title: 'Oddysee', duration: '3:42', plays: 125000 },
  { id: '2', title: 'Midnight Drive', duration: '4:15', plays: 89000 },
  { id: '3', title: 'Movement', duration: '3:58', plays: 67000 },
  { id: '4', title: 'Vibes', duration: '5:01', plays: 45000 },
  { id: '5', title: 'Ambiguous', duration: '4:32', plays: 32000 },
];

export default function DigitalPage() {
  const [playing, setPlaying] = useState<string | null>(null);
  const [liked, setLiked] = useState<string[]>([]);

  const formatPlays = (plays: number) => {
    if (plays >= 1000000) return `${(plays / 1000000).toFixed(1)}M`;
    if (plays >= 1000) return `${(plays / 1000).toFixed(0)}K`;
    return plays.toString();
  };

  const togglePlay = (trackId: string) => {
    setPlaying(playing === trackId ? null : trackId);
  };

  const toggleLike = (trackId: string) => {
    setLiked(prev => 
      prev.includes(trackId) 
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    );
  };

  return (
    <div className="min-h-screen bg-[var(--pf-bg)]">
      {/* Hero */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--pf-orange)]/10 via-transparent to-[var(--pf-bg)]" />
        
        <div className="relative z-10 pf-container py-16">
          <div className="max-w-4xl mx-auto">
            {/* Artist Badge */}
            <Link href="/artist/od-porter" className="inline-flex items-center gap-2 text-[var(--pf-text-muted)] hover:text-white transition-colors mb-6">
              ← Back to artist
            </Link>

            {/* Album Info */}
            <div className="grid md:grid-cols-[300px_1fr] gap-12">
              {/* Cover Art */}
              <div className="aspect-square bg-gradient-to-br from-[var(--pf-orange)]/30 to-purple-600/30 rounded-2xl flex items-center justify-center text-[120px] shadow-2xl shadow-[var(--pf-orange)]/20">
                {ALBUM.cover}
              </div>

              {/* Info */}
              <div className="flex flex-col justify-center">
                <span className="text-sm text-[var(--pf-orange)] font-medium mb-2">
                  {ALBUM.type} • {ALBUM.year}
                </span>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">{ALBUM.title}</h1>
                <p className="text-xl text-[var(--pf-text-secondary)] mb-4">{ARTIST.name}</p>
                <p className="text-[var(--pf-text-muted)] mb-6">{ALBUM.tracks} tracks</p>

                {/* Price */}
                <div className="mb-6">
                  <p className="text-3xl font-bold">${ALBUM.price}+</p>
                  <p className="text-sm text-[var(--pf-text-muted)]">Pay what you want, minimum $1</p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  <button className="pf-btn pf-btn-primary">
                    <Play className="inline mr-2" size={18} />
                    Play All
                  </button>
                  <button className="pf-btn pf-btn-secondary">
                    <Heart className="inline mr-2" size={18} />
                    Save
                  </button>
                  <button className="pf-btn pf-btn-secondary">
                    <Share2 className="inline mr-2" size={18} />
                    Share
                  </button>
                </div>

                {/* Stats */}
                <div className="flex gap-6 mt-8 pt-6 border-t border-[var(--pf-border)]">
                  <div>
                    <p className="text-2xl font-bold">{formatPlays(TRACKS.reduce((sum, t) => sum + t.plays, 0))}</p>
                    <p className="text-sm text-[var(--pf-text-muted)]">plays</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{ARTIST.supporters.toLocaleString()}</p>
                    <p className="text-sm text-[var(--pf-text-muted)]">supporters</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tracklist */}
      <div className="pf-container pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="pf-card overflow-hidden">
            <div className="p-4 border-b border-[var(--pf-border)]">
              <h2 className="font-semibold">Tracklist</h2>
            </div>

            <div className="divide-y divide-[var(--pf-border)]">
              {TRACKS.map((track, index) => (
                <div 
                  key={track.id}
                  className={`flex items-center gap-4 p-4 group hover:bg-[var(--pf-surface-hover)] transition-colors ${
                    playing === track.id ? 'bg-[var(--pf-orange)]/5' : ''
                  }`}
                >
                  {/* Number / Play */}
                  <button 
                    onClick={() => togglePlay(track.id)}
                    className="w-10 h-10 rounded-lg bg-[var(--pf-surface)] flex items-center justify-center group-hover:bg-[var(--pf-orange)] transition-colors"
                  >
                    {playing === track.id ? (
                      <Pause size={16} className="text-white" />
                    ) : (
                      <Play size={16} className="text-white ml-0.5" />
                    )}
                  </button>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold truncate ${playing === track.id ? 'text-[var(--pf-orange)]' : ''}`}>
                      {track.title}
                    </p>
                    <p className="text-sm text-[var(--pf-text-muted)]">{ARTIST.name}</p>
                  </div>

                  {/* Duration */}
                  <span className="text-sm text-[var(--pf-text-muted)] hidden sm:block">
                    {track.duration}
                  </span>

                  {/* Plays */}
                  <span className="text-sm text-[var(--pf-text-muted)] hidden md:block">
                    {formatPlays(track.plays)} plays
                  </span>

                  {/* Like */}
                  <button 
                    onClick={() => toggleLike(track.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      liked.includes(track.id) 
                        ? 'text-red-500' 
                        : 'text-[var(--pf-text-muted)] hover:text-white'
                    }`}
                  >
                    <Heart 
                      size={18} 
                      fill={liked.includes(track.id) ? 'currentColor' : 'none'}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Purchase */}
          <div className="mt-8 pf-card p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold mb-1">Support {ARTIST.name}</h3>
                <p className="text-sm text-[var(--pf-text-secondary)]">
                  100% goes directly to the artist. No middleman.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--pf-text-muted)]">$</span>
                  <input 
                    type="number" 
                    defaultValue={ALBUM.price}
                    min={1}
                    className="w-24 bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg pl-8 pr-4 py-3 focus:outline-none focus:border-[var(--pf-orange)]"
                  />
                </div>
                <button className="pf-btn pf-btn-primary whitespace-nowrap">
                  Purchase • $5
                </button>
              </div>
            </div>
          </div>

          {/* Proud to Pay Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-[var(--pf-text-muted)]">
              💜 <span className="text-white">Proud to Pay</span> — Set your price. Artists keep 80%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}