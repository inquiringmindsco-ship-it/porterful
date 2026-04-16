'use client'

import { useState } from 'react'
import { useSupabase } from '@/app/providers'
import { TRACKS } from '@/lib/data'
import { ROLE_LABELS, calculateSplit, Collaborator } from '@/lib/collaboration'

// Custom Icons
const Icon = {
  Plus: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  X: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Users: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  Percent: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="19" y1="5" x2="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  ),
  Dollar: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  ),
  Check: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20,6 9,17 4,12" />
    </svg>
  ),
}

interface TrackCollab {
  trackId: string
  trackTitle: string
  collaborators: Collaborator[]
  totalSplit: number
}

export default function CollaborationsPage() {
  const { user } = useSupabase()
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null)
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    { id: 'primary', name: user?.email?.split('@')[0] || 'You', role: 'primary', split: 80, status: 'active' }
  ])
  const [newCollab, setNewCollab] = useState({
    name: '',
    email: '',
    role: 'featured' as Collaborator['role'],
    split: 10
  })
  const [showAddCollab, setShowAddCollab] = useState(false)

  // Calculate remaining split
  const totalSplit = collaborators.reduce((sum, c) => sum + c.split, 0)
  const remainingSplit = 100 - totalSplit

  // Add collaborator
  const addCollaborator = () => {
    if (!newCollab.name || newCollab.split <= 0) return
    if (totalSplit + newCollab.split > 100) {
      alert(`Cannot add ${newCollab.split}% - only ${remainingSplit}% remaining`)
      return
    }

    const collab: Collaborator = {
      id: `collab-${Date.now()}`,
      name: newCollab.name,
      email: newCollab.email,
      role: newCollab.role,
      split: newCollab.split,
      status: 'pending'
    }

    setCollaborators([...collaborators, collab])
    setNewCollab({ name: '', email: '', role: 'featured', split: 10 })
    setShowAddCollab(false)
  }

  // Remove collaborator
  const removeCollaborator = (id: string) => {
    setCollaborators(collaborators.filter(c => c.id !== id))
  }

  // Update split
  const updateSplit = (id: string, newSplit: number) => {
    const othersTotal = collaborators.filter(c => c.id !== id).reduce((sum, c) => sum + c.split, 0)
    if (othersTotal + newSplit > 100) {
      alert('Total split cannot exceed 100%')
      return
    }
    setCollaborators(collaborators.map(c => 
      c.id === id ? { ...c, split: newSplit } : c
    ))
  }

  // Example: Revenue calculation
  const exampleSale = 1.00 // $1 per track
  const exampleRevenue = calculateSplit(exampleSale, collaborators)

  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="pf-container max-w-2xl">
          <div className="bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-2xl p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--pf-orange)]/10 flex items-center justify-center">
              <Icon.Users />
            </div>
            <h1 className="text-2xl font-bold text-[var(--pf-text)] mb-4">Artist Collaborations</h1>
            <p className="text-[var(--pf-text-secondary)] mb-6">
              Sign in to manage track collaborations and revenue splits.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="pf-container max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--pf-text)]">Collaborations</h1>
          <p className="text-[var(--pf-text-secondary)] mt-2">
            Split revenue with featured artists, producers, and songwriters
          </p>
        </div>

        {/* How It Works */}
        <div className="bg-gradient-to-br from-[var(--pf-orange)]/10 to-purple-600/10 rounded-2xl p-6 mb-8 border border-[var(--pf-orange)]/20">
          <h2 className="font-bold text-[var(--pf-text)] mb-4">Revenue Splits</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--pf-orange)]">67%</div>
              <div className="text-sm text-[var(--pf-text-secondary)]">Primary Artist</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--pf-orange)]">20%</div>
              <div className="text-sm text-[var(--pf-text-secondary)]">Artist Fund</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--pf-orange)]">10%</div>
              <div className="text-sm text-[var(--pf-text-secondary)]">Platform</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--pf-orange)]">3%</div>
              <div className="text-sm text-[var(--pf-text-secondary)]">Superfan</div>
            </div>
          </div>
          <p className="text-sm text-[var(--pf-text-secondary)] mt-4">
            Collaborators split from your 67% share. Add featured artists, producers, or songwriters to share revenue.
          </p>
        </div>

        {/* Track Selection */}
        <div className="bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-[var(--pf-text)] mb-4">Select Track</h3>
          <select 
            value={selectedTrack || ''}
            onChange={(e) => setSelectedTrack(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[var(--pf-border)] bg-[var(--pf-bg)] text-[var(--pf-text)] focus:border-[var(--pf-orange)] focus:outline-none"
          >
            <option value="">Choose a track...</option>
            {TRACKS.slice(0, 20).map(track => (
              <option key={track.id} value={track.id}>
                {track.title} - {track.artist}
              </option>
            ))}
          </select>
        </div>

        {/* Collaborators List */}
        {selectedTrack && (
          <div className="bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[var(--pf-text)]">Collaborators</h3>
              <button 
                onClick={() => setShowAddCollab(true)}
                className="pf-btn pf-btn-primary flex items-center gap-2"
              >
                <Icon.Plus /> Add Collaborator
              </button>
            </div>

            {/* Split Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[var(--pf-text-secondary)]">Revenue Split</span>
                <span className={`font-bold ${totalSplit > 100 ? 'text-red-400' : totalSplit === 100 ? 'text-green-400' : 'text-[var(--pf-text)]'}`}>
                  {totalSplit}%
                </span>
              </div>
              <div className="h-3 bg-[var(--pf-bg)] rounded-full overflow-hidden">
                {collaborators.map((c, i) => (
                  <div 
                    key={c.id}
                    className="h-full inline-block"
                    style={{ 
                      width: `${c.split}%`,
                      backgroundColor: i === 0 ? 'var(--pf-orange)' : `hsl(${i * 60 + 20}, 70%, 50%)`
                    }}
                  />
                ))}
              </div>
              {remainingSplit > 0 && (
                <p className="text-sm text-[var(--pf-text-secondary)] mt-2">
                  {remainingSplit}% unallocated
                </p>
              )}
            </div>

            {/* Collaborator Cards */}
            <div className="space-y-3">
              {collaborators.map((collab, index) => (
                <div 
                  key={collab.id}
                  className="flex items-center gap-4 p-4 bg-[var(--pf-bg)] rounded-xl border border-[var(--pf-border)]"
                >
                  {/* Avatar */}
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: index === 0 ? 'var(--pf-orange)' : `hsl(${index * 60 + 20}, 70%, 50%)` }}
                  >
                    {collab.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[var(--pf-text)]">{collab.name}</span>
                      {collab.status === 'pending' && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-500/10 text-yellow-500">Pending</span>
                      )}
                      {collab.status === 'active' && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/10 text-green-500">Active</span>
                      )}
                    </div>
                    <span className="text-sm text-[var(--pf-text-secondary)]">{ROLE_LABELS[collab.role]}</span>
                  </div>

                  {/* Split Input */}
                  <div className="flex items-center gap-2">
                    <input 
                      type="number"
                      min="0"
                      max="100"
                      value={collab.split}
                      onChange={(e) => updateSplit(collab.id, parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 text-center rounded border border-[var(--pf-border)] bg-[var(--pf-surface)] text-[var(--pf-text)]"
                      disabled={collab.role === 'primary'}
                    />
                    <span className="text-[var(--pf-text-secondary)]">%</span>
                  </div>

                  {/* Remove Button */}
                  {collab.role !== 'primary' && (
                    <button 
                      onClick={() => removeCollaborator(collab.id)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Icon.X />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Collaborator Modal */}
        {showAddCollab && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[var(--pf-text)]">Add Collaborator</h2>
                <button onClick={() => setShowAddCollab(false)} className="p-2 hover:bg-[var(--pf-surface)] rounded-lg">
                  <Icon.X />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--pf-text)] mb-2">Name</label>
                  <input 
                    type="text"
                    value={newCollab.name}
                    onChange={(e) => setNewCollab({ ...newCollab, name: e.target.value })}
                    placeholder="Artist name"
                    className="w-full px-4 py-3 rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)] text-[var(--pf-text)] placeholder:text-[var(--pf-text-muted)] focus:border-[var(--pf-orange)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--pf-text)] mb-2">Email (optional)</label>
                  <input 
                    type="email"
                    value={newCollab.email}
                    onChange={(e) => setNewCollab({ ...newCollab, email: e.target.value })}
                    placeholder="For payment notifications"
                    className="w-full px-4 py-3 rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)] text-[var(--pf-text)] placeholder:text-[var(--pf-text-muted)] focus:border-[var(--pf-orange)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--pf-text)] mb-2">Role</label>
                  <select 
                    value={newCollab.role}
                    onChange={(e) => setNewCollab({ ...newCollab, role: e.target.value as Collaborator['role'] })}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)] text-[var(--pf-text)] focus:border-[var(--pf-orange)] focus:outline-none"
                  >
                    <option value="featured">Featured Artist</option>
                    <option value="producer">Producer</option>
                    <option value="writer">Songwriter</option>
                    <option value="engineer">Engineer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--pf-text)] mb-2">
                    Revenue Split ({remainingSplit}% available)
                  </label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number"
                      min="1"
                      max={remainingSplit}
                      value={newCollab.split}
                      onChange={(e) => setNewCollab({ ...newCollab, split: parseInt(e.target.value) || 0 })}
                      className="flex-1 px-4 py-3 rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)] text-[var(--pf-text)] focus:border-[var(--pf-orange)] focus:outline-none"
                    />
                    <span className="text-[var(--pf-text-secondary)]">%</span>
                  </div>
                </div>

                <button 
                  onClick={addCollaborator}
                  disabled={!newCollab.name || newCollab.split <= 0}
                  className="w-full pf-btn pf-btn-primary"
                >
                  Add Collaborator
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Revenue Example */}
        {selectedTrack && collaborators.length > 0 && (
          <div className="bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-2xl p-6">
            <h3 className="font-bold text-[var(--pf-text)] mb-4 flex items-center gap-2">
              <Icon.Dollar /> Revenue Example
            </h3>
            <p className="text-[var(--pf-text-secondary)] mb-4">
              If this track sells for $1.00, here's how the revenue splits:
            </p>
            <div className="space-y-2">
              {exampleRevenue.map(({ id, amount }) => {
                const collab = collaborators.find(c => c.id === id)
                if (!collab) return null
                return (
                  <div key={id} className="flex items-center justify-between">
                    <span className="text-[var(--pf-text)]">{collab.name} ({collab.split}%)</span>
                    <span className="font-bold text-[var(--pf-orange)]">${amount.toFixed(2)}</span>
                  </div>
                )
              })}
              <div className="border-t border-[var(--pf-border)] pt-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--pf-text)]">Artist Fund (20%)</span>
                  <span className="font-bold text-[var(--pf-text-secondary)]">$0.20</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--pf-text)]">Platform (10%)</span>
                  <span className="font-bold text-[var(--pf-text-secondary)]">$0.10</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}