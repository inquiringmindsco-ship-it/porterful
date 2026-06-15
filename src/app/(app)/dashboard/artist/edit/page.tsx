'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, ChevronRight, Palette, ImageIcon, Sparkles } from 'lucide-react'
import { useSupabase } from '@/app/providers'
import { ArtistAvatar } from '@/components/artist/ArtistAvatar'
import {
  getArtistThemeStyles,
  getArtistAvatarObjectPosition,
  normalizeArtistAppearance,
  type ArtistAppearance,
} from '@/lib/artist-theme'

const BACKGROUND_STYLES: Array<{ value: ArtistAppearance['backgroundStyle']; label: string; description: string }> = [
  { value: 'midnight', label: 'Midnight', description: 'Dark, polished, and cinematic.' },
  { value: 'warm', label: 'Warm', description: 'Amber glow with a softer edge.' },
  { value: 'earth', label: 'Earth', description: 'Natural and grounded tones.' },
  { value: 'cream', label: 'Cream', description: 'Bright, soft, and airy.' },
  { value: 'charcoal', label: 'Charcoal', description: 'Deep contrast with premium weight.' },
]

const IMAGE_SHAPES: Array<{ value: NonNullable<ArtistAppearance['profileImageShape']>; label: string }> = [
  { value: 'circle', label: 'Circle' },
  { value: 'square', label: 'Square' },
  { value: 'rounded-square', label: 'Rounded Square' },
]

const IMAGE_FOCUS: Array<{ value: NonNullable<ArtistAppearance['profileImageFocus']>; label: string; position: string }> = [
  { value: 'center-face', label: 'Center Face', position: '50% 42%' },
  { value: 'top-focus', label: 'Top Focus', position: '50% 18%' },
  { value: 'manual', label: 'Manual Position', position: '50% 42%' },
]

function buildAppearanceState(source: any, seedLabel: string): ArtistAppearance {
  return normalizeArtistAppearance(source, {
    primaryColor: seedLabel.toLowerCase().includes('noble') ? '#14532d' : '#f97316',
    secondaryColor: seedLabel.toLowerCase().includes('noble') ? '#f4cf63' : '#111111',
    accentColor: seedLabel.toLowerCase().includes('noble') ? '#6ee7b7' : '#f4b860',
    backgroundStyle: seedLabel.toLowerCase().includes('noble') ? 'cream' : 'midnight',
    colorMode: seedLabel.toLowerCase().includes('noble') ? 'light' : 'dark',
    profileImageShape: 'circle',
    profileImageFocus: 'center-face',
  }) || {
    primaryColor: '#f97316',
    secondaryColor: '#111111',
    accentColor: '#f4b860',
    backgroundStyle: 'midnight',
    colorMode: 'dark',
    profileImageShape: 'circle',
    profileImageFocus: 'center-face',
  }
}

