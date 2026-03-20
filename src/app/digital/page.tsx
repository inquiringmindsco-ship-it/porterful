'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Play, Pause, Heart } from 'lucide-react';

const ALBUM = {
  title: 'Ambiguous',
  artist: 'O D Porter',
  year: '2026',
  type: 'EP',
  tracks: 5,
  price: 5,
};

const TRACKS = [
  { id: '1', title: 'Oddysee', duration: '3:42' },
  { id: '2', title: 'Midnight Drive', duration: '4:15' },
  { id: '3', title: 'Movement', duration: '3:58' },
  { id: '4', title: 'Vibes', duration: '5:01' },
  { id: '5', title: 'Ambiguous', duration: '4:32' },
];

export default function DigitalPage() {
  const [playing, setPlaying] = useState<string | null>(null);
  const [liked, setLiked] = useState<string[]>([]);

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
              <div className="aspect-square bg-gradient-to-br from-[var(--pf-orange)]/30 to-purple-600/30 rounded-2xl flex items-center justify-center text-[100px] shadow-2xl">
                💿
              </div>

              {/* Info */}
              <div className="flex flex-col justify-center">
                <span className="text-sm text-[var(--pf-orange)] font-medium mb-2">
                  {ALBUM.type} • {ALBUM.year}
                </span>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">{ALBUM.title}</h1>
                <p className="text-xl text-[var(--pf-text-secondary)] mb-6">{ALBUM.artist}</p>
                
                <p className="text-[var(--pf-text-muted)] mb-4">
                  {ALBUM.tracks} tracks
                </p>

                <div className="mb-8">
                  <span className="text-4xl font-bold">${ALBUM.price}+</span>
                  <span className="text-[var(--pf-text-muted)] ml-2">pay what you want</span>
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
      <section className="py-8">
        <div className="pf-container">
          <div className="max-w-4xl mx-auto">
            <div className="pf-card overflow-hidden">
              <div className="p-4 border-b border-[var(--pf-border)]">
                <h2 className="font-semibold">Tracklist</h2>
              </div>

              <div className="divide-y divide-[var(--pf-border)]">
                {TRACKS.map((track, i) => (
                  <div 
                    key={track.id}
                    className="flex items-center gap-4 p-4 hover:bg-[var(--pf-surface-hover)] transition-colors group"
                  >
                    <span className="w-6 text-center text-[var(--pf-text-muted)] font-medium">
                      {i + 1}
                    </span>
                    
                    <button 
                      onClick={() => setPlaying(playing === track.id ? null : track.id)}
                      className="w-10 h-10 rounded-full bg-[var(--pf-surface)] flex items-center justify-center group-hover:bg-[var(--pf-orange)] transition-colors"
                    >
                      {playing === track.id ? (
                        <Pause size={16} className="text-white" />
                      ) : (
                        <Play size={16} className="text-white ml-0.5" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${playing === track.id ? 'text-[var(--pf-orange)]' : ''}`}>
                        {track.title}
                      </p>
                      <p className="text-sm text-[var(--pf-text-muted)]">{ALBUM.artist}</p>
                    </div>

                    <span className="text-sm text-[var(--pf-text-muted)]">{track.duration}</span>

                    <button 
                      onClick={() => setLiked(liked.includes(track.id) ? liked.filter(id => id !== track.id) : [...liked, track.id])}
                      className={`p-2 rounded-full transition-colors ${
                        liked.includes(track.id) ? 'text-red-500' : 'text-[var(--pf-text-muted)] hover:text-white'
                      }`}
                    >
                      <Heart size={18} fill={liked.includes(track.id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Purchase */}
            <div className="mt-8 pf-card p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="font-semibold mb-1">Support {ALBUM.artist}</p>
                  <p className="text-sm text-[var(--pf-text-muted)]">
                    80% goes directly to the artist.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--pf-text-muted)]">$</span>
                    <input 
                      type="number" 
                      defaultValue={ALBUM.price}
                      min={1}
                      className="w-20 bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg pl-7 pr-3 py-3 text-center focus:outline-none focus:border-[var(--pf-orange)]"
                    />
                  </div>
                  <button className="pf-btn pf-btn-primary">
                    Purchase
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}