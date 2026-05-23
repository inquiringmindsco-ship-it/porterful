'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/app/providers'
import Link from 'next/link'
import { 
  Users, Music, Package, DollarSign, AlertCircle, 
  CheckCircle, XCircle, Play, Pause,
  ChevronUp, ChevronDown, Shield, TrendingUp,
  Star, Sparkles, LayoutTemplate, Search, Filter,
  ExternalLink, Edit3, Eye
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
  const [activeTab, setActiveTab] = useState<'overview' | 'artists' | 'tracks' | 'content' | 'revenue'>('overview')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  
  // Content settings
  const [contentSettings, setContentSettings] = useState<any>(null)
  const [contentLoading, setContentLoading] = useState(false)
  const [selectedHeroTrack, setSelectedHeroTrack] = useState<string>('')
  const [selectedFeaturedTracks, setSelectedFeaturedTracks] = useState<string[]>([])
  const [selectedPromoTracks, setSelectedPromoTracks] = useState<string[]>([])
  const [heroLabel, setHeroLabel] = useState('Featured Release')
  const [saveSuccess, setSaveSuccess] = useState(false)
  
  // Search & filter states
  const [artistSearch, setArtistSearch] = useState('')
  const [artistStatusFilter, setArtistStatusFilter] = useState<string>('all')
  const [trackSearch, setTrackSearch] = useState('')
  const [trackStatusFilter, setTrackStatusFilter] = useState<string>('all')
  const [trackArtistFilter, setTrackArtistFilter] = useState<string>('all')
  const [contentTrackSearch, setContentTrackSearch] = useState('')
  const [contentArtistFilter, setContentArtistFilter] = useState<string>('all')

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
    // Confirmation for destructive actions
    if (status === 'suspended') {
      const confirmed = window.confirm('Suspend this artist? Their public profile will be hidden.')
      if (!confirmed) return
    }

    setError('')
    setNotice('Saving...')
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const res = await fetch(`/api/artists/${artistId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({ status }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || `Failed to update status to ${status}`)
        setNotice('')
        return
      }

      setNotice(`Status updated to ${status}`)
      window.setTimeout(() => setNotice(''), 3000)
      loadData()
    } catch (err: any) {
      setError(err.message || 'Failed to update status')
      setNotice('')
    }
  }

  async function reactivateArtist(artistId: string) {
    const confirmed = window.confirm('Reactivate this artist? Their public profile will be visible again.')
    if (!confirmed) return

    await updateArtistStatus(artistId, 'approved')
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
      loadData()
    } catch (err: any) {
      console.error('Error updating artist:', err)
      setError(err.message || 'Failed to update')
      setNotice('')
    }
  }

  async function loadContentSettings() {
    if (!supabase) return
    setContentLoading(true)
    try {
      const res = await fetch('/api/site-settings', { cache: 'no-store' })
      const data = await res.json()
      if (data.settings) {
        setContentSettings(data.settings)
        setSelectedHeroTrack(data.settings.hero_track_id || '')
        setSelectedFeaturedTracks(data.settings.featured_track_ids || [])
        setSelectedPromoTracks(data.settings.promo_track_ids || [])
        setHeroLabel(data.settings.hero_label || 'Featured Release')
      } else if (data.error) {
        setError(data.error)
      }
    } catch (err) {
      console.error('Error loading content settings:', err)
    } finally {
      setContentLoading(false)
    }
  }

  async function saveContentSettings() {
    if (!supabase) return
    setContentLoading(true)
    setSaveSuccess(false)
    
    try {
      const payload = {
        hero_track_id: selectedHeroTrack || null,
        featured_track_ids: selectedFeaturedTracks,
        promo_track_ids: selectedPromoTracks,
        hero_label: heroLabel || 'Featured Release',
      }
      
      const res = await fetch('/api/site-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Failed to save content settings')
        setSaveSuccess(false)
        setContentLoading(false)
        return
      }

      const data = await res.json()
      if (data.success) {
        setSaveSuccess(true)
        setNotice('Content settings saved successfully')
        window.setTimeout(() => {
          setNotice('')
          setSaveSuccess(false)
        }, 3000)
      } else {
        setError('Save returned unexpected response')
      }
    } catch (err: any) {
      console.error('Error saving content settings:', err)
      setError(err.message || 'Failed to save')
    } finally {
      setContentLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'content') {
      loadContentSettings()
    }
  }, [activeTab])

  // Filtered artists
  const filteredArtists = useMemo(() => {
    return artists.filter(artist => {
      const matchesSearch = !artistSearch || 
        artist.name.toLowerCase().includes(artistSearch.toLowerCase()) ||
        artist.slug.toLowerCase().includes(artistSearch.toLowerCase())
      const matchesStatus = artistStatusFilter === 'all' || artist.status === artistStatusFilter
      return matchesSearch && matchesStatus
    })
  }, [artists, artistSearch, artistStatusFilter])

  // Filtered tracks
  const filteredTracks = useMemo(() => {
    return tracks.filter(track => {
      const matchesSearch = !trackSearch || 
        track.title.toLowerCase().includes(trackSearch.toLowerCase()) ||
        track.artist.toLowerCase().includes(trackSearch.toLowerCase())
      const matchesStatus = trackStatusFilter === 'all' || track.status === trackStatusFilter
      const matchesArtist = trackArtistFilter === 'all' || track.artist === trackArtistFilter
      return matchesSearch && matchesStatus && matchesArtist
    })
  }, [tracks, trackSearch, trackStatusFilter, trackArtistFilter])

  // Unique artists for filter dropdown
  const uniqueArtists = useMemo(() => {
    return [...Array.from(new Set(tracks.map(t => t.artist)))].sort()
  }, [tracks])

  // Content tab filtered tracks
  const contentFilteredTracks = useMemo(() => {
    return tracks.filter(track => {
      const matchesSearch = !contentTrackSearch || 
        track.title.toLowerCase().includes(contentTrackSearch.toLowerCase()) ||
        track.artist.toLowerCase().includes(contentTrackSearch.toLowerCase())
      const matchesArtist = contentArtistFilter === 'all' || track.artist === contentArtistFilter
      return matchesSearch && matchesArtist
    })
  }, [tracks, contentTrackSearch, contentArtistFilter])

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
        <div className="flex gap-2 mb-6 border-b border-[var(--pf-border)] overflow-x-auto">
          {(['overview', 'artists', 'tracks', 'content', 'revenue'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px whitespace-nowrap ${
                activeTab === tab
                  ? 'border-[var(--pf-orange)] text-[var(--pf-orange)]'
                  : 'border-transparent text-[var(--pf-text-muted)] hover:text-[var(--pf-text)]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}
        {notice && (
          <div className={`mb-4 p-4 rounded-lg border text-sm ${
            saveSuccess 
              ? 'bg-green-500/10 border-green-500/20 text-green-400' 
              : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
          }`}>
            {notice}
          </div>
        )}

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
          <div className="space-y-4">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--pf-text-muted)]" size={16} />
                <input
                  type="text"
                  value={artistSearch}
                  onChange={(e) => setArtistSearch(e.target.value)}
                  placeholder="Search artists..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] text-sm focus:border-[var(--pf-orange)] focus:outline-none"
                />
              </div>
              <select
                value={artistStatusFilter}
                onChange={(e) => setArtistStatusFilter(e.target.value)}
                className="px-4 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] text-sm focus:border-[var(--pf-orange)] focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            {/* Mobile Cards / Desktop Table */}
            <div className="hidden md:block pf-card overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--pf-border)] text-left">
                    <th className="p-3">Artist</th>
                    <th className="p-3">Tier</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Tracks</th>
                    <th className="p-3">Public</th>
                    <th className="p-3">Auto-Pub</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredArtists.map((artist) => (
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
                      <td className="p-3">{artist.live_track_count}/{artist.track_count}</td>
                      <td className="p-3">
                        <button
                          onClick={() => toggleArtistField(artist.id, 'public_profile_enabled', !artist.public_profile_enabled)}
                          className={`text-xs px-2 py-1 rounded ${
                            artist.public_profile_enabled
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {artist.public_profile_enabled ? 'Visible' : 'Hidden'}
                        </button>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => toggleArtistField(artist.id, 'auto_publish', !artist.auto_publish)}
                          className={`text-xs px-2 py-1 rounded ${
                            artist.auto_publish
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {artist.auto_publish ? 'On' : 'Off'}
                        </button>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Link
                            href={`/artist/${artist.slug}`}
                            className="text-xs px-2 py-1 bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded hover:bg-[var(--pf-surface-hover)]"
                            title="View public page"
                          >
                            <Eye size={14} />
                          </Link>
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
                              onClick={() => reactivateArtist(artist.id)}
                              className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30"
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

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {filteredArtists.map((artist) => (
                <div key={artist.id} className="pf-card p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link href={`/artist/${artist.slug}`} className="font-medium hover:text-[var(--pf-orange)]">
                        {artist.name}
                      </Link>
                      <p className="text-xs text-[var(--pf-text-muted)]">{artist.email || 'No email'}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      artist.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      artist.status === 'approved' ? 'bg-blue-500/20 text-blue-400' :
                      artist.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {artist.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[var(--pf-text-muted)]">
                    <span>{artist.artist_tier?.replace('_', ' ') || 'basic'}</span>
                    <span>{artist.live_track_count}/{artist.track_count} tracks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleArtistField(artist.id, 'public_profile_enabled', !artist.public_profile_enabled)}
                      className={`text-xs px-2 py-1 rounded ${
                        artist.public_profile_enabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {artist.public_profile_enabled ? 'Visible' : 'Hidden'}
                    </button>
                    <button
                      onClick={() => toggleArtistField(artist.id, 'auto_publish', !artist.auto_publish)}
                      className={`text-xs px-2 py-1 rounded ${
                        artist.auto_publish ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      Auto: {artist.auto_publish ? 'On' : 'Off'}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/artist/${artist.slug}`}
                      className="flex-1 text-center text-xs px-3 py-2 bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded hover:bg-[var(--pf-surface-hover)]"
                    >
                      View
                    </Link>
                    {artist.status === 'pending' && (
                      <button
                        onClick={() => updateArtistStatus(artist.id, 'approved')}
                        className="flex-1 text-xs px-3 py-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30"
                      >
                        Approve
                      </button>
                    )}
                    {(artist.status === 'approved' || artist.status === 'active') && (
                      <button
                        onClick={() => updateArtistStatus(artist.id, 'suspended')}
                        className="flex-1 text-xs px-3 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                      >
                        Suspend
                      </button>
                    )}
                    {artist.status === 'suspended' && (
                      <button
                        onClick={() => reactivateArtist(artist.id)}
                        className="flex-1 text-xs px-3 py-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30"
                      >
                        Reactivate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredArtists.length === 0 && (
              <div className="text-center py-12 text-[var(--pf-text-muted)]">
                <p>No artists match your filters.</p>
              </div>
            )}
          </div>
        )}

        {/* Tracks Tab */}
        {activeTab === 'tracks' && (
          <div className="space-y-4">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--pf-text-muted)]" size={16} />
                <input
                  type="text"
                  value={trackSearch}
                  onChange={(e) => setTrackSearch(e.target.value)}
                  placeholder="Search tracks by title or artist..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] text-sm focus:border-[var(--pf-orange)] focus:outline-none"
                />
              </div>
              <select
                value={trackStatusFilter}
                onChange={(e) => setTrackStatusFilter(e.target.value)}
                className="px-4 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] text-sm focus:border-[var(--pf-orange)] focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="live">Live</option>
                <option value="pending_review">Pending Review</option>
                <option value="draft">Draft</option>
                <option value="rejected">Rejected</option>
                <option value="archived">Archived</option>
              </select>
              <select
                value={trackArtistFilter}
                onChange={(e) => setTrackArtistFilter(e.target.value)}
                className="px-4 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] text-sm focus:border-[var(--pf-orange)] focus:outline-none"
              >
                <option value="all">All Artists</option>
                {uniqueArtists.map(artist => (
                  <option key={artist} value={artist}>{artist}</option>
                ))}
              </select>
            </div>

            <p className="text-xs text-[var(--pf-text-muted)]">
              Showing {filteredTracks.length} of {tracks.length} tracks
            </p>

            {/* Desktop Table */}
            <div className="hidden md:block pf-card overflow-x-auto">
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
                  {filteredTracks.map((track) => (
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

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {filteredTracks.map((track) => (
                <div key={track.id} className="pf-card p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{track.title}</p>
                      <p className="text-xs text-[var(--pf-text-muted)]">{track.artist}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      track.status === 'live' ? 'bg-green-500/20 text-green-400' :
                      track.status === 'pending_review' ? 'bg-yellow-500/20 text-yellow-400' :
                      track.status === 'draft' ? 'bg-gray-500/20 text-gray-400' :
                      track.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {track.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[var(--pf-text-muted)]">
                    <span>{track.duration ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}` : '0:00'}</span>
                    <span>${track.price || 0}</span>
                    <span>{track.audio_url ? '✓ Audio' : '✗ No audio'}</span>
                  </div>
                  <div className="flex gap-2">
                    {track.status !== 'live' && (
                      <button
                        onClick={() => updateTrackStatus(track.id, 'live')}
                        className="flex-1 text-xs px-3 py-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30"
                      >
                        Publish
                      </button>
                    )}
                    {track.status === 'live' && (
                      <button
                        onClick={() => updateTrackStatus(track.id, 'archived')}
                        className="flex-1 text-xs px-3 py-2 bg-gray-500/20 text-gray-400 rounded hover:bg-gray-500/30"
                      >
                        Archive
                      </button>
                    )}
                    {track.status === 'pending_review' && (
                      <button
                        onClick={() => updateTrackStatus(track.id, 'rejected')}
                        className="flex-1 text-xs px-3 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredTracks.length === 0 && (
              <div className="text-center py-12 text-[var(--pf-text-muted)]">
                <p>No tracks match your filters.</p>
              </div>
            )}
          </div>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            {contentLoading && (
              <div className="text-center py-8 text-[var(--pf-text-muted)] animate-pulse">
                Loading content settings...
              </div>
            )}
            
            {/* Hero Section */}
            <div className="pf-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <LayoutTemplate className="text-[var(--pf-orange)]" />
                <h2 className="text-lg font-semibold">Homepage Hero</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Hero Label</label>
                  <input
                    type="text"
                    value={heroLabel}
                    onChange={(e) => setHeroLabel(e.target.value)}
                    className="w-full max-w-md px-3 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] text-sm focus:border-[var(--pf-orange)] focus:outline-none"
                    placeholder="Featured Release"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Hero Track</label>
                  <select
                    value={selectedHeroTrack}
                    onChange={(e) => setSelectedHeroTrack(e.target.value)}
                    className="w-full max-w-md px-3 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] text-sm focus:border-[var(--pf-orange)] focus:outline-none"
                  >
                    <option value="">Auto-pick (first track from featured artist)</option>
                    {tracks.map((track) => (
                      <option key={track.id} value={track.id}>
                        {track.title} — {track.artist}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Featured Tracks */}
            <div className="pf-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Star className="text-[var(--pf-orange)]" />
                  <h2 className="text-lg font-semibold">Featured Tracks</h2>
                </div>
                <span className="text-sm text-[var(--pf-orange)] font-medium">
                  {selectedFeaturedTracks.length}/3 selected
                </span>
              </div>
              
              {/* Search & Filter */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--pf-text-muted)]" size={16} />
                  <input
                    type="text"
                    value={contentTrackSearch}
                    onChange={(e) => setContentTrackSearch(e.target.value)}
                    placeholder="Search tracks..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] text-sm focus:border-[var(--pf-orange)] focus:outline-none"
                  />
                </div>
                <select
                  value={contentArtistFilter}
                  onChange={(e) => setContentArtistFilter(e.target.value)}
                  className="px-4 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] text-sm focus:border-[var(--pf-orange)] focus:outline-none"
                >
                  <option value="all">All Artists</option>
                  {uniqueArtists.map(artist => (
                    <option key={artist} value={artist}>{artist}</option>
                  ))}
                </select>
              </div>
              
              <p className="text-xs text-[var(--pf-text-muted)] mb-3">
                Showing {contentFilteredTracks.length} of {tracks.length} tracks
              </p>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {contentFilteredTracks.map((track) => (
                  <label
                    key={track.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--pf-surface-hover)] cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFeaturedTracks.includes(track.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          if (selectedFeaturedTracks.length < 3) {
                            setSelectedFeaturedTracks([...selectedFeaturedTracks, track.id])
                          }
                        } else {
                          setSelectedFeaturedTracks(selectedFeaturedTracks.filter(id => id !== track.id))
                        }
                      }}
                      disabled={selectedFeaturedTracks.length >= 3 && !selectedFeaturedTracks.includes(track.id)}
                      className="w-4 h-4 rounded border-[var(--pf-border)] bg-[var(--pf-surface)] text-[var(--pf-orange)] focus:ring-[var(--pf-orange)] disabled:opacity-50"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{track.title}</p>
                      <p className="text-xs text-[var(--pf-text-muted)]">{track.artist} · {track.status}</p>
                    </div>
                    {selectedFeaturedTracks.includes(track.id) && (
                      <span className="text-xs text-[var(--pf-orange)]">
                        #{selectedFeaturedTracks.indexOf(track.id) + 1}
                      </span>
                    )}
                  </label>
                ))}
              </div>
              
              {contentFilteredTracks.length === 0 && (
                <div className="text-center py-8 text-[var(--pf-text-muted)]">
                  <p>No tracks match your search.</p>
                </div>
              )}
            </div>

            {/* Promo Tracks */}
            <div className="pf-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-[var(--pf-orange)]" />
                  <h2 className="text-lg font-semibold">Promo Tracks</h2>
                </div>
                <span className="text-sm text-[var(--pf-orange)] font-medium">
                  {selectedPromoTracks.length} selected
                </span>
              </div>
              
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {tracks.map((track) => (
                  <label
                    key={track.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--pf-surface-hover)] cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPromoTracks.includes(track.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPromoTracks([...selectedPromoTracks, track.id])
                        } else {
                          setSelectedPromoTracks(selectedPromoTracks.filter(id => id !== track.id))
                        }
                      }}
                      className="w-4 h-4 rounded border-[var(--pf-border)] bg-[var(--pf-surface)] text-[var(--pf-orange)] focus:ring-[var(--pf-orange)]"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{track.title}</p>
                      <p className="text-xs text-[var(--pf-text-muted)]">{track.artist} · {track.status}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Save Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={saveContentSettings}
                disabled={contentLoading}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--pf-orange)] px-6 py-3 text-sm font-semibold text-[#111111] transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-50"
              >
                {contentLoading ? 'Saving...' : saveSuccess ? '✓ Saved!' : 'Save Content Settings'}
              </button>
              
              <button
                onClick={() => {
                  setSelectedHeroTrack('')
                  setSelectedFeaturedTracks([])
                  setSelectedPromoTracks([])
                  setHeroLabel('Featured Release')
                }}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--pf-border)] px-6 py-3 text-sm font-semibold text-[var(--pf-text-secondary)] transition-colors hover:bg-[var(--pf-surface)]"
              >
                Reset to Defaults
              </button>
            </div>
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
