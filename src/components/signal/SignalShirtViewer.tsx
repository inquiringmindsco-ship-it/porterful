'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState, type ComponentType, type PointerEvent as ReactPointerEvent } from 'react'
import { Lock, ShieldCheck, Shirt, Sparkles, UserCheck, Zap } from 'lucide-react'

type PoseKey = 'front' | 'side' | 'back'
type ColorKey = 'black' | 'white' | 'origin'
type SizeKey = 'S' | 'M' | 'L' | 'XL' | 'XXL'

const POSES: Array<{ key: PoseKey; label: string }> = [
  { key: 'front', label: 'FRONT' },
  { key: 'side', label: 'SIDE' },
  { key: 'back', label: 'BACK' },
]

const COLORS: Record<
  ColorKey,
  { label: string; swatch: string; border: string; text: string }
> = {
  black: {
    label: 'Black',
    swatch: '#0a0a0a',
    border: 'rgba(255,255,255,0.28)',
    text: '#ffffff',
  },
  white: {
    label: 'White',
    swatch: '#f7f7f4',
    border: 'rgba(198,167,94,0.85)',
    text: '#111111',
  },
  origin: {
    label: 'Origin',
    swatch: '#f2e9db',
    border: 'rgba(198,167,94,0.65)',
    text: '#111111',
  },
}

const SHIRT_ASSETS: Record<
  ColorKey,
  Record<PoseKey, { src: string; alt: string; position: string }>
> = {
  black: {
    front: {
      src: '/signal/black-front.png',
      alt: 'LIKENESS Signal shirt in black, front view',
      position: 'center 34%',
    },
    side: {
      src: '/signal/black-side.png',
      alt: 'LIKENESS Signal shirt in black, side view',
      position: 'center 44%',
    },
    back: {
      src: '/signal/black-back.png',
      alt: 'LIKENESS Signal shirt in black, back view',
      position: 'center 36%',
    },
  },
  white: {
    front: {
      src: '/signal/white-front.png',
      alt: 'LIKENESS Signal shirt in white, front view',
      position: 'center 32%',
    },
    side: {
      src: '/signal/white-side.png',
      alt: 'LIKENESS Signal shirt in white, side view',
      position: 'center 42%',
    },
    back: {
      src: '/signal/white-back.png',
      alt: 'LIKENESS Signal shirt in white, back view',
      position: 'center 35%',
    },
  },
  origin: {
    front: {
      src: '/signal/origin-front.png',
      alt: 'LIKENESS Signal shirt in Origin, front view',
      position: 'center 34%',
    },
    side: {
      src: '/signal/origin-side.png',
      alt: 'LIKENESS Signal shirt in Origin, side view',
      position: 'center 44%',
    },
    back: {
      src: '/signal/origin-back.png',
      alt: 'LIKENESS Signal shirt in Origin, back view',
      position: 'center 35%',
    },
  },
}

const SIZE_OPTIONS: SizeKey[] = ['S', 'M', 'L', 'XL', 'XXL']

const FEATURE_CARDS = [
  {
    icon: Zap,
    title: 'NFC TAP POINT',
    copy: 'Tap to connect.',
  },
  {
    icon: ShieldCheck,
    title: 'PREMIUM QUALITY',
    copy: 'Built to last.',
  },
  {
    icon: Sparkles,
    title: 'CLEAN DESIGN',
    copy: 'Intentional. Minimal.',
  },
  {
    icon: Shirt,
    title: 'COMFORT FIT',
    copy: 'Everyday wear.',
  },
]

const TRUST_ITEMS = [
  {
    icon: Lock,
    title: 'Secure & Private',
    copy: 'Your data stays yours.',
  },
  {
    icon: Zap,
    title: 'Instant Connection',
    copy: 'Tap. Connect. Share.',
  },
  {
    icon: UserCheck,
    title: 'You Control',
    copy: "You decide what's shared.",
  },
]

const DETAIL_IMAGES = [
  {
    src: '/signal/collar.png',
    label: 'Collar / tag',
  },
  {
    src: '/signal/fabric.png',
    label: 'Fabric texture',
  },
  {
    src: '/signal/hem-tag.png',
    label: 'Hem tag',
  },
]

