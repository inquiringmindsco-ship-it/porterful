'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/app/providers'
import Link from 'next/link'
import { 
  Users, Music, Package, DollarSign, AlertCircle, 
  CheckCircle, XCircle, Play, Pause,
  ChevronUp, ChevronDown, Shield, TrendingUp
} from 'lucide-react'

type ArtistWithProfile = {
  id: string
  name: string
  slug: string
  email?: string
  status: string
  artist_tier: string
  public_profile_enabled: boolean
  auto_publish: boolean
  track_count: number
  live_track_count: number
  created_at: string
  last_upload?: string
}

type TrackWithArtist = {
  id: string
  title: string
  artist: string
  artist_id: string
  status: string
  is_active: boolean
  duration?: number
  audio_url?: string
  price: number
  created_at: string
}

type Metric = {
  label: string
  value: string | number
  status: 'ok' | 'warning' | 'error' | 'info'
}

export default function FounderDashboard() {
  const router = useRouter()
  const { user, supabase } = useSupabase()
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [artists, setArtists] = useState<ArtistWithProfile[]>([])
  const [tracks, setTracks] = useState<TrackWithArtist[]>([])
  const [needsAttention, setNeedsAttention] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'artists' | 'tracks' | 'revenue'>('overview')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    checkAccess()
  }, [user])

  async function checkAccess() {
    if (!supabase || !user) return
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'admin' && profile.role !== 'founder')) {
      router.push('/dashboard')
      return
    }

    loadData()
  }

  async function loadData() {
    if (!supabase) return
    setLoading(true)

    try {
      // Parallel queries for efficiency
      const [
        { data: profilesData },
        { data: artistsData },
        { data: tracksData },
        { data: ordersData },
        { data: musicPurchasesData }
      ] = await Promise.all([
        supabase.from('profiles').select('id, role, created_at'),
        supabase.from('artists').select('*'),
        supabase.from('tracks').select('*'),
        supabase.from('orders').select('*'),
        supabase.from('music_purchases').select('*')
      ])

      // Calculate metrics
      const totalUsers = profilesData?.length || 0
      const totalArtists = artistsData?.length || 0
      const totalTracks = tracksData?.length || 0
      const liveTracks = tracksData?.filter(t => t.status === 'live' || t.is_active).length || 0
      const totalOrders = ordersData?.length || 0
      const totalMusicPurchases = musicPurchasesData?.length || 0

      // Calculate revenue
      const totalRevenue = ordersData?.reduce((sum: number, o: any) => sum + (o.amount || 0), 0) || 0

      // Calculate potential catalog value
      const trackPrices = tracksData?.map((t: any) => t.price || t.proud_to_pay_min || 0) || []
      const catalogValue = trackPrices.reduce((sum: number, p: number) => sum + p, 0)

      // Tracks needing attention
      const attentionItems: any[] = []
      
      tracksData?.forEach((t: any) => {
        if (!t.duration) {
          attentionItems.push({
            type: 'track',
            id: t.id,
            title: t.title,
            artist: t.artist,
            issue: 'Missing duration',
            severity: 'warning'
          })
        }
        if (!t.audio_url) {
          attentionItems.push({
            type: 'track',
            id: t.id,
            title: t.title,
            artist: t.artist,
            issue: 'Missing audio URL',
            severity: 'error'
          })
        }
      })

      artistsData?.forEach((a: any) => {
        if (a.status === 'pending') {
          attentionItems.push({
            type: 'artist',
            id: a.id,
            name: a.name,
            issue: 'Pending approval',
            severity: 'warning'
          })
        }
      })

      // Build artist list with computed fields
      const enrichedArtists = (artistsData || []).map((a: any) => {
        const artistTracks = tracksData?.filter((t: any) => t.artist_id === a.id) || []
        const liveTracks = artistTracks.filter((t: any) => t.status === 'live' || t.is_active)
        const lastUpload = artistTracks.length > 0 
          ? artistTracks.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]?.created_at 
          : undefined

        return {
          ...a,
          track_count: artistTracks.length,
          live_track_count: liveTracks.length,
          last_upload: lastUpload
        }
      })

      // Build track list
      const enrichedTracks = (tracksData || []).map((t: any) => ({
        ...t,
        status: t.status || (t.is_active ? 'live' : 'draft')
      }))

      setMetrics([
        { label: 'Total Artists', value: totalArtists, status: 'ok' },
        { label: 'Total Users', value: totalUsers, status: 'ok' },
        { label: 'Total Tracks', value: totalTracks, status: 'ok' },
        { label: 'Live Tracks', value: liveTracks, status: 'ok' },
        { label: 'Total Orders', value: totalOrders, status: 'info' },
        { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, status: 'info' },
        { label: 'Catalog Value', value: `$${catalogValue.toFixed(2)}`, status: 'info' },
        { label: 'Needs Attention', value: attentionItems.length, status: attentionItems.length > 0 ? 'warning' : 'ok' },
      ])

      setArtists(enrichedArtists)
      setTracks(enrichedTracks)
      setNeedsAttention(attentionItems)
    } catch (error) {
      console.error('Error loading founder data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updateArtistStatus(artistId: string, status: string) {
    if (!supabase) return
    const { error } = await supabase
      .from('artists')
      .update({ status })
      .eq('id', artistId)

    if (error) {
      console.error('Error updating artist:', error)
      return
    }

    // Refresh data
    loadData()
  }

  async function updateTrackStatus(trackId: string, status: string) {
    if (!supabase) return
    const { error } = await supabase
      .from('tracks')
      .update({ status, is_active: status === 'live' })
      .eq('id', trackId)

    if (error) {
      console.error('Error updating track:', error)
      return
    }

    loadData()
  }

  async function toggleArtistField(artistId: string, field: string, value: boolean) {
    setError('')
    setNotice('Saving...')
    
    try {
      // Get current session token for auth
      const { data: { session } } = await supabase.auth.getSession()
      
      const res = await fetch(`/api/artists/${artistId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({ field, value }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || `Failed to update ${field}`)
        setNotice('')
        return
      }

      setNotice(`${field.replace('_', ' ')} updated`)
      window.setTimeout(() => setNotice(''), 2000)
      
      // Reload data to reflect change
      loadData()
    } catch (err: any) {
      console.error('Error updating artist:', err)
      setError(err.message || 'Failed to update')
      setNotice('')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <div className="animate-pulse text-[var(--pf-text-muted)]">Loading founder dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="pf-container max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="text-[var(--pf-orange)]" />
            Founder Dashboard
          </h1>
          <p className="text-[var(--pf-text-muted)] mt-1">Platform control and oversight</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-[var(--pf-border)]">
          {(['overview', 'artists', 'tracks', 'revenue'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? 'border-[var(--pf-orange)] text-[var(--pf-orange)]'
                  : 'border-transparent text-[var(--pf-text-muted)] hover:text-[var(--pf-text)]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className={`pf-card p-4 border-l-4 ${
                    metric.status === 'ok' ? 'border-l-green-500' :
                    metric.status === 'warning' ? 'border-l-yellow-500' :
                    metric.status === 'error' ? 'border-l-red-500' :
                    'border-l-[var(--pf-orange)]'
                  }`}
                >
                  <p className="text-xs text-[var(--pf-text-muted)] uppercase">{metric.label}</p>
                  <p className="text-2xl font-bold mt-1">{metric.value}</p>
                </div>
              ))}
            </div>

            {/* Needs Attention */}
            {needsAttention.length > 0 && (
              <div className="pf-card p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <AlertCircle className="text-yellow-500" />
                  Needs Attention ({needsAttention.length})
                </h2>
                <div className="space-y-2">
                  {needsAttention.slice(0, 10).map((item) => (
                    <div
                      key={`${item.type}-${item.id}`}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        item.severity === 'error' ? 'bg-red-500/10' :
                        item.severity === 'warning' ? 'bg-yellow-500/10' :
                        'bg-blue-500/10'
                      }`}
                    >
                      <div>
                        <p className="font-medium">
                          {item.type === 'artist' ? item.name : `${item.title} by ${item.artist}`}
                        </p>
                        <p className="text-sm text-[var(--pf-text-muted)]">{item.issue}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        item.severity === 'error' ? 'bg-red-500/20 text-red-400' :
                        item.severity === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {item.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Artists Tab */}
        {activeTab === 'artists' && (
          <div className="pf-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--pf-border)] text-left">
                  <th className="p-3">Artist</th>
                  <th className="p-3">Tier</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Tracks</th>
                  <th className="p-3">Public Profile</th>
                  <th className="p-3">Auto-Publish</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {artists.map((artist) => (
                  <tr key={artist.id} className="border-b border-[var(--pf-border)] hover:bg-[var(--pf-surface-hover)]">
                    <td className="p-3">
                      <Link href={`/artist/${artist.slug}`} className="font-medium hover:text-[var(--pf-orange)]">
                        {artist.name}
                      </Link>
                      <p className="text-xs text-[var(--pf-text-muted)]">{artist.email || 'No email'}</p>
                    </td>
                    <td className="p-3">
                      <span className="text-xs px-2 py-1 rounded bg-[var(--pf-surface)]">
                        {artist.artist_tier?.replace('_', ' ') || 'basic'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded ${
                        artist.status === 'active' ? 'bg-green-500/20 text-green-400' :
                        artist.status === 'approved' ? 'bg-blue-500/20 text-blue-400' :
                        artist.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {artist.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {artist.live_track_count}/{artist.track_count} live
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => toggleArtistField(artist.id, 'public_profile_enabled', !artist.public_profile_enabled)}
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                          artist.public_profile_enabled
                            ? 'bg-[var(--pf-orange)] text-white'
                            : 'bg-[var(--pf-surface)] border border-[var(--pf-border)] text-[var(--pf-text-secondary)]'
                        }`}
                        title="Toggle public profile visibility"
                      >
                        <span className={`w-2 h-2 rounded-full ${artist.public_profile_enabled ? 'bg-white' : 'bg-[var(--pf-text-muted)]'}`} />
                        <span>{artist.public_profile_enabled ? 'Visible' : 'Hidden'}</span>
                      </button>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => toggleArtistField(artist.id, 'auto_publish', !artist.auto_publish)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                          artist.auto_publish
                            ? 'border-green-500/30 bg-green-500/10 text-green-300 hover:border-green-400/50'
                            : 'border-red-500/30 bg-red-500/10 text-red-300 hover:border-red-400/50'
                        }`}
                        title="Toggle auto-publish"
                      >
                        {artist.auto_publish ? <CheckCircle size={16} /> : <XCircle size={16} />}
                        <span>Auto-Publish</span>
                        <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.2em]">
                          {artist.auto_publish ? 'On' : 'Off'}
                        </span>
                      </button>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        {artist.status === 'pending' && (
                          <button
                            onClick={() => updateArtistStatus(artist.id, 'approved')}
                            className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30"
                          >
                            Approve
                          </button>
                        )}
                        {(artist.status === 'approved' || artist.status === 'active') && (
                          <button
                            onClick={() => updateArtistStatus(artist.id, 'suspended')}
                            className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                          >
                            Suspend
                          </button>
                        )}
                        {artist.status === 'suspended' && (
                          <button
                            onClick={() => updateArtistStatus(artist.id, 'approved')}
                            className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30"
                          >
                            Reactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tracks Tab */}
        {activeTab === 'tracks' && (
          <div className="pf-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--pf-border)] text-left">
                  <th className="p-3">Track</th>
                  <th className="p-3">Artist</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Audio</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tracks.slice(0, 50).map((track) => (
                  <tr key={track.id} className="border-b border-[var(--pf-border)] hover:bg-[var(--pf-surface-hover)]">
                    <td className="p-3">
                      <p className="font-medium">{track.title}</p>
                      <p className="text-xs text-[var(--pf-text-muted)]">{track.id.slice(0, 8)}</p>
                    </td>
                    <td className="p-3">{track.artist}</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded ${
                        track.status === 'live' ? 'bg-green-500/20 text-green-400' :
                        track.status === 'pending_review' ? 'bg-yellow-500/20 text-yellow-400' :
                        track.status === 'draft' ? 'bg-gray-500/20 text-gray-400' :
                        track.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {track.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {track.duration ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}` : '0:00'}
                    </td>
                    <td className="p-3">${track.price || 0}</td>
                    <td className="p-3">
                      {track.audio_url ? (
                        <span className="text-green-400 text-xs">✓</span>
                      ) : (
                        <span className="text-red-400 text-xs">✗</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        {track.status !== 'live' && (
                          <button
                            onClick={() => updateTrackStatus(track.id, 'live')}
                            className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30"
                          >
                            Publish
                          </button>
                        )}
                        {track.status === 'live' && (
                          <button
                            onClick={() => updateTrackStatus(track.id, 'archived')}
                            className="text-xs px-2 py-1 bg-gray-500/20 text-gray-400 rounded hover:bg-gray-500/30"
                          >
                            Archive
                          </button>
                        )}
                        {track.status === 'pending_review' && (
                          <button
                            onClick={() => updateTrackStatus(track.id, 'rejected')}
                            className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Revenue Tab */}
        {activeTab === 'revenue' && (
          <div className="space-y-6">
            <div className="pf-card p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="text-[var(--pf-orange)]" />
                Revenue Overview
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-[var(--pf-surface)]">
                  <p className="text-xs text-[var(--pf-text-muted)]">Confirmed Orders</p>
                  <p className="text-2xl font-bold">{metrics.find(m => m.label === 'Total Orders')?.value || 0}</p>
                </div>
                <div className="p-4 rounded-lg bg-[var(--pf-surface)]">
                  <p className="text-xs text-[var(--pf-text-muted)]">Total Revenue</p>
                  <p className="text-2xl font-bold">{metrics.find(m => m.label === 'Total Revenue')?.value || '$0.00'}</p>
                </div>
                <div className="p-4 rounded-lg bg-[var(--pf-surface)]">
                  <p className="text-xs text-[var(--pf-text-muted)]">Catalog Value</p>
                  <p className="text-2xl font-bold">{metrics.find(m => m.label === 'Catalog Value')?.value || '$0.00'}</p>
                </div>
              </div>
              <p className="text-sm text-[var(--pf-text-muted)] mt-4">
                Payout logic not wired yet. Revenue shows confirmed orders only.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
