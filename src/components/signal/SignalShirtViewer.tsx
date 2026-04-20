'use client'

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'

type PoseIndex = 0 | 1 | 2

type ColorOption = {
  label: string
  body: string
  shade: string
  highlight: string
  text: string
  fabric: string
}

type FeatureKind = 'tap' | 'quality' | 'clean' | 'comfort'

const COLORS: ColorOption[] = [
  {
    label: 'Black',
    body: '#111111',
    shade: '#1b1b1b',
    highlight: '#3a3a3a',
    text: '#f7f5ef',
    fabric: 'rgba(255,255,255,0.05)',
  },
  {
    label: 'White',
    body: '#f7f7f4',
    shade: '#e3e3dc',
    highlight: '#ffffff',
    text: '#111111',
    fabric: 'rgba(17,17,17,0.05)',
  },
  {
    label: 'Cream',
    body: '#f4ecdf',
    shade: '#dfd0b5',
    highlight: '#fff8ea',
    text: '#111111',
    fabric: 'rgba(102,83,42,0.06)',
  },
]

const POSE_OPTIONS: Array<{ label: string; description: string }> = [
  { label: 'FRONT', description: 'Primary view' },
  { label: 'SIDE', description: 'Natural depth' },
  { label: 'BACK', description: 'Back print' },
]

const FEATURE_TILES: Array<{ kind: FeatureKind; title: string; copy: string }> = [
  {
    kind: 'tap',
    title: 'NFC TAP POINT',
    copy: 'Tap to connect',
  },
  {
    kind: 'quality',
    title: 'PREMIUM QUALITY',
    copy: 'Built to last',
  },
  {
    kind: 'clean',
    title: 'CLEAN DESIGN',
    copy: 'Intentional. Minimal.',
  },
  {
    kind: 'comfort',
    title: 'COMFORT FIT',
    copy: 'Everyday wear',
  },
]

const STEPS = ['Wear it', 'Someone taps', 'They enter the registry', 'They create their likeness record', 'The signal lives on the shirt']

function clampIndex(value: number): PoseIndex {
  return Math.max(0, Math.min(2, value)) as PoseIndex
}

function FeatureTile({
  kind,
  title,
  copy,
}: {
  kind: FeatureKind
  title: string
  copy: string
}) {
  return (
    <article className="rounded-[22px] border border-[var(--pf-border)] bg-[var(--pf-bg)] p-4 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[var(--pf-orange)]">
      <div className="relative h-24 overflow-hidden rounded-xl border border-[rgba(198,167,94,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.4),rgba(255,255,255,0.05))]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(198,167,94,0.12),transparent_60%)]" />
        {kind === 'tap' && (
          <>
            <div className="absolute inset-y-0 left-8 w-px bg-gradient-to-b from-transparent via-[rgba(198,167,94,0.45)] to-transparent" />
            <div className="absolute left-6 top-7 h-6 w-6 rounded-full border border-[rgba(198,167,94,0.5)] bg-[rgba(198,167,94,0.08)]" />
            <div className="absolute left-6 top-7 h-6 w-6 rounded-full border border-[rgba(198,167,94,0.2)] bg-transparent" />
            <div className="absolute right-5 top-5 h-12 w-12 rounded-full border border-[rgba(198,167,94,0.14)] bg-[rgba(198,167,94,0.04)]" />
          </>
        )}
        {kind === 'quality' && (
          <>
            <div className="absolute left-5 top-6 h-14 w-14 rounded-full border border-[rgba(198,167,94,0.12)]" />
            <div className="absolute left-8 top-8 h-8 w-px rotate-12 bg-[rgba(17,17,17,0.18)]" />
            <div className="absolute left-[72px] top-6 h-12 w-px bg-[rgba(198,167,94,0.18)]" />
            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[rgba(17,17,17,0.08)] to-transparent" />
          </>
        )}
        {kind === 'clean' && (
          <>
            <div className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[rgba(198,167,94,0.22)] bg-[rgba(198,167,94,0.05)]" />
            <div className="absolute left-1/2 top-1/2 h-20 w-[1px] -translate-x-1/2 -translate-y-1/2 bg-[rgba(17,17,17,0.12)]" />
            <div className="absolute inset-x-10 bottom-7 h-px bg-[rgba(198,167,94,0.22)]" />
          </>
        )}
        {kind === 'comfort' && (
          <>
            <div className="absolute left-1/2 top-5 h-16 w-24 -translate-x-1/2 rounded-[60px_60px_28px_28px] border border-[rgba(198,167,94,0.16)] bg-[rgba(198,167,94,0.04)]" />
            <div className="absolute left-1/2 top-7 h-10 w-16 -translate-x-1/2 rounded-[50px_50px_24px_24px] border border-[rgba(17,17,17,0.08)]" />
            <div className="absolute inset-x-8 bottom-6 h-4 rounded-full bg-[rgba(17,17,17,0.06)] blur-[10px]" />
          </>
        )}
      </div>
      <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.32em] text-[var(--pf-orange)]">{title}</p>
      <p className="mt-2 text-sm text-[var(--pf-text-secondary)]">{copy}</p>
    </article>
  )
}

