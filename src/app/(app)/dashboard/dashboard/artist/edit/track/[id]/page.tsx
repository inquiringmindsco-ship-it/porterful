'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSupabase } from '@/app/providers'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Check, AlertCircle, Save, Trash2, Eye, EyeOff, X, Music } from 'lucide-react'

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
  const [proudToPayMin, setProudToPayMin] = useState(1)
  const [isActive, setIsActive] = useState(true)

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

      // Load track
      const { data: trackData, error: trackError } = await supabase!
        .from('tracks')
        .select('*')
        .eq('id', trackId)
        .single()

      if (trackError || !trackData) {
        setError('Track not found')
        setLoading(false)
        return
      }

      // Verify ownership
      if (trackData.artist_id !== user.id) {
        setError('You can only edit your own tracks')
        setLoading(false)
        return
      }

      setTrack(trackData)
      // Initialize form state
      setTitle(trackData.title || '')
      setDescription(trackData.description || '')
      setProudToPayMin(trackData.proud_to_pay_min ?? trackData.price ?? 1)
      setIsActive(trackData.is_active ?? true)
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
          proud_to_pay_min: Math.max(0, proudToPayMin) || 1.00,
          is_active: isActive,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save track')
      }

      // Update local track state
      setTrack(data.track)
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
      })

      const data = await res.json()

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
      <div className="min-h-screen pt-24 pb-12">
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
      <div className="min-h-screen pt-24 pb-12">
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
    <div className="min-h-screen pt-24 pb-12">
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
              <label className="block text-sm font-medium mb-2">Proud to Pay Minimum (USD)</label>
              <div className="flex items-center gap-2">
                <span className="text-lg text-[var(--pf-text)]">$</span>
                <input
                  type="number"
                  value={proudToPayMin}
                  onChange={(e) => setProudToPayMin(parseFloat(e.target.value) || 0)}
                  className="pf-input flex-1"
                  min="0"
                  step="0.01"
                  placeholder="1.00"
                />
              </div>
              <p className="text-xs text-[var(--pf-text-muted)] mt-1">Set to 0 for free downloads. Defaults to $1.00.</p>
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
