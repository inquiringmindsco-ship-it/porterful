// Client-only accent selector component
// No server rendering - only runs in browser
'use client'

import { useState, useCallback } from 'react'

// Hue values for presets (0-360)
const ACCENT_PRESETS = {
  orange: { h: 24, name: 'Default Orange', icon: '🟠' },
  gold: { h: 43, name: 'Aurum', icon: '🟡' },
  blue: { h: 217, name: 'Ocean', icon: '🔵' },
  forest: { h: 145, name: 'Forest', icon: '🟢' },
  ember: { h: 350, name: 'Ember', icon: '🔴' },
  void: { h: 260, name: 'Void', icon: '🟣' },
} as const

type AccentPreset = keyof typeof ACCENT_PRESETS

const ACCENT_STORAGE_KEY = 'pf-accent-hue'
const LOCKED_SATURATION = 95
const LOCKED_LIGHTNESS = 53

// Clamp hue to valid range
function clampHue(hue: number): number {
  return Math.max(0, Math.min(360, Math.round(hue)))
}

// Apply accent CSS variables to document
function applyAccentToDocument(hue: number) {
  if (typeof document === 'undefined') return
  document.documentElement.style.setProperty('--accent-h', clampHue(hue).toString())
}

interface AccentSelectorProps {
  className?: string
}

export function AccentSelectorClient({ className = '' }: AccentSelectorProps) {
  // Initialize from localStorage on mount only
  const [hue, setHueState] = useState(() => {
    if (typeof window === 'undefined') return ACCENT_PRESETS.orange.h
    try {
      const saved = localStorage.getItem(ACCENT_STORAGE_KEY)
      if (saved) {
        const parsed = parseInt(saved, 10)
        if (!isNaN(parsed)) {
          // Apply immediately on client mount
          applyAccentToDocument(parsed)
          return clampHue(parsed)
        }
      }
    } catch (e) {}
    return ACCENT_PRESETS.orange.h
  })

  const currentPreset = Object.keys(ACCENT_PRESETS).find(
    key => Math.abs(ACCENT_PRESETS[key as AccentPreset].h - hue) <= 5
  ) as AccentPreset | undefined

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newHue = parseInt(e.target.value, 10)
    setHueState(newHue)
    applyAccentToDocument(newHue)
    try {
      localStorage.setItem(ACCENT_STORAGE_KEY, newHue.toString())
    } catch (e) {}
  }, [])

  const handlePresetClick = useCallback((preset: AccentPreset) => {
    const presetHue = ACCENT_PRESETS[preset].h
    setHueState(presetHue)
    applyAccentToDocument(presetHue)
    try {
      localStorage.setItem(ACCENT_STORAGE_KEY, presetHue.toString())
    } catch (e) {}
  }, [])

  const hueGradient = 'linear-gradient(to right, '
    + 'hsl(0,95%,53%), hsl(60,95%,53%), hsl(120,95%,53%), '
    + 'hsl(180,95%,53%), hsl(240,95%,53%), hsl(300,95%,53%), hsl(360,95%,53%))'

  return (
    <div className={`space-y-5 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-[var(--pf-text)]">Accent Color</h3>
          <p className="text-xs text-[var(--pf-text-muted)]">Personalize your experience</p>
        </div>
        <div 
          className="w-10 h-10 rounded-full border-2 border-[var(--pf-border)]"
          style={{ backgroundColor: `hsl(${hue},${LOCKED_SATURATION}%,${LOCKED_LIGHTNESS}%)` }}
        />
      </div>

      {/* Hue Slider */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-[var(--pf-text-secondary)] uppercase">
          Hue Spectrum
        </label>
        
        <input
          type="range"
          min="0"
          max="360"
          value={hue}
          onChange={handleSliderChange}
          className="w-full h-3 rounded-full cursor-pointer"
          style={{
            background: hueGradient,
            WebkitAppearance: 'none',
            appearance: 'none',
          }}
          aria-label="Accent color hue"
        />
      </div>

      {/* Presets */}
      <div className="grid grid-cols-3 gap-2">
        {(Object.entries(ACCENT_PRESETS) as [AccentPreset, typeof ACCENT_PRESETS[AccentPreset]][]).map(([key, value]) => {
          const isActive = currentPreset === key
          return (
            <button
              key={key}
              onClick={() => handlePresetClick(key)}
              className={`
                flex flex-col items-center gap-2 p-3 rounded-lg border transition-all
                ${isActive 
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)]' 
                  : 'border-[var(--pf-border)] bg-[var(--pf-surface)] hover:border-[var(--pf-border-hover)]'
                }
              `}
            >
              <div 
                className="w-8 h-8 rounded-full"
                style={{ backgroundColor: `hsl(${value.h},${LOCKED_SATURATION}%,${LOCKED_LIGHTNESS}%)` }}
              />
              <span className={`text-xs font-medium ${isActive ? 'text-[var(--accent)]' : 'text-[var(--pf-text-secondary)]'}`}>
                {value.name}
              </span>
            </button>
          )
        })}
      </div>

      {/* Current */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)]">
        <div className="flex items-center gap-3">
          <div 
            className="w-6 h-6 rounded-full"
            style={{ backgroundColor: `hsl(${hue},${LOCKED_SATURATION}%,${LOCKED_LIGHTNESS}%)` }}
          />
          <span className="text-sm font-mono">hsl({hue}, {LOCKED_SATURATION}%, {LOCKED_LIGHTNESS}%)</span>
        </div>
        
        <button
          onClick={() => handlePresetClick('orange')}
          className="text-xs text-[var(--pf-text-muted)] hover:text-[var(--pf-text)]"
        >
          Reset
        </button>
      </div>
    </div>
  )
}

// Preview component
export function AccentPreview() {
  // Read current accent from CSS variable
  const [hue, setHue] = useState(24)
  
  // Update from CSS variable on mount
  useState(() => {
    if (typeof window === 'undefined') return 24
    const root = getComputedStyle(document.documentElement)
    const hueValue = root.getPropertyValue('--accent-h').trim()
    return hueValue ? parseInt(hueValue, 10) || 24 : 24
  })

  return (
    <div className="space-y-4 p-4 rounded-lg border border-[var(--pf-border)] bg-[var(--pf-bg-secondary)]">
      <p className="text-xs font-medium text-[var(--pf-text-muted)] uppercase">Preview</p>
      
      <button 
        className="w-full px-4 py-2.5 rounded-lg font-medium text-sm"
        style={{
          backgroundColor: `hsl(${hue},${LOCKED_SATURATION}%,${LOCKED_LIGHTNESS}%)`,
          color: '#111111',
        }}
      >
        Primary Action
      </button>
      
      <button 
        className="w-full px-4 py-2.5 rounded-lg font-medium text-sm border"
        style={{
          borderColor: `hsla(${hue},${LOCKED_SATURATION}%,${LOCKED_LIGHTNESS}%,0.5)`,
          color: `hsl(${hue},${LOCKED_SATURATION}%,${LOCKED_LIGHTNESS}%)`,
        }}
      >
        Secondary Action
      </button>
      
      <a href="#" className="text-sm hover:underline" style={{ color: `hsl(${hue},${LOCKED_SATURATION}%,${LOCKED_LIGHTNESS}%)` }}>
        Text link example
      </a>
    </div>
  )
}
