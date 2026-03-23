'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Music, Mic2, Star, Crown, Zap, Lock, Check } from 'lucide-react';

// Demo artists for search
const DEMO_ARTISTS = [
  { id: 'od-porter', name: 'O D Porter', genre: 'Hip-Hop / R&B', location: 'St. Louis, MO', supporters: 312, verified: true },
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
  const [loading, setLoading] = useState<string | null>(null);

  const filteredArtists = DEMO_ARTISTS.filter(artist =>
    artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artist.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artist.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBuy = async (type: 'song' | 'album' | 'full') => {
    setLoading(type);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{
            productId: type === 'full' ? 'full-access' : `${type}-${selectedArtist?.id || 'default'}`,
            name: type === 'full' ? 'Full Access - All Music Unlocked' : `${type.charAt(0).toUpperCase() + type.slice(1)} - ${selectedArtist?.name || 'Any Artist'}`,
            artist: selectedArtist?.name || 'Various Artists',
            price: type === 'song' ? 1 : type === 'album' ? 3.99 : 5.99,
            quantity: 1,
            type: 'digital',
            image: '/logo.svg'
          }]
        })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.demo) {
        window.location.href = '/checkout/success?demo=true';
      }
    } catch (err) {
      console.error('Checkout error:', err);
    }
    setLoading(null);
  };

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

        {/* Artist Selection */}
        <div className="max-w-xl mx-auto mb-12">
          <h2 className="text-xl font-bold text-center mb-4">Select an Artist to Support</h2>
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--pf-text-muted)]" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search artists..."
              className="w-full bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-[var(--pf-orange)]"
            />
          </div>
          
          {/* Selected Artist Display */}
          {selectedArtist && (
            <div className="bg-[var(--pf-orange)]/10 border border-[var(--pf-orange)]/30 rounded-xl p-4 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--pf-orange)] to-purple-600 flex items-center justify-center text-xl">
                  🎤
                </div>
                <div>
                  <p className="font-bold">{selectedArtist.name} {selectedArtist.verified && <span className="text-blue-400">✓</span>}</p>
                  <p className="text-sm text-[var(--pf-text-secondary)]">{selectedArtist.genre}</p>
                </div>
              </div>
              <button onClick={() => setSelectedArtist(null)} className="text-[var(--pf-text-muted)] hover:text-white">
                Clear
              </button>
            </div>
          )}
          
          {/* Artist Grid */}
          <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
            {filteredArtists.map((artist: Artist) => (
              <button
                key={artist.id}
                onClick={() => setSelectedArtist(artist)}
                className={`p-3 rounded-xl text-left transition-all ${
                  selectedArtist?.id === artist.id
                    ? 'bg-[var(--pf-orange)]/20 border-2 border-[var(--pf-orange)]'
                    : 'bg-[var(--pf-surface)] border border-[var(--pf-border)] hover:border-[var(--pf-orange)]/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎤</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm">{artist.name}</p>
                    <p className="text-xs text-[var(--pf-text-muted)] truncate">{artist.genre}</p>
                  </div>
                  {selectedArtist?.id === artist.id && <Check size={16} className="text-[var(--pf-orange)]" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Choose Your Support</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Song */}
            <div className="pf-card p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Music className="text-blue-400" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-2">Single Song</h3>
              <p className="text-4xl font-bold mb-2">$1</p>
              <p className="text-sm text-[var(--pf-text-muted)] mb-4">One-time payment</p>
              <ul className="text-sm text-left space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-green-400" />
                  1 song unlocked
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-green-400" />
                  Download included
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-green-400" />
                  80% to artist
                </li>
              </ul>
              <button 
                onClick={() => handleBuy('song')}
                disabled={loading === 'song'}
                className="block w-full py-3 px-6 bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-xl font-medium text-center hover:border-blue-500 transition-colors disabled:opacity-50"
              >
                {loading === 'song' ? 'Processing...' : 'Buy Song — $1'}
              </button>
            </div>

            {/* Album */}
            <div className="pf-card p-6 text-center border-2 border-purple-500/50">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Music className="text-purple-400" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-2">Album / EP</h3>
              <p className="text-4xl font-bold mb-2">$3.99</p>
              <p className="text-sm text-[var(--pf-text-muted)] mb-4">One-time payment</p>
              <ul className="text-sm text-left space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-green-400" />
                  Full album unlocked
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-green-400" />
                  All tracks downloadable
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-green-400" />
                  80% to artist
                </li>
              </ul>
              <Link 
                href="/digital"
                className="block w-full py-3 px-6 bg-purple-500 text-white rounded-xl font-medium text-center hover:bg-purple-600 transition-colors"
              >
                Browse Albums
              </Link>
            </div>

            {/* Full Access */}
            <div className="pf-card p-6 text-center border-2 border-[var(--pf-orange)] relative overflow-hidden">
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
                  <Check size={14} className="text-green-400" />
                  <strong>Every song unlocked</strong>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-green-400" />
                  All albums, all artists
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-green-400" />
                  No subscription
                </li>
              </ul>
              <button 
                onClick={() => handleBuy('full')}
                disabled={loading === 'full'}
                className="block w-full py-3 px-6 bg-[var(--pf-orange)] text-white rounded-xl font-medium text-center hover:bg-[var(--pf-orange-dark)] transition-colors disabled:opacity-50"
              >
                {loading === 'full' ? 'Processing...' : 'Unlock Everything — $5.99'}
              </button>
            </div>
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
                <p className="text-sm text-[var(--pf-text-muted)]">= $4.79 to artist (80%)</p>
              </div>
            </div>
            <p className="text-center text-sm text-[var(--pf-text-secondary)] mt-4">
              Artists get paid fairly. You get everything. No subscription. No middleman.
            </p>
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
                80% goes directly to artists. No middleman.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}