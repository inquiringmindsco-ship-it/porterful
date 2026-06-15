'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ChevronDown, Disc, Search, Star, Users } from 'lucide-react'
import {
  SOCIAL_ICONS,
  normalizeSocialUrl,
  type SocialPlatform,
} from '@/lib/artist-social'
import type { Track } from '@/lib/audio-context'
import type { Product } from '@/lib/products'
import type { ArtistAppearance } from '@/lib/artist-theme'
import { ArtistTrackList } from '@/components/artist/ArtistTrackList'
import { FeaturedTrackCard } from '@/components/artist/FeaturedTrackCard'
import { ArtistAvatar } from '@/components/artist/ArtistAvatar'
import { CollaboratorStack } from '@/components/artist/CollaboratorStack'
import { ArtistVideoLibrary } from '@/components/artist/ArtistVideoLibrary'
import { buildTrackArtistCredits, type ArtistCredit } from '@/lib/artist-credits'
import { sortTracksByAlbumOrder, dedupeQueueTracks, filterPlayableTracks } from '@/lib/track-dedupe'
import { canonicalAlbum } from '@/lib/duration-formatter'
import type { ArtistVideoRecord } from '@/lib/artist-videos'

type TabKey = 'music' | 'videos' | 'store' | 'about'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'music', label: 'Music' },
  { key: 'videos', label: 'Videos' },
  { key: 'store', label: 'Store' },
  { key: 'about', label: 'About' },
]

interface SocialLinks {
  instagram?: string
  twitter?: string
  tiktok?: string
  youtube?: string
  website?: string
}

interface ArtistTabsProps {
  artistName: string
  bio: string
  social?: SocialLinks
  appearance?: ArtistAppearance | null
  featuredTracks?: Track[]
  singles: Track[]
  albumTracks: Track[]
  videos?: ArtistVideoRecord[]
  products: Product[]
  albumOrder?: Record<string, number>
}

function matchesQuery(value: string | null | undefined, query: string) {
  if (!query) return true
  return String(value || '').toLowerCase().includes(query)
}

function buildAlbumGroups(tracks: Track[], albumOrder?: Record<string, number>): Array<{ name: string; image: string; tracks: Track[] }> {
  const map = new Map<string, { name: string; image: string; tracks: Track[] }>()
  tracks.forEach((t) => {
    const canonicalName = canonicalAlbum(t.album) || 'Unknown'
    if (!map.has(canonicalName)) {
      const albumImage = canonicalName === 'Singles'
        ? '/brand/porterful.png'
        : (t.image || '')
      map.set(canonicalName, { name: canonicalName, image: albumImage, tracks: [] })
    }
    map.get(canonicalName)!.tracks.push(t)
  })

  const result = Array.from(map.values())
  result.forEach((album) => {
    album.tracks = sortTracksByAlbumOrder(album.tracks)
  })

  if (albumOrder && Object.keys(albumOrder).length > 0) {
    result.sort((a, b) => (albumOrder[a.name] ?? 999) - (albumOrder[b.name] ?? 999))
  } else {
    result.sort((a, b) => a.name.localeCompare(b.name))
  }

  return result
}

function buildCollaborators(tracks: Track[]) {
  const map = new Map<string, ArtistCredit>()

  tracks.forEach((track) => {
    const credits = buildTrackArtistCredits(track)
    credits.slice(1).forEach((credit) => {
      const key = (credit.id || credit.name).trim().toLowerCase()
      if (!key || map.has(key)) return
      map.set(key, credit)
    })
  })

  return Array.from(map.values())
}

function externalUrl(platform: keyof SocialLinks, value: string): string {
  switch (platform) {
    case 'instagram':
      return `https://instagram.com/${value.replace(/^@/, '')}`
    case 'twitter':
      return `https://twitter.com/${value.replace(/^@/, '')}`
    case 'tiktok':
      return `https://tiktok.com/@${value.replace(/^@/, '')}`
    case 'youtube':
      return value.startsWith('http') ? value : `https://youtube.com/${value}`
    case 'website':
      return value.startsWith('http') ? value : `https://${value}`
  }
}

