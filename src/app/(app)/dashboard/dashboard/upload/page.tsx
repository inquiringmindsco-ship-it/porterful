'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/app/providers'
import Link from 'next/link'
import Image from 'next/image'
import { Upload, Music, ArrowLeft, AlertCircle, Check, Image as ImageIcon, X } from 'lucide-react'

export default function UploadPage() {
  const router = useRouter()
  const { user, supabase, loading: authLoading } = useSupabase()
  const [loading, setLoading] = useState(true)

  // Form state
  const [title, setTitle] = useState('')
  const [album, setAlbum] = useState('')
  const [price, setPrice] = useState('1.00')
  const [description, setDescription] = useState('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioDuration, setAudioDuration] = useState<number | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState('')

  // Upload state
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Quota state (preflight)
  const [quota, setQuota] = useState<any>(null)
  const [quotaLoading, setQuotaLoading] = useState(true)

  // Debug state (temporary)
  const [debugInfo, setDebugInfo] = useState<string[]>([])

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

  // Fetch quota on load
  useEffect(() => {
    if (!user || authLoading) return
    async function fetchQuota() {
      try {
        const res = await fetch('/api/tracks/quota')
        if (res.ok) {
          const data = await res.json()
          setQuota(data)
        }
      } catch (e) {
        console.error('Failed to fetch quota:', e)
      } finally {
        setQuotaLoading(false)
      }
    }
    fetchQuota()
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
    setAudioDuration(null) // reset
    
    // Extract audio duration from browser
    const audio = document.createElement('audio')
    const url = URL.createObjectURL(file)
    audio.preload = 'metadata'
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(url)
      const seconds = Math.round(audio.duration)
      setAudioDuration(seconds)
      console.log('[upload] Duration extracted:', seconds, 'seconds')
    }
    audio.onerror = () => {
      URL.revokeObjectURL(url)
      console.warn('[upload] Could not extract duration')
    }
    audio.src = url

    if (!title) setTitle(file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '))
  }

  /**
   * Safe fetch helper — handles JSON, text, and empty responses
   */
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

  /**
   * Upload directly to Supabase Storage via signed URL.
   * Bypasses Vercel body limit entirely.
   * Returns { publicUrl, path } for metadata save and orphan cleanup.
   */
  const uploadFile = async (file: File, folder: string): Promise<{ publicUrl: string; path: string }> => {
    const userId = user?.id || 'anonymous'

    // 1. Get signed upload URL from server (tiny JSON request)
    const { ok, status, data: signedData, raw: signedRaw } = await safeFetch('/api/upload/signed-url', {
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

    // 2. Upload file DIRECTLY to Supabase Storage (bypasses Vercel)
    // Token must be passed as query param, not Authorization header
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
      console.error('[upload] Supabase storage upload failed:', uploadRes.status, errText)
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
    setDebugInfo([])

    const addDebug = (msg: string) => {
      setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()} — ${msg}`])
      console.log('[upload]', msg)
    }

    addDebug(`START — file: ${audioFile.name}, size: ${audioFile.size} bytes (${(audioFile.size / 1024 / 1024).toFixed(2)}MB)`)

    try {
      // 1. PREFLIGHT: Check quota before uploading
      addDebug('Step 0: Checking upload quota...')
      const quotaRes = await safeFetch('/api/tracks/quota')
      addDebug(`Quota check — ok: ${quotaRes.ok}, can_upload: ${quotaRes.data?.can_upload}`)
      
      if (!quotaRes.ok || !quotaRes.data?.can_upload) {
        const msg = quotaRes.data?.message || 'Upload not allowed. Check your track limit.'
        throw new Error(msg)
      }

      // 1b. Resolve duration from the selected file before we save metadata.
      // This guarantees the DB row gets a real duration even if the change
      // handler state has not finished updating yet.
      const resolvedAudioDuration = Number.isFinite(audioDuration ?? NaN)
        ? (audioDuration as number)
        : await getAudioDuration(audioFile)
      if (!Number.isFinite(resolvedAudioDuration)) {
        throw new Error('Could not read audio duration')
      }
      setAudioDuration(resolvedAudioDuration)
      addDebug(`Step 0b DONE — audio duration: ${resolvedAudioDuration} seconds`)

      // 2. Get signed URL + upload audio directly to Supabase
      addDebug('Step 1: Requesting signed URL for audio...')
      const { publicUrl: audioUrl, path: audioPath } = await uploadFile(audioFile, 'artists/tracks')
      addDebug(`Step 1 DONE — audioUrl: ${audioUrl.substring(0, 60)}...`)

      // 3. Upload cover art directly to Supabase (if provided)
      let coverUrl = ''
      let coverPath = ''
      if (coverFile) {
        addDebug('Step 2: Requesting signed URL for cover...')
        const coverResult = await uploadFile(coverFile, 'artists/covers')
        coverUrl = coverResult.publicUrl
        coverPath = coverResult.path
        addDebug(`Step 2 DONE — coverUrl: ${coverUrl.substring(0, 60)}...`)
      }

      // 4. Send metadata to server (tiny JSON — well under Vercel limit)
      addDebug('Step 3: Saving metadata to /api/tracks...')
      const { ok, status, data, raw } = await safeFetch('/api/tracks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          audio_url: audioUrl,
          cover_url: coverUrl || null,
          album: album.trim() || null,
          price: parseFloat(price) || 0,
          description: description.trim() || null,
          duration: resolvedAudioDuration, // canonical duration in seconds
          storage_paths: {
            audio: audioPath,
            cover: coverPath || null,
          },
        }),
      })

      addDebug(`Step 3 response — ok: ${ok}, status: ${status}, error: ${data?.error || 'none'}`)

      if (!ok || data.error) {
        throw new Error(data.error || data.message || `Save failed (HTTP ${status})`)
      }

      addDebug('SUCCESS — track saved')
      setSuccess(true)
      setTimeout(() => router.push('/dashboard/artist'), 1500)
    } catch (err: any) {
      const rawMsg = err?.message || String(err) || 'Unknown error'
      addDebug(`CATCH ERROR — ${rawMsg}`)
      console.error('[upload] Full error:', err)

      // Clean error display — no fake "file too large" for quota errors
      const isQuotaError = rawMsg.includes('Maximum') || rawMsg.includes('track limit') || rawMsg.includes('Upgrade')
      const isAuthError = rawMsg.includes('Unauthorized') || rawMsg.includes('session')
      const isSizeError = rawMsg.includes('413') || rawMsg.includes('Entity Too Large') || rawMsg.includes('payload')
      
      let displayError = rawMsg
      if (isSizeError) {
        displayError = 'File too large. Maximum 50MB per track.'
      } else if (isAuthError) {
        displayError = 'Your session expired. Please log in again.'
      } else if (isQuotaError) {
        displayError = rawMsg // Show real quota message
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

        {/* Quota Info */}
        {quota && !quotaLoading && (
          <div className={`mb-6 p-3 rounded-lg border text-sm ${
            quota.is_unlimited 
              ? 'border-[var(--pf-orange)]/30 bg-[var(--pf-orange)]/5 text-[var(--pf-orange)]' 
              : 'border-[var(--pf-border)] bg-[var(--pf-surface)] text-[var(--pf-text-muted)]'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-medium">{quota.message}</span>
              {quota.max_active_tracks && (
                <span className="text-xs">
                  {quota.active_tracks} / {quota.max_active_tracks} tracks
                </span>
              )}
            </div>
          </div>
        )}

        {/* Debug Panel (temporary) */}
        {debugInfo.length > 0 && (
          <div className="mb-6 p-3 rounded-lg border border-[var(--pf-border)] bg-[var(--pf-surface)] text-xs font-mono text-[var(--pf-text-muted)] space-y-1">
            <p className="font-semibold text-[var(--pf-text)]">Debug Log:</p>
            {debugInfo.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
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

          {/* Metadata */}
          <div className="pf-card p-6 space-y-4">
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
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--pf-text-muted)]">$</span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="pf-input pl-8"
                  placeholder="1.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <p className="text-xs text-[var(--pf-text-muted)] mt-1">Set to 0 for free download</p>
            </div>

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

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <Link href="/dashboard/artist" className="pf-btn pf-btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting || !audioFile || (quota && !quota.can_upload)}
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
// Cache bust: 1779424562
// deploy: 1779426061
