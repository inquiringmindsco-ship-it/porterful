'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/app/providers'
import Link from 'next/link'
import { ArtistAvatar } from '@/components/artist/ArtistAvatar'
import { CollaboratorStack } from '@/components/artist/CollaboratorStack'
import { buildTrackArtistCredits } from '@/lib/artist-credits'
import { 
  Users, Music, Package, DollarSign, AlertCircle, 
  CheckCircle, XCircle, Play, Pause,
  ChevronUp, ChevronDown, Shield, TrendingUp,
  Star, Sparkles, LayoutTemplate, Search, Filter,
  RefreshCw,
  ExternalLink, Edit3, Eye
} from 'lucide-react'
import { EmptyState, GuidanceRoadmap, StageTracker, NextStepCard, AttentionCard } from '@/components/guidance/GuidedExperience'
import { useGuidedTour } from '@/components/guidance/GuidedTour'
import { attachTrackCollaborators, loadTrackCollaboratorMap } from '@/lib/track-collaborators'

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
  proud_to_pay_min?: number
  created_at: string
}

type Metric = {
  label: string
  value: string | number
  status: 'ok' | 'warning' | 'error' | 'info'
}

type RevenueTransaction = {
  source: string
  id: string
  stripe_session_id: string | null
  buyer_email: string | null
  buyer_user_id: string | null
  amount_cents: number
  amount_dollars: string
  status: string
  payment_method: string
  created_at: string
  track_title?: string
  artist_name?: string
}

