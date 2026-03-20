'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useSupabase } from '@/app/providers';
import { useRouter } from 'next/navigation';
import { Upload, Music, Play, Trash2, DollarSign, Clock, Disc, Plus } from 'lucide-react';

export default function UploadMusicPage() {
  const { user, supabase } = useSupabase()
  const router = useRouter()
  const [tracks, setTracks] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return
    
    const newTracks = Array.from(files)
      .filter(file => file.type.startsWith('audio/') || file.type === 'audio/mpeg')
      .map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'O D Porter',
        album: '',
        duration: '0:00',
        price: 1,
        file,
        preview: URL.createObjectURL(file),
      }))
    
    setTracks([...tracks, ...newTracks])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const removeTrack = (id: string) => {
    setTracks(tracks.filter(t => t.id !== id))
  }

  const updateTrack = (id: string, updates: any) => {
    setTracks(tracks.map(t => t.id === id ? { ...t, ...updates } : t))
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio()
      audio.addEventListener('loadedmetadata', () => {
        resolve(Math.floor(audio.duration))
      })
      audio.src = URL.createObjectURL(file)
    })
  }

  const handleUpload = async () => {
    if (!tracks.length) return
    setUploading(true)

    try {
      // Get durations for all tracks
      const tracksWithDuration = await Promise.all(
        tracks.map(async (track) => {
          if (track.file) {
            const duration = await getAudioDuration(track.file)
            return { ...track, duration: formatDuration(duration) }
          }
          return track
        })
      )

      if (supabase && user) {
        // Upload each track to Supabase Storage
        for (const track of tracksWithDuration) {
          if (!track.file) continue
          
          const fileName = `${user.id}/${Date.now()}-${track.file.name}`
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('music')
            .upload(fileName, track.file, {
              cacheControl: '3600',
              upsert: false
            })
          
          if (uploadError) {
            console.error('Upload error:', uploadError)
            continue
          }
          
          const { data: { publicUrl } } = supabase.storage
            .from('music')
            .getPublicUrl(fileName)
          
          await supabase.from('tracks').insert({
            artist_id: user.id,
            title: track.title,
            artist: track.artist,
            album: track.album || null,
            duration: track.duration,
            price: track.price,
            file_url: publicUrl,
            file_path: fileName,
            created_at: new Date().toISOString(),
          })
        }
        
        alert(`Uploaded ${tracks.length} track(s)!`)
        setTracks([])
      } else {
        alert('Please sign in to upload tracks.')
        router.push('/login')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="pf-container max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/artist" className="text-[var(--pf-text-secondary)] hover:text-white mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold mt-4">Upload Your Music</h1>
          <p className="text-[var(--pf-text-secondary)] mt-2">
            Add your tracks, set your prices, and let your fans support you directly.
          </p>
        </div>

        {/* Upload Area */}
        <div
          className={`pf-card p-12 text-center mb-8 transition-all ${
            dragOver ? 'border-[var(--pf-orange)] bg-[var(--pf-orange)]/5' : ''
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.mp3,.wav,.m4a,.flac"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
          
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[var(--pf-orange)]/20 flex items-center justify-center">
            <Upload className="text-[var(--pf-orange)]" size={40} />
          </div>
          
          <h3 className="text-xl font-semibold mb-2">Drag & Drop Your Tracks</h3>
          <p className="text-[var(--pf-text-secondary)] mb-6">
            or click to browse • MP3, WAV, M4A, FLAC supported
          </p>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="pf-btn pf-btn-primary"
          >
            <Music className="inline mr-2" size={18} />
            Select Files
          </button>
        </div>

        {/* Track List */}
        {tracks.length > 0 && (
          <div className="pf-card mb-8">
            <div className="p-4 border-b border-[var(--pf-border)]">
              <h2 className="font-semibold">{tracks.length} Track{tracks.length !== 1 ? 's' : ''} Selected</h2>
            </div>
            
            <div className="divide-y divide-[var(--pf-border)]">
              {tracks.map((track) => (
                <div key={track.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[var(--pf-orange)] to-purple-600 flex items-center justify-center shrink-0 text-2xl">
                      🎵
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-[var(--pf-text-muted)] mb-1">Title</label>
                          <input
                            type="text"
                            value={track.title}
                            onChange={(e) => updateTrack(track.id, { title: e.target.value })}
                            className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--pf-orange)]"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-[var(--pf-text-muted)] mb-1">Album (optional)</label>
                          <input
                            type="text"
                            value={track.album}
                            onChange={(e) => updateTrack(track.id, { album: e.target.value })}
                            placeholder="Single or Album name"
                            className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--pf-orange)]"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <label className="block text-sm text-[var(--pf-text-muted)] mb-1">
                          <DollarSign className="inline w-4 h-4" />
                          Minimum Price (Proud to Pay)
                        </label>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg overflow-hidden">
                            <button
                              onClick={() => updateTrack(track.id, { price: Math.max(1, track.price - 1) })}
                              className="px-3 py-2 hover:bg-[var(--pf-surface)] transition-colors"
                            >
                              -
                            </button>
                            <span className="px-4 py-2 font-bold">${track.price}</span>
                            <button
                              onClick={() => updateTrack(track.id, { price: track.price + 1 })}
                              className="px-3 py-2 hover:bg-[var(--pf-surface)] transition-colors"
                            >
                              +
                            </button>
                          </div>
                          <span className="text-sm text-[var(--pf-text-muted)]">
                            Fans can pay more if they want
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => removeTrack(track.id)}
                      className="p-2 text-[var(--pf-text-muted)] hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing Guide */}
        <div className="pf-card p-6 mb-8">
          <h3 className="font-semibold mb-4">Proud to Pay Pricing</h3>
          <p className="text-[var(--pf-text-secondary)] mb-4">
            Set your minimum price. Fans can always pay more if they want to support you extra.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-[var(--pf-bg)] rounded-lg p-4">
              <p className="text-2xl font-bold text-[var(--pf-orange)]">$1</p>
              <p className="text-sm text-[var(--pf-text-muted)]">Listener</p>
              <p className="text-xs text-[var(--pf-text-muted)]">Stream minimum</p>
            </div>
            <div className="bg-[var(--pf-bg)] rounded-lg p-4">
              <p className="text-2xl font-bold text-blue-400">$5</p>
              <p className="text-sm text-[var(--pf-text-muted)]">Supporter</p>
              <p className="text-xs text-[var(--pf-text-muted)]">+ bonus track</p>
            </div>
            <div className="bg-[var(--pf-bg)] rounded-lg p-4 border-2 border-purple-500">
              <p className="text-2xl font-bold text-purple-400">$10</p>
              <p className="text-sm text-[var(--pf-text-muted)]">Champion</p>
              <p className="text-xs text-[var(--pf-text-muted)]">+ name in credits</p>
            </div>
            <div className="bg-[var(--pf-bg)] rounded-lg p-4">
              <p className="text-2xl font-bold text-green-400">$20+</p>
              <p className="text-sm text-[var(--pf-text-muted)]">Patron</p>
              <p className="text-xs text-[var(--pf-text-muted)]">+ early access</p>
            </div>
          </div>
        </div>

        {/* Upload Button */}
        <div className="flex gap-4">
          <button
            onClick={handleUpload}
            disabled={tracks.length === 0 || uploading}
            className={`pf-btn pf-btn-primary flex-1 ${
              tracks.length === 0 || uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploading ? (
              'Uploading...'
            ) : (
              <>
                <Upload className="inline mr-2" size={18} />
                Upload {tracks.length} Track{tracks.length !== 1 ? 's' : ''}
              </>
            )}
          </button>
          
          <Link
            href="/dashboard/artist"
            className="pf-btn pf-btn-secondary"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Your Library Preview */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Your Music Library</h2>
          <div className="pf-card">
            <div className="p-8 text-center text-[var(--pf-text-muted)]">
              <Disc className="mx-auto mb-4 opacity-50" size={48} />
              <p>Your uploaded tracks will appear here</p>
              <p className="text-sm mt-2">Upload your first track above to get started</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}