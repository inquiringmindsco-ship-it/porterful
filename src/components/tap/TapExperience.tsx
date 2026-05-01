'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, BadgeCheck, BookOpen, ShieldCheck, ShoppingBag, Sparkles } from 'lucide-react'
import { type TapQueryParams } from '@/lib/tap'

type TapEventType = 'register' | 'store' | 'learn'

export interface TapAction {
  label: string
  href: string
  eventType: TapEventType
}

interface TapCard {
  title: string
  body: string
}

interface TapExperienceProps {
  mode: 'generic' | 'personal'
  pagePath: string
  params: TapQueryParams
  actions: TapAction[]
  trustLines: string[]
  learnCards: TapCard[]
  disclaimer: string
  displayName?: string | null
  heroImageUrl?: string | null
  productLabel?: string | null
}

function trackTapEvent(
  payload: Record<string, string | null | undefined>,
) {
  if (typeof navigator === 'undefined') return

  const body = JSON.stringify(payload)

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: 'application/json' })
    const sent = navigator.sendBeacon('/api/tap', blob)
    if (sent) return
  }

  void fetch('/api/tap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {})
}

function getActionIcon(action: TapAction) {
  if (action.eventType === 'learn') {
    return BookOpen
  }

  if (action.eventType === 'register') {
    return BadgeCheck
  }

  return ShoppingBag
}

