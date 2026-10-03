'use client';

import { useState, useEffect, useCallback, useMemo, useDeferredValue } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { Play, Headphones, ShoppingBag, Heart, Share2, Star, Disc3, Search, Plus } from 'lucide-react';
import { TRACKS } from '@/lib/data';
import { useCart } from '@/lib/cart-context';
import { useToast } from '@/components/Toast';

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
  visibilityStatus?: string;
  rating: number;
  reviews: number;
  colors?: string[];
  sizes?: string[];
  lowStock?: boolean; // true when stock is running low but still available
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

// Artist JSON-LD for rich search results
const ARTIST_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'MusicGroup',
  '@id': 'https://porterful.com/artist/od-porter',
  name: ARTIST.name,
  description: ARTIST.bio,
  url: 'https://porterful.com/artist/od-porter',
  image: 'https://porterful.com/album-art/Ambiguous.jpg',
  genre: ARTIST.genre,
  areaServed: { '@type': 'City', name: ARTIST.location },
  sameAs: [
    'https://twitter.com/odporter',
    'https://instagram.com/od.porter',
    'https://youtube.com/@odporter',
    'https://tiktok.com/@odporter',
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Official Merch & Music',
    url: 'https://porterful.com/shop',
  },
};

export function StoreClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  type TabValue = 'all' | 'apparel' | 'tech' | 'home' | 'accessories' | 'art';
  type SortValue = 'popular' | 'price_asc' | 'price_desc' | 'rating' | 'name_asc';

  const [activeTab, setActiveTab] = useState<TabValue>(
    () => (searchParams.get('category') as TabValue) || 'all'
  );
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');
  const deferredQuery = useDeferredValue(searchInput);
  const [sortBy, setSortBy] = useState<SortValue>(
    () => (searchParams.get('sort') as SortValue) || 'popular'
  );
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsPerPage, setProductsPerPage] = useState(12);
  const [loadingMore, setLoadingMore] = useState(false);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [totalProducts, setTotalProducts] = useState(0);
  const { addItem } = useCart();
  const { showToast } = useToast();

  // Sync state changes to URL params
  const updateUrl = useCallback((updates: { tab?: TabValue; q?: string; sort?: SortValue }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (updates.tab !== undefined) {
      if (updates.tab === 'all') params.delete('category');
      else params.set('category', updates.tab);
    }
    if (updates.q !== undefined) {
      if (updates.q) params.set('q', updates.q);
      else params.delete('q');
    }
    if (updates.sort !== undefined) {
      if (updates.sort === 'popular') params.delete('sort');
      else params.set('sort', updates.sort);
    }
    const query = params.toString();
    router.push(`/store${query ? `?${query}` : ''}`, { scroll: false });
  }, [router, searchParams]);

  const handleTabChange = useCallback((tab: TabValue) => {
    setActiveTab(tab);
    updateUrl({ tab });
  }, [updateUrl]);

  const handleSearch = useCallback((q: string) => {
    setSearchInput(q);
    updateUrl({ q });
  }, [updateUrl]);

  const handleSortChange = useCallback((sort: SortValue) => {
    setSortBy(sort);
    updateUrl({ sort });
  }, [updateUrl]);

  // Load wishlist from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('porterful-wishlist');
        if (saved) setWishlist(new Set(JSON.parse(saved)));
      } catch {}
    }
  }, []);

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
        showToast('Removed from wishlist', 'success');
      } else {
        next.add(productId);
        showToast('Added to wishlist', 'success');
      }
      localStorage.setItem('porterful-wishlist', JSON.stringify([...next]));
      return next;
    });
  };


  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products?limit=200&sort=popular');
      const data = await res.json();
      setTotalProducts(data.total || data.products?.length || 0);
      const mapped: StoreProduct[] = (data.products || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        title: p.name,
        category: p.category,
        artist: p.artist || 'Porterful',
        image: p.images?.[0] || p.image,
        images: p.images,
        price: p.price || 0,
        salePrice: p.salePrice,
        inStock: p.inStock !== false && p.available !== false && p.purchasable !== false,
        available: p.available,
        purchasable: p.purchasable !== false, // default to true if undefined
        visibilityStatus: p.visibilityStatus,
        rating: p.rating || 0,
        reviews: p.reviews || 0,
        colors: p.colors,
        sizes: p.sizes,
        // Flag low-stock items: available but inventory is flagged low
        // Printful reports low_stock=true when items are running low
        lowStock: p.lowStock === true || p.inventoryStatus === 'low',
      }));
      setProducts(mapped);
    } catch (err) {
      showToast('Failed to load products. Please refresh.', 'error');
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

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Apply search filter
      if (deferredQuery.trim()) {
        const query = deferredQuery.toLowerCase();
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
      if (activeTab === 'home') return product.category === 'Home & Living';
      if (activeTab === 'accessories') return product.category === 'Accessories';
      if (activeTab === 'art') return product.category === 'Art' || product.category === 'Music';
      return true;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return (a.salePrice || a.price) - (b.salePrice || b.price);
        case 'price_desc':
          return (b.salePrice || b.price) - (a.salePrice || a.price);
        case 'rating':
          return b.rating - a.rating;
        case 'name_asc':
          return a.title.localeCompare(b.title);
        case 'popular':
        default:
          return (b.reviews || 0) - (a.reviews || 0);
      }
    });
  }, [products, searchInput, activeTab, sortBy]);

  return (
    <div className="min-h-screen bg-[var(--pf-bg)]">
      {/* JSON-LD Artist Schema for SEO */}
      <Script
        id="artist-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(ARTIST_JSON_LD),
        }}
      />
      {/* JSON-LD ProductList Schema for SEO */}
      <Script
        id="product-list-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Porterful Store - Independent Artist Merch & Music',
            description: 'Shop music, merch, and products from independent creators. 80% of proceeds go directly to artists.',
            url: 'https://porterful.com/shop',
            numberOfItems: totalProducts || filteredProducts.length,
            itemListElement: filteredProducts.slice(0, 20).map((product, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              url: `https://porterful.com/product/${product.id}`,
              name: product.title,
              image: product.image,
              offers: {
                '@type': 'Offer',
                price: product.salePrice?.toFixed(2) || product.price?.toFixed(2) || '0.00',
                priceCurrency: 'USD',
                availability: product.inStock
                  ? 'https://schema.org/InStock'
                  : 'https://schema.org/OutOfStock',
              },
            })),
          }),
        }}
      />
      {/* JSON-LD BreadcrumbList for SEO */}
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://porterful.com',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Store',
                item: 'https://porterful.com/shop',
              },
            ],
          }),
        }}
      />
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-[var(--pf-orange)] focus:text-white focus:rounded-lg focus:text-sm focus:font-semibold focus:outline-none focus:ring-2 focus:ring-white">
        Skip to main content
      </a>
      <main id="main-content">
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
                  <button
                    onClick={() => showToast('You\'re now following O D Porter!', 'success')}
                    className="pf-btn pf-btn-secondary"
                  >
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
                  href={`/album/${album.id}`}
                  className="flex-shrink-0 w-48 group"
                >
                  <div className="aspect-square rounded-xl overflow-hidden mb-3 relative bg-[var(--pf-surface)]">
                    <Image
                      src={album.image}
                      alt={`${album.title} album cover by ${ARTIST.name}`}
                      fill
                      sizes="192px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      loading={album.id === 'ambiguous' ? 'eager' : 'lazy'}
                      priority={album.id === 'ambiguous'}
                      fetchPriority={album.id === 'ambiguous' ? 'high' : 'low'}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect fill='%23374151' width='100' height='100'/><text x='50' y='50' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='12'>${encodeURIComponent(album.title)}</text></svg>`;
                      }}
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
      <section className="py-12" id="products-section">
        <div className="pf-container">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold">Shop</h2>
              
              {/* Search Input */}
              <div className="relative w-full sm:w-auto sm:min-w-[240px]">
                <label htmlFor="product-search" className="sr-only">Search products</label>
                <input
                  id="product-search"
                  type="text"
                  placeholder="Search products..."
                  value={searchInput}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full px-4 py-2 pl-10 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] text-[var(--pf-text)] placeholder:text-[var(--pf-text-muted)] focus:outline-none focus:border-[var(--pf-orange)] transition-colors text-sm"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--pf-text-muted)]"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </svg>
                {searchInput && (
                  <button
                    onClick={() => handleSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--pf-text-muted)] hover:text-[var(--pf-text)]"
                    aria-label="Clear search"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                  </button>
                )}
              </div>
            </div>
            
            {/* Tabs - horizontal scroll on mobile */}
            <div role="tablist" aria-label="Filter products by category" className="flex gap-2 overflow-x-auto pb-2 -mb-2 scrollbar-hide md:overflow-visible md:pb-0 md:mb-0">
              {([
                { key: 'all', label: 'All', count: products.filter(p => p.inStock).length },
                { key: 'apparel', label: 'Apparel', count: products.filter(p => p.category === 'Apparel' && p.inStock).length },
                { key: 'tech', label: 'Tech', count: products.filter(p => p.category === 'Tech' && p.inStock).length },
                { key: 'home', label: 'Home & Living', count: products.filter(p => p.category === 'Home & Living' && p.inStock).length },
                { key: 'accessories', label: 'Accessories', count: products.filter(p => p.category === 'Accessories' && p.inStock).length },
                { key: 'art', label: 'Art & Music', count: products.filter(p => (p.category === 'Art' || p.category === 'Music') && p.inStock).length },
              ] as const).map(({ key, label, count }) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={activeTab === key}
                  aria-controls="products-panel"
                  id={`tab-${key}`}
                  tabIndex={activeTab === key ? 0 : -1}
                  onClick={() => handleTabChange(key as typeof activeTab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 flex items-center gap-1.5 ${
                    activeTab === key
                      ? 'bg-[var(--pf-orange)] text-white'
                      : 'bg-[var(--pf-surface)] text-[var(--pf-text-secondary)] hover:text-white'
                  }`}
                >
                  {label}
                  {!loading && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      activeTab === key ? 'bg-white/20 text-white' : 'bg-[var(--pf-border)] text-[var(--pf-text-muted)]'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Results count + sort */}
            {!loading && (
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <span role="status" aria-live="polite" aria-atomic="true" className="text-sm text-[var(--pf-text-muted)]">
                  {searchInput ? (
                    <>Found <span className="font-medium text-[var(--pf-text)]">{filteredProducts.length}</span> result{filteredProducts.length !== 1 ? 's' : ''} for "<span className="text-[var(--pf-text)]">{searchInput}</span>"</>
                  ) : filteredProducts.length > productsPerPage ? (
                    <>Showing <span className="font-medium text-[var(--pf-text)]">{Math.min(filteredProducts.length, productsPerPage)}</span> of <span className="font-medium text-[var(--pf-text)]">{filteredProducts.length}</span> products</>
                  ) : (
                    <><span className="font-medium text-[var(--pf-text)]">{filteredProducts.length}</span> product{filteredProducts.length !== 1 ? 's' : ''}</>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <label htmlFor="sort-select" className="text-sm text-[var(--pf-text-muted)] whitespace-nowrap">Sort by:</label>
                  <select
                    id="sort-select"
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value as typeof sortBy)}
                    className="text-sm px-3 py-1.5 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] text-[var(--pf-text)] focus:outline-none focus:border-[var(--pf-orange)] cursor-pointer"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="rating">Highest Rated</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="name_asc">Name: A–Z</option>
                  </select>
                </div>
              </div>
            )}

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
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
              <ul
                id="products-panel"
                role="tabpanel"
                aria-labelledby={`tab-${activeTab}`}
                className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 list-none m-0 p-0"
                aria-label={`${filteredProducts.length} products`}
              >
                {filteredProducts.slice(0, productsPerPage).map((product) => (
                  <li
                    key={product.id}
                    className="group relative bg-[var(--pf-surface)] rounded-xl overflow-hidden hover:ring-2 hover:ring-[var(--pf-orange)]/50 transition-all focus-within:ring-2 focus-within:ring-[var(--pf-orange)]"
                    role="listitem"
                  >
                    {/* Image area — on touch devices, tapping image adds to cart; keyboard users navigate normally */}
                    <Link href={`/product/${product.id}`} className="block focus:outline-none" onClick={(e) => {
                      // Only intercept touch taps, not keyboard navigation (Enter key)
                      const pointerType = (e as unknown as MouseEvent & { pointerType?: string }).pointerType;
                      if (product.inStock && product.purchasable !== false && pointerType === 'touch') {
                        e.preventDefault();
                        addItem({
                          productId: product.id,
                          name: product.title,
                          artist: product.artist,
                          price: product.salePrice || product.price,
                          image: product.image,
                          artistCut: (product.salePrice || product.price) * 0.8,
                        });
                        showToast(`${product.title} added to cart`, 'success');
                      }
                    }}>
                      <div className="aspect-square relative bg-[var(--pf-surface)]">
                        <Image
                          src={product.image}
                          alt={`${product.title} by ${product.artist} — ${product.category} on Porterful`}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          decoding="async"
                          priority={products.indexOf(product) < 6 ? 'high' : 'low'}
                          fetchPriority={products.indexOf(product) < 6 ? 'high' : 'auto'}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect fill='%23374151' width='100' height='100'/><text x='50' y='50' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='10'>${encodeURIComponent(product.title)}</text></svg>`;
                          }}
                        />
                        {!product.inStock && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                              product.visibilityStatus === 'preview' 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-white/90 text-gray-800'
                            }`}>
                              {product.visibilityStatus === 'preview' ? 'Coming Soon' : 'Sold Out'}
                            </span>
                          </div>
                        )}
                        {/* Badges stack: Sale on top-left, then colors, then low-stock at bottom-left */}
                        {product.salePrice && product.salePrice < product.price && (
                          <div className="absolute top-3 left-3 bg-[var(--pf-orange)] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            Sale
                          </div>
                        )}
                        {product.colors && product.colors.length > 1 && (
                          <div className={`absolute ${product.salePrice && product.salePrice < product.price ? 'top-10' : 'top-3'} left-3 bg-[var(--pf-surface)]/90 backdrop-blur-sm text-[var(--pf-text)] text-xs px-2 py-0.5 rounded-full`}>
                            {product.colors.length} colors
                          </div>
                        )}
                        {product.lowStock && product.inStock && (
                          <div className="absolute bottom-3 left-3 bg-orange-500/90 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            Only a few left
                          </div>
                        )}
                      </div>
                    </Link>
                    {/* Action buttons - positioned above the stretched link */}
                    <div className="absolute top-3 right-3 flex gap-2 z-10">
                      {/* Wishlist heart */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleWishlist(product.id);
                        }}
                        className={`bg-[var(--pf-surface)]/90 backdrop-blur-sm rounded-full p-2.5 md:p-2 shadow-lg transition-all active:scale-95 ${wishlist.has(product.id) ? 'text-red-500' : 'text-[var(--pf-text-muted)]'}`}
                        aria-label={wishlist.has(product.id) ? `Remove ${product.title} from wishlist` : `Add ${product.title} to wishlist`}
                      >
                        <Heart size={16} className={wishlist.has(product.id) ? 'fill-red-500' : ''} />
                      </button>
                    </div>
                    {/* Quick Add / View Options button */}
                    {product.inStock && product.purchasable !== false && (
                      product.sizes?.length || product.colors?.length ? (
                        <Link
                          href={`/product/${product.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="absolute bottom-3 right-3 bg-[var(--pf-orange)] hover:bg-[var(--pf-orange-dark)] text-white rounded-full p-2 shadow-lg transition-all active:scale-95 z-10 focus:opacity-100 opacity-100 group-hover:opacity-100"
                          aria-label={`Choose options for ${product.title}`}
                        >
                          <Plus size={16} />
                        </Link>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addItem({
                              productId: product.id,
                              name: product.title,
                              artist: product.artist,
                              price: product.salePrice || product.price,
                              image: product.image,
                              artistCut: (product.salePrice || product.price) * 0.8,
                            });
                            showToast(`${product.title} added to cart`, 'success');
                          }}
                          className="absolute bottom-3 right-3 bg-[var(--pf-orange)] hover:bg-[var(--pf-orange-dark)] text-white rounded-full p-2 shadow-lg transition-all active:scale-95 z-10 focus:opacity-100 opacity-100 group-hover:opacity-100"
                          aria-label={`Add ${product.title} to cart`}
                        >
                          <Plus size={16} />
                        </button>
                      )
                    )}
                    {/* Product info */}
                    <div className="p-4">
                      <Link href={`/product/${product.id}`} className="block focus:outline-none focus:no-underline">
                        <p className="text-xs text-[var(--pf-text-muted)] uppercase tracking-wider mb-1">
                          {product.category}
                        </p>
                        <h3 className="text-base md:text-lg font-semibold group-hover:text-[var(--pf-orange)] transition-colors line-clamp-2 focus:text-[var(--pf-orange)]">
                          {product.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <Star size={14} className="text-yellow-500 fill-yellow-500" />
                            <span className="text-sm text-[var(--pf-text-secondary)]">{product.rating.toFixed(1)}</span>
                          </div>
                          <span className="text-xs text-[var(--pf-text-muted)]">({product.reviews})</span>
                        </div>
                      </Link>
                      <div className="flex items-start justify-between mt-2">
                        <div className="text-right">
                          {product.salePrice && product.salePrice < product.price ? (
                            <>
                              <span className="text-base md:text-xl font-bold text-[var(--pf-orange)]">${product.salePrice.toFixed(2)}</span>
                              <span className="text-sm text-[var(--pf-text-muted)] line-through ml-2">${product.price.toFixed(2)}</span>
                            </>
                          ) : (
                            <span className="text-base md:text-xl font-bold text-[var(--pf-orange)]">${product.price.toFixed(2)}</span>
                          )}
                        </div>
                        {/* Low stock hint */}
                        {product.lowStock && (
                          <span className="text-xs text-orange-500 font-medium mt-1 block">Only a few left</span>
                        )}
                      </div>
                    </div>
                    {/* Show status label only when unavailable */}
                    {!product.inStock || !product.purchasable ? (
                      <div className="px-4 pb-4">
                        <span className="text-xs font-medium text-red-500">
                          {product.visibilityStatus === 'preview' ? 'Coming Soon' : 'Sold Out'}
                        </span>
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : filteredProducts.length === 0 && !loading ? (
              <div className="text-center py-16 text-[var(--pf-text-muted)]">
                <ShoppingBag size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium text-[var(--pf-text)]">No products available yet</p>
                <p className="text-sm mt-1">Check back soon — new drops are coming!</p>
                {searchInput && (
                  <>
                    <p className="text-sm mt-3">No results for "<span className="text-[var(--pf-text)]">{searchInput}</span>"</p>
                    <button
                      onClick={() => handleSearch('')}
                      className="mt-2 text-[var(--pf-orange)] hover:underline text-sm"
                    >
                      Clear search
                    </button>
                  </>
                )}
                {!searchInput && (
                  <Link href="/digital" className="inline-block mt-4 text-[var(--pf-orange)] hover:underline text-sm">
                    Browse music instead →
                  </Link>
                )}
              </div>
            ) : null}
            
            {!loading && filteredProducts.length > productsPerPage && (
              <div className="text-center mt-8">
                <button
                  onClick={() => {
                    setLoadingMore(true);
                    // Simulate brief loading for perceived responsiveness
                    setTimeout(() => {
                      setProductsPerPage(prev => prev + 12);
                      setLoadingMore(false);
                      // Scroll to products section more reliably
                      const section = document.getElementById('products-section');
                      if (section) {
                        const top = section.getBoundingClientRect().top + window.scrollY - 80;
                        window.scrollTo({ top, behavior: 'smooth' });
                      }
                    }, 300);
                  }}
                  disabled={loadingMore}
                  className="pf-btn pf-btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingMore ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </span>
                  ) : (
                    <>Load More Products ({filteredProducts.length - productsPerPage} remaining)</>
                  )}
                </button>
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
                    <button
                      className="w-10 h-10 rounded-lg bg-[var(--pf-surface)] flex items-center justify-center group-hover:bg-[var(--pf-orange)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pf-orange)]"
                      aria-label={`Play ${track.title}`}
                      onClick={() => showToast(`Playing "${track.title}" — use the music player!`, 'info')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          showToast(`Playing "${track.title}" — use the music player!`, 'info');
                        }
                      }}
                    >
                      <Play size={16} className="text-white ml-0.5" />
                    </button>
                    <div className="w-12 h-12 rounded relative shrink-0 hidden sm:block">
                      <Image src={track.image} alt={`${track.title} album art`} fill sizes="48px" className="object-cover rounded" onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }} />
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
                <Link href="/store" className="pf-btn pf-btn-secondary">
                  <ShoppingBag className="inline mr-2" size={18} />
                  Browse Marketplace
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      </main>
    </div>
  );
}
