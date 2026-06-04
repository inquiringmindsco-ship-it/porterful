'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/app/providers'
import Link from 'next/link'
import Image from 'next/image'
import { Upload, Music, ArrowLeft, AlertCircle, Check, Image as ImageIcon, X, ChevronDown, ChevronUp } from 'lucide-react'

export default function UploadPage() {
  const router = useRouter()
  const { user, supabase, loading: authLoading } = useSupabase()
  const [loading, setLoading] = useState(true)

  // Form state
  const [title, setTitle] = useState('')
  const [album, setAlbum] = useState('')
  const [price, setPrice] = useState('0.50')
  const [description, setDescription] = useState('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioDuration, setAudioDuration] = useState<number | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState('')

  // Upload state
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const audioInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  function getAudioDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const audio = document.createElement('audio')
      const url = URL.createObjectURL(file)
      audio.preload = 'metadata'
      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(url)
        resolve(Math.round(audio.duration))
      }
      audio.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Could not read audio duration'))
      }
      audio.src = url
    })
  }

  useEffect(() => {
    async function checkAccess() {
      if (authLoading) return
      if (!user) {
        router.push('/login')
        return
      }
      const { data } = await supabase!
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      if (data?.role !== 'artist' && data?.role !== 'admin' && data?.role !== 'founder') {
        router.push('/dashboard')
        return
      }
      setLoading(false)
    }
    checkAccess()
  }, [user, supabase, authLoading, router])

  // Quota check silently — no UI noise
  useEffect(() => {
    if (!user || authLoading) return
    async function checkQuota() {
      try {
        const res = await fetch('/api/tracks/quota')
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          if (data?.message) setError(data.message)
        }
      } catch (e) {
        // silent
      }
    }
    checkQuota()
  }, [user, authLoading])

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAudioFile(file)
    setAudioDuration(null)

    const audio = document.createElement('audio')
    const url = URL.createObjectURL(file)
    audio.preload = 'metadata'
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(url)
      const seconds = Math.round(audio.duration)
      setAudioDuration(seconds)
    }
    audio.onerror = () => {
      URL.revokeObjectURL(url)
    }
    audio.src = url

    if (!title) setTitle(file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '))
  }

  async function safeFetch<T = any>(url: string, init?: RequestInit): Promise<{ ok: boolean; status: number; data: T; raw: string }> {
    const res = await fetch(url, init)
    const raw = await res.text()
    let data: any = {}
    try {
      data = raw ? JSON.parse(raw) : {}
    } catch {
      data = { error: raw || `HTTP ${res.status}` }
    }
    return { ok: res.ok, status: res.status, data, raw }
  }

  const uploadFile = async (file: File, folder: string): Promise<{ publicUrl: string; path: string }> => {
    const userId = user?.id || 'anonymous'
    const { ok, status, data: signedData } = await safeFetch('/api/upload/signed-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: file.name,
        folder,
        contentType: file.type || 'audio/mpeg',
        userId,
      }),
    })

    if (!ok || signedData.error) {
      throw new Error(signedData.error || `Failed to get upload URL (HTTP ${status})`)
    }

    const { token, path, publicUrl, bucket } = signedData

    const uploadRes = await fetch(
      `https://tsdjmiqczgxnkpvirkya.supabase.co/storage/v1/object/upload/sign/${bucket}/${path}?token=${encodeURIComponent(token)}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': file.type || 'audio/mpeg',
          'x-upsert': 'false',
        },
        body: file,
      }
    )

    if (!uploadRes.ok) {
      const errText = await uploadRes.text()
      throw new Error(`Storage upload failed: ${uploadRes.status} ${errText.substring(0, 200)}`)
    }

    return { publicUrl, path }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!audioFile) { setError('Please select an audio file'); return }
    if (!title.trim()) { setError('Please enter a track title'); return }

    setSubmitting(true)
    setError('')

    try {
      const quotaRes = await safeFetch('/api/tracks/quota')
      if (!quotaRes.ok || !quotaRes.data?.can_upload) {
        const msg = quotaRes.data?.message || 'Upload not allowed. Check your track limit.'
        throw new Error(msg)
      }

      let resolvedAudioDuration: number | null = Number.isFinite(audioDuration ?? NaN)
        ? (audioDuration as number)
        : null
      if (!Number.isFinite(resolvedAudioDuration ?? NaN)) {
        try {
          resolvedAudioDuration = await getAudioDuration(audioFile)
        } catch {
          resolvedAudioDuration = null
        }
      }

      const { publicUrl: audioUrl, path: audioPath } = await uploadFile(audioFile, 'artists/tracks')

      let coverUrl = ''
      let coverPath = ''
      if (coverFile) {
        const coverResult = await uploadFile(coverFile, 'artists/covers')
        coverUrl = coverResult.publicUrl
        coverPath = coverResult.path
      }

      const { ok, status, data } = await safeFetch('/api/tracks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          audio_url: audioUrl,
          cover_url: coverUrl || null,
          album: album.trim() || null,
          price: parseFloat(price) || 0,
          description: description.trim() || null,
          duration: resolvedAudioDuration,
          duration_seconds: resolvedAudioDuration,
          storage_paths: {
            audio: audioPath,
            cover: coverPath || null,
          },
        }),
      })

      if (!ok || data.error) {
        throw new Error(data.error || data.message || `Save failed (HTTP ${status})`)
      }

      setSuccess(true)
      setTimeout(() => router.push('/dashboard/artist'), 1500)
    } catch (err: any) {
      const rawMsg = err?.message || String(err) || 'Unknown error'
      const isQuotaError = rawMsg.includes('Maximum') || rawMsg.includes('track limit') || rawMsg.includes('Upgrade')
      const isAuthError = rawMsg.includes('Unauthorized') || rawMsg.includes('session')
      const isSizeError = rawMsg.includes('413') || rawMsg.includes('Entity Too Large') || rawMsg.includes('payload')

      let displayError = rawMsg
      if (isSizeError) {
        displayError = 'File too large. Maximum 50MB per track.'
      } else if (isAuthError) {
        displayError = 'Your session expired. Please log in again.'
      } else if (isQuotaError) {
        displayError = rawMsg
      }

      setError(displayError)
    } finally {
      setSubmitting(false)
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

  if (success) {
    return (
      <div className="min-h-screen pt-24 pb-12 mobile-page-safe flex items-center justify-center">
        <div className="pf-card p-8 text-center max-w-md w-full mx-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border border-[var(--pf-border)] bg-[var(--pf-surface)] flex items-center justify-center">
            <Check size={32} className="text-[var(--pf-text-secondary)]" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Track Uploaded!</h2>
          <p className="text-[var(--pf-text-muted)]">Redirecting to your catalog...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12 mobile-page-safe">
      <div className="pf-container max-w-2xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-[var(--pf-text-muted)] transition-colors hover:text-[var(--pf-text)] mb-4"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/artist" className="p-2 hover:bg-[var(--pf-surface)] rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Upload Track</h1>
            <p className="text-[var(--pf-text-muted)]">MP3, M4A, WAV — max 50MB</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg border border-[var(--pf-border)] bg-[var(--pf-surface)] flex items-center gap-2 text-[var(--pf-text-secondary)]">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Audio File */}
          <div>
            <label className="block text-sm font-medium mb-2">Audio File *</label>
            <div
              onClick={() => audioInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                audioFile
                  ? 'border-[var(--pf-orange)] bg-[var(--pf-orange)]/5'
                  : 'border-[var(--pf-border)] hover:border-[var(--pf-border-hover)]'
              }`}
            >
              {audioFile ? (
                <div className="flex items-center justify-center gap-3">
                  <Music size={24} className="text-[var(--pf-orange)]" />
                  <div className="text-left">
                    <p className="font-medium">{audioFile.name}</p>
                    <p className="text-sm text-[var(--pf-text-muted)]">{(audioFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setAudioFile(null) }}
                    className="ml-2 text-[var(--pf-text-muted)] hover:text-[var(--pf-text)]"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload size={32} className="mx-auto mb-3 text-[var(--pf-text-muted)]" />
                  <p className="font-medium mb-1">Drop audio file here or click to browse</p>
                  <p className="text-sm text-[var(--pf-text-muted)]">MP3, M4A, WAV — max 50MB</p>
                </>
              )}
            </div>
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*,.mp3,.m4a,.wav"
              onChange={handleAudioChange}
              className="hidden"
            />
          </div>

          {/* Cover Art */}
          <div>
            <label className="block text-sm font-medium mb-2">Cover Art (optional)</label>
            <div
              onClick={() => coverInputRef.current?.click()}
              className="relative w-32 h-32 rounded-xl overflow-hidden bg-[var(--pf-surface)] border border-[var(--pf-border)] cursor-pointer group"
            >
              {coverPreview ? (
                <Image src={coverPreview} alt="Cover" fill sizes="128px" className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <ImageIcon size={32} className="text-[var(--pf-text-muted)]" />
                </div>
              )}
              <div className="absolute inset-0 bg-[var(--pf-surface)]/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Upload size={20} className="text-[var(--pf-text)]" />
              </div>
            </div>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="hidden"
            />
          </div>

          {/* Core Metadata */}
          <div className="pf-card p-6 space-y-4">
            <div className="text-xs text-[var(--pf-text-muted)]">
              <span className="font-medium text-[var(--pf-orange)]">Recommended: $0.99 – $2.99</span> · Set to $0 for free
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Track Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="pf-input"
                placeholder="Enter track title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Price (USD)</label>
              <div className="flex items-center rounded-xl border border-[var(--pf-border)] bg-[var(--pf-bg)] px-4 py-3 focus-within:border-[var(--pf-orange)] focus-within:ring-2">
                <span className="pr-2 text-[var(--pf-text-muted)] select-none">$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={price}
                  onChange={(e) => {
                    const nextValue = e.target.value
                    if (nextValue === '' || /^\d*(?:\.\d{0,2})?$/.test(nextValue)) {
                      setPrice(nextValue)
                    }
                  }}
                  onBlur={() => {
                    const normalizedPrice = Number.parseFloat(price)
                    setPrice(Number.isFinite(normalizedPrice) ? normalizedPrice.toFixed(2) : '0.50')
                  }}
                  className="w-full border-0 bg-transparent p-0 text-[var(--pf-text)] focus:outline-none focus:ring-0"
                  placeholder="0.50"
                />
              </div>
            </div>

            {/* Advanced: Album + Description */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm text-[var(--pf-text-muted)] hover:text-[var(--pf-text)] transition-colors"
            >
              {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {showAdvanced ? 'Hide advanced options' : 'More options (album, description)'}
            </button>

            {showAdvanced && (
              <div className="space-y-4 pt-2 border-t border-[var(--pf-border)]">
                <div>
                  <label className="block text-sm font-medium mb-2">Album / Project (optional)</label>
                  <input
                    type="text"
                    value={album}
                    onChange={(e) => setAlbum(e.target.value)}
                    className="pf-input"
                    placeholder="Singles, EP name, or album"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description (optional)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="pf-input min-h-[80px]"
                    placeholder="Tell fans about this track..."
                    maxLength={300}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <Link href="/dashboard/artist" className="pf-btn pf-btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting || !audioFile}
              className="pf-btn pf-btn-primary flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-[var(--pf-border)] border-t-[var(--pf-text)] rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Upload Track
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
