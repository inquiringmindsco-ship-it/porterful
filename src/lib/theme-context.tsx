'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { applyThemeToDocument, getSystemTheme, isTheme, THEME_STORAGE_KEY } from '@/lib/theme'
import type { Theme } from '@/lib/theme'

interface ThemeContext {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeCtx = createContext<ThemeContext | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

// Clear any legacy theme values that might conflict
function cleanLegacyTheme() {
  if (typeof window === 'undefined') return
  // Remove 'creator' theme if it exists (legacy)
  const saved = localStorage.getItem(THEME_STORAGE_KEY)
  if (saved === 'creator') {
    localStorage.removeItem(THEME_STORAGE_KEY)
  }
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  
  cleanLegacyTheme()
  
  const saved = localStorage.getItem(THEME_STORAGE_KEY)
  // Only use saved value if explicitly 'light' or 'dark'
  if (isTheme(saved)) {
    return saved
  }
  
  // Otherwise follow system preference
  return getSystemTheme()
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      const saved = localStorage.getItem(THEME_STORAGE_KEY)
      // Only auto-switch if user hasn't explicitly set a preference
      if (!isTheme(saved)) {
        const newTheme = e.matches ? 'dark' : 'light'
        setThemeState(newTheme)
        applyThemeToDocument(newTheme)
      }
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    applyThemeToDocument(theme)
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  return (
    <ThemeCtx.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeCtx.Provider>
  );
}
