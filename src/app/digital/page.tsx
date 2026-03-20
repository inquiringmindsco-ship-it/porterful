'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Play, Pause, Heart, Star } from 'lucide-react';
import { TRACKS, ARTISTS } from '@/lib/data';

export default function DigitalPage() {
  const [playing, setPlaying] = useState<string | null>(null);
  const [liked, setLiked] = useState<string[]>([]);

  const artist = ARTISTS[0];
  const album = {
    title: 'Ambiguous',
    type: 'EP',
    year: '2026',
    tracks: 5,
    price: 5
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
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl shadow-[var(--pf-orange)]/20">
                <img 
                  src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600"
                  alt="Ambiguous EP"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex flex-col justify-center">
                <span className="text-sm text-[var(--pf-orange)] font-medium mb-2">
                  {album.type} • {album.year}
                </span>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">{album.title}</h1>
                <p className="text-xl text-[var(--pf-text-secondary)] mb-2">{artist.name}</p>
                <p className="text-[var(--pf-text-muted)] mb-6">
                  {album.tracks} tracks • {TRACKS.reduce((sum, t) => sum + (typeof t.plays === 'number' ? t.plays : parseInt(t.plays)), 0).toLocaleString()} total plays
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
                    className={`flex items-center gap-4 p-4 hover:bg-[var(--pf-surface-hover)] transition-colors group ${
                      playing === track.id ? 'bg-[var(--pf-orange)]/5' : ''
                    }`}
                  >
                    <span className="w-8 text-center text-[var(--pf-text-muted)] font-bold">{i + 1}</span>
                    
                    <button 
                      onClick={() => setPlaying(playing === track.id ? null : track.id)}
                      className="w-12 h-12 rounded-lg bg-[var(--pf-surface)] flex items-center justify-center group-hover:bg-[var(--pf-orange)] transition-colors shrink-0"
                    >
                      {playing === track.id ? (
                        <Pause size={18} className="text-white" />
                      ) : (
                        <Play size={18} className="text-white ml-0.5" />
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

                    <button 
                      onClick={() => setLiked(liked.includes(track.id) ? liked.filter(id => id !== track.id) : [...liked, track.id])}
                      className={`p-2 rounded-lg transition-colors ${
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
                  <p className="font-semibold mb-1">Support {artist.name}</p>
                  <p className="text-sm text-[var(--pf-text-muted)]">
                    80% goes directly to the artist. No middleman.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--pf-text-muted)]">$</span>
                    <input 
                      type="number" 
                      defaultValue={album.price}
                      min={1}
                      className="w-24 bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg pl-7 pr-3 py-3 text-center focus:outline-none focus:border-[var(--pf-orange)]"
                    />
                  </div>
                  <button className="pf-btn pf-btn-primary whitespace-nowrap">
                    Purchase • ${album.price}
                  </button>
                </div>
              </div>
            </div>

            {/* Pricing Tiers */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { tier: 'Listener', price: '$1', desc: 'Stream minimum' },
                { tier: 'Supporter', price: '$5', desc: '+ bonus track' },
                { tier: 'Champion', price: '$10', desc: '+ name in credits', popular: true },
                { tier: 'Patron', price: '$20+', desc: '+ early access' },
              ].map((t) => (
                <div 
                  key={t.tier}
                  className={`pf-card p-4 text-center ${t.popular ? 'border-purple-500' : ''}`}
                >
                  {t.popular && (
                    <span className="text-xs text-purple-400 font-medium">POPULAR</span>
                  )}
                  <p className="text-sm text-[var(--pf-text-muted)] uppercase tracking-wider mb-1">{t.tier}</p>
                  <p className="text-2xl font-bold text-[var(--pf-orange)]">{t.price}</p>
                  <p className="text-sm text-[var(--pf-text-secondary)]">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Proud to Pay Info */}
      <section className="py-12 bg-[var(--pf-bg-secondary)]">
        <div className="pf-container">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-sm font-medium mb-6">
              <Star size={14} />
              PROUD TO PAY
            </div>
            <h2 className="text-2xl font-bold mb-4">Why Pay More?</h2>
            <p className="text-[var(--pf-text-secondary)] mb-6">
              Streaming pays artists fractions of a cent. On Porterful, you choose what the music is worth.
              80% goes directly to the artist. No label, no middleman.
            </p>
            <Link href="/support" className="pf-btn pf-btn-primary">
              Find Artists to Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}