function ShirtStage({
  pose,
  color,
  tiltX,
  tiltY,
}: {
  pose: PoseIndex
  color: ColorOption
  tiltX: number
  tiltY: number
}) {
  const isFront = pose === 0
  const isSide = pose === 1
  const isBack = pose === 2

  const outerMotion = `translate3d(${tiltX}px, ${tiltY}px, 0) rotateX(${tiltY * -1.35}deg) rotateY(${tiltX * 1.35}deg)`
  const shirtTransform = isSide ? 'translate(18 8) scale(0.94 0.99)' : isBack ? 'translate(2 7) scale(0.985)' : 'translate(0 0) scale(1)'
  const silhouette =
    'M180 112C203 95 228 87 270 87C312 87 337 95 360 112L409 142L385 198L354 181V488C354 520 330 545 270 545C210 545 186 520 186 488V181L155 198L131 142Z'
  const tapPoint = isFront
    ? { x: 333, y: 276 }
    : isSide
      ? { x: 318, y: 279 }
      : { x: 302, y: 279 }

  const tapLabel = isFront
    ? { x: 120, y: 204, line: 'M166 214C203 214 230 225 256 244' }
    : isSide
      ? { x: 120, y: 204, line: 'M162 214C199 214 226 226 250 244' }
      : { x: 120, y: 204, line: 'M156 214C194 214 220 227 244 244' }

  return (
    <svg viewBox="0 0 540 680" className="h-full w-full">
      <defs>
        <linearGradient id="signal-shirt-body" x1="180" y1="92" x2="390" y2="560">
          <stop offset="0%" stopColor={color.highlight} stopOpacity="0.98" />
          <stop offset="20%" stopColor={color.body} stopOpacity="1" />
          <stop offset="60%" stopColor={color.body} stopOpacity="0.98" />
          <stop offset="100%" stopColor={color.shade} stopOpacity="1" />
        </linearGradient>
        <radialGradient id="signal-shirt-sheen" cx="32%" cy="18%" r="75%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.42" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0.09" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="signal-shirt-fade" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color.highlight} stopOpacity="0.14" />
          <stop offset="50%" stopColor="transparent" />
          <stop offset="100%" stopColor={color.shade} stopOpacity="0.28" />
        </linearGradient>
        <pattern id="signal-shirt-fabric" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(18)">
          <path d="M0 0H12" stroke={color.fabric} strokeWidth="1" />
          <path d="M0 6H12" stroke={color.fabric} strokeOpacity="0.45" strokeWidth="0.8" />
        </pattern>
        <clipPath id="signal-shirt-clip">
          <path d={silhouette} />
        </clipPath>
      </defs>

      <g style={{ transform: outerMotion, transformOrigin: '270px 320px', transition: 'transform 180ms ease-out' }}>
        <ellipse cx="270" cy="560" rx="166" ry="25" fill="rgba(0,0,0,0.16)" />
        <ellipse cx="270" cy="552" rx="120" ry="14" fill="rgba(255,255,255,0.05)" />

        <g transform={shirtTransform}>
          <path d={silhouette} fill="url(#signal-shirt-body)" />
          <path d={silhouette} fill="url(#signal-shirt-sheen)" opacity="0.82" />
          <path d={silhouette} fill="url(#signal-shirt-fade)" opacity="0.65" />

          <g clipPath="url(#signal-shirt-clip)" opacity="0.9">
            <rect x="155" y="86" width="250" height="470" fill="url(#signal-shirt-fabric)" opacity="0.22" />
            <path d="M198 160C210 200 214 240 212 286C210 334 214 381 224 490" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" strokeLinecap="round" />
            <path d="M342 160C330 198 325 241 327 288C329 338 325 387 315 490" fill="none" stroke="rgba(17,17,17,0.13)" strokeWidth="3" strokeLinecap="round" />
            <path d="M238 110C248 120 259 125 270 125C281 125 292 120 302 110" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="2" strokeLinecap="round" />
            <path d="M228 329C246 316 258 309 270 309C282 309 294 316 312 329" fill="none" stroke="rgba(17,17,17,0.08)" strokeWidth="2" strokeLinecap="round" />
            <path d="M236 393C252 381 260 376 270 376C280 376 288 381 304 393" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" strokeLinecap="round" />
          </g>

          <path
            d={silhouette}
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M178 112C197 98 221 91 270 91C319 91 343 98 362 112"
            fill="none"
            stroke={color.highlight}
            strokeOpacity="0.45"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M229 99C239 111 249 117 270 117C291 117 301 111 311 99"
            fill="none"
            stroke={color.highlight}
            strokeOpacity="0.46"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M188 180V487C188 517 210 545 270 545C330 545 352 517 352 487V180"
            fill="none"
            stroke={color.highlight}
            strokeOpacity="0.23"
            strokeWidth="2"
          />

          {isFront && (
            <>
              <text
                x="270"
                y="304"
                textAnchor="middle"
                fill={color.text}
                fontSize="48"
                fontWeight="700"
                letterSpacing="0.28em"
                fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              >
                LIKENESS
              </text>
              <text
                x="270"
                y="339"
                textAnchor="middle"
                fill={color.text}
                fillOpacity="0.78"
                fontSize="14"
                fontWeight="600"
                letterSpacing="0.38em"
                fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              >
                SIGNAL WEAR
              </text>
            </>
          )}

          {isSide && (
            <>
              <text
                x="286"
                y="301"
                textAnchor="middle"
                fill={color.text}
                fontSize="40"
                fontWeight="700"
                letterSpacing="0.26em"
                fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              >
                LIKENESS
              </text>
              <path
                d="M256 332H307"
                fill="none"
                stroke={color.text}
                strokeOpacity="0.24"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </>
          )}

          {isBack && (
            <>
              <path
                d="M257 117H283"
                fill="none"
                stroke={color.highlight}
                strokeOpacity="0.5"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <text
                x="270"
                y="286"
                textAnchor="middle"
                fill={color.text}
                fontSize="32"
                fontWeight="700"
                letterSpacing="0.28em"
                fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              >
                LIKENESS
              </text>
              <text
                x="270"
                y="320"
                textAnchor="middle"
                fill={color.text}
                fillOpacity="0.72"
                fontSize="13"
                fontWeight="600"
                letterSpacing="0.34em"
                fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              >
                BACK PRINT
              </text>
            </>
          )}

          <path d={tapLabel.line} fill="none" stroke="rgba(198,167,94,0.65)" strokeWidth="1.6" strokeLinecap="round" />
          <text
            x={tapLabel.x}
            y={tapLabel.y}
            fill={color.text}
            fontSize="12"
            fontWeight="700"
            letterSpacing="0.26em"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          >
            TAP POINT
          </text>
          <text
            x={tapLabel.x}
            y={tapLabel.y + 18}
            fill={color.text}
            fillOpacity="0.76"
            fontSize="10"
            fontWeight="600"
            letterSpacing="0.12em"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          >
            TAP HERE TO CONNECT TO THE REGISTRY
          </text>

          <circle cx={tapPoint.x} cy={tapPoint.y} r="7" fill="#c6a75e" />
          <circle
            cx={tapPoint.x}
            cy={tapPoint.y}
            r="18"
            fill="none"
            stroke="#c6a75e"
            strokeOpacity="0.26"
            strokeWidth="1.5"
            style={{
              transformBox: 'fill-box',
              transformOrigin: 'center',
              animation: 'signalTapPulse 1.8s ease-out 1',
            }}
          />
        </g>
      </g>
    </svg>
  )
}

