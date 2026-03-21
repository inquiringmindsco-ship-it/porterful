'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, Heart, Star, ChevronRight, Truck, Shield, RotateCcw } from 'lucide-react';
import { useSupabase } from '@/app/providers';
import { useAudio } from '@/lib/audio-context';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

// Product categories (Amazon-style)
const CATEGORIES = [
  { id: 'all', name: 'All', icon: '🛒' },
  { id: 'music', name: 'Music & Audio', icon: '🎵' },
  { id: 'apparel', name: 'Apparel', icon: '👕' },
  { id: 'electronics', name: 'Electronics', icon: '📱' },
  { id: 'home', name: 'Home & Living', icon: '🏠' },
  { id: 'beauty', name: 'Beauty', icon: '✨' },
  { id: 'sports', name: 'Sports & Outdoors', icon: '⚽' },
];

// Featured products (everyday essentials with 20% to artists)
const FEATURED_PRODUCTS = [
  { id: '1', name: 'Wireless Earbuds Pro', category: 'electronics', price: 49.99, originalPrice: 79.99, rating: 4.5, reviews: 2345, image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400', artistCut: 10, prime: true },
  { id: '2', name: 'Premium Cotton T-Shirt', category: 'apparel', price: 24.99, rating: 4.7, reviews: 892, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', artistCut: 5, colors: ['Black', 'White', 'Navy'] },
  { id: '3', name: 'LED Desk Lamp', category: 'home', price: 34.99, rating: 4.3, reviews: 567, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400', artistCut: 7 },
  { id: '4', name: 'Phone Case - Clear', category: 'electronics', price: 14.99, rating: 4.6, reviews: 3421, image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400', artistCut: 3 },
  { id: '5', name: 'Yoga Mat Premium', category: 'sports', price: 39.99, rating: 4.8, reviews: 1203, image: 'https://images.unsplash.com/photo-1601925260368-ae2f66cf8b0e?w=400', artistCut: 8 },
  { id: '6', name: 'Skincare Set', category: 'beauty', price: 29.99, originalPrice: 49.99, rating: 4.4, reviews: 789, image: 'https://images.unsplash.com/photo-1556228720-195a10a2bb52?w=400', artistCut: 6 },
  { id: '7', name: 'Bluetooth Speaker', category: 'electronics', price: 59.99, rating: 4.5, reviews: 1567, image: 'https://images.unsplash.com/photo-1608043152265-27e85af2a8ea?w=400', artistCut: 12 },
  { id: '8', name: 'Hoodie - Classic', category: 'apparel', price: 54.99, rating: 4.9, reviews: 445, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400', artistCut: 11, colors: ['Gray', 'Black', 'Blue'] },
];

// Artist merch (80% to artists)
const ARTIST_PRODUCTS = [
  { id: 'm1', name: 'Ambiguous Tour Tee', artist: 'O D Porter', price: 28.00, rating: 5.0, reviews: 142, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', artistCut: 22.40 },
  { id: 'm2', name: 'Ambiguous Hoodie', artist: 'O D Porter', price: 65.00, rating: 4.8, reviews: 78, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400', artistCut: 52 },
  { id: 'm3', name: 'From Feast to Famine Vinyl', artist: 'O D Porter', price: 25.00, rating: 5.0, reviews: 34, image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=400', artistCut: 20 },
  { id: 'm4', name: 'God Is Good Cap', artist: 'O D Porter', price: 22.00, rating: 4.7, reviews: 56, image: 'https://images.unsplash.com/photo-1588850561407-ed45c570d6af?w=400', artistCut: 17.60 },
];

export default function MarketplacePage() {
  const { supabase } = useSupabase();
  const { currentTrack, isPlaying, playTrack, togglePlay, playNext, playPrev } = useAudio();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [featuredTracks, setFeaturedTracks] = useState<any[]>([]);

  useEffect(() => {
    async function loadTracks() {
      if (!supabase) return;
      const { data } = await supabase.from('tracks').select('*').limit(5);
      if (data) setFeaturedTracks(data);
    }
    loadTracks();
  }, [supabase]);

  const filteredProducts = selectedCategory === 'all' 
    ? FEATURED_PRODUCTS 
    : FEATURED_PRODUCTS.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[var(--pf-bg-secondary)] pb-32">
      {/* Header - Amazon-style */}
      <header className="bg-[var(--pf-surface)] sticky top-0 z-50">
        {/* Top bar */}
        <div className="bg-[#131921] py-2">
          <div className="pf-container flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <span className="text-xl font-bold text-[var(--pf-orange)]">PORTERFUL</span>
            </Link>
            
            {/* Deliver to */}
            <div className="hidden md:flex items-center gap-1 text-white/80 text-sm">
              <span>📍</span>
              <div>
                <p className="text-[10px] text-white/50">Deliver to</p>
                <p className="font-medium">New Orleans 70112</p>
              </div>
            </div>
            
            {/* Search */}
            <div className="flex-1 max-w-2xl">
              <div className="relative flex">
                <select className="bg-[#E6E6E6] text-black text-sm px-3 py-2 rounded-l-lg border-r border-gray-300 focus:outline-none">
                  <option>All</option>
                  <option>Music</option>
                  <option>Merch</option>
                  <option>Electronics</option>
                </select>
                <input
                  type="text"
                  placeholder="Search Porterful"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2 focus:outline-none"
                />
                <button className="bg-[var(--pf-orange)] px-4 rounded-r-lg hover:bg-[var(--pf-orange)]/80">
                  <Search size={20} className="text-white" />
                </button>
              </div>
            </div>
            
            {/* Account */}
            <Link href="/login" className="hidden md:flex flex-col text-white text-sm hover:text-[var(--pf-orange)]">
              <span className="text-[10px] text-white/50">Hello, Sign in</span>
              <span className="font-medium">Account & Lists</span>
            </Link>
            
            {/* Orders */}
            <Link href="/dashboard" className="hidden md:flex flex-col text-white text-sm hover:text-[var(--pf-orange)]">
              <span className="text-[10px] text-white/50">Returns</span>
              <span className="font-medium">& Orders</span>
            </Link>
            
            {/* Cart */}
            <Link href="/cart" className="flex items-center text-white hover:text-[var(--pf-orange)] relative">
              <ShoppingCart size={28} />
              <span className="absolute -top-1 left-4 w-5 h-5 bg-[var(--pf-orange)] rounded-full text-xs flex items-center justify-center font-bold">
                {cartCount}
              </span>
              <span className="hidden md:block ml-1 font-medium">Cart</span>
            </Link>
          </div>
        </div>

        {/* Category bar */}
        <div className="bg-[#232F3E] py-1.5 overflow-x-auto">
          <div className="pf-container flex items-center gap-1 text-white text-sm">
            <button onClick={() => setSelectedCategory('all')} className={`px-3 py-1 rounded hover:bg-white/10 ${selectedCategory === 'all' ? 'text-[var(--pf-orange)]' : ''}`}>
              All
            </button>
            {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded hover:bg-white/10 whitespace-nowrap ${selectedCategory === cat.id ? 'text-[var(--pf-orange)]' : ''}`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
            <div className="flex-1" />
            <Link href="/artist/od-porter" className="px-3 py-1 text-[var(--pf-orange)] font-medium hover:bg-white/10 rounded">
              🎤 Artist Merch
            </Link>
          </div>
        </div>
      </header>

      {/* Mini Player (always visible while shopping) */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 bg-[var(--pf-surface)] border-t border-[var(--pf-border)] py-2 px-4 z-50 shadow-lg">
          <div className="pf-container flex items-center gap-4">
            <div className="w-10 h-10 rounded overflow-hidden shrink-0 bg-gradient-to-br from-[var(--pf-orange)] to-purple-600 flex items-center justify-center">
              {currentTrack.cover_url ? (
                <img src={currentTrack.cover_url} alt={currentTrack.title} className="w-full h-full object-cover" />
              ) : (
                <span>🎵</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentTrack.title}</p>
              <p className="text-xs text-[var(--pf-text-muted)] truncate">{currentTrack.artist}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={playPrev} className="p-1.5 rounded-full hover:bg-[var(--pf-surface)]"><SkipBack size={16} /></button>
              <button onClick={togglePlay} className="w-8 h-8 rounded-full bg-[var(--pf-orange)] flex items-center justify-center">
                {isPlaying ? <Pause size={16} className="text-white" /> : <Play size={16} className="text-white ml-0.5" />}
              </button>
              <button onClick={playNext} className="p-1.5 rounded-full hover:bg-[var(--pf-surface)]"><SkipForward size={16} /></button>
            </div>
          </div>
        </div>
      )}

      <main className="pf-container py-6">
        {/* Artist Merch Banner */}
        <section className="mb-8">
          <Link href="/artist/od-porter" className="block pf-card p-6 bg-gradient-to-r from-[var(--pf-orange)]/20 to-purple-600/20 hover:from-[var(--pf-orange)]/30 hover:to-purple-600/30 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--pf-orange)] mb-1">Featured Artist</p>
                <h2 className="text-2xl font-bold">O D Porter</h2>
                <p className="text-[var(--pf-text-secondary)]">New merch available • 80% to artist</p>
              </div>
              <ChevronRight size={24} className="text-[var(--pf-text-muted)]" />
            </div>
          </Link>
        </section>

        {/* Artist Merch Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Artist Merch</h2>
            <span className="text-sm text-[var(--pf-orange)]">80% to artists</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ARTIST_PRODUCTS.map(product => (
              <Link key={product.id} href={`/product/${product.id}`} className="pf-card group overflow-hidden">
                <div className="aspect-square bg-[var(--pf-surface)]">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div className="p-3">
                  <p className="text-xs text-[var(--pf-orange)] mb-1">{product.artist}</p>
                  <h3 className="font-medium text-sm truncate">{product.name}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-xs">{product.rating}</span>
                    <span className="text-xs text-[var(--pf-text-muted)]">({product.reviews})</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold">${product.price}</span>
                    <span className="text-xs text-green-400">${product.artistCut.toFixed(0)} to artist</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Trust Badges */}
        <section className="grid grid-cols-3 gap-4 mb-8">
          <div className="pf-card p-4 text-center">
            <Truck className="mx-auto mb-2 text-[var(--pf-orange)]" size={24} />
            <p className="text-sm font-medium">Free Shipping</p>
            <p className="text-xs text-[var(--pf-text-muted)]">Orders $50+</p>
          </div>
          <div className="pf-card p-4 text-center">
            <Shield className="mx-auto mb-2 text-[var(--pf-orange)]" size={24} />
            <p className="text-sm font-medium">Secure Checkout</p>
            <p className="text-xs text-[var(--pf-text-muted)]">256-bit SSL</p>
          </div>
          <div className="pf-card p-4 text-center">
            <RotateCcw className="mx-auto mb-2 text-[var(--pf-orange)]" size={24} />
            <p className="text-sm font-medium">Easy Returns</p>
            <p className="text-xs text-[var(--pf-text-muted)]">30-day policy</p>
          </div>
        </section>

        {/* Everyday Essentials */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Everyday Essentials</h2>
            <span className="text-sm text-purple-400">20% to artists</span>
          </div>
          <p className="text-[var(--pf-text-secondary)] mb-4">
            Buy what you need. Support artists. Same prices as anywhere else.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <Link key={product.id} href={`/product/${product.id}`} className="pf-card group overflow-hidden">
                <div className="aspect-square bg-[var(--pf-surface)] relative">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  {product.originalPrice && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded">
                      SALE
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs text-[var(--pf-text-muted)] capitalize">{product.category}</p>
                  <h3 className="font-medium text-sm truncate mt-1">{product.name}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    {Array(5).fill(0).map((_, i) => (
                      <Star key={i} size={10} className={i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'} />
                    ))}
                    <span className="text-xs text-[var(--pf-text-muted)]">{product.reviews.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <span className="font-bold">${product.price}</span>
                      {product.originalPrice && (
                        <span className="text-xs text-[var(--pf-text-muted)] line-through ml-1">${product.originalPrice}</span>
                      )}
                    </div>
                    <span className="text-xs text-purple-400">+${product.artistCut.toFixed(0)} to artists</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Shop by Category */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className="pf-card p-6 text-center hover:border-[var(--pf-orange)] transition-colors"
              >
                <span className="text-3xl mb-2 block">{cat.icon}</span>
                <span className="font-medium">{cat.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* How it Works */}
        <section className="pf-card p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">How Porterful Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="w-16 h-16 rounded-full bg-[var(--pf-orange)]/20 flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="text-[var(--pf-orange)]" size={28} />
              </div>
              <h3 className="font-bold mb-2">Shop Like Normal</h3>
              <p className="text-[var(--pf-text-secondary)]">Browse products, add to cart, checkout - same prices as Amazon</p>
            </div>
            <div>
              <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                <Heart className="text-purple-400" size={28} />
              </div>
              <h3 className="font-bold mb-2">Artists Get Paid</h3>
              <p className="text-[var(--pf-text-secondary)]">Every purchase sends money to artists. 80% on merch, 20% on essentials.</p>
            </div>
            <div>
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <Star className="text-green-400" size={28} />
              </div>
              <h3 className="font-bold mb-2">Feel Good Shopping</h3>
              <p className="text-[var(--pf-text-secondary)]">Same stuff, same prices, but your money supports creators.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}