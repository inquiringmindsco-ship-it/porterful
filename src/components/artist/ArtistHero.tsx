'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, Pause, Play, Verified } from 'lucide-react'
import { useAudio, Track } from '@/lib/audio-context'
import { LikenessBadge } from '@/components/likeness/LikenessGate'
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
    social?: SocialLinks
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

  return (
    <section className="relative overflow-hidden border-b border-[var(--pf-border)] bg-[var(--pf-bg)]">
      <div className="absolute inset-0 pointer-events-none">
        {artist.image && (
          <Image
            src={artist.image}
            alt=""
            fill
            sizes="100vw"
            className="object-cover scale-110 blur-3xl opacity-20"
            aria-hidden="true"
          />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,137,0,0.18),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_30%),linear-gradient(180deg,rgba(0,0,0,0.12),rgba(0,0,0,0.55))]" />
      </div>

      {/* Back nav */}
      <div className="relative max-w-6xl mx-auto px-5 sm:px-6 pt-5">
        <Link
          href="/artists"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/75 backdrop-blur-md transition-colors hover:bg-white/10 hover:text-white"
        >
          <ChevronLeft size={16} />
          Artists
        </Link>
      </div>

      <div className="relative max-w-6xl mx-auto px-5 sm:px-6 pt-5 pb-6 sm:pt-6 sm:pb-8">
        <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[rgba(12,12,12,0.72)] shadow-[0_30px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl">
          <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[minmax(0,220px)_1fr_auto] lg:items-center">
            {/* Artwork */}
            <div className="relative mx-auto aspect-square w-full max-w-[220px] overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-2xl">
              {artist.image ? (
                <Image
                  src={artist.image}
                  alt={artist.name}
                  fill
                  sizes="(max-width: 640px) 220px, 220px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/10 to-white/5">
                  <span className="text-5xl font-semibold text-white/70">
                    {artist.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
            </div>

            {/* Info */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.32em] text-white/60">
                <span>Artist profile</span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">{artist.name}</h1>
                {artist.verified && (
                  <Verified size={18} className="shrink-0 text-white/70" />
                )}
                {artist.likeness_verified && <LikenessBadge compact />}
              </div>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
                {artistMeta || 'Artist page'}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
                  {artist.verified ? 'Verified artist' : 'Artist page'}
                </span>
                {artist.likeness_verified && (
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
                    Likeness verified
                  </span>
                )}
                {firstTrack && (
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
                    Top track: {firstTrack.title}
                  </span>
                )}
              </div>

              {socialEntries.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
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
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
                        aria-label={`${artist.name} on ${platform}`}
                      >
                        <Icon size={16} />
                      </a>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Primary action */}
            <div className="flex flex-col items-start gap-3 lg:items-end lg:justify-center">
              <button
                onClick={handlePlay}
                disabled={!firstTrack}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--pf-orange)] px-6 py-3.5 text-sm font-semibold text-[var(--pf-text)] shadow-lg transition-colors hover:bg-[var(--pf-orange)]/90 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={showPause ? `Pause ${artist.name}` : `Play ${artist.name}`}
              >
                {showPause ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                <span>{showPause ? 'Pause' : 'Play'}</span>
              </button>
              <p className="max-w-[14rem] text-xs leading-5 text-white/60 lg:text-right">
                {firstTrack ? `Starts with ${firstTrack.title}` : 'No playable tracks yet.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
