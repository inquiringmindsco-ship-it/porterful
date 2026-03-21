'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Play, Headphones, ShoppingBag, Heart, Share2 } from 'lucide-react';

// Artist data (will come from database)
const ARTIST = {
  id: 'od-porter',
  name: 'O D Porter',
  location: 'St. Louis, MO',
  genre: 'Hip-Hop / R&B',
  bio: 'St. Louis artist blending hip-hop, R&B, and soul. Born in Miami, raised in New Orleans & St. Louis. Creating music that speaks to the human experience.',
  image: '🎤',
  supporters: 2847,
  earnings: 8947,
  verified: true,
};

// Releases (will come from database)
const RELEASES = [
  { 
    id: 'ambiguous-ep', 
    title: 'Ambiguous EP', 
    type: 'EP', 
    year: '2026', 
    tracks: 5, 
    price: 5,
    image: '💿',
    format: 'Digital'
  },
  { 
    id: 'ambiguous-vinyl', 
    title: 'Ambiguous Vinyl', 
    type: 'Vinyl', 
    price: 50,
    image: '📀',
    format: 'Physical',
    limited: true
  },
  { 
    id: 'ambiguous-tee', 
    title: 'Ambiguous Tour Tee', 
    type: 'Merch', 
    price: 25,
    image: '👕',
    format: 'Merch'
  },
];

// Top tracks
const TOP_TRACKS = [
  { id: '1', title: 'Oddysee', plays: 125000 },
  { id: '2', title: 'Midnight Drive', plays: 89000 },
  { id: '3', title: 'Movement', plays: 67000 },
  { id: '4', title: 'Vibes', plays: 45000 },
  { id: '5', title: 'Ambiguous', plays: 32000 },
];