export function SignalShirtViewer() {
  const [pose, setPose] = useState<PoseIndex>(0)
  const [colorIndex, setColorIndex] = useState(0)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [pointer, setPointer] = useState({ x: 0.52, y: 0.42 })
  const [isHovering, setIsHovering] = useState(false)
  const dragRef = useRef<{ startX: number; startPose: PoseIndex } | null>(null)
  const viewerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0
    setIsTouchDevice(coarsePointer)
  }, [])

  const activeColor = COLORS[colorIndex]
  const helperText = isTouchDevice ? 'Swipe to rotate' : 'Drag to rotate'
  const currentPose = POSE_OPTIONS[pose]

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
      startPose: pose,
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
    setPose(clampIndex(drag.startPose + stepCount))
  }

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag) return

    const deltaX = event.clientX - drag.startX
    const stepCount = Math.round(deltaX / 90)
    if (stepCount !== 0) {
      setPose(clampIndex(drag.startPose + stepCount))
    }

    dragRef.current = null
    updatePointer(event)
  }

  return (
    <section className="pf-reveal-group border-b border-[var(--pf-border)]">
      <div className="pf-container py-10 md:py-14">
        <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          <div className="pf-reveal-child rounded-[32px] border border-[var(--pf-border)] bg-[var(--pf-surface)] p-4 md:p-6">
            <div className="rounded-[28px] border border-[var(--pf-border)] bg-[linear-gradient(180deg,var(--pf-bg),var(--pf-surface))] p-4 md:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(198,167,94,0.2)] bg-[rgba(198,167,94,0.06)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.32em] text-[var(--pf-orange)]">
                  Signal shirt
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--pf-border)] bg-[var(--pf-bg)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--pf-text-muted)]">
                  {currentPose.label}
                </div>
              </div>

              <div
                ref={viewerRef}
                className="relative aspect-[4/5] select-none overflow-hidden rounded-[28px] border border-[rgba(198,167,94,0.18)] bg-[radial-gradient(circle_at_50%_12%,rgba(198,167,94,0.16),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.68),rgba(255,255,255,0.03) 45%,rgba(17,17,17,0.05))] shadow-[0_30px_80px_-42px_rgba(0,0,0,0.62)]"
                style={{
                  touchAction: 'none',
                  perspective: '1200px',
                }}
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
                  if (event.key === 'ArrowLeft') setPose((current) => clampIndex(current - 1))
                  if (event.key === 'ArrowRight') setPose((current) => clampIndex(current + 1))
                }}
                role="group"
                aria-label="Interactive LIKENESS shirt viewer"
                tabIndex={0}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_78%,rgba(0,0,0,0.18),transparent_36%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.25),transparent_35%,rgba(0,0,0,0.06))]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_36%_18%,rgba(255,255,255,0.25),transparent_28%)]" />

                <div className="absolute left-4 top-4 rounded-full border border-[var(--pf-border)] bg-[var(--pf-surface)]/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--pf-text-muted)] backdrop-blur">
                  LIKENESS
                </div>

                <div
                  className="absolute inset-0 flex items-center justify-center px-5 py-10 transition-transform duration-200 ease-out"
                  style={{
                    transform: `translate3d(${(pointer.x - 0.5) * 16}px, ${(pointer.y - 0.5) * 12}px, 0) rotateX(${(pointer.y - 0.5) * -7}deg) rotateY(${(pointer.x - 0.5) * 8}deg) scale(${isHovering ? 1.015 : 1})`,
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <div className="relative h-full w-full max-w-[430px]">
                    <ShirtStage
                      pose={pose}
                      color={activeColor}
                      tiltX={(pointer.x - 0.5) * 0.4}
                      tiltY={(pointer.y - 0.5) * 0.4}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-4 text-xs text-[var(--pf-text-muted)]">
                <span>{helperText}</span>
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--pf-border)] bg-[var(--pf-bg)] p-1">
                  {POSE_OPTIONS.map((option, index) => (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => setPose(index as PoseIndex)}
                      className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] transition-all duration-200 ease-out ${
                        pose === index
                          ? 'scale-[1.03] border border-[rgba(198,167,94,0.3)] bg-[rgba(198,167,94,0.12)] text-[var(--pf-orange)] shadow-[0_0_0_1px_rgba(198,167,94,0.16)]'
                          : 'border border-transparent text-[var(--pf-text-muted)] hover:text-[var(--pf-text)]'
                      }`}
                      aria-pressed={pose === index}
                      aria-label={option.label}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pf-reveal-child rounded-[32px] border border-[var(--pf-border)] bg-[var(--pf-surface)] p-6 md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--pf-orange)]">Signal shirt</p>
            <h2 className="mt-2 text-3xl font-bold">Real. Simple. Powerful.</h2>
            <p className="mt-3 max-w-xl text-base text-[var(--pf-text-secondary)]">
              The Signal Shirt carries a tap point that connects people to your likeness instantly.
            </p>

            <div className="mt-6 rounded-[24px] border border-[var(--pf-border)] bg-[var(--pf-bg)] p-4">
              <div className="flex items-start gap-3">
                <span className="mt-1 h-3 w-3 rounded-full bg-[var(--pf-orange)] shadow-[0_0_0_6px_rgba(198,167,94,0.12)]" />
                <div>
                  <p className="text-sm font-semibold text-[var(--pf-text)]">Tap point</p>
                  <p className="mt-1 text-sm text-[var(--pf-text-secondary)]">Tap here to connect to the registry</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm font-semibold text-[var(--pf-text)]">Colors</p>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {COLORS.map((option, index) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => setColorIndex(index)}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-200 ease-out hover:scale-[1.015] ${
                      colorIndex === index
                        ? 'scale-[1.015] border-[var(--pf-orange)] bg-[var(--pf-bg)] shadow-[0_0_0_1px_rgba(198,167,94,0.16),0_0_0_6px_rgba(198,167,94,0.08)]'
                        : 'border-[var(--pf-border)] bg-[var(--pf-bg)]'
                    }`}
                    aria-pressed={colorIndex === index}
                  >
                    <span
                      className="h-5 w-5 rounded-full border border-[var(--pf-border)]"
                      style={{ backgroundColor: option.body }}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium text-[var(--pf-text)]">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {FEATURE_TILES.map((tile) => (
                <FeatureTile key={tile.title} kind={tile.kind} title={tile.title} copy={tile.copy} />
              ))}
            </div>

            <div className="mt-6 rounded-[24px] border border-[var(--pf-border)] bg-[var(--pf-bg)] p-4 md:p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--pf-orange)]">How it works</p>
              <div className="mt-4 grid gap-3">
                {STEPS.map((step, index) => (
                  <div key={step} className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[rgba(198,167,94,0.24)] bg-[rgba(198,167,94,0.1)] text-xs font-semibold text-[var(--pf-orange)]">
                      {index + 1}
                    </span>
                    <p className="pt-0.5 text-sm text-[var(--pf-text)]">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
