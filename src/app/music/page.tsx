'use client'

import { useCallback, useMemo, useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Play,
  Pause,
  Search,
  X,
  Verified,
  Disc,
  Music2,
  Users,
  SlidersHorizontal,
} from 'lucide-react'
import { useAudio, Track } from '@/lib/audio-context'
import { TRACKS as STATIC_TRACKS } from '@/lib/data'
import { ARTISTS } from '@/lib/artists'
import { getTrackArtwork } from '@/lib/artwork'
import { createBrowserSupabaseClient } from '@/lib/create-browser-client'
import { mergeCanonicalTracks, dedupeQueueTracks, sortTracksByAlbumOrder } from '@/lib/track-dedupe'
import { formatDuration, canonicalAlbum } from '@/lib/duration-formatter'

// Public artists with confirmed music/catalog
const VALID_SLUGS = ['od-porter', 'gune', 'atm-trap']
const PUBLIC_ARTISTS = ARTISTS.filter((a) => VALID_SLUGS.includes(a.slug))

// Static tracks for fallback (legacy catalog)
const LEGACY_TRACKS = STATIC_TRACKS.filter((t) =>
  ['O D Porter', 'Gune', 'ATM Trap', 'Jai Jai', 'Jay Jay'].includes(t.artist)
).sort((a, b) => {
  const order: Record<string, number> = { 'O D Porter': 0, 'Gune': 1, 'ATM Trap': 2, 'Jai Jai': 3, 'Jay Jay': 3 }
  return (order[a.artist] || 99) - (order[b.artist] || 99)
}) as unknown as Track[]

type DisplayTrack = Track

