'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSupabase } from '@/app/providers'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Check, AlertCircle, Save, Trash2, Eye, EyeOff, X, Music, Play, Lock } from 'lucide-react'

interface Track {
  id: string
  title: string
  artist: string
  album: string | null
  description: string | null
  proud_to_pay_min: number
  price?: number
  cover_url: string | null
  audio_url: string
  is_active: boolean
  featured: boolean
  track_number: number | null
  playback_mode?: 'full' | 'preview' | 'locked'
  preview_duration_seconds?: number
  unlock_required?: boolean
  created_at: string
  updated_at?: string
  play_count: number
}

export default function EditTrackPage() {
  const router = useRouter()
  const params = useParams()
  const trackId = params.id as string
  const { user, supabase, loading: authLoading } = useSupabase()

  // Track data
  const [track, setTrack] = useState<Track | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [proudToPayMin, setProudToPayMin] = useState('1.00')
  const [isActive, setIsActive] = useState(true)
  const [featured, setFeatured] = useState(false)
  const [coverUrl, setCoverUrl] = useState('')
  const [trackNumber, setTrackNumber] = useState<number | ''>('')
  const [playbackMode, setPlaybackMode] = useState<'full' | 'preview' | 'locked'>('full')
  const [previewDuration, setPreviewDuration] = useState<number>(60)

  // Load track data
  useEffect(() => {
    async function checkAccessAndLoad() {
      if (authLoading) return
      if (!user) {
        router.push('/login')
        return
      }

      // Check artist role
      const { data: profile } = await supabase!
        .from('profiles')
        .select('id, role')
        .eq('id', user.id)
        .single()

      if (!profile || profile.role !== 'artist') {
        router.push('/dashboard')
        return
      }

      const res = await fetch(`/api/tracks/${trackId}`, {
        credentials: 'include',
      })

      const data = await res.json()

      if (res.status === 401) {
        router.push('/login')
        return
      }

      if (res.status === 403) {
        setError(data.error || 'You can only edit your own tracks')
        setLoading(false)
        return
      }

      if (!res.ok || !data.track) {
        setError(data.error || 'Track not found')
        setLoading(false)
        return
      }

      setTrack(data.track)
      // Initialize form state
      setTitle(data.track.title || '')
      setDescription(data.track.description || '')
      setProudToPayMin((data.track.proud_to_pay_min ?? data.track.price ?? 1).toFixed(2))
      setIsActive(data.track.is_active ?? true)
      setFeatured(data.track.featured ?? false)
      setCoverUrl(data.track.cover_url || '')
      setTrackNumber(data.track.track_number ?? '')
      setPlaybackMode(data.track.playback_mode || 'full')
      setPreviewDuration(data.track.preview_duration_seconds || 60)
      setLoading(false)
    }

    checkAccessAndLoad()
  }, [user, supabase, authLoading, router, trackId])

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required')
      return
    }

    setSaving(true)
    setError('')
    setSuccessMessage('')

    try {
      const res = await fetch(`/api/tracks/${trackId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          proud_to_pay_min: Math.max(0, parseFloat(proudToPayMin) || 0) || 1.00,
          is_active: isActive,
          featured: featured,
          cover_url: coverUrl.trim() || null,
          track_number: trackNumber === '' ? null : parseInt(String(trackNumber), 10),
          playback_mode: playbackMode,
          preview_duration_seconds: playbackMode === 'preview' ? Math.max(5, Math.min(300, previewDuration || 60)) : 60,
        }),
        credentials: 'include',
      })

      const data = await res.json()

      if (res.status === 401) {
        router.push('/login')
        return
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save track')
      }

      // Update local track state
      setTrack(data.track)
      setIsActive(data.track.is_active)
      setFeatured(data.track.featured)
      setCoverUrl(data.track.cover_url || '')
      setSuccessMessage('Track saved successfully')
      setTimeout(() => setSuccessMessage(''), 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleArchive = async () => {
    if (!confirm('Are you sure you want to archive this track? It will no longer be visible on the platform.')) {
      return
    }

    setSaving(true)
    setError('')

    try {
      const res = await fetch(`/api/tracks/${trackId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const data = await res.json()

      if (res.status === 401) {
        router.push('/login')
        return
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to archive track')
      }

      router.push('/dashboard/artist')
    } catch (err: any) {
      setError(err.message)
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 mobile-page-safe">
        <div className="pf-container max-w-2xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-[var(--pf-surface)] rounded w-1/4" />
            <div className="h-48 bg-[var(--pf-surface)] rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (error && !track) {
    return (
      <div className="min-h-screen pt-24 pb-12 mobile-page-safe">
        <div className="pf-container max-w-2xl">
          <div className="pf-card p-8 text-center">
            <AlertCircle size={48} className="mx-auto mb-4 text-[var(--pf-text-muted)]" />
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p className="text-[var(--pf-text-muted)] mb-4">{error}</p>
            <Link href="/dashboard/artist" className="pf-btn pf-btn-primary">
              Back to Catalog
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12 mobile-page-safe">
      <div className="pf-container max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/artist" className="p-2 hover:bg-[var(--pf-surface)] rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Edit Track</h1>
            <p className="text-[var(--pf-text-muted)]">{track?.title}</p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 rounded-lg border border-red-500/30 bg-red-500/10 flex items-center gap-2 text-red-400">
            <AlertCircle size={18} />
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-6 p-4 rounded-lg border border-green-500/30 bg-green-500/10 flex items-center gap-2 text-green-400">
            <Check size={18} />
            {successMessage}
          </div>
        )}

        <div className="space-y-6">
          {/* Cover Art Preview */}
          {track?.cover_url && (
            <div className="pf-card p-6">
              <label className="block text-sm font-medium mb-3">Cover Art</label>
              <div className="relative w-32 h-32 rounded-xl overflow-hidden bg-[var(--pf-surface)]">
                <Image src={track.cover_url} alt={track.title} fill sizes="128px" className="object-cover" />
              </div>
            </div>
          )}

          {/* Basic Info */}
          <div className="pf-card p-6 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--pf-text-muted)]">Track Info</h3>

            <div>
              <label className="block text-sm font-medium mb-2">Track Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="pf-input"
                placeholder="Enter track title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="pf-input min-h-[100px]"
                placeholder="Tell fans about this track..."
                maxLength={500}
              />
              <p className="text-xs text-[var(--pf-text-muted)] mt-1">{description.length}/500 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Album Art URL</label>
              <input
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                className="pf-input"
                placeholder="https://example.com/album-art.jpg"
              />
              <p className="text-xs text-[var(--pf-text-muted)] mt-1">Leave blank to use default artwork</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Track Number</label>
              <input
                type="number"
                inputMode="numeric"
                value={trackNumber}
                onChange={(e) => {
                  const val = e.target.value
                  if (val === '') {
                    setTrackNumber('')
                  } else {
                    const num = parseInt(val, 10)
                    if (!isNaN(num) && num >= 1 && num <= 99) {
                      setTrackNumber(num)
                    }
                  }
                }}
                className="pf-input w-24"
                placeholder="#"
                min={1}
                max={99}
              />
              <p className="text-xs text-[var(--pf-text-muted)] mt-1">Position in album (1-99, optional)</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Proud to Pay Minimum (USD)</label>
              <div className="flex items-center gap-3">
                <span className="text-lg text-[var(--pf-text)] select-none">$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={proudToPayMin}
                  onChange={(e) => {
                    // Allow only valid decimal input
                    const val = e.target.value
                    if (val === '' || /^\d*\.?\d{0,2}$/.test(val)) {
                      setProudToPayMin(val)
                    }
                  }}
                  onBlur={() => {
                    // Normalize to 2 decimals on blur
                    const num = parseFloat(proudToPayMin)
                    if (isNaN(num) || proudToPayMin === '') {
                      setProudToPayMin('0.00')
                    } else {
                      setProudToPayMin(num.toFixed(2))
                    }
                  }}
                  className="pf-input flex-1"
                  placeholder="0.00"
                />
              </div>
              <p className="text-xs text-[var(--pf-text-muted)] mt-1">Set to 0.00 for free downloads. Defaults to $1.00.</p>
            </div>
          </div>

          {/* Status */}
          <div className="pf-card p-6 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--pf-text-muted)]">Visibility</h3>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{isActive ? 'Live' : 'Hidden'}</p>
                <p className="text-xs text-[var(--pf-text-muted)]">{isActive ? 'Visible and playable' : 'Hidden from listeners'}</p>
              </div>
              <button
                onClick={() => setIsActive(!isActive)}
                className={`relative w-12 h-6 rounded-full transition-colors ${isActive ? 'bg-[var(--pf-orange)]' : 'bg-[var(--pf-surface-hover)]'}`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-0'}`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{featured ? 'Featured' : 'Not Featured'}</p>
                <p className="text-xs text-[var(--pf-text-muted)]">{featured ? 'Shown on artist profile' : 'Standard track'}</p>
              </div>
              <button
                onClick={() => setFeatured(!featured)}
                className={`relative w-12 h-6 rounded-full transition-colors ${featured ? 'bg-[var(--pf-orange)]' : 'bg-[var(--pf-surface-hover)]'}`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${featured ? 'translate-x-6' : 'translate-x-0'}`}
                />
              </button>
            </div>
          </div>

          {/* Playback Access */}
          <div className="pf-card p-6 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--pf-text-muted)]">Playback Access</h3>
            
            <div className="space-y-3">
              {/* Full Track */}
              <label className="flex items-start gap-3 p-4 bg-[var(--pf-surface)] rounded-xl border border-[var(--pf-border)] cursor-pointer hover:border-[var(--pf-orange)] transition-colors">
                <input
                  type="radio"
                  name="playback_mode"
                  value="full"
                  checked={playbackMode === 'full'}
                  onChange={(e) => setPlaybackMode(e.target.value as any)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Play size={18} className="text-[var(--pf-orange)]" />
                    <span className="font-medium">Full Track</span>
                  </div>
                  <p className="text-xs text-[var(--pf-text-muted)] mt-1">
                    Public listeners can play the complete track
                  </p>
                </div>
              </label>

              {/* Preview */}
              <label className="flex items-start gap-3 p-4 bg-[var(--pf-surface)] rounded-xl border border-[var(--pf-border)] cursor-pointer hover:border-[var(--pf-orange)] transition-colors">
                <input
                  type="radio"
                  name="playback_mode"
                  value="preview"
                  checked={playbackMode === 'preview'}
                  onChange={(e) => setPlaybackMode(e.target.value as any)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Play size={18} className="text-yellow-400" />
                    <span className="font-medium">60-Second Preview</span>
                  </div>
                  <p className="text-xs text-[var(--pf-text-muted)] mt-1">
                    Public listeners hear only first {previewDuration} seconds
                  </p>
                  {playbackMode === 'preview' && (
                    <div className="mt-3 flex items-center gap-3">
                      <label className="text-sm">Preview duration:</label>
                      <input
                        type="number"
                        min="5"
                        max="300"
                        value={previewDuration}
                        onChange={(e) => setPreviewDuration(parseInt(e.target.value) || 60)}
                        className="w-20 px-3 py-2 bg-[var(--pf-bg-secondary)] border border-[var(--pf-border)] rounded-lg text-white text-center"
                      />
                      <span className="text-sm text-[var(--pf-text-muted)]">seconds</span>
                    </div>
                  )}
                </div>
              </label>

              {/* Locked - Disabled */}
              <label className="flex items-start gap-3 p-4 bg-[var(--pf-surface)] rounded-xl border border-[var(--pf-border)] opacity-60 cursor-not-allowed">
                <input
                  type="radio"
                  name="playback_mode"
                  value="locked"
                  checked={playbackMode === 'locked'}
                  onChange={(e) => setPlaybackMode(e.target.value as any)}
                  className="mt-1"
                  disabled
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Lock size={18} className="text-red-400" />
                    <span className="font-medium">Unlock Required</span>
                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">Coming Soon</span>
                  </div>
                  <p className="text-xs text-[var(--pf-text-muted)] mt-1">
                    Requires purchase/unlock to play (payment system in development)
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Stats */}
          {track && (
            <div className="pf-card p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--pf-text-muted)] mb-4">Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold">{track.play_count || 0}</p>
                  <p className="text-xs text-[var(--pf-text-muted)]">Plays</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{new Date(track.created_at).toLocaleDateString()}</p>
                  <p className="text-xs text-[var(--pf-text-muted)]">Uploaded</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
            <button
              onClick={handleArchive}
              disabled={saving}
              className="pf-btn pf-btn-secondary text-red-400 hover:text-red-300 flex items-center gap-2"
            >
              <Trash2 size={16} />
              Archive Track
            </button>

            <div className="flex gap-3">
              <Link href="/dashboard/artist" className="pf-btn pf-btn-secondary">
                Cancel
              </Link>
              <button
                onClick={handleSave}
                disabled={saving}
                className="pf-btn pf-btn-primary flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[var(--pf-border)] border-t-[var(--pf-text)] rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
