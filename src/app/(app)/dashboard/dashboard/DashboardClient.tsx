'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSupabase } from '@/app/providers'
import { useWallet } from '@/lib/wallet-context'
import { Upload, Package, Share2, Edit, DollarSign, Music, ChevronRight, Copy } from 'lucide-react'

interface DashboardStats {
  total_earnings: number
  sales_count: number
  total_offers: number
  total_tracks: number
}

const EMPTY_STATS: DashboardStats = {
  total_earnings: 0,
  sales_count: 0,
  total_offers: 0,
  total_tracks: 0,
}

interface DashboardClientProps {
  serverProfileId: string
  initialProfile: any
}

export default function DashboardClient({ serverProfileId, initialProfile }: DashboardClientProps) {
  const { supabase } = useSupabase()
  const { balance } = useWallet()

  const [mounted, setMounted] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS)
  const [profile, setProfile] = useState<any>(initialProfile)
  const [hasRecentOffer, setHasRecentOffer] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted) return
    try {
      const recentOffer = window.localStorage.getItem('porterful_recent_offer')
      setHasRecentOffer(!!recentOffer)
    } catch {
      setHasRecentOffer(false)
    }
  }, [mounted])

  useEffect(() => {
    if (!mounted || !serverProfileId) return
    loadDashboard()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, serverProfileId, supabase])

  async function loadDashboard() {
    if (!supabase || !serverProfileId) return
    try {
      const profileData = initialProfile
      setProfile(profileData)

      if (profileData?.role === 'supporter' || profileData?.role === 'superfan') {
        setStats(EMPTY_STATS)
        setDataLoading(false)
        return
      }

      if (profileData?.role === 'artist') {
        const { data: orderItemsData } = await supabase
          .from('order_items')
          .select('order_id, price, quantity')
          .eq('seller_id', serverProfileId)

        const { count: tracksCount } = await supabase
          .from('tracks')
          .select('*', { count: 'exact', head: true })
          .eq('artist_id', serverProfileId)

        const offersRes = await fetch('/api/offers', {
          credentials: 'include',
        })
        const offersData = offersRes.ok ? await offersRes.json() : { offers: [] }

        const totalSales = (orderItemsData || []).reduce(
          (sum: number, item: any) => sum + Number(item.price || 0) * Number(item.quantity || 0),
          0
        )

        const uniqueOrders = new Set((orderItemsData || []).map((i: any) => i.order_id).filter(Boolean)).size

        setStats({
          total_earnings: totalSales,
          sales_count: uniqueOrders,
          total_offers: Array.isArray(offersData.offers) ? offersData.offers.length : 0,
          total_tracks: tracksCount || 0,
        })
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    } finally {
      setDataLoading(false)
    }
  }

  if (!mounted || dataLoading) {
    return (
      <div className="min-h-screen pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-[var(--pf-surface)] rounded-xl" />
            <div className="h-32 bg-[var(--pf-surface)] rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  const isArtist = profile?.role === 'artist'
  const isProfileComplete = profile?.name && profile?.avatar_url
  const hasOffers = stats.total_offers > 0 || hasRecentOffer
  const displayOfferCount = Math.max(stats.total_offers, hasRecentOffer ? 1 : 0)
  const storeHandle = profile?.username || profile?.referral_code || profile?.id
  const storePath = storeHandle ? `/store?ref=${encodeURIComponent(storeHandle)}` : '/store'
  const storeUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${storePath}`
    : `https://porterful.com${storePath}`

  const handleCopyStoreLink = async () => {
    try {
      await navigator.clipboard.writeText(storeUrl)
      setCopySuccess(true)
      window.setTimeout(() => setCopySuccess(false), 1500)
    } catch (error) {
      console.error('Failed to copy store link:', error)
    }
  }

  const handleShareStoreLink = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Porterful Store',
          url: storeUrl,
        })
      } else {
        await handleCopyStoreLink()
      }
    } catch (error) {
      console.error('Failed to share store link:', error)
    }
  }

  // Dynamic Primary CTA based on state
  const getPrimaryCTA = () => {
    if (!isProfileComplete) {
      return { label: 'Complete Profile', href: '/dashboard/dashboard/artist/edit', icon: Edit, color: 'bg-orange-500 hover:bg-orange-600' }
    }
    if (!hasOffers) {
      return { label: 'Choose Products to Sell', href: '/dashboard/dashboard/catalog', icon: Package, color: 'bg-orange-500 hover:bg-orange-600' }
    }
    return { label: 'My Store Link', href: storePath, icon: Share2, color: 'bg-orange-500 hover:bg-orange-600' }
  }

  const primaryCTA = getPrimaryCTA()
  const PrimaryIcon = primaryCTA.icon

  // Supporter Dashboard
  if (!isArtist) {
    return (
      <div className="min-h-screen pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
          
          {/* Money Bar */}
          <div className="bg-gradient-to-r from-[var(--pf-orange)]/20 to-purple-600/20 border border-[var(--pf-orange)]/30 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--pf-text-muted)] mb-1">Wallet Balance</p>
                <p className="text-3xl font-bold">${(balance / 100).toFixed(2)}</p>
              </div>
              <Link href="/wallet" className="px-4 py-2 bg-[var(--pf-orange)] hover:bg-[var(--pf-orange-dark)] text-white rounded-lg font-semibold transition-colors">
                Add Funds
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Link href="/music" className="pf-card p-4 flex flex-col items-center justify-center gap-2 hover:border-[var(--pf-orange)] transition-colors">
              <Music size={24} className="text-purple-400" />
              <span className="text-sm font-medium">Browse Music</span>
            </Link>
            <Link href="/store" className="pf-card p-4 flex flex-col items-center justify-center gap-2 hover:border-[var(--pf-orange)] transition-colors">
              <Package size={24} className="text-orange-400" />
              <span className="text-sm font-medium">Shop Merch</span>
            </Link>
            <Link href="/artists" className="pf-card p-4 flex flex-col items-center justify-center gap-2 hover:border-[var(--pf-orange)] transition-colors">
              <Share2 size={24} className="text-blue-400" />
              <span className="text-sm font-medium">Artists</span>
            </Link>
            <Link href="/settings/settings" className="pf-card p-4 flex flex-col items-center justify-center gap-2 hover:border-[var(--pf-orange)] transition-colors">
              <DollarSign size={24} className="text-green-400" />
              <span className="text-sm font-medium">Settings</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Artist Dashboard
  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">My Dashboard</h1>
            <p className="text-sm text-[var(--pf-text-muted)]">Manage your music and earnings</p>
          </div>
        </div>

        {/* MONEY BAR - Top Priority */}
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-[var(--pf-text-muted)] mb-1">Total Earned</p>
              <p className="text-2xl font-bold text-green-400">${stats.total_earnings.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--pf-text-muted)] mb-1">Sales</p>
              <p className="text-2xl font-bold text-blue-400">{stats.sales_count}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--pf-text-muted)] mb-1">Offers</p>
              <p className="text-2xl font-bold text-purple-400">{stats.total_tracks} tracks • {stats.total_offers} offers</p>
            </div>
            <div className="flex items-center justify-end">
              <Link 
                href="/dashboard/dashboard/payout"
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <DollarSign size={18} />
                Cash Out
              </Link>
            </div>
          </div>
        </div>

        {/* PRIMARY CTA - Dynamic based on state */}
        <div className="bg-gradient-to-r from-[var(--pf-orange)]/20 to-purple-600/20 border border-[var(--pf-orange)]/30 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--pf-text-muted)] mb-1">Next Step</p>
              <p className="text-lg font-bold">{primaryCTA.label}</p>
            </div>
            <Link 
              href={primaryCTA.href}
              className={`${primaryCTA.color} text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2`}
            >
              <PrimaryIcon size={20} />
              {primaryCTA.label}
            </Link>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[var(--pf-orange)]/10 to-purple-500/10 border border-[var(--pf-orange)]/20 rounded-xl p-6 mb-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-sm text-[var(--pf-text-muted)] mb-1">My Store Link</p>
              <p className="truncate font-mono text-sm text-[var(--pf-text)]">{storePath}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopyStoreLink}
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--pf-border)] px-4 py-2 text-sm font-semibold text-[var(--pf-text)] transition-colors hover:border-[var(--pf-orange)]/40"
              >
                <Copy size={14} />
                {copySuccess ? 'Copied' : 'Copy'}
              </button>
              <button
                type="button"
                onClick={handleShareStoreLink}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--pf-orange)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--pf-orange-dark)]"
              >
                <Share2 size={14} />
                Share
              </button>
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS - 4 buttons max */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Link href="/dashboard/dashboard/upload" className="pf-card p-4 flex flex-col items-center justify-center gap-2 hover:border-[var(--pf-orange)] transition-colors">
            <Upload size={24} className="text-purple-400" />
            <span className="text-sm font-medium">Upload Track</span>
          </Link>

          <Link href="/dashboard/dashboard/catalog" className="pf-card p-4 flex flex-col items-center justify-center gap-2 hover:border-[var(--pf-orange)] transition-colors">
            <Package size={24} className="text-orange-400" />
            <span className="text-sm font-medium">Choose Products</span>
          </Link>

          <Link href={storePath} className="pf-card p-4 flex flex-col items-center justify-center gap-2 hover:border-[var(--pf-orange)] transition-colors">
            <Share2 size={24} className="text-blue-400" />
            <span className="text-sm font-medium">My Store Link</span>
          </Link>
          <Link href="/dashboard/dashboard/earnings" className="pf-card p-4 flex flex-col items-center justify-center gap-2 hover:border-[var(--pf-orange)] transition-colors">
            <DollarSign size={24} className="text-green-400" />
            <span className="text-sm font-medium">Earnings</span>
          </Link>
        </div>

        {/* CONTENT OVERVIEW - Collapsible */}
        <ContentOverview stats={stats} />
      </div>
    </div>
  )
}

function ContentOverview({ stats }: { stats: DashboardStats }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="pf-card">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-[var(--pf-surface-hover)] transition-colors"
      >
        <div className="flex items-center gap-4">
          <Music size={20} className="text-[var(--pf-text-muted)]" />
          <div className="text-left">
            <p className="font-semibold">Your Content</p>
            <p className="text-sm text-[var(--pf-text-muted)]">{stats.total_tracks} tracks • {stats.total_offers} offers</p>
          </div>
        </div>
        <ChevronRight size={20} className={`transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>
      
      {expanded && (
        <div className="px-4 pb-4 space-y-2">
          <Link href="/dashboard/dashboard/artist" className="block p-3 rounded-lg hover:bg-[var(--pf-surface)] transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-sm">Manage Catalog</span>
              <ChevronRight size={16} className="text-[var(--pf-text-muted)]" />
            </div>
          </Link>
          <Link href="/dashboard/dashboard/upload" className="block p-3 rounded-lg hover:bg-[var(--pf-surface)] transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-sm">Upload New Track</span>
              <ChevronRight size={16} className="text-[var(--pf-text-muted)]" />
            </div>
          </Link>
          
        </div>
      )}
    </div>
  )
}
