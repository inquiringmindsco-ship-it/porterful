'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Pause, SkipForward, Volume2, VolumeX, Clock, Heart, Share2, Verified, ChevronRight, Disc, Music2, Users, Star, Search, X, SlidersHorizontal, LayoutGrid } from 'lucide-react';
import { useAudio, Track } from '@/lib/audio-context';
import { TRACKS } from '@/lib/data';
import { ARTISTS } from '@/lib/artists';
import { FEATURED_PRODUCTS } from '@/lib/products';

// O D Porter's tracks only
const OD_TRACKS = TRACKS.filter(t => t.artist === 'O D Porter').sort((a, b) => {
  // Ambiguous first, then others
  if (a.album === 'Ambiguous' && b.album !== 'Ambiguous') return -1;
  if (a.album !== 'Ambiguous' && b.album === 'Ambiguous') return 1;
  return 0;
}) as unknown as Track[];

// Top tracks by order
const TOP_TRACKS = [...OD_TRACKS];

// For display purposes we use the raw data type (duration is string)
type DisplayTrack = typeof OD_TRACKS[number];

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function TrackRow({ track, index, isActive, isPlaying, onPlay, onTogglePlay }: {
  track: DisplayTrack;
  index: number;
  isActive: boolean;
  isPlaying: boolean;
  onPlay: () => void;
  onTogglePlay: () => void;
}) {
  return (
    <div
      onClick={onPlay}
      className={`group flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-200 ${
        isActive
          ? 'bg-[var(--pf-orange)]/10 border border-[var(--pf-orange)]/30'
          : 'hover:bg-[var(--pf-surface)] border border-transparent hover:border-[var(--pf-border-subtle)]'
      }`}
    >
      <div className="w-8 flex items-center justify-center">
        {isActive && isPlaying ? (
          <div className="flex items-center gap-0.5" onClick={(e) => { e.stopPropagation(); onTogglePlay(); }}>
            <div className="w-1 h-4 bg-[var(--pf-orange)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1 h-3 bg-[var(--pf-orange)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1 h-5 bg-[var(--pf-orange)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        ) : (
          <span className={`text-sm font-mono ${isActive ? 'text-[var(--pf-orange)]' : 'text-[var(--pf-text-secondary)] group-hover:text-[var(--pf-text)]'}`}>
            {index + 1}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`font-medium truncate ${isActive ? 'text-[var(--pf-orange)]' : ''}`}>{track.title}</p>
        <p className="text-sm text-[var(--pf-text-secondary)]">{track.album}</p>
      </div>

      <div className="hidden sm:flex items-center gap-4">
        <span className="text-sm text-[var(--pf-text-secondary)] font-mono w-12 text-right">
          {track.duration}
        </span>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onPlay(); }}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
          isActive
            ? 'bg-[var(--pf-orange)] text-black'
            : 'bg-[var(--pf-surface)] text-[var(--pf-text-secondary)] group-hover:bg-[var(--pf-orange)] group-hover:text-black opacity-0 group-hover:opacity-100'
        }`}
      >
        {isActive && isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
      </button>
    </div>
  );
}

export default function MusicPage() {
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudio();
  const [showAllTracks, setShowAllTracks] = useState(false);
  const [heroTrackIndex, setHeroTrackIndex] = useState(0);
  const heroIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [albumFilter, setAlbumFilter] = useState<string>('all');
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);

  // Hero auto-advance — only runs when no track is loaded
  // Clears on unmount or when currentTrack becomes available
  useEffect(() => {
    if (!currentTrack) {
      heroIntervalRef.current = setInterval(() => {
        setHeroTrackIndex(i => (i + 1) % TOP_TRACKS.length);
      }, 12000);
    }
    return () => {
      if (heroIntervalRef.current) {
        clearInterval(heroIntervalRef.current);
        heroIntervalRef.current = null;
      }
    };
  }, [currentTrack]);

  // Hero track rotates but does NOT auto-play — user must click play


  const handlePlayTrack = useCallback((track: Track) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      playTrack(track);
    }
  }, [currentTrack, playTrack, togglePlay]);

  const heroTrack = TOP_TRACKS[heroTrackIndex] || TOP_TRACKS[0];
  const isHeroActive = currentTrack?.id === heroTrack?.id;

  // Get unique albums from OD_TRACKS
  const uniqueAlbums = useMemo(() => {
    const albumMap = new Map<string, { name: string; image: string; count: number }>();
    OD_TRACKS.forEach(t => {
      if (!albumMap.has(t.album || 'Unknown')) {
        albumMap.set(t.album || 'Unknown', { name: t.album || 'Unknown', image: t.image || '', count: 0 });
      }
      albumMap.get(t.album || 'Unknown')!.count++;
    });
    return Array.from(albumMap.values());
  }, []);

  // Filter tracks based on search, album filter, and selected album card
  const filteredTracks = useMemo(() => {
    let tracks = OD_TRACKS;

    // Album card filter (takes precedence)
    if (selectedAlbum) {
      tracks = tracks.filter(t => t.album === selectedAlbum);
    }

    // Dropdown album filter
    if (albumFilter !== 'all') {
      tracks = tracks.filter(t => t.album === albumFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      tracks = tracks.filter(t => t.title.toLowerCase().includes(q));
    }

    return tracks;
  }, [searchQuery, albumFilter, selectedAlbum]);

  const displayedTracks = showAllTracks ? filteredTracks : filteredTracks.slice(0, 10) as unknown as Track[];

  // Od's artist data
  const odArtist = ARTISTS.find(a => a.id === 'od-porter');

  // Clear album card selection
  const clearAlbumFilter = () => {
    setSelectedAlbum(null);
    setAlbumFilter('all');
  };

  return (
    <div className="min-h-screen pb-24">
      {/* HERO PLAYER */}
      <section className="relative bg-gradient-to-b from-[var(--pf-orange)]/5 to-[var(--pf-bg)]">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 50% 50%, var(--pf-orange) 0%, transparent 50%)',
          }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-12">
          {/* Artist badge */}
          <div className="flex items-center gap-3 mb-8">
            <Link href="/artist/od-porter">
              {odArtist?.image && (
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[var(--pf-orange)] hover:border-[var(--pf-orange)]/60 transition-colors">
                  <Image src={odArtist.image} alt={odArtist.name} fill className="object-cover" />
                </div>
              )}
            </Link>
            <div>
              <Link href="/artist/od-porter" className="flex items-center gap-2 hover:text-[var(--pf-orange)] transition-colors">
                <h1 className="text-2xl font-bold">O D Porter</h1>
                {odArtist?.verified && (
                  <Verified size={18} className="text-[var(--pf-orange)]" />
                )}
              </Link>
              <p className="text-[var(--pf-text-secondary)]">St. Louis, MO · {OD_TRACKS.length} tracks</p>
            </div>
          </div>

          {/* Hero track display */}
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            {/* Album art */}
            <div className="relative w-64 h-64 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl shadow-[var(--pf-orange)]/10">
              {heroTrack?.image && (
                <Image src={heroTrack.image} alt={heroTrack.title} fill className="object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="font-bold text-lg">{heroTrack?.title}</p>
                <p className="text-sm text-white/70">{heroTrack?.album}</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex-1 text-center lg:text-left">
              <p className="text-sm uppercase tracking-widest text-[var(--pf-text-secondary)] mb-2">Now Playing</p>
              <h2 className="text-5xl lg:text-7xl font-bold mb-4 leading-none">
                {heroTrack?.title}
              </h2>
              <p className="text-xl text-[var(--pf-text-secondary)] mb-8">{heroTrack?.album}</p>

              {/* Progress bar */}
              <div className="w-full max-w-md mx-auto lg:mx-0 h-1 bg-[var(--pf-surface)] rounded-full overflow-hidden mb-8">
                <div className="h-full bg-[var(--pf-orange)] rounded-full w-1/3" />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center lg:justify-start gap-6">
                <button
                  onClick={() => setHeroTrackIndex(i => (i - 1 + TOP_TRACKS.length) % TOP_TRACKS.length)}
                  className="w-12 h-12 rounded-full bg-[var(--pf-surface)] hover:bg-[var(--pf-orange)]/20 flex items-center justify-center transition-colors"
                >
                  <SkipForward size={20} className="rotate-180" />
                </button>

                <button
                  onClick={() => currentTrack ? togglePlay() : playTrack(heroTrack!)}
                  className="w-20 h-20 rounded-full bg-[var(--pf-orange)] hover:bg-[var(--pf-orange)]/90 flex items-center justify-center transition-all shadow-lg shadow-[var(--pf-orange)]/20"
                >
                  {isHeroActive && isPlaying ? (
                    <Pause size={28} className="text-black" />
                  ) : (
                    <Play size={28} className="text-black ml-1" />
                  )}
                </button>

                <button
                  onClick={() => setHeroTrackIndex(i => (i + 1) % TOP_TRACKS.length)}
                  className="w-12 h-12 rounded-full bg-[var(--pf-surface)] hover:bg-[var(--pf-orange)]/20 flex items-center justify-center transition-colors"
                >
                  <SkipForward size={20} />
                </button>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-8 mt-8">
                <div className="flex items-center gap-2 text-[var(--pf-text-secondary)]">
                  <Disc size={16} />
                  <span className="text-sm">{uniqueAlbums.length} albums</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          1. ARTIST BROWSE SECTION
      ============================================================ */}
      <section className="border-b border-[var(--pf-border)]">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-[var(--pf-orange)]" />
              <h3 className="text-lg font-bold">Browse Artists</h3>
            </div>
          </div>

          {/* Horizontal scrollable artist cards */}
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 scrollbar-hide">
            {ARTISTS.map((artist) => {
              const artistTracks = TRACKS.filter(t => t.artist === artist.name || t.artist === artist.id);
              return (
                <Link
                  key={artist.id}
                  href={`/artist/${artist.slug}`}
                  className="flex-shrink-0 w-56 group"
                >
                  <div className="bg-[var(--pf-surface)] rounded-2xl p-4 border border-[var(--pf-border)] hover:border-[var(--pf-orange)]/40 transition-all duration-200 hover:shadow-lg hover:shadow-[var(--pf-orange)]/5">
                    {/* Avatar */}
                    <div className="relative w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden border-2 border-[var(--pf-border)] group-hover:border-[var(--pf-orange)]/60 transition-colors">
                      <Image
                        src={artist.image}
                        alt={artist.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    {/* Info */}
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <p className="font-semibold truncate">{artist.name}</p>
                        {artist.verified && (
                          <Verified size={14} className="text-[var(--pf-orange)] flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-[var(--pf-text-secondary)] truncate mb-2">{artist.genre}</p>
                      <div className="flex items-center justify-center gap-3 text-xs text-[var(--pf-text-muted)]">
                        <span className="flex items-center gap-1">
                          <Music2 size={12} />
                          {artistTracks.length} tracks
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================
          4. ALBUMS SECTION
      ============================================================ */}
      <section className="border-b border-[var(--pf-border)]">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Disc size={18} className="text-[var(--pf-orange)]" />
              <h3 className="text-lg font-bold">Albums</h3>
            </div>
            {selectedAlbum && (
              <button
                onClick={clearAlbumFilter}
                className="flex items-center gap-1.5 text-sm text-[var(--pf-orange)] hover:text-[var(--pf-orange)]/80 transition-colors"
              >
                <X size={14} />
                Clear filter
              </button>
            )}
          </div>

          {/* Album cards grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {uniqueAlbums.map((album) => {
              const isSelected = selectedAlbum === album.name || albumFilter === album.name;
              return (
                <button
                  key={album.name}
                  onClick={() => {
                    if (isSelected) {
                      clearAlbumFilter();
                    } else {
                      setSelectedAlbum(album.name);
                      setAlbumFilter('all');
                    }
                  }}
                  className={`group text-left rounded-xl overflow-hidden border transition-all duration-200 ${
                    isSelected
                      ? 'border-[var(--pf-orange)] shadow-lg shadow-[var(--pf-orange)]/10'
                      : 'border-[var(--pf-border)] hover:border-[var(--pf-orange)]/40'
                  }`}
                >
                  {/* Album art */}
                  <div className="relative aspect-square w-full overflow-hidden">
                    {album.image ? (
                      <Image
                        src={album.image}
                        alt={album.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 16vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-[var(--pf-surface)] flex items-center justify-center">
                        <Disc size={32} className="text-[var(--pf-text-muted)]" />
                      </div>
                    )}
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-[var(--pf-orange)] flex items-center justify-center">
                        <Play size={18} className="text-white ml-0.5" />
                      </div>
                    </div>
                  </div>
                  {/* Album info */}
                  <div className="p-3">
                    <p className="font-medium text-sm truncate">{album.name}</p>
                    <p className="text-xs text-[var(--pf-text-muted)] mt-0.5">{album.count} tracks</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================
          TRACK LIST with SEARCH & FILTER
      ============================================================ */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            {selectedAlbum || albumFilter !== 'all' || searchQuery ? (
              <div>
                <p className="text-sm uppercase tracking-widest text-[var(--pf-orange)] mb-1">Filtered Results</p>
                <h3 className="text-2xl font-bold">
                  {selectedAlbum || (albumFilter !== 'all' ? albumFilter : 'Search Results')}
                  <span className="text-[var(--pf-text-secondary)] font-normal ml-2">· {filteredTracks.length} tracks</span>
                </h3>
              </div>
            ) : (
              <div>
                <p className="text-sm uppercase tracking-widest text-[var(--pf-orange)] mb-1">All Tracks</p>
                <h3 className="text-2xl font-bold">{OD_TRACKS.length} tracks</h3>
              </div>
            )}
          </div>

          {/* Search & Filter row */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search bar */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--pf-text-muted)]" />
              <input
                type="text"
                placeholder="Search tracks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9 py-2.5 w-full sm:w-64 bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-xl text-sm focus:outline-none focus:border-[var(--pf-orange)]/50 focus:ring-1 focus:ring-[var(--pf-orange)]/20 transition-all placeholder:text-[var(--pf-text-muted)]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--pf-text-muted)] hover:text-[var(--pf-text)] transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Album filter dropdown */}
            <div className="relative">
              <SlidersHorizontal size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--pf-text-muted)] pointer-events-none" />
              <select
                value={albumFilter}
                onChange={(e) => {
                  setAlbumFilter(e.target.value);
                  if (e.target.value !== 'all') setSelectedAlbum(null);
                }}
                className="pl-9 pr-9 py-2.5 w-full sm:w-52 bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-xl text-sm focus:outline-none focus:border-[var(--pf-orange)]/50 appearance-none cursor-pointer transition-all"
              >
                <option value="all">All Albums</option>
                {uniqueAlbums.map((album) => (
                  <option key={album.name} value={album.name}>
                    {album.name}
                  </option>
                ))}
              </select>
              <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--pf-text-muted)] rotate-90 pointer-events-none" />
            </div>

            {/* Show all / less toggle */}
            <button
              onClick={() => setShowAllTracks(!showAllTracks)}
              className="text-sm text-[var(--pf-text-secondary)] hover:text-[var(--pf-text)] flex items-center gap-1 transition-colors whitespace-nowrap py-2.5"
            >
              {showAllTracks ? 'Show less' : `All ${filteredTracks.length} tracks`}
              <ChevronRight size={16} className={showAllTracks ? 'rotate-90' : ''} />
            </button>
          </div>
        </div>

        {/* Active filters pills */}
        {(searchQuery || albumFilter !== 'all' || selectedAlbum) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--pf-orange)]/10 border border-[var(--pf-orange)]/30 text-xs text-[var(--pf-orange)]">
                "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-[var(--pf-orange)]/70">
                  <X size={12} />
                </button>
              </span>
            )}
            {selectedAlbum && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--pf-orange)]/10 border border-[var(--pf-orange)]/30 text-xs text-[var(--pf-orange)]">
                {selectedAlbum}
                <button onClick={clearAlbumFilter} className="hover:text-[var(--pf-orange)]/70">
                  <X size={12} />
                </button>
              </span>
            )}
            {albumFilter !== 'all' && !selectedAlbum && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--pf-orange)]/10 border border-[var(--pf-orange)]/30 text-xs text-[var(--pf-orange)]">
                {albumFilter}
                <button onClick={() => { setAlbumFilter('all'); }} className="hover:text-[var(--pf-orange)]/70">
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Track list */}
        {filteredTracks.length > 0 ? (
          <div className="space-y-1">
            {displayedTracks.map((track, i) => (
              <TrackRow
                key={track.id}
                track={track}
                index={i}
                isActive={currentTrack?.id === track.id}
                isPlaying={isPlaying && currentTrack?.id === track.id}
                onPlay={() => handlePlayTrack(track)}
                onTogglePlay={togglePlay}
              />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="pf-empty">
            <div className="pf-empty-icon">
              <Music2 size={22} />
            </div>
            <p className="pf-empty-title">No tracks found</p>
            <p className="pf-empty-desc">
              Try adjusting your search or filters
            </p>
            <button
              onClick={() => { setSearchQuery(''); setAlbumFilter('all'); setSelectedAlbum(null); }}
              className="mt-4 text-sm font-medium px-4 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] hover:border-[var(--pf-orange)]/50 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Show all toggle at bottom if there are more than 10 tracks */}
        {!showAllTracks && filteredTracks.length > 10 && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setShowAllTracks(true)}
              className="text-sm text-[var(--pf-text-secondary)] hover:text-[var(--pf-text)] flex items-center gap-1 mx-auto transition-colors"
            >
              Show all {filteredTracks.length} tracks
              <ChevronRight size={16} className="rotate-90" />
            </button>
          </div>
        )}
      </section>

      {/* ABOUT SECTION */}
      <section className="border-t border-[var(--pf-border)]">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Bio */}
            <div>
              <p className="text-sm uppercase tracking-widest text-[var(--pf-orange)] mb-4">About the Artist</p>
              <div className="space-y-4 text-[var(--var(--pf-text-secondary))]">
                <p>
                  Born Miami, raised NOLA &amp; St. Louis. Building Porterful — a direct marketplace where artists keep more of every sale.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 mt-6">
                <Link href="/artist/od-porter" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--pf-orange)] text-white text-sm font-medium hover:bg-[var(--pf-orange-dark)] transition-colors">
                  View Full Profile
                  <ChevronRight size={14} />
                </Link>
                <a href="https://instagram.com/od.porter" target="_blank" rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full bg-[var(--pf-surface)] hover:bg-[var(--pf-orange)]/20 text-sm transition-colors">
                  @od.porter
                </a>
                <a href="https://tiktok.com/@odporter" target="_blank" rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full bg-[var(--pf-surface)] hover:bg-[var(--pf-orange)]/20 text-sm transition-colors">
                  TikTok
                </a>
                <a href="https://youtube.com/@odporter" target="_blank" rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full bg-[var(--pf-surface)] hover:bg-[var(--pf-orange)]/20 text-sm transition-colors">
                  YouTube
                </a>
              </div>
            </div>

            {/* Quick links */}
            <div>
              <p className="text-sm uppercase tracking-widest text-[var(--pf-orange)] mb-4">Explore</p>
              <div className="space-y-3">
                <Link href="/store"
                  className="flex items-center justify-between p-4 rounded-xl bg-[var(--pf-surface)] hover:bg-[var(--pf-orange)]/10 border border-[var(--pf-border)] transition-colors group">
                  <div>
                    <p className="font-medium">Custom Name Chains</p>
                    <p className="text-sm text-[var(--pf-text-secondary)]">Your name. In metal.</p>
                  </div>
                  <ChevronRight size={20} className="text-[var(--pf-text-secondary)] group-hover:text-[var(--pf-orange)]" />
                </Link>

                <Link href="/store"
                  className="flex items-center justify-between p-4 rounded-xl bg-[var(--pf-surface)] hover:bg-[var(--pf-orange)]/10 border border-[var(--pf-border)] transition-colors group">
                  <div>
                    <p className="font-medium">"There It Is, Here It Go"</p>
                    <p className="text-sm text-[var(--pf-text-secondary)]">The book — $25</p>
                  </div>
                  <ChevronRight size={20} className="text-[var(--pf-text-secondary)] group-hover:text-[var(--pf-orange)]" />
                </Link>

              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
