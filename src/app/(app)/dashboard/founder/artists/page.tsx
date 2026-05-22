'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/app/providers'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowLeft, Eye, EyeOff, Check, X, Camera, Save, 
  AlertCircle, Search, Filter
} from 'lucide-react'

interface Artist {
  id: string
  name: string
  slug: string
  bio: string
  genre: string
  location: string
  avatar_url: string | null
  cover_url: string | null
  status: string
  artist_tier: string
  public_profile_enabled: boolean
  created_at: string
}

export default function FounderArtistsPage() {
  const router = useRouter()
  const { user, supabase, loading: authLoading } = useSupabase()
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all') // all | public | hidden | no-pic

  useEffect(() => {
    async function loadArtists() {
      if (authLoading) return
      if (!user) {
        router.push('/login')
        return
      }

      // Verify founder access
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin' && profile?.role !== 'founder') {
        router.push('/dashboard')
        return
      }

      const { data, error } = await supabase
        .from('artists')
        .select('*')
        .order('name')

      if (error) {
        setError('Failed to load artists: ' + error.message)
      } else {
        setArtists(data || [])
      }

      setLoading(false)
    }

    loadArtists()
  }, [authLoading, user, supabase, router])

  async function toggleVisibility(artist: Artist) {
    // Block: no profile pic = cannot go public
    if (!artist.avatar_url && !artist.public_profile_enabled) {
      setError(`${artist.name} needs a profile picture before going public.`)
      setTimeout(() => setError(''), 3000)
      return
    }

    setSaving({ ...saving, [artist.id]: true })
    setError('')

    const newValue = !artist.public_profile_enabled

    const { error } = await supabase
      .from('artists')
      .update({ public_profile_enabled: newValue })
      .eq('id', artist.id)

    if (error) {
      setError(`Failed to update ${artist.name}: ${error.message}`)
    } else {
      setArtists(artists.map(a => 
        a.id === artist.id ? { ...a, public_profile_enabled: newValue } : a
      ))
    }

    setSaving({ ...saving, [artist.id]: false })
  }

  const filteredArtists = artists.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
                         a.slug.toLowerCase().includes(search.toLowerCase())
    
    if (!matchesSearch) return false

    switch (filter) {
      case 'public': return a.public_profile_enabled
      case 'hidden': return !a.public_profile_enabled
      case 'no-pic': return !a.avatar_url
      default: return true
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-32">
        <div className="max-w-4xl mx-auto px-5 sm:px-6">
          <div className="h-8 bg-[var(--pf-surface)] rounded-xl animate-pulse mb-6" />
          {[1,2,3,4].map(i => (
            <div key={i} className="h-20 bg-[var(--pf-surface)] rounded-xl animate-pulse mb-3" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-32 overflow-x-hidden">
      <div className="max-w-4xl mx-auto px-5 sm:px-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link 
            href="/dashboard/founder" 
            className="p-2 rounded-lg hover:bg-[var(--pf-surface)] transition-colors"
          >
            <ArrowLeft size={20} className="text-[var(--pf-text-secondary)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Artist Management</h1>
            <p className="text-sm text-[var(--pf-text-secondary)]">
              Control which artists are public. Require profile pics for visibility.
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-sm text-red-400">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard label="Total" value={artists.length} />
          <StatCard label="Public" value={artists.filter(a => a.public_profile_enabled).length} color="green" />
          <StatCard label="Hidden" value={artists.filter(a => !a.public_profile_enabled).length} color="orange" />
          <StatCard label="No Pic" value={artists.filter(a => !a.avatar_url).length} color="red" />
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--pf-text-muted)]" />
            <input
              type="text"
              placeholder="Search artists..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)] text-sm focus:outline-none focus:border-[var(--pf-orange)]"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'public', 'hidden', 'no-pic'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  filter === f 
                    ? 'bg-[var(--pf-orange)] text-white' 
                    : 'bg-[var(--pf-surface)] border border-[var(--pf-border)] text-[var(--pf-text-secondary)]'
                }`}
              >
                {f === 'no-pic' ? 'No Pic' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Artist List */}
        <div className="space-y-3">
          {filteredArtists.map(artist => {
            const hasPic = !!artist.avatar_url
            const isPublic = artist.public_profile_enabled
            const canGoPublic = hasPic

            return (
              <div 
                key={artist.id}
                className={`rounded-xl border ${
                  isPublic 
                    ? 'border-[var(--pf-orange)]/30 bg-[var(--pf-orange)]/5' 
                    : 'border-[var(--pf-border)] bg-[var(--pf-surface)]'
                } p-4`}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    {hasPic ? (
                      <Image
                        src={artist.avatar_url!}
                        alt={artist.name}
                        width={56}
                        height={56}
                        className="rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-[var(--pf-bg)] border border-[var(--pf-border)] flex items-center justify-center">
                        <Camera size={20} className="text-[var(--pf-text-muted)]" />
                      </div>
                    )}
                    {isPublic && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--pf-orange)] flex items-center justify-center">
                        <Check size={10} className="text-white" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link 
                          href={`/artist/${artist.slug}`}
                          className="font-semibold hover:text-[var(--pf-orange)] transition-colors"
                        >
                          {artist.name}
                        </Link>
                        <p className="text-xs text-[var(--pf-text-muted)] mt-0.5">
                          @{artist.slug} · {artist.artist_tier.replace(/_/g, ' ')}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleVisibility(artist)}
                        disabled={saving[artist.id] || (!canGoPublic && !isPublic)}
                        className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          isPublic
                            ? 'bg-[var(--pf-orange)]/10 text-[var(--pf-orange)] hover:bg-[var(--pf-orange)]/20'
                            : canGoPublic
                              ? 'bg-[var(--pf-surface)] border border-[var(--pf-border)] text-[var(--pf-text-secondary)] hover:border-[var(--pf-orange)]/40'
                              : 'bg-[var(--pf-bg)] text-[var(--pf-text-muted)] cursor-not-allowed opacity-60'
                        }`}
                        title={!canGoPublic && !isPublic ? 'Needs profile picture first' : ''}
                      >
                        {saving[artist.id] ? (
                          <>Saving...</>
                        ) : isPublic ? (
                          <><Eye size={14} /> Public</>
                        ) : (
                          <><EyeOff size={14} /> Hidden</>
                        )}
                      </button>
                    </div>

                    {/* Status badges */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        artist.status === 'active' 
                          ? 'bg-green-500/10 text-green-400' 
                          : 'bg-blue-500/10 text-blue-400'
                      }`}>
                        {artist.status}
                      </span>
                      {!hasPic && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 flex items-center gap-1">
                          <Camera size={10} /> No profile pic
                        </span>
                      )}
                      {artist.location && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--pf-bg)] text-[var(--pf-text-muted)]">
                          {artist.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {filteredArtists.length === 0 && (
            <div className="text-center py-12 text-[var(--pf-text-muted)]">
              No artists match your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  const colorClass = color === 'green' 
    ? 'text-green-400' 
    : color === 'orange' 
      ? 'text-[var(--pf-orange)]' 
      : color === 'red' 
        ? 'text-red-400' 
        : 'text-[var(--pf-text)]'

  return (
    <div className="rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-4">
      <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
      <p className="text-xs text-[var(--pf-text-muted)] mt-1">{label}</p>
    </div>
  )
}
