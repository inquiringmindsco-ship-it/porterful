'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

const ACCENT_STORAGE_KEY = 'pf-accent-hue'
const DEFAULT_HUE = 24

interface AccentContextType {
  hue: number
}

const AccentCtx = createContext<AccentContextType>({ hue: DEFAULT_HUE })

export function useAccent() {
  return useContext(AccentCtx)
}

interface AccentProviderProps {
  children: ReactNode
}

export function AccentProvider({ children }: AccentProviderProps) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    try {
      const saved = localStorage.getItem(ACCENT_STORAGE_KEY)
      if (saved) {
        const hue = parseInt(saved, 10)
        if (!isNaN(hue)) {
          document.documentElement.style.setProperty('--accent-h', hue.toString())
        }
      }
    } catch (e) {}
    setMounted(true)
  }, [])

  return (
    <AccentCtx.Provider value={{ hue: DEFAULT_HUE }}>
      {children}
    </AccentCtx.Provider>
  )
}
