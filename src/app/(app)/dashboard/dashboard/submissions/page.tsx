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
  const [showDeclined, setShowDeclined] = useState(false)
  const [processing, setProcessing] = useState<string | null>(null)
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  
  useEffect(() => {
    fetchSubmissions()
  }, [])
  
  const fetchSubmissions = async () => {
    try {
      const res = await fetch('/api/submissions')
      if (res.ok) {
        const data = await res.json()
        setSubmissions(data)
      } else {
        setNotice({ type: 'error', message: 'Failed to load submissions' })
      }
    } catch (err) {
      console.error('Failed to fetch:', err)
      setNotice({ type: 'error', message: 'Network error loading submissions' })
    } finally {
      setLoading(false)
    }
  }
  
  const handleApprove = async (submission: Submission) => {
    setProcessing(submission.id)
    setNotice(null)
    try {
      const res = await fetch(`/api/submissions/${submission.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_secret: 'admin-secret' })
      })
      
      const data = await res.json().catch(() => ({}))
      
      if (!res.ok) {
        setNotice({ type: 'error', message: data.error || `Approve failed (HTTP ${res.status})` })
        return
      }
      
      // Force re-fetch to verify DB actually updated
      await fetchSubmissions()
      setNotice({ type: 'success', message: data.message || `${submission.stage_name} approved!` })
    } catch (err) {
      console.error('Approve failed:', err)
      setNotice({ type: 'error', message: 'Network error while approving' })
    } finally {
      setProcessing(null)
    }
  }
  
  const handleReject = async (submission: Submission) => {
    setProcessing(submission.id)
    setNotice(null)
    try {
      const res = await fetch(`/api/submissions/${submission.id}/decline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_secret: 'admin-secret' })
      })
      
      const data = await res.json().catch(() => ({}))
      
      if (!res.ok) {
        setNotice({ type: 'error', message: data.error || `Decline failed (HTTP ${res.status})` })
        return
      }
      
      // Force re-fetch to verify DB actually updated
      await fetchSubmissions()
      setNotice({ type: 'success', message: data.message || `${submission.stage_name} declined.` })
    } catch (err) {
      console.error('Reject failed:', err)
      setNotice({ type: 'error', message: 'Network error while declining' })
    } finally {
      setProcessing(null)
    }
  }
  
  const filteredSubmissions = submissions.filter(sub => {
    // If filter is 'pending' and showDeclined is OFF, hide rejected
    if (filter === 'pending' && !showDeclined && sub.status === 'rejected') return false
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
    <div className="min-h-screen w-full pt-20 pb-24 bg-[var(--pf-bg)] overflow-x-hidden">
      <div className="pf-container max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <h1 className="max-w-full break-words text-2xl font-bold leading-tight sm:text-3xl">
              Artist Submissions
            </h1>
            <p className="mt-1 text-[var(--pf-text-secondary)]">
              {pendingCount > 0 ? `${pendingCount} pending review` : 'All caught up!'}
            </p>
          </div>
          
          {/* Filters */}
          <div className="w-full md:w-auto">
            <div className="-mx-1 overflow-x-auto px-1 pb-1 md:mx-0 md:px-0 md:pb-0">
              <div className="flex min-w-max gap-2 rounded-lg bg-[var(--pf-surface)] p-1">
                {(['pending', 'approved', 'rejected', 'all'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`shrink-0 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition ${
                      filter === f 
                        ? 'bg-[var(--pf-orange)] text-white' 
                        : 'hover:bg-[var(--pf-border)]'
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                    {f === 'pending' && pendingCount > 0 && (
                      <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                        {pendingCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Show Declined Toggle (only on pending tab) */}
        {filter === 'pending' && (
          <div className="mb-4 flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-[var(--pf-text-secondary)] cursor-pointer">
              <input
                type="checkbox"
                checked={showDeclined}
                onChange={(e) => setShowDeclined(e.target.checked)}
                className="rounded border-[var(--pf-border)] bg-[var(--pf-surface)]"
              />
              Show declined submissions
            </label>
          </div>
        )}
        
        {/* Notice */}
        {notice && (
          <div className={`mb-4 p-3 rounded-xl flex items-center gap-2 text-sm ${
            notice.type === 'success'
              ? 'bg-green-500/10 border border-green-500/20 text-green-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}>
            {notice.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
            {notice.message}
          </div>
        )}
        
        {/* Submissions List */}
        {filteredSubmissions.length === 0 ? (
          <div className="w-full max-w-full rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)] py-16 text-center">
            <Music className="w-16 h-16 text-[var(--pf-text-secondary)] mx-auto mb-4 opacity-50" />
            <p className="text-[var(--pf-text-secondary)]">
              {filter === 'pending' ? 'No pending submissions' : `No ${filter} submissions`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSubmissions.map(sub => (
              <div
                key={sub.id}
                className="w-full max-w-full overflow-hidden rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)]"
              >
                {/* Header */}
                <div className="border-b border-[var(--pf-border)] p-4 sm:p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="break-words text-lg font-bold sm:text-xl">{sub.stage_name}</h3>
                      <p className="break-words text-sm text-[var(--pf-text-secondary)]">{sub.email}</p>
                    </div>
                    <div className={`self-start rounded-full px-3 py-1 text-sm font-medium ${
                      sub.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                      sub.status === 'approved' ? 'bg-green-500/20 text-green-500' :
                      'bg-red-500/20 text-red-500'
                    }`}>
                      {sub.status}
                    </div>
                  </div>
                  
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-[var(--pf-text-secondary)]">
                    {sub.genre && <span>🎵 {sub.genre}</span>}
                    {sub.city && <span>📍 {sub.city}</span>}
                    <span>📅 {new Date(sub.submitted_at).toLocaleDateString()}</span>
                  </div>
                  
                  {sub.bio && (
                    <p className="mt-3 break-words text-sm text-[var(--pf-text-secondary)]">{sub.bio}</p>
                  )}
                </div>
                
                {/* Tracks */}
                <div className="border-b border-[var(--pf-border)] bg-[var(--pf-bg)] p-4 sm:p-6">
                  <p className="text-sm font-medium mb-3">Tracks ({sub.tracks.length})</p>
                  <div className="space-y-2">
                    {sub.tracks.map((track, i) => (
                      <div
                        key={track.id || i}
                        className="flex w-full max-w-full flex-col gap-3 rounded-lg bg-[var(--pf-surface)] p-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex min-w-0 flex-1 items-start gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[var(--pf-orange)]/20">
                            <Music className="w-4 h-4 text-[var(--pf-orange)]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="block break-words font-medium">{track.filename}</span>
                            {track.size && (
                              <span className="mt-0.5 block text-xs text-[var(--pf-text-secondary)]">
                                ({(track.size / 1024 / 1024).toFixed(1)} MB)
                              </span>
                            )}
                          </div>
                        </div>
                        <a 
                          href={track.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="self-start rounded-lg p-2 transition hover:bg-[var(--pf-border)] sm:self-auto"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Actions */}
                {sub.status === 'pending' && (
                  <div className="flex flex-col gap-3 p-4 sm:flex-row">
                    <button
                      onClick={() => handleApprove(sub)}
                      disabled={processing === sub.id}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700 disabled:opacity-50 sm:flex-1"
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
                      className="flex w-full items-center justify-center rounded-lg border border-red-500/50 px-6 py-3 font-semibold text-red-500 transition hover:bg-red-500/10 disabled:opacity-50 sm:w-auto"
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
                        : '❌ Submission declined'}
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
