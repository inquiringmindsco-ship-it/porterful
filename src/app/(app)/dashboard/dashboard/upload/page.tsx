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
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState('')

  // Upload state
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const audioInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

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
      if (data?.role !== 'artist') {
        router.push('/dashboard')
        return
      }
      setLoading(false)
    }
    checkAccess()
  }, [user, supabase, authLoading, router])

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
    if (!title) setTitle(file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '))
  }

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const data = await res.json()
    if (!res.ok || data.error) throw new Error(data.error || 'Upload failed')
    return data.url
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!audioFile) { setError('Please select an audio file'); return }
    if (!title.trim()) { setError('Please enter a track title'); return }

    setSubmitting(true)
    setError('')

    try {
      const audioUrl = await uploadFile(audioFile, 'audio')

      let coverUrl = ''
      if (coverFile) {
        coverUrl = await uploadFile(coverFile, 'artist-images')
      }

      const res = await fetch('/api/tracks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          audio_url: audioUrl,
          cover_url: coverUrl || null,
          album: album.trim() || null,
          price: parseFloat(price) || 0,
          description: description.trim() || null,
        }),
      })

      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || 'Failed to save track')

      setSuccess(true)
      setTimeout(() => router.push('/dashboard/artist'), 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
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

  if (success) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
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
    <div className="min-h-screen pt-24 pb-12">
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
