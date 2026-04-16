'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/app/providers'
import Link from 'next/link'

// Custom Porterful Icons
const Icon = {
  Upload: () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17,8 12,3 7,8" />
      <line x1="12" y1="3" x2="12" y2="15" />
      <circle cx="12" cy="3" r="1" fill="currentColor" />
    </svg>
  ),
  Music: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  ),
  Loader: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0110 10" />
    </svg>
  ),
  Check: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20,6 9,17 4,12" />
    </svg>
  ),
  Alert: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  X: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Info: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  Plus: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
}

export default function UploadPage() {
  const router = useRouter()
  const { user, supabase, loading: authLoading } = useSupabase()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<Record<string, number>>({})
  const [uploaded, setUploaded] = useState<string[]>([])
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    async function checkAccess() {
      if (authLoading) return
      if (!user) {
        router.push('/login')
        return
      }
      const { data } = await supabase!
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(data)
      if (data?.role !== 'artist') {
        router.push('/dashboard')
        return
      }
      setLoading(false)
    }
    checkAccess()
  }, [user, supabase, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="pf-container">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-[var(--pf-surface)] rounded w-1/4" />
            <div className="h-32 bg-[var(--pf-surface)] rounded" />
          </div>
        </div>
      </div>
    )
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      const audioFiles = selectedFiles.filter(f => 
        f.type.startsWith('audio/') || 
        f.name.endsWith('.mp3') || 
        f.name.endsWith('.m4a') ||
        f.name.endsWith('.wav')
      )
      setFiles(prev => [...prev, ...audioFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async () => {
    if (!user || files.length === 0) return
    
    setUploading(true)
    setErrors([])
    setUploaded([])

    for (const file of files) {
      try {
        // Use server-side upload API to bypass RLS
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', 'audio')
        
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        
        const data = await res.json().catch(() => ({ error: 'Invalid response from server' }))
        
        if (!res.ok || data.error) {
          throw new Error(data.error || data.details || 'Upload failed')
        }

        setUploaded(prev => [...prev, `${file.name} → Uploaded successfully`])
        setProgress(prev => ({ ...prev, [file.name]: 100 }))
        
      } catch (err: any) {
        console.error('Upload error:', err)
        setErrors(prev => [...prev, `${file.name}: ${err.message}`])
      }
    }

    setUploading(false)
    setFiles([])
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="pf-container max-w-2xl">
          <div className="bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-2xl p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--pf-orange)]/10 flex items-center justify-center">
              <Icon.Music />
            </div>
            <h1 className="text-2xl font-bold text-[var(--pf-text)] mb-4">Upload Your Music</h1>
            <p className="text-[var(--pf-text-secondary)] mb-6">
              Sign in to upload your tracks and start earning.
            </p>
            <Link href="/login" className="pf-btn pf-btn-primary">
              Sign In to Upload
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="pf-container max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--pf-text)]">Upload Music</h1>
          <p className="text-[var(--pf-text-secondary)] mt-2">
            Upload your tracks to Porterful. Supported formats: MP3, M4A, WAV (max 50MB)
          </p>
        </div>

        {/* Upload Area */}
        <div className="bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-2xl p-8 mb-6">
          <label className="block cursor-pointer">
            <div className="border-2 border-dashed border-[var(--pf-border)] rounded-xl p-12 text-center hover:border-[var(--pf-orange)] transition-colors">
              <div className="flex justify-center mb-4 text-[var(--pf-orange)]">
                <Icon.Upload />
              </div>
              <p className="text-xl font-medium text-[var(--pf-text)] mb-2">Drop your audio files here</p>
              <p className="text-[var(--pf-text-secondary)] mb-4">or click to browse</p>
              <input
                type="file"
                multiple
                accept="audio/*,.mp3,.m4a,.wav"
                onChange={handleFileSelect}
                className="hidden"
              />
              <span className="pf-btn pf-btn-secondary inline-flex items-center gap-2">
                <Icon.Plus /> Select Files
              </span>
            </div>
          </label>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-2xl p-6 mb-6">
            <h2 className="font-bold text-[var(--pf-text)] mb-4">Files to Upload ({files.length})</h2>
            <div className="space-y-3">
              {files.map((file, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-[var(--pf-bg)] rounded-lg border border-[var(--pf-border)]">
                  <div className="text-[var(--pf-orange)]">
                    <Icon.Music />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--pf-text)] truncate">{file.name}</p>
                    <p className="text-sm text-[var(--pf-text-secondary)]">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => removeFile(i)}
                    className="p-2 hover:bg-red-500/10 rounded-lg text-[var(--pf-text-muted)] hover:text-red-400 transition-colors"
                    disabled={uploading}
                  >
                    <Icon.X />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={uploadFiles}
                disabled={uploading || files.length === 0}
                className="pf-btn pf-btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Icon.Loader />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Icon.Upload />
                    Upload {files.length} file{files.length !== 1 ? 's' : ''}
                  </>
                )}
              </button>
              <button
                onClick={() => setFiles([])}
                disabled={uploading}
                className="pf-btn pf-btn-secondary"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Source Selection */}
        <div className="bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-[var(--pf-text)] mb-4">Upload Source</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 rounded-xl border-2 border-[var(--pf-orange)] bg-[var(--pf-orange)]/5 text-left">
              <div className="font-medium text-[var(--pf-text)]">Local Files</div>
              <div className="text-sm text-[var(--pf-text-secondary)]">Upload from your device</div>
            </button>
            <button className="p-4 rounded-xl border-2 border-[var(--pf-border)] hover:border-[var(--pf-orange)] text-left transition-colors">
              <div className="font-medium text-[var(--pf-text)]">URL Import</div>
              <div className="text-sm text-[var(--pf-text-secondary)]">Import from URL</div>
            </button>
          </div>
          <p className="text-sm text-[var(--pf-text-secondary)] mt-4">
            <strong className="text-[var(--pf-text)]">Source:</strong> Files uploaded from your device will be stored in Porterful's CDN and available for streaming.
          </p>
        </div>

        {/* Uploaded Results */}
        {uploaded.length > 0 && (
          <div className="bg-[var(--pf-surface)] border-2 border-green-500/50 rounded-2xl p-6 mb-6">
            <h2 className="font-bold text-[var(--pf-text)] mb-4 flex items-center gap-2">
              <span className="text-green-500"><Icon.Check /></span>
              Uploaded Successfully ({uploaded.length})
            </h2>
            <div className="space-y-2">
              {uploaded.map((url, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-green-500"><Icon.Check /></span>
                  <span className="text-[var(--pf-text)] truncate">{url}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Errors */}
        {errors.length > 0 && (
          <div className="bg-[var(--pf-surface)] border-2 border-red-500/50 rounded-2xl p-6 mb-6">
            <h2 className="font-bold text-[var(--pf-text)] mb-4 flex items-center gap-2">
              <span className="text-red-500"><Icon.Alert /></span>
              Upload Errors
            </h2>
            <div className="space-y-2">
              {errors.map((err, i) => (
                <div key={i} className="text-sm text-red-400">{err}</div>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="bg-[var(--pf-orange)]/5 border border-[var(--pf-orange)]/20 rounded-2xl p-6">
          <h3 className="font-bold text-[var(--pf-text)] mb-3 flex items-center gap-2">
            <span className="text-[var(--pf-orange)]"><Icon.Info /></span>
            Upload Guidelines
          </h3>
          <ul className="text-[var(--pf-text-secondary)] space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-[var(--pf-orange)]">•</span>
              <span className="text-[var(--pf-text)]">Maximum file size:</span> 50MB per track
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--pf-orange)]">•</span>
              <span className="text-[var(--pf-text)]">Supported formats:</span> MP3, M4A, WAV
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--pf-orange)]">•</span>
              <span className="text-[var(--pf-text)]">Revenue split:</span> You keep 80% of every sale
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--pf-orange)]">•</span>
              <span className="text-[var(--pf-text)]">Pricing:</span> Set your price after upload
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--pf-orange)]">•</span>
              <span className="text-[var(--pf-text)]">Artwork:</span> Add album art and metadata in the next step
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}