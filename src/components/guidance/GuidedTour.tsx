'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePathname, useRouter } from 'next/navigation'
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  Info,
  Play,
  RotateCcw,
  SkipForward,
  X,
} from 'lucide-react'

export type TourScope = 'artist' | 'founder'
export type TourStatus = 'idle' | 'active' | 'paused' | 'completed'

export type TourStep = {
  id: string
  title: string
  body: string
  path: string
  targetId: string
}

export type TourState = {
  status: TourStatus
  scope: TourScope
  stepIndex: number
  startedAt?: string
  updatedAt: string
  completedAt?: string
  pausedAt?: string
}

const TOUR_STORAGE_PREFIX = 'porterful.guided-tour'

const TOUR_STEPS: Record<TourScope, TourStep[]> = {
  artist: [
    {
      id: 'artist-welcome',
      title: 'Welcome to Porterful',
      body: 'Porterful helps creators turn music, content, artwork, and approved products into trackable commerce.',
      path: '/dashboard/artist',
      targetId: 'porterful-shell',
    },
    {
      id: 'artist-dashboard',
      title: 'Dashboard',
      body: 'This is your command center. Everything starts here.',
      path: '/dashboard/artist',
      targetId: 'artist-dashboard-guidance',
    },
    {
      id: 'artist-assets',
      title: 'My Files',
      body: 'Upload artwork, cover art, merch designs, and other creative files for review.',
      path: '/dashboard/artist/assets',
      targetId: 'artist-assets-submit-form',
    },
    {
      id: 'artist-approval',
      title: 'File Approval',
      body: 'Approved files can become products and future merchandise.',
      path: '/dashboard/artist/assets',
      targetId: 'artist-assets-list',
    },
    {
      id: 'artist-skus',
      title: 'Product Versions',
      body: 'A product version is a specific configuration that can be tracked and sold.',
      path: '/dashboard/artist/skus',
      targetId: 'artist-sku-summary',
    },
    {
      id: 'artist-products',
      title: 'Products',
      body: 'Products are what customers actually purchase.',
      path: '/store',
      targetId: 'controlled-merch-card',
    },
    {
      id: 'artist-analytics',
      title: 'Analytics',
      body: 'Track plays, downloads, orders, and activity.',
      path: '/dashboard/artist',
      targetId: 'artist-dashboard-summary',
    },
    {
      id: 'artist-fulfillment',
      title: 'Orders \u0026 Shipping',
      body: 'Follow orders from purchase through delivery.',
      path: '/dashboard/artist/fulfillment',
      targetId: 'artist-fulfillment-overview',
    },
    {
      id: 'artist-complete',
      title: 'Complete',
      body: 'You are ready to begin using Porterful.',
      path: '/dashboard/artist',
      targetId: 'porterful-shell',
    },
  ],
  founder: [
    {
      id: 'founder-welcome',
      title: 'Welcome to Porterful',
      body: 'Porterful helps creators turn music, content, artwork, and approved products into trackable commerce.',
      path: '/dashboard/founder',
      targetId: 'porterful-shell',
    },
    {
      id: 'founder-dashboard',
      title: 'Dashboard',
      body: 'This is your command center. Everything starts here.',
      path: '/dashboard/founder',
      targetId: 'founder-dashboard-guidance',
    },
    {
      id: 'founder-assets',
      title: 'Production Assets',
      body: 'Review submitted creative files before they become products.',
      path: '/dashboard/founder/assets',
      targetId: 'founder-assets-review-queue',
    },
    {
      id: 'founder-approval',
      title: 'Asset Approval',
      body: 'Approved assets can become products and future merchandise.',
      path: '/dashboard/founder/assets',
      targetId: 'founder-assets-actions',
    },
    {
      id: 'founder-skus',
      title: 'SKU System',
      body: 'A SKU is a specific version of a product that can be tracked and sold.',
      path: '/dashboard/founder/skus',
      targetId: 'founder-sku-create',
    },
    {
      id: 'founder-products',
      title: 'Products',
      body: 'Products are what customers actually purchase.',
      path: '/store',
      targetId: 'controlled-merch-card',
    },
    {
      id: 'founder-analytics',
      title: 'Analytics',
      body: 'Track plays, downloads, orders, and activity.',
      path: '/dashboard/founder',
      targetId: 'founder-analytics-metrics',
    },
    {
      id: 'founder-fulfillment',
      title: 'Fulfillment',
      body: 'Move jobs from reserve to delivery and monitor exceptions.',
      path: '/dashboard/founder/fulfillment',
      targetId: 'founder-fulfillment-queue',
    },
    {
      id: 'founder-complete',
      title: 'Complete',
      body: 'You are ready to manage Porterful operations.',
      path: '/dashboard/founder',
      targetId: 'porterful-shell',
    },
  ],
}

