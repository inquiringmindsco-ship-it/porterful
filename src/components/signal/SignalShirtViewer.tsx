'use client'

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'

type PoseIndex = 0 | 1 | 2

type ColorOption = {
  label: string
  body: string
  shade: string
  highlight: string
  text: string
}

const COLORS: ColorOption[] = [
  {
    label: 'Black',
    body: '#111111',
    shade: '#1c1c1c',
    highlight: '#2f2f2f',
    text: '#f7f5ef',
  },
  {
    label: 'White',
    body: '#f7f7f4',
    shade: '#ecece8',
    highlight: '#d9d9d4',
    text: '#111111',
  },
  {
    label: 'Cream',
    body: '#f4ecdf',
    shade: '#e9dec9',
    highlight: '#d8c8aa',
    text: '#111111',
  },
  {
    label: 'Heather Gray',
    body: '#b7b3ac',
    shade: '#9e9a94',
    highlight: '#d0ccc6',
    text: '#111111',
  },
]

const POSE_LABELS = ['Front', 'Angled', 'Back'] as const

function clampIndex(value: number): PoseIndex {
  return Math.max(0, Math.min(2, value)) as PoseIndex
}

function ShirtStage({
  pose,
  color,
}: {
  pose: PoseIndex
  color: ColorOption
}) {
  const isFront = pose === 0
  const isAngled = pose === 1
  const isBack = pose === 2

  const wrapperTransform = isFront
    ? 'translate(0px, 0px) scale(1)'
    : isAngled
      ? 'translate(14px, 6px) scale(0.985)'
      : 'translate(0px, 2px) scale(0.995)'

  const shirtTransform = isAngled ? 'rotate(-4 270 310)' : 'rotate(0 270 310)'

  return (
    <svg viewBox="0 0 540 640" className="h-full w-full">
      <g transform={wrapperTransform}>
        <ellipse cx="270" cy="536" rx="136" ry="20" fill="rgba(17,17,17,0.08)" />
        <g transform={shirtTransform}>
          <path
            d="M180 110C202 95 228 87 270 87C312 87 338 95 360 110L408 140L383 196L352 177V485C352 515 329 536 270 536C211 536 188 515 188 485V177L157 196L132 140Z"
            fill={color.body}
          />
          <path
            d="M180 110C202 95 228 87 270 87C312 87 338 95 360 110L408 140L383 196L352 177V485C352 515 329 536 270 536C211 536 188 515 188 485V177L157 196L132 140Z"
            fill="none"
            stroke="rgba(255,255,255,0.09)"
            strokeWidth="2"
          />
          <path
            d="M188 179V486C188 516 211 536 270 536C329 536 352 516 352 486V179"
            fill="none"
            stroke={color.highlight}
            strokeOpacity="0.36"
            strokeWidth="2"
          />
          <path
            d="M177 111C195 98 221 91 270 91C319 91 345 98 363 111"
            fill="none"
            stroke={color.highlight}
            strokeOpacity="0.42"
            strokeWidth="2"
          />
          <path
            d="M228 98C238 110 249 116 270 116C291 116 302 110 312 98"
            fill="none"
            stroke={color.highlight}
            strokeOpacity="0.44"
            strokeWidth="2"
          />

          {isFront && (
            <>
              <text
                x="270"
                y="305"
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
                y="340"
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

          {isAngled && (
            <>
              <text
                x="285"
                y="300"
                textAnchor="middle"
                fill={color.text}
                fontSize="42"
                fontWeight="700"
                letterSpacing="0.26em"
                fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              >
                LIKENESS
              </text>
              <path
                d="M258 330H305"
                fill="none"
                stroke={color.text}
                strokeOpacity="0.28"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </>
          )}

          {isBack && (
            <>
              <path
                d="M258 117H282"
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
                letterSpacing="0.3em"
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

          <rect x="244" y="89" width="52" height="24" rx="10" fill={color.shade} fillOpacity="0.55" />
          <path
            d="M249 102C254 97 260 95 270 95C280 95 286 97 291 102"
            fill="none"
            stroke={color.highlight}
            strokeOpacity="0.42"
            strokeWidth="2"
            strokeLinecap="round"
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
  const dragRef = useRef<{ startX: number; startPose: PoseIndex } | null>(null)

  useEffect(() => {
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0
    setIsTouchDevice(coarsePointer)
  }, [])

  const activeColor = useMemo(() => COLORS[colorIndex], [colorIndex])

  const helperText = isTouchDevice ? 'Swipe to rotate' : 'Drag to rotate'

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragRef.current = {
      startX: event.clientX,
      startPose: pose,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
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
  }

  const handlePoseButton = (nextPose: PoseIndex) => setPose(nextPose)

  return (
    <section className="pf-reveal-group border-b border-[var(--pf-border)]">
      <div className="pf-container py-10 md:py-12">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
          <div className="pf-reveal-child rounded-[32px] border border-[var(--pf-border)] bg-[var(--pf-surface)] p-4 md:p-6">
            <div className="rounded-[28px] border border-[var(--pf-border)] bg-gradient-to-b from-[var(--pf-bg)] via-[var(--pf-surface)] to-[var(--pf-bg)] p-4 md:p-6">
              <div
                className="relative aspect-[4/5] select-none overflow-hidden rounded-[24px] bg-[radial-gradient(circle_at_top,rgba(198,167,94,0.12),transparent_60%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))] shadow-[0_24px_60px_-36px_rgba(0,0,0,0.45)]"
                style={{ touchAction: 'none' }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={() => {
                  dragRef.current = null
                }}
                onPointerLeave={(event) => {
                  if (!dragRef.current) return
                  if (event.buttons === 0) dragRef.current = null
                }}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowLeft') setPose((current) => clampIndex(current - 1))
                  if (event.key === 'ArrowRight') setPose((current) => clampIndex(current + 1))
                }}
                role="group"
                aria-label="Interactive LIKENESS shirt viewer"
                tabIndex={0}
              >
                <div className="absolute left-4 top-4 rounded-full border border-[var(--pf-border)] bg-[var(--pf-surface)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--pf-text-muted)]">
                  LIKENESS
                </div>

                <div className="absolute inset-0 flex items-center justify-center px-6 py-10">
                  <div className="relative h-full w-full max-w-[420px]">
                    {POSE_LABELS.map((label, index) => (
                      <div
                        key={label}
                        className={`absolute inset-0 transition-all duration-300 ease-out ${pose === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                        aria-hidden={pose !== index}
                      >
                        <ShirtStage pose={index as PoseIndex} color={activeColor} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-4 text-xs text-[var(--pf-text-muted)]">
                <span>{helperText}</span>
                <div className="flex items-center gap-2">
                  {POSE_LABELS.map((label, index) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => handlePoseButton(index as PoseIndex)}
                      className={`h-2.5 rounded-full transition-all duration-200 ease-out ${
                        pose === index ? 'w-6 bg-[var(--pf-orange)]' : 'w-2.5 bg-[var(--pf-border-hover)] hover:bg-[var(--pf-text-muted)]'
                      }`}
                      aria-label={label}
                      aria-pressed={pose === index}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pf-reveal-child rounded-[32px] border border-[var(--pf-border)] bg-[var(--pf-surface)] p-6 md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--pf-orange)]">Signal shirt</p>
            <h2 className="mt-2 text-3xl font-bold">A physical signal, rendered lightly</h2>
            <p className="mt-3 max-w-xl text-base text-[var(--pf-text-secondary)]">
              A premium LIKENESS shirt with a lightweight frame viewer so people can read the design without heavy 3D rendering.
            </p>

            <div className="mt-6">
              <p className="text-sm font-semibold text-[var(--pf-text)]">Colors</p>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {COLORS.map((option, index) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => setColorIndex(index)}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-200 ease-out hover:scale-[1.01] ${
                      colorIndex === index
                        ? 'border-[var(--pf-orange)] bg-[var(--pf-bg)] shadow-[0_0_0_1px_rgba(198,167,94,0.14)]'
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

            <div className="mt-6 rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-bg)] p-4">
              <p className="text-sm font-medium text-[var(--pf-text)]">LIKENESS branding is the point.</p>
              <p className="mt-1 text-sm text-[var(--pf-text-secondary)]">
                Minimal, premium, and built to feel high-value without taxing the device.
              </p>
            </div>

            <p className="mt-4 text-sm text-[var(--pf-text-muted)]">{helperText}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