function TrackRow({
  track,
  index,
  isActive,
  isPlaying,
  onPlay,
  onTogglePlay,
}: {
  track: DisplayTrack
  index: number
  isActive: boolean
  isPlaying: boolean
  onPlay: () => void
  onTogglePlay: () => void
}) {
  return (
    <div
      onClick={onPlay}
      className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
        isActive
          ? 'bg-[var(--pf-orange)]/10'
          : 'hover:bg-[var(--pf-surface)]'
      }`}
    >
      {/* Index / playing indicator */}
      <div className="w-6 flex items-center justify-center shrink-0">
        {isActive && isPlaying ? (
          <div
            className="flex items-center gap-0.5"
            onClick={(e) => {
              e.stopPropagation()
              onTogglePlay()
            }}
          >
            <span className="w-0.5 h-3 bg-[var(--pf-orange)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-0.5 h-2 bg-[var(--pf-orange)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-0.5 h-4 bg-[var(--pf-orange)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        ) : (
          <span
            className={`text-xs font-mono ${
              isActive ? 'text-[var(--pf-orange)]' : 'text-[var(--pf-text-muted)]'
            }`}
          >
            {index + 1}
          </span>
        )}
      </div>

      {/* Cover */}
      <div className="relative w-10 h-10 rounded-md overflow-hidden bg-[var(--pf-surface)] shrink-0">
        <Image src={getTrackArtwork(track)} alt={track.title} fill sizes="40px" className="object-cover" />
      </div>

      {/* Title + album */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium truncate ${
            isActive ? 'text-[var(--pf-orange)]' : 'text-[var(--pf-text)]'
          }`}
        >
          {track.title}
        </p>
        <p className="text-xs text-[var(--pf-text-secondary)] truncate">{track.album || 'Single'}</p>
      </div>

      {/* Duration */}
      <span className="hidden sm:inline text-xs font-mono text-[var(--pf-text-muted)] w-10 text-right">
        {formatDuration(track.duration)}
      </span>

      {/* Play */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onPlay()
        }}
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
          isActive
            ? 'bg-[var(--pf-orange)] text-[var(--pf-text)]'
            : 'bg-[var(--pf-surface)] text-[var(--pf-text-secondary)] sm:opacity-0 group-hover:opacity-100 group-hover:bg-[var(--pf-orange)] group-hover:text-[var(--pf-text)]'
        }`}
        aria-label={isActive && isPlaying ? 'Pause' : 'Play'}
      >
        {isActive && isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
      </button>
    </div>
  )
}

// Up to 3 tracks from the same artist play first (the tapped track + up to 2
// more from that artist), then the rest of the catalog. Auto-advance follows
// this queue order via the audio context.
const ARTIST_RUN = 3

function buildArtistQueue(tracks: Track[], seed: Track): Track[] {
  const sameArtist = tracks.filter((t) => t.artist === seed.artist && t.id !== seed.id)
  const otherArtists = tracks.filter((t) => t.artist !== seed.artist)
  const head = [seed, ...sameArtist.slice(0, ARTIST_RUN - 1)]
  return [...head, ...otherArtists]
}

export default function MusicPage() {
  const { currentTrack, isPlaying, playTrack, togglePlay, setQueue } = useAudio()
  const [searchQuery, setSearchQuery] = useState('')
  const [albumFilter, setAlbumFilter] = useState<string>('all')
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null)
  const [dbTracks, setDbTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch DB tracks on mount (all tracks for canonical dedupe)
  useEffect(() => {
    async function loadTracks() {
      const supabase = createBrowserSupabaseClient()
      const { data } = await supabase
        .from('tracks')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (data) {
        // Map DB tracks to Track format (keep is_active for dedupe logic)
        const mapped = data.map((t: any) => ({
          id: t.id,
          title: t.title,
          artist: t.artist_name || t.artist || 'Unknown',
          album: t.album,
          duration: t.duration,
          audio_url: t.audio_url,
          cover_url: t.cover_url,
          image: t.cover_url,
          plays: t.play_count || 0,
          price: t.proud_to_pay_min || 1,
          is_active: t.is_active,
        }))
        setDbTracks(mapped)
      }
      setLoading(false)
    }
    loadTracks()
  }, [])

  // Merge DB tracks with static fallback using canonical dedupe
  // Inactive DB tracks block matching static from public display
  const ALL_TRACKS = useMemo(() => {
    return sortTracksByAlbumOrder(
      mergeCanonicalTracks(dbTracks as any[], LEGACY_TRACKS, { includeInactive: false })
    )
  }, [dbTracks])

  // Featured track: prefer featured DB track, fallback to first track
  const heroTrack = useMemo(() => {
    // First, try to find a featured DB track
    const featuredDb = dbTracks.find(t => (t as any).featured)
    if (featuredDb) return featuredDb
    // Otherwise use current or first available
    return currentTrack ?? ALL_TRACKS[0]
  }, [dbTracks, ALL_TRACKS, currentTrack])

  const isHeroActive = currentTrack?.id === heroTrack?.id
  const heroArtist = ARTISTS.find((a) => a.name === heroTrack?.artist) ?? ARTISTS.find((a) => a.id === 'od-porter')

  const startTrack = useCallback(
    (track: Track) => {
      // Build a queue that gives the tapped artist first run, then the rest.
      // Dedupe queue to prevent repeats from DB/static duplicates.
      const queue = buildArtistQueue(ALL_TRACKS, track)
      setQueue(dedupeQueueTracks(queue))
      playTrack(track)
    },
    [playTrack, setQueue, ALL_TRACKS]
  )

  const handlePlayTrack = useCallback(
    (track: Track) => {
      if (currentTrack?.id === track.id) {
        togglePlay()
      } else {
        startTrack(track)
      }
    },
    [currentTrack, togglePlay, startTrack]
  )

  const uniqueAlbums = useMemo(() => {
    const map = new Map<string, { name: string; image: string; count: number }>()
    ALL_TRACKS.forEach((t) => {
      const canonicalName = canonicalAlbum(t.album)
      if (!canonicalName) return // Skip singles/no album
      
      if (!map.has(canonicalName)) {
        map.set(canonicalName, { name: canonicalName, image: t.image || '', count: 0 })
      }
      map.get(canonicalName)!.count++
    })
    return Array.from(map.values())
  }, [ALL_TRACKS])

  const filteredTracks = useMemo(() => {
    let tracks = ALL_TRACKS
    if (selectedAlbum) tracks = tracks.filter((t) => t.album === selectedAlbum)
    if (albumFilter !== 'all') tracks = tracks.filter((t) => t.album === albumFilter)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      tracks = tracks.filter((t) => t.title.toLowerCase().includes(q))
    }
    return tracks
  }, [searchQuery, albumFilter, selectedAlbum, ALL_TRACKS])

  const clearAlbumFilter = () => {
    setSelectedAlbum(null)
    setAlbumFilter('all')
  }

  return (
    <div className="min-h-screen pb-32">
      {/* HERO — compact featured track */}
      <section className="bg-[var(--pf-bg)] border-b border-[var(--pf-border)]">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 pt-6 sm:pt-10 pb-5 sm:pb-8">
          <p className="text-[11px] uppercase tracking-widest text-[var(--pf-text-secondary)] mb-3">Featured</p>
          <div className="flex items-center gap-4 sm:gap-5">
            <Link
              href={heroArtist ? `/artist/${heroArtist.slug}` : '/artists'}
              className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-xl overflow-hidden flex-shrink-0 bg-[var(--pf-surface)]"
              aria-label={`Open ${heroArtist?.name ?? 'artist'} page`}
            >
              {heroTrack && (
                <Image
                  src={getTrackArtwork(heroTrack)}
                  alt={heroTrack.title}
                  fill
                  sizes="(max-width: 640px) 80px, 112px"
                  className="object-cover"
                />
              )}
            </Link>

            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold truncate">{heroTrack?.title}</h1>
              {heroArtist && (
                <Link
                  href={`/artist/${heroArtist.slug}`}
                  className="text-sm text-[var(--pf-text-secondary)] hover:text-[var(--pf-text)] transition-colors truncate inline-block max-w-full"
                >
                  {heroArtist.name}
                </Link>
              )}
              {heroTrack?.album && (
                <p className="text-xs text-[var(--pf-text-muted)] truncate">{heroTrack.album}</p>
              )}
            </div>

            <button
              onClick={() => (currentTrack ? togglePlay() : startTrack(heroTrack!))}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[var(--pf-orange)] hover:bg-[var(--pf-orange)]/90 flex items-center justify-center flex-shrink-0 transition-colors shadow-lg"
              aria-label={isHeroActive && isPlaying ? 'Pause featured track' : 'Play featured track'}
            >
              {isHeroActive && isPlaying ? (
                <Pause size={24} className="text-[var(--pf-text)]" />
              ) : (
                <Play size={24} className="text-[var(--pf-text)] ml-0.5" />
              )}
            </button>
          </div>
        </div>
      </section>

      {/* BROWSE ARTISTS — compact rail */}
      <section className="border-b border-[var(--pf-border)]">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center gap-2 mb-4">
            <Users size={16} className="text-[var(--pf-text-secondary)]" />
            <h2 className="text-base font-semibold">Browse Artists</h2>
          </div>

          <div className="flex gap-3 overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6 scrollbar-hide pb-1">
            {PUBLIC_ARTISTS.map((artist) => {
              const trackCount = ALL_TRACKS.filter((t) => t.artist === artist.name || t.artist === artist.id).length
              return (
                <Link
                  key={artist.id}
                  href={`/artist/${artist.slug}`}
                  className="group flex-shrink-0 w-32 sm:w-36"
                >
                  <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-xl overflow-hidden bg-[var(--pf-surface)] mb-2">
                    <Image
                      src={artist.image}
                      alt={artist.name}
                      fill
                      sizes="(max-width: 640px) 128px, 144px"
                      className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-medium truncate">{artist.name}</p>
                    {artist.verified && <Verified size={12} className="text-[var(--pf-text-secondary)] shrink-0" />}
                  </div>
                  <p className="text-xs text-[var(--pf-text-muted)] truncate">{trackCount} tracks</p>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ALBUMS — compact rail */}
      <section className="border-b border-[var(--pf-border)]">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Disc size={16} className="text-[var(--pf-text-secondary)]" />
              <h2 className="text-base font-semibold">Albums</h2>
            </div>
            {selectedAlbum && (
              <button
                onClick={clearAlbumFilter}
                className="flex items-center gap-1 text-xs text-[var(--pf-text-secondary)] hover:text-[var(--pf-text)] transition-colors"
              >
                <X size={12} />
                Clear
              </button>
            )}
          </div>

          <div className="flex gap-3 overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6 scrollbar-hide pb-1">
            {uniqueAlbums.map((album) => {
              const isSelected = selectedAlbum === album.name || albumFilter === album.name
              return (
                <button
                  key={album.name}
                  onClick={() => {
                    if (isSelected) {
                      clearAlbumFilter()
                    } else {
                      setSelectedAlbum(album.name)
                      setAlbumFilter('all')
                    }
                  }}
                  className="group flex-shrink-0 w-32 sm:w-36 text-left"
                >
                  <div
                    className={`relative w-32 h-32 sm:w-36 sm:h-36 rounded-xl overflow-hidden bg-[var(--pf-surface)] mb-2 border-2 transition-colors ${
                      isSelected ? 'border-[var(--pf-orange)]' : 'border-transparent'
                    }`}
                  >
                    {album.image ? (
                      <Image
                        src={album.image}
                        alt={album.name}
                        fill
                        sizes="(max-width: 640px) 128px, 144px"
                        className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--pf-text-muted)]">
                        <Disc size={28} />
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium truncate">{album.name}</p>
                  <p className="text-xs text-[var(--pf-text-muted)] truncate">{album.count} tracks</p>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* TRACKS — dense list with search + filter */}
      <section className="max-w-6xl mx-auto px-5 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Music2 size={16} className="text-[var(--pf-text-secondary)]" />
              <h2 className="text-base font-semibold">
                {selectedAlbum
                  ? selectedAlbum
                  : albumFilter !== 'all'
                  ? albumFilter
                  : searchQuery.trim()
                  ? 'Search results'
                  : 'All Tracks'}
              </h2>
            </div>
            <p className="text-xs text-[var(--pf-text-muted)]">{filteredTracks.length} tracks</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--pf-text-muted)]" />
              <input
                type="text"
                placeholder="Search tracks…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-8 py-2 w-full bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-lg text-sm focus:outline-none focus:border-[var(--pf-orange)]/50 focus:ring-1 focus:ring-[var(--pf-orange)]/20 transition-all placeholder:text-[var(--pf-text-muted)]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--pf-text-muted)] hover:text-[var(--pf-text)]"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="relative w-full sm:w-44">
              <SlidersHorizontal size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--pf-text-muted)] pointer-events-none" />
              <select
                value={albumFilter}
                onChange={(e) => {
                  setAlbumFilter(e.target.value)
                  if (e.target.value !== 'all') setSelectedAlbum(null)
                }}
                className="pl-8 pr-3 py-2 w-full bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-lg text-sm focus:outline-none focus:border-[var(--pf-orange)]/50 appearance-none cursor-pointer"
              >
                <option value="all">All albums</option>
                {uniqueAlbums.map((a) => (
                  <option key={a.name} value={a.name}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-8 text-[var(--pf-text-muted)] text-sm">
            Loading tracks…
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredTracks.length === 0 && (
          <div className="text-center py-8 text-[var(--pf-text-muted)] text-sm">
            {searchQuery ? 'No tracks match your search' : 'No tracks available'}
          </div>
        )}

        {/* Track list */}
        {!loading && filteredTracks.length > 0 && (
          <div className="space-y-1">
            {filteredTracks.map((track, idx) => (
              <TrackRow
                key={track.id}
                track={track}
                index={idx}
                isActive={currentTrack?.id === track.id}
                isPlaying={isPlaying}
                onPlay={() => handlePlayTrack(track)}
                onTogglePlay={() => handlePlayTrack(track)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
