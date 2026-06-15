'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/create-browser-client'
import { Loader2, Save, Play, Lock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface TrackEditForm {
  title: string
  track_number: string
  featured: boolean
  playback_mode: 'full' | 'preview' | 'locked'
  preview_duration_seconds: number
  unlock_required: boolean
  is_active: boolean
  proud_to_pay_min: string
}

export default function TrackEditPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()
  const trackId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState<TrackEditForm>({
    title: '',
    track_number: '',
    featured: false,
    playback_mode: 'full',
    preview_duration_seconds: 60,
    unlock_required: false,
    is_active: true,
    proud_to_pay_min: '0.50',
  })

  useEffect(() => {
    loadTrack()
  }, [trackId])

  async function loadTrack() {
    setLoading(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    try {
      const res = await fetch(`/api/tracks/${trackId}`, {
        credentials: 'include',
      })

      const data = await res.json()

      if (res.status === 401) {
        router.push('/login')
        return
      }

      if (res.status === 403) {
        setMessage(data.error || 'You do not own this track')
        setLoading(false)
        return
      }

      if (!res.ok || !data.track) {
        setMessage(data.error || 'Track not found')
        setLoading(false)
        return
      }

      const track = data.track

      setForm({
        title: track.title || '',
        track_number: track.track_number?.toString?.() || '',
        featured: Boolean(track.featured),
        playback_mode: track.playback_mode || 'full',
        preview_duration_seconds: track.preview_duration_seconds || 60,
        unlock_required: track.unlock_required || false,
        is_active: track.is_active !== false,
        proud_to_pay_min: Number(track.proud_to_pay_min ?? track.price ?? 0.50).toFixed(2),
      })
      setLoading(false)
    } catch (err) {
      console.error('Failed to load track:', err)
      setMessage('Track not found')
      setLoading(false)
    }
  }

  async function saveTrack() {
    setSaving(true)
    setMessage('')

    try {
      const res = await fetch(`/api/tracks/${trackId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          track_number: form.track_number === ''
            ? null
            : Number.isFinite(Number(form.track_number))
              ? Number.parseInt(form.track_number, 10)
              : null,
          featured: form.featured,
          playback_mode: form.playback_mode,
          preview_duration_seconds: form.preview_duration_seconds,
          unlock_required: form.unlock_required,
          is_active: form.is_active,
          proud_to_pay_min: Number.isFinite(Number(form.proud_to_pay_min))
            ? Math.max(0, Number(form.proud_to_pay_min))
            : 0.50,
        }),
        credentials: 'include',
      })

      const data = await res.json()

      if (res.status === 401) {
        router.push('/login')
        return
      }

      if (!res.ok) {
        throw new Error(data.error || 'Error saving track')
      }

      setMessage('Track updated successfully!')
      
      // Reload track data to reflect saved changes
      await loadTrack()
    } catch (err: any) {
      setMessage('Error saving: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--pf-bg)] pt-20 pb-24 mobile-page-safe flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--pf-orange)]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--pf-bg)] pt-20 pb-24 mobile-page-safe">
      <div className="pf-container max-w-2xl">
        <Link href="/dashboard/artist" className="inline-flex items-center gap-2 text-sm text-[var(--pf-text-muted)] transition-colors hover:text-[var(--pf-text)] mb-4">
          <ArrowLeft size={16} />
          Back to Catalog
        </Link>

        <h1 className="text-3xl font-bold mb-2">Edit Track</h1>
        <p className="text-[var(--pf-text-secondary)] mb-8">{form.title}</p>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('Error') ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
            {message}
          </div>
        )}

        <div className="space-y-6">
          {/* Lead Track */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">Track order</label>
              <input
                type="number"
                min="1"
                step="1"
                value={form.track_number}
                onChange={(e) => setForm({ ...form, track_number: e.target.value })}
                className="w-full px-4 py-3 bg-[var(--pf-bg-secondary)] border border-[var(--pf-border)] rounded-xl text-white"
              />
              <p className="mt-2 text-xs text-[var(--pf-text-muted)]">
                Lower numbers appear earlier on your artist page. Set this track to 1 to make it the first track.
              </p>
            </div>
            <label className="flex items-start gap-3 p-4 bg-[var(--pf-surface)] rounded-xl border border-[var(--pf-border)] cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="w-5 h-5 accent-[var(--pf-orange)] mt-1"
              />
              <div>
                <span className="font-medium">Featured track</span>
                <p className="text-sm text-[var(--pf-text-secondary)]">
                  This is the top track for your artist page hero and the featured track badge.
                </p>
              </div>
            </label>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Track Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-3 bg-[var(--pf-bg-secondary)] border border-[var(--pf-border)] rounded-xl text-white"
            />
          </div>

          {/* Playback Mode */}
          <div>
            <label className="block text-sm font-medium mb-3">Playback Access</label>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-4 bg-[var(--pf-surface)] rounded-xl border border-[var(--pf-border)] cursor-pointer hover:border-[var(--pf-orange)] transition-colors">
                <input
                  type="radio"
                  name="playback_mode"
                  value="full"
                  checked={form.playback_mode === 'full'}
                  onChange={(e) => setForm({ ...form, playback_mode: e.target.value as any })}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Play className="w-4 h-4 text-[var(--pf-orange)]" />
                    <span className="font-medium">Full Track</span>
                  </div>
                  <p className="text-sm text-[var(--pf-text-secondary)] mt-1">
                    Public listeners can play the complete track
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 bg-[var(--pf-surface)] rounded-xl border border-[var(--pf-border)] cursor-pointer hover:border-[var(--pf-orange)] transition-colors">
                <input
                  type="radio"
                  name="playback_mode"
                  value="preview"
                  checked={form.playback_mode === 'preview'}
                  onChange={(e) => setForm({ ...form, playback_mode: e.target.value as any })}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Play className="w-4 h-4 text-yellow-400" />
                    <span className="font-medium">60-Second Preview</span>
                  </div>
                  <p className="text-sm text-[var(--pf-text-secondary)] mt-1">
                    Public listeners hear only first 60 seconds
                  </p>
                  
                  {form.playback_mode === 'preview' && (
                    <div className="mt-3 flex items-center gap-3">
                      <label className="text-sm">Preview duration:</label>
                      <input
                        type="number"
                        min="5"
                        max="300"
                        value={form.preview_duration_seconds}
                        onChange={(e) => setForm({ ...form, preview_duration_seconds: parseInt(e.target.value) || 60 })}
                        className="w-20 px-3 py-2 bg-[var(--pf-bg-secondary)] border border-[var(--pf-border)] rounded-lg text-white text-center"
                      />
                      <span className="text-sm text-[var(--pf-text-secondary)]">seconds</span>
                    </div>
                  )}
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 bg-[var(--pf-surface)] rounded-xl border border-[var(--pf-border)] cursor-pointer hover:border-[var(--pf-orange)] transition-colors opacity-60">
                <input
                  type="radio"
                  name="playback_mode"
                  value="locked"
                  checked={form.playback_mode === 'locked'}
                  onChange={(e) => setForm({ ...form, playback_mode: e.target.value as any })}
                  className="mt-1"
                  disabled
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-red-400" />
                    <span className="font-medium">Unlock Required</span>
                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">Coming Soon</span>
                  </div>
                  <p className="text-sm text-[var(--pf-text-secondary)] mt-1">
                    Requires purchase/unlock to play (payment system in development)
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium mb-2">Price (USD)</label>
            <div className="flex items-center rounded-xl border border-[var(--pf-border)] bg-[var(--pf-bg-secondary)] px-4 py-3 focus-within:border-[var(--pf-orange)] focus-within:ring-2">
              <span className="pr-2 text-[var(--pf-text-muted)] text-base select-none">$</span>
              <input
                type="text"
                inputMode="decimal"
                value={form.proud_to_pay_min}
                onChange={(e) => {
                  const nextValue = e.target.value
                  if (nextValue === '' || /^\d*(?:\.\d{0,2})?$/.test(nextValue)) {
                    setForm({ ...form, proud_to_pay_min: nextValue })
                  }
                }}
                onBlur={() => {
                  const normalizedPrice = Number.parseFloat(form.proud_to_pay_min)
                  setForm({
                    ...form,
                    proud_to_pay_min: Number.isFinite(normalizedPrice)
                      ? normalizedPrice.toFixed(2)
                      : '0.50',
                  })
                }}
                className="w-full border-0 bg-transparent p-0 text-white text-base focus:outline-none focus:ring-0"
              />
            </div>
            <p className="text-xs text-[var(--pf-text-muted)] mt-1">Set to 0 for free download</p>
          </div>

          {/* Visibility */}
          <div>
            <label className="flex items-center gap-3 p-4 bg-[var(--pf-surface)] rounded-xl border border-[var(--pf-border)] cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="w-5 h-5 accent-[var(--pf-orange)]"
              />
              <div>
                <span className="font-medium">Track is visible</span>
                <p className="text-sm text-[var(--pf-text-secondary)]">
                  Hidden tracks won't appear publicly
                </p>
              </div>
            </label>
          </div>

          {/* Save */}
          <button
            onClick={saveTrack}
            disabled={saving}
            className="pf-btn pf-btn-primary flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
