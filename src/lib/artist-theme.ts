import type { CSSProperties } from 'react'

export type ArtistAvatarShape = 'circle' | 'square' | 'rounded-square'
export type ArtistAvatarFocus = 'center-face' | 'top-focus' | 'manual'
export type ArtistBackgroundStyle =
  | 'midnight'
  | 'warm'
  | 'earth'
  | 'cream'
  | 'charcoal'

export type ArtistColorMode = 'light' | 'dark'

export interface ArtistAppearance {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundStyle: ArtistBackgroundStyle
  colorMode: ArtistColorMode
  profileImageShape?: ArtistAvatarShape
  profileImageFocus?: ArtistAvatarFocus
  profileImagePosition?: string
}

export type ArtistThemeColors = Pick<
  ArtistAppearance,
  'primaryColor' | 'secondaryColor' | 'accentColor' | 'backgroundStyle' | 'colorMode'
> & {
  backgroundColor: string
  backgroundSecondaryColor: string
  surfaceColor: string
  surfaceHoverColor: string
  borderColor: string
  borderSubtleColor: string
  borderHoverColor: string
  textColor: string
  textSecondaryColor: string
  textMutedColor: string
}

const DARK_BASE: Omit<ArtistThemeColors, keyof ArtistAppearance> = {
  backgroundColor: '#0f0f10',
  backgroundSecondaryColor: '#151517',
  surfaceColor: '#1a1a1d',
  surfaceHoverColor: '#212126',
  borderColor: '#2a2a2e',
  borderSubtleColor: '#242428',
  borderHoverColor: '#38383e',
  textColor: '#ffffff',
  textSecondaryColor: '#d0d0d6',
  textMutedColor: '#9d9da6',
}

const LIGHT_BASE: Omit<ArtistThemeColors, keyof ArtistAppearance> = {
  backgroundColor: '#f9f7f1',
  backgroundSecondaryColor: '#f2ede3',
  surfaceColor: '#fffdfa',
  surfaceHoverColor: '#f7f3ea',
  borderColor: '#e6ded1',
  borderSubtleColor: '#efe7da',
  borderHoverColor: '#d8cfbf',
  textColor: '#161616',
  textSecondaryColor: '#4f4f56',
  textMutedColor: '#70707a',
}

export const ARTIST_THEME_PRESETS: Record<string, ArtistAppearance> = {
  'o d porter': {
    primaryColor: '#f97316',
    secondaryColor: '#111111',
    accentColor: '#f4b860',
    backgroundStyle: 'warm',
    colorMode: 'dark',
    profileImageShape: 'circle',
    profileImageFocus: 'center-face',
  },
  'od-porter': {
    primaryColor: '#f97316',
    secondaryColor: '#111111',
    accentColor: '#f4b860',
    backgroundStyle: 'warm',
    colorMode: 'dark',
    profileImageShape: 'circle',
    profileImageFocus: 'center-face',
  },
  'atm trap': {
    primaryColor: '#1a1a1a',
    secondaryColor: '#D4A853',
    accentColor: '#FF6B35',
    backgroundStyle: 'charcoal',
    colorMode: 'dark',
    profileImageShape: 'circle',
    profileImageFocus: 'center-face',
  },
  'atm-trap': {
    primaryColor: '#1a1a1a',
    secondaryColor: '#D4A853',
    accentColor: '#FF6B35',
    backgroundStyle: 'charcoal',
    colorMode: 'dark',
    profileImageShape: 'circle',
    profileImageFocus: 'center-face',
  },
  gune: {
    primaryColor: '#9f1239',
    secondaryColor: '#111111',
    accentColor: '#f59e0b',
    backgroundStyle: 'midnight',
    colorMode: 'dark',
    profileImageShape: 'circle',
    profileImageFocus: 'center-face',
  },
  'rob soule': {
    primaryColor: '#7c3aed',
    secondaryColor: '#111111',
    accentColor: '#f4b860',
    backgroundStyle: 'earth',
    colorMode: 'dark',
    profileImageShape: 'circle',
    profileImageFocus: 'center-face',
  },
  'noble naturals': {
    primaryColor: '#14532d',
    secondaryColor: '#f4cf63',
    accentColor: '#6ee7b7',
    backgroundStyle: 'cream',
    colorMode: 'light',
    profileImageShape: 'rounded-square',
    profileImageFocus: 'center-face',
  },
  'marvelous black': {
    primaryColor: '#0b0b0b',
    secondaryColor: '#d4af37',
    accentColor: '#f6e7c4',
    backgroundStyle: 'charcoal',
    colorMode: 'dark',
    profileImageShape: 'rounded-square',
    profileImageFocus: 'center-face',
  },
}

