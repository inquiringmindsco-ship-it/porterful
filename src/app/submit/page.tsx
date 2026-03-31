'use client'

import { useState } from 'react'
import { Upload, Music, CheckCircle, AlertCircle, X } from 'lucide-react'

export default function SubmitPage() {
  const [step, setStep] = useState(1)
  const [uploading, setUploading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  
  const [form, setForm] = useState({
    stage_name: '',
    email: '',
    genre: '',
    city: '',
    bio: '',
  })
  
  const [tracks, setTracks] = useState<File[]>([])
  const [trackPreviews, setTrackPreviews] = useState<string[]>([])
  
  const handleTrackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 3) {
      setError('Maximum 3 MP3 files allowed')
      return
    }
    // Validate MP3
    for (const file of files) {
      if (!file.type.includes('audio') && !file.name.endsWith('.mp3')) {
        setError('Only MP3 files are allowed')
        return
      }
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        setError('Each file must be under 50MB')
        return
      }
    }
    setError('')
    setTracks(files)
    setTrackPreviews(files.map(f => URL.createObjectURL(f)))
  }
  
  const removeTrack = (index: number) => {
    const newTracks = [...tracks]
    const newPreviews = [...trackPreviews]
    newTracks.splice(index, 1)
    newPreviews.splice(index, 1)
    setTracks(newTracks)
    setTrackPreviews(newPreviews)
  }
  
  const handleSubmit = async () => {
    if (!form.stage_name || !form.email) {
      setError('Stage name and email are required')
      return
    }
    if (tracks.length === 0) {
      setError('Please upload at least 1 MP3 file')
      return
    }
    
    setUploading(true)
    setError('')
    
    try {
      // Upload each track
      const uploadPromises = tracks.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', 'submissions/pending')
        
        const res = await fetch('/api/submissions/upload', {
          method: 'POST',
          body: formData
        })
        
        if (!res.ok) throw new Error('Upload failed')
        return res.json()
      })
      
      const uploadedTracks = await Promise.all(uploadPromises)
      
      // Submit the application
      const submitRes = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          tracks: uploadedTracks.map((t, i) => ({
            name: tracks[i].name,
            url: t.url,
            path: t.path,
            size: tracks[i].size
          }))
        })
      })
      
      if (!submitRes.ok) throw new Error('Submission failed')
      
      setSubmitted(true)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setUploading(false)
    }
  }
  
  if (submitted) {
    return (
      <div className="min-h-screen pt-24 pb-24 bg-[var(--pf-bg)] flex items-center justify-center">
        <div className="max-w-md w-full mx-4 text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Submission Received!</h1>
          <p className="text-[var(--pf-text-secondary)] mb-6">
            We've received your music. We'll review it and get back to you within 48 hours.
            If approved, your tracks will be live on Porterful!
          </p>
          <a href="/store" className="inline-block bg-[var(--pf-orange)] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[var(--pf-orange)]/90 transition">
            Browse the Store
          </a>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen pt-24 pb-24 bg-[var(--pf-bg)]">
      <div className="pf-container max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-2">Submit Your Music</h1>
          <p className="text-[var(--pf-text-secondary)]">Upload your tracks and we'll get you set up on Porterful</p>
        </div>
        
        {/* Progress */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-[var(--pf-orange)] text-white' : 'bg-[var(--pf-surface)] text-[var(--pf-text-secondary)]'}`}>1</div>
          <div className="w-12 h-0.5 bg-[var(--pf-border)]" />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-[var(--pf-orange)] text-white' : 'bg-[var(--pf-surface)] text-[var(--pf-text-secondary)]'}`}>2</div>
        </div>
        
        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}
        
        {/* Step 1: Info */}
        {step === 1 && (
          <div className="bg-[var(--pf-surface)] rounded-xl p-6 border border-[var(--pf-border)]">
            <h2 className="text-xl font-bold mb-6">About You</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Stage Name *</label>
                <input
                  type="text"
                  value={form.stage_name}
                  onChange={(e) => setForm({...form, stage_name: e.target.value})}
                  className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--pf-orange)]"
                  placeholder="Your artist name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                  className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--pf-orange)]"
                  placeholder="your@email.com"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Genre</label>
                  <input
                    type="text"
                    value={form.genre}
                    onChange={(e) => setForm({...form, genre: e.target.value})}
                    className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--pf-orange)]"
                    placeholder="Hip-Hop, R&B, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({...form, city: e.target.value})}
                    className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--pf-orange)]"
                    placeholder="St. Louis, MO"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({...form, bio: e.target.value})}
                  className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--pf-orange)] h-24 resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
            
            <button
              onClick={() => setStep(2)}
              className="w-full mt-6 bg-[var(--pf-orange)] text-white py-3 rounded-lg font-semibold hover:bg-[var(--pf-orange)]/90 transition"
            >
              Next: Upload Tracks
            </button>
          </div>
        )}
        
        {/* Step 2: Upload */}
        {step === 2 && (
          <div className="bg-[var(--pf-surface)] rounded-xl p-6 border border-[var(--pf-border)]">
            <h2 className="text-xl font-bold mb-2">Upload Your Tracks</h2>
            <p className="text-[var(--pf-text-secondary)] text-sm mb-6">Upload up to 3 MP3 files. Maximum 50MB per file.</p>
            
            {/* Upload Area */}
            <label className="border-2 border-dashed border-[var(--pf-border)] rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[var(--pf-orange)] transition mb-6">
              <input
                type="file"
                accept=".mp3,audio/mpeg"
                multiple
                onChange={handleTrackChange}
                className="hidden"
              />
              <Upload className="w-12 h-12 text-[var(--pf-text-secondary)] mb-4" />
              <p className="font-medium mb-1">Click to upload MP3 files</p>
              <p className="text-sm text-[var(--pf-text-secondary)]">or drag and drop</p>
            </label>
            
            {/* Track List */}
            {tracks.length > 0 && (
              <div className="space-y-3 mb-6">
                {tracks.map((track, i) => (
                  <div key={i} className="bg-[var(--pf-bg)] rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[var(--pf-orange)]/20 rounded-lg flex items-center justify-center">
                        <Music className="w-5 h-5 text-[var(--pf-orange)]" />
                      </div>
                      <div>
                        <p className="font-medium truncate max-w-xs">{track.name}</p>
                        <p className="text-xs text-[var(--pf-text-secondary)]">{(track.size / 1024 / 1024).toFixed(1)} MB</p>
                      </div>
                    </div>
                    <button onClick={() => removeTrack(i)} className="p-2 hover:bg-[var(--pf-border)] rounded-lg transition">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-[var(--pf-border)] py-3 rounded-lg font-semibold hover:bg-[var(--pf-border)] transition"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={uploading || tracks.length === 0}
                className="flex-1 bg-[var(--pf-orange)] text-white py-3 rounded-lg font-semibold hover:bg-[var(--pf-orange)]/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : 'Submit for Review'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