export default function FounderDashboard() {
  const router = useRouter()
  const { user, supabase } = useSupabase()
  const { restartTour } = useGuidedTour()
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [artists, setArtists] = useState<ArtistWithProfile[]>([])
  const [tracks, setTracks] = useState<TrackWithArtist[]>([])
  const [productionAssets, setProductionAssets] = useState<any[]>([])
  const [productSkus, setProductSkus] = useState<any[]>([])
  const [inventorySummaries, setInventorySummaries] = useState<any[]>([])
  const [fulfillmentJobs, setFulfillmentJobs] = useState<any[]>([])
  const [needsAttention, setNeedsAttention] = useState<any[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [revenueTransactions, setRevenueTransactions] = useState<RevenueTransaction[]>([])
  const [revenueMetrics, setRevenueMetrics] = useState<any>(null)
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [analyticsLastUpdated, setAnalyticsLastUpdated] = useState<string | null>(null)
  const [analyticsRefreshing, setAnalyticsRefreshing] = useState(false)
  const [livePresence, setLivePresence] = useState<any>(null)
  const [livePresenceLastUpdated, setLivePresenceLastUpdated] = useState<string | null>(null)
  const [livePresenceRefreshing, setLivePresenceRefreshing] = useState(false)
  const [revenueLoading, setRevenueLoading] = useState(false)
  const [purchaseSearch, setPurchaseSearch] = useState('')
  const [purchaseArtistFilter, setPurchaseArtistFilter] = useState<string>('all')
  const [purchaseDateFilter, setPurchaseDateFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'music' | 'content' | 'revenue' | 'analytics'>('overview')
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
  const [promotingUsers, setPromotingUsers] = useState<Record<string, boolean>>({})
  
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

  const fetchAnalyticsSnapshot = useCallback(async (accessToken: string) => {
    const [revenueRes, analyticsRes] = await Promise.all([
      fetch('/api/dashboard/revenue', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
        cache: 'no-store',
      }),
      fetch('/api/dashboard/analytics', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
        cache: 'no-store',
      }),
    ])

    if (!revenueRes.ok) {
      throw new Error(await revenueRes.text() || 'Failed to load revenue report')
    }

    const revenueData = await revenueRes.json()
    let analyticsReport: any = null

    if (analyticsRes.ok) {
      analyticsReport = await analyticsRes.json()
    } else {
      console.error('Failed to load analytics report:', await analyticsRes.text())
    }

    return { revenueData, analyticsReport }
  }, [])

  const fetchLivePresenceSnapshot = useCallback(async () => {
    const response = await fetch('/api/admin/presence', {
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(await response.text() || 'Failed to load live presence')
    }

    return response.json()
  }, [])

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
    setError('')

    try {
      const { data: { session } } = await supabase.auth.getSession()

      // Get accurate user counts from admin API
      let adminCounts = null
      try {
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

      const { revenueData, analyticsReport } = await fetchAnalyticsSnapshot(session?.access_token || '')

      const { data: profilesData } = await supabase.from('profiles').select('id, role, created_at')
      const { data: artistsData } = await supabase.from('artists').select('*')
      const { data: tracksDataRaw } = await supabase.from('tracks').select('*')
      const tracksData = tracksDataRaw || []
      const collaboratorMap = await loadTrackCollaboratorMap(
        supabase,
        tracksData.map((track: any) => track.id).filter(Boolean),
      ).catch(() => new Map())
      const enrichedTracksData = attachTrackCollaborators(tracksData, collaboratorMap)

      const [assetsRes, skusRes, inventoryRes, jobsRes] = await Promise.all([
        fetch('/api/production-assets?current_only=true', {
          headers: { 'Authorization': `Bearer ${session?.access_token || ''}` },
          cache: 'no-store',
        }),
        fetch('/api/product-skus', {
          headers: { 'Authorization': `Bearer ${session?.access_token || ''}` },
          cache: 'no-store',
        }),
        fetch('/api/inventory-ledger?limit=200', {
          headers: { 'Authorization': `Bearer ${session?.access_token || ''}` },
          cache: 'no-store',
        }),
        fetch('/api/fulfillment-jobs?limit=200', {
          headers: { 'Authorization': `Bearer ${session?.access_token || ''}` },
          cache: 'no-store',
        }),
      ])

      if (assetsRes.ok) {
        const data = await assetsRes.json().catch(() => ({}))
        setProductionAssets(data.assets || [])
      }
      if (skusRes.ok) {
        const data = await skusRes.json().catch(() => ({}))
        setProductSkus(data.skus || [])
      }
      if (inventoryRes.ok) {
        const data = await inventoryRes.json().catch(() => ({}))
        setInventorySummaries(data.summaries || [])
      }
      if (jobsRes.ok) {
        const data = await jobsRes.json().catch(() => ({}))
        setFulfillmentJobs(data.jobs || [])
      }

      try {
        const presenceData = await fetchLivePresenceSnapshot()
        setLivePresence(presenceData)
        setLivePresenceLastUpdated(new Date().toISOString())
      } catch (presenceError) {
        console.error('Failed to load live presence snapshot:', presenceError)
      }

      // Calculate metrics
      const totalUsers = adminCounts?.total || profilesData?.length || 0
      const totalArtists = adminCounts?.artists || artistsData?.length || 0
      const totalTracks = enrichedTracksData.length
      const liveTracks = enrichedTracksData.filter(t => t.status === 'live' || t.is_active).length || 0

      // Calculate revenue from the canonical report.
      const totalRevenue = (revenueData?.totals?.revenue_cents || 0) / 100
      const totalPurchases = analyticsReport?.metrics?.total_purchases || revenueData?.totals?.transactions_count || 0
      const totalPlays = analyticsReport?.metrics?.total_plays || 0
      const totalDownloads = analyticsReport?.metrics?.total_downloads || 0
      const totalEmailCaptures = analyticsReport?.metrics?.total_email_captures || 0
      const visitorSessions = analyticsReport?.metrics?.visitor_count || 0
      const visitorToPlay = analyticsReport?.metrics?.conversion_rates?.visitor_to_play || '0.0%'
      const playToEmail = analyticsReport?.metrics?.conversion_rates?.play_to_email || '0.0%'
      const emailToPurchase = analyticsReport?.metrics?.conversion_rates?.email_to_purchase || '0.0%'
      const purchaseToDownload = analyticsReport?.metrics?.conversion_rates?.purchase_to_download || '0.0%'

      // Revenue by time range
      const revenueToday = revenueData?.metrics?.revenue_today_dollars
        ? parseFloat(revenueData.metrics.revenue_today_dollars)
        : 0
      const revenueWeek = revenueData?.metrics?.revenue_week_dollars
        ? parseFloat(revenueData.metrics.revenue_week_dollars)
        : 0

      // Calculate potential catalog value
      const trackPrices = enrichedTracksData.map((t: any) => Number(t.proud_to_pay_min ?? t.price ?? 0)) || []
      const catalogValue = trackPrices.reduce((sum: number, p: number) => sum + p, 0)

      // Tracks needing attention
      const attentionItems: any[] = []
      
      enrichedTracksData.forEach((t: any) => {
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
        const artistTracks = enrichedTracksData.filter((t: any) => t.artist_id === a.id) || []
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
      const enrichedTracks = enrichedTracksData.map((t: any) => ({
        ...t,
        status: t.status || (t.is_active ? 'live' : 'draft')
      }))

      setMetrics([
        { label: 'Total Plays', value: totalPlays, status: 'ok' },
        { label: 'Total Downloads', value: totalDownloads, status: 'ok' },
        { label: 'Email Captures', value: totalEmailCaptures, status: 'ok' },
        { label: 'Total Purchases', value: totalPurchases, status: 'info' },
        { label: 'Visitor Sessions', value: visitorSessions, status: 'info' },
        { label: 'Visitor → Play', value: visitorToPlay, status: 'info' },
        { label: 'Play → Email', value: playToEmail, status: 'info' },
        { label: 'Email → Purchase', value: emailToPurchase, status: 'info' },
        { label: 'Purchase → Download', value: purchaseToDownload, status: 'info' },
        { label: 'Total Artists', value: totalArtists, status: 'ok' },
        { label: 'Total Users', value: totalUsers, status: 'ok' },
        { label: 'Total Tracks', value: totalTracks, status: 'ok' },
        { label: 'Live Tracks', value: liveTracks, status: 'ok' },
        { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, status: 'info' },
        { label: 'Catalog Value', value: `$${catalogValue.toFixed(2)}`, status: 'info' },
        { label: 'Needs Attention', value: attentionItems.length, status: attentionItems.length > 0 ? 'warning' : 'ok' },
      ])

      setArtists(enrichedArtists)
      setTracks(enrichedTracks)
      setNeedsAttention(attentionItems)
      setRevenueMetrics(revenueData?.metrics || null)
      setRevenueTransactions(revenueData?.transactions || [])
      setAnalyticsData(analyticsReport)
      setAnalyticsLastUpdated(new Date().toISOString())
      setPurchases(revenueData?.transactions || [])
    } catch (error) {
      console.error('Error loading founder data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load founder data')
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

  async function promoteUserToArtist(user: any) {
    if (!supabase) return

    setError('')
    setNotice('')
    setPromotingUsers(prev => ({ ...prev, [user.id]: true }))

    try {
      const res = await fetch('/api/admin/users/promote-to-artist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: user.id }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || `Failed to promote ${user.full_name || user.email || 'user'} to artist`)
        return
      }

      const displayName = user.full_name || user.username || user.email || 'User'
      setNotice(`${displayName} is now an artist.`)
      window.setTimeout(() => setNotice(''), 3000)
      await loadUsers()
      await loadData()
    } catch (err: any) {
      console.error('Error promoting user:', err)
      setError(err.message || 'Failed to promote user to artist')
    } finally {
      setPromotingUsers(prev => ({ ...prev, [user.id]: false }))
    }
  }

  const refreshAnalytics = useCallback(async () => {
    if (!supabase) return

    setAnalyticsRefreshing(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const { revenueData, analyticsReport } = await fetchAnalyticsSnapshot(session?.access_token || '')
      setRevenueMetrics(revenueData?.metrics || null)
      setAnalyticsData(analyticsReport)
      setAnalyticsLastUpdated(new Date().toISOString())
    } catch (error) {
      console.error('Failed to refresh analytics report:', error)
    } finally {
      setAnalyticsRefreshing(false)
    }
  }, [fetchAnalyticsSnapshot, supabase])

  const refreshLivePresence = useCallback(async () => {
    setLivePresenceRefreshing(true)

    try {
      const presenceData = await fetchLivePresenceSnapshot()
      setLivePresence(presenceData)
      setLivePresenceLastUpdated(new Date().toISOString())
    } catch (presenceError) {
      console.error('Failed to refresh live presence snapshot:', presenceError)
    } finally {
      setLivePresenceRefreshing(false)
    }
  }, [fetchLivePresenceSnapshot])

  useEffect(() => {
    if (activeTab !== 'analytics') return

    void refreshAnalytics()
    const interval = window.setInterval(() => {
      void refreshAnalytics()
    }, 30000)

    return () => window.clearInterval(interval)
  }, [activeTab, refreshAnalytics])

  useEffect(() => {
    void refreshLivePresence()
    const interval = window.setInterval(() => {
      void refreshLivePresence()
    }, 15000)

    return () => window.clearInterval(interval)
  }, [refreshLivePresence])

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

  const merchGuidance = useMemo(() => {
    const pendingAssetReviews = productionAssets.filter((asset: any) =>
      ['submitted', 'under_review'].includes(asset.approval_status)
    )
    const productionApprovedAssets = productionAssets.filter((asset: any) =>
      asset.production_status === 'production_approved'
    )
    const productionApprovedWithoutSku = productionApprovedAssets.filter((asset: any) =>
      !productSkus.some((sku: any) => sku.production_asset_id === asset.asset_id)
    )
    const inventoryBySkuId = new Map(
      inventorySummaries.map((summary: any) => [summary.sku_id, summary])
    )
    const skusWithoutInventory = productSkus.filter((sku: any) => {
      const summary = inventoryBySkuId.get(sku.sku_id)
      return !summary || (
        Number(summary.on_hand || 0) === 0 &&
        Number(summary.reserved || 0) === 0 &&
        Number(summary.available || 0) === 0 &&
        Number(summary.shipped || 0) === 0 &&
        Number(summary.returned || 0) === 0
      )
    })
    const jobsNeedingAction = fulfillmentJobs.filter((job: any) =>
      ['pending', 'reserved', 'printing', 'qc', 'packed', 'exception'].includes(job.status)
    )
    const blockedJobs = fulfillmentJobs.filter((job: any) =>
      ['exception', 'cancelled'].includes(job.status)
    )
    const inventoryReady = inventorySummaries.some((summary: any) => Number(summary.on_hand || 0) > 0)

    let currentStage = 'Wait for artist submissions'
    let nextStep = 'Review submitted assets, then move approved creative work into SKUs, stock, and fulfillment.'
    let actionLabel = 'Review assets'
    let actionHref = '/dashboard/founder/assets'

    if (pendingAssetReviews.length > 0) {
      currentStage = 'Review submitted assets'
      nextStep = 'Approve, reject, or request revisions for the newest submissions.'
    } else if (productionApprovedWithoutSku.length > 0) {
      currentStage = 'Create SKUs from approved assets'
      nextStep = 'Create sellable SKU variants from each production-approved asset.'
      actionLabel = 'Create SKUs'
      actionHref = '/dashboard/founder/skus'
    } else if (skusWithoutInventory.length > 0 || !inventoryReady) {
      currentStage = 'Add inventory to SKUs'
      nextStep = 'Receive stock or adjust inventory so approved SKUs can move toward fulfillment.'
      actionLabel = 'Add inventory'
      actionHref = '/dashboard/founder/inventory'
    } else if (jobsNeedingAction.length > 0 || blockedJobs.length > 0) {
      currentStage = 'Move fulfillment jobs forward'
      nextStep = 'Reserve, print, QC, pack, ship, and resolve any blocked jobs.'
      actionLabel = 'Open fulfillment queue'
      actionHref = '/dashboard/founder/fulfillment'
    } else if (productionAssets.length > 0) {
      currentStage = 'Monitor new activity'
      nextStep = 'Keep an eye on new submissions and queue exceptions as they appear.'
      actionLabel = 'Open review queue'
      actionHref = '/dashboard/founder/assets'
    }

    return {
      pendingAssetReviews,
      productionApprovedAssets,
      productionApprovedWithoutSku,
      skusWithoutInventory,
      jobsNeedingAction,
      blockedJobs,
      currentStage,
      nextStep,
      actionLabel,
      actionHref,
    }
  }, [fulfillmentJobs, inventorySummaries, productionAssets, productSkus])

  const liveNowPlaying = useMemo(() => {
    return (livePresence?.activeUsers || [])
      .filter((listener: any) => listener.now_playing?.trackTitle)
      .slice(0, 6)
  }, [livePresence])

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
        {/* GUIDANCE: Founder Operational Path */}
        <div data-tour-id="founder-dashboard-guidance">
          <StageTracker
            title="Founder Operations"
            stages={[
              { label: 'Review Assets', status: merchGuidance.pendingAssetReviews.length > 0 ? 'current' : productionAssets.length > 0 ? 'complete' : 'current' },
              { label: 'Approve/Reject', status: merchGuidance.pendingAssetReviews.length > 0 ? 'current' : productionAssets.length > 0 ? 'complete' : 'pending' },
              { label: 'Production OK', status: merchGuidance.productionApprovedAssets.length > 0 ? 'complete' : 'pending' },
              { label: 'Create SKU', status: productSkus.length > 0 ? 'complete' : 'pending' },
              { label: 'Add Inventory', status: inventorySummaries.some((summary: any) => Number(summary.on_hand || 0) > 0) ? 'complete' : 'pending' },
              { label: 'Manage Jobs', status: fulfillmentJobs.length > 0 ? 'complete' : 'pending' },
              { label: 'Track Status', status: fulfillmentJobs.some((job: any) => ['shipped', 'delivered'].includes(job.status)) ? 'complete' : 'pending' },
            ]}
          />
        </div>

        <GuidanceRoadmap
          eyebrow="Founder ops"
          title="Keep the asset-to-fulfillment chain moving"
          description="Review submissions, convert approved assets into SKUs, add stock, and move jobs forward when they are ready."
          currentStage={merchGuidance.currentStage}
          nextStep={merchGuidance.nextStep}
          signals={[
            {
              label: 'Pending asset reviews',
              value: String(merchGuidance.pendingAssetReviews.length),
              tone: merchGuidance.pendingAssetReviews.length > 0 ? 'warning' : 'neutral',
            },
            {
              label: 'Approved assets without SKUs',
              value: String(merchGuidance.productionApprovedWithoutSku.length),
              tone: merchGuidance.productionApprovedWithoutSku.length > 0 ? 'info' : 'neutral',
            },
            {
              label: 'SKUs without inventory',
              value: String(merchGuidance.skusWithoutInventory.length),
              tone: merchGuidance.skusWithoutInventory.length > 0 ? 'warning' : 'neutral',
            },
            {
              label: 'Jobs needing action',
              value: String(merchGuidance.jobsNeedingAction.length),
              tone: merchGuidance.jobsNeedingAction.length > 0 ? 'warning' : 'neutral',
            },
            {
              label: 'Blocked jobs',
              value: String(merchGuidance.blockedJobs.length),
              tone: merchGuidance.blockedJobs.length > 0 ? 'warning' : 'neutral',
            },
          ]}
          actionLabel={merchGuidance.actionLabel}
          actionHref={merchGuidance.actionHref}
        />

        {/* Attention Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4" data-tour-id="founder-dashboard-actions">
          <AttentionCard
            count={merchGuidance.pendingAssetReviews.length}
            label="Assets Waiting for Review"
            href="/dashboard/founder/assets"
            severity="warning"
          />
          <AttentionCard
            count={merchGuidance.productionApprovedWithoutSku.length}
            label="Approved Assets Need SKUs"
            href="/dashboard/founder/skus"
            severity="info"
          />
          <AttentionCard
            count={merchGuidance.skusWithoutInventory.length}
            label="SKUs Need Inventory"
            href="/dashboard/founder/inventory"
            severity="warning"
          />
          <AttentionCard
            count={merchGuidance.jobsNeedingAction.length}
            label="Jobs Need Action"
            href="/dashboard/founder/fulfillment"
            severity="warning"
          />
          <AttentionCard
            count={merchGuidance.blockedJobs.length}
            label="Blocked Jobs"
            href="/dashboard/founder/fulfillment"
            severity="error"
          />
        </div>

        <NextStepCard
          title={merchGuidance.currentStage}
          description={merchGuidance.nextStep}
          actionLabel={merchGuidance.actionLabel}
          actionHref={merchGuidance.actionHref}
          variant={
            merchGuidance.pendingAssetReviews.length > 0 ||
            merchGuidance.productionApprovedWithoutSku.length > 0 ||
            merchGuidance.skusWithoutInventory.length > 0 ||
            merchGuidance.jobsNeedingAction.length > 0 ||
            merchGuidance.blockedJobs.length > 0
            ? 'warning'
            : 'default'
          }
        />

        <div
          className="mb-6 overflow-hidden rounded-[32px] border border-emerald-500/20 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.20),transparent_36%),linear-gradient(180deg,rgba(9,17,15,0.98),rgba(8,8,10,0.97))] shadow-[0_24px_90px_rgba(0,0,0,0.28)]"
          data-tour-id="founder-live-listening"
        >
          <div className="border-b border-emerald-500/10 px-6 py-4 sm:px-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Listening
                </span>
                <p className="text-sm text-[var(--pf-text-secondary)]">
                  See what people are playing right now.
                </p>
              </div>
              <div className="text-xs text-[var(--pf-text-muted)]">
                {livePresenceRefreshing
                  ? 'Refreshing now...'
                  : livePresenceLastUpdated
                    ? `Updated ${new Date(livePresenceLastUpdated).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
                    : 'Waiting for first refresh'}
              </div>
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-[1.25fr_.85fr]">
            <div className="p-6 sm:p-7">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-300/80">Current playback</p>
                  <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                    {liveNowPlaying.length > 0 ? 'What is playing live now' : 'No track is live right now'}
                  </h2>
                </div>
                <div className="rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3 text-right">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--pf-text-muted)]">Active listeners</p>
                  <p className="mt-1 text-3xl font-black text-white">
                    {livePresence?.counts?.playing || 0}
                  </p>
                </div>
              </div>

              {liveNowPlaying.length > 0 ? (
                <div className="space-y-3">
                  {liveNowPlaying.map((listener: any, index: number) => {
                    const isPrimary = index === 0
                    return (
                      <div
                        key={listener.id}
                        className={`rounded-2xl border p-4 transition-colors ${
                          isPrimary
                            ? 'border-emerald-400/30 bg-emerald-400/10'
                            : 'border-[var(--pf-border)] bg-[var(--pf-surface)]/65'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="rounded-full border border-[var(--pf-border)] bg-black/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--pf-text-muted)]">
                                #{index + 1}
                              </span>
                              <p className="text-lg font-semibold text-white truncate">
                                {listener.now_playing?.trackTitle || 'Unknown Track'}
                              </p>
                            </div>
                            <p className="mt-1 text-sm text-[var(--pf-text-secondary)] truncate">
                              {listener.now_playing?.artistName || 'Unknown Artist'}
                            </p>
                            <p className="mt-2 text-xs text-[var(--pf-text-muted)] truncate">
                              {listener.display_name || 'Listener'} · {listener.current_path || '/'}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                              {listener.now_playing?.playbackState || 'playing'}
                            </span>
                            <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-[var(--pf-text-muted)]">
                              {listener.now_playing?.playbackMode || 'full'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)]/70 p-5">
                  <p className="text-base font-semibold text-white">Nothing is playing live right now.</p>
                  <p className="mt-1 text-sm text-[var(--pf-text-secondary)]">
                    As soon as someone presses play, the track title, artist, and session will appear here.
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-emerald-500/10 lg:border-l lg:border-t-0 lg:border-emerald-500/10 p-6 sm:p-7 bg-black/20">
              <div className="flex items-center gap-2">
                <Play className="text-emerald-300" size={18} />
                <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-200">Live feed</h3>
              </div>
              <p className="mt-3 text-sm text-[var(--pf-text-secondary)] leading-6">
                This panel updates automatically while Porterful is open, so you can see what song is being heard right now without hunting through analytics.
              </p>
              <div className="mt-5 grid gap-3">
                <div className="rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)]/70 p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--pf-text-muted)]">Current song</p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {liveNowPlaying[0]?.now_playing?.trackTitle || 'Waiting for play activity'}
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)]/70 p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--pf-text-muted)]">Current artist</p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {liveNowPlaying[0]?.now_playing?.artistName || 'No live artist yet'}
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)]/70 p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--pf-text-muted)]">Where it’s playing</p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {liveNowPlaying[0]?.display_name || 'A live listener will appear here'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="text-[var(--pf-orange)]" />
            Founder Dashboard
          </h1>
          <p className="text-[var(--pf-text-muted)] mt-1">Platform control and oversight</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/dashboard/founder/assets" className="pf-btn pf-btn-secondary inline-flex items-center gap-2" data-tour-id="founder-assets-link">
              <Package size={16} />
              Production Assets
            </Link>
            <Link href="/dashboard/founder/products" className="pf-btn pf-btn-secondary inline-flex items-center gap-2" data-tour-id="founder-products-link">
              <Package size={16} />
              Products
            </Link>
            <Link href="/dashboard/founder/skus" className="pf-btn pf-btn-secondary inline-flex items-center gap-2" data-tour-id="founder-skus-link">
              <Package size={16} />
              SKUs
            </Link>
            <Link href="/dashboard/founder/inventory" className="pf-btn pf-btn-secondary inline-flex items-center gap-2" data-tour-id="founder-inventory-link">
              <Package size={16} />
              Inventory
            </Link>
            <Link href="/dashboard/founder/fulfillment" className="pf-btn pf-btn-secondary inline-flex items-center gap-2" data-tour-id="founder-fulfillment-link">
              <Package size={16} />
              Fulfillment Queue
            </Link>
            <Link href="/dashboard/founder/returns" className="pf-btn pf-btn-secondary inline-flex items-center gap-2">
              <Package size={16} />
              Returns
            </Link>
            <button type="button" onClick={() => restartTour('founder')} className="pf-btn pf-btn-secondary inline-flex items-center gap-2">
              <RefreshCw size={16} />
              Restart Tour
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-[var(--pf-border)] overflow-x-auto">
          {(['overview', 'users', 'music', 'content', 'revenue', 'analytics'] as const).map((tab) => (
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-tour-id="founder-analytics-metrics">
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
              <div className="pf-card p-6" data-tour-id="founder-needs-attention">
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
                              {(user.role === 'supporter' || user.role === 'superfan') && (
                                <button
                                  onClick={() => promoteUserToArtist(user)}
                                  disabled={promotingUsers[user.id]}
                                  className="text-xs px-2 py-1 bg-[var(--pf-orange)]/15 text-[var(--pf-orange)] rounded hover:bg-[var(--pf-orange)]/25 disabled:opacity-60"
                                >
                                  {promotingUsers[user.id] ? 'Promoting...' : 'Promote to Artist'}
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

                      {user.artist_application && user.role !== 'artist' && (
                        <div className="text-xs rounded-lg border border-[var(--pf-border)] bg-[var(--pf-surface)] px-3 py-2 text-[var(--pf-text-muted)]">
                          Application on file: {user.artist_application.stage_name || 'Artist'}
                          {user.artist_application.genre ? ` · ${user.artist_application.genre}` : ''}
                        </div>
                      )}

                      {user.latest_role_transition && (
                        <div className="text-xs rounded-lg border border-[var(--pf-border)] bg-[var(--pf-bg)] px-3 py-2 text-[var(--pf-text-muted)]">
                          Role change: {user.latest_role_transition.previous_role || 'none'} → {user.latest_role_transition.next_role}
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

                      {(user.role === 'supporter' || user.role === 'superfan') && (
                        <button
                          onClick={() => promoteUserToArtist(user)}
                          disabled={promotingUsers[user.id]}
                          className="w-full text-xs px-3 py-2 bg-[var(--pf-orange)]/15 text-[var(--pf-orange)] rounded hover:bg-[var(--pf-orange)]/25 disabled:opacity-60"
                        >
                          {promotingUsers[user.id] ? 'Promoting...' : 'Promote to Artist'}
                        </button>
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
                      <td className="p-3">
                        {(() => {
                          const artistCredits = buildTrackArtistCredits(track)
                          const primaryArtist = artistCredits[0]
                          return (
                            <div className="flex items-center gap-3 min-w-0">
                              <ArtistAvatar
                                src={primaryArtist?.image || null}
                                alt={primaryArtist?.name || track.artist}
                                name={primaryArtist?.name || track.artist}
                                size="sm"
                                className="ring-1 ring-white/10"
                              />
                              <div className="min-w-0">
                                <p className="font-medium truncate">{primaryArtist?.name || track.artist}</p>
                                {artistCredits.length > 1 && (
                                  <CollaboratorStack artists={artistCredits} size="xs" className="mt-1" />
                                )}
                              </div>
                            </div>
                          )
                        })()}
                      </td>
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
                      <td className="p-3">${Number(track.proud_to_pay_min ?? track.price ?? 0).toFixed(2)}</td>
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
                    <div className="min-w-0">
                      <p className="font-medium truncate">{track.title}</p>
                      {(() => {
                        const artistCredits = buildTrackArtistCredits(track)
                        const primaryArtist = artistCredits[0]
                        return (
                          <div className="mt-1 flex items-center gap-2">
                            <ArtistAvatar
                              src={primaryArtist?.image || null}
                              alt={primaryArtist?.name || track.artist}
                              name={primaryArtist?.name || track.artist}
                              size="xs"
                              className="ring-1 ring-white/10"
                            />
                            <div className="min-w-0">
                              <p className="text-xs text-[var(--pf-text-muted)] truncate">{primaryArtist?.name || track.artist}</p>
                              {artistCredits.length > 1 && (
                                <CollaboratorStack artists={artistCredits} size="xs" className="mt-1" />
                              )}
                            </div>
                          </div>
                        )
                      })()}
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
                    <span>${Number(track.proud_to_pay_min ?? track.price ?? 0).toFixed(2)}</span>
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
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <p className="text-xs text-[var(--pf-text-muted)]">{track.artist} · {track.status}</p>
                        {(() => {
                          const artistCredits = buildTrackArtistCredits(track)
                          return artistCredits.length > 1 ? (
                            <CollaboratorStack artists={artistCredits} size="xs" />
                          ) : null
                        })()}
                      </div>
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
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <p className="text-xs text-[var(--pf-text-muted)]">{track.artist} · {track.status}</p>
                        {(() => {
                          const artistCredits = buildTrackArtistCredits(track)
                          return artistCredits.length > 1 ? (
                            <CollaboratorStack artists={artistCredits} size="xs" />
                          ) : null
                        })()}
                      </div>
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

        {/* Revenue Tab — PHASE D: Canonical unified reporting */}
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
                  <p className="text-xs text-[var(--pf-text-muted)]">Total Revenue</p>
                  <p className="text-2xl font-bold">
                    ${revenueMetrics?.total_revenue_dollars || '0.00'}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-[var(--pf-surface)]">
                  <p className="text-xs text-[var(--pf-text-muted)]">Total Transactions</p>
                  <p className="text-2xl font-bold">
                    {revenueMetrics?.total_transactions || 0}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-[var(--pf-surface)]">
                  <p className="text-xs text-[var(--pf-text-muted)]">Orders</p>
                  <p className="text-2xl font-bold">
                    {revenueMetrics?.total_orders || 0}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-[var(--pf-surface)]">
                  <p className="text-xs text-[var(--pf-text-muted)]">Music Purchases</p>
                  <p className="text-2xl font-bold">
                    {revenueMetrics?.total_music_purchases || 0}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-[var(--pf-surface)]">
                  <p className="text-xs text-[var(--pf-text-muted)]">Unique Buyers</p>
                  <p className="text-2xl font-bold">
                    {revenueMetrics?.unique_buyers || 0}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-[var(--pf-surface)]">
                  <p className="text-xs text-[var(--pf-text-muted)]">Downloaded</p>
                  <p className="text-2xl font-bold">
                    {revenueMetrics?.downloaded_count || 0}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-[var(--pf-surface)]">
                  <p className="text-xs text-[var(--pf-text-muted)]">Today</p>
                  <p className="text-2xl font-bold text-[var(--pf-orange)]">
                    ${revenueMetrics?.revenue_today_dollars || '0.00'}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-[var(--pf-surface)]">
                  <p className="text-xs text-[var(--pf-text-muted)]">This Week</p>
                  <p className="text-2xl font-bold text-[var(--pf-orange)]">
                    ${revenueMetrics?.revenue_week_dollars || '0.00'}
                  </p>
                </div>
              </div>
            </div>

            {/* Transaction Table — CANONICAL */}
            <div className="pf-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Package className="text-[var(--pf-orange)]" />
                  Transaction History
                </h2>
                <span className="text-sm text-[var(--pf-text-muted)]">
                  {revenueTransactions.length} total
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
                  <option value="all">All Sources</option>
                  <option value="orders">Orders</option>
                  <option value="music_purchases">Music Purchases</option>
                  <option value="offer_transactions">Offer Transactions</option>
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
                      <th className="pb-3 px-3 font-medium">Source</th>
                      <th className="pb-3 px-3 font-medium">Buyer</th>
                      <th className="pb-3 px-3 font-medium">Track/Item</th>
                      <th className="pb-3 px-3 font-medium">Amount</th>
                      <th className="pb-3 px-3 font-medium">Status</th>
                      <th className="pb-3 px-3 font-medium">Method</th>
                      <th className="pb-3 px-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const now = new Date()
                      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
                      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

                      const filtered = revenueTransactions.filter((t: RevenueTransaction) => {
                        const matchesSearch = !purchaseSearch ||
                          t.buyer_email?.toLowerCase().includes(purchaseSearch.toLowerCase()) ||
                          t.track_title?.toLowerCase().includes(purchaseSearch.toLowerCase()) ||
                          t.artist_name?.toLowerCase().includes(purchaseSearch.toLowerCase()) ||
                          t.stripe_session_id?.toLowerCase().includes(purchaseSearch.toLowerCase())
                        const matchesSource = purchaseArtistFilter === 'all' || t.source === purchaseArtistFilter
                        const txDate = new Date(t.created_at)
                        const matchesDate = purchaseDateFilter === 'all' ||
                          (purchaseDateFilter === 'today' && txDate >= todayStart) ||
                          (purchaseDateFilter === 'week' && txDate >= weekStart) ||
                          (purchaseDateFilter === 'month' && txDate >= monthStart)
                        return matchesSearch && matchesSource && matchesDate
                      })

                      if (filtered.length === 0) {
                        return (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-[var(--pf-text-muted)]">
                              No transactions match your filters.
                            </td>
                          </tr>
                        )
                      }

                      return filtered.map((t: RevenueTransaction) => {
                        const sourceColor = t.source === 'orders' ? 'bg-blue-500/20 text-blue-400' :
                          t.source === 'music_purchases' ? 'bg-purple-500/20 text-purple-400' :
                          t.source === 'offer_transactions' ? 'bg-green-500/20 text-green-400' :
                          'bg-gray-500/20 text-gray-400'

                        return (
                          <tr key={`${t.source}-${t.id}`} className="border-b border-[var(--pf-border)] last:border-0 hover:bg-[var(--pf-surface-hover)]">
                            <td className="py-3 px-3">
                              <span className={`text-xs px-2 py-1 rounded ${sourceColor}`}>
                                {t.source}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <p className="text-[var(--pf-text-secondary)]">{t.buyer_email || '—'}</p>
                              {t.stripe_session_id && (
                                <p className="text-xs text-[var(--pf-text-muted)] truncate max-w-[150px]">
                                  {t.stripe_session_id.slice(0, 12)}...
                                </p>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              <p className="font-medium">{t.track_title || '—'}</p>
                              {t.artist_name && (
                                <p className="text-xs text-[var(--pf-text-muted)]">{t.artist_name}</p>
                              )}
                            </td>
                            <td className="py-3 px-3 font-medium">${t.amount_dollars}</td>
                            <td className="py-3 px-3">
                              <span className={`text-xs px-2 py-1 rounded ${
                                t.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                t.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-gray-500/20 text-gray-400'
                              }`}>
                                {t.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-[var(--pf-text-muted)]">{t.payment_method}</td>
                            <td className="py-3 px-3 text-[var(--pf-text-muted)]">
                              {new Date(t.created_at).toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                              })}
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

        {/* Analytics Tab — PHASE 2 Measurement Foundation */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="pf-card p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="text-[var(--pf-orange)]" />
                  Measurement Overview
                </h2>
                <div className="flex items-center gap-2 text-xs text-[var(--pf-text-muted)]">
                  <span>
                    {analyticsRefreshing
                      ? 'Refreshing now...'
                      : analyticsLastUpdated
                        ? `Updated ${new Date(analyticsLastUpdated).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
                        : 'Waiting for first refresh'}
                  </span>
                  <button
                    type="button"
                    onClick={() => void refreshAnalytics()}
                    className="inline-flex items-center gap-1 rounded-full border border-[var(--pf-border)] bg-[var(--pf-surface)] px-2.5 py-1 text-[var(--pf-text-secondary)] transition-colors hover:border-[var(--pf-orange)]/30 hover:text-[var(--pf-text)]"
                  >
                    <RefreshCw size={12} className={analyticsRefreshing ? 'animate-spin' : ''} />
                    Refresh
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-[var(--pf-surface)]">
                  <p className="text-xs text-[var(--pf-text-muted)]">Total Plays</p>
                  <p className="text-2xl font-bold">{analyticsData?.metrics?.total_plays || 0}</p>
                </div>
                <div className="p-4 rounded-lg bg-[var(--pf-surface)]">
                  <p className="text-xs text-[var(--pf-text-muted)]">Total Downloads</p>
                  <p className="text-2xl font-bold">{analyticsData?.metrics?.total_downloads || 0}</p>
                </div>
                <div className="p-4 rounded-lg bg-[var(--pf-surface)]">
                  <p className="text-xs text-[var(--pf-text-muted)]">Email Captures</p>
                  <p className="text-2xl font-bold">{analyticsData?.metrics?.total_email_captures || 0}</p>
                </div>
                <div className="p-4 rounded-lg bg-[var(--pf-surface)]">
                  <p className="text-xs text-[var(--pf-text-muted)]">Total Purchases</p>
                  <p className="text-2xl font-bold">{analyticsData?.metrics?.total_purchases || revenueMetrics?.total_transactions || 0}</p>
                </div>
                <div className="p-4 rounded-lg bg-[var(--pf-surface)]">
                  <p className="text-xs text-[var(--pf-text-muted)]">Revenue</p>
                  <p className="text-2xl font-bold">${analyticsData?.metrics?.total_revenue_dollars || revenueMetrics?.total_revenue_dollars || '0.00'}</p>
                </div>
                <div className="p-4 rounded-lg bg-[var(--pf-surface)]">
                  <p className="text-xs text-[var(--pf-text-muted)]">Visitor → Play</p>
                  <p className="text-2xl font-bold text-[var(--pf-orange)]">{analyticsData?.metrics?.conversion_rates?.visitor_to_play || '0.0%'}</p>
                </div>
                <div className="p-4 rounded-lg bg-[var(--pf-surface)]">
                  <p className="text-xs text-[var(--pf-text-muted)]">Play → Email</p>
                  <p className="text-2xl font-bold text-[var(--pf-orange)]">{analyticsData?.metrics?.conversion_rates?.play_to_email || '0.0%'}</p>
                </div>
                <div className="p-4 rounded-lg bg-[var(--pf-surface)]">
                  <p className="text-xs text-[var(--pf-text-muted)]">Email → Purchase</p>
                  <p className="text-2xl font-bold text-[var(--pf-orange)]">{analyticsData?.metrics?.conversion_rates?.email_to_purchase || '0.0%'}</p>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="pf-card p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Music className="text-[var(--pf-orange)]" />
                  Top Tracks
                </h2>
                <div className="space-y-3">
                  {(analyticsData?.top_tracks || []).length > 0 ? (
                    analyticsData.top_tracks.map((track: any, index: number) => (
                      <div key={`${track.key || track.track_id || index}`} className="flex items-center justify-between gap-4 rounded-lg bg-[var(--pf-surface)] p-3">
                        <div>
                          <p className="font-medium">{track.track_title || 'Unknown Track'}</p>
                          <p className="text-xs text-[var(--pf-text-muted)]">{track.artist_name || 'Unknown Artist'}</p>
                        </div>
                        <div className="text-right text-xs text-[var(--pf-text-muted)]">
                          <p>{track.plays || 0} plays</p>
                          <p>{track.downloads || 0} downloads</p>
                          <p>{track.purchases || 0} purchases</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState
                      icon={<Music size={24} />}
                      title="No play activity yet"
                      description="Play totals show which songs listeners are starting to engage with."
                      points={[
                        { label: 'What is this?', text: 'A list of tracks that have actually been played.' },
                        { label: 'Why it matters', text: 'It shows which songs are starting to attract listeners.' },
                        { label: 'Next step', text: 'Wait for plays, then review the top tracks list again.' },
                      ]}
                    />
                  )}
                </div>
              </div>

              <div className="pf-card p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Star className="text-[var(--pf-orange)]" />
                  Top Artists
                </h2>
                <div className="space-y-3">
                  {(analyticsData?.top_artists || []).length > 0 ? (
                    analyticsData.top_artists.map((artist: any, index: number) => (
                      <div key={`${artist.key || artist.artist_id || index}`} className="flex items-center justify-between gap-4 rounded-lg bg-[var(--pf-surface)] p-3">
                        <div>
                          <p className="font-medium">{artist.artist_name || 'Unknown Artist'}</p>
                          <p className="text-xs text-[var(--pf-text-muted)]">{artist.artist_id ? artist.artist_id.slice(0, 8) : '—'}</p>
                        </div>
                        <div className="text-right text-xs text-[var(--pf-text-muted)]">
                          <p>{artist.plays || 0} plays</p>
                          <p>{artist.downloads || 0} downloads</p>
                          <p>{artist.purchases || 0} purchases</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState
                      icon={<Star size={24} />}
                      title="No artist activity yet"
                      description="Artist activity rolls up plays, downloads, and purchases by creator."
                      points={[
                        { label: 'What is this?', text: 'A summary of how each artist’s catalog is performing.' },
                        { label: 'Why it matters', text: 'It helps you spot which creators are getting traction first.' },
                        { label: 'Next step', text: 'Wait for more activity, then review the top artists list.' },
                      ]}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="pf-card p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Search className="text-[var(--pf-orange)]" />
                  Top Cities
                </h2>
                <div className="space-y-3">
                  {(analyticsData?.top_cities || []).length > 0 ? (
                    analyticsData.top_cities.map((location: any, index: number) => (
                      <div key={`${location.key || location.city || index}`} className="flex items-center justify-between gap-4 rounded-lg bg-[var(--pf-surface)] p-3">
                        <div>
                          <p className="font-medium">{location.city || 'Unknown City'}</p>
                          <p className="text-xs text-[var(--pf-text-muted)]">{location.state || '—'}</p>
                        </div>
                        <div className="text-right text-xs text-[var(--pf-text-muted)]">
                          <p>{location.plays || 0} plays</p>
                          <p>{location.downloads || 0} downloads</p>
                          <p>{location.purchases || 0} purchases</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState
                      icon={<Search size={24} />}
                      title="No city traction yet"
                      description="City traction shows where listeners are starting to engage, using city and state only."
                      points={[
                        { label: 'What is this?', text: 'A city-level rollup of plays, downloads, and purchases.' },
                        { label: 'Why it matters', text: 'It shows where your audience is starting to cluster.' },
                        { label: 'Next step', text: 'Wait for location data to accumulate, then review the top cities list.' },
                      ]}
                    />
                  )}
                </div>
              </div>

              <div className="pf-card p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Filter className="text-[var(--pf-orange)]" />
                  Top States
                </h2>
                <div className="space-y-3">
                  {(analyticsData?.top_states || []).length > 0 ? (
                    analyticsData.top_states.map((location: any, index: number) => (
                      <div key={`${location.state || index}`} className="flex items-center justify-between gap-4 rounded-lg bg-[var(--pf-surface)] p-3">
                        <div>
                          <p className="font-medium">{location.state || 'Unknown State'}</p>
                        </div>
                        <div className="text-right text-xs text-[var(--pf-text-muted)]">
                          <p>{location.plays || 0} plays</p>
                          <p>{location.downloads || 0} downloads</p>
                          <p>{location.email_captures || 0} email captures</p>
                          <p>{location.purchases || 0} purchases</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState
                      icon={<Filter size={24} />}
                      title="No state traction yet"
                      description="State traction shows regional activity without exposing precise location data."
                      points={[
                        { label: 'What is this?', text: 'A state-level rollup of listener activity and purchases.' },
                        { label: 'Why it matters', text: 'It helps you compare regions without showing PII or exact addresses.' },
                        { label: 'Next step', text: 'Wait for more activity, then review the top states list.' },
                      ]}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="pf-card p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield className="text-[var(--pf-orange)]" />
                Funnel Conversion Rates
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-[var(--pf-surface)]">
                  <p className="text-xs text-[var(--pf-text-muted)]">Visitor → Play</p>
                  <p className="text-2xl font-bold">{analyticsData?.metrics?.conversion_rates?.visitor_to_play || '0.0%'}</p>
                </div>
                <div className="p-4 rounded-lg bg-[var(--pf-surface)]">
                  <p className="text-xs text-[var(--pf-text-muted)]">Play → Email</p>
                  <p className="text-2xl font-bold">{analyticsData?.metrics?.conversion_rates?.play_to_email || '0.0%'}</p>
                </div>
                <div className="p-4 rounded-lg bg-[var(--pf-surface)]">
                  <p className="text-xs text-[var(--pf-text-muted)]">Email → Purchase</p>
                  <p className="text-2xl font-bold">{analyticsData?.metrics?.conversion_rates?.email_to_purchase || '0.0%'}</p>
                </div>
                <div className="p-4 rounded-lg bg-[var(--pf-surface)]">
                  <p className="text-xs text-[var(--pf-text-muted)]">Purchase → Download</p>
                  <p className="text-2xl font-bold">{analyticsData?.metrics?.conversion_rates?.purchase_to_download || '0.0%'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
