'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Pause, Play, Headphones, Heart } from 'lucide-react'
import { Footer } from '@/components/Footer'
import { useAudio, type Track } from '@/lib/audio-context'
import { TRACKS } from '@/lib/data'
import { ARTISTS } from '@/lib/artists'

// Only artists with playable tracks
const PUBLIC_ARTISTS = ARTISTS.filter((a) => a.trackCount && a.trackCount > 0)

const featuredArtist = PUBLIC_ARTISTS.find((artist) => artist.slug === 'atm-trap') ?? PUBLIC_ARTISTS[0]

const featuredTracks = TRACKS
  .filter((track) => track.artist === featuredArtist.name)
  .slice(0, 3) as Track[]

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
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-[var(--pf-border)] bg-gradient-to-b from-[var(--pf-accent)]/10 via-[var(--pf-bg)] to-[var(--pf-bg)]">
          <div className="pf-container py-12 md:py-20">
            <div className="max-w-3xl">
              <p className="hidden sm:block text-sm font-semibold uppercase tracking-[0.2em] text-[var(--pf-accent)] mb-4">
                Porterful
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-[-0.03em]">
                Music, merch, and support — directly from the artists.
              </h1>
              <p className="mt-5 text-lg text-[var(--pf-text-secondary)] max-w-xl">
                Stream tracks, buy albums, shop artist apparel. Built for artist-first sales, transparent earnings, and direct fan support.
              </p>
              
              <div className="mt-8 flex flex-wrap gap-3">
                <Link 
                  href="/music" 
                  className="pf-btn pf-btn-primary inline-flex items-center justify-center gap-2 px-6 py-3 text-base"
                >
                  <Headphones size={18} />
                  Start Listening
                </Link>
                <Link 
                  href="/login" 
                  className="pf-btn pf-btn-secondary inline-flex items-center justify-center gap-2 px-6 py-3 text-base"
                >
                  Create your account
                </Link>
              </div>
              
              <div className="mt-6 flex items-center gap-6 text-sm text-[var(--pf-text-muted)]">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  {ARTISTS.length}+ artists
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  {TRACKS.length}+ tracks
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Listening */}
        <section className="pf-reveal-group border-b border-[var(--pf-border)]">
          <div className="pf-container py-10 md:py-14">
            <div className="pf-reveal-child mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--pf-accent)]">Featured</p>
                <h2 className="mt-2 text-2xl md:text-3xl font-bold">Now playing</h2>
              </div>
              <Link href="/music" className="text-sm font-medium text-[var(--pf-accent)] hover:underline">
                Browse all music
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                    className="pf-reveal-child group flex items-center gap-4 rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-3 text-left transition hover:border-[var(--pf-accent)]"
                    style={{ transitionDelay: `${(index + 1) * 60}ms` }}
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                      <Image 
                        src={track.image ?? ''} 
                        alt={track.title} 
                        fill 
                        sizes="64px" 
                        className="object-cover transition duration-300 group-hover:scale-105" 
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                        {mounted && isActive ? <Pause size={20} className="text-white" /> : <Play size={20} className="text-white" />}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold truncate">{track.title}</h3>
                      <p className="text-sm text-[var(--pf-text-secondary)] truncate">{track.artist}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        {/* Three Pillars */}
        <section className="pf-reveal-group border-b border-[var(--pf-border)]">
          <div className="pf-container py-10 md:py-14">
            <div className="pf-reveal-child grid gap-4 md:grid-cols-3">
              <Link href="/music" className="group rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-6 transition hover:border-[var(--pf-accent)]">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--pf-accent)]/10 text-[var(--pf-accent)]">
                  <Headphones size={20} />
                </div>
                <h3 className="text-lg font-semibold">Listen</h3>
                <p className="mt-2 text-sm text-[var(--pf-text-secondary)]">
                  Stream music directly from artists. No middlemen.
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--pf-accent)] group-hover:underline">
                  Browse tracks <ArrowRight size={14} />
                </span>
              </Link>
              
              {/* Shop card hidden — store has no real products yet
              <Link href="/store" className="group rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-6 transition hover:border-[var(--pf-accent)]">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--pf-accent)]/10 text-[var(--pf-accent)]">
                  <ShoppingBag size={20} />
                </div>
                <h3 className="text-lg font-semibold">Shop</h3>
                <p className="mt-2 text-sm text-[var(--pf-text-secondary)]">
                  Albums, merch, and apparel from your favorite artists.
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--pf-accent)] group-hover:underline">
                  Visit store <ArrowRight size={14} />
                </span>
              </Link>
              */}
              
              <Link href="/artists" className="group rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-6 transition hover:border-[var(--pf-accent)]">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--pf-accent)]/10 text-[var(--pf-accent)]">
                  <Heart size={20} />
                </div>
                <h3 className="text-lg font-semibold">Support</h3>
                <p className="mt-2 text-sm text-[var(--pf-text-secondary)]">
                  Artist-first earnings. Direct support, no middlemen.
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--pf-accent)] group-hover:underline">
                  Meet artists <ArrowRight size={14} />
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* Artist Spotlight - Secondary */}
        <section className="pf-reveal-group">
          <div className="pf-container py-10 md:py-14">
            <div className="pf-reveal-child mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--pf-accent)]">Artists</p>
                <h2 className="mt-2 text-2xl md:text-3xl font-bold">On Porterful</h2>
              </div>
              <Link href="/artists" className="text-sm font-medium text-[var(--pf-accent)] hover:underline">
                View all
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {PUBLIC_ARTISTS.slice(0, 4).map((artist, index) => (
                <Link
                  key={artist.id}
                  href={`/artist/${artist.slug}`}
                  className="pf-reveal-child group flex items-center gap-4 rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-3 transition hover:border-[var(--pf-accent)]"
                  style={{ transitionDelay: `${(index + 1) * 60}ms` }}
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full">
                    <Image
                      src={artist.image}
                      alt={artist.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold truncate">{artist.name}</h3>
                    <p className="text-sm text-[var(--pf-text-secondary)] truncate">{artist.genre}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
