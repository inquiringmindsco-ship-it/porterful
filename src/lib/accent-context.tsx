'use client'

// Runtime accent system.
//
// Sets --pf-accent (hex) and --pf-accent-rgb (R G B triplet) on
// document.documentElement. The legacy --pf-orange / --pf-orange-dark
// / --pf-orange-light tokens are aliased to --pf-accent in globals.css,
// so changing the accent automatically recolors every existing
// `var(--pf-orange)` reference (~700 sites) without per-component edits.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

const STORAGE_KEY = 'pf-accent'

export const ACCENT_PRESETS = [
  { id: 'orange', name: 'Porterful Orange', hex: '#f97316' },
  { id: 'blue', name: 'Blue', hex: '#3b82f6' },
  { id: 'red', name: 'Red', hex: '#ef4444' },
  { id: 'purple', name: 'Purple', hex: '#a855f7' },
  { id: 'green', name: 'Green', hex: '#22c55e' },
  { id: 'gold', name: 'Gold', hex: '#eab308' },
  { id: 'neutral', name: 'White / Neutral', hex: '#e5e5e5' },
] as const

export type AccentPresetId = (typeof ACCENT_PRESETS)[number]['id']

const DEFAULT_HEX = ACCENT_PRESETS[0].hex

interface AccentContextValue {
  accent: string
  presets: typeof ACCENT_PRESETS
  setAccent: (hex: string) => void
  resetAccent: () => void
}

const AccentCtx = createContext<AccentContextValue | null>(null)

function normalizeHex(input: string | null | undefined): string | null {
  if (!input) return null
  const v = input.trim().toLowerCase()
  if (/^#([0-9a-f]{6})$/.test(v)) return v
  if (/^#([0-9a-f]{3})$/.test(v)) {
    // expand short hex
    const r = v[1]
    const g = v[2]
    const b = v[3]
    return `#${r}${r}${g}${g}${b}${b}`
  }
  return null
}

function hexToRgbTriplet(hex: string): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `${r} ${g} ${b}`
}

function applyAccent(hex: string) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.style.setProperty('--pf-accent', hex)
  root.style.setProperty('--pf-accent-rgb', hexToRgbTriplet(hex))
}

function readSavedAccent(): string {
  if (typeof window === 'undefined') return DEFAULT_HEX
  try {
    const saved = normalizeHex(window.localStorage.getItem(STORAGE_KEY))
    if (saved) return saved
  } catch {
    // localStorage may be unavailable (private mode); fall through
  }
  return DEFAULT_HEX
}

export function AccentProvider({ children }: { children: ReactNode }) {
  const [accent, setAccentState] = useState<string>(DEFAULT_HEX)

  // Hydrate from storage on mount + apply (avoids SSR/CSR mismatch since
  // SSR has no access to localStorage). Default token in CSS already
  // renders Porterful Orange before hydration so there's no flash.
  useEffect(() => {
    const initial = readSavedAccent()
    setAccentState(initial)
    applyAccent(initial)
  }, [])

  const setAccent = useCallback((hex: string) => {
    const normalized = normalizeHex(hex)
    if (!normalized) return
    setAccentState(normalized)
    applyAccent(normalized)
    try {
      window.localStorage.setItem(STORAGE_KEY, normalized)
    } catch {
      // ignore — accent still applies for the session
    }
  }, [])

  const resetAccent = useCallback(() => {
    setAccentState(DEFAULT_HEX)
    applyAccent(DEFAULT_HEX)
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }, [])

  const value = useMemo<AccentContextValue>(
    () => ({ accent, presets: ACCENT_PRESETS, setAccent, resetAccent }),
    [accent, setAccent, resetAccent]
  )

  return <AccentCtx.Provider value={value}>{children}</AccentCtx.Provider>
}

export function useAccent(): AccentContextValue {
  const ctx = useContext(AccentCtx)
  if (!ctx) {
    return {
      accent: DEFAULT_HEX,
      presets: ACCENT_PRESETS,
      setAccent: () => {},
      resetAccent: () => {},
    }
  }
  return ctx
}
