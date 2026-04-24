'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
  applyThemeToDocument,
  resolveTheme,
  THEME_STORAGE_KEY,
} from '@/lib/theme'
import type { Theme } from '@/lib/theme'

interface ThemeContext {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeCtx = createContext<ThemeContext | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'

  // No localStorage key — always respect system preference as the default baseline.
  // Only use saved value if explicitly set (and valid), otherwise fall back to system.
  const saved = localStorage.getItem(THEME_STORAGE_KEY)
  return resolveTheme(saved === '' ? null : saved, window.matchMedia('(prefers-color-scheme: dark)').matches)
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    applyThemeToDocument(theme)
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'dark' ? 'light' : prev === 'light' ? 'dark' : 'light'))
  }

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  return (
    <ThemeCtx.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeCtx.Provider>
  );
}
