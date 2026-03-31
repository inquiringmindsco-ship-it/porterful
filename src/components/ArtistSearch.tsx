'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Music, ShoppingBag, X, TrendingUp, Users, ArrowRight } from 'lucide-react';

interface Artist {
  id: string;
  name: string;
  slug: string;
  avatar?: string;
  genre?: string;
  productCount?: number;
  trackCount?: number;
}

interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  image: string;
  duration?: string;
  price: number;
}

interface SearchResult {
  artists: Artist[];
  products: any[];
  tracks: Track[];
  stations: any[];
  resources: { name: string; description: string; url: string; category: string }[];
}

const EXTERNAL_RESOURCES = [
  { name: 'Credit Klimb™', description: 'Free credit repair tools & resources', url: 'https://creditklimb.com', category: 'Resources' },
];

export function ArtistSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Search debounced
  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Calculate total results for keyboard navigation
  const totalResults = (results?.artists?.length || 0) + (results?.tracks?.length || 0) + (results?.products?.length || 0);

  // Close on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const artistsLen = results?.artists?.length || 0;
    const tracksLen = results?.tracks?.length || 0;
    const productsLen = results?.products?.length || 0;
    const totalResults = artistsLen + tracksLen + productsLen;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, totalResults - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      // Handle selection
      const artists = results?.artists || [];
      const tracks = results?.tracks || [];
      const products = results?.products || [];
      
      if (selectedIndex < artistsLen) {
        window.location.href = `/artist/${artists[selectedIndex].slug}`;
      } else if (selectedIndex < artistsLen + tracksLen) {
        window.location.href = `/artist/od-porter`;
      } else {
        const productIndex = selectedIndex - artistsLen - tracksLen;
        if (products[productIndex]) {
          window.location.href = `/product/${products[productIndex].id}`;
        }
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults(null);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const showResults = isOpen && query.trim().length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl">
      {/* Search Input */}
      <div className={`relative flex items-center rounded-xl border transition-all ${
        isOpen 
          ? 'border-[var(--pf-orange)] bg-[var(--pf-surface)] shadow-lg shadow-[var(--pf-orange)]/10' 
          : 'border-[var(--pf-border)] bg-[var(--pf-surface)] hover:border-[var(--pf-orange)]/50'
      }`}>
        <Search size={20} className="absolute left-4 text-[var(--pf-text-muted)]" />
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search artists, music, merch..."
          className="w-full py-3 px-12 bg-transparent text-[var(--pf-text)] placeholder-[var(--pf-text-muted)] focus:outline-none"
        />
        
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-4 p-1 rounded-full hover:bg-[var(--pf-border)] transition-colors"
          >
            <X size={16} className="text-[var(--pf-text-muted)]" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-xl shadow-2xl overflow-hidden z-[100]">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-6 h-6 border-2 border-[var(--pf-orange)] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-[var(--pf-text-muted)] mt-2">Searching...</p>
            </div>
          ) : results && (results.artists.length > 0 || results.tracks?.length > 0 || results.products.length > 0) ? (
            <div className="max-h-[400px] overflow-y-auto">
              {/* Artists */}
              {results.artists.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-medium text-[var(--pf-text-muted)] border-b border-[var(--pf-border)] flex items-center gap-2">
                    <Music size={12} />
                    ARTISTS
                  </div>
                  {results.artists.map((artist, i) => (
                    <Link
                      key={artist.id}
                      href={`/artist/${artist.slug}`}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 hover:bg-[var(--pf-bg)] transition-colors ${
                        selectedIndex === i ? 'bg-[var(--pf-bg)]' : ''
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--pf-orange)] to-purple-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                        {artist.avatar ? (
                          <Image src={artist.avatar} alt={artist.name} width={40} height={40} className="object-cover" />
                        ) : (
                          artist.name.charAt(0)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-[var(--pf-text)] truncate">{artist.name}</div>
                        {artist.genre && (
                          <div className="text-xs text-[var(--pf-text-muted)]">{artist.genre}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[var(--pf-text-muted)]">
                        {artist.trackCount !== undefined && (
                          <span className="flex items-center gap-1">
                            <Music size={12} /> {artist.trackCount}
                          </span>
                        )}
                        {artist.productCount !== undefined && (
                          <span className="flex items-center gap-1">
                            <ShoppingBag size={12} /> {artist.productCount}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Tracks */}
              {results.tracks && results.tracks.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-medium text-[var(--pf-text-muted)] border-b border-[var(--pf-border)] flex items-center gap-2">
                    <Music size={12} />
                    TRACKS
                  </div>
                  {results.tracks.slice(0, 5).map((track: Track, i: number) => (
                    <Link
                      key={track.id}
                      href={`/digital?track=${track.id}`}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 hover:bg-[var(--pf-bg)] transition-colors ${
                        selectedIndex === results.artists.length + i ? 'bg-[var(--pf-bg)]' : ''
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-[var(--pf-bg)] overflow-hidden flex-shrink-0">
                        {track.image && (
                          <Image src={track.image} alt={track.title} width={40} height={40} className="object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-[var(--pf-text)] truncate">{track.title}</div>
                        <div className="text-xs text-[var(--pf-text-muted)]">{track.artist}</div>
                      </div>
                      <div className="font-bold text-[var(--pf-orange)]">
                        ${track.price}
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Products */}
              {results.products.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-medium text-[var(--pf-text-muted)] border-b border-[var(--pf-border)] border-t border-[var(--pf-border)] flex items-center gap-2">
                    <ShoppingBag size={12} />
                    MERCH
                  </div>
                  {results.products.slice(0, 5).map((product: any, i: number) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.id}`}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 hover:bg-[var(--pf-bg)] transition-colors ${
                        selectedIndex === results.artists.length + (results.tracks?.length || 0) + i ? 'bg-[var(--pf-bg)]' : ''
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-[var(--pf-bg)] overflow-hidden flex-shrink-0">
                        {product.image && (
                          <Image src={product.image} alt={product.name} width={40} height={40} className="object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-[var(--pf-text)] truncate">{product.name}</div>
                        <div className="text-xs text-[var(--pf-text-muted)]">{product.artistName}</div>
                      </div>
                      <div className="font-bold text-[var(--pf-orange)]">
                        ${product.price}
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Resources */}
              {EXTERNAL_RESOURCES.filter(r => 
                r.name.toLowerCase().includes(query.toLowerCase()) ||
                r.description.toLowerCase().includes(query.toLowerCase())
              ).length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-medium text-[var(--pf-text-muted)] border-b border-[var(--pf-border)] border-t border-[var(--pf-border)] flex items-center gap-2">
                    <TrendingUp size={12} />
                    PARTNER RESOURCES
                  </div>
                  {EXTERNAL_RESOURCES.filter(r => 
                    r.name.toLowerCase().includes(query.toLowerCase()) ||
                    r.description.toLowerCase().includes(query.toLowerCase())
                  ).map((resource, i) => (
                    <a
                      key={resource.name}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--pf-bg)] transition-colors border-b border-[var(--pf-border)] last:border-0"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                        CK
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-[var(--pf-text)] truncate flex items-center gap-2">
                          {resource.name}
                          <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">Partner</span>
                        </div>
                        <div className="text-xs text-[var(--pf-text-muted)]">{resource.description}</div>
                      </div>
                      <ArrowRight size={16} className="text-green-400" />
                    </a>
                  ))}
                </div>
              )}

              {/* View All */}
              {false && (
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-center text-sm text-[var(--pf-orange)] hover:bg-[var(--pf-bg)] border-t border-[var(--pf-border)]"
                >
                  View all results for "{query}" →
                </Link>
              )}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-[var(--pf-text-muted)]">No results for "{query}"</p>
              <p className="text-xs text-[var(--pf-text-muted)] mt-1">Try searching for an artist name or product</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Simple search trigger button (for mobile/compact areas)
export function SearchButton() {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowSearch(true)}
        className="p-2 rounded-lg hover:bg-[var(--pf-surface)] transition-colors"
        aria-label="Search"
      >
        <Search size={20} className="text-[var(--pf-text-secondary)]" />
      </button>
      
      {showSearch && (
        <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 pt-20">
          <div className="w-full max-w-2xl">
            <ArtistSearch />
          </div>
          <button
            onClick={() => setShowSearch(false)}
            className="fixed top-4 right-4 p-2 rounded-full bg-[var(--pf-surface)]"
          >
            <X size={24} />
          </button>
        </div>
      )}
    </>
  );
}