export default function ArtistStorePage() {
  const [activeTab, setActiveTab] = useState<'all' | 'music' | 'merch'>('all');

  const formatPlays = (plays: number) => {
    if (plays >= 1000000) return `${(plays / 1000000).toFixed(1)}M`;
    if (plays >= 1000) return `${(plays / 1000).toFixed(0)}K`;
    return plays.toString();
  };

  return (
    <div className="min-h-screen bg-[var(--pf-bg)]">
      {/* Artist Hero */}
      <section className="relative py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--pf-orange)]/5 via-transparent to-[var(--pf-bg)]" />
        
        <div className="relative z-10 pf-container">
          <div className="max-w-4xl mx-auto">
            {/* Artist Info */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Avatar */}
              <div className="w-40 h-40 md:w-56 md:h-56 rounded-2xl bg-gradient-to-br from-[var(--pf-orange)] to-purple-600 flex items-center justify-center text-6xl md:text-8xl shadow-2xl shadow-[var(--pf-orange)]/20">
                {ARTIST.image}
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <h1 className="text-3xl md:text-5xl font-bold">{ARTIST.name}</h1>
                  {ARTIST.verified && (
                    <span className="bg-[var(--pf-orange)]/20 text-[var(--pf-orange)] px-2 py-0.5 rounded text-sm font-medium">
                      ✓ Verified
                    </span>
                  )}
                </div>
                
                <p className="text-lg text-[var(--pf-text-secondary)] mb-2">
                  {ARTIST.location} • {ARTIST.genre}
                </p>
                
                <p className="text-[var(--pf-text-muted)] mb-6 max-w-md">
                  {ARTIST.bio}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-center md:justify-start gap-6 mb-6">
                  <div>
                    <p className="text-2xl font-bold">${ARTIST.earnings.toLocaleString()}</p>
                    <p className="text-sm text-[var(--pf-text-muted)]">Earned</p>
                  </div>
                  <div className="w-px h-8 bg-[var(--pf-border)]" />
                  <div>
                    <p className="text-2xl font-bold">{ARTIST.supporters.toLocaleString()}</p>
                    <p className="text-sm text-[var(--pf-text-muted)]">Supporters</p>
                  </div>
                  <div className="w-px h-8 bg-[var(--pf-border)]" />
                  <div>
                    <p className="text-2xl font-bold">21</p>
                    <p className="text-sm text-[var(--pf-text-muted)]">Tracks</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <Link href="/digital" className="pf-btn pf-btn-primary">
                    <Play className="inline mr-2" size={18} />
                    Listen Now
                  </Link>
                  <button className="pf-btn pf-btn-secondary">
                    <Heart className="inline mr-2" size={18} />
                    Follow
                  </button>
                  <button className="pf-btn pf-btn-secondary">
                    <Share2 className="inline mr-2" size={18} />
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Releases */}
      <section className="py-12">
        <div className="pf-container">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Releases</h2>
              
              {/* Tabs */}
              <div className="flex gap-2">
                {(['all', 'music', 'merch'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? 'bg-[var(--pf-orange)] text-white'
                        : 'bg-[var(--pf-surface)] text-[var(--pf-text-secondary)] hover:text-white'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {RELEASES
                .filter(release => activeTab === 'all' || (activeTab === 'merch' ? release.format !== 'Digital' : release.format === 'Digital'))
                .map((release) => (
                  <Link 
                    key={release.id}
                    href={`/product/${release.id}`}
                    className="group"
                  >
                    <div className="aspect-square bg-gradient-to-br from-[var(--pf-orange)]/10 to-purple-500/10 rounded-xl flex items-center justify-center text-6xl mb-4 relative overflow-hidden">
                      {release.image}
                      {release.limited && (
                        <div className="absolute top-3 right-3 bg-[var(--pf-orange)] text-white text-xs font-bold px-2 py-1 rounded">
                          LIMITED
                        </div>
                      )}
                    </div>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-[var(--pf-text-muted)] uppercase tracking-wider mb-1">
                          {release.format}
                        </p>
                        <h3 className="text-lg font-semibold group-hover:text-[var(--pf-orange)] transition-colors">
                          {release.title}
                        </h3>
                        <p className="text-sm text-[var(--pf-text-secondary)]">
                          {release.type} {release.year ? `• ${release.year}` : ''}
                        </p>
                      </div>
                      <span className="text-xl font-bold">${release.price}</span>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* Top Tracks */}
      <section className="py-12 bg-[var(--pf-bg-secondary)]">
        <div className="pf-container">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Top Tracks</h2>
              <Link href="/digital" className="text-[var(--pf-orange)] hover:underline">
                View all <Headphones className="inline ml-1" size={16} />
              </Link>
            </div>

            <div className="pf-card overflow-hidden">
              <div className="divide-y divide-[var(--pf-border)]">
                {TOP_TRACKS.map((track, i) => (
                  <div 
                    key={track.id}
                    className="flex items-center gap-4 p-4 hover:bg-[var(--pf-surface-hover)] transition-colors group"
                  >
                    <span className="w-6 text-center text-[var(--pf-text-muted)] font-bold">{i + 1}</span>
                    <button className="w-10 h-10 rounded-lg bg-[var(--pf-surface)] flex items-center justify-center group-hover:bg-[var(--pf-orange)] transition-colors">
                      <Play size={16} className="text-white ml-0.5" />
                    </button>
                    <div className="flex-1">
                      <p className="font-semibold">{track.title}</p>
                      <p className="text-sm text-[var(--pf-text-muted)]">{ARTIST.name}</p>
                    </div>
                    <span className="text-sm text-[var(--pf-text-muted)]">{formatPlays(track.plays)} plays</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support CTA */}
      <section className="py-16">
        <div className="pf-container">
          <div className="max-w-4xl mx-auto">
            <div className="pf-card p-8 text-center bg-gradient-to-r from-purple-500/10 to-[var(--pf-orange)]/10">
              <h2 className="text-2xl font-bold mb-4">Support {ARTIST.name}</h2>
              <p className="text-[var(--pf-text-secondary)] mb-6 max-w-xl mx-auto">
                Every purchase supports independent art. 80% goes directly to the artist.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/support" className="pf-btn pf-btn-primary">
                  <Heart className="inline mr-2" size={18} />
                  Become a Supporter
                </Link>
                <Link href="/shop" className="pf-btn pf-btn-secondary">
                  <ShoppingBag className="inline mr-2" size={18} />
                  Shop All Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}