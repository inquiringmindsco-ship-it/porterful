'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Music, Mic2, Star, Crown, Zap, Lock } from 'lucide-react';

// Demo artists for search
const DEMO_ARTISTS = [
  { id: 'od-porter', name: 'O D Porter', genre: 'Hip-Hop / R&B', location: 'New Orleans, LA', supporters: 312, verified: true },
  { id: 'artist-2', name: 'Midnight Echo', genre: 'Electronic', location: 'Los Angeles, CA', supporters: 847, verified: true },
  { id: 'artist-3', name: 'The Velvet Sound', genre: 'Jazz / Soul', location: 'New York, NY', supporters: 1205, verified: true },
  { id: 'artist-4', name: 'Neon Dreams', genre: 'Indie Pop', location: 'Austin, TX', supporters: 567, verified: false },
  { id: 'artist-5', name: 'Cosmic Harmony', genre: 'Lo-Fi / Chill', location: 'Seattle, WA', supporters: 2341, verified: true },
  { id: 'artist-6', name: 'Blue Notes', genre: 'Blues', location: 'Chicago, IL', supporters: 423, verified: false },
];

type Artist = typeof DEMO_ARTISTS[number];

export default function ProudToPayPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);

  const filteredArtists = DEMO_ARTISTS.filter(artist =>
    artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artist.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artist.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[var(--pf-bg)] text-white pt-24 pb-12">
      <div className="pf-container">
        {/* Hero */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-sm font-medium mb-6">
            <Star size={16} />
            PROUD TO PAY
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Pay What Makes Sense<br />
            <span className="text-[var(--pf-orange)]">Directly to Artists</span>
          </h1>
          <p className="text-xl text-[var(--pf-text-secondary)] max-w-2xl mx-auto">
            Skip the streaming middleman. Your money goes straight to the artists you love.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Simple Pricing</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Song */}
            <div className="pf-card p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Music className="text-blue-400" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-2">Single Song</h3>
              <p className="text-4xl font-bold mb-2">$1</p>
              <p className="text-sm text-[var(--pf-text-muted)] mb-4">Stream credit for one song</p>
              <ul className="text-sm text-left space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <Zap size={14} className="text-green-400" />
                  1 full play
                </li>
                <li className="flex items-center gap-2">
                  <Lock size={14} className="text-[var(--pf-text-muted)]" />
                  Other songs locked
                </li>
              </ul>
              <Link href="/digital" className="pf-btn pf-btn-secondary w-full">
                Browse Songs
              </Link>
            </div>

            {/* Album */}
            <div className="pf-card p-6 text-center border-purple-500/50">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Music className="text-purple-400" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-2">Album / EP</h3>
              <p className="text-4xl font-bold mb-2">$3.99</p>
              <p className="text-sm text-[var(--pf-text-muted)] mb-4">Full album access</p>
              <ul className="text-sm text-left space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <Zap size={14} className="text-green-400" />
                  All tracks unlocked
                </li>
                <li className="flex items-center gap-2">
                  <Zap size={14} className="text-green-400" />
                  Download included
                </li>
                <li className="flex items-center gap-2">
                  <Lock size={14} className="text-[var(--pf-text-muted)]" />
                  Other albums locked
                </li>
              </ul>
              <Link href="/digital" className="pf-btn pf-btn-secondary w-full">
                Browse Albums
              </Link>
            </div>

            {/* Full Access */}
            <div className="pf-card p-6 text-center border-[var(--pf-orange)] relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 bg-[var(--pf-orange)] text-white text-xs font-bold py-1 text-center">
                BEST VALUE
              </div>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--pf-orange)]/20 flex items-center justify-center">
                <Crown className="text-[var(--pf-orange)]" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-2">Full Access</h3>
              <p className="text-4xl font-bold mb-2">$5.99</p>
              <p className="text-sm text-[var(--pf-text-muted)] mb-4">One-time payment</p>
              <ul className="text-sm text-left space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <Zap size={14} className="text-green-400" />
                  <strong>Every song unlocked</strong>
                </li>
                <li className="flex items-center gap-2">
                  <Zap size={14} className="text-green-400" />
                  All albums, all artists
                </li>
                <li className="flex items-center gap-2">
                  <Zap size={14} className="text-green-400" />
                  No preview limits
                </li>
                <li className="flex items-center gap-2">
                  <Zap size={14} className="text-green-400" />
                  No subscription
                </li>
              </ul>
              <Link href="/support?tier=full" className="pf-btn pf-btn-primary w-full">
                Unlock Everything
              </Link>
            </div>
          </div>
        </div>

        {/* Marketplace Alternative */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="pf-card p-8 text-center bg-gradient-to-r from-purple-500/10 to-[var(--pf-orange)]/10">
            <h3 className="text-xl font-bold mb-3">Or Shop the Marketplace</h3>
            <p className="text-[var(--pf-text-secondary)] mb-4">
              Spend <strong>$10+ in the marketplace</strong> and get full music access included.
              Buy what you need, support artists, unlock everything.
            </p>
            <Link href="/marketplace" className="pf-btn pf-btn-primary">
              Shop Marketplace
            </Link>
          </div>
        </div>

        {/* Value Comparison */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Why This Works</h2>
          <div className="pf-card p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-center p-4">
                <p className="text-sm text-red-400 mb-2">Spotify</p>
                <p className="text-3xl font-bold mb-2">1,666 plays</p>
                <p className="text-sm text-[var(--pf-text-muted)]">= $5 to artist</p>
              </div>
              <div className="text-center p-4 bg-green-500/10 rounded-lg">
                <p className="text-sm text-green-400 mb-2">Porterful</p>
                <p className="text-3xl font-bold mb-2">1 payment</p>
                <p className="text-sm text-[var(--pf-text-muted)]">= $5.99 to artist</p>
              </div>
            </div>
            <p className="text-center text-sm text-[var(--pf-text-secondary)] mt-4">
              Artists get paid fairly. You get everything. No subscription. No middleman.
            </p>
          </div>
        </div>

        {/* Artist Selection */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">Support an Artist Directly</h2>
          <div className="max-w-xl mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--pf-text-muted)]" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search artists..."
                className="w-full bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-[var(--pf-orange)]"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredArtists.map((artist: Artist) => (
              <Link
                key={artist.id}
                href={`/artist/${artist.id}`}
                className="pf-card p-6 text-left hover:border-[var(--pf-orange)]/50 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--pf-orange)] to-purple-600 flex items-center justify-center text-2xl shrink-0">
                    🎤
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{artist.name}</h3>
                      {artist.verified && (
                        <span className="text-[var(--pf-orange)] text-xs">✓</span>
                      )}
                    </div>
                    <p className="text-sm text-[var(--pf-text-secondary)] mb-1">{artist.genre}</p>
                    <p className="text-xs text-[var(--pf-text-muted)]">{artist.location}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--pf-border)]">
                  <div className="flex items-center gap-1 text-sm text-[var(--pf-text-muted)]">
                    <Music size={14} />
                    {artist.supporters.toLocaleString()} supporters
                  </div>
                  <span className="text-[var(--pf-orange)] text-sm font-medium">Support →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--pf-orange)]/20 flex items-center justify-center">
                <Music className="text-[var(--pf-orange)]" size={28} />
              </div>
              <h3 className="font-semibold mb-2">Choose</h3>
              <p className="text-sm text-[var(--pf-text-secondary)]">
                Pick a song ($1), album ($3.99), or unlock everything ($5.99)
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Star className="text-purple-400" size={28} />
              </div>
              <h3 className="font-semibold mb-2">Pay Once</h3>
              <p className="text-sm text-[var(--pf-text-secondary)]">
                No subscription. No recurring charges. One payment.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                <Mic2 className="text-green-400" size={28} />
              </div>
              <h3 className="font-semibold mb-2">Artists Get Paid</h3>
              <p className="text-sm text-[var(--pf-text-secondary)]">
                Your money goes directly to artists. No middleman.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}