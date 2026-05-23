'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

type Application = {
  id: string
  user_id: string
  stage_name: string
  genre: string
  city: string
  bio: string
  email: string | null
  phone: string | null
  instagram: string | null
  twitter: string | null
  youtube: string | null
  tiktok: string | null
  spotify: string | null
  apple_music: string | null
  soundcloud: string | null
  avatar_url: string | null
  cover_image_url: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export default function AdminPage() {
  const [apps, setApps] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/artist-application')
      const data = await res.json()
      if (data.applications) setApps(data.applications)
    } catch (err) {
      console.error('Failed to load:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    setActionLoading(true)
    try {
      const res = await fetch('/api/artist-application/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, admin_secret: 'admin-secret' }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        console.error('Approval failed:', data.error || `HTTP ${res.status}`)
        alert('Failed to update status: ' + (data.error || 'Unknown error'))
        return
      }
      fetchApplications()
      setSelectedApp(null)
    } catch (err) {
      console.error('Update failed:', err)
      alert('Network error while updating status')
    } finally {
      setActionLoading(false)
    }
  }

  const filteredApps = apps.filter(a => a.status === tab)

  return (
    <div className="min-h-screen bg-[var(--pf-bg)] overflow-x-hidden">
      {/* Header */}
      <div className="border-b border-[var(--pf-border)] bg-[var(--pf-bg-secondary)]">
        <div className="pf-container py-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <Link href="/" className="text-xl font-bold text-[var(--pf-orange)]">PORTERFUL</Link>
                <p className="text-xs text-[var(--pf-text-muted)] mt-0.5">Artist Applications</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{apps.filter(a => a.status === 'pending').length} pending</div>
                <div className="text-xs text-[var(--pf-text-muted)]">review queue</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs - Mobile: full width scroll, Desktop: inline */}
      <div className="border-b border-[var(--pf-border)]">
        <div className="pf-container overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {(['pending', 'approved', 'rejected'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 sm:px-5 py-3 text-sm font-medium capitalize transition-colors whitespace-nowrap ${
                  tab === t
                    ? 'text-[var(--pf-orange)] border-b-2 border-[var(--pf-orange)]'
                    : 'text-[var(--pf-text-muted)] hover:text-white'
                }`}
              >
                {t}
                {t === 'pending' && apps.filter(a => a.status === 'pending').length > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 bg-[var(--pf-orange)] text-white text-xs rounded-full">
                    {apps.filter(a => a.status === 'pending').length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pf-container py-4 sm:py-8">
        {loading ? (
          <div className="text-center py-20 text-[var(--pf-text-muted)]">Loading...</div>
        ) : filteredApps.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4 opacity-20">
              {tab === 'pending' ? '✓' : tab === 'approved' ? '★' : '×'}
            </div>
            <p className="text-[var(--pf-text-muted)]">
              {tab === 'pending' ? 'No applications waiting' : tab === 'approved' ? 'No approved artists yet' : 'No rejected applications'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredApps.map(app => (
              <div
                key={app.id}
                className="bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-xl p-5 hover:border-[var(--pf-orange)]/30 transition-colors cursor-pointer"
                onClick={() => setSelectedApp(app)}
              >
                <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-[var(--pf-bg-secondary)] shrink-0">
                    {app.avatar_url ? (
                      <Image src={app.avatar_url} alt={app.stage_name} width={56} height={56} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-[var(--pf-text-muted)]">
                        {app.stage_name[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start sm:items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-lg">{app.stage_name}</h3>
                      {app.genre && (
                        <span className="px-2 py-0.5 bg-[var(--pf-orange)]/10 text-[var(--pf-orange)] text-xs rounded-full">
                          {app.genre}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[var(--pf-text-muted)] truncate max-w-full">
                      {app.city && `${app.city} · `}
                      {app.instagram && `IG: @${app.instagram} `}
                      {app.youtube && `· YT: ${app.youtube}`}
                    </p>
                    {app.bio && (
                      <p className="text-xs text-[var(--pf-text-muted)] mt-1 line-clamp-1">{app.bio}</p>
                    )}
                  </div>

                  {/* Date */}
                  <div className="text-right shrink-0">
                    <div className="text-xs text-[var(--pf-text-muted)]">
                      {new Date(app.created_at).toLocaleDateString()}
                    </div>
                    {app.status === 'pending' && (
                      <div className="mt-1">
                        <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 text-xs rounded-full">New</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedApp(null)}>
          <div className="bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-[var(--pf-border)]">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-[var(--pf-bg-secondary)] shrink-0">
                  {selectedApp.avatar_url ? (
                    <Image src={selectedApp.avatar_url} alt={selectedApp.stage_name} width={64} height={64} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-[var(--pf-text-muted)]">
                      {selectedApp.stage_name[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedApp.stage_name}</h2>
                  <p className="text-sm text-[var(--pf-text-muted)]">
                    {selectedApp.city}{selectedApp.genre && ` · ${selectedApp.genre}`}
                  </p>
                  <p className="text-xs text-[var(--pf-text-muted)] mt-1">
                    Applied {new Date(selectedApp.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>

            {/* Bio */}
            {selectedApp.bio && (
              <div className="p-6 border-b border-[var(--pf-border)]">
                <h3 className="text-xs uppercase tracking-wider text-[var(--pf-text-muted)] mb-2">Bio</h3>
                <p className="text-sm text-[var(--pf-text-secondary)] leading-relaxed">{selectedApp.bio}</p>
              </div>
            )}

            {/* Contact Info */}
            {(selectedApp.email || selectedApp.phone) && (
              <div className="p-6 border-b border-[var(--pf-border)]">
                <h3 className="text-xs uppercase tracking-wider text-[var(--pf-text-muted)] mb-3">Contact</h3>
                <div className="space-y-2">
                  {selectedApp.email && (
                    <a href={`mailto:${selectedApp.email}`} className="flex items-center gap-3 px-3 py-2 bg-[var(--pf-bg-secondary)] rounded-lg text-sm hover:border-[var(--pf-orange)] border border-transparent transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--pf-orange)]"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                      <span>{selectedApp.email}</span>
                    </a>
                  )}
                  {selectedApp.phone && (
                    <a href={`tel:${selectedApp.phone}`} className="flex items-center gap-3 px-3 py-2 bg-[var(--pf-bg-secondary)] rounded-lg text-sm hover:border-[var(--pf-orange)] border border-transparent transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--pf-orange)]"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                      <span>{selectedApp.phone}</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Social */}
            <div className="p-4 sm:p-6">
              <h3 className="text-xs uppercase tracking-wider text-[var(--pf-text-muted)] mb-3">Links</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedApp.instagram && (
                  <a href={`https://instagram.com/${selectedApp.instagram}`} target="_blank" className="flex items-center gap-2 px-3 py-2 bg-[var(--pf-bg-secondary)] rounded-lg text-sm hover:border-[var(--pf-orange)] border border-transparent transition-colors">
                    <span className="text-pink-400">IG</span>
                    <span>@{selectedApp.instagram}</span>
                  </a>
                )}
                {selectedApp.youtube && (
                  <a href={`https://youtube.com/${selectedApp.youtube.replace('@', '')}`} target="_blank" className="flex items-center gap-2 px-3 py-2 bg-[var(--pf-bg-secondary)] rounded-lg text-sm hover:border-[var(--pf-orange)] border border-transparent transition-colors">
                    <span className="text-red-400">YT</span>
                    <span>{selectedApp.youtube}</span>
                  </a>
                )}
                {selectedApp.tiktok && (
                  <a href={`https://tiktok.com/@${selectedApp.tiktok}`} target="_blank" className="flex items-center gap-2 px-3 py-2 bg-[var(--pf-bg-secondary)] rounded-lg text-sm hover:border-[var(--pf-orange)] border border-transparent transition-colors">
                    <span className="text-pink-500">TT</span>
                    <span>@{selectedApp.tiktok}</span>
                  </a>
                )}
                {selectedApp.twitter && (
                  <a href={`https://twitter.com/${selectedApp.twitter}`} target="_blank" className="flex items-center gap-2 px-3 py-2 bg-[var(--pf-bg-secondary)] rounded-lg text-sm hover:border-[var(--pf-orange)] border border-transparent transition-colors">
                    <span className="text-blue-400">X</span>
                    <span>@{selectedApp.twitter}</span>
                  </a>
                )}
                {selectedApp.spotify && (
                  <a href={selectedApp.spotify} target="_blank" className="flex items-center gap-2 px-3 py-2 bg-[var(--pf-bg-secondary)] rounded-lg text-sm hover:border-[var(--pf-orange)] border border-transparent transition-colors col-span-2">
                    <span className="text-green-400">Spotify</span>
                    <span className="truncate">{selectedApp.spotify}</span>
                  </a>
                )}
                {selectedApp.apple_music && (
                  <a href={selectedApp.apple_music} target="_blank" className="flex items-center gap-2 px-3 py-2 bg-[var(--pf-bg-secondary)] rounded-lg text-sm hover:border-[var(--pf-orange)] border border-transparent transition-colors col-span-2">
                    <span className="text-pink-400">Apple Music</span>
                    <span className="truncate">{selectedApp.apple_music}</span>
                  </a>
                )}
                {selectedApp.soundcloud && (
                  <a href={selectedApp.soundcloud} target="_blank" className="flex items-center gap-2 px-3 py-2 bg-[var(--pf-secondary)] rounded-lg text-sm hover:border-[var(--pf-orange)] border border-transparent transition-colors col-span-2">
                    <span className="text-orange-400">SoundCloud</span>
                    <span className="truncate">{selectedApp.soundcloud}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Images */}
            <div className="p-4 sm:p-6 border-b border-[var(--pf-border)]">
              <h3 className="text-xs uppercase tracking-wider text-[var(--pf-text-muted)] mb-3">Submitted Images</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedApp.avatar_url ? (
                  <div>
                    <p className="text-xs text-[var(--pf-text-muted)] mb-1">Avatar</p>
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-[var(--pf-bg-secondary)]">
                      <Image src={selectedApp.avatar_url} alt="Avatar" fill className="object-cover" />
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-4 bg-[var(--pf-bg-secondary)] rounded-lg">
                    <p className="text-xs text-[var(--pf-text-muted)]">No avatar submitted</p>
                  </div>
                )}
                {selectedApp.cover_image_url ? (
                  <div>
                    <p className="text-xs text-[var(--pf-text-muted)] mb-1">Cover</p>
                    <div className="relative w-full aspect-[3/1] rounded-lg overflow-hidden bg-[var(--pf-bg-secondary)]">
                      <Image src={selectedApp.cover_image_url} alt="Cover" fill className="object-cover" />
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-4 bg-[var(--pf-bg-secondary)] rounded-lg">
                    <p className="text-xs text-[var(--pf-text-muted)]">No cover submitted</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {selectedApp.status === 'pending' && (
              <div className="p-4 sm:p-6">
                <p className="text-xs text-[var(--pf-text-muted)] mb-4 text-center">
                  Approving will create their artist profile and notify them.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => updateStatus(selectedApp.id, 'rejected')}
                    disabled={actionLoading}
                    className="flex-1 py-3 bg-[var(--pf-surface)] border border-red-500/30 text-red-400 font-medium rounded-xl hover:bg-red-500/10 transition-colors disabled:opacity-40"
                  >
                    Pass
                  </button>
                  <button
                    onClick={() => updateStatus(selectedApp.id, 'approved')}
                    disabled={actionLoading}
                    className="flex-1 py-3 bg-[var(--pf-orange)] text-white font-bold rounded-xl hover:bg-[var(--pf-orange-dark)] transition-colors disabled:opacity-40"
                  >
                    {actionLoading ? 'Processing...' : 'Approve & Create Profile'}
                  </button>
                </div>
              </div>
            )}

            {selectedApp.status !== 'pending' && (
              <div className="p-6">
                <div className="text-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedApp.status === 'approved'
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-red-500/10 text-red-400'
                  }`}>
                    {selectedApp.status === 'approved' ? 'Approved' : 'Passed'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