type GuidedTourContextValue = {
  state: TourState | null
  scope: TourScope | null
  currentStep: TourStep | null
  isActive: boolean
  isPaused: boolean
  isCompleted: boolean
  progress: number
  startTour: (scope?: TourScope) => void
  restartTour: (scope?: TourScope) => void
  pauseTour: () => void
  resumeTour: () => void
  skipTour: () => void
  nextStep: () => void
  previousStep: () => void
}

const GuidedTourContext = createContext<GuidedTourContextValue | null>(null)

function nowIso() {
  return new Date().toISOString()
}

function tourIdentity(userId?: string | null) {
  return userId && userId.trim() ? userId.trim() : 'anonymous'
}

function storageKey(scope: TourScope, userId?: string | null) {
  return `${TOUR_STORAGE_PREFIX}.${tourIdentity(userId)}.${scope}`
}

function legacyStorageKey(scope: TourScope) {
  return `${TOUR_STORAGE_PREFIX}.${scope}`
}

function seenKey(scope: TourScope, userId?: string | null) {
  return `${TOUR_STORAGE_PREFIX}.${tourIdentity(userId)}.${scope}.seen`
}

function loadState(scope: TourScope, userId?: string | null): TourState | null {
  if (typeof window === 'undefined') return null

  try {
    const primaryKey = storageKey(scope, userId)
    const raw = window.localStorage.getItem(primaryKey)
    if (raw) {
      const parsed = JSON.parse(raw) as TourState
      if (!parsed || parsed.scope !== scope) return null
      if (!['idle', 'active', 'paused', 'completed'].includes(parsed.status)) return null
      return parsed
    }

    if (userId) {
      const anonymousKey = storageKey(scope, null)
      const anonymousRaw = window.localStorage.getItem(anonymousKey)
      if (anonymousRaw) {
        const parsed = JSON.parse(anonymousRaw) as TourState
        if (!parsed || parsed.scope !== scope) return null
        if (!['idle', 'active', 'paused', 'completed'].includes(parsed.status)) return null
        window.localStorage.setItem(primaryKey, JSON.stringify(parsed))
        if (parsed.status !== 'idle') {
          window.localStorage.setItem(seenKey(scope, userId), 'true')
        }
        return parsed
      }
    }

    const legacyRaw = window.localStorage.getItem(legacyStorageKey(scope))
    if (!legacyRaw) return null
    const parsed = JSON.parse(legacyRaw) as TourState
    if (!parsed || parsed.scope !== scope) return null
    if (!['idle', 'active', 'paused', 'completed'].includes(parsed.status)) return null
    window.localStorage.setItem(primaryKey, JSON.stringify(parsed))
    if (parsed.status !== 'idle') {
      window.localStorage.setItem(seenKey(scope, userId), 'true')
    }
    return parsed
  } catch {
    return null
  }
}

function loadAnyState(userId?: string | null): TourState | null {
  if (typeof window === 'undefined') return null

  const artistState = loadState('artist', userId)
  const founderState = loadState('founder', userId)

  if (artistState?.status === 'active' || artistState?.status === 'paused') return artistState
  if (founderState?.status === 'active' || founderState?.status === 'paused') return founderState
  return artistState || founderState
}

function saveStateForUser(state: TourState | null, userId?: string | null) {
  if (typeof window === 'undefined') return

  if (!state) return
  window.localStorage.setItem(storageKey(state.scope, userId), JSON.stringify(state))
}

function clearState(scope: TourScope, userId?: string | null) {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(storageKey(scope, userId))
  window.localStorage.removeItem(legacyStorageKey(scope))
}

function setSeen(scope: TourScope, userId?: string | null) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(seenKey(scope, userId), 'true')
}

