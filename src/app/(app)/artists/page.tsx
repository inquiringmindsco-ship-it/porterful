'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Check, MapPin, Music } from 'lucide-react'
import { useSupabase } from '@/app/providers'
import { getArtistAccessContext } from '@/lib/artist-identity'

const PUBLIC_ARTISTS = [
  {
    id: 'od-porter',
    name: 'O D Porter',
    slug: 'od-porter',
    genre: 'Hip-Hop, R&B, Soul',
    location: 'St. Louis, MO',
    shortBio: 'St. Louis artist. Born in Miami, raised in NOLA + the Lou. Founder of Porterful. Stubborn when he sets his mind to something.',
    image: '/artist-images/od-porter/avatar.jpg',
    verified: true,
    trackCount: 84,
  },
  {
    id: 'gune',
    name: 'Gune',
    slug: 'gune',
    genre: 'Hip-Hop / R&B / Blues',
    location: 'St. Louis, MO',
    shortBio: "Raw St. Louis hip-hop. Gune doesn't make music for everyone — just for the ones who get it.",
    image: '/artist-images/gune/avatar.jpg',
    verified: true,
    trackCount: 3,
  },
  {
    id: 'atm-trap',
    name: 'ATM Trap',
    slug: 'atm-trap',
    genre: 'Hip-Hop',
    location: 'St. Louis, MO',
    shortBio: 'St. Louis hip-hop artist. Real rap, real STL.',
    image: '/artist-images/atm-trap/avatar.jpg',
    verified: true,
    trackCount: 4,
  },
] as const

export default function ArtistsPage() {
  const { user, supabase, loading: authLoading } = useSupabase()
  const [ctaReady, setCtaReady] = useState(false)
  const [ctaHref, setCtaHref] = useState('/signup?role=supporter')
  const [ctaLabel, setCtaLabel] = useState('Join Porterful')
  const [ctaDescription, setCtaDescription] = useState('Checking account...')

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
        setCtaHref('/dashboard/artist/edit')
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
              Public artists
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
              Artists
            </h1>
            <p className="mt-3 max-w-xl text-base text-[var(--pf-text-secondary)]">
              Only the artists we can stand behind publicly. Real profiles, real music, no filler.
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
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {PUBLIC_ARTISTS.map((artist) => (
            <Link
              key={artist.id}
              href={`/artist/${artist.slug}`}
              className="group overflow-hidden rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)] transition hover:border-[var(--pf-orange)]/40"
            >
              <div className="relative aspect-[4/5]">
                <Image
                  src={artist.image}
                  alt={artist.name}
                  fill
                  sizes="(max-width: 1280px) 50vw, 33vw"
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
              </div>
              <div className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold">{artist.name}</h2>
                      {artist.verified && (
                        <Check size={16} className="text-[var(--pf-orange)]" />
                      )}
                    </div>
                    <p className="mt-1 text-sm text-[var(--pf-text-secondary)]">{artist.genre}</p>
                  </div>
                  <span className="rounded-full border border-[var(--pf-border)] px-2.5 py-1 text-xs font-medium text-[var(--pf-text-muted)]">
                    {artist.trackCount || 0} tracks
                  </span>
                </div>

                <p className="text-sm text-[var(--pf-text-secondary)]">
                  {artist.shortBio}
                </p>

                <div className="flex items-center gap-2 text-xs text-[var(--pf-text-muted)]">
                  <MapPin size={12} />
                  <span>{artist.location}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
