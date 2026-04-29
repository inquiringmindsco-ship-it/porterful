'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/create-browser-client'
import { Loader2, Save, Play, Lock } from 'lucide-react'

interface TrackEditForm {
  title: string
  playback_mode: 'full' | 'preview' | 'locked'
  preview_duration_seconds: number
  unlock_required: boolean
  is_active: boolean
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
    playback_mode: 'full',
    preview_duration_seconds: 60,
    unlock_required: false,
    is_active: true,
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

    const { data: track, error } = await supabase
      .from('tracks')
      .select('title, playback_mode, preview_duration_seconds, unlock_required, is_active, artist_id')
      .eq('id', trackId)
      .single()

    if (error || !track) {
      setMessage('Track not found')
      setLoading(false)
      return
    }

    // Verify ownership
    const { data: artist } = await supabase
      .from('artists')
      .select('user_id')
      .eq('id', track.artist_id)
      .single()

    if (artist?.user_id !== user.id) {
      setMessage('You do not own this track')
      setLoading(false)
      return
    }

    setForm({
      title: track.title || '',
      playback_mode: track.playback_mode || 'full',
      preview_duration_seconds: track.preview_duration_seconds || 60,
      unlock_required: track.unlock_required || false,
      is_active: track.is_active !== false,
    })
    setLoading(false)
  }

  async function saveTrack() {
    setSaving(true)
    setMessage('')

    const { error } = await supabase
      .from('tracks')
      .update({
        title: form.title,
        playback_mode: form.playback_mode,
        preview_duration_seconds: form.preview_duration_seconds,
        unlock_required: form.unlock_required,
        is_active: form.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', trackId)

    if (error) {
      setMessage('Error saving: ' + error.message)
    } else {
      setMessage('Track updated successfully!')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--pf-bg)] pt-20 pb-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--pf-orange)]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--pf-bg)] pt-20 pb-24">
      <div className="pf-container max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Edit Track</h1>
        <p className="text-[var(--pf-text-secondary)] mb-8">{form.title}</p>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('Error') ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
            {message}
          </div>
        )}

        <div className="space-y-6">
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
