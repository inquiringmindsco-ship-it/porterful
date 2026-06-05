'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, Heart, Headphones, Pause, Play, Shirt, Music, Package, DollarSign, BarChart3 } from 'lucide-react'
import { Footer } from '@/components/Footer'
import { useSupabase } from '@/app/providers'
import { useAudio, type Track } from '@/lib/audio-context'
import { TRACKS } from '@/lib/data'
import { ARTISTS, type ArtistData } from '@/lib/artists'
import { filterPublicArtists } from '@/lib/public-artists'
import { getTrackArtwork } from '@/lib/artwork'
import { PRODUCTS, isPurchasable } from '@/lib/products'

const PUBLIC_ARTISTS_FALLBACK = ARTISTS.filter((artist) => artist.trackCount && artist.trackCount > 0)

export default function HomePage() {
  const { currentTrack, isPlaying, playTrack, togglePlay, setQueue, setMode } = useAudio()
  const { user, loading: authLoading } = useSupabase()
  const revealScopeRef = useRef<HTMLElement | null>(null)
  const [mounted, setMounted] = useState(false)
  const [publicArtists, setPublicArtists] = useState<ArtistData[]>(PUBLIC_ARTISTS_FALLBACK)
  const [homepageData, setHomepageData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      try {
        // Load all homepage data from single API
        const res = await fetch('/api/homepage-data', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          if (!cancelled) {
            setHomepageData(data)
            // Also load artists for the browse section
            const artistsRes = await fetch('/api/artists', { cache: 'no-store' })
            if (artistsRes.ok) {
              const artistsData = await artistsRes.json()
              const artists = filterPublicArtists(
                (Array.isArray(artistsData.artists) ? artistsData.artists : []) as ArtistData[],
              )
              setPublicArtists(artists.length > 0 ? artists : PUBLIC_ARTISTS_FALLBACK)
            }
          }
        }
      } catch {
        // Silently fail, use fallbacks
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadData()

    return () => {
      cancelled = true
    }
  }, [])

  // Get real counts from API
  const artistCount = homepageData?.counts?.publicArtists || publicArtists.length || 0
  const trackCount = homepageData?.counts?.activeTracks || 0
  const authReady = mounted && !authLoading
  const rawRole = (user?.user_metadata as { role?: unknown } | undefined)?.role
  const role = typeof rawRole === 'string' ? rawRole.toLowerCase() : ''
  const isCreatorRole = role === 'artist' || role === 'admin' || role === 'founder'
  const heroPrimaryAction = !authReady
    ? { href: '/onboarding', label: 'Loading...', disabled: true }
    : !user
      ? { href: '/apply', label: 'Upload Your Music', disabled: false }
      : isCreatorRole
        ? { href: '/dashboard/upload', label: 'Upload Music', disabled: false }
        : { href: '/onboarding', label: 'Open Dashboard', disabled: false }

  // Build a Track-like object from DB data with proper duration formatting
  function buildTrackFromDb(nt: any): Track {
    let duration = '0:00'
    if (nt.duration) {
      const raw = String(nt.duration).trim()
      // If it's a numeric string like "221" → format as M:SS
      if (/^\d+$/.test(raw)) {
        const seconds = parseInt(raw, 10)
        duration = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
      } else if (typeof nt.duration === 'number') {
        duration = `${Math.floor(nt.duration / 60)}:${String(nt.duration % 60).padStart(2, '0')}`
      } else {
        duration = raw
      }
    }
    return {
      id: nt.id,
      title: nt.title,
      artist: nt.artist,
      album: nt.album || 'Single',
      duration,
      cover_url: nt.cover_url,
      image: nt.cover_url || '/album-art/default.jpg',
      audio_url: `/api/tracks/${nt.id}/audio`, // Dynamic audio endpoint
      price: Number(nt.proud_to_pay_min ?? nt.price ?? 0.50),
      status: nt.status, // PHASE C: pass through status for eligibility checks
    } as Track
  }

  // Get hero track: DB-only, no static fallback
  const heroTrack = useMemo(() => {
    const heroTrackId = homepageData?.siteSettings?.hero_track_id
    if (heroTrackId) {
      const dbMatch = homepageData?.tracks?.find((t: any) => t.id === heroTrackId)
      if (dbMatch) return buildTrackFromDb(dbMatch)
    }
    if (homepageData?.newestTrack) {
      return buildTrackFromDb(homepageData.newestTrack)
    }
    return null
  }, [homepageData])

  // Spotlight track: DB-only featured picks
  const featuredTracks = useMemo(() => {
    const featuredIds = homepageData?.siteSettings?.featured_track_ids || []
    const tracks: Track[] = []
    for (const id of featuredIds.slice(0, 3)) {
      const dbMatch = homepageData?.tracks?.find((t: any) => t.id === id)
      if (dbMatch) tracks.push(buildTrackFromDb(dbMatch))
    }
    return tracks.length > 0 ? tracks : null
  }, [homepageData])

  const spotlightTrack = featuredTracks?.[0] ?? null
  const homepageProducts = useMemo(() => {
    const visibleProducts = Array.isArray(homepageData?.products) ? homepageData.products : PRODUCTS
    return visibleProducts as typeof PRODUCTS
  }, [homepageData])

  const featuredArtist = useMemo(
    () => publicArtists.find((artist) => artist.slug === 'od-porter') ?? publicArtists[0] ?? PUBLIC_ARTISTS_FALLBACK[0],
    [publicArtists],
  )

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
    // A3-1 FIX: Build queue from DB-backed visible tracks only
    const dbTracks = homepageData?.tracks || []
    const artistName = track.artist
    const artistDbTracks = dbTracks
      .filter((t: any) => t.artist === artistName || (track as any).artist_id && t.artist_id === (track as any).artist_id)
      .slice(0, 3)
      .map((t: any) => buildTrackFromDb(t))
    const queue = artistDbTracks.length > 0 ? artistDbTracks : [track]
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
              price: track.price ?? 0.50,
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

  const isHeroActive = heroTrack ? currentTrack?.id === heroTrack.id : false
  const isSpotlightActive = spotlightTrack ? currentTrack?.id === spotlightTrack.id : false

  // Get hero label from site settings or default
  const heroLabel = homepageData?.siteSettings?.hero_label || 'New Release'

  return (
    <div className="dark">
      <main ref={revealScopeRef} className="min-h-screen bg-[var(--pf-bg)] pt-16 md:pt-20 overflow-x-hidden pb-24">
        <section className="relative overflow-hidden border-b border-[var(--pf-border)] bg-[radial-gradient(circle_at_12%_18%,rgba(249,115,22,0.16),transparent_24%),radial-gradient(circle_at_82%_12%,rgba(168,85,247,0.16),transparent_22%),linear-gradient(180deg,#0c0d11_0%,#07080b_100%)]">
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_18%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.03),transparent_40%)]" />
          <div className="pf-container relative py-8 sm:py-10 md:py-14 lg:py-16">
            <div className="grid items-center gap-8 sm:gap-10 lg:grid-cols-[0.94fr_1.06fr]">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--pf-orange)]/30 bg-[var(--pf-orange)]/10 px-4 py-1.5 text-sm font-medium text-[var(--pf-orange)]">
                  <span className="h-2 w-2 rounded-full bg-[var(--pf-orange)] animate-pulse" />
                  Founding Beta — Limited Early Access
                </div>
                <h1 className="text-4xl font-black leading-[0.95] tracking-[-0.06em] text-white sm:text-6xl sm:leading-[0.92] lg:text-7xl">
                  Upload. Build. Sell. Track.
                </h1>
                <p className="mt-4 text-base text-[var(--pf-text-secondary)] sm:text-lg">
                  Upload music. Sell products. Build your audience. One platform.
                </p>

                <div className="mt-5 sm:mt-6 flex flex-wrap gap-3">
                  {heroPrimaryAction.disabled ? (
                    <button
                      type="button"
                      disabled
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--pf-orange)] px-6 py-3 text-base font-semibold text-[#111111] opacity-75"
                    >
                      Loading... <ArrowRight size={18} />
                    </button>
                  ) : (
                    <Link
                      href={heroPrimaryAction.href}
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--pf-orange)] px-6 py-3 text-base font-semibold text-[#111111] transition-transform duration-200 hover:-translate-y-0.5"
                    >
                      {heroPrimaryAction.label} <ArrowRight size={18} />
                    </Link>
                  )}
                  <Link
                    href="/store"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--pf-border)] bg-[var(--pf-surface)] px-6 py-3 text-base font-semibold text-[var(--pf-text)] transition-transform duration-200 hover:-translate-y-0.5 hover:border-[var(--pf-text-muted)]"
                  >
                    Shop Store
                  </Link>
                  <Link
                    href="/music"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--pf-border)] bg-[var(--pf-surface)] px-6 py-3 text-base font-semibold text-[var(--pf-text)] transition-transform duration-200 hover:-translate-y-0.5 hover:border-[var(--pf-text-muted)]"
                  >
                    Listen
                  </Link>
                </div>

                <div className="mt-4 flex flex-wrap gap-3 text-sm text-[var(--pf-text-muted)]">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2">
                    <span className="h-2 w-2 rounded-full bg-[var(--pf-orange)]" />
                    {loading ? (
                      <span className="inline-flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--pf-text-muted)] animate-pulse" />
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--pf-text-muted)] animate-pulse delay-75" />
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--pf-text-muted)] animate-pulse delay-150" />
                      </span>
                    ) : `${artistCount} ${artistCount === 1 ? 'artist' : 'artists'}`}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    {loading ? (
                      <span className="inline-flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--pf-text-muted)] animate-pulse" />
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--pf-text-muted)] animate-pulse delay-75" />
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--pf-text-muted)] animate-pulse delay-150" />
                      </span>
                    ) : `${trackCount} ${trackCount === 1 ? 'track' : 'tracks'}`}
                  </span>
                </div>
              </div>

              <div className="relative">
                <div className="rounded-[2rem] border border-white/10 bg-black/40 p-2 sm:p-3 shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-sm">
                  <div className="relative overflow-hidden rounded-[1.5rem]">
                    <div className="relative aspect-[4/5] min-h-[400px] sm:min-h-[480px] md:min-h-[520px]">
                      <Image
                        src="/images/hero/porterful-hero-studio.webp"
                        alt="A Black artist in a dark recording studio with headphones, a microphone, a keyboard, a vinyl record, and subtle merch details nearby."
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 56vw"
                        className="object-cover object-center"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,8,10,0.1),rgba(7,8,10,0.46)),radial-gradient(circle_at_72%_18%,rgba(249,115,22,0.14),transparent_28%),radial-gradient(circle_at_20%_82%,rgba(168,85,247,0.1),transparent_32%)]" />

                      <div className="absolute left-3 sm:left-4 top-3 sm:top-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/[0.55] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.26em] text-[var(--pf-text-secondary)] backdrop-blur-xl">
                        <span className="h-2 w-2 rounded-full bg-[var(--pf-orange)]" />
                        {heroLabel}
                      </div>

                      <div className="absolute inset-x-3 sm:inset-x-4 bottom-6 sm:bottom-8 grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
                        {heroTrack && (
                          <div className="rounded-2xl border border-white/10 bg-[#0b0d10]/92 p-3 sm:p-4 shadow-2xl backdrop-blur-xl">
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

                          <div className="mt-3 h-1 rounded-full bg-white/10">
                            <div className="h-full w-[64%] rounded-full bg-gradient-to-r from-[var(--pf-orange)] to-[#f59e0b]" />
                          </div>
                          <div className="mt-2 flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-[var(--pf-text-muted)]">
                            <span>{heroTrack.album}</span>
                            <span>{heroTrack.duration}</span>
                          </div>
                        </div>
                      )}


                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: How Porterful Works */}
        <section className="pf-reveal-group border-b border-[var(--pf-border)]">
          <div className="pf-container py-12 md:py-16">
            <div className="pf-reveal-child mb-8 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--pf-orange)]">
                How it works
              </p>
              <h2 className="mt-2 text-3xl font-bold text-white md:text-4xl">
                From track to store in four steps
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  step: '01',
                  title: 'Upload Your Music',
                  description: 'Drop your tracks. Set your price. Keep control.',
                  icon: Music,
                },
                {
                  step: '02',
                  title: 'Build Your Products',
                  description: 'Create merch from your music. Shirts, vinyl, more.',
                  icon: Package,
                },
                {
                  step: '03',
                  title: 'Sell Direct',
                  description: 'No middleman. Your fans. Your store. Your revenue.',
                  icon: DollarSign,
                },
                {
                  step: '04',
                  title: 'Track Everything',
                  description: 'See what sells, where, and why. Grow with data.',
                  icon: BarChart3,
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="pf-reveal-child rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.2)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--pf-orange)]">
                      {item.step}
                    </span>
                    <item.icon size={20} className="text-[var(--pf-text-muted)]" />
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm text-[var(--pf-text-secondary)]">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: Featured Products */}
        <section className="pf-reveal-group border-b border-[var(--pf-border)]">
          <div className="pf-container py-12 md:py-16">
            <div className="pf-reveal-child mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--pf-orange)]">
                  Products
                </p>
                <h2 className="mt-2 text-3xl font-bold text-white md:text-4xl">
                  Featured Products
                </h2>
              </div>
              <Link href="/store" className="text-sm font-medium text-[var(--pf-orange)] hover:underline">
                All products →
              </Link>
            </div>

            {(() => {
              const purchasableProducts = homepageProducts.filter((product) => (product as any).purchasable ?? isPurchasable(product))
              if (purchasableProducts.length === 0) {
                return (
                  <div className="pf-reveal-child rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-8 text-center">
                    <p className="text-lg font-semibold text-white">First drop coming soon</p>
                    <p className="mt-2 text-sm text-[var(--pf-text-secondary)]">
                      We&apos;re curating the first collection. Check back shortly.
                    </p>
                  </div>
                )
              }
              return (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {purchasableProducts.slice(0, 4).map((product) => (
                    <Link
                      key={product.id}
                      href={`/store`}
                      className="pf-reveal-child group rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.2)] transition-transform duration-200 hover:-translate-y-0.5"
                    >
                      <div className="relative aspect-square overflow-hidden rounded-xl bg-[var(--pf-bg)]">
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 50vw, 25vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Shirt size={40} className="text-[var(--pf-text-muted)]" />
                          </div>
                        )}
                      </div>
                      <div className="mt-3">
                        <p className="text-xs text-[var(--pf-text-muted)]">{product.category}</p>
                        <h3 className="mt-0.5 text-sm font-semibold text-white truncate">{product.name}</h3>
                        <p className="mt-1 text-sm font-semibold text-[var(--pf-orange)]">
                          ${Number(product.price ?? 0).toFixed(2)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )
            })()}
          </div>
        </section>

        {/* Section 4: Featured Artists */}
        <section className="pf-reveal-group border-b border-[var(--pf-border)]">
          <div className="pf-container py-12 md:py-16">
            <div className="pf-reveal-child mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--pf-orange)]">
                  Artists
                </p>
                <h2 className="mt-2 text-3xl font-bold text-white md:text-4xl">
                  Featured Artists
                </h2>
              </div>
              <Link href="/artists" className="text-sm font-medium text-[var(--pf-orange)] hover:underline">
                All artists →
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {publicArtists.slice(0, 4).map((artist) => (
                <Link
                  key={artist.slug}
                  href={`/artist/${artist.slug}`}
                  className="pf-reveal-child group flex items-center gap-4 rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.2)] transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-white/10">
                    <div className="flex h-full w-full items-center justify-center bg-[var(--pf-bg)]">
                      <span className="text-lg font-semibold text-[var(--pf-text-muted)]">
                        {(artist as any).name?.charAt(0)?.toUpperCase() ?? (artist as any).slug?.charAt(0)?.toUpperCase() ?? '?'}
                      </span>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate">{(artist as any).name ?? (artist as any).slug}</h3>
                    <p className="text-xs text-[var(--pf-text-muted)]">
                      {(artist as any).trackCount ?? 0} {(artist as any).trackCount === 1 ? 'track' : 'tracks'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Section 5: Why Porterful */}
        <section className="pf-reveal-group border-b border-[var(--pf-border)]">
          <div className="pf-container py-12 md:py-16">
            <div className="pf-reveal-child mb-8 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--pf-orange)]">
                Why Porterful
              </p>
              <h2 className="mt-2 text-3xl font-bold text-white md:text-4xl">
                Built for creators, not the middleman
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: 'You own your music',
                  description: 'Keep your rights. Set your own terms. No one takes a cut of your creative work.',
                },
                {
                  title: 'You own your store',
                  description: 'Direct sales to your fans. No platform lock-in. Your storefront, your rules.',
                },
                {
                  title: 'You own your data',
                  description: 'Full attribution and analytics. Know who listens, what sells, and where to grow.',
                },
                {
                  title: 'You own your relationship',
                  description: 'Connect directly with fans. No algorithm in the way. Your community, yours to keep.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="pf-reveal-child rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.2)]"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--pf-orange)]" />
                    <div>
                      <h3 className="text-base font-semibold text-white">{item.title}</h3>
                      <p className="mt-1 text-sm text-[var(--pf-text-secondary)]">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 6: Creator Commerce Platform */}
        <section className="pf-reveal-group border-b border-[var(--pf-border)]">
          <div className="pf-container py-12 md:py-16">
            <div className="pf-reveal-child rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.14),transparent_28%),linear-gradient(180deg,rgba(15,17,21,0.98),rgba(8,9,12,0.98))] px-6 py-10 text-center shadow-[0_28px_80px_rgba(0,0,0,0.3)] md:px-10 md:py-14">
              <h2 className="text-3xl font-bold tracking-[-0.05em] text-white md:text-5xl">
                Creator Commerce Platform
              </h2>
              <p className="mt-4 text-base text-[var(--pf-text-secondary)] md:text-lg">
                From upload to fulfillment, everything in one place.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  href="/apply"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--pf-orange)] px-6 py-3 text-base font-semibold text-[#111111] transition-transform duration-200 hover:-translate-y-0.5"
                >
                  Join as Artist
                </Link>
                <Link
                  href="/store"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--pf-border)] bg-[var(--pf-surface)] px-6 py-3 text-base font-semibold text-[var(--pf-text)] transition-transform duration-200 hover:-translate-y-0.5 hover:border-[var(--pf-text-muted)]"
                >
                  Explore Store
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Track (moved after How It Works) */}
        <section className="pf-reveal-group border-b border-[var(--pf-border)]">
          <div className="pf-container py-12 md:py-16">
            <div className="pf-reveal-child mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--pf-orange)]">
                  Featured
                </p>
                <h2 className="mt-2 text-3xl font-bold text-white md:text-4xl">
                  {featuredTracks?.[0]?.title ?? spotlightTrack?.title ?? 'Discover'}
                </h2>
              </div>
              <Link href="/music" className="text-sm font-medium text-[var(--pf-orange)] hover:underline">
                All music →
              </Link>
            </div>

            <article className="pf-reveal-child overflow-hidden rounded-[2rem] border border-[var(--pf-border)] bg-[var(--pf-surface)] shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
              <div className="grid gap-0 lg:grid-cols-[0.86fr_1.14fr]">
                <div className="relative min-h-[280px] lg:min-h-[360px]">
                  <Image
                    src={getTrackArtwork(featuredTracks?.[0] ?? spotlightTrack)}
                    alt={featuredTracks?.[0]?.title ?? spotlightTrack?.title ?? 'Featured Track'}
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,0,0,0.08),rgba(0,0,0,0.4)),radial-gradient(circle_at_70%_18%,rgba(249,115,22,0.16),transparent_30%)]" />
                </div>

                <div className="flex flex-col justify-between p-6 md:p-8">
                  <div>
                    <p className="text-sm text-[var(--pf-text-secondary)]">{featuredTracks?.[0]?.artist ?? spotlightTrack?.artist ?? ''}</p>
                    <p className="mt-1 text-sm text-[var(--pf-text-muted)]">
                      {featuredTracks?.[0]?.album ?? spotlightTrack?.album ?? ''} · {featuredTracks?.[0]?.duration ?? spotlightTrack?.duration ?? ''}
                    </p>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => { const track = featuredTracks?.[0] ?? spotlightTrack; if (track) startTrack(track); }}
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--pf-orange)] px-6 py-3 text-base font-semibold text-[#111111] transition-transform duration-200 hover:-translate-y-0.5"
                      aria-label={isSpotlightActive && isPlaying ? 'Pause featured track' : 'Play featured track'}
                    >
                      {isSpotlightActive && isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                      Play
                    </button>
                    <button
                      type="button"
                      onClick={() => { const track = featuredTracks?.[0] ?? spotlightTrack; if (track) buyTrack(track); }}
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--pf-border)] bg-[var(--pf-bg)] px-6 py-3 text-base font-semibold text-[var(--pf-text)] transition-transform duration-200 hover:-translate-y-0.5 hover:border-[var(--pf-text-muted)]"
                    >
                      Buy — ${Number(featuredTracks?.[0]?.price ?? spotlightTrack?.price ?? 0.50).toFixed(2)}
                    </button>
                  </div>
                </div>
              </div>
            </article>

            {featuredTracks && featuredTracks.length > 1 && (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {featuredTracks.slice(1).map((track, idx) => (
                  <article
                    key={track.id}
                    className="pf-reveal-child overflow-hidden rounded-[1.5rem] border border-[var(--pf-border)] bg-[var(--pf-surface)] shadow-[0_12px_40px_rgba(0,0,0,0.2)]"
                  >
                    <div className="grid gap-0 sm:grid-cols-[120px_1fr]">
                      <div className="relative aspect-square sm:aspect-auto sm:h-full">
                        <Image
                          src={getTrackArtwork(track)}
                          alt={track.title}
                          fill
                          sizes="120px"
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,0,0,0.15),rgba(0,0,0,0.35))]" />
                      </div>

                      <div className="flex flex-col justify-between p-4 sm:p-5">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--pf-orange)]">
                            Featured {idx + 2}
                          </p>
                          <h3 className="mt-1 text-base font-semibold text-white truncate">{track.title}</h3>
                          <p className="text-sm text-[var(--pf-text-secondary)] truncate">{track.artist}</p>
                          <p className="mt-0.5 text-xs text-[var(--pf-text-muted)]">
                            {track.album} · {track.duration}
                          </p>
                        </div>

                        <div className="mt-4 flex gap-2">
                          <button
                            type="button"
                            onClick={() => startTrack(track)}
                            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--pf-orange)] text-[#111111] transition-transform duration-200 hover:-translate-y-0.5"
                            aria-label={`Play ${track.title}`}
                          >
                            <Play size={14} className="ml-0.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => buyTrack(track)}
                            className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--pf-border)] bg-[var(--pf-bg)] px-3 text-xs font-semibold text-[var(--pf-text)] transition-transform duration-200 hover:-translate-y-0.5 hover:border-[var(--pf-text-muted)]"
                          >
                            ${Number(track.price ?? 0.50).toFixed(2)}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Coming Home Collection™ Section */}
        <section className="pf-reveal-group border-t border-[var(--pf-border)]">
          <div className="pf-container py-12 md:py-16">
            <div className="pf-reveal-child mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#C4956A]">
                  Collection
                </p>
                <h2 className="mt-2 text-3xl font-bold text-white md:text-4xl">
                  Coming Home Collection™
                </h2>
              </div>
              <Link
                href="/collections/coming-home"
                className="text-sm font-medium text-[#C4956A] hover:underline"
              >
                View collection →
              </Link>
            </div>
            <p className="pf-reveal-child mb-8 text-[var(--pf-text-secondary)] max-w-2xl">
              Products inspired by resilience, rebuilding, second chances, and new beginnings.
            </p>
            
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {homepageProducts.filter(p => p.collection === 'coming-home' && ((p as any).purchasable ?? isPurchasable(p))).slice(0, 4).map(product => (
                <Link key={product.id} href={`/store/${product.id}`} className="group block pf-reveal-child">
                  <article className="h-full rounded-[24px] border border-[var(--pf-border)] bg-[var(--pf-surface)] p-4 transition-all hover:border-[#C4956A]/50 hover:shadow-lg">
                    <div className="relative aspect-square overflow-hidden rounded-[16px] bg-[var(--pf-bg-secondary)]">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                      />
                      <div className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
                        style={{ backgroundColor: '#C4956A20', color: '#C4956A', border: '1px solid #C4956A30' }}
                      >
                        🏠 Coming Home™
                      </div>
                    </div>
                    <div className="mt-4">
                      <h3 className="font-semibold text-[var(--pf-text)] group-hover:text-[#C4956A] transition-colors">{product.name}</h3>
                      <p className="mt-1 text-sm text-[var(--pf-text-secondary)]">{product.artist}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-bold text-[var(--pf-text)]">${product.price}</span>
                        <span className="text-xs font-medium text-emerald-400">In Stock</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* HOW PORTERFUL WORKS — Value Visibility Section */}
        <section className="pf-reveal-group border-t border-[var(--pf-border)]">
          <div className="pf-container py-12 md:py-20">
            <div className="pf-reveal-child mb-10 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--pf-orange)]">
                How It Works
              </p>
              <h2 className="mt-2 text-3xl font-bold text-white md:text-4xl">
                Creator → Content → Commerce
              </h2>
              <p className="mt-3 text-[var(--pf-text-secondary)] max-w-xl mx-auto">
                Upload once. Sell everywhere. Keep control.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  step: '1',
                  title: 'Upload',
                  desc: 'Music, merch, or any product you create.',
                  icon: 'Upload',
                },
                {
                  step: '2',
                  title: 'Build Audience',
                  desc: 'Share your work. Grow your listeners.',
                  icon: 'Users',
                },
                {
                  step: '3',
                  title: 'Sell Direct',
                  desc: 'Fans buy from you — not a middleman.',
                  icon: 'ShoppingBag',
                },
                {
                  step: '4',
                  title: 'Track Results',
                  desc: 'See what works. Grow smarter.',
                  icon: 'TrendingUp',
                },
              ].map((item, idx) => (
                <div key={item.step} className="pf-reveal-child relative">
                  {/* Connector line */}
                  {idx < 3 && (
                    <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-[var(--pf-border)]">
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[var(--pf-orange)]" />
                    </div>
                  )}
                  <div className="rounded-[24px] border border-[var(--pf-border)] bg-[var(--pf-surface)] p-6 text-center transition-all hover:border-[var(--pf-orange)]/30">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--pf-orange)]/10 text-[var(--pf-orange)]">
                      <span className="text-xl font-black">{item.step}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-[var(--pf-text-secondary)]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Measurement Preview — Future Value Visibility */}
        <section className="pf-reveal-group border-t border-[var(--pf-border)]">
          <div className="pf-container py-12 md:py-16">
            <div className="pf-reveal-child mb-8 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-400">
                Creator Dashboard
              </p>
              <h2 className="mt-2 text-3xl font-bold text-white md:text-4xl">
                See What Works. Grow Smarter.
              </h2>
              <p className="mt-3 text-[var(--pf-text-secondary)] max-w-xl mx-auto">
                Your Porterful dashboard shows you everything that matters.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: 'Top Content',
                  value: 'See your most-played tracks',
                  icon: '🎵',
                  color: 'emerald',
                },
                {
                  label: 'Top Products',
                  value: 'Track your bestselling merch',
                  icon: '📦',
                  color: 'emerald',
                },
                {
                  label: 'Audience Growth',
                  value: 'Watch your listeners grow',
                  icon: '📈',
                  color: 'emerald',
                },
                {
                  label: 'Engagement',
                  value: 'Understand what fans love',
                  icon: '💬',
                  color: 'emerald',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="pf-reveal-child rounded-[24px] border border-[var(--pf-border)] bg-[var(--pf-surface)] p-6 transition-all hover:border-emerald-500/30"
                >
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="text-lg font-bold text-white mb-1">{item.label}</h3>
                  <p className="text-sm text-[var(--pf-text-secondary)]">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="pf-reveal-child mt-8 text-center">
              <p className="text-sm text-[var(--pf-text-muted)]">
                Measurement features coming soon. Founding Beta members get early access.
              </p>
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
                  href="/apply"
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
