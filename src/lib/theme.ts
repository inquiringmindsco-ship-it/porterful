export const THEMES = ['light', 'dark'] as const

export type Theme = (typeof THEMES)[number]

export const THEME_STORAGE_KEY = 'theme'

const THEME_CLASS_NAMES = [...THEMES] as const

const THEME_COLOR_MAP: Record<Theme, string> = {
  light: '#ffffff',
  dark: '#111111',
}

export function isTheme(value: unknown): value is Theme {
  return typeof value === 'string' && (THEMES as readonly string[]).includes(value)
}

export function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function getThemeColor(theme: Theme): string {
  return THEME_COLOR_MAP[theme]
}

export function applyThemeToDocument(theme: Theme) {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  root.classList.remove(...THEME_CLASS_NAMES)
  root.classList.add(theme)
  root.style.colorScheme = theme
  root.style.background = getThemeColor(theme)

  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', getThemeColor(theme))
  }
}

// Bootstrap script runs before React hydration to prevent flash
// ALWAYS respect system preference — no manual override unless explicitly set
export function getThemeBootstrapScript() {
  return `(function(){
    try {
      var key = '${THEME_STORAGE_KEY}';
      var saved = localStorage.getItem(key);
      var systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // Only use saved value if it's explicitly 'light' or 'dark'
      // Otherwise follow system preference
      var theme = (saved === 'light' || saved === 'dark') ? saved : (systemDark ? 'dark' : 'light');
      
      var root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
      root.style.colorScheme = theme;
      root.style.background = theme === 'dark' ? '#111111' : '#ffffff';
      
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', theme === 'dark' ? '#111111' : '#ffffff');
      
      // Listen for system theme changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
        // Only auto-switch if user hasn't explicitly set a preference
        var userSaved = localStorage.getItem('${THEME_STORAGE_KEY}');
        if (userSaved !== 'light' && userSaved !== 'dark') {
          var newTheme = e.matches ? 'dark' : 'light';
          root.classList.remove('light', 'dark');
          root.classList.add(newTheme);
          root.style.colorScheme = newTheme;
          root.style.background = e.matches ? '#111111' : '#ffffff';
          if (meta) meta.setAttribute('content', e.matches ? '#111111' : '#ffffff');
        }
      });
    } catch (e) {}
  })();`
}
