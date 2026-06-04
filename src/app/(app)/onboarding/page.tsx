'use client'

import Link from 'next/link'
import { useSupabase } from '@/app/providers'
import {
  ArrowRight,
  BadgeCheck,
  ChartColumn,
  Headphones,
  LayoutDashboard,
  Package,
  Play,
  Sparkles,
  Store,
  Upload,
  type LucideIcon,
} from 'lucide-react'

type ViewerRole = 'artist' | 'founder' | 'admin' | 'supporter' | 'listener' | 'business' | 'brand'

const ctaStyles =
  'inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all'

function normalizeRole(value: unknown): ViewerRole | null {
  if (typeof value !== 'string') return null
  const role = value.toLowerCase()
  if (role === 'artist' || role === 'founder' || role === 'admin' || role === 'supporter' || role === 'listener' || role === 'business' || role === 'brand') {
    return role
  }
  return null
}

function roleLabel(role: ViewerRole | null) {
  switch (role) {
    case 'artist':
      return 'Artist'
    case 'founder':
      return 'Founder'
    case 'admin':
      return 'Admin'
    case 'business':
      return 'Business'
    case 'brand':
      return 'Brand'
    default:
      return 'Listener'
  }
}

function roleNextStep(role: ViewerRole | null, authenticated: boolean) {
  if (!authenticated) {
    return {
      title: 'Start here',
      description: 'Sign in to continue where you left off, or create a fresh account to begin.',
      actionLabel: 'Sign in',
      actionHref: '/login?next=/onboarding',
      secondaryLabel: 'Create account',
      secondaryHref: '/signup?next=/onboarding',
    }
  }

  if (role === 'artist') {
    return {
      title: 'Your next step',
      description: 'Upload creative assets, keep building approved products, and track what is ready for fulfillment.',
      actionLabel: 'Go to artist dashboard',
      actionHref: '/dashboard/artist',
      secondaryLabel: 'Review assets',
      secondaryHref: '/dashboard/artist/assets',
    }
  }

  if (role === 'founder' || role === 'admin') {
    return {
      title: 'Your next step',
      description: 'Review assets, approve products, and manage the operational queue from one place.',
      actionLabel: 'Open founder dashboard',
      actionHref: '/dashboard/founder',
      secondaryLabel: 'Review assets',
      secondaryHref: '/dashboard/founder/assets',
    }
  }

  return {
    title: 'Your next step',
    description: 'Explore the live store, discover the music, and see how Porterful connects content to commerce.',
    actionLabel: 'Browse live store',
    actionHref: '/store',
    secondaryLabel: 'Explore music',
    secondaryHref: '/music',
  }
}

function FeatureCard({
  icon: Icon,
  title,
  text,
}: {
  icon: LucideIcon
  title: string
  text: string
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white">
        <Icon size={22} />
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/70">{text}</p>
    </div>
  )
}