function hasSeen(scope: TourScope, userId?: string | null) {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(seenKey(scope, userId)) === 'true'
}

function isDashboardPath(pathname: string) {
  return pathname.startsWith('/dashboard/artist') || pathname.startsWith('/dashboard/founder')
}

function isPublicPath(pathname: string) {
  const publicPaths = ['/login', '/register', '/signup', '/forgot-password', '/reset-password']
  return publicPaths.some((p) => pathname === p || pathname.startsWith(p + '/'))
}

function resolveScopeFromPath(pathname: string): TourScope | null {
  if (pathname.startsWith('/dashboard/founder')) return 'founder'
  if (pathname.startsWith('/dashboard/artist')) return 'artist'
  return null
}

function defaultHelpText(label: string) {
  const value = label.toLowerCase()
  if (value.includes('dashboard')) {
    return 'This is your command center. Use it to see what needs attention next.'
  }
  if (value.includes('asset') || value.includes('file')) {
    return 'Creative files submitted for approval before they can be used in products.'
  }
  if (value.includes('sku') || value.includes('product version')) {
    return 'A specific sellable version of a product.'
  }
  if (value.includes('inventory')) {
    return 'The quantity available to fulfill customer orders.'
  }
  if (value.includes('fulfillment') || value.includes('orders') || value.includes('shipping')) {
    return 'Orders waiting to be printed, packed, or shipped.'
  }
  if (value.includes('shipment')) {
    return 'A timeline showing shipment progress.'
  }
  if (value.includes('return')) {
    return 'Track returned items and their status.'
  }
  if (value.includes('analytics') || value.includes('activity') || value.includes('metrics')) {
    return 'Measure activity, engagement, and sales.'
  }
  if (value.includes('product')) {
    return 'What customers can purchase from Porterful.'
  }
  return 'A short explanation of this section.'
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function HelpTip({
  label,
  text,
}: {
  label?: string
  text: string
}) {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (buttonRef.current?.contains(target) || panelRef.current?.contains(target)) return
      setOpen(false)
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  return (
    <span className="relative inline-flex">
      <button
        ref={buttonRef}
        type="button"
        aria-label={label ? `${label} help` : 'Help'}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[var(--pf-border)] text-[var(--pf-text-muted)] transition-colors hover:border-[var(--pf-orange)] hover:text-[var(--pf-orange)] focus:outline-none focus:ring-2 focus:ring-[var(--pf-orange)]/40"
      >
        <Info size={12} />
      </button>

      {open && (
        <div
          ref={panelRef}
          role="tooltip"
          className="absolute left-0 top-full z-[90] mt-2 w-72 rounded-xl border border-[var(--pf-border)] bg-[var(--pf-bg)] p-3 text-left shadow-2xl"
        >
          {label && <p className="text-[11px] uppercase tracking-wide text-[var(--pf-text-muted)]">{label}</p>}
          <p className="mt-1 text-sm text-[var(--pf-text-secondary)]">{text}</p>
        </div>
      )}
    </span>
  )
}

function TourOverlay({
  step,
  stepIndex,
  stepsTotal,
  rect,
  onNext,
  onPrevious,
  onPause,
  onSkip,
}: {
  step: TourStep
  stepIndex: number
  stepsTotal: number
  rect: DOMRect | null
  onNext: () => void
  onPrevious: () => void
  onPause: () => void
  onSkip: () => void
}) {
  const actionLockRef = useRef(false)

  const runAction = useCallback((action: () => void) => {
    if (actionLockRef.current) return
    actionLockRef.current = true
    action()
    window.setTimeout(() => {
      actionLockRef.current = false
    }, 0)
  }, [])

  if (typeof document === 'undefined') return null

  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1280
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800
  const cardWidth = Math.min(420, viewportWidth - 32)

  let cardLeft = 16
  let cardTop = Math.min(viewportHeight - 320, viewportHeight - 260)

  if (rect) {
    const preferredLeft = rect.left
    const preferredTop = rect.bottom + 20
    const fallbackTop = rect.top - 300
    cardLeft = clamp(preferredLeft, 16, viewportWidth - cardWidth - 16)
    cardTop = preferredTop + 280 > viewportHeight - 16 ? clamp(fallbackTop, 16, viewportHeight - 320) : clamp(preferredTop, 16, viewportHeight - 320)
  }

  const highlightStyle = rect
    ? {
        top: rect.top - 10,
        left: rect.left - 10,
        width: rect.width + 20,
        height: rect.height + 20,
        borderRadius: 24,
      }
    : {
        top: Math.max(16, viewportHeight / 2 - 120),
        left: Math.max(16, viewportWidth / 2 - 180),
        width: Math.min(360, viewportWidth - 32),
        height: 240,
        borderRadius: 24,
      }

  return createPortal(
    <div className="fixed inset-0 z-[90]">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-[1px]" />
      <div
        className="absolute border border-[rgba(249,115,22,0.95)] shadow-[0_0_0_9999px_rgba(0,0,0,0.75),0_0_40px_rgba(249,115,22,0.24)]"
        style={highlightStyle}
      />

      <div
        className="absolute w-[min(420px,calc(100vw-32px))] rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-bg)] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
        style={{ top: cardTop, left: cardLeft }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--pf-text-muted)]">
              Step {stepIndex + 1} of {stepsTotal}
            </p>
            <h2 className="text-lg font-semibold text-[var(--pf-text)]">{step.title}</h2>
          </div>
          <div className="rounded-full bg-[var(--pf-surface)] p-2 text-[var(--pf-orange)]">
            <Play size={14} />
          </div>
        </div>

        <p className="mt-3 text-sm leading-6 text-[var(--pf-text-secondary)]">{step.body}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => runAction(onPrevious)}
            disabled={stepIndex === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--pf-border)] px-3 py-2 text-sm text-[var(--pf-text-secondary)] transition-colors hover:border-[var(--pf-orange)] hover:text-[var(--pf-text)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft size={14} />
            Back
          </button>
          <button
            type="button"
            onClick={() => runAction(onPause)}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--pf-border)] px-3 py-2 text-sm text-[var(--pf-text-secondary)] transition-colors hover:border-[var(--pf-orange)] hover:text-[var(--pf-text)]"
          >
            <Clock3 size={14} />
            Resume Later
          </button>
          <button
            type="button"
            onClick={() => runAction(onSkip)}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--pf-border)] px-3 py-2 text-sm text-[var(--pf-text-secondary)] transition-colors hover:border-[var(--pf-orange)] hover:text-[var(--pf-text)]"
          >
            <SkipForward size={14} />
            Skip Tour
          </button>
          <button
            type="button"
            onClick={() => runAction(onNext)}
            className="ml-auto inline-flex items-center gap-2 rounded-lg bg-[var(--pf-orange)] px-4 py-2 text-sm font-semibold text-[var(--pf-text)] transition-colors hover:bg-[var(--pf-orange)]/90"
          >
            {stepIndex === stepsTotal - 1 ? 'Finish Tour' : 'Next'}
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

