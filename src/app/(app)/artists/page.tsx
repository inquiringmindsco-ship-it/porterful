'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, MapPin, Music } from 'lucide-react'
import { useSupabase } from '@/app/providers'
import { getArtistAccessContext } from '@/lib/artist-identity'
import { ArtistMedia } from '@/components/artist/ArtistMedia'

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
}

export default function ArtistsPage() {
  const { user, supabase, loading: authLoading } = useSupabase()
  const [artists, setArtists] = useState<ArtistFromDb[]>([])
  const [artistsLoading, setArtistsLoading] = useState(true)
  const [ctaReady, setCtaReady] = useState(false)
  const [ctaHref, setCtaHref] = useState('/signup?role=supporter')
  const [ctaLabel, setCtaLabel] = useState('Join Porterful')
  const [ctaDescription, setCtaDescription] = useState('Checking account...')

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
        setArtists((data || []).filter((artist: ArtistFromDb) => artist.public_profile_enabled !== false))
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
        setCtaHref('/signup?role=supporter')
        setCtaLabel('Join Porterful')
        setCtaDescription('Create your free fan account')
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
        setCtaHref('/dashboard/dashboard/artist/edit')
        setCtaLabel('Continue Setup')
        setCtaDescription('Finish your Porterful artist setup')
      } else {
        setCtaHref('/apply/form')
        setCtaLabel('Apply as Artist')
        setCtaDescription('Join Porterful as a creator')
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
                Checking account...
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
          <div className="text-center py-12 text-[var(--pf-text-muted)]">Loading artists...</div>
        ) : artists.length === 0 ? (
          <div className="text-center py-12 text-[var(--pf-text-muted)]">No artists found.</div>
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
      const res = await fetch(`/api/tracks?artist=${encodeURIComponent(artist.name)}`)
      if (res.ok) {
        const data = await res.json()
        // data.tracks may be an array from either the legacy static merge or DB rows
        const tracks = Array.isArray(data.tracks) ? data.tracks : []
        setTrackCount(tracks.length)
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
      <ArtistMedia
        src={image}
        alt={artist.name}
        name={artist.name}
        variant="card"
        className="aspect-[4/5]"
        imageClassName="object-cover transition duration-300 group-hover:scale-105"
        sizes="(max-width: 1280px) 50vw, 33vw"
      />
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
