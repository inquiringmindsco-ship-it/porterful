'use client'

import { useEffect } from 'react'
import { hexToRgbTriplet, type ArtistAppearance } from '@/lib/artist-theme'

interface ArtistThemeBridgeProps {
  appearance: ArtistAppearance | null
}

function setVar(root: HTMLElement, key: string, value: string | null) {
  if (value) {
    root.style.setProperty(key, value)
  } else {
    root.style.removeProperty(key)
  }
}

export function ArtistThemeBridge({ appearance }: ArtistThemeBridgeProps) {
  useEffect(() => {
    if (!appearance) return

    const root = document.documentElement
    const previous = {
      accent: root.style.getPropertyValue('--pf-accent'),
      accentRgb: root.style.getPropertyValue('--pf-accent-rgb'),
    }

    setVar(root, '--pf-accent', appearance.accentColor)
    setVar(root, '--pf-accent-rgb', hexToRgbTriplet(appearance.accentColor))

    return () => {
      setVar(root, '--pf-accent', previous.accent || null)
      setVar(root, '--pf-accent-rgb', previous.accentRgb || null)
    }
  }, [appearance?.accentColor])

  return null
}
