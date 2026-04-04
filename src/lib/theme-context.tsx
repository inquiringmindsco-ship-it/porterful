'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'dark' | 'light';

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

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Default to dark — Porterful is a dark-first platform
    const saved = localStorage.getItem('theme') as Theme | null;
    if (saved && saved === 'light') {
      setThemeState('light');
    } else {
      setThemeState('dark');
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Apply theme class to document
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(theme);
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem('theme', theme);
    
    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#0a0a0a' : '#ffffff');
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setThemeState(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  // Prevent hydration mismatch — render children immediately but hidden until mounted
  if (!mounted) {
    return (
      <ThemeCtx.Provider value={{ theme: 'dark', toggleTheme: () => {}, setTheme: () => {} }}>
        <div style={{ visibility: 'hidden' }}>{children}</div>
      </ThemeCtx.Provider>
    );
  }

  return (
    <ThemeCtx.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeCtx.Provider>
  );
}