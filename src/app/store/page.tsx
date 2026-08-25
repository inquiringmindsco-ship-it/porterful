'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Headphones, ShoppingBag, Heart, Share2, Star, Disc3 } from 'lucide-react';
import { TRACKS } from '@/lib/data';

// Artist data
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

// Product type matching API response
interface StoreProduct {
  id: string;
  name: string;
  title: string;
  category: string;
  artist: string;
  image: string;
  images?: string[];
  price: number;
  salePrice?: number;
  inStock: boolean;
  available?: boolean;
  purchasable?: boolean;
  rating: number;
  reviews: number;
  colors?: string[];
  sizes?: string[];
}

// Albums for the artist
const ALBUMS = [
  { id: 'ambiguous', title: 'Ambiguous', year: '2026', tracks: 21, image: '/album-art/Ambiguous.jpg' },
  { id: 'from-feast-to-famine', title: 'From Feast to Famine', year: '2025', tracks: 10, image: '/album-art/From_Feast_to_Famine.jpg' },
  { id: 'god-is-good', title: 'God Is Good', year: '2024', tracks: 9, image: '/album-art/God_Is_Good.jpg' },
  { id: 'one-day', title: 'One Day', year: '2023', tracks: 19, image: '/album-art/One_Day.jpg' },
];

// Top 5 tracks by plays
const TOP_TRACKS = TRACKS
  .sort((a, b) => (b.plays || 0) - (a.plays || 0))
  .slice(0, 5);

