'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, Heart, Headphones, Pause, Play, Shirt } from 'lucide-react'
import { Footer } from '@/components/Footer'
import { useAudio, type Track } from '@/lib/audio-context'
import { TRACKS } from '@/lib/data'
import { ARTISTS, type ArtistData } from '@/lib/artists'
import { filterPublicArtists } from '@/lib/public-artists'
import { getTrackArtwork } from '@/lib/artwork'

const PUBLIC_ARTISTS_FALLBACK = ARTISTS.filter((artist) => artist.trackCount && artist.trackCount > 0)

const formatStatLabel = (count: number, singular: string, plural = `${singular}s`) =>
  `${count} ${count === 1 ? singular : plural}`

export default function HomePage() {
  const { currentTrack, isPlaying, playTrack, togglePlay, setQueue, setMode } = useAudio()
  const revealScopeRef = useRef<HTMLElement | null>(null)
  const [publicArtists, setPublicArtists] = useState<ArtistData[]>(PUBLIC_ARTISTS_FALLBACK)

  useEffect(() => {
    let cancelled = false

    async function loadArtists() {
      try {
        const res = await fetch('/api/artists', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        const artists = filterPublicArtists(
          (Array.isArray(data.artists) ? data.artists : []) as ArtistData[],
        )
        if (!cancelled) {
          setPublicArtists(artists.length > 0 ? artists : PUBLIC_ARTISTS_FALLBACK)
        }
      } catch {
        if (!cancelled) {
          setPublicArtists(PUBLIC_ARTISTS_FALLBACK)
        }
      }
    }

    loadArtists()

    return () => {
      cancelled = true
    }
  }, [])

  const featuredArtist = useMemo(
    () => publicArtists.find((artist) => artist.slug === 'atm-trap') ?? publicArtists[0] ?? PUBLIC_ARTISTS_FALLBACK[0],
    [publicArtists],
  )
  const featuredTracks = useMemo(
    () => TRACKS.filter((track) => track.artist === featuredArtist?.name).slice(0, 3) as Track[],
    [featuredArtist],
  )
  const heroTrack = featuredTracks[0] ?? TRACKS[0]
  const spotlightTrack = featuredTracks[1] ?? heroTrack

  useEffect(() => {
    const scope = revealScopeRef.current
    if (!scope) return

    const groups = Array.from(scope.querySelectorAll<HTMLElement>('.pf-reveal-group'))
    if (groups.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const target = entry.target as HTMLElement
          target.classList.add('is-visible')
          observer.unobserve(target)
        })
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
    )

    groups.forEach((group) => observer.observe(group))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const root = document.documentElement
    const hadDarkClass = root.classList.contains('dark')
    const previousBackground = document.body.style.background
    const previousColor = document.body.style.color

    root.classList.add('dark')
    document.body.style.background = '#07080b'
    document.body.style.color = '#f4f6f8'

    return () => {
      if (!hadDarkClass) {
        root.classList.remove('dark')
      }
      document.body.style.background = previousBackground
      document.body.style.color = previousColor
    }
  }, [])

  const startTrack = (track: Track) => {
    const queue = featuredTracks.length > 0 ? featuredTracks : [track]
    setMode('track')
    setQueue(queue)

    if (currentTrack?.id === track.id) {
      togglePlay()
      return
    }

    playTrack(track)
  }

  const buyTrack = async (track: Track) => {
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            {
              id: track.id,
              name: track.title,
              artist: track.artist,
              price: track.price || 1,
              quantity: 1,
              type: 'track',
            },
          ],
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'Checkout failed')
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('Checkout URL missing')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Checkout failed. Please try again.')
    }
  }

  const isHeroActive = currentTrack?.id === heroTrack.id
  const isSpotlightActive = currentTrack?.id === spotlightTrack.id

  return (
    <div className="dark">
      <main ref={revealScopeRef} className="min-h-screen bg-[var(--pf-bg)] pt-16 md:pt-20 overflow-x-hidden pb-24">
        <section className="relative overflow-hidden border-b border-[var(--pf-border)] bg-[radial-gradient(circle_at_12%_18%,rgba(249,115,22,0.16),transparent_24%),radial-gradient(circle_at_82%_12%,rgba(168,85,247,0.16),transparent_22%),linear-gradient(180deg,#0c0d11_0%,#07080b_100%)]">
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_18%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.03),transparent_40%)]" />
          <div className="pf-container relative py-10 md:py-14 lg:py-16">
            <div className="grid items-center gap-10 lg:grid-cols-[0.94fr_1.06fr]">
              <div className="max-w-2xl">
                <h1 className="text-4xl font-black leading-[0.95] tracking-[-0.06em] text-white sm:text-6xl sm:leading-[0.92] lg:text-7xl">
                  Music + Merch. Direct.
                </h1>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/music"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--pf-orange)] px-6 py-3 text-base font-semibold text-[#111111] transition-transform duration-200 hover:-translate-y-0.5"
                  >
                    Listen
                  </Link>
                  <Link
                    href="/store"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--pf-border)] bg-[var(--pf-surface)] px-6 py-3 text-base font-semibold text-[var(--pf-text)] transition-transform duration-200 hover:-translate-y-0.5 hover:border-[var(--pf-text-muted)]"
                  >
                    Shop
                  </Link>
                </div>

                <div className="mt-4 flex flex-wrap gap-3 text-sm text-[var(--pf-text-muted)]">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2">
                    <span className="h-2 w-2 rounded-full bg-[var(--pf-orange)]" />
                    {formatStatLabel(publicArtists.length, 'artist')}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    {formatStatLabel(TRACKS.length, 'track')}
                  </span>
                </div>
              </div>

              <div className="relative">
                <div className="rounded-[2rem] border border-white/10 bg-black/40 p-3 shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-sm">
                  <div className="relative overflow-hidden rounded-[1.5rem]">
                    <div className="relative aspect-[4/5] min-h-[520px]">
                      <Image
                        src="/images/hero/porterful-hero-studio.webp"
                        alt="A Black artist in a dark recording studio with headphones, a microphone, a keyboard, a vinyl record, and subtle merch details nearby."
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 56vw"
                        className="object-cover object-center"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,8,10,0.1),rgba(7,8,10,0.46)),radial-gradient(circle_at_72%_18%,rgba(249,115,22,0.14),transparent_28%),radial-gradient(circle_at_20%_82%,rgba(168,85,247,0.1),transparent_32%)]" />

                      <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/[0.55] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.26em] text-[var(--pf-text-secondary)] backdrop-blur-xl">
                        <span className="h-2 w-2 rounded-full bg-[var(--pf-orange)]" />
                        Dark studio session
                      </div>

                      <div className="absolute inset-x-4 bottom-4 grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
                        <div className="rounded-2xl border border-white/10 bg-[#0b0d10]/92 p-4 shadow-2xl backdrop-blur-xl">
                          <div className="flex items-start gap-3">
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/10">
                              <Image
                                src={getTrackArtwork(heroTrack)}
                                alt={heroTrack.title}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h2 className="truncate text-base font-semibold text-white">{heroTrack.title}</h2>
                              <p className="truncate text-sm text-[var(--pf-text-secondary)]">{heroTrack.artist}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => startTrack(heroTrack)}
                              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--pf-orange)] text-[#111111] transition-transform duration-200 hover:-translate-y-0.5"
                              aria-label={isHeroActive && isPlaying ? 'Pause hero track' : 'Play hero track'}
                            >
                              {isHeroActive && isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                            </button>
                          </div>

                          <div className="mt-3 h-1.5 rounded-full bg-white/10">
                            <div className="h-full w-[64%] rounded-full bg-gradient-to-r from-[var(--pf-orange)] to-[#f59e0b]" />
                          </div>
                          <div className="mt-2 flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-[var(--pf-text-muted)]">
                            <span>{heroTrack.album}</span>
                            <span>{heroTrack.duration}</span>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-black/[0.72] p-4 shadow-2xl backdrop-blur-xl">
                          <h2 className="text-lg font-semibold leading-tight text-white">
                            Hoodies · Tees · Vinyl
                          </h2>
                          <Link href="/store" className="mt-2 inline-block text-sm text-[var(--pf-orange)] hover:underline">
                            Shop →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pf-reveal-group border-b border-[var(--pf-border)]">
          <div className="pf-container py-12 md:py-16">
            <div className="pf-reveal-child mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--pf-orange)]">
                  Featured
                </p>
                <h2 className="mt-2 text-3xl font-bold text-white md:text-4xl">{spotlightTrack.title}</h2>
              </div>
              <Link href="/music" className="text-sm font-medium text-[var(--pf-orange)] hover:underline">
                All music →
              </Link>
            </div>

            <article className="pf-reveal-child overflow-hidden rounded-[2rem] border border-[var(--pf-border)] bg-[var(--pf-surface)] shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
              <div className="grid gap-0 lg:grid-cols-[0.86fr_1.14fr]">
                <div className="relative min-h-[280px] lg:min-h-[360px]">
                  <Image
                    src={getTrackArtwork(spotlightTrack)}
                    alt={spotlightTrack.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,0,0,0.08),rgba(0,0,0,0.4)),radial-gradient(circle_at_70%_18%,rgba(249,115,22,0.16),transparent_30%)]" />
                </div>

                <div className="flex flex-col justify-between p-6 md:p-8">
                  <div>
                    <p className="text-sm text-[var(--pf-text-secondary)]">{spotlightTrack.artist}</p>
                    <p className="mt-1 text-sm text-[var(--pf-text-muted)]">
                      {spotlightTrack.album} · {spotlightTrack.duration}
                    </p>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => startTrack(spotlightTrack)}
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--pf-orange)] px-6 py-3 text-base font-semibold text-[#111111] transition-transform duration-200 hover:-translate-y-0.5"
                      aria-label={isSpotlightActive && isPlaying ? 'Pause featured track' : 'Play featured track'}
                    >
                      {isSpotlightActive && isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                      Play
                    </button>
                    <button
                      type="button"
                      onClick={() => buyTrack(spotlightTrack)}
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--pf-border)] bg-[var(--pf-bg)] px-6 py-3 text-base font-semibold text-[var(--pf-text)] transition-transform duration-200 hover:-translate-y-0.5 hover:border-[var(--pf-text-muted)]"
                    >
                      Buy — ${spotlightTrack.price || 1}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section className="pf-reveal-group border-b border-[var(--pf-border)]">
          <div className="pf-container py-12 md:py-16">
            <div className="grid gap-4 lg:grid-cols-2">
              <article className="pf-reveal-child rounded-[2rem] border border-[var(--pf-border)] bg-[var(--pf-surface)] p-6 md:p-8 shadow-[0_24px_70px_rgba(0,0,0,0.24)]">
                <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-white md:text-4xl">
                  Listen, buy, wear.
                </h2>
                <div className="mt-8">
                  <Link
                    href="/music"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--pf-border)] bg-[var(--pf-bg)] px-5 py-3 text-sm font-semibold text-[var(--pf-text)] transition-transform duration-200 hover:-translate-y-0.5 hover:border-[var(--pf-text-muted)]"
                  >
                    Browse Music →
                  </Link>
                </div>
              </article>

              <article className="pf-reveal-child rounded-[2rem] border border-[var(--pf-border)] bg-[var(--pf-surface)] p-6 md:p-8 shadow-[0_24px_70px_rgba(0,0,0,0.24)]">
                <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-white md:text-4xl">
                  Artists: upload, sell, grow.
                </h2>
                <div className="mt-8">
                  <Link
                    href="/signup?role=artist"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--pf-border)] bg-[var(--pf-bg)] px-5 py-3 text-sm font-semibold text-[var(--pf-text)] transition-transform duration-200 hover:-translate-y-0.5 hover:border-[var(--pf-text-muted)]"
                  >
                    Join →
                  </Link>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="pf-reveal-group border-b border-[var(--pf-border)]">
          <div className="pf-container py-12 md:py-16">
            <div className="pf-reveal-child mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--pf-orange)]">
                  Shop
                </p>
                <h2 className="mt-2 text-3xl font-bold text-white md:text-4xl">
                  Merch
                </h2>
              </div>
              <Link href="/store" className="text-sm font-medium text-[var(--pf-orange)] hover:underline">
                Shop Merch
              </Link>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.12fr_0.88fr]">
              <article className="pf-reveal-child rounded-[2rem] border border-[var(--pf-border)] bg-[var(--pf-surface)] p-6 md:p-8 shadow-[0_24px_70px_rgba(0,0,0,0.24)]">
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {[
                    { label: 'Hoodies' },
                    { label: 'Tees' },
                    { label: 'Vinyl' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-white/[0.08] bg-black/25 p-4"
                    >
                      <div className="text-lg font-semibold text-white">{item.label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <Link
                    href="/store"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--pf-orange)] px-5 py-3 text-sm font-semibold text-[#111111] transition-transform duration-200 hover:-translate-y-0.5"
                  >
                    Shop →
                  </Link>
                </div>
              </article>

              <article className="pf-reveal-child rounded-[2rem] border border-[var(--pf-border)] bg-[linear-gradient(180deg,rgba(17,19,24,0.95),rgba(10,11,15,0.98))] p-6 md:p-8 shadow-[0_24px_70px_rgba(0,0,0,0.24)]">
                <ul className="mt-4 grid gap-4 text-[var(--pf-text-secondary)]">
                  <li className="flex gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--pf-orange)]" />
                    Music first
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--pf-orange)]" />
                    Merch supports the release
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--pf-orange)]" />
                    Real inventory only
                  </li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section className="pf-reveal-group">
          <div className="pf-container py-12 md:py-16">
            <div className="pf-reveal-child rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.14),transparent_28%),linear-gradient(180deg,rgba(15,17,21,0.98),rgba(8,9,12,0.98))] px-6 py-10 text-center shadow-[0_28px_80px_rgba(0,0,0,0.3)] md:px-10 md:py-14">
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.05em] text-white md:text-5xl">
                Get started.
              </h2>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  href="/signup?role=artist"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--pf-orange)] px-6 py-3 text-base font-semibold text-[#111111] transition-transform duration-200 hover:-translate-y-0.5"
                >
                  Join as Artist
                </Link>
                <Link
                  href="/music"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--pf-border)] bg-[var(--pf-surface)] px-6 py-3 text-base font-semibold text-[var(--pf-text)] transition-transform duration-200 hover:-translate-y-0.5 hover:border-[var(--pf-text-muted)]"
                >
                  Listen
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