function TapActionButton({
  action,
  pagePath,
  params,
  variant,
}: {
  action: TapAction
  pagePath: string
  params: TapQueryParams
  variant: 'primary' | 'secondary' | 'ghost'
}) {
  const Icon = getActionIcon(action)
  const isAnchor = action.href.startsWith('#')
  const isInternal = action.href.startsWith('/') || isAnchor

  const sharedClassName =
    'inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl px-5 py-4 text-left font-semibold transition-transform duration-200 ease-out active:scale-[0.99]'

  const toneClassName =
    variant === 'primary'
      ? 'bg-[var(--pf-orange)] text-[#101010] shadow-[0_20px_40px_-24px_rgba(249,115,22,0.65)] hover:bg-[var(--pf-orange-light)]'
      : variant === 'secondary'
        ? 'border border-white/10 bg-white/5 text-white hover:border-[rgba(198,168,90,0.4)] hover:bg-white/8'
        : 'border border-white/10 bg-transparent text-white/80 hover:border-white/20 hover:bg-white/5'

  const handleClick = () => {
    trackTapEvent({
      event_type: action.eventType,
      path: pagePath,
      ref: params.ref,
      product: params.product,
      campaign: params.campaign,
      destination_href: action.href,
    })
  }

  const iconToneClassName =
    variant === 'primary' ? 'text-[#101010]' : 'text-[var(--pf-orange)]'

  const content = (
    <>
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${variant === 'primary' ? 'bg-white/20' : 'bg-[var(--pf-orange)]/10'}`}>
        <Icon size={18} className={iconToneClassName} />
      </span>
      <span className="flex-1">{action.label}</span>
      <ArrowRight size={16} className={variant === 'primary' ? 'text-[#101010]/70' : 'text-[var(--pf-text-muted)]'} />
    </>
  )

  if (isAnchor) {
    return (
      <a href={action.href} onClick={handleClick} className={`${sharedClassName} ${toneClassName}`}>
        {content}
      </a>
    )
  }

  if (isInternal) {
    return (
      <Link href={action.href} onClick={handleClick} className={`${sharedClassName} ${toneClassName}`}>
        {content}
      </Link>
    )
  }

  return (
    <a
      href={action.href}
      onClick={handleClick}
      className={`${sharedClassName} ${toneClassName}`}
      rel="noopener noreferrer"
    >
      {content}
    </a>
  )
}

export function TapExperience({
  mode,
  pagePath,
  params,
  actions,
  trustLines,
  learnCards,
  disclaimer,
  displayName,
  heroImageUrl,
  productLabel,
}: TapExperienceProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070707] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(198,168,90,0.18),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(249,115,22,0.16),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_35%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent)] opacity-50" />

      <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pb-16 lg:pt-10">
        <header className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-white/70 backdrop-blur">
            <Sparkles size={12} className="text-[var(--pf-orange)]" />
            Tap Gateway
          </div>
          <div className="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs font-medium text-white/60 backdrop-blur">
            {mode === 'personal' ? 'Personal tap' : 'Generic tap'}
          </div>
        </header>

        {mode === 'generic' ? (
          <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
            <div className="flex flex-col justify-between rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur sm:p-8 lg:p-10">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(198,168,90,0.24)] bg-[rgba(198,168,90,0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[#e5d6a8]">
                  <ShieldCheck size={12} />
                  Public entry
                </div>
                <div className="space-y-4">
                  <h1 className="max-w-xl text-4xl font-black tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                    Tap into a verified identity
                  </h1>
                  <p className="max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
                    Document your likeness. Explore the system. Choose your next step.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {trustLines.map((line, index) => (
                    <div
                      key={line}
                      className="rounded-2xl border border-white/10 bg-black/25 p-4"
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(198,168,90,0.12)] text-[#e8d3a4]">
                        <ShieldCheck size={14} />
                      </div>
                      <p className="text-sm font-medium leading-relaxed text-white/80">{line}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-[32px] border border-white/10 bg-[#0b0b0b]/95 p-6 shadow-2xl shadow-black/40 backdrop-blur sm:p-8">
              <div className="rounded-[28px] border border-white/10 bg-black/40 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-[#d3b56b]">What happens</p>
                <div className="mt-5 space-y-4">
                  {learnCards.map((card, index) => (
                    <div
                      key={card.title}
                      className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(198,168,90,0.12)] text-[#d3b56b]">
                        <span className="text-sm font-bold">{String(index + 1).padStart(2, '0')}</span>
                      </div>
                      <div>
                        <h2 className="font-semibold text-white">{card.title}</h2>
                        <p className="mt-1 text-sm leading-relaxed text-white/65">{card.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {actions.map((action, index) => (
                  <TapActionButton
                    key={action.label}
                    action={action}
                    pagePath={pagePath}
                    params={params}
                    variant={index === 0 ? 'primary' : index === 2 ? 'ghost' : 'secondary'}
                  />
                ))}
              </div>

              <p className="text-xs leading-relaxed text-white/45">
                Attribution stays attached through registration, store, and learn flows.
              </p>
            </div>
          </section>
        ) : (
          <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
            <div className="overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-2xl shadow-black/30">
              <div className="relative aspect-[4/5] min-h-[20rem] w-full lg:aspect-[5/6]">
                {heroImageUrl ? (
                  <Image
                    src={heroImageUrl}
                    alt={displayName || 'Tap profile hero image'}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 52vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-end bg-[linear-gradient(180deg,rgba(198,168,90,0.12),rgba(255,255,255,0.02)),radial-gradient(circle_at_top,rgba(198,168,90,0.3),transparent_40%),linear-gradient(135deg,#141414,#090909)] p-6">
                    <div className="max-w-md">
                      <p className="text-xs uppercase tracking-[0.3em] text-[#d3b56b]">Public likeness record</p>
                      <div className="mt-4 text-6xl font-black tracking-[-0.06em] text-white/20">
                        {displayName?.charAt(0)?.toUpperCase() || 'L'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur sm:p-8 lg:p-10">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(198,168,90,0.24)] bg-[rgba(198,168,90,0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[#e5d6a8]">
                  <BadgeCheck size={12} />
                  Public profile
                </div>
                <div className="space-y-3">
                  <h1 className="max-w-xl text-4xl font-black tracking-[-0.04em] sm:text-5xl">
                    {displayName}
                  </h1>
                  <p className="text-sm uppercase tracking-[0.28em] text-white/45">
                    This is my verified likeness.
                  </p>
                  {productLabel && (
                    <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(198,168,90,0.2)] bg-black/30 px-3 py-1.5 text-sm text-[#ead7a8]">
                      <ShoppingBag size={14} />
                      Featured product: {productLabel}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {actions.map((action, index) => (
                    <TapActionButton
                      key={action.label}
                      action={action}
                      pagePath={pagePath}
                      params={params}
                      variant={index === 0 ? 'primary' : index === 2 ? 'ghost' : 'secondary'}
                    />
                  ))}
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {trustLines.map((line, index) => (
                    <div
                      key={line}
                      className="rounded-2xl border border-white/10 bg-black/25 p-4"
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(198,168,90,0.12)] text-[#e8d3a4]">
                        <ShieldCheck size={14} />
                      </div>
                      <p className="text-sm font-medium leading-relaxed text-white/80">{line}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        <section id="learn" className="mt-8 grid gap-4 md:grid-cols-3">
          {learnCards.map((card, index) => (
            <article
              key={card.title}
              className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur animate-fade-in"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <p className="text-xs uppercase tracking-[0.28em] text-[#d3b56b]">Learn</p>
              <h3 className="mt-3 text-lg font-semibold text-white">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/65">{card.body}</p>
            </article>
          ))}
        </section>

        <footer className="mt-8 border-t border-white/10 pt-5 text-xs leading-relaxed text-white/45 whitespace-pre-line">
          {disclaimer}
        </footer>
      </main>
    </div>
  )
}
