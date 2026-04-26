'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Disc } from 'lucide-react'
import type { Track } from '@/lib/audio-context'
import type { Product } from '@/lib/products'
import { ArtistTrackList } from '@/components/artist/ArtistTrackList'

type TabKey = 'music' | 'store' | 'about'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'music', label: 'Music' },
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
  singles: Track[]
  albumTracks: Track[]
  products: Product[]
}

function buildAlbumGroups(tracks: Track[]): Array<{ name: string; image: string; tracks: Track[] }> {
  const map = new Map<string, { name: string; image: string; tracks: Track[] }>()
  tracks.forEach((t) => {
    const key = t.album || 'Unknown'
    if (!map.has(key)) {
      map.set(key, { name: key, image: t.image || '', tracks: [] })
    }
    map.get(key)!.tracks.push(t)
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

export function ArtistTabs({
  artistName,
  bio,
  social,
  singles,
  albumTracks,
  products,
}: ArtistTabsProps) {
  const [active, setActive] = useState<TabKey>('music')
  const albumGroups = useMemo(() => buildAlbumGroups(albumTracks), [albumTracks])

  const socialEntries = social
    ? (Object.entries(social).filter(([, v]) => !!v) as Array<[keyof SocialLinks, string]>)
    : []

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-6 pt-4 pb-12">
      {/* Tabs */}
      <div className="flex border-b border-[var(--pf-border)] mb-6 -mx-5 sm:mx-0 px-5 sm:px-0 overflow-x-auto scrollbar-hide">
        {TABS.map((t) => {
          const isActive = active === t.key
          return (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={`relative px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'text-[var(--pf-text)]'
                  : 'text-[var(--pf-text-secondary)] hover:text-[var(--pf-text)]'
              }`}
              aria-pressed={isActive}
            >
              {t.label}
              {isActive && (
                <span className="absolute left-2 right-2 -bottom-px h-0.5 bg-[var(--pf-orange)] rounded-full" />
              )}
            </button>
          )
        })}
      </div>

      {/* Music */}
      {active === 'music' && (
        <div className="space-y-8">
          {singles.length === 0 && albumGroups.length === 0 && (
            <div className="text-center py-16">
              <p className="text-sm text-[var(--pf-text-muted)]">No tracks yet.</p>
            </div>
          )}

          {singles.length > 0 && (
            <section>
              <h2 className="text-base font-semibold mb-3">Songs</h2>
              <ArtistTrackList tracks={singles} />
            </section>
          )}

          {albumGroups.map((album) => (
            <section key={album.name}>
              <div className="flex items-center gap-3 mb-3">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[var(--pf-surface)] border border-[var(--pf-border)] shrink-0">
                  {album.image ? (
                    <Image
                      src={album.image}
                      alt={album.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--pf-text-muted)]">
                      <Disc size={20} />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-base font-semibold truncate">{album.name}</p>
                  <p className="text-xs text-[var(--pf-text-muted)]">{album.tracks.length} tracks</p>
                </div>
              </div>
              <ArtistTrackList tracks={album.tracks} />
            </section>
          ))}
        </div>
      )}

      {/* Store */}
      {active === 'store' && (
        <div>
          {products.length === 0 ? (
            <div className="text-center py-16 border border-[var(--pf-border)] rounded-2xl bg-[var(--pf-surface)]">
              <p className="text-sm font-medium text-[var(--pf-text)] mb-1">Store coming soon</p>
              <p className="text-xs text-[var(--pf-text-muted)]">{artistName} hasn't published merch yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="group flex items-center gap-3 p-3 rounded-xl bg-[var(--pf-surface)] border border-[var(--pf-border)] hover:border-[var(--pf-text-muted)] transition-colors"
                >
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-[var(--pf-bg)] shrink-0">
                    {product.image && (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-xs text-[var(--pf-text-muted)] truncate">{product.category}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 text-[var(--pf-text-secondary)]">
                    <span className="text-sm font-semibold text-[var(--pf-text)]">${product.price}</span>
                    <ArrowRight size={12} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* About */}
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
              <div className="flex flex-wrap gap-2">
                {socialEntries.map(([platform, value]) => (
                  <a
                    key={platform}
                    href={externalUrl(platform, value)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-full bg-[var(--pf-surface)] border border-[var(--pf-border)] text-sm text-[var(--pf-text-secondary)] hover:text-[var(--pf-text)] hover:border-[var(--pf-text-muted)] transition-colors capitalize"
                  >
                    {platform}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
