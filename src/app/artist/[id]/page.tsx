'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Placeholder artist data - will come from database
const placeholderArtist = {
  id: 'artist-placeholder',
  name: 'O D Porter',
  bio: 'New Orleans-born artist blending hip-hop, R&B, and soul. Creating music that speaks to the human experience.',
  location: 'New Orleans, LA',
  genre: 'Hip-Hop / R&B',
  followers: 2847,
  products: 12,
  image: '/placeholder-artist.jpg',
  banner: '/placeholder-banner.jpg',
  verified: true,
  social: {
    instagram: 'odporter',
    twitter: 'odporter',
    spotify: 'odporter',
  }
};

const placeholderProducts = [
  { id: 1, name: 'Essential Tee', price: 35, image: '/placeholder-product.jpg', type: 'merch' },
  { id: 2, name: 'Limited Hoodie', price: 75, image: '/placeholder-product.jpg', type: 'merch' },
  { id: 3, name: 'Cap - Black', price: 30, image: '/placeholder-product.jpg', type: 'merch' },
];

const placeholderTracks = [
  { id: 1, name: 'Late Night', duration: '3:42', plays: '125K' },
  { id: 2, name: 'Vibes', duration: '4:15', plays: '89K' },
  { id: 3, name: 'Movement', duration: '3:58', plays: '67K' },
];

export default function ArtistProfilePage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<'products' | 'music' | 'about'>('products');

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Banner */}
      <div className="relative h-64 md:h-80 bg-gradient-to-b from-[#ff6b00]/30 to-[#0a0a0a]">
        <div className="absolute inset-0 bg-[url('/placeholder-banner.jpg')] bg-cover bg-center opacity-30" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
      </div>

      {/* Artist Info */}
      <div className="max-w-6xl mx-auto px-6 -mt-20 relative">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Avatar */}
          <div className="w-40 h-40 rounded-full bg-[#1a1a1a] border-4 border-[#0a0a0a] overflow-hidden relative">
            <div className="absolute inset-0 bg-[#ff6b00]/20 flex items-center justify-center text-6xl">
              {placeholderArtist.name.charAt(0)}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-bold">{placeholderArtist.name}</h1>
              {placeholderArtist.verified && (
                <span className="bg-[#ff6b00]/20 text-[#ff6b00] px-2 py-1 rounded-full text-xs font-semibold">
                  ✓ Verified
                </span>
              )}
            </div>
            <p className="text-gray-400 mb-4">{placeholderArtist.location} • {placeholderArtist.genre}</p>
            <p className="text-gray-300 mb-6 max-w-2xl">{placeholderArtist.bio}</p>

            <div className="flex flex-wrap gap-4">
              <button className="bg-[#ff6b00] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#ff8533] transition-colors">
                Follow
              </button>
              <button className="bg-transparent border border-gray-600 text-white px-6 py-2 rounded-lg font-semibold hover:border-gray-400 transition-colors">
                ♪ Share Referral Code
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 md:gap-8 text-center">
            <div>
              <div className="text-2xl font-bold">{placeholderArtist.followers.toLocaleString()}</div>
              <div className="text-gray-500 text-sm">Followers</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{placeholderArtist.products}</div>
              <div className="text-gray-500 text-sm">Products</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8 border-b border-gray-800">
          <div className="flex gap-8">
            {(['products', 'music', 'about'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 font-semibold transition-colors ${
                  activeTab === tab
                    ? 'text-[#ff6b00] border-b-2 border-[#ff6b00]'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="py-8">
          {activeTab === 'products' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {placeholderProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="group bg-[#1a1a1a] rounded-xl overflow-hidden border border-gray-800 hover:border-[#ff6b00]/50 transition-colors"
                >
                  <div className="aspect-square bg-[#ff6b00]/10 flex items-center justify-center text-4xl">
                    👕
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-1 group-hover:text-[#ff6b00] transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-[#ff6b00] font-semibold">${product.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {activeTab === 'music' && (
            <div className="bg-[#1a1a1a] rounded-xl border border-gray-800">
              <div className="p-4 border-b border-gray-800">
                <h3 className="font-semibold">Latest Releases</h3>
              </div>
              <div className="divide-y divide-gray-800">
                {placeholderTracks.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center gap-4 p-4 hover:bg-[#222] cursor-pointer transition-colors"
                  >
                    <div className="w-12 h-12 bg-[#ff6b00]/20 rounded flex items-center justify-center">
                      🎵
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{track.name}</h4>
                      <p className="text-gray-500 text-sm">{track.plays} plays</p>
                    </div>
                    <span className="text-gray-500">{track.duration}</span>
                    <button className="text-[#ff6b00] hover:text-[#ff8533]">▶</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="max-w-2xl">
              <h3 className="text-xl font-bold mb-4">About {placeholderArtist.name}</h3>
              <p className="text-gray-300 mb-6">{placeholderArtist.bio}</p>
              
              <h4 className="font-semibold mb-3">Location</h4>
              <p className="text-gray-400 mb-6">{placeholderArtist.location}</p>
              
              <h4 className="font-semibold mb-3">Genre</h4>
              <p className="text-gray-400 mb-6">{placeholderArtist.genre}</p>
              
              <h4 className="font-semibold mb-3">Social</h4>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-[#ff6b00] transition-colors">
                  Instagram
                </a>
                <a href="#" className="text-gray-400 hover:text-[#ff6b00] transition-colors">
                  Twitter
                </a>
                <a href="#" className="text-gray-400 hover:text-[#ff6b00] transition-colors">
                  Spotify
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}