function normalizeHex(input: string | null | undefined) {
  if (!input) return null
  const value = input.trim().toLowerCase()
  if (/^#([0-9a-f]{6})$/.test(value)) return value
  if (/^#([0-9a-f]{3})$/.test(value)) {
    const hex = value.slice(1)
    const r = hex.charAt(0)
    const g = hex.charAt(1)
    const b = hex.charAt(2)
    return `#${r}${r}${g}${g}${b}${b}`
  }
  return null
}

export function hexToRgbTriplet(hex: string) {
  const value = normalizeHex(hex) || '#f97316'
  const h = value.slice(1)
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `${r} ${g} ${b}`
}

export function normalizeArtistAppearance(
  value: any,
  fallback?: Partial<ArtistAppearance> | null,
): ArtistAppearance | null {
  if (!value && !fallback) return null

  const input = value && typeof value === 'object' ? value : {}
  const fb = fallback || {}

  const primaryColor = normalizeHex(input.primaryColor || input.primary_color || fb.primaryColor || '') || '#f97316'
  const secondaryColor = normalizeHex(input.secondaryColor || input.secondary_color || fb.secondaryColor || '') || '#111111'
  const accentColor = normalizeHex(input.accentColor || input.accent_color || fb.accentColor || '') || primaryColor
  const backgroundStyle = String(input.backgroundStyle || input.background_style || fb.backgroundStyle || 'midnight').trim().toLowerCase() as ArtistBackgroundStyle
  const colorMode = String(input.colorMode || input.color_mode || fb.colorMode || 'dark').trim().toLowerCase() as ArtistColorMode

  const profileImageShape = String(input.profileImageShape || input.profile_image_shape || fb.profileImageShape || 'circle').trim().toLowerCase() as ArtistAvatarShape
  const profileImageFocus = String(input.profileImageFocus || input.profile_image_focus || fb.profileImageFocus || 'center-face').trim().toLowerCase() as ArtistAvatarFocus
  const profileImagePosition = String(input.profileImagePosition || input.profile_image_position || fb.profileImagePosition || '').trim() || undefined

  return {
    primaryColor,
    secondaryColor,
    accentColor,
    backgroundStyle: ['midnight', 'warm', 'earth', 'cream', 'charcoal'].includes(backgroundStyle)
      ? backgroundStyle
      : 'midnight',
    colorMode: colorMode === 'light' ? 'light' : 'dark',
    profileImageShape: ['circle', 'square', 'rounded-square'].includes(profileImageShape)
      ? profileImageShape
      : 'circle',
    profileImageFocus: ['center-face', 'top-focus', 'manual'].includes(profileImageFocus)
      ? profileImageFocus
      : 'center-face',
    profileImagePosition,
  }
}

export function resolveArtistAppearance(
  seed?: string | null,
  value?: any,
  fallback?: Partial<ArtistAppearance> | null,
): ArtistAppearance {
  const normalizedSeed = seed?.trim().toLowerCase() || ''
  const preset = normalizedSeed ? ARTIST_THEME_PRESETS[normalizedSeed] : null
  return normalizeArtistAppearance(value, preset || fallback || undefined) || {
    primaryColor: '#f97316',
    secondaryColor: '#111111',
    accentColor: '#f97316',
    backgroundStyle: 'midnight',
    colorMode: 'dark',
    profileImageShape: 'circle',
    profileImageFocus: 'center-face',
  }
}

export function getArtistThemeClass(appearance: ArtistAppearance) {
  if (appearance.backgroundStyle === 'cream') return 'artist-theme-cream'
  if (appearance.backgroundStyle === 'earth') return 'artist-theme-earth'
  if (appearance.backgroundStyle === 'warm') return 'artist-theme-warm'
  if (appearance.backgroundStyle === 'charcoal') return 'artist-theme-charcoal'
  return 'artist-theme-midnight'
}

export function getArtistThemeStyles(appearance: ArtistAppearance): CSSProperties {
  const palette = appearance.colorMode === 'light' ? LIGHT_BASE : DARK_BASE
  return {
    '--pf-accent': appearance.accentColor,
    '--pf-accent-rgb': hexToRgbTriplet(appearance.accentColor),
    '--artist-primary': appearance.primaryColor,
    '--artist-primary-rgb': hexToRgbTriplet(appearance.primaryColor),
    '--artist-secondary': appearance.secondaryColor,
    '--artist-secondary-rgb': hexToRgbTriplet(appearance.secondaryColor),
    '--pf-bg': palette.backgroundColor,
    '--pf-bg-secondary': palette.backgroundSecondaryColor,
    '--pf-surface': palette.surfaceColor,
    '--pf-surface-hover': palette.surfaceHoverColor,
    '--pf-border': palette.borderColor,
    '--pf-border-subtle': palette.borderSubtleColor,
    '--pf-border-hover': palette.borderHoverColor,
    '--pf-text': palette.textColor,
    '--pf-text-secondary': palette.textSecondaryColor,
    '--pf-text-muted': palette.textMutedColor,
  } as CSSProperties
}

export function getArtistAvatarObjectPosition(appearance?: ArtistAppearance | null) {
  if (!appearance) return '50% 50%'
  if (appearance.profileImageFocus === 'top-focus') return '50% 18%'
  if (appearance.profileImageFocus === 'manual' && appearance.profileImagePosition) {
    return appearance.profileImagePosition
  }
  return '50% 42%'
}
