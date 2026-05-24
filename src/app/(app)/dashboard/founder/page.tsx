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

type Purchase = {
  id: string
  buyer_email: string
  buyer_user_id?: string
  track_id: string
  track_title: string
  artist_name: string
  stripe_session_id?: string
  amount_paid: number
  storage_bucket?: string
  storage_path?: string
  download_count?: number
  last_downloaded_at?: string
  recovery_token?: string
  recovery_token_expires_at?: string
  purchased_at: string
  created_at: string
  updated_at: string
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
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [purchaseSearch, setPurchaseSearch] = useState('')
  const [purchaseArtistFilter, setPurchaseArtistFilter] = useState<string>('all')
  const [purchaseDateFilter, setPurchaseDateFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'music' | 'content' | 'revenue'>('overview')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  
  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean
    title: string
    message: string
    confirmLabel: string
    onConfirm: () => void
  }>({ open: false, title: '', message: '', confirmLabel: '', onConfirm: () => {} })
  
  // Content settings
  const [contentSettings, setContentSettings] = useState<any>(null)
  const [contentLoading, setContentLoading] = useState(false)
  const [selectedHeroTrack, setSelectedHeroTrack] = useState<string>('')
  const [selectedFeaturedTracks, setSelectedFeaturedTracks] = useState<string[]>([])
  const [selectedPromoTracks, setSelectedPromoTracks] = useState<string[]>([])
  const [heroLabel, setHeroLabel] = useState('Featured Release')
  const [saveSuccess, setSaveSuccess] = useState(false)
  
  // Users tab state
  const [users, setUsers] = useState<any[]>([])
  const [userCounts, setUserCounts] = useState<any>(null)
  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all')
  const [userNeedsAttentionFilter, setUserNeedsAttentionFilter] = useState(false)
  const [usersLoading, setUsersLoading] = useState(false)
  
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

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers()
    }
  }, [activeTab])

  async function loadData() {
    if (!supabase) return
    setLoading(true)

    try {
      // Get accurate user counts from admin API
      let adminCounts = null
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const adminRes = await fetch('/api/admin/users', {
          headers: { 'Authorization': `Bearer ${session?.access_token || ''}` },
        })
        if (adminRes.ok) {
          const adminData = await adminRes.json()
          adminCounts = adminData.counts
        }
      } catch (e) {
        console.error('Failed to load admin counts:', e)
      }

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
      const totalUsers = adminCounts?.total || profilesData?.length || 0
      const totalArtists = adminCounts?.artists || artistsData?.length || 0
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
      setPurchases(musicPurchasesData || [])
    } catch (error) {
      console.error('Error loading founder data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadUsers() {
    if (!supabase) return
    setUsersLoading(true)
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const res = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
      })

      if (!res.ok) {
        console.error('Failed to load users:', await res.text())
        return
      }

      const data = await res.json()
      setUsers(data.users || [])
      setUserCounts(data.counts || {})
    } catch (err) {
      console.error('Error loading users:', err)
    } finally {
      setUsersLoading(false)
    }
  }

  async function updateArtistStatus(artistId: string, status: string) {
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

  function suspendArtist(artistId: string) {
    setConfirmModal({
      open: true,
      title: 'Suspend artist?',
      message: 'Their public profile will be hidden.',
      confirmLabel: 'Confirm Suspend',
      onConfirm: () => {
        setConfirmModal(m => ({ ...m, open: false }))
        updateArtistStatus(artistId, 'suspended')
      },
    })
  }

  function reactivateArtist(artistId: string) {
    setConfirmModal({
      open: true,
      title: 'Reactivate artist?',
      message: 'Their public profile will be visible again.',
      confirmLabel: 'Confirm Reactivate',
      onConfirm: () => {
        setConfirmModal(m => ({ ...m, open: false }))
        updateArtistStatus(artistId, 'approved')
      },
    })
  }

  async function updateTrackStatus(trackId: string, status: string) {
    if (!supabase) return
    
    // PHASE D: Use server endpoint instead of direct client update (bypasses RLS)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const res = await fetch(`/api/admin/tracks/${trackId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({ status }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        console.error('Error updating track status:', data.error || res.statusText)
        return
      }

      loadData()
    } catch (err: any) {
      console.error('Error updating track:', err)
    }
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
          {(['overview', 'users', 'music', 'content', 'revenue'] as const).map((tab) => (
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

        {/* Confirmation Modal */}
        {confirmModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="pf-card w-full max-w-sm mx-4 p-6 space-y-4">
              <h3 className="text-lg font-semibold">{confirmModal.title}</h3>
              <p className="text-sm text-[var(--pf-text-muted)]">{confirmModal.message}</p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setConfirmModal(m => ({ ...m, open: false }))}
                  className="flex-1 px-4 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] text-sm hover:bg-[var(--pf-surface-hover)]"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmModal.onConfirm}
                  className="flex-1 px-4 py-2 rounded-lg bg-[var(--pf-orange)] text-white text-sm font-medium hover:opacity-90"
                >
                  {confirmModal.confirmLabel}
                </button>
              </div>
            </div>
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

        {/* Users/Accounts Tab */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Summary Cards */}
            {userCounts && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="pf-card p-3">
                  <p className="text-xs text-[var(--pf-text-muted)]">Total Users</p>
                  <p className="text-xl font-bold">{userCounts.total}</p>
                </div>
                <div className="pf-card p-3">
                  <p className="text-xs text-[var(--pf-text-muted)]">Artists</p>
                  <p className="text-xl font-bold text-[var(--pf-orange)]">{userCounts.artists}</p>
                </div>
                <div className="pf-card p-3">
                  <p className="text-xs text-[var(--pf-text-muted)]">Fans</p>
                  <p className="text-xl font-bold">{userCounts.fans}</p>
                </div>
                <div className="pf-card p-3">
                  <p className="text-xs text-[var(--pf-text-muted)]">Needs Attention</p>
                  <p className="text-xl font-bold text-red-400">{userCounts.needs_attention}</p>
                </div>
                <div className="pf-card p-3">
                  <p className="text-xs text-[var(--pf-text-muted)]">Completed Onboarding</p>
                  <p className="text-xl font-bold text-green-400">{userCounts.completed_onboarding}</p>
                </div>
                <div className="pf-card p-3">
                  <p className="text-xs text-[var(--pf-text-muted)]">Uploaded Music</p>
                  <p className="text-xl font-bold text-blue-400">{userCounts.uploaded_music}</p>
                </div>
                <div className="pf-card p-3">
                  <p className="text-xs text-[var(--pf-text-muted)]">Businesses</p>
                  <p className="text-xl font-bold">{userCounts.businesses}</p>
                </div>
                <div className="pf-card p-3">
                  <p className="text-xs text-[var(--pf-text-muted)]">Admins</p>
                  <p className="text-xl font-bold">{userCounts.admins}</p>
                </div>
              </div>
            )}

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--pf-text-muted)]" size={16} />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search users by name or email..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] text-sm focus:border-[var(--pf-orange)] focus:outline-none"
                />
              </div>
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-4 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] text-sm focus:border-[var(--pf-orange)] focus:outline-none"
              >
                <option value="all">All Roles</option>
                <option value="artist">Artists</option>
                <option value="supporter">Fans/Listeners</option>
                <option value="business">Businesses</option>
                <option value="brand">Brands</option>
                <option value="admin">Admins</option>
                <option value="founder">Founders</option>
              </select>
              <button
                onClick={() => setUserNeedsAttentionFilter(!userNeedsAttentionFilter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  userNeedsAttentionFilter
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-[var(--pf-surface)] border border-[var(--pf-border)] text-[var(--pf-text-muted)]'
                }`}
              >
                Needs Attention
              </button>
            </div>

            {/* Loading State */}
            {usersLoading && (
              <div className="text-center py-12 text-[var(--pf-text-muted)]">
                <div className="animate-pulse">Loading users...</div>
              </div>
            )}

            {/* Desktop Table */}
            {!usersLoading && (
              <div className="hidden md:block pf-card overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--pf-border)] text-left">
                      <th className="p-3">User</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Tracks</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Signed Up</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users
                      .filter((u: any) => {
                        const matchesSearch = !userSearch ||
                          u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
                          u.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
                          u.username?.toLowerCase().includes(userSearch.toLowerCase())
                        const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter
                        const matchesAttention = !userNeedsAttentionFilter || u.needs_attention
                        return matchesSearch && matchesRole && matchesAttention
                      })
                      .map((user: any) => (
                        <tr key={user.id} className="border-b border-[var(--pf-border)] hover:bg-[var(--pf-surface-hover)]">
                          <td className="p-3">
                            <div className="font-medium">{user.full_name || user.username || 'Unnamed'}</div>
                            <p className="text-xs text-[var(--pf-text-muted)]">{user.email}</p>
                          </td>
                          <td className="p-3">
                            <span className={`text-xs px-2 py-1 rounded ${
                              user.role === 'artist' ? 'bg-purple-500/20 text-purple-400' :
                              user.role === 'founder' ? 'bg-orange-500/20 text-orange-400' :
                              user.role === 'admin' ? 'bg-blue-500/20 text-blue-400' :
                              user.role === 'business' || user.role === 'brand' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="p-3">
                            {user.artist_profile ? (
                              <span className={`text-xs px-2 py-1 rounded ${
                                user.artist_profile.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                user.artist_profile.status === 'approved' ? 'bg-blue-500/20 text-blue-400' :
                                user.artist_profile.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {user.artist_profile.status}
                              </span>
                            ) : (
                              <span className="text-xs text-[var(--pf-text-muted)]">—</span>
                            )}
                          </td>
                          <td className="p-3">
                            {user.track_count > 0 ? (
                              <span className="text-xs">{user.live_track_count}/{user.track_count} live</span>
                            ) : (
                              <span className="text-xs text-[var(--pf-text-muted)]">No uploads</span>
                            )}
                          </td>
                          <td className="p-3">
                            <span className={`text-xs ${user.email_confirmed ? 'text-green-400' : 'text-yellow-400'}`}>
                              {user.email_confirmed ? '✓ Confirmed' : '○ Unconfirmed'}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="text-xs text-[var(--pf-text-muted)]">
                              {new Date(user.signup_date).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              {user.artist_profile && (
                                <Link
                                  href={`/artist/${user.username || user.id}`}
                                  className="text-xs px-2 py-1 bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded hover:bg-[var(--pf-surface-hover)]"
                                >
                                  View
                                </Link>
                              )}
                              {user.needs_attention && user.attention_reasons?.map((reason: string) => (
                                <span key={reason} className="text-xs px-2 py-1 bg-yellow-500/10 text-yellow-400 rounded">
                                  {reason}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Mobile Cards */}
            {!usersLoading && (
              <div className="md:hidden space-y-3">
                {users
                  .filter((u: any) => {
                    const matchesSearch = !userSearch ||
                      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
                      u.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
                      u.username?.toLowerCase().includes(userSearch.toLowerCase())
                    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter
                    const matchesAttention = !userNeedsAttentionFilter || u.needs_attention
                    return matchesSearch && matchesRole && matchesAttention
                  })
                  .map((user: any) => (
                    <div key={user.id} className="pf-card p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{user.full_name || user.username || 'Unnamed'}</p>
                          <p className="text-xs text-[var(--pf-text-muted)]">{user.email}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          user.role === 'artist' ? 'bg-purple-500/20 text-purple-400' :
                          user.role === 'founder' ? 'bg-orange-500/20 text-orange-400' :
                          user.role === 'admin' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {user.role}
                        </span>
                      </div>
                      
                      <div className="text-xs text-[var(--pf-text-muted)] space-y-1">
                        <p>Signed up: {new Date(user.signup_date).toLocaleDateString()}</p>
                        <p>Email: {user.email_confirmed ? '✓ Confirmed' : '○ Unconfirmed'}</p>
                        {user.last_seen && <p>Last seen: {new Date(user.last_seen).toLocaleDateString()}</p>}
                      </div>

                      {user.artist_profile && (
                        <div className="text-xs space-y-1">
                          <p>
                            <span className="text-[var(--pf-text-muted)]">Artist status: </span>
                            <span className={`
                              ${user.artist_profile.status === 'active' ? 'text-green-400' :
                                user.artist_profile.status === 'approved' ? 'text-blue-400' :
                                user.artist_profile.status === 'pending' ? 'text-yellow-400' :
                                'text-red-400'}
                            `}>
                              {user.artist_profile.status}
                            </span>
                          </p>
                          <p>
                            <span className="text-[var(--pf-text-muted)]">Tracks: </span>
                            <span>{user.live_track_count}/{user.track_count} live</span>
                          </p>
                          <p>
                            <span className="text-[var(--pf-text-muted)]">Public: </span>
                            <span>{user.artist_profile.public_profile_enabled ? 'Visible' : 'Hidden'}</span>
                          </p>
                        </div>
                      )}

                      {user.needs_attention && user.attention_reasons?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {user.attention_reasons.map((reason: string) => (
                            <span key={reason} className="text-xs px-2 py-1 bg-yellow-500/10 text-yellow-400 rounded">
                              {reason}
                            </span>
                          ))}
                        </div>
                      )}

                      {user.artist_profile && (
                        <Link
                          href={`/artist/${user.username || user.id}`}
                          className="block text-center text-xs px-3 py-2 bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded hover:bg-[var(--pf-surface-hover)]"
                        >
                          View Artist Profile
                        </Link>
                      )}
                    </div>
                  ))}
              </div>
            )}

            {!usersLoading && users.filter((u: any) => {
              const matchesSearch = !userSearch ||
                u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
                u.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
                u.username?.toLowerCase().includes(userSearch.toLowerCase())
              const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter
              const matchesAttention = !userNeedsAttentionFilter || u.needs_attention
              return matchesSearch && matchesRole && matchesAttention
            }).length === 0 && (
              <div className="text-center py-12 text-[var(--pf-text-muted)]">
                <p>No users match your filters.</p>
              </div>
            )}
          </div>
        )}

        {/* Music Tab */}
        {activeTab === 'music' && (
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
            {/* Revenue Metrics */}
            <div className="pf-card p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="text-[var(--pf-orange)]" />
                Revenue Overview
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-[var(--pf-surface)]">
                  <p className="text-xs text-[var(--pf-text-muted)]">Total Purchases</p>
                  <p className="text-2xl font-bold">{purchases.length}</p>
                </div>
                <div className="p-4 rounded-lg bg-[var(--pf-surface)]">
                  <p className="text-xs text-[var(--pf-text-muted)]">Total Revenue</p>
                  <p className="text-2xl font-bold">
                    ${(purchases.reduce((sum, p) => sum + (p.amount_paid || 0), 0) / 100).toFixed(2)}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-[var(--pf-surface)]">
                  <p className="text-xs text-[var(--pf-text-muted)]">Unique Buyers</p>
                  <p className="text-2xl font-bold">
                    {new Set(purchases.map(p => p.buyer_email)).size}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-[var(--pf-surface)]">
                  <p className="text-xs text-[var(--pf-text-muted)]">Downloaded</p>
                  <p className="text-2xl font-bold">
                    {purchases.filter(p => (p.download_count || 0) > 0).length}
                  </p>
                </div>
              </div>
            </div>

            {/* Purchase Table */}
            <div className="pf-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Package className="text-[var(--pf-orange)]" />
                  Purchase History
                </h2>
                <span className="text-sm text-[var(--pf-text-muted)]">
                  {purchases.length} total
                </span>
              </div>

              {/* Search & Filter */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--pf-text-muted)]" size={16} />
                  <input
                    type="text"
                    placeholder="Search buyer, track, or artist..."
                    value={purchaseSearch}
                    onChange={(e) => setPurchaseSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] text-sm focus:border-[var(--pf-orange)] outline-none"
                  />
                </div>
                <select
                  value={purchaseArtistFilter}
                  onChange={(e) => setPurchaseArtistFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] text-sm focus:border-[var(--pf-orange)] outline-none"
                >
                  <option value="all">All Artists</option>
                  {Array.from(new Set(purchases.map(p => p.artist_name))).sort().map(artist => (
                    <option key={artist} value={artist}>{artist}</option>
                  ))}
                </select>
                <select
                  value={purchaseDateFilter}
                  onChange={(e) => setPurchaseDateFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] text-sm focus:border-[var(--pf-orange)] outline-none"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--pf-border)] text-left text-[var(--pf-text-muted)]">
                      <th className="pb-3 px-3 font-medium">Track</th>
                      <th className="pb-3 px-3 font-medium">Artist</th>
                      <th className="pb-3 px-3 font-medium">Buyer</th>
                      <th className="pb-3 px-3 font-medium">Amount</th>
                      <th className="pb-3 px-3 font-medium">Date</th>
                      <th className="pb-3 px-3 font-medium">Status</th>
                      <th className="pb-3 px-3 font-medium">Downloads</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const now = new Date()
                      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
                      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

                      const filtered = purchases.filter(p => {
                        const matchesSearch = !purchaseSearch ||
                          p.track_title?.toLowerCase().includes(purchaseSearch.toLowerCase()) ||
                          p.artist_name?.toLowerCase().includes(purchaseSearch.toLowerCase()) ||
                          p.buyer_email?.toLowerCase().includes(purchaseSearch.toLowerCase())
                        const matchesArtist = purchaseArtistFilter === 'all' || p.artist_name === purchaseArtistFilter
                        const purchaseDate = new Date(p.purchased_at)
                        const matchesDate = purchaseDateFilter === 'all' ||
                          (purchaseDateFilter === 'today' && purchaseDate >= todayStart) ||
                          (purchaseDateFilter === 'week' && purchaseDate >= weekStart) ||
                          (purchaseDateFilter === 'month' && purchaseDate >= monthStart)
                        return matchesSearch && matchesArtist && matchesDate
                      })

                      if (filtered.length === 0) {
                        return (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-[var(--pf-text-muted)]">
                              No purchases match your filters.
                            </td>
                          </tr>
                        )
                      }

                      return filtered
                        .sort((a, b) => new Date(b.purchased_at).getTime() - new Date(a.purchased_at).getTime())
                        .map(p => {
                          const isTokenValid = p.recovery_token &&
                            (!p.recovery_token_expires_at || new Date(p.recovery_token_expires_at) > new Date())
                          const hasDownloaded = (p.download_count || 0) > 0

                          return (
                            <tr key={p.id} className="border-b border-[var(--pf-border)] last:border-0 hover:bg-[var(--pf-surface-hover)]">
                              <td className="py-3 px-3">
                                <p className="font-medium">{p.track_title}</p>
                                <p className="text-xs text-[var(--pf-text-muted)] truncate max-w-[200px]">
                                  {p.stripe_session_id ? p.stripe_session_id.slice(0, 12) + '...' : 'No session'}
                                </p>
                              </td>
                              <td className="py-3 px-3 text-[var(--pf-text-secondary)]">{p.artist_name}</td>
                              <td className="py-3 px-3">
                                <p className="text-[var(--pf-text-secondary)]">{p.buyer_email}</p>
                              </td>
                              <td className="py-3 px-3 font-medium">${(p.amount_paid / 100).toFixed(2)}</td>
                              <td className="py-3 px-3 text-[var(--pf-text-muted)]">
                                {new Date(p.purchased_at).toLocaleDateString('en-US', {
                                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                              </td>
                              <td className="py-3 px-3">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                  isTokenValid
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                  {isTokenValid ? 'Ready' : 'Token Expired'}
                                </span>
                              </td>
                              <td className="py-3 px-3">
                                <span className={`text-xs font-medium ${
                                  hasDownloaded ? 'text-green-400' : 'text-[var(--pf-text-muted)]'
                                }`}>
                                  {hasDownloaded ? `${p.download_count}×` : '—'}
                                </span>
                              </td>
                            </tr>
                          )
                        })
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