function FeatureCard({
  icon: Icon,
  title,
  copy,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  copy: string
}) {
  return (
    <article className="border border-[rgba(198,167,94,0.14)] bg-[rgba(17,17,17,0.94)] p-5 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[rgba(198,167,94,0.28)]">
      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(198,167,94,0.24)] bg-[rgba(198,167,94,0.08)] text-[#c6a75e]">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#c6a75e]">{title}</p>
      <p className="mt-2 text-sm text-white/70">{copy}</p>
    </article>
  )
}

function TrustItem({
  icon: Icon,
  title,
  copy,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  copy: string
}) {
  return (
    <div className="flex items-start gap-3 border border-[rgba(198,167,94,0.08)] bg-[rgba(17,17,17,0.7)] p-4">
      <div className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[rgba(198,167,94,0.2)] bg-[rgba(198,167,94,0.06)] text-[#c6a75e]">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="mt-1 text-sm text-white/60">{copy}</p>
      </div>
    </div>
  )
}

function DetailThumb({ src, label }: { src: string; label: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[rgba(198,167,94,0.12)] bg-[rgba(255,255,255,0.03)]">
      <div className="relative aspect-[16/11]">
        <Image src={src} alt={label} fill className="object-cover" sizes="(max-width: 1024px) 33vw, 10vw" />
      </div>
      <div className="border-t border-[rgba(198,167,94,0.08)] px-3 py-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/70">{label}</p>
      </div>
    </div>
  )
}

function clampPoseIndex(value: number): number {
  return Math.max(0, Math.min(2, value))
}

export function SignalShirtViewer() {
  const [pose, setPose] = useState<PoseKey>('back')
  const [color, setColor] = useState<ColorKey>('black')
  const [size, setSize] = useState<SizeKey>('M')
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [pointer, setPointer] = useState({ x: 0.52, y: 0.4 })
  const [isHovering, setIsHovering] = useState(false)
  const dragRef = useRef<{ startX: number; startPoseIndex: number } | null>(null)
  const viewerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0
    setIsTouchDevice(coarsePointer)
  }, [])

  const activeAsset = SHIRT_ASSETS[color][pose]
  const helperText = isTouchDevice ? 'Swipe to rotate' : 'Drag to rotate'
  const currentPoseLabel = POSES.find((item) => item.key === pose)?.label ?? 'BACK'

  const updatePointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    const bounds = viewerRef.current?.getBoundingClientRect()
    if (!bounds) return

    const nextX = (event.clientX - bounds.left) / bounds.width
    const nextY = (event.clientY - bounds.top) / bounds.height
    setPointer({
      x: Math.min(1, Math.max(0, nextX)),
      y: Math.min(1, Math.max(0, nextY)),
    })
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragRef.current = {
      startX: event.clientX,
      startPoseIndex: POSES.findIndex((item) => item.key === pose),
    }
    updatePointer(event)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    updatePointer(event)

    const drag = dragRef.current
    if (!drag) return

    const deltaX = event.clientX - drag.startX
    const stepCount = Math.round(deltaX / 90)
    const nextIndex = clampPoseIndex(drag.startPoseIndex + stepCount)
    setPose(POSES[nextIndex].key)
  }

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag) return

    const deltaX = event.clientX - drag.startX
    const stepCount = Math.round(deltaX / 90)
    const nextIndex = clampPoseIndex(drag.startPoseIndex + stepCount)
    setPose(POSES[nextIndex].key)
    dragRef.current = null
    updatePointer(event)
  }

  return (
    <section className="border-b border-[rgba(198,167,94,0.12)] bg-[#090909] text-white">
      <div className="pf-container py-10 md:py-14">
        <div className="mb-8 flex flex-col gap-4 border-b border-[rgba(198,167,94,0.12)] pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[clamp(2rem,5vw,3.5rem)] font-semibold tracking-[0.42em] text-white">LIKENESS</p>
            <p className="mt-3 max-w-2xl text-sm text-white/70 md:text-base">Wear your signal. Let people tap in.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(198,167,94,0.18)] bg-[rgba(198,167,94,0.08)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#c6a75e]">
            Signal - part of Likeness&trade;
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {(Object.keys(COLORS) as ColorKey[]).map((key) => {
                const option = COLORS[key]
                const isActive = color === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setColor(key)}
                    className={`flex items-center gap-2 rounded-full border px-3 py-2 transition-all duration-200 ease-out ${
                      isActive
                        ? 'scale-[1.02] border-[rgba(198,167,94,0.8)] bg-[rgba(198,167,94,0.08)] shadow-[0_0_0_6px_rgba(198,167,94,0.08)]'
                        : 'border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] hover:border-[rgba(198,167,94,0.35)]'
                    }`}
                    aria-pressed={isActive}
                    aria-label={option.label}
                  >
                    <span
                      className="h-4 w-4 rounded-full border border-white/15"
                      style={{ backgroundColor: option.swatch }}
                    />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/70">
                      {option.label}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="rounded-[32px] border border-[rgba(198,167,94,0.14)] bg-[radial-gradient(circle_at_50%_12%,rgba(198,167,94,0.14),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-4 shadow-[0_30px_90px_-55px_rgba(0,0,0,0.8)] md:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(198,167,94,0.2)] bg-[rgba(198,167,94,0.06)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.32em] text-[#c6a75e]">
                  Signal shirt
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.03)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/60">
                  {currentPoseLabel} VIEW
                </div>
              </div>

              <div
                ref={viewerRef}
                className="relative aspect-[5/4] select-none overflow-hidden rounded-[28px] border border-[rgba(198,167,94,0.18)] bg-[#0b0b0b]"
                style={{ touchAction: 'none' }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={() => {
                  dragRef.current = null
                }}
                onPointerEnter={() => setIsHovering(true)}
                onPointerLeave={(event) => {
                  if (event.buttons === 0) dragRef.current = null
                  setIsHovering(false)
                }}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowLeft') {
                    const index = clampPoseIndex(POSES.findIndex((item) => item.key === pose) - 1)
                    setPose(POSES[index].key)
                  }
                  if (event.key === 'ArrowRight') {
                    const index = clampPoseIndex(POSES.findIndex((item) => item.key === pose) + 1)
                    setPose(POSES[index].key)
                  }
                }}
                role="group"
                aria-label="Interactive LIKENESS shirt viewer"
                tabIndex={0}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(198,167,94,0.12),transparent_38%),radial-gradient(circle_at_50%_84%,rgba(0,0,0,0.34),transparent_42%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent_24%,transparent_76%,rgba(0,0,0,0.46))]" />
                <div
                  className="absolute inset-0 transition-transform duration-200 ease-out"
                  style={{
                    transform: `translate3d(${(pointer.x - 0.5) * 16}px, ${(pointer.y - 0.5) * 12}px, 0) scale(${
                      isHovering ? 1.012 : 1
                    })`,
                  }}
                >
                  <Image
                    key={activeAsset.src}
                    src={activeAsset.src}
                    alt={activeAsset.alt}
                    fill
                    priority={pose === 'back'}
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    className="object-cover transition-transform duration-200 ease-out"
                    style={{ objectPosition: activeAsset.position }}
                    draggable={false}
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,transparent,rgba(9,9,9,0.88))]" />

                <div className="absolute left-4 top-4 rounded-full border border-[rgba(198,167,94,0.18)] bg-[rgba(9,9,9,0.72)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c6a75e] backdrop-blur">
                  LIKENESS
                </div>

                {pose === 'front' && (
                  <>
                    <div
                      className="absolute h-4 w-4 rounded-full border border-[#c6a75e] bg-[#c6a75e]/28 shadow-[0_0_0_8px_rgba(198,167,94,0.12)]"
                      style={{ left: '57%', top: '34%' }}
                    />
                    <div
                      className="absolute h-px bg-[#c6a75e]/60"
                      style={{ left: 'calc(57% + 14px)', top: 'calc(34% + 7px)', width: '92px' }}
                    />
                    <div
                      className="absolute"
                      style={{ left: 'calc(57% + 114px)', top: 'calc(34% - 5px)' }}
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#c6a75e]">
                        Tap point
                      </p>
                      <p className="mt-1 max-w-[180px] text-xs leading-5 text-white/70">
                        Tap here to connect to the registry
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between gap-4 text-xs text-white/60">
                <span>{helperText}</span>
                <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] p-1">
                  {POSES.map((item, index) => {
                    const isActive = item.key === pose
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setPose(item.key)}
                        className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] transition-all duration-200 ease-out ${
                          isActive
                            ? 'scale-[1.02] border border-[rgba(198,167,94,0.28)] bg-[rgba(198,167,94,0.1)] text-[#c6a75e] shadow-[0_0_0_1px_rgba(198,167,94,0.16)]'
                            : 'border border-transparent text-white/60 hover:text-white'
                        }`}
                        aria-pressed={isActive}
                        aria-label={item.label}
                      >
                        {item.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          <aside className="rounded-[32px] border border-[rgba(198,167,94,0.14)] bg-[rgba(17,17,17,0.96)] p-6 shadow-[0_26px_70px_-48px_rgba(0,0,0,0.9)] md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#c6a75e]">REAL. SIMPLE. POWERFUL.</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-[2.5rem]">The Signal Shirt</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/80">
              The Signal Shirt carries a tap point that connects people to your likeness
              instantly.
            </p>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/60">
              Each shirt links directly to your Likeness registry record.
            </p>

            <div className="mt-6 border-t border-[rgba(198,167,94,0.1)] pt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#c6a75e]">Available in</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(Object.keys(COLORS) as ColorKey[]).map((key) => {
                  const option = COLORS[key]
                  const isActive = color === key
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setColor(key)}
                      className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-200 ease-out ${
                        isActive
                          ? 'border-[rgba(198,167,94,0.55)] bg-[rgba(198,167,94,0.12)] text-white shadow-[0_0_0_1px_rgba(198,167,94,0.16)]'
                          : 'border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.02)] text-white/70 hover:border-[rgba(198,167,94,0.28)] hover:text-white'
                      }`}
                      aria-pressed={isActive}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#c6a75e]">Size</p>
              <div className="mt-3 grid grid-cols-5 gap-2">
                {SIZE_OPTIONS.map((value) => {
                  const isActive = size === value
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setSize(value)}
                      className={`rounded-xl border px-0 py-2.5 text-sm font-medium transition-all duration-200 ease-out ${
                        isActive
                          ? 'border-[rgba(198,167,94,0.55)] bg-[rgba(198,167,94,0.12)] text-white'
                          : 'border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.02)] text-white/70 hover:border-[rgba(198,167,94,0.28)] hover:text-white'
                      }`}
                      aria-pressed={isActive}
                    >
                      {value}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-6 rounded-[24px] border border-[rgba(198,167,94,0.1)] bg-[rgba(255,255,255,0.02)] p-4">
              <div className="grid gap-3 sm:grid-cols-3">
                {DETAIL_IMAGES.map((item) => (
                  <DetailThumb key={item.label} src={item.src} label={item.label} />
                ))}
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/product/signal-shirt"
                className="pf-btn pf-btn-primary w-full rounded-xl px-5 py-4 text-base font-semibold"
              >
                Get Your Signal &rarr;
              </Link>
              <p className="mt-3 text-center text-sm text-white/70">Ships worldwide. Orders fulfilled in order received.</p>
              <p className="mt-2 text-center text-sm text-white/70">Each Signal links to your Likeness registry.</p>
            </div>
          </aside>
        </div>

        <div className="mt-6 grid gap-px sm:grid-cols-2 xl:grid-cols-4">
          {FEATURE_CARDS.map((card) => (
            <FeatureCard
              key={card.title}
              icon={card.icon}
              title={card.title}
              copy={card.copy}
            />
          ))}
        </div>

        <div className="mt-4 grid gap-px md:grid-cols-3">
          {TRUST_ITEMS.map((item) => (
            <TrustItem
              key={item.title}
              icon={item.icon}
              title={item.title}
              copy={item.copy}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
