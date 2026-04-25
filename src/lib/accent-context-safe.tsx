// Safe Accent Context - no server-side rendering
// All state managed client-side after mount
'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'

const ACCENT_STORAGE_KEY = 'pf-accent-hue'
const DEFAULT_HUE = 24 // Orange

interface AccentContextType {
  hue: number
  setHue: (hue: number) => void
}

const AccentCtx = createContext<AccentContextType>({ hue: DEFAULT_HUE, setHue: () => {} })

export function useAccent() {
  return useContext(AccentCtx)
}

// Apply CSS variable to document
function applyHue(hue: number) {
  if (typeof document === 'undefined') return
  document.documentElement.style.setProperty('--accent-h', hue.toString())
}

interface AccentProviderProps {
  children: ReactNode
}

export function AccentProvider({ children }: AccentProviderProps) {
  // Start with default to avoid hydration mismatch
  const [hue, setHueState] = useState(DEFAULT_HUE)
  const [mounted, setMounted] = useState(false)

  // Load from localStorage after mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(ACCENT_STORAGE_KEY)
      if (saved) {
        const parsed = parseInt(saved, 10)
        if (!isNaN(parsed)) {
          setHueState(parsed)
          applyHue(parsed)
        }
      }
    } catch (e) {
      // localStorage unavailable
    }
    setMounted(true)
  }, [])

  const setHue = useCallback((newHue: number) => {
    const clamped = Math.max(0, Math.min(360, Math.round(newHue)))
    setHueState(clamped)
    applyHue(clamped)
    try {
      localStorage.setItem(ACCENT_STORAGE_KEY, clamped.toString())
    } catch (e) {}
  }, [])

  return (
    <AccentCtx.Provider value={{ hue, setHue }}>
      {children}
    </AccentCtx.Provider>
  )
}