function TourLauncher({ onResume }: { onResume: () => void }) {
  return createPortal(
    <button
      type="button"
      onClick={onResume}
      className="fixed bottom-4 right-4 z-[85] inline-flex items-center gap-2 rounded-full border border-[var(--pf-border)] bg-[var(--pf-bg)] px-4 py-2 text-sm font-medium text-[var(--pf-text)] shadow-lg transition-colors hover:border-[var(--pf-orange)] hover:text-[var(--pf-orange)]"
    >
      <Play size={14} />
      Resume guided tour
    </button>,
    document.body
  )
}

export function GuidedTourProvider({ children, userId }: { children: React.ReactNode, userId?: string | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const [scope, setScope] = useState<TourScope | null>(null)
  const [state, setState] = useState<TourState | null>(null)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const autoStartedRef = useRef<string | null>(null)

  const computedScope = useMemo(() => {
    const routeScope = resolveScopeFromPath(pathname)
    if (routeScope) return routeScope
    return scope
  }, [pathname, scope])

  const steps = useMemo(() => {
    return computedScope ? TOUR_STEPS[computedScope] : []
  }, [computedScope])

  const currentStep = state && state.status === 'active' ? steps[state.stepIndex] || null : null
  const progress = state && steps.length > 0 ? Math.min(100, ((state.stepIndex + 1) / steps.length) * 100) : 0

  useEffect(() => {
    const routeScope = resolveScopeFromPath(pathname)
    if (routeScope) {
      setScope(routeScope)
      // Only load from localStorage if we don't already have active/paused state for this scope
      if (!state || state.scope !== routeScope || state.status === 'completed') {
        const stored = loadState(routeScope, userId)
        if (stored && stored.status !== 'completed') {
          if (hasSeen(routeScope, userId) && stored.status === 'active') {
            const pausedState: TourState = {
              ...stored,
              status: 'paused',
              pausedAt: stored.pausedAt || nowIso(),
              updatedAt: nowIso(),
            }
            setState(pausedState)
            saveStateForUser(pausedState, userId)
          } else {
            setState(stored)
          }
        } else if (!state) {
          setState(null)
        }
      }
      return
    }

    const stored = loadAnyState(userId)
    if (stored) {
      setScope(stored.scope)
      setState(stored)
      return
    }

    if (!scope) {
      setState(null)
    }
  }, [pathname, userId])

  useEffect(() => {
    if (!computedScope) return
    if (!userId) return

    // Don't auto-start if tour is already active or paused for this scope
    if (state?.scope === computedScope && (state?.status === 'active' || state?.status === 'paused')) {
      return
    }

    const stored = loadState(computedScope, userId)
    if (stored) {
      // Only load stored state if it differs from current in-memory state
      if (!state || state.scope !== computedScope) {
        setState(stored)
      }
      return
    }

    if (hasSeen(computedScope, userId)) return

    if (autoStartedRef.current === computedScope) return

    if (isDashboardPath(pathname) && !isPublicPath(pathname)) {
      autoStartedRef.current = computedScope
      setSeen(computedScope, userId)
      const nextState: TourState = {
        status: 'active',
        scope: computedScope,
        stepIndex: 0,
        startedAt: nowIso(),
        updatedAt: nowIso(),
      }
      setState(nextState)
      saveStateForUser(nextState, userId)
    }
  // Intentionally exclude state from deps to prevent feedback loop
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computedScope, pathname, userId])

  useEffect(() => {
    if (!state) return
    saveStateForUser(state, userId)
  }, [state, userId])

  useEffect(() => {
    if (!currentStep) {
      setTargetRect(null)
      return
    }

    let cancelled = false
    let attempts = 0

    const findTarget = () => {
      if (cancelled) return

      const element = document.querySelector<HTMLElement>(`[data-tour-id="${currentStep.targetId}"]`)
      if (!element) {
        if (attempts < 24) {
          attempts += 1
          window.setTimeout(findTarget, 60)
        }
        return
      }

      element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
      const nextRect = element.getBoundingClientRect()
      setTargetRect(nextRect)
    }

    const syncRect = () => {
      if (!currentStep) return
      const element = document.querySelector<HTMLElement>(`[data-tour-id="${currentStep.targetId}"]`)
      if (!element) return
      setTargetRect(element.getBoundingClientRect())
    }

    findTarget()

    window.addEventListener('resize', syncRect)
    window.addEventListener('scroll', syncRect, true)

    return () => {
      cancelled = true
      window.removeEventListener('resize', syncRect)
      window.removeEventListener('scroll', syncRect, true)
    }
  }, [currentStep, pathname])

  const setTourState = useCallback((next: TourState | null) => {
    if (next) {
      setScope(next.scope)
      setState(next)
      return
    }

    if (computedScope) {
      clearState(computedScope, userId)
    }
    setState(null)
    setTargetRect(null)
  }, [computedScope, userId])

  const startTour = useCallback((nextScope?: TourScope) => {
    const resolvedScope = nextScope || computedScope || scope || resolveScopeFromPath(pathname) || 'artist'
    setSeen(resolvedScope, userId)
    const nextState: TourState = {
      status: 'active',
      scope: resolvedScope,
      stepIndex: 0,
      startedAt: nowIso(),
      updatedAt: nowIso(),
    }
    autoStartedRef.current = resolvedScope
    setTourState(nextState)
    if (!resolveScopeFromPath(pathname)) {
      router.push(TOUR_STEPS[resolvedScope][0].path)
    }
  }, [computedScope, pathname, router, scope, setTourState, userId])

  const restartTour = useCallback((nextScope?: TourScope) => {
    const resolvedScope = nextScope || computedScope || scope || resolveScopeFromPath(pathname) || 'artist'
    setSeen(resolvedScope, userId)
    const nextState: TourState = {
      status: 'active',
      scope: resolvedScope,
      stepIndex: 0,
      startedAt: nowIso(),
      updatedAt: nowIso(),
    }
    autoStartedRef.current = resolvedScope
    setTourState(nextState)
    router.push(TOUR_STEPS[resolvedScope][0].path)
  }, [computedScope, pathname, router, scope, setTourState, userId])

  const pauseTour = useCallback(() => {
    if (!state) return
    const nextState: TourState = {
      ...state,
      status: 'paused',
      pausedAt: nowIso(),
      updatedAt: nowIso(),
    }
    setTourState(nextState)
  }, [state, setTourState])

  const resumeTour = useCallback(() => {
    if (!state) {
      startTour(computedScope || scope || 'artist')
      return
    }

    setSeen(state.scope, userId)
    const nextState: TourState = {
      ...state,
      status: 'active',
      updatedAt: nowIso(),
    }
    setTourState(nextState)
  }, [computedScope, scope, startTour, state, setTourState, userId])

  const skipTour = useCallback(() => {
    if (!state) return
    const nextState: TourState = {
      ...state,
      status: 'completed',
      completedAt: nowIso(),
      updatedAt: nowIso(),
    }
    setTourState(nextState)
  }, [state, setTourState])

  const nextStep = useCallback(() => {
    if (!state || !computedScope) return
    const availableSteps = TOUR_STEPS[computedScope]
    const nextIndex = state.stepIndex + 1

    if (nextIndex >= availableSteps.length) {
      const nextState: TourState = {
        ...state,
        status: 'completed',
        completedAt: nowIso(),
        updatedAt: nowIso(),
      }
      setTourState(nextState)
      return
    }

    const nextState: TourState = {
      ...state,
      status: 'active',
      stepIndex: nextIndex,
      updatedAt: nowIso(),
    }
    setTourState(nextState)
    router.push(availableSteps[nextIndex].path)
  }, [computedScope, router, setTourState, state])

  const previousStep = useCallback(() => {
    if (!state || !computedScope) return
    const nextIndex = Math.max(0, state.stepIndex - 1)
    const availableSteps = TOUR_STEPS[computedScope]
    const nextState: TourState = {
      ...state,
      status: 'active',
      stepIndex: nextIndex,
      updatedAt: nowIso(),
    }
    setTourState(nextState)
    router.push(availableSteps[nextIndex].path)
  }, [computedScope, router, setTourState, state])

  const isActive = state?.status === 'active'
  const isPaused = state?.status === 'paused'
  const isCompleted = state?.status === 'completed'

  useEffect(() => {
    if (!currentStep || !isActive) return

    if (pathname !== currentStep.path && !pathname.startsWith(`${currentStep.path}/`)) {
      router.push(currentStep.path)
    }
  }, [currentStep, isActive, pathname, router])

  const value = useMemo<GuidedTourContextValue>(
    () => ({
      state,
      scope: computedScope,
      currentStep,
      isActive,
      isPaused,
      isCompleted,
      progress,
      startTour,
      restartTour,
      pauseTour,
      resumeTour,
      skipTour,
      nextStep,
      previousStep,
    }),
    [
      computedScope,
      currentStep,
      isActive,
      isCompleted,
      isPaused,
      nextStep,
      pauseTour,
      previousStep,
      progress,
      restartTour,
      resumeTour,
      skipTour,
      startTour,
      state,
    ]
  )

  return (
    <GuidedTourContext.Provider value={value}>
      {children}
      {isActive && currentStep && (
        <TourOverlay
          step={currentStep}
          stepIndex={state?.stepIndex || 0}
          stepsTotal={steps.length}
          rect={targetRect}
          onNext={nextStep}
          onPrevious={previousStep}
          onPause={pauseTour}
          onSkip={skipTour}
        />
      )}
      {isPaused && <TourLauncher onResume={resumeTour} />}
    </GuidedTourContext.Provider>
  )
}

export function useGuidedTour() {
  const context = useContext(GuidedTourContext)
  if (!context) {
    throw new Error('useGuidedTour must be used within a GuidedTourProvider')
  }
  return context
}

export function inferHelpText(label: string) {
  return defaultHelpText(label)
}
