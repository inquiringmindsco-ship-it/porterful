'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useSupabase } from '@/app/providers';
import { useRouter } from 'next/navigation';
import { Upload, Music, Play, Trash2, DollarSign, Clock, Disc, Image as ImageIcon, Check } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  price: number;
  file: File | null;
  preview: string | null;
  artFile: File | null;
  artPreview: string | null;
}

export default function UploadMusicPage() {
  const { user, supabase } = useSupabase()
  const router = useRouter()
  const [tracks, setTracks] = useState<Track[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [uploadedTracks, setUploadedTracks] = useState<Track[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return
    
    const newTracks: Track[] = Array.from(files)
      .filter(file => file.type.startsWith('audio/') || file.type === 'audio/mpeg')
      .map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'O D Porter',
        album: '',
        duration: '0:00',
        price: 5,
        file,
        preview: URL.createObjectURL(file),
        artFile: null,
        artPreview: null,
      }))
    
    setTracks([...tracks, ...newTracks])
  }

  const handleArtSelect = (trackId: string, files: FileList | null) => {
    if (!files || files.length === 0) return
    
    const file = files[0]
    if (!file.type.startsWith('image/')) return
    
    setTracks(tracks.map(track => 
      track.id === trackId 
        ? { ...track, artFile: file, artPreview: URL.createObjectURL(file) }
        : track
    ))
  }

  const removeTrack = (id: string) => {
    setTracks(tracks.filter(t => t.id !== id))
  }

  const updateTrack = (id: string, updates: Partial<Track>) => {
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
          
          // Upload album art if provided
          let coverUrl = null
          if (track.artFile) {
            const artFileName = `${user.id}/${Date.now()}-art-${track.artFile.name}`
            const { data: artData, error: artError } = await supabase.storage
              .from('music')
              .upload(artFileName, track.artFile, {
                cacheControl: '3600',
                upsert: false
              })
            
            if (!artError) {
              const { data: { publicUrl: artUrl } } = supabase.storage
                .from('music')
                .getPublicUrl(artFileName)
              coverUrl = artUrl
            }
          }
          
          // Parse duration to seconds
          const durationParts = track.duration.split(':')
          const durationSeconds = parseInt(durationParts[0]) * 60 + (parseInt(durationParts[1]) || 0)
          
          await supabase.from('tracks').insert({
            artist_id: user.id,
            title: track.title,
            artist: track.artist,
            album: track.album || null,
            duration: durationSeconds,
            audio_url: publicUrl,
            cover_url: coverUrl,
            play_count: 0,
            proud_to_pay_min: track.price,
            is_active: true,
          })
        }
        
        setUploadedTracks(tracksWithDuration)
        setTracks([])
        
        // Redirect to dashboard after successful upload
        setTimeout(() => {
          router.push('/dashboard/artist')
        }, 2000)
      } else {
        setUploadedTracks(tracksWithDuration)
        setTracks([])
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
            Add your tracks, set your prices. Keep 80% of every sale.
          </p>
        </div>

        {/* Upload Area */}
        <div
          className={`pf-card p-12 text-center mb-8 transition-all ${
            dragOver ? 'border-[var(--pf-orange)] bg-[var(--pf-orange)]/5' : ''
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files) }}
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

        {/* Uploaded Tracks */}
        {uploadedTracks.length > 0 && (
          <div className="pf-card p-6 mb-8 bg-green-500/10 border border-green-500/30">
            <div className="flex items-center gap-3 mb-4">
              <Check className="text-green-400" size={24} />
              <h3 className="text-lg font-semibold">Upload Complete!</h3>
            </div>
            <p className="text-[var(--pf-text-secondary)] mb-4">
              Your tracks have been uploaded. They'll appear in your library shortly.
            </p>
            <div className="space-y-2">
              {uploadedTracks.map((track) => (
                <div key={track.id} className="flex items-center gap-3 p-3 bg-[var(--pf-bg)] rounded-lg">
                  <Music className="text-[var(--pf-orange)]" size={20} />
                  <div className="flex-1">
                    <p className="font-medium">{track.title}</p>
                    <p className="text-sm text-[var(--pf-text-muted)]">${track.price} minimum</p>
                  </div>
                  <Check className="text-green-400" size={20} />
                </div>
              ))}
            </div>
            <Link href="/dashboard/artist" className="pf-btn pf-btn-primary mt-4 inline-block">
              View in Dashboard
            </Link>
          </div>
        )}

        {/* Track List */}
        {tracks.length > 0 && (
          <div className="pf-card mb-8">
            <div className="p-4 border-b border-[var(--pf-border)]">
              <h2 className="font-semibold">{tracks.length} Track{tracks.length !== 1 ? 's' : ''} Selected</h2>
            </div>
            
            <div className="divide-y divide-[var(--pf-border)]">
              {tracks.map((track) => (
                <div key={track.id} className="p-4">
                  <div className="flex gap-4">
                    {/* Track Art or Placeholder */}
                    <div className="w-20 h-20 rounded-lg bg-[var(--pf-surface)] overflow-hidden shrink-0 relative group">
                      {track.artPreview ? (
                        <img src={track.artPreview} alt="Album art" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">
                          🎵
                        </div>
                      )}
                      <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <ImageIcon size={20} className="text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleArtSelect(track.id, e.target.files)}
                        />
                      </label>
                    </div>
                    
                    {/* Track Info */}
                    <div className="flex-1 min-w-0">
                      <div className="grid md:grid-cols-2 gap-3">
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
                      
                      {/* Price */}
                      <div className="mt-3">
                        <label className="block text-sm text-[var(--pf-text-muted)] mb-1">
                          <DollarSign className="inline w-4 h-4" />
                          Minimum Price
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
                            Fans can pay more
                          </span>
                        </div>
                      </div>
                      
                      {/* Album Art Button */}
                      <button
                        onClick={() => {
                          const input = document.createElement('input')
                          input.type = 'file'
                          input.accept = 'image/*'
                          input.onchange = (e) => handleArtSelect(track.id, (e.target as any).files)
                          input.click()
                        }}
                        className="mt-3 text-sm text-[var(--pf-orange)] hover:underline"
                      >
                        {track.artPreview ? 'Change album art' : '+ Add album art'}
                      </button>
                    </div>
                    
                    {/* Remove */}
                    <button
                      onClick={() => removeTrack(track.id)}
                      className="p-2 text-[var(--pf-text-muted)] hover:text-red-400 transition-colors self-start"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Button */}
        {tracks.length > 0 && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full pf-btn pf-btn-primary text-lg py-4 mb-8"
          >
            {uploading ? 'Uploading...' : `Upload ${tracks.length} Track${tracks.length !== 1 ? 's' : ''}`}
          </button>
        )}

        {/* Your Library */}
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