'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Pause, Play } from 'lucide-react'
import { Footer } from '@/components/Footer'
import { useAudio, type Track } from '@/lib/audio-context'
import { TRACKS } from '@/lib/data'
import { ARTISTS } from '@/lib/artists'
import { FEATURED_PRODUCTS } from '@/lib/products'

const featuredArtist = ARTISTS.find((artist) => artist.slug === 'gune') ?? ARTISTS[0]

const featuredTracks = TRACKS
  .filter((track) => track.artist === featuredArtist.name)
  .sort((a, b) => (b.plays || 0) - (a.plays || 0))
  .slice(0, 4) as Track[]

const featuredProduct = FEATURED_PRODUCTS.find((product) => product.featured) ?? FEATURED_PRODUCTS[0]
const featuredProducts = FEATURED_PRODUCTS
  .filter((product) => product.artist !== 'Porterful' && product.artist !== 'Various Artists')
  .slice(0, 3)

const artistSpotlight = ARTISTS.slice(0, 4)

export default function HomePage() {
  const { currentTrack, playTrack, togglePlay, setQueue, setMode } = useAudio()
  const revealScopeRef = useRef<HTMLElement | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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

  const startFeaturedPlayback = (track: Track) => {
    setMode('track')
    setQueue(featuredTracks)

    if (currentTrack?.id === track.id) {
      togglePlay()
      return
    }

    playTrack(track)
  }

  return (
    <>
      <main ref={revealScopeRef} className="min-h-screen bg-[var(--pf-bg)] pt-16 md:pt-20">
        <section className="border-b border-[var(--pf-border)] bg-gradient-to-b from-[var(--pf-orange)]/10 via-[var(--pf-bg)] to-[var(--pf-bg)]">
          <div className="pf-container py-10 md:py-16">
            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
              <div className="relative isolate">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-0 h-44 w-[34rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(198,167,94,0.18),transparent_72%)] blur-3xl"
                />
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-[var(--pf-orange)]">
                  Porterful™
                </p>
                <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-[-0.04em] md:text-6xl">
                  Shop music.
                  <br />
                  Support artists.
                  <br />
                  Discover what&apos;s next.
                </h1>
                <p className="mt-4 max-w-2xl text-lg text-[var(--pf-text-secondary)]">
                  Curated drops, direct support, and music from artists you can actually reach.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/store" className="pf-btn pf-btn-primary inline-flex items-center justify-center gap-2">
                    Shop Products
                  </Link>
                  <Link href="/artists" className="pf-btn pf-btn-secondary inline-flex items-center justify-center gap-2">
                    Browse Artists
                  </Link>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {[
                    { label: 'Direct support', value: 'Buy from artists' },
                    { label: 'New drops', value: 'Updated weekly' },
                    { label: 'Music first', value: 'Listen and share' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-4">
                      <p className="text-xs uppercase tracking-[0.25em] text-[var(--pf-text-muted)]">{item.label}</p>
                      <p className="mt-2 text-sm font-semibold text-[var(--pf-text)]">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-[var(--pf-border)] bg-[var(--pf-surface)] p-5 shadow-2xl shadow-black/30">
                <div className="relative mb-5 aspect-[4/5] overflow-hidden rounded-2xl">
                  <Image
                    src={featuredProduct.image}
                    alt={featuredProduct.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.25em] text-[var(--pf-orange)]">Featured drop</p>
                    <h2 className="mt-2 text-2xl font-bold">{featuredProduct.name}</h2>
                    <p className="mt-1 text-[var(--pf-text-secondary)]">
                      {featuredProduct.artist} • {featuredProduct.category}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full border border-[var(--pf-border)] bg-[var(--pf-bg)] px-3 py-1 text-sm font-semibold">
                    ${featuredProduct.price.toFixed(2)}
                  </span>
                </div>
                <div className="mt-5 rounded-2xl bg-[var(--pf-bg)] p-4">
                  <div className="flex items-center justify-between text-sm text-[var(--pf-text-secondary)]">
                    <span>Featured release</span>
                    <span>Porterful-managed inventory</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pf-reveal-group border-b border-[var(--pf-border)]">
          <div className="pf-container py-10">
            <div className="pf-reveal-child mb-6 flex items-end justify-between gap-4" style={{ transitionDelay: '0ms' }}>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--pf-orange)]">Featured products</p>
                <h2 className="mt-2 text-3xl font-bold">Shop the catalog</h2>
              </div>
              <Link href="/store" className="hidden text-sm font-medium text-[var(--pf-orange)] hover:underline md:block">
                Open the store
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {featuredProducts.map((product, index) => (
                <Link
                  key={product.id}
                  href="/store"
                  className="pf-reveal-child group rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-4 transition hover:border-[var(--pf-orange)]"
                  style={{ transitionDelay: `${(index + 1) * 60}ms` }}
                >
                  <div className="relative mb-4 aspect-square overflow-hidden rounded-xl">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 1280px) 50vw, 25vw"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--pf-text-muted)]">{product.category}</p>
                  <div className="mt-2 flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                    <span className="shrink-0 font-semibold text-[var(--pf-orange)]">${product.price.toFixed(2)}</span>
                  </div>
                  <p className="mt-2 text-sm text-[var(--pf-text-secondary)]">{product.artist}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="pf-reveal-group">
          <div className="pf-container py-10">
            <div className="pf-reveal-child mb-6 flex items-end justify-between gap-4" style={{ transitionDelay: '0ms' }}>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--pf-orange)]">Artists</p>
                <h2 className="mt-2 text-3xl font-bold">Browse artists</h2>
              </div>
              <Link href="/artists" className="hidden text-sm font-medium text-[var(--pf-orange)] hover:underline md:block">
                Browse artists
              </Link>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {artistSpotlight.map((artist, index) => (
                <Link
                  key={artist.id}
                  href={`/artist/${artist.slug}`}
                  className="pf-reveal-child group rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-4 transition hover:border-[var(--pf-orange)]"
                  style={{ transitionDelay: `${(index + 1) * 60}ms` }}
                >
                  <div className="relative mb-4 aspect-[4/5] overflow-hidden rounded-xl">
                    <Image
                      src={artist.image}
                      alt={artist.name}
                      fill
                      sizes="(max-width: 1280px) 50vw, 25vw"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="text-xl font-semibold">{artist.name}</h3>
                  <p className="mt-1 text-sm text-[var(--pf-text-secondary)]">{artist.genre}</p>
                  <p className="mt-3 text-sm text-[var(--pf-text-muted)]">{artist.shortBio}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="pf-reveal-group border-t border-[var(--pf-border)]">
          <div className="pf-container py-10">
            <div className="pf-reveal-child mb-6 flex items-end justify-between gap-4" style={{ transitionDelay: '0ms' }}>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--pf-orange)]">Music</p>
                <h2 className="mt-2 text-3xl font-bold">Tap to listen</h2>
              </div>
              <Link href="/music" className="hidden text-sm font-medium text-[var(--pf-orange)] hover:underline md:block">
                Open full music page
              </Link>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {featuredTracks.map((track, index) => {
                const isActive = currentTrack?.id === track.id
                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => {
                      setMode('track')
                      setQueue(featuredTracks)
                      if (isActive) {
                        togglePlay()
                        return
                      }
                      playTrack(track)
                    }}
                    className="pf-reveal-child flex items-center gap-4 rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-4 text-left transition hover:border-[var(--pf-orange)]"
                    style={{ transitionDelay: `${(index + 1) * 60}ms` }}
                  >
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                      <Image src={track.image ?? ''} alt={track.title} fill sizes="80px" className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs uppercase tracking-[0.2em] text-[var(--pf-text-muted)]">{track.album}</p>
                      <h3 className="mt-1 text-lg font-semibold">{track.title}</h3>
                      <p className="mt-1 truncate text-sm text-[var(--pf-text-secondary)]">{track.artist}</p>
                    </div>
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--pf-border)] bg-[var(--pf-bg)] text-[var(--pf-text)]">
                      {mounted && isActive ? <Pause size={18} /> : <Play size={18} />}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        <section className="pf-reveal-group border-t border-[var(--pf-border)]">
          <div className="pf-container py-10">
            <div className="pf-reveal-child grid gap-4 md:grid-cols-2" style={{ transitionDelay: '0ms' }}>
              <div className="rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-6 md:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--pf-orange)]">Porterful™</p>
                <h2 className="mt-2 text-2xl font-bold">The marketplace</h2>
                <p className="mt-3 text-base leading-7 text-[var(--pf-text-secondary)]">
                  Shop music, merch, and drops directly from the people making them.
                </p>
                <Link href="/store" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--pf-orange)] hover:underline">
                  Go to Store <ArrowRight size={14} />
                </Link>
              </div>
              <div className="rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-6 md:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--pf-orange)]">Support</p>
                <h2 className="mt-2 text-2xl font-bold">Keep the loop moving</h2>
                <p className="mt-3 text-base leading-7 text-[var(--pf-text-secondary)]">
                  Discover artists, share what you love, and support the work you want to keep alive.
                </p>
                <Link href="/support" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--pf-orange)] hover:underline">
                  Support Artists <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
