'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Music, Mic2, Star, Crown, Zap } from 'lucide-react';

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
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState('');

  const filteredArtists = DEMO_ARTISTS.filter(artist =>
    artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artist.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artist.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Updated tiers - $5 minimum to unlock full tracks
  const TIERS = [
    { id: 'stream', name: 'Stream', amount: 1, description: '1 play minimum', color: 'bg-gray-500', unlocks: false },
    { id: 'supporter', name: 'Supporter', amount: 5, description: 'Unlock ALL tracks', color: 'bg-blue-500', unlocks: true, popular: true },
    { id: 'champion', name: 'Champion', amount: 10, description: 'Unlock + badge', color: 'bg-purple-500', unlocks: true },
    { id: 'patron', name: 'Patron', amount: 25, description: 'Unlock + exclusive', color: 'bg-[#ff6b00]', unlocks: true },
  ];

  const handlePayment = () => {
    if (!selectedArtist || !selectedTier) return;
    // In production, this would integrate with Stripe
    alert(`Supporting ${selectedArtist.name} with $${selectedTier === 'custom' ? customAmount : TIERS.find(t => t.id === selectedTier)?.amount}`)
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
            Support the Artists<br />
            <span className="text-[var(--pf-orange)]">You Believe In</span>
          </h1>
          <p className="text-xl text-[var(--pf-text-secondary)] max-w-2xl mx-auto">
            Choose an artist, pick your support level, and make a difference. 
            Music isn't free — it costs time, energy, and love.
          </p>
        </div>

        {/* Value Proposition */}
        <div className="max-w-3xl mx-auto mb-12 p-6 rounded-2xl bg-gradient-to-r from-[var(--pf-orange)]/10 to-purple-500/10 border border-[var(--pf-border)]">
          <h3 className="text-lg font-semibold text-center mb-4">Why $5+ ?</h3>
          <p className="text-center text-[var(--pf-text-secondary)] mb-4">
            On Spotify, an artist needs <strong className="text-white">1,666 plays</strong> to earn $5.
            Your $5 here goes <strong className="text-white">directly to the artist</strong> — no middleman, no delay.
          </p>
          <div className="flex justify-center gap-8 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">1,666</div>
              <div className="text-[var(--pf-text-muted)]">Spotify plays = $5</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">1</div>
              <div className="text-[var(--pf-text-muted)]">Porterful support = $5</div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--pf-text-muted)]" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search artists by name, genre, or location..."
              className="w-full bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-xl pl-12 pr-4 py-4 text-lg focus:outline-none focus:border-[var(--pf-orange)] transition-colors"
            />
          </div>
        </div>

        {/* Artist Selection */}
        {!selectedArtist && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {filteredArtists.map((artist: Artist) => (
              <button
                key={artist.id}
                onClick={() => setSelectedArtist(artist)}
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
              </button>
            ))}
          </div>
        )}

        {/* Tier Selection */}
        {selectedArtist && !selectedTier && (
          <div className="max-w-3xl mx-auto">
            <button
              onClick={() => setSelectedArtist(null)}
              className="text-[var(--pf-text-secondary)] hover:text-white mb-6 flex items-center gap-2"
            >
              ← Back to artists
            </button>

            <div className="pf-card p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[var(--pf-orange)] to-purple-600 flex items-center justify-center text-4xl">
                  🎤
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedArtist.name}</h2>
                  <p className="text-[var(--pf-text-secondary)]">{selectedArtist.genre} • {selectedArtist.location}</p>
                </div>
              </div>

              <h3 className="text-xl font-semibold mb-2">Choose Your Support Level</h3>
              <p className="text-sm text-[var(--pf-text-muted)] mb-6">
                $5+ unlocks full tracks and removes the 1-minute preview limit.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {TIERS.map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => setSelectedTier(tier.id)}
                    className={`relative p-6 rounded-xl border-2 transition-all ${
                      selectedTier === tier.id
                        ? 'border-[var(--pf-orange)] bg-[var(--pf-orange)]/10'
                        : 'border-[var(--pf-border)] hover:border-[var(--pf-orange)]/50'
                    }`}
                  >
                    {tier.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[var(--pf-orange)] text-white text-xs font-bold rounded">
                        BEST VALUE
                      </span>
                    )}
                    <div className={`w-8 h-8 rounded-lg ${tier.color} mb-3 flex items-center justify-center`}>
                      {tier.unlocks && <Crown size={16} className="text-white" />}
                    </div>
                    <p className="text-sm text-[var(--pf-text-muted)] mb-1">{tier.name}</p>
                    <p className="text-2xl font-bold">${tier.amount}</p>
                    <p className="text-xs text-[var(--pf-text-secondary)] mt-1">{tier.description}</p>
                    {tier.unlocks && (
                      <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                        <Zap size={12} />
                        Full access
                      </p>
                    )}
                  </button>
                ))}
              </div>

              <div className="mb-8">
                <label className="block text-sm font-medium mb-2">Or enter a custom amount ($5 minimum for full access)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--pf-text-muted)]">$</span>
                  <input
                    type="number"
                    min="1"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value)
                      setSelectedTier(e.target.value ? 'custom' : null)
                    }}
                    placeholder="Enter amount"
                    className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:border-[var(--pf-orange)] transition-colors"
                  />
                </div>
                {customAmount && parseInt(customAmount) > 0 && parseInt(customAmount) < 5 && (
                  <p className="text-sm text-yellow-400 mt-2">
                    $5+ unlocks full tracks. $1-4 gives stream credit only.
                  </p>
                )}
              </div>

              <button
                onClick={handlePayment}
                disabled={!selectedTier && !customAmount}
                className={`w-full py-4 rounded-xl font-semibold transition-colors ${
                  selectedTier || customAmount
                    ? 'bg-[var(--pf-orange)] hover:bg-[var(--pf-orange)]/80 text-white'
                    : 'bg-[var(--pf-surface)] text-[var(--pf-text-muted)] cursor-not-allowed'
                }`}
              >
                Support {selectedArtist.name} →
              </button>

              <p className="text-center text-sm text-[var(--pf-text-muted)] mt-4">
                100% goes directly to the artist. No middleman.
              </p>
            </div>
          </div>
        )}

        {/* Payment Confirmation */}
        {selectedArtist && selectedTier && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="pf-card p-8">
              <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-6">
                <span className="text-4xl">💜</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
              <p className="text-[var(--pf-text-secondary)] mb-6">
                You're supporting {selectedArtist.name} with $
                {selectedTier === 'custom' ? customAmount : TIERS.find(t => t.id === selectedTier)?.amount}
              </p>
              <p className="text-sm text-[var(--pf-text-muted)] mb-8">
                In production, this would connect to Stripe for payment processing.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    setSelectedTier(null)
                    setCustomAmount('')
                  }}
                  className="pf-btn pf-btn-secondary"
                >
                  Support Another Artist
                </button>
                <Link href="/" className="pf-btn pf-btn-primary">
                  Explore Porterful
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* How It Works */}
        <div className="mt-16 pt-16 border-t border-[var(--pf-border)]">
          <h2 className="text-2xl font-bold text-center mb-8">How Proud to Pay Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--pf-orange)]/20 flex items-center justify-center">
                <Search className="text-[var(--pf-orange)]" size={28} />
              </div>
              <h3 className="font-semibold mb-2">Find Your Artist</h3>
              <p className="text-[var(--pf-text-secondary)] text-sm">
                Search by name, genre, or location. Every artist on Porterful is here.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Star className="text-purple-400" size={28} />
              </div>
              <h3 className="font-semibold mb-2">Choose Your Support</h3>
              <p className="text-[var(--pf-text-secondary)] text-sm">
                $1 minimum per stream, or $5+ to unlock all tracks and support directly.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                <Mic2 className="text-green-400" size={28} />
              </div>
              <h3 className="font-semibold mb-2">They Get 100%</h3>
              <p className="text-[var(--pf-text-secondary)] text-sm">
                No streaming pennies. No label cuts. Direct support for independent art.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}