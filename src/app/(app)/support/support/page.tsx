'use client';

import { useState } from 'react';
import { Search, Heart, Check } from 'lucide-react';

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
  const [loading, setLoading] = useState<number | null>(null);
  const supportAmounts = [1, 5, 10];

  const filteredArtists = DEMO_ARTISTS.filter(artist =>
    artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artist.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artist.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSupport = async (amount: number) => {
    setLoading(amount);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{
            productId: `support-${selectedArtist?.id || 'default'}-${amount}`,
            name: `Support ${selectedArtist?.name || 'Any Artist'}`,
            artist: selectedArtist?.name || 'Various Artists',
            price: amount,
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
    <div className="min-h-screen bg-[var(--pf-bg)] text-[var(--pf-text)] pt-24 pb-12">
      <div className="pf-container">
        {/* Hero */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-sm font-medium mb-6">
            <Heart size={16} />
            Support
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Support an artist.<br />
            <span className="text-[var(--pf-orange)]">Pick an amount.</span>
          </h1>
          <p className="text-xl text-[var(--pf-text-secondary)] max-w-2xl mx-auto">
            Choose someone, choose an amount, and tap in.
          </p>
        </div>

        {/* Artist Selection */}
        <div className="max-w-xl mx-auto mb-12">
          <h2 className="text-xl font-bold text-center mb-4">Choose an artist</h2>
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

        {/* Amounts */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Choose an amount</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {supportAmounts.map((amount) => (
              <div key={amount} className={`pf-card p-6 text-center ${amount === 5 ? 'border-2 border-[var(--pf-orange)]' : ''}`}>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--pf-orange)]/15 flex items-center justify-center">
                  <Heart className="text-[var(--pf-orange)]" size={28} />
                </div>
                <h3 className="text-xl font-bold mb-2">Support</h3>
                <p className="text-4xl font-bold mb-2">${amount}</p>
                <p className="text-sm text-[var(--pf-text-muted)] mb-6">One-time support</p>
                <button 
                  onClick={() => handleSupport(amount)}
                  disabled={loading === amount || !selectedArtist}
                  className="block w-full py-3 px-6 bg-[var(--pf-orange)] text-white rounded-xl font-medium text-center hover:bg-[var(--pf-orange-dark)] transition-colors disabled:opacity-50"
                >
                  {loading === amount ? 'Processing...' : `Support $${amount}`}
                </button>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-[var(--pf-text-secondary)] mt-4">
            Choose an artist above, then pick an amount below.
          </p>
        </div>
      </div>
    </div>
  );
}