export default function ArtistAppearancePage() {
  const router = useRouter()
  const { user, supabase, loading: authLoading } = useSupabase()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [artistName, setArtistName] = useState('Your artist')
  const [artistImage, setArtistImage] = useState<string | null>(null)
  const [artistSlug, setArtistSlug] = useState<string>('')
  const [appearance, setAppearance] = useState<ArtistAppearance>({
    primaryColor: '#f97316',
    secondaryColor: '#111111',
    accentColor: '#f4b860',
    backgroundStyle: 'midnight',
    colorMode: 'dark',
    profileImageShape: 'circle',
    profileImageFocus: 'center-face',
    profileImagePosition: '50% 42%',
  })

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login')
      return
    }

    async function loadArtist() {
      if (!supabase || !user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, role, full_name, username, avatar_url, cover_url')
        .eq('id', user.id)
        .single()

      if (!profile || !['artist', 'admin', 'founder'].includes(profile.role)) {
        router.push('/dashboard')
        return
      }

      const { data: artistRow, error: artistError } = await supabase
        .from('artists')
        .select('id, name, slug, avatar_url, cover_url, social_links')
        .eq('id', user.id)
        .maybeSingle()

      if (artistError) {
        setError(artistError.message || 'Failed to load appearance settings')
      }

      const artistLabel = artistRow?.name || profile.full_name || profile.username || 'Your artist'
      const image = artistRow?.avatar_url || artistRow?.cover_url || profile.avatar_url || profile.cover_url || null
      const sourceAppearance = (artistRow?.social_links as any)?.appearance

      setArtistName(artistLabel)
      setArtistImage(image)
      setArtistSlug(artistRow?.slug || profile.username || '')
      setAppearance(buildAppearanceState(sourceAppearance, artistLabel))
      setLoading(false)
    }

    void loadArtist()
  }, [authLoading, router, supabase, user])

  const previewStyle = useMemo(() => getArtistThemeStyles(appearance), [appearance])
  const manualPosition = appearance.profileImagePosition || getArtistAvatarObjectPosition(appearance)

  async function saveSettings() {
    if (!supabase || !user) return
    setSaving(true)
    setError('')
    setNotice('')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`/api/artists/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token || ''}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          appearance,
          appearance_settings: appearance,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save appearance settings')
      }

      setAppearance(buildAppearanceState(data?.profile?.appearance || appearance, artistName))
      setNotice('Appearance updated.')
      window.setTimeout(() => setNotice(''), 2200)
    } catch (err: any) {
      setError(err.message || 'Failed to save appearance settings')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-2 text-[var(--pf-text-muted)]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--pf-orange)]" />
          Preparing appearance settings
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="pf-container max-w-6xl space-y-8">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/artist" className="p-2 rounded-lg hover:bg-[var(--pf-surface)] transition-colors">
            <ArrowLeft size={20} className="text-[var(--pf-text-secondary)]" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Appearance</h1>
            <p className="text-sm text-[var(--pf-text-secondary)]">
              Shape your artist page, player accents, and highlight cards.
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}
        {notice && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">
            {notice}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <section className="pf-card p-5 space-y-5">
              <div className="flex items-center gap-2">
                <Palette size={18} className="text-[var(--pf-orange)]" />
                <h2 className="text-lg font-semibold">Theme colors</h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <ColorField
                  label="Primary color"
                  value={appearance.primaryColor}
                  onChange={(value) => setAppearance((current) => ({ ...current, primaryColor: value }))}
                />
                <ColorField
                  label="Secondary color"
                  value={appearance.secondaryColor}
                  onChange={(value) => setAppearance((current) => ({ ...current, secondaryColor: value }))}
                />
                <ColorField
                  label="Accent color"
                  value={appearance.accentColor}
                  onChange={(value) => setAppearance((current) => ({ ...current, accentColor: value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Background style</label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {BACKGROUND_STYLES.map((style) => {
                    const isActive = appearance.backgroundStyle === style.value
                    return (
                      <button
                        key={style.value}
                        type="button"
                        onClick={() => setAppearance((current) => ({ ...current, backgroundStyle: style.value }))}
                        className={`rounded-2xl border p-4 text-left transition-colors ${
                          isActive
                            ? 'border-[var(--pf-orange)] bg-[var(--pf-orange)]/10'
                            : 'border-[var(--pf-border)] bg-[var(--pf-surface)] hover:border-[var(--pf-text-muted)]'
                        }`}
                      >
                        <p className="font-semibold">{style.label}</p>
                        <p className="mt-1 text-xs text-[var(--pf-text-muted)]">{style.description}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-2">Light / Dark preference</label>
                  <select
                    value={appearance.colorMode}
                    onChange={(e) => setAppearance((current) => ({ ...current, colorMode: e.target.value as ArtistAppearance['colorMode'] }))}
                    className="w-full rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3 text-sm focus:border-[var(--pf-orange)] focus:outline-none"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Profile image shape</label>
                  <select
                    value={appearance.profileImageShape}
                    onChange={(e) => setAppearance((current) => ({ ...current, profileImageShape: e.target.value as ArtistAppearance['profileImageShape'] }))}
                    className="w-full rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3 text-sm focus:border-[var(--pf-orange)] focus:outline-none"
                  >
                    {IMAGE_SHAPES.map((shape) => (
                      <option key={shape.value} value={shape.value}>
                        {shape.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <section className="pf-card p-5 space-y-5">
              <div className="flex items-center gap-2">
                <ImageIcon size={18} className="text-[var(--pf-orange)]" />
                <h2 className="text-lg font-semibold">Profile image crop</h2>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {IMAGE_FOCUS.map((focus) => {
                  const isActive = appearance.profileImageFocus === focus.value
                  return (
                    <button
                      key={focus.value}
                      type="button"
                      onClick={() =>
                        setAppearance((current) => ({
                          ...current,
                          profileImageFocus: focus.value,
                          profileImagePosition: focus.position,
                        }))
                      }
                      className={`rounded-2xl border p-4 text-left transition-colors ${
                        isActive
                          ? 'border-[var(--pf-orange)] bg-[var(--pf-orange)]/10'
                          : 'border-[var(--pf-border)] bg-[var(--pf-surface)] hover:border-[var(--pf-text-muted)]'
                      }`}
                    >
                      <p className="font-semibold">{focus.label}</p>
                      <p className="mt-1 text-xs text-[var(--pf-text-muted)]">Keeps faces framed correctly.</p>
                    </button>
                  )
                })}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-2">Manual horizontal position</label>
                  <input
                    type="text"
                    value={String(appearance.profileImagePosition || '50% 42%').split(' ')[0]}
                    onChange={(e) => {
                      const x = e.target.value.trim() || '50%'
                      const currentY = String(appearance.profileImagePosition || '50% 42%').split(' ')[1] || '42%'
                      setAppearance((current) => ({ ...current, profileImageFocus: 'manual', profileImagePosition: `${x} ${currentY}` }))
                    }}
                    className="w-full rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3 text-sm focus:border-[var(--pf-orange)] focus:outline-none"
                    placeholder="50%"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Manual vertical position</label>
                  <input
                    type="text"
                    value={String(appearance.profileImagePosition || '50% 42%').split(' ')[1] || '42%'}
                    onChange={(e) => {
                      const y = e.target.value.trim() || '42%'
                      const currentX = String(appearance.profileImagePosition || '50% 42%').split(' ')[0] || '50%'
                      setAppearance((current) => ({ ...current, profileImageFocus: 'manual', profileImagePosition: `${currentX} ${y}` }))
                    }}
                    className="w-full rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3 text-sm focus:border-[var(--pf-orange)] focus:outline-none"
                    placeholder="42%"
                  />
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="pf-card overflow-hidden">
              <div className="px-5 pt-5">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-[var(--pf-orange)]" />
                  <h2 className="text-lg font-semibold">Live preview</h2>
                </div>
                <p className="mt-1 text-sm text-[var(--pf-text-muted)]">
                  This is how your artist identity will feel inside Porterful.
                </p>
              </div>

              <div className="p-5" style={previewStyle}>
                <div className="rounded-[28px] border border-white/10 bg-[rgba(12,12,12,0.72)] p-5 shadow-2xl">
                  <div className="flex items-center gap-4">
                    <ArtistAvatar
                      src={artistImage}
                      alt={artistName}
                      name={artistName}
                      size="xl"
                      shape={appearance.profileImageShape || 'circle'}
                      focus={appearance.profileImageFocus || 'center-face'}
                      objectPosition={appearance.profileImagePosition}
                      className="ring-4 ring-white/10"
                    />
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.24em] text-white/60">Artist profile</p>
                      <h3 className="mt-2 text-2xl font-semibold text-white">{artistName}</h3>
                      <p className="mt-1 text-sm text-white/70">Your theme colors, player accents, and cards will pick this up.</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-white/55">Primary</p>
                      <p className="mt-1 text-lg font-semibold text-white">{appearance.primaryColor}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-white/55">Accent</p>
                      <p className="mt-1 text-lg font-semibold text-white">{appearance.accentColor}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-white/55">Image crop</p>
                      <p className="mt-1 text-lg font-semibold text-white">{appearance.profileImageShape} · {appearance.profileImageFocus}</p>
                      <p className="mt-1 text-xs text-white/60">{appearance.profileImagePosition || manualPosition}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="pf-card p-5 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--pf-text-muted)]">Profile</p>
                <h2 className="text-lg font-semibold mt-1">Saved artist</h2>
              </div>
              <div className="space-y-2 text-sm text-[var(--pf-text-secondary)]">
                <p><span className="font-medium text-[var(--pf-text)]">Name:</span> {artistName}</p>
                <p><span className="font-medium text-[var(--pf-text)]">Slug:</span> {artistSlug || 'Not set'}</p>
                <p><span className="font-medium text-[var(--pf-text)]">Hero theme:</span> {appearance.backgroundStyle}</p>
              </div>
            </section>
          </aside>
        </div>

        <div className="flex justify-end">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--pf-orange)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--pf-orange-dark)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save appearance'}
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-2">{label}</span>
      <div className="flex items-center gap-3 rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)] px-3 py-2.5">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-10 rounded-lg border-0 bg-transparent p-0"
          aria-label={label}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
      </div>
    </label>
  )
}
