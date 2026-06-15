'use client'

import Link from 'next/link'
import { ChevronLeft, Pause, Play, Verified } from 'lucide-react'
import { useAudio, Track } from '@/lib/audio-context'
import { ArtistMedia } from '@/components/artist/ArtistMedia'
import { ArtistAvatar } from '@/components/artist/ArtistAvatar'
import { LikenessBadge } from '@/components/likeness/LikenessGate'
import type { ArtistAppearance } from '@/lib/artist-theme'
import {
  SOCIAL_ICONS,
  normalizeSocialUrl,
  type SocialPlatform,
  type ArtistSocialLinks,
} from '@/lib/artist-social'

type SocialLinks = ArtistSocialLinks

interface ArtistHeroProps {
  artist: {
    name: string
    slug: string
    genre: string
    location: string
    verified: boolean
    likeness_verified?: boolean
    image: string
    bannerUrl?: string | null
    coverUrl?: string | null
    trackCount?: number | null
    social?: SocialLinks
    appearance?: ArtistAppearance
  }
  firstTrack: Track | null
  queueTracks: Track[]
}

export function ArtistHero({ artist, firstTrack, queueTracks }: ArtistHeroProps) {
  const { currentTrack, isPlaying, playTrack, togglePlay, setQueue } = useAudio()

  const isThisArtistPlaying = !!currentTrack && queueTracks.some((t) => t.id === currentTrack.id)
  const showPause = isThisArtistPlaying && isPlaying

  const handlePlay = () => {
    if (!firstTrack) return
    if (isThisArtistPlaying) {
      togglePlay()
      return
    }
    if (queueTracks.length > 0) setQueue(queueTracks)
    playTrack(firstTrack)
  }

  const socialEntries = artist.social
    ? (Object.entries(artist.social).filter(
        ([k, v]) => !!v && k !== 'website' && k in SOCIAL_ICONS,
      ) as Array<[Exclude<SocialPlatform, 'website'>, string]>)
    : []
  const artistMeta = [artist.genre, artist.location].filter(Boolean).join(' · ')
  const heroImage = artist.bannerUrl || artist.coverUrl || artist.image
  const appearance = artist.appearance
  const primaryColor = appearance?.primaryColor || 'var(--pf-orange)'
  const secondaryColor = appearance?.secondaryColor || '#ffffff'
  const accentColor = appearance?.accentColor || 'var(--pf-orange)'
  const heroGlow = appearance
    ? `radial-gradient(circle at top right, color-mix(in srgb, ${primaryColor} 22%, transparent), transparent 36%), radial-gradient(circle at bottom left, color-mix(in srgb, ${secondaryColor} 18%, transparent), transparent 30%), linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.55))`
    : 'radial-gradient(circle at top right, rgba(255,137,0,0.18), transparent 36%), radial-gradient(circle at bottom left, rgba(255,255,255,0.08), transparent 30%), linear-gradient(180deg, rgba(0,0,0,0.12), rgba(0,0,0,0.55))'
  const panelStyle = appearance
    ? {
        boxShadow: `0 0 0 1px color-mix(in srgb, ${secondaryColor} 18%, transparent), 0 30px 80px rgba(0,0,0,0.28)`,
      }
    : undefined

  return (
    <section className="relative overflow-hidden border-b border-[var(--pf-border)] bg-[var(--pf-bg)]">
      <div className="absolute inset-0 pointer-events-none">
        <ArtistMedia
          src={heroImage}
          alt=""
          name={artist.name}
          variant="banner"
          className="absolute inset-0"
          imageClassName="object-cover scale-110 blur-3xl opacity-20"
        />
        <div className="absolute inset-0" style={{ backgroundImage: heroGlow }} />
      </div>

      {/* Back nav */}
      <div className="relative max-w-6xl mx-auto px-5 sm:px-6 pt-3">
        <Link
          href="/artists"
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--pf-border)] bg-[var(--pf-surface)] px-3 py-1.5 text-sm text-[var(--pf-text-secondary)] backdrop-blur-md transition-colors hover:bg-[var(--pf-surface-hover)] hover:text-[var(--pf-text)]"
        >
          <ChevronLeft size={16} />
          Artists
        </Link>
      </div>

      <div className="relative max-w-6xl mx-auto px-5 sm:px-6 pt-3 pb-5 sm:pt-4 sm:pb-6">
        <div
          className="overflow-hidden rounded-[32px] border border-[var(--pf-border)] backdrop-blur-xl"
          style={{
            ...(panelStyle || {}),
            backgroundColor: appearance?.colorMode === 'light' ? 'rgba(255,255,255,0.84)' : 'rgba(12,12,12,0.72)',
          }}
        >
          <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,180px)_1fr_auto] lg:items-center">
            {/* Artwork */}
            <div
              className="relative mx-auto flex w-full max-w-[220px] items-center justify-center overflow-hidden rounded-[28px] border border-[var(--pf-border)] px-5 py-5 shadow-xl"
              style={{
                backgroundImage: `linear-gradient(180deg, color-mix(in srgb, ${primaryColor} 8%, rgba(255,255,255,0.06)), color-mix(in srgb, ${secondaryColor} 12%, rgba(0,0,0,0.14)))`,
              }}
            >
              <ArtistAvatar
                src={artist.image}
                alt={artist.name}
                name={artist.name}
                size="xl"
                shape={appearance?.profileImageShape || 'circle'}
                focus={appearance?.profileImageFocus || 'center-face'}
                objectPosition={appearance?.profileImagePosition}
                className="relative z-10 shadow-2xl ring-2 ring-white/15"
                priority
                sizes="(max-width: 640px) 128px, 128px"
              />
            </div>

            {/* Info */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.32em] text-[var(--pf-text-muted)]">
                <span>Artist profile</span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[var(--pf-text)] lg:text-4xl break-words max-w-full">{artist.name}</h1>
                {artist.verified && (
                  <Verified size={18} className="shrink-0 text-[var(--pf-text-secondary)]" />
                )}
                {artist.likeness_verified && <LikenessBadge compact />}
                {/* Social icons next to artist name */}
                {socialEntries.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 ml-1">
                    {socialEntries.map(([platform, value]) => {
                      const Icon = SOCIAL_ICONS[platform]
                      const href = normalizeSocialUrl(platform, value)
                      if (!Icon || !href) return null
                      return (
                        <a
                          key={platform}
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--pf-border)] bg-[var(--pf-surface)] text-[var(--pf-text-secondary)] transition-colors hover:border-[var(--pf-border-hover)] hover:bg-[var(--pf-surface-hover)] hover:text-[var(--pf-text)]"
                          aria-label={`${artist.name} on ${platform}`}
                        >
                          <Icon size={14} />
                        </a>
                      )
                    })}
                  </div>
                )}
              </div>

              <p className="mt-3 max-w-full text-sm leading-6 text-[var(--pf-text-secondary)] sm:text-base break-words">
                {artistMeta || 'Artist page'}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-[var(--pf-border)] bg-[var(--pf-surface)] px-3 py-1 text-xs text-[var(--pf-text-secondary)] truncate max-w-full">
                  {artist.verified ? 'Verified artist' : 'Artist page'}
                </span>
                {typeof artist.trackCount === 'number' && (
                  <span className="rounded-full border border-[var(--pf-border)] bg-[var(--pf-surface)] px-3 py-1 text-xs text-[var(--pf-text-secondary)]">
                    {artist.trackCount} tracks
                  </span>
                )}
                {artist.likeness_verified && (
                  <span className="rounded-full border border-[var(--pf-border)] bg-[var(--pf-surface)] px-3 py-1 text-xs text-[var(--pf-text-secondary)]">
                    Likeness verified
                  </span>
                )}
                {firstTrack && (
                  <span className="rounded-full border border-[var(--pf-border)] bg-[var(--pf-surface)] px-3 py-1 text-xs text-[var(--pf-text-secondary)]">
                    Top track: {firstTrack.title}
                  </span>
                )}
              </div>
            </div>

            {/* Primary action */}
            <div className="flex flex-col items-start gap-3 lg:items-end lg:justify-center">
              <button
                onClick={handlePlay}
                disabled={!firstTrack}
                className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-[var(--pf-text)] shadow-lg transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                style={{ backgroundColor: accentColor }}
                aria-label={showPause ? `Pause ${artist.name}` : `Play ${artist.name}`}
              >
                {showPause ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                <span>{showPause ? 'Pause' : 'Play'}</span>
              </button>
              <p className="max-w-[14rem] text-xs leading-5 text-[var(--pf-text-muted)] lg:text-right">
                {firstTrack ? `Starts with ${firstTrack.title}` : 'No playable tracks yet.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
