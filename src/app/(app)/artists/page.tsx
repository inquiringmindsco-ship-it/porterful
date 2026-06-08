'use client'

import { useEffect, useState } from 'react'
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
  const [ctaReady, setCtaReady] = useState(false)
  const [ctaHref, setCtaHref] = useState('/artists')
  const [ctaLabel, setCtaLabel] = useState('Explore Artists')
  const [ctaDescription, setCtaDescription] = useState('Browse artist profiles and upcoming releases.')

  // Load artists from DB
  useEffect(() => {
    async function loadArtists() {
      if (!supabase) {
        setArtistsLoading(false)
        return
      }
      const { data, error } = await supabase
        .from('artists')
        .select('id, name, slug, genre, location, bio, avatar_url, cover_url, verified, artist_tier, status, public_profile_enabled')
        .in('status', ['active', 'approved'])
        .order('name')
      if (error) {
        console.error('Error loading artists:', error)
      } else {
        setArtists(filterPublicArtists(data as ArtistFromDb[] | null | undefined) as unknown as ArtistFromDb[])
      }
      setArtistsLoading(false)
    }
    loadArtists()
  }, [supabase])

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
                Loading...
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
  const [trackCount, setTrackCount] = useState(0)

  useEffect(() => {
    async function countTracks() {
      const res = await fetch(`/api/tracks?artist=${encodeURIComponent(artist.name)}&count_only=true`)
      if (res.ok) {
        const data = await res.json()
        // Use count_only API for accurate per-artist track counts
        setTrackCount(data.count || 0)
      }
    }
    countTracks()
  }, [artist.name])

  const image = artist.avatar_url || artist.cover_url || ''
  const shortBio = artist.bio?.slice(0, 120) || 'Artist on Porterful'

  return (
    <Link
      href={`/artist/${artist.slug}`}
      className="group overflow-hidden rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)] transition hover:border-[var(--pf-orange)]/40"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.2))]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_42%),radial-gradient(circle_at_bottom,rgba(255,137,0,0.12),transparent_35%)]" />
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <ArtistAvatar
            src={image}
            alt={artist.name}
            name={artist.name}
            size="xl"
            className="ring-4 ring-white/10 transition duration-300 group-hover:scale-105"
          />
        </div>
      </div>
      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold truncate">{artist.name}</h2>
              {artist.verified && (
                <Check size={16} className="text-[var(--pf-orange)] shrink-0" />
              )}
            </div>
            <p className="mt-1 text-sm text-[var(--pf-text-secondary)] truncate">{artist.genre || 'Artist'}</p>
          </div>
          <span className="rounded-full border border-[var(--pf-border)] px-2.5 py-1 text-xs font-medium text-[var(--pf-text-muted)] shrink-0">
            {trackCount} tracks
          </span>
        </div>

        <p className="text-sm text-[var(--pf-text-secondary)] line-clamp-2">
          {shortBio}
        </p>

        <div className="flex items-center gap-2 text-xs text-[var(--pf-text-muted)]">
          <MapPin size={12} />
          <span>{artist.location || 'Location unknown'}</span>
        </div>
      </div>
    </Link>
  )
}
