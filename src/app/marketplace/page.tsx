'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Music, Headphones, Star, Shield } from 'lucide-react';
import { useSupabase } from '@/app/providers';

interface Product {
  id: string;
  name: string;
  artist?: string;
  price: number;
  description?: string;
  image: string;
  category: string;
  sales?: number;
  is_veteran?: boolean;
  is_black_owned?: boolean;
}

const DEMO_PRODUCTS: Product[] = [
  { id: '1', name: 'Ambiguous Tour Tee', artist: 'O D Porter', price: 28, category: 'merch', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', sales: 142, is_veteran: false },
  { id: '2', name: 'Ambiguous Hoodie', artist: 'O D Porter', price: 65, category: 'merch', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500', sales: 78 },
  { id: '3', name: 'Premium Phone Case', price: 25, category: 'essentials', image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500', sales: 234 },
];

export default function MarketplacePage() {
  const { supabase } = useSupabase();
  const [products, setProducts] = useState<Product[]>(DEMO_PRODUCTS);
  const [showVeteranOnly, setShowVeteranOnly] = useState(false);
  const [showBlackOwnedOnly, setShowBlackOwnedOnly] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--pf-bg)]">
      {/* Hero */}
      <section className="py-16 bg-gradient-to-b from-[var(--pf-orange)]/10 to-transparent">
        <div className="pf-container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Shop, Stream, Support
            </h1>
            <p className="text-xl text-[var(--pf-text-secondary)] mb-8">
              Every purchase puts money in artists' pockets. From merch to everyday essentials.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-[var(--pf-surface)] px-4 py-2 rounded-full">
                <span className="text-[var(--pf-orange)] font-bold">80%</span>
                <span className="text-[var(--pf-text-secondary)]">to artists on merch</span>
              </div>
              <div className="flex items-center gap-2 bg-[var(--pf-surface)] px-4 py-2 rounded-full">
                <span className="text-purple-400 font-bold">20%</span>
                <span className="text-[var(--pf-text-secondary)]">to artists from marketplace</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Veteran & Community Support */}
      <section className="py-8">
        <div className="pf-container">
          <div className="grid md:grid-cols-3 gap-4">
            <Link href="/marketplace?veteran=1" className="pf-card p-6 bg-blue-600/5 border border-blue-600/20 hover:border-blue-600/50 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🎖️</span>
                <h3 className="font-semibold">Veteran-Owned</h3>
              </div>
              <p className="text-sm text-[var(--pf-text-secondary)]">
                Support veteran artists and businesses. 1% goes to veteran causes.
              </p>
            </Link>
            <Link href="/marketplace?black=1" className="pf-card p-6 bg-green-600/5 border border-green-600/20 hover:border-green-600/50 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">✊</span>
                <h3 className="font-semibold">Black-Owned</h3>
              </div>
              <p className="text-sm text-[var(--pf-text-secondary)]">
                Discover and support Black-owned businesses on Porterful.
              </p>
            </Link>
            <Link href="/marketplace?minority=1" className="pf-card p-6 bg-purple-600/5 border border-purple-600/20 hover:border-purple-600/50 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🌍</span>
                <h3 className="font-semibold">Minority-Owned</h3>
              </div>
              <p className="text-sm text-[var(--pf-text-secondary)]">
                Support diverse creators and businesses on the platform.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Artist */}
      <section className="py-12">
        <div className="pf-container">
          {ARTISTS.map((artist) => (
            <div key={artist.id} className="pf-card p-8 bg-gradient-to-r from-[var(--pf-orange)]/5 to-purple-500/5">
              <div className="grid md:grid-cols-[200px_1fr] gap-8 items-center">
                <div className="aspect-square rounded-2xl overflow-hidden">
                  <img 
                    src={artist.image} 
                    alt={artist.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-3xl font-bold">{artist.name}</h2>
                    {artist.verified && (
                      <span className="bg-[var(--pf-orange)]/20 text-[var(--pf-orange)] px-2 py-0.5 rounded text-sm font-medium">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <p className="text-[var(--pf-text-secondary)] mb-2">{artist.genre} • {artist.location}</p>
                  <p className="text-[var(--pf-text-muted)] mb-4">{artist.bio}</p>
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <span className="text-2xl font-bold text-[var(--pf-orange)]">${artist.earnings.toLocaleString()}</span>
                      <span className="text-[var(--pf-text-muted)] ml-1">earned</span>
                    </div>
                    <div>
                      <span className="text-2xl font-bold">{artist.supporters.toLocaleString()}</span>
                      <span className="text-[var(--pf-text-muted)] ml-1">supporters</span>
                    </div>
                    <div>
                      <span className="text-2xl font-bold">{artist.tracks}</span>
                      <span className="text-[var(--pf-text-muted)] ml-1">tracks</span>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <Link href="/artist/od-porter" className="pf-btn pf-btn-primary">
                      View Artist
                    </Link>
                    <Link href="/digital" className="pf-btn pf-btn-secondary">
                      Listen Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Artist Merch */}
      <section className="py-12">
        <div className="pf-container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">Artist Merch</h2>
              <p className="text-[var(--pf-text-secondary)]">Direct from O D Porter. 80% goes to the artist.</p>
            </div>
            <Link href="/store" className="text-[var(--pf-orange)] hover:underline">
              View all →
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {merchProducts.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="pf-card group overflow-hidden"
              >
                <div className="aspect-square bg-[var(--pf-surface)] overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-xs text-[var(--pf-orange)] font-medium">{product.type}</span>
                    {product.limited && (
                      <span className="text-xs text-purple-400 font-medium">• Limited</span>
                    )}
                  </div>
                  <h3 className="font-semibold group-hover:text-[var(--pf-orange)] transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-[var(--pf-text-muted)]">
                    {product.artist || product.brand}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-bold">${product.price}</span>
                    <div className="flex items-center gap-1 text-sm text-[var(--pf-text-muted)]">
                      <Star size={14} className="text-yellow-400 fill-yellow-400" />
                      {product.rating}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-green-400">
                    <span>${(product.artistCut).toFixed(2)} to artist</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Top Tracks */}
      <section className="py-12 bg-[var(--pf-bg-secondary)]">
        <div className="pf-container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">Top Tracks</h2>
              <p className="text-[var(--pf-text-secondary)]">Pay what you want. Artists keep 80%.</p>
            </div>
            <Link href="/digital" className="pf-btn pf-btn-secondary">
              <Headphones className="inline mr-2" size={16} />
              Open Player
            </Link>
          </div>

          <div className="pf-card overflow-hidden">
            <div className="divide-y divide-[var(--pf-border)]">
              {TRACKS.map((track, i) => (
                <div key={track.id} className="flex items-center gap-4 p-4 hover:bg-[var(--pf-surface-hover)] transition-colors group">
                  <span className="w-8 text-center text-[var(--pf-text-muted)] font-bold">{i + 1}</span>
                  <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0">
                    <img src={track.image} alt={track.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{track.title}</p>
                    <p className="text-sm text-[var(--pf-text-muted)]">{track.artist}</p>
                  </div>
                  <span className="text-sm text-[var(--pf-text-muted)] hidden sm:block">
                    {(track.plays / 1000).toFixed(0)}K plays
                  </span>
                  <span className="text-sm text-[var(--pf-text-muted)] hidden md:block">
                    {track.duration}
                  </span>
                  <span className="font-bold">${track.price}+</span>
                  <button className="w-10 h-10 rounded-full bg-[var(--pf-orange)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white ml-0.5">▶</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Everyday Essentials */}
      <section className="py-12">
        <div className="pf-container">
          <div className="mb-8">
            <h2 className="text-2xl font-bold">Everyday Essentials</h2>
            <p className="text-[var(--pf-text-secondary)]">
              Buy what you need. 20% goes to artists. Same prices as anywhere else.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {essentials.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="pf-card group"
              >
                <div className="aspect-square bg-[var(--pf-surface)] overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3">
                  <p className="text-xs text-[var(--pf-text-muted)]">{product.type}</p>
                  <h3 className="font-medium text-sm truncate">{product.name}</h3>
                  <p className="text-xs text-[var(--pf-text-muted)]">{product.brand}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold">${product.price}</span>
                    <span className="text-xs text-purple-400">20% to artists</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-[var(--pf-text-secondary)] mb-4">
              This is the vision: Every purchase supports creators.
            </p>
            <Link href="/about" className="pf-btn pf-btn-secondary">
              Learn How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="pf-container">
          <div className="pf-card p-8 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Want Your Products Here?</h2>
            <p className="text-[var(--pf-text-secondary)] mb-6">
              Businesses can list products and reach music fans. Artists promote what they love.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/signup?role=business" className="pf-btn pf-btn-primary">
                List Your Products
              </Link>
              <Link href="/signup?role=artist" className="pf-btn pf-btn-secondary">
                Become an Artist
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}