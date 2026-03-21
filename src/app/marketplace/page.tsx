'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, Star, Truck, Shield, ChevronRight, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/theme-context';
import { useAudio } from '@/lib/audio-context';
import { Play, Pause } from 'lucide-react';

// Categories for mobile scroll
const CATEGORIES = [
  { id: 'all', name: 'All', icon: '🛒' },
  { id: 'music', name: 'Music', icon: '🎵' },
  { id: 'merch', name: 'Merch', icon: '👕' },
  { id: 'electronics', name: 'Tech', icon: '📱' },
  { id: 'home', name: 'Home', icon: '🏠' },
  { id: 'beauty', name: 'Beauty', icon: '✨' },
  { id: 'sports', name: 'Sports', icon: '⚽' },
];

// Featured products
const FEATURED = [
  { id: '1', name: 'Wireless Earbuds Pro', price: 49.99, rating: 4.5, reviews: 2345, image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400', artistCut: 10 },
  { id: '2', name: 'Premium Cotton Tee', price: 24.99, rating: 4.7, reviews: 892, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', artistCut: 5 },
  { id: '3', name: 'LED Desk Lamp', price: 34.99, rating: 4.3, reviews: 567, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400', artistCut: 7 },
  { id: '4', name: 'Phone Case - Clear', price: 14.99, rating: 4.6, reviews: 3421, image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400', artistCut: 3 },
  { id: '5', name: 'Yoga Mat Premium', price: 39.99, rating: 4.8, reviews: 1203, image: 'https://images.unsplash.com/photo-1601925260368-ae2f66cf8b0e?w=400', artistCut: 8 },
  { id: '6', name: 'Skincare Set', price: 29.99, rating: 4.4, reviews: 789, image: 'https://images.unsplash.com/photo-1556228720-195a10a2bb52?w=400', artistCut: 6 },
];

// Artist merch
const ARTIST_MERCH = [
  { id: 'm1', name: 'Ambiguous Tour Tee', artist: 'O D Porter', price: 28, rating: 5.0, reviews: 142, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400' },
  { id: 'm2', name: 'Ambiguous Hoodie', artist: 'O D Porter', price: 65, rating: 4.8, reviews: 78, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400' },
  { id: 'm3', name: 'From Feast to Famine Vinyl', artist: 'O D Porter', price: 25, rating: 5.0, reviews: 34, image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=400' },
  { id: 'm4', name: 'God Is Good Cap', artist: 'O D Porter', price: 22, rating: 4.7, reviews: 56, image: 'https://images.unsplash.com/photo-1588850561407-ed45c570d6af?w=400' },
];

export default function MarketplacePage() {
  const { theme, toggleTheme } = useTheme();
  const { currentTrack, isPlaying, togglePlay } = useAudio();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [cartCount] = useState(0);

  return (
    <div className="min-h-screen bg-[var(--pf-bg-secondary)]">
      {/* Amazon-style Header */}
      <header className="bg-[#131921] text-white sticky top-0 z-50">
        {/* Top Bar */}
        <div className="px-4 py-3 flex items-center gap-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 shrink-0">
            <span className="text-lg font-bold text-[var(--pf-orange)]">PORTERFUL</span>
          </Link>

          {/* Search */}
          <div className="flex-1 flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2.5 px-4 pr-10 rounded-full text-black text-sm focus:outline-none"
              />
              <button className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 bg-[var(--pf-orange)] rounded-full flex items-center justify-center">
                <Search size={16} className="text-white" />
              </button>
            </div>
          </div>

          {/* Theme Toggle */}
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-white/10">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Cart */}
          <Link href="/cart" className="relative p-2">
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-1 right-0 w-5 h-5 bg-[var(--pf-orange)] rounded-full text-xs flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* Category Bar - Horizontal Scroll */}
        <div className="bg-[#232F3E] overflow-x-auto">
          <div className="flex items-center gap-1 px-4 py-2 text-sm whitespace-nowrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  selectedCategory === cat.id 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="mr-1">{cat.icon}</span>
                {cat.name}
              </button>
            ))}
            <div className="flex-1" />
            <Link href="/artist/od-porter" className="px-3 py-1.5 text-[var(--pf-orange)] font-medium">
              🎤 Artist Merch
            </Link>
          </div>
        </div>
      </header>

      {/* Mini Player (when track playing) */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 bg-[var(--pf-surface)] border-t border-[var(--pf-border)] py-2 px-4 z-40 safe-area-bottom">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded overflow-hidden shrink-0 bg-gradient-to-br from-[var(--pf-orange)] to-purple-600">
              {currentTrack.cover_url && (
                <img src={currentTrack.cover_url} alt={currentTrack.title} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentTrack.title}</p>
              <p className="text-xs text-[var(--pf-text-muted)] truncate">{currentTrack.artist}</p>
            </div>
            <button 
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-[var(--pf-orange)] flex items-center justify-center"
            >
              {isPlaying ? <Pause size={18} className="text-white" /> : <Play size={18} className="text-white ml-0.5" />}
            </button>
          </div>
        </div>
      )}

      <main className={currentTrack ? 'pb-24' : 'pb-8'}>
        {/* Artist Merch Banner */}
        <section className="bg-gradient-to-r from-[var(--pf-orange)]/20 to-purple-600/20 p-4">
          <Link href="/artist/od-porter" className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--pf-orange)] mb-1">Featured Artist</p>
              <h2 className="text-xl font-bold">O D Porter</h2>
              <p className="text-sm text-[var(--pf-text-secondary)]">New merch • 80% to artist</p>
            </div>
            <ChevronRight size={24} className="text-[var(--pf-text-muted)]" />
          </Link>
        </section>

        {/* Artist Merch Grid */}
        <section className="p-4">
          <h2 className="text-lg font-bold mb-3 flex items-center justify-between">
            <span>Artist Merch</span>
            <span className="text-sm text-[var(--pf-orange)]">80% to artists</span>
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {ARTIST_MERCH.map(product => (
              <Link key={product.id} href={`/product/${product.id}`} className="bg-[var(--pf-surface)] rounded-xl overflow-hidden">
                <div className="aspect-square">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <p className="text-xs text-[var(--pf-orange)] mb-0.5">{product.artist}</p>
                  <h3 className="font-medium text-sm truncate">{product.name}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-xs">{product.rating}</span>
                    <span className="text-xs text-[var(--pf-text-muted)]">({product.reviews})</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold">${product.price}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Trust Badges */}
        <section className="grid grid-cols-3 gap-2 px-4 mb-4">
          <div className="bg-[var(--pf-surface)] rounded-xl p-3 text-center">
            <Truck size={20} className="mx-auto mb-1 text-[var(--pf-orange)]" />
            <p className="text-xs font-medium">Free Ship</p>
            <p className="text-[10px] text-[var(--pf-text-muted)]">$50+</p>
          </div>
          <div className="bg-[var(--pf-surface)] rounded-xl p-3 text-center">
            <Shield size={20} className="mx-auto mb-1 text-[var(--pf-orange)]" />
            <p className="text-xs font-medium">Secure</p>
            <p className="text-[10px] text-[var(--pf-text-muted)]">SSL</p>
          </div>
          <div className="bg-[var(--pf-surface)] rounded-xl p-3 text-center">
            <Star size={20} className="mx-auto mb-1 text-[var(--pf-orange)]" />
            <p className="text-xs font-medium">Artists</p>
            <p className="text-[10px] text-[var(--pf-text-muted)]">Get Paid</p>
          </div>
        </section>

        {/* Everyday Essentials */}
        <section className="px-4">
          <h2 className="text-lg font-bold mb-1">Everyday Essentials</h2>
          <p className="text-sm text-[var(--pf-text-secondary)] mb-3">
            Buy what you need. Support artists. Same prices.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {FEATURED.map(product => (
              <Link key={product.id} href={`/product/${product.id}`} className="bg-[var(--pf-surface)] rounded-xl overflow-hidden">
                <div className="aspect-square">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-sm truncate">{product.name}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    {Array(5).fill(0).map((_, i) => (
                      <Star key={i} size={10} className={i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'} />
                    ))}
                    <span className="text-xs text-[var(--pf-text-muted)]">{product.reviews}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold">${product.price}</span>
                    <span className="text-xs text-purple-400">+${product.artistCut} to artists</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="p-4 mt-4">
          <div className="bg-[var(--pf-surface)] rounded-xl p-6 text-center">
            <h2 className="text-lg font-bold mb-4">How Porterful Works</h2>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-2xl mb-2">🛒</div>
                <p className="font-medium">Shop</p>
                <p className="text-xs text-[var(--pf-text-muted)]">Same prices</p>
              </div>
              <div>
                <div className="text-2xl mb-2">💜</div>
                <p className="font-medium">Support</p>
                <p className="text-xs text-[var(--pf-text-muted)]">Artists get paid</p>
              </div>
              <div>
                <div className="text-2xl mb-2">✨</div>
                <p className="font-medium">Feel Good</p>
                <p className="text-xs text-[var(--pf-text-muted)]">Every purchase</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}