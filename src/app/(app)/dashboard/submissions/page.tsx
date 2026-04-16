'use client'

import { useState, useEffect } from 'react'
import { Music, Check, X, ExternalLink, Clock, AlertCircle } from 'lucide-react'

interface Submission {
  id: string
  stage_name: string
  email: string
  genre?: string
  city?: string
  bio?: string
  status: 'pending' | 'approved' | 'rejected'
  submitted_at: string
  tracks: {
    id: string
    filename: string
    url: string
    size?: number
  }[]
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [processing, setProcessing] = useState<string | null>(null)
  
  useEffect(() => {
    fetchSubmissions()
  }, [])
  
  const fetchSubmissions = async () => {
    try {
      const res = await fetch('/api/submissions')
      if (res.ok) {
        const data = await res.json()
        setSubmissions(data)
      }
    } catch (err) {
      console.error('Failed to fetch:', err)
    } finally {
      setLoading(false)
    }
  }
  
  const handleApprove = async (submission: Submission) => {
    setProcessing(submission.id)
    try {
      // In a real app, this would:
      // 1. Move tracks from submissions/pending to artists/{slug}/
      // 2. Create artist profile in database
      // 3. Send approval email
      // 4. Update submission status
      
      const res = await fetch(`/api/submissions/${submission.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission)
      })
      
      if (res.ok) {
        setSubmissions(subs => 
          subs.map(s => s.id === submission.id ? { ...s, status: 'approved' as const } : s)
        )
      }
    } catch (err) {
      console.error('Approve failed:', err)
    } finally {
      setProcessing(null)
    }
  }
  
  const handleReject = async (submission: Submission) => {
    setProcessing(submission.id)
    try {
      await fetch(`/api/submissions/${submission.id}/reject`, {
        method: 'POST'
      })
      setSubmissions(subs => 
        subs.map(s => s.id === submission.id ? { ...s, status: 'rejected' as const } : s)
      )
    } catch (err) {
      console.error('Reject failed:', err)
    } finally {
      setProcessing(null)
    }
  }
  
  const filteredSubmissions = submissions.filter(sub => {
    if (filter === 'all') return true
    return sub.status === filter
  })
  
  const pendingCount = submissions.filter(s => s.status === 'pending').length
  
  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--pf-orange)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--pf-text-secondary)]">Loading submissions...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen pt-20 pb-24 bg-[var(--pf-bg)]">
      <div className="pf-container max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Artist Submissions</h1>
            <p className="text-[var(--pf-text-secondary)]">
              {pendingCount > 0 ? `${pendingCount} pending review` : 'All caught up!'}
            </p>
          </div>
          
          {/* Filters */}
          <div className="flex gap-2 bg-[var(--pf-surface)] p-1 rounded-lg">
            {(['pending', 'approved', 'rejected', 'all'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  filter === f 
                    ? 'bg-[var(--pf-orange)] text-white' 
                    : 'hover:bg-[var(--pf-border)]'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f === 'pending' && pendingCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
        
        {/* Submissions List */}
        {filteredSubmissions.length === 0 ? (
          <div className="text-center py-16 bg-[var(--pf-surface)] rounded-xl border border-[var(--pf-border)]">
            <Music className="w-16 h-16 text-[var(--pf-text-secondary)] mx-auto mb-4 opacity-50" />
            <p className="text-[var(--pf-text-secondary)]">
              {filter === 'pending' ? 'No pending submissions' : `No ${filter} submissions`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSubmissions.map(sub => (
              <div key={sub.id} className="bg-[var(--pf-surface)] rounded-xl border border-[var(--pf-border)] overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-[var(--pf-border)]">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold">{sub.stage_name}</h3>
                      <p className="text-[var(--pf-text-secondary)] text-sm">{sub.email}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      sub.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                      sub.status === 'approved' ? 'bg-green-500/20 text-green-500' :
                      'bg-red-500/20 text-red-500'
                    }`}>
                      {sub.status}
                    </div>
                  </div>
                  
                  <div className="flex gap-4 mt-3 text-sm text-[var(--pf-text-secondary)]">
                    {sub.genre && <span>🎵 {sub.genre}</span>}
                    {sub.city && <span>📍 {sub.city}</span>}
                    <span>📅 {new Date(sub.submitted_at).toLocaleDateString()}</span>
                  </div>
                  
                  {sub.bio && (
                    <p className="mt-3 text-sm text-[var(--pf-text-secondary)]">{sub.bio}</p>
                  )}
                </div>
                
                {/* Tracks */}
                <div className="p-6 border-b border-[var(--pf-border)] bg-[var(--pf-bg)]">
                  <p className="text-sm font-medium mb-3">Tracks ({sub.tracks.length})</p>
                  <div className="space-y-2">
                    {sub.tracks.map((track, i) => (
                      <div key={track.id || i} className="flex items-center justify-between bg-[var(--pf-surface)] rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[var(--pf-orange)]/20 rounded flex items-center justify-center">
                            <Music className="w-4 h-4 text-[var(--pf-orange)]" />
                          </div>
                          <span className="font-medium">{track.filename}</span>
                          {track.size && (
                            <span className="text-xs text-[var(--pf-text-secondary)]">
                              ({(track.size / 1024 / 1024).toFixed(1)} MB)
                            </span>
                          )}
                        </div>
                        <a 
                          href={track.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-[var(--pf-border)] rounded-lg transition"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Actions */}
                {sub.status === 'pending' && (
                  <div className="p-4 flex gap-3">
                    <button
                      onClick={() => handleApprove(sub)}
                      disabled={processing === sub.id}
                      className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {processing === sub.id ? (
                        <Clock className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          Approve & Set Up
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleReject(sub)}
                      disabled={processing === sub.id}
                      className="px-6 border border-red-500/50 text-red-500 py-3 rounded-lg font-semibold hover:bg-red-500/10 transition disabled:opacity-50"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
                
                {sub.status !== 'pending' && (
                  <div className="p-4 bg-[var(--pf-bg)]">
                    <p className={`text-sm ${sub.status === 'approved' ? 'text-green-500' : 'text-red-500'}`}>
                      {sub.status === 'approved' 
                        ? '✅ Artist approved and set up on Porterful'
                        : '❌ Submission rejected'}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
