export const THEMES = ['light', 'dark', 'creator'] as const

export type Theme = (typeof THEMES)[number]

export const THEME_STORAGE_KEY = 'theme'

const THEME_CLASS_NAMES = [...THEMES] as const

const THEME_COLOR_MAP: Record<Theme, string> = {
  light: '#ffffff',
  dark: '#111111',
  creator: '#fcfbf7',
}

const THEME_COLOR_SCHEME_MAP: Record<Theme, 'light' | 'dark'> = {
  light: 'light',
  dark: 'dark',
  creator: 'light',
}

export function isTheme(value: unknown): value is Theme {
  return typeof value === 'string' && (THEMES as readonly string[]).includes(value)
}

export function resolveTheme(savedTheme: string | null | undefined, prefersDark: boolean): Theme {
  // Explicitly saved theme (light/dark/creator) always wins — user made a choice
  if (isTheme(savedTheme)) {
    return savedTheme
  }

  // No saved preference — fall back to system setting
  return prefersDark ? 'dark' : 'light'
}

export function getThemeColor(theme: Theme): string {
  return THEME_COLOR_MAP[theme]
}

export function getThemeColorScheme(theme: Theme): 'light' | 'dark' {
  return THEME_COLOR_SCHEME_MAP[theme]
}

export function applyThemeToDocument(theme: Theme) {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  root.classList.remove(...THEME_CLASS_NAMES)
  root.classList.add(theme)
  root.style.colorScheme = getThemeColorScheme(theme)
  root.style.background = getThemeColor(theme)

  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', getThemeColor(theme))
  }
}

export function getThemeBootstrapScript() {
  return `(function(){try{var key='${THEME_STORAGE_KEY}';var saved=localStorage.getItem(key);var theme=(saved==='light'||saved==='dark'||saved==='creator')?saved:(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');var root=document.documentElement;root.classList.remove('light','dark','creator');root.classList.add(theme);root.style.colorScheme=theme==='creator'?'light':theme;root.style.background=theme==='creator'?'#fcfbf7':theme==='dark'?'#111111':'#ffffff';var meta=document.querySelector('meta[name=\"theme-color\"]');if(meta)meta.setAttribute('content',theme==='creator'?'#fcfbf7':theme==='dark'?'#111111':'#ffffff');}catch(e){}})();`
}