function ArtistSearchBar({
  query,
  onChange,
  onClear,
}: {
  query: string
  onChange: (value: string) => void
  onClear: () => void
}) {
  const focusBorder = 'var(--pf-orange)'

  return (
    <div className="mb-6 rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-4 shadow-sm">
      <label className="block text-xs uppercase tracking-[0.28em] text-[var(--pf-text-muted)] mb-2">
        Search this artist
      </label>
      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--pf-text-muted)]" />
        <input
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Tracks, albums, singles, merch..."
          className="w-full rounded-xl border border-[var(--pf-border)] bg-[var(--pf-bg)] px-9 py-3 text-sm text-[var(--pf-text)] outline-none transition-colors focus:border-[var(--pf-orange)]"
        />
        {query && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-xs font-semibold text-[var(--pf-text-muted)] transition-colors hover:text-[var(--pf-text)]"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  )
}

export function ArtistTabs({
  artistName,
  bio,
  social,
  appearance,
  featuredTracks = [],
  singles,
  albumTracks,
  videos = [],
  products,
  albumOrder,
}: ArtistTabsProps) {
  const [active, setActive] = useState<TabKey>('music')
  const [openAlbum, setOpenAlbum] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  const normalizedQuery = query.trim().toLowerCase()
  const playableFeatured = useMemo(() => filterPlayableTracks(featuredTracks), [featuredTracks])
  const playableSingles = useMemo(() => filterPlayableTracks(singles), [singles])
  const playableAlbumTracks = useMemo(() => filterPlayableTracks(albumTracks), [albumTracks])
  const allPlayableTracks = useMemo(
    () => dedupeQueueTracks([...playableFeatured, ...playableSingles, ...playableAlbumTracks]),
    [playableFeatured, playableSingles, playableAlbumTracks],
  )
  const albumGroups = useMemo(
    () => buildAlbumGroups(playableAlbumTracks, albumOrder),
    [playableAlbumTracks, albumOrder],
  )
  const collaborators = useMemo(
    () => buildCollaborators(allPlayableTracks),
    [allPlayableTracks],
  )
  const socialEntries = social
    ? (Object.entries(social).filter(([, v]) => !!v) as Array<[keyof SocialLinks, string]>)
    : []

  const filteredTracks = useMemo(() => {
    if (!normalizedQuery) return allPlayableTracks
    return allPlayableTracks.filter((track) =>
      matchesQuery(track.title, normalizedQuery) ||
      matchesQuery(track.album, normalizedQuery) ||
      matchesQuery(track.artist, normalizedQuery)
    )
  }, [allPlayableTracks, normalizedQuery])

  const filteredSingles = useMemo(() => {
    if (!normalizedQuery) return playableSingles
    return playableSingles.filter((track) =>
      matchesQuery(track.title, normalizedQuery) ||
      matchesQuery(track.album, normalizedQuery) ||
      matchesQuery(track.artist, normalizedQuery)
    )
  }, [playableSingles, normalizedQuery])

  const filteredAlbums = useMemo(() => {
    if (!normalizedQuery) return albumGroups
    return albumGroups.filter((album) =>
      matchesQuery(album.name, normalizedQuery) ||
      album.tracks.some((track) =>
        matchesQuery(track.title, normalizedQuery) ||
        matchesQuery(track.artist, normalizedQuery),
      )
    )
  }, [albumGroups, normalizedQuery])

  const filteredProducts = useMemo(() => {
    if (!normalizedQuery) return products
    return products.filter((product) =>
      matchesQuery(product.name, normalizedQuery) ||
      matchesQuery(product.category, normalizedQuery) ||
      matchesQuery(product.description, normalizedQuery)
    )
  }, [products, normalizedQuery])

  const filteredVideos = useMemo(() => {
    if (!normalizedQuery) return videos
    return videos.filter((video) =>
      matchesQuery(video.title, normalizedQuery) ||
      matchesQuery(video.channel_name, normalizedQuery) ||
      matchesQuery(video.video_category, normalizedQuery)
    )
  }, [videos, normalizedQuery])

  const filteredCollaborators = useMemo(() => {
    if (!normalizedQuery) return collaborators
    return collaborators.filter((credit) => matchesQuery(credit.name, normalizedQuery))
  }, [collaborators, normalizedQuery])

  const heroAccent = appearance?.accentColor || 'var(--pf-orange)'
  const heroPrimary = appearance?.primaryColor || 'var(--pf-orange)'
  const heroSecondary = appearance?.secondaryColor || 'rgba(255,255,255,0.85)'

  const accent = heroAccent

  const supportBlock = (
    <div className="mt-8 rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-6">
      <div className="flex items-center gap-2 mb-4">
        <Star size={18} style={{ color: accent }} />
        <h3 className="text-lg font-bold text-[var(--pf-text)]">Support This Creator</h3>
      </div>
      <p className="text-sm text-[var(--pf-text-secondary)] mb-4">
        Explore the music, share the link, and shop the collection when it is live.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        <button
          onClick={() => setActive('music')}
          className="flex items-center gap-3 rounded-xl border border-[var(--pf-border)] p-4 text-left transition-colors"
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = `color-mix(in srgb, ${accent} 30%, transparent)`)}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--pf-border)')}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `color-mix(in srgb, ${accent} 10%, transparent)` }}>
            <Disc size={20} style={{ color: accent }} />
          </div>
          <div>
            <p className="font-medium text-[var(--pf-text)]">Stream Music</p>
            <p className="text-xs text-[var(--pf-text-muted)]">Listen and share</p>
          </div>
        </button>

        <button
          onClick={() => setActive('store')}
          className="flex items-center gap-3 rounded-xl border border-[var(--pf-border)] p-4 text-left transition-colors"
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = `color-mix(in srgb, ${accent} 30%, transparent)`)}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--pf-border)')}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `color-mix(in srgb, ${accent} 10%, transparent)` }}>
            <Star size={20} style={{ color: accent }} />
          </div>
          <div>
            <p className="font-medium text-[var(--pf-text)]">Shop Products</p>
            <p className="text-xs text-[var(--pf-text-muted)]">See the collection</p>
          </div>
        </button>

        <Link
          href="/store"
          className="flex items-center gap-3 rounded-xl border border-[var(--pf-border)] p-4 transition-colors"
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = `color-mix(in srgb, ${accent} 30%, transparent)`)}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--pf-border)')}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `color-mix(in srgb, ${accent} 10%, transparent)` }}>
            <ArrowRight size={20} style={{ color: accent }} />
          </div>
          <div>
            <p className="font-medium text-[var(--pf-text)]">Browse Store</p>
            <p className="text-xs text-[var(--pf-text-muted)]">View all collections</p>
          </div>
        </Link>
      </div>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto overflow-x-hidden px-5 pt-4 pb-12 sm:px-6">
      <ArtistSearchBar
        query={query}
        onChange={setQuery}
        onClear={() => setQuery('')}
      />

      <div className="flex w-full flex-nowrap border-b border-[var(--pf-border)] mb-6 -mx-5 overflow-x-auto px-5 pb-1 scrollbar-hide sm:mx-0 sm:px-0 sm:pb-0">
        {TABS.map((tab) => {
          const isActive = active === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={`relative px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'text-[var(--pf-text)]'
                  : 'text-[var(--pf-text-secondary)] hover:text-[var(--pf-text)]'
              }`}
              aria-pressed={isActive}
            >
              {tab.label}
              {isActive && (
                <span
                  className="absolute left-2 right-2 -bottom-px h-0.5 rounded-full"
                  style={{ backgroundColor: heroAccent }}
                />
              )}
            </button>
          )
        })}
      </div>

      {supportBlock}

      {active === 'music' && (
        <div className="space-y-8">
          {normalizedQuery && (
            <div className="rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-4">
              <p className="text-sm font-medium text-[var(--pf-text)]">
                Search results for “{query}”
              </p>
              <p className="mt-1 text-xs text-[var(--pf-text-muted)]">
                {filteredTracks.length} tracks, {filteredAlbums.length} albums, {filteredSingles.length} singles, {filteredVideos.length} videos, {filteredProducts.length} products, {filteredCollaborators.length} collaborators
              </p>
            </div>
          )}

          {playableFeatured.length > 0 && !normalizedQuery && (
            <section>
              {playableFeatured.length === 1 ? (
                <FeaturedTrackCard track={playableFeatured[0]} queue={allPlayableTracks} />
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <Star size={14} className="text-[var(--pf-orange)] fill-[var(--pf-orange)]" />
                    <h2 className="text-base font-semibold">Featured Tracks</h2>
                  </div>
                  <ArtistTrackList tracks={playableFeatured} />
                </>
              )}
            </section>
          )}

          <section>
            <div className="flex items-center gap-2 mb-3">
              <MusicHeading accent={heroAccent} />
              <h2 className="text-base font-semibold">Music</h2>
            </div>
            {filteredTracks.length === 0 ? (
              <EmptyMessage
                title={normalizedQuery ? 'No tracks matched that search' : 'No tracks yet'}
                body={normalizedQuery ? 'Try another title, album, or artist name.' : 'New music will appear here when it is ready.'}
              />
            ) : (
              <ArtistTrackList tracks={filteredTracks} />
            )}
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Users size={14} className="text-[var(--pf-text-muted)]" />
              <h2 className="text-base font-semibold">Singles</h2>
            </div>
            {filteredSingles.length === 0 ? (
              <EmptyMessage
                title={normalizedQuery ? 'No singles matched that search' : 'No singles yet'}
                body={normalizedQuery ? 'Try a different single title or track name.' : 'Singles will appear when there is standalone music to show.'}
              />
            ) : (
              <ArtistTrackList tracks={filteredSingles} />
            )}
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Disc size={14} className="text-[var(--pf-text-muted)]" />
              <h2 className="text-base font-semibold">Albums</h2>
            </div>
            {filteredAlbums.length === 0 ? (
              <EmptyMessage
                title={normalizedQuery ? 'No albums matched that search' : 'No albums yet'}
                body={normalizedQuery ? 'Try another album title or track name.' : 'Albums will appear when tracks are grouped together.'}
              />
            ) : (
              <div className="space-y-3">
                {filteredAlbums.map((album) => {
                  const isOpen = openAlbum === album.name
                  return (
                    <div
                      key={album.name}
                      className={`overflow-hidden rounded-2xl border transition-colors ${
                        isOpen
                          ? 'bg-[var(--pf-surface)]'
                          : 'border-[var(--pf-border)] bg-[var(--pf-surface)] hover:border-[var(--pf-text-muted)]'
                      }`}
                      style={isOpen ? { borderColor: accent } : undefined}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenAlbum(isOpen ? null : album.name)}
                        aria-expanded={isOpen}
                        aria-controls={`album-${album.name}`}
                        className="w-full flex items-center gap-3 p-3 text-left"
                      >
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-[var(--pf-bg)] border border-[var(--pf-border)] shrink-0">
                          {album.image ? (
                            <Image
                              src={album.image}
                              alt={album.name}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[var(--pf-text-muted)]">
                              <Disc size={20} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-base font-semibold truncate`} style={isOpen ? { color: accent } : undefined}>
                            {album.name}
                          </p>
                          <p className="text-xs text-[var(--pf-text-muted)]">
                            {album.tracks.length} {album.tracks.length === 1 ? 'track' : 'tracks'}
                          </p>
                        </div>
                        <ChevronDown
                          size={18}
                          className={`text-[var(--pf-text-muted)] flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                          style={isOpen ? { color: accent } : undefined}
                        />
                      </button>
                      {isOpen && (
                        <div id={`album-${album.name}`} className="px-2 pb-2">
                          <ArtistTrackList tracks={album.tracks} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Users size={14} className="text-[var(--pf-text-muted)]" />
              <h2 className="text-base font-semibold">Collaborators</h2>
            </div>
            {filteredCollaborators.length === 0 ? (
              <EmptyMessage
                title={normalizedQuery ? 'No collaborators matched that search' : 'No collaborators yet'}
                body={normalizedQuery ? 'Try a collaborator name or featured artist.' : 'Collaborator circles will appear when tracks include multiple artists.'}
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {filteredCollaborators.map((credit) => (
                  <Link
                    key={credit.id || credit.name}
                    href={credit.href || '/artists'}
                    className="flex items-center gap-3 rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-4 transition-colors"
                    style={{ borderColor: 'var(--pf-border)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = `color-mix(in srgb, ${accent} 30%, transparent)`)}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--pf-border)')}
                  >
                    <ArtistAvatar src={credit.image} alt={credit.name} name={credit.name} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-[var(--pf-text)]">{credit.name}</p>
                      <p className="text-xs text-[var(--pf-text-muted)]">Contributor</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {active === 'store' && (
        <div>
          {filteredProducts.length === 0 ? (
            <EmptyMessage
              title={normalizedQuery ? 'No products matched that search' : 'Store coming soon'}
              body={normalizedQuery ? 'Try a product name or collection title.' : `${artistName} hasn't published merch yet.`}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredProducts.map((product) => {
                const gallery = product.images?.length ? product.images : [product.image]
                return (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)] transition"
                    style={{ borderColor: 'var(--pf-border)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = `color-mix(in srgb, ${accent} 40%, transparent)`)}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--pf-border)')}
                  >
                    <div className="relative aspect-square overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.2))]">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_42%),radial-gradient(circle_at_bottom,rgba(255,137,0,0.12),transparent_35%)]" />
                      <Image
                        src={gallery[0] || product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-cover transition duration-300 group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="space-y-3 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-lg font-bold truncate">{product.name}</h3>
                          <p className="mt-1 text-sm text-[var(--pf-text-secondary)] truncate">{product.category}</p>
                        </div>
                        <span className="rounded-full border border-[var(--pf-border)] px-2.5 py-1 text-xs font-medium text-[var(--pf-text-muted)] shrink-0">
                          ${Number(product.price).toFixed(2)}
                        </span>
                      </div>
                      {product.description && (
                        <p className="text-sm text-[var(--pf-text-secondary)] line-clamp-2">
                          {product.description}
                        </p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      )}

      {active === 'videos' && (
        <div className="space-y-6">
          {filteredVideos.length === 0 ? (
            <EmptyMessage
              title={normalizedQuery ? 'No videos matched that search' : 'No videos yet'}
              body={normalizedQuery ? 'Try another title or channel name.' : 'Videos will appear here when the artist adds YouTube imports.'}
            />
          ) : (
            <ArtistVideoLibrary
              videos={filteredVideos}
              emptyTitle="No videos yet"
              emptyBody="Videos will appear here when the artist adds YouTube imports."
            />
          )}
        </div>
      )}

      {active === 'about' && (
        <div className="space-y-6 max-w-2xl">
          {bio ? (
            <p className="text-[var(--pf-text-secondary)] leading-relaxed whitespace-pre-line">
              {bio}
            </p>
          ) : (
            <p className="text-sm text-[var(--pf-text-muted)]">No bio yet.</p>
          )}

          {socialEntries.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-widest text-[var(--pf-text-secondary)] mb-3">Links</p>
              <div className="flex flex-wrap gap-3">
                {socialEntries.map(([platform, value]) => {
                  const Icon = SOCIAL_ICONS[platform as Exclude<SocialPlatform, 'website'>]
                  const href = normalizeSocialUrl(platform as SocialPlatform, value)
                  if (!Icon || !href) {
                    return (
                      <a
                        key={platform}
                        href={externalUrl(platform, value)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-full bg-[var(--pf-surface)] border border-[var(--pf-border)] text-sm text-[var(--pf-text-secondary)] hover:text-[var(--pf-text)] hover:border-[var(--pf-text-muted)] transition-colors capitalize"
                      >
                        {platform}
                      </a>
                    )
                  }
                  return (
                    <a
                      key={platform}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--pf-surface)] border border-[var(--pf-border)] text-sm text-[var(--pf-text-secondary)] hover:text-[var(--pf-text)] hover:border-[var(--pf-text-muted)] transition-colors capitalize"
                      aria-label={`${artistName} on ${platform}`}
                    >
                      <Icon size={16} />
                      <span>{platform}</span>
                    </a>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {supportBlock}
    </div>
  )
}

function EmptyMessage({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-6 text-center">
      <p className="text-sm font-medium text-[var(--pf-text)]">{title}</p>
      <p className="mt-2 text-xs text-[var(--pf-text-muted)]">{body}</p>
    </div>
  )
}

function MusicHeading({ accent }: { accent: string }) {
  return (
    <span
      className="inline-flex h-3 w-3 rounded-full"
      style={{ backgroundColor: accent }}
      aria-hidden
    />
  )
}
