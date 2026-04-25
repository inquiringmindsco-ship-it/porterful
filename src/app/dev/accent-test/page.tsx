// Hidden test route for AccentSelector
// No Settings integration, no bootstrap script
'use client'

import { useState, useCallback } from 'react'

const ACCENT_PRESETS = {
  orange: { h: 24, name: 'Default Orange' },
  gold: { h: 43, name: 'Gold' },
  blue: { h: 217, name: 'Blue' },
  forest: { h: 145, name: 'Forest' },
  ember: { h: 350, name: 'Ember' },
  void: { h: 260, name: 'Void' },
} as const

type AccentPreset = keyof typeof ACCENT_PRESETS

const ACCENT_STORAGE_KEY = 'pf-accent-hue'
const LOCKED_SATURATION = 95
const LOCKED_LIGHTNESS = 53

function clampHue(hue: number): number {
  return Math.max(0, Math.min(360, Math.round(hue)))
}

function applyAccentToDocument(hue: number) {
  if (typeof document === 'undefined') return
  document.documentElement.style.setProperty('--accent-h', clampHue(hue).toString())
}

export default function AccentTestPage() {
  const [hue, setHueState] = useState(() => {
    if (typeof window === 'undefined') return ACCENT_PRESETS.orange.h
    try {
      const saved = localStorage.getItem(ACCENT_STORAGE_KEY)
      if (saved) {
        const parsed = parseInt(saved, 10)
        if (!isNaN(parsed)) return clampHue(parsed)
      }
    } catch (e) {}
    return ACCENT_PRESETS.orange.h
  })

  const setHue = useCallback((newHue: number) => {
    const clamped = clampHue(newHue)
    setHueState(clamped)
    applyAccentToDocument(clamped)
    try {
      localStorage.setItem(ACCENT_STORAGE_KEY, clamped.toString())
    } catch (e) {}
  }, [])

  const handlePresetClick = useCallback((preset: AccentPreset) => {
    setHue(ACCENT_PRESETS[preset].h)
  }, [setHue])

  const hueGradient = 'linear-gradient(to right, hsl(0,95%,53%), hsl(60,95%,53%), hsl(120,95%,53%), hsl(180,95%,53%), hsl(240,95%,53%), hsl(300,95%,53%), hsl(360,95%,53%))'

  return (
    <div className="min-h-screen bg-[var(--pf-bg)] text-[var(--pf-text)] py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium mb-4">
            ⚠️ DEV TEST PAGE
          </div>
          <h1 className="text-3xl font-bold mb-2">Accent System Test</h1>
          <p className="text-[var(--pf-text-muted)]">
            Test accent color system in isolation. Changes persist to localStorage.
          </p>
        </div>

        {/* Status */}
        <div className="mb-8 p-4 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)]">
          <h2 className="font-semibold mb-2">Current Status</h2>
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-full border-2 border-[var(--pf-border)]"
              style={{ backgroundColor: `hsl(${hue},${LOCKED_SATURATION}%,${LOCKED_LIGHTNESS}%)` }}
            />
            <div>
              <p className="font-mono text-sm">hsl({hue}, {LOCKED_SATURATION}%, {LOCKED_LIGHTNESS}%)</p>
              <p className="text-xs text-[var(--pf-text-muted)]">localStorage: pf-accent-hue</p>
            </div>
          </div>
        </div>

        {/* Hue Slider */}
        <div className="mb-8 p-6 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)]">
          <h2 className="font-semibold mb-4">Hue Spectrum</h2>
          <input
            type="range"
            min="0"
            max="360"
            value={hue}
            onChange={(e) => setHue(parseInt(e.target.value, 10))}
            className="w-full h-3 rounded-full cursor-pointer"
            style={{
              background: hueGradient,
              WebkitAppearance: 'none',
              appearance: 'none',
            }}
          />
          <div className="flex justify-between mt-2 text-xs text-[var(--pf-text-muted)]">
            <span>Red</span>
            <span>Yellow</span>
            <span>Green</span>
            <span>Cyan</span>
            <span>Blue</span>
            <span>Purple</span>
            <span>Red</span>
          </div>
        </div>

        {/* Presets */}
        <div className="mb-8 p-6 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)]">
          <h2 className="font-semibold mb-4">Presets</h2>
          <div className="grid grid-cols-3 gap-3">
            {(Object.entries(ACCENT_PRESETS) as [AccentPreset, typeof ACCENT_PRESETS[AccentPreset]][]).map(([key, value]) => (
              <button
                key={key}
                onClick={() => handlePresetClick(key)}
                className="flex flex-col items-center gap-2 p-3 rounded-lg border border-[var(--pf-border)] hover:border-[var(--accent)] transition-colors"
              >
                <div 
                  className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: `hsl(${value.h},${LOCKED_SATURATION}%,${LOCKED_LIGHTNESS}%)` }}
                />
                <span className="text-xs">{value.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="p-6 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)]">
          <h2 className="font-semibold mb-4">Preview</h2>
          <div className="space-y-3">
            <button 
              className="w-full px-4 py-2.5 rounded-lg font-medium text-sm text-[#111111]"
              style={{ backgroundColor: `hsl(${hue},${LOCKED_SATURATION}%,${LOCKED_LIGHTNESS}%)` }}
            >
              Primary Button
            </button>
            <button 
              className="w-full px-4 py-2.5 rounded-lg font-medium text-sm border"
              style={{ 
                borderColor: `hsla(${hue},${LOCKED_SATURATION}%,${LOCKED_LIGHTNESS}%,0.5)`,
                color: `hsl(${hue},${LOCKED_SATURATION}%,${LOCKED_LIGHTNESS}%)`
              }}
            >
              Secondary Button
            </button>
            <a 
              href="#" 
              className="text-sm hover:underline"
              style={{ color: `hsl(${hue},${LOCKED_SATURATION}%,${LOCKED_LIGHTNESS}%)` }}
              onClick={(e) => e.preventDefault()}
            >
              Text link example
            </a>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-4 rounded-lg bg-[var(--pf-bg-secondary)] border border-[var(--pf-border)]">
          <h3 className="font-medium mb-2">Test Instructions</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-[var(--pf-text-muted)]">
            <li>Change hue using slider or presets</li>
            <li>Reload page - accent should persist</li>
            <li>Check localStorage: <code>localStorage.getItem('pf-accent-hue')</code></li>
            <li>Verify no hydration errors in console</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
