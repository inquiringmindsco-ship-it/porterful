'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Pause, Play } from 'lucide-react'
import { Footer } from '@/components/Footer'
import { useAudio, type Track } from '@/lib/audio-context'
import { TRACKS } from '@/lib/data'
import { ARTISTS } from '@/lib/artists'

const featuredArtist = ARTISTS.find((artist) => artist.slug === 'gune') ?? ARTISTS[0]

const featuredTracks = TRACKS
  .filter((track) => track.artist === featuredArtist.name)
  .slice(0, 4) as Track[]

// Filter to only show artists with real music on CDN
const VALID_ARTIST_SLUGS = ['od-porter', 'gune', 'atm-trap']
const artistSpotlight = ARTISTS.filter(a => VALID_ARTIST_SLUGS.includes(a.slug)).slice(0, 4)

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

  return (
    <>
      <main ref={revealScopeRef} className="min-h-screen bg-[var(--pf-bg)] pt-16 md:pt-20 overflow-x-hidden pb-24">
        <section className="relative overflow-hidden border-b border-[var(--pf-border)] bg-gradient-to-b from-[var(--pf-orange)]/10 via-[var(--pf-bg)] to-[var(--pf-bg)]">
          <div className="pf-container py-10 md:py-16">
            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
              <div className="relative isolate">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-0 h-44 w-[34rem] max-w-[100vw] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.18),transparent_72%)] blur-3xl"
                />
                <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-[-0.04em] md:text-6xl">
                  Music. Directly from the artists.
                </h1>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/store" className="pf-brand-gradient inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium text-white transition-all duration-200 ease-out hover:scale-[1.03] active:scale-[0.98]">
                    Shop Apparel
                  </Link>
                  <Link href="/music" className="pf-btn pf-btn-secondary inline-flex items-center justify-center gap-2">
                    Listen Now
                  </Link>
                </div>
              </div>


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
                <h2 className="mt-2 text-2xl font-bold">Shop music & merch</h2>
                <Link href="/store" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--pf-orange)] hover:underline">
                  Go to Store <ArrowRight size={14} />
                </Link>
              </div>
              <div className="rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-6 md:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--pf-orange)]">Support</p>
                <h2 className="mt-2 text-2xl font-bold">Buy direct from artists</h2>
                <Link href="/music" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--pf-orange)] hover:underline">
                  Browse Music <ArrowRight size={14} />
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