export default function ArtistStorePage() {
  const [activeTab, setActiveTab] = useState<'all' | 'apparel' | 'tech' | 'accessories'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products?limit=200&sort=popular');
      const data = await res.json();
      const mapped: StoreProduct[] = (data.products || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        title: p.name,
        category: p.category,
        artist: p.artist || 'Porterful',
        image: p.images?.[0] || p.image,
        images: p.images,
        price: p.salePrice || p.price || 0,
        salePrice: p.salePrice,
        inStock: p.inStock !== false && p.available !== false && p.purchasable !== false,
        available: p.available,
        purchasable: p.purchasable,
        rating: p.rating || 0,
        reviews: p.reviews || 0,
        colors: p.colors,
        sizes: p.sizes,
      }));
      setProducts(mapped);
    } catch (err) {
      console.error('Failed to fetch store products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const formatPlays = (plays: number) => {
    if (plays >= 1000000) return `${(plays / 1000000).toFixed(1)}M`;
    if (plays >= 1000) return `${(plays / 1000).toFixed(0)}K`;
    return plays.toString();
  };

  const filteredProducts = products.filter(product => {
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        product.name.toLowerCase().includes(query) ||
        product.title.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.artist.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }
    // Apply category filter
    if (activeTab === 'all') return true;
    if (activeTab === 'apparel') return product.category === 'Apparel';
    if (activeTab === 'tech') return product.category === 'Tech';
    if (activeTab === 'accessories') return product.category === 'Accessories';
    return true;
  });

  return (
    <div className="min-h-screen bg-[var(--pf-bg)]">
      {/* Artist Hero */}
      <section className="relative py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--pf-orange)]/5 via-transparent to-[var(--pf-bg)]" />
        
        <div className="relative z-10 pf-container">
          <div className="max-w-4xl mx-auto">
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
                    <p className="text-2xl font-bold">{TRACKS.length}</p>
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

      {/* Albums Section */}
      <section className="py-12 bg-[var(--pf-bg-secondary)]">
        <div className="pf-container">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Albums</h2>
              <Link href="/digital" className="text-[var(--pf-orange)] hover:underline text-sm font-medium flex items-center gap-1">
                View all <Disc3 size={16} />
              </Link>
            </div>

            {/* Albums Horizontal Scroll */}
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
              {ALBUMS.map((album) => (
                <Link
                  key={album.id}
                  href="/digital"
                  className="flex-shrink-0 w-48 group"
                >
                  <div className="aspect-square rounded-xl overflow-hidden mb-3 relative bg-[var(--pf-surface)]">
                    <Image
                      src={album.image}
                      alt={album.title}
                      fill
                      sizes="192px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-[var(--pf-orange)] flex items-center justify-center">
                        <Play size={20} className="text-white ml-1" />
                      </div>
                    </div>
                  </div>
                  <h3 className="font-semibold group-hover:text-[var(--pf-orange)] transition-colors truncate">{album.title}</h3>
                  <p className="text-sm text-[var(--pf-text-muted)]">{album.year} • {album.tracks} tracks</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Products / Merch */}
      <section className="py-12">
        <div className="pf-container">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Shop</h2>
              
              {/* Tabs */}
              <div className="flex gap-2">
                {(['all', 'apparel', 'tech', 'accessories'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? 'bg-[var(--pf-orange)] text-white'
                        : 'bg-[var(--pf-surface)] text-[var(--pf-text-secondary)] hover:text-white'
                    }`}
                  >
                    {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-[var(--pf-surface)] rounded-xl animate-pulse">
                    <div className="aspect-square bg-[var(--pf-border)]" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-[var(--pf-border)] rounded w-3/4" />
                      <div className="h-3 bg-[var(--pf-border)] rounded w-1/2" />
                      <div className="h-5 bg-[var(--pf-border)] rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-6">
                {filteredProducts.slice(0, 12).map((product) => (
                  <Link 
                    key={product.id}
                    href={`/product/${product.id}`}
                    className="group"
                  >
                    <div className="aspect-square rounded-xl overflow-hidden mb-4 relative bg-[var(--pf-surface)]">
                      <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="bg-white/90 text-gray-800 text-sm font-bold px-3 py-1 rounded-full">
                            Sold Out
                          </span>
                        </div>
                      )}
                      {product.colors && product.colors.length > 1 && (
                        <div className="absolute top-3 right-3 bg-[var(--pf-surface)]/90 backdrop-blur-sm text-[var(--pf-text)] text-xs px-2 py-0.5 rounded-full">
                          {product.colors.length} colors
                        </div>
                      )}
                    </div>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-[var(--pf-text-muted)] uppercase tracking-wider mb-1">
                          {product.category}
                        </p>
                        <h3 className="text-lg font-semibold group-hover:text-[var(--pf-orange)] transition-colors">
                          {product.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <Star size={14} className="text-yellow-500 fill-yellow-500" />
                            <span className="text-sm text-[var(--pf-text-secondary)]">{product.rating.toFixed(1)}</span>
                          </div>
                          <span className="text-xs text-[var(--pf-text-muted)]">({product.reviews})</span>
                        </div>
                      </div>
                      <span className="text-xl font-bold text-[var(--pf-orange)]">${product.price.toFixed(2)}</span>
                    </div>
                    <div className="mt-2">
                      <span className={`text-xs font-medium ${
                        !product.inStock 
                          ? 'text-red-500' 
                          : product.reviews < 10 
                            ? 'text-yellow-500' 
                            : 'text-green-500'
                      }`}>
                        {!product.inStock ? 'Out of Stock' : product.reviews < 10 ? 'Low Stock' : 'In Stock'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-[var(--pf-text-muted)]">
                <ShoppingBag size={48} className="mx-auto mb-4 opacity-50" />
                <p>No products in this category yet.</p>
              </div>
            )}
            
            {!loading && filteredProducts.length > 12 && (
              <div className="text-center mt-8">
                <Link href="/marketplace" className="pf-btn pf-btn-secondary">
                  View All Products →
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Top Tracks */}
      <section className="py-12 bg-[var(--pf-bg-secondary)]">
        <div className="pf-container">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Top Tracks</h2>
              <Link href="/digital" className="text-[var(--pf-orange)] hover:underline flex items-center gap-1 text-sm">
                View all <Headphones size={16} />
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
                    <div className="w-12 h-12 rounded relative shrink-0 hidden sm:block">
                      <Image src={track.image} alt={track.album || track.title} fill sizes="48px" className="object-cover rounded" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate group-hover:text-[var(--pf-orange)] transition-colors">{track.title}</p>
                      <p className="text-sm text-[var(--pf-text-muted)] truncate">{track.album}</p>
                    </div>
                    <span className="text-sm text-[var(--pf-text-muted)] hidden sm:block">{formatPlays(track.plays || 0)} plays</span>
                    <span className="text-sm font-medium">${track.price}</span>
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
                <Link href="/signup/superfan" className="pf-btn pf-btn-primary">
                  <Heart className="inline mr-2" size={18} />
                  Become a Superfan
                </Link>
                <Link href="/marketplace" className="pf-btn pf-btn-secondary">
                  <ShoppingBag className="inline mr-2" size={18} />
                  Browse Marketplace
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
