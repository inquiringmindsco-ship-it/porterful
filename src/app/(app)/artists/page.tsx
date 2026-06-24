'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, MapPin, Music } from 'lucide-react'
import { useSupabase } from '@/app/providers'
import { getArtistAccessContext } from '@/lib/artist-identity'
import { ArtistAvatar } from '@/components/artist/ArtistAvatar'
import { filterPublicArtists } from '@/lib/public-artists'

interface ArtistFromDb {
  id: string
  name: string
  slug: string
  genre: string
  location: string
  bio: string
  avatar_url: string | null
  cover_url: string | null
  verified: boolean
  artist_tier: string
  status: string
  public_profile_enabled?: boolean | null
  image?: string
}

export default function ArtistsPage() {
  const { user, supabase, loading: authLoading } = useSupabase()
  const [artists, setArtists] = useState<ArtistFromDb[]>([])
  const [artistsLoading, setArtistsLoading] = useState(true)
  const [artistsError, setArtistsError] = useState<string | null>(null)
  const [ctaReady, setCtaReady] = useState(false)
  const [ctaHref, setCtaHref] = useState('/artists')
  const [ctaLabel, setCtaLabel] = useState('Explore Artists')
  const [ctaDescription, setCtaDescription] = useState('Browse artist profiles and upcoming releases.')
  const [refreshNonce, setRefreshNonce] = useState(0)

  // Load artists from DB
  const loadArtists = useCallback(async () => {
    if (!supabase) {
      setArtistsError('Artists are temporarily unavailable.')
      setArtistsLoading(false)
      return
    }

    setArtistsLoading(true)
    setArtistsError(null)

    try {
      const { data, error } = await supabase
        .from('artists')
        .select('id, name, slug, genre, location, bio, avatar_url, cover_url, verified, artist_tier, status, public_profile_enabled')
        .in('status', ['active', 'approved'])
        .order('name')

      if (error) throw error
      setArtists(filterPublicArtists(data as ArtistFromDb[] | null | undefined) as unknown as ArtistFromDb[])
    } catch (err) {
      console.error('Error loading artists:', err)
      setArtists([])
      setArtistsError('Artists are temporarily unavailable.')
    } finally {
      setArtistsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    void loadArtists()
  }, [loadArtists, refreshNonce])

  // Load CTA
  useEffect(() => {
    let active = true

    async function loadCta() {
      if (authLoading) return

      if (!user || !supabase) {
        if (!active) return
        setCtaHref('/artists')
        setCtaLabel('Explore Artists')
        setCtaDescription('Browse the current lineup')
        setCtaReady(true)
        return
      }

      const { artist, isArtist } = await getArtistAccessContext(supabase, user.id)

      if (!active) return

      if (isArtist && artist) {
        setCtaHref('/dashboard/artist')
        setCtaLabel('Manage My Artist Profile')
        setCtaDescription('Go to your artist dashboard')
      } else if (isArtist) {
        setCtaHref('/dashboard/artist/edit')
        setCtaLabel('Continue Setup')
        setCtaDescription('Finish your Porterful artist setup')
      } else {
        setCtaHref('/onboarding')
        setCtaLabel('Open Dashboard')
        setCtaDescription('Continue from your creator home')
      }

      setCtaReady(true)
    }

    setCtaReady(false)
    void loadCta()

    return () => {
      active = false
    }
  }, [authLoading, user, supabase])

  return (
    <div className="min-h-screen bg-[var(--pf-bg)] pt-20 pb-24">
      <section className="relative overflow-hidden border-b border-[var(--pf-border)] bg-gradient-to-br from-[var(--pf-orange)]/10 via-[var(--pf-bg)] to-[var(--pf-bg)]">
        <div className="pf-container py-16">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-[var(--pf-border)] bg-[var(--pf-surface)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--pf-text-muted)]">
              <Music size={12} />
              Artists
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
              Artists
            </h1>
            <p className="mt-3 max-w-xl text-base text-[var(--pf-text-secondary)]">
              Only the artists we stand behind publicly. Real music, no filler.
            </p>
            {ctaReady ? (
              <Link
                href={ctaHref}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--pf-orange)] px-5 py-3 font-semibold text-white transition-colors hover:bg-[var(--pf-orange-dark)]"
              >
                {ctaLabel}
                <ArrowRight size={16} />
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--pf-orange)] px-5 py-3 font-semibold text-white opacity-70"
              >
                Preparing
                <ArrowRight size={16} />
              </button>
            )}
            <p className="mt-3 text-sm text-[var(--pf-text-secondary)]">
              {ctaDescription}
            </p>
          </div>
        </div>
      </section>

      <section className="pf-container py-12">
        {artistsLoading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-6 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-full bg-[var(--pf-border)]" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-3/4 rounded bg-[var(--pf-border)]" />
                    <div className="h-4 w-1/2 rounded bg-[var(--pf-border)]" />
                  </div>
                </div>
                <div className="mt-4 h-20 rounded-xl bg-[var(--pf-border)]" />
              </div>
            ))}
          </div>
        ) : artistsError ? (
          <div className="mx-auto max-w-2xl rounded-[24px] border border-[var(--pf-border)] bg-[var(--pf-surface)] p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[var(--pf-border)] bg-[var(--pf-bg)]">
              <Music size={24} className="text-[var(--pf-text-muted)]" />
            </div>
            <h3 className="text-xl font-semibold text-[var(--pf-text)]">Artists are temporarily unavailable</h3>
            <p className="mt-2 text-[var(--pf-text-secondary)]">{artistsError}</p>
            <button
              type="button"
              onClick={() => setRefreshNonce((current) => current + 1)}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--pf-orange)] px-5 py-3 font-semibold text-white transition-colors hover:bg-[var(--pf-orange-dark)]"
            >
              Retry
              <ArrowRight size={16} />
            </button>
          </div>
        ) : artists.length === 0 ? (
          <div className="text-center py-20">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[var(--pf-border)] bg-[var(--pf-surface)]">
              <Music size={28} className="text-[var(--pf-text-muted)]" />
            </div>
            <h3 className="text-xl font-semibold text-[var(--pf-text)]">No artists yet</h3>
            <p className="mt-2 text-[var(--pf-text-secondary)]">Be the first to join Porterful.</p>
            <Link
              href="/apply"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--pf-orange)] px-5 py-3 font-semibold text-white transition-colors hover:bg-[var(--pf-orange-dark)]"
            >
              Apply as Artist
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {artists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function ArtistCard({ artist }: { artist: ArtistFromDb }) {
  const image = artist.avatar_url || artist.cover_url || ''

  return (
    <Link
      href={`/artist/${artist.slug}`}
      className="group overflow-hidden rounded-[22px] border border-[var(--pf-border)] bg-[var(--pf-surface)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--pf-orange)]/40"
    >
      <div className="p-3 sm:p-4">
        <div className="overflow-hidden rounded-[18px] border border-[var(--pf-border)] bg-[var(--pf-bg)]">
          <div className="relative mx-auto aspect-square w-full max-w-[220px] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.18))]">
            <ArtistAvatar
              src={image}
              alt={artist.name}
              name={artist.name}
              size="lg"
              shape="rounded-square"
              className="h-full w-full border-0 ring-0 shadow-none transition duration-300 group-hover:scale-[1.02]"
            />
          </div>
        </div>

        <div className="mt-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-base font-bold text-[var(--pf-text)] sm:text-lg">{artist.name}</h2>
              {artist.verified && (
                <Check size={16} className="shrink-0 text-[var(--pf-orange)]" />
              )}
            </div>
            <p className="mt-1 truncate text-xs sm:text-sm text-[var(--pf-text-secondary)]">
              {artist.genre || 'Artist'} · {artist.location || 'Location unknown'}
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[var(--pf-border)] bg-[var(--pf-bg)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--pf-text-muted)]">
            {artist.genre || 'Artist'}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-[var(--pf-border)] bg-[var(--pf-bg)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--pf-text-muted)]">
            <MapPin size={11} />
            {artist.location || 'Location unknown'}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-end gap-3">
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--pf-orange)]">
            Open
            <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  )
}