export default function OnboardingPage() {
  const { user, loading } = useSupabase()
  const role = normalizeRole((user?.user_metadata as { role?: unknown } | undefined)?.role)
  const signedIn = !!user
  const next = roleNextStep(role, signedIn)
  const welcomeLabel = signedIn ? `${roleLabel(role)} mode` : 'New here? Start with the essentials'

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(252,115,45,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.08),_transparent_26%),linear-gradient(180deg,_#0d0f14_0%,_#0a0b10_60%,_#09090d_100%)] text-white">
      <div className="relative isolate">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-[var(--pf-orange)]/25 blur-3xl" />
          <div className="absolute right-[-6rem] top-24 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-fuchsia-500/10 blur-3xl" />
        </div>

        <section className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-16 pt-8 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-center justify-between gap-4 rounded-full border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--pf-orange)]/20 text-[var(--pf-orange)]">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Porterful</p>
                <p className="text-xs text-white/60">Creator commerce, measurement, and fulfillment in one place</p>
              </div>
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <Link href="/store" className={`${ctaStyles} border border-white/10 bg-white/5 text-white hover:bg-white/10`}>
                <Store size={16} />
                Store
              </Link>
              <Link href="/apply" className={`${ctaStyles} border border-white/10 bg-white/5 text-white hover:bg-white/10`}>
                <BadgeCheck size={16} />
                Apply as Artist
              </Link>
              <Link href={signedIn ? (role === 'artist' ? '/dashboard/artist' : role === 'founder' || role === 'admin' ? '/dashboard/founder' : '/dashboard') : '/login?next=/onboarding'} className={`${ctaStyles} bg-[var(--pf-orange)] text-white hover:bg-[var(--pf-orange-dark)]`}>
                {signedIn ? 'Continue' : 'Sign in'}
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="grid flex-1 items-start gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-8">
              <div className="rounded-[2rem] border border-white/10 bg-white/6 p-8 shadow-[0_30px_120px_rgba(0,0,0,0.28)] backdrop-blur-md sm:p-10">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--pf-orange)]/30 bg-[var(--pf-orange)]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--pf-orange)]">
                  <Play size={14} />
                  {welcomeLabel}
                </div>

                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Your creator home for music, products, and momentum.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
                  Porterful brings your songs, approved assets, live products, and fulfillment into one place so you can move from idea to action without losing the thread.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  {signedIn ? (
                    <Link
                      href={next.actionHref}
                      className={`${ctaStyles} bg-[var(--pf-orange)] px-6 py-3 text-white shadow-lg shadow-[var(--pf-orange)]/20 hover:-translate-y-0.5 hover:bg-[var(--pf-orange-dark)]`}
                    >
                      {next.actionLabel}
                      <ArrowRight size={16} />
                    </Link>
                  ) : (
                    <Link
                      href="/signup?next=/onboarding"
                      className={`${ctaStyles} bg-[var(--pf-orange)] px-6 py-3 text-white shadow-lg shadow-[var(--pf-orange)]/20 hover:-translate-y-0.5 hover:bg-[var(--pf-orange-dark)]`}
                    >
                      Create account
                      <ArrowRight size={16} />
                    </Link>
                  )}

                  <Link
                    href={signedIn ? next.secondaryHref : '/apply'}
                    className={`${ctaStyles} border border-white/10 bg-white/5 px-6 py-3 text-white hover:bg-white/10`}
                  >
                    {signedIn ? next.secondaryLabel : 'Apply as Artist'}
                  </Link>

                  <Link
                    href="/store"
                    className={`${ctaStyles} border border-white/10 bg-white/5 px-6 py-3 text-white hover:bg-white/10`}
                  >
                    Browse live store
                  </Link>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {[
                    { label: 'Live products', value: 'Controlled drop' },
                    { label: 'Measurement', value: 'Play → order → ship' },
                    { label: 'Fulfillment', value: 'IMG ready' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-white/45">{item.label}</p>
                      <p className="mt-2 text-sm font-semibold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <FeatureCard
                  icon={Headphones}
                  title="Listen"
                  text="Explore the music that powers the catalog and keeps creator activity moving."
                />
                <FeatureCard
                  icon={Upload}
                  title="Submit assets"
                  text="Send in artwork, covers, and designs for review before they become products."
                />
                <FeatureCard
                  icon={Package}
                  title="Sell approved products"
                  text="Only approved assets and controlled products move into live commerce."
                />
                <FeatureCard
                  icon={ChartColumn}
                  title="Track momentum"
                  text="See activity, orders, and fulfillment progress from the dashboard."
                />
              </div>
            </div>

            <aside className="space-y-5">
              <div className="rounded-[2rem] border border-white/10 bg-[rgba(10,10,16,0.72)] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.25)] backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.24em] text-white/45">Your next step</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">{next.title}</h2>
                <p className="mt-3 text-sm leading-6 text-white/70">{next.description}</p>

                <div className="mt-6 space-y-3">
                  <Link
                    href={signedIn ? next.actionHref : '/login?next=/onboarding'}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4 transition hover:bg-white/10"
                  >
                    <span className="font-medium text-white">{signedIn ? next.actionLabel : 'Sign in'}</span>
                    <ArrowRight size={16} className="text-[var(--pf-orange)]" />
                  </Link>

                  <Link
                    href={signedIn ? next.secondaryHref : '/signup?next=/onboarding'}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4 transition hover:bg-white/10"
                  >
                    <span className="font-medium text-white">{signedIn ? next.secondaryLabel : 'Create account'}</span>
                    <ArrowRight size={16} className="text-[var(--pf-orange)]" />
                  </Link>
                </div>
              </div>

              <div className="rounded-[2rem] border border-[var(--pf-border)] bg-[var(--pf-surface)] p-6 text-[var(--pf-text)] shadow-[0_30px_120px_rgba(0,0,0,0.22)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--pf-orange)]/15 text-[var(--pf-orange)]">
                    <LayoutDashboard size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--pf-text-muted)]">What Porterful is</p>
                    <p className="font-semibold text-[var(--pf-text)]">A home base for creator commerce</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-[var(--pf-text-secondary)]">
                  Music, approved creative assets, live products, analytics, and fulfillment all connect here so you can always see what is moving next.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-[var(--pf-bg)] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--pf-text-muted)]">Live drop</p>
                    <p className="mt-2 text-sm font-semibold text-[var(--pf-text)]">Coming Home Tee</p>
                  </div>
                  <div className="rounded-2xl bg-[var(--pf-bg)] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--pf-text-muted)]">Workflow</p>
                    <p className="mt-2 text-sm font-semibold text-[var(--pf-text)]">Assets → SKU → Fulfillment</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.24em] text-white/45">How it works</p>
                <div className="mt-4 space-y-4">
                  {[
                    {
                      step: '1',
                      title: 'Create or sign in',
                      text: 'Get your account ready so the platform can remember where you are.',
                    },
                    {
                      step: '2',
                      title: 'Pick your path',
                      text: 'Artists, supporters, businesses, and founders all land in the right place.',
                    },
                    {
                      step: '3',
                      title: 'Move forward',
                      text: 'Upload, approve, sell, track, and fulfill without losing context.',
                    },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--pf-orange)]/15 font-semibold text-[var(--pf-orange)]">
                        {item.step}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{item.title}</p>
                        <p className="mt-1 text-sm leading-6 text-white/65">{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.24em] text-white/45">Built for momentum</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  {[
                    'Fast discovery',
                    'Clear approval flow',
                    'Controlled live products',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--pf-orange)]/15 text-[var(--pf-orange)]">
                        <BadgeCheck size={16} />
                      </div>
                      <span className="text-sm font-medium text-white">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>

        {!loading && signedIn && (
          <div className="fixed bottom-4 left-1/2 z-20 w-[min(92vw,720px)] -translate-x-1/2 rounded-full border border-white/10 bg-black/70 px-4 py-3 text-sm text-white shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <span className="truncate">
                Welcome back. {role === 'artist' ? 'Your artist dashboard is ready.' : role === 'founder' || role === 'admin' ? 'Your founder dashboard is ready.' : 'Your store and music hub are ready.'}
              </span>
              <Link href={next.actionHref} className="inline-flex items-center gap-2 font-semibold text-[var(--pf-orange)]">
                Continue
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
