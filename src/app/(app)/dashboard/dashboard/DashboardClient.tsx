'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSupabase } from '@/app/providers'
import { useWallet } from '@/lib/wallet-context'
import { Upload, Package, Share2, Edit, DollarSign, TrendingUp, Music, ChevronRight, Check, Loader2 } from 'lucide-react'

interface DashboardStats {
  total_earnings: number
  pending_payout: number
  paid_to_date: number
  total_sales: number
  total_products: number
  total_tracks: number
}

const EMPTY_STATS: DashboardStats = {
  total_earnings: 0,
  pending_payout: 0,
  paid_to_date: 0,
  total_sales: 0,
  total_products: 0,
  total_tracks: 0,
}

interface DashboardClientProps {
  serverProfileId: string
  lkId: string
  initialProfile: any
}

export default function DashboardClient({ serverProfileId, lkId, initialProfile }: DashboardClientProps) {
  const { supabase } = useSupabase()
  const { balance } = useWallet()

  const [mounted, setMounted] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS)
  const [profile, setProfile] = useState<any>(initialProfile)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted || !serverProfileId) return
    loadDashboard()
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

        const { count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('seller_id', serverProfileId)

        const { count: tracksCount } = await supabase
          .from('tracks')
          .select('*', { count: 'exact', head: true })
          .eq('artist_id', serverProfileId)

        const totalSales = (orderItemsData || []).reduce(
          (sum: number, item: any) => sum + Number(item.price || 0) * Number(item.quantity || 0),
          0
        )

        setStats({
          total_earnings: totalSales,
          pending_payout: totalSales * 0.1,
          paid_to_date: 0,
          total_sales: orderItemsData?.length || 0,
          total_products: productsCount || 0,
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
  const hasProducts = stats.total_products > 0
  const hasTracks = stats.total_tracks > 0

  // Dynamic Primary CTA based on state
  const getPrimaryCTA = () => {
    if (!isProfileComplete) {
      return { label: 'Complete Profile', href: '/dashboard/dashboard/artist/edit', icon: Edit, color: 'bg-orange-500 hover:bg-orange-600' }
    }
    if (!hasTracks) {
      return { label: 'Upload First Track', href: '/dashboard/dashboard/upload', icon: Upload, color: 'bg-orange-500 hover:bg-orange-600' }
    }
    if (!hasProducts) {
      return { label: 'Add Product', href: '/dashboard/add-product', icon: Package, color: 'bg-orange-500 hover:bg-orange-600' }
    }
    return { label: 'Share Your Store', href: '/store/' + (profile?.username || profile?.id), icon: Share2, color: 'bg-orange-500 hover:bg-orange-600' }
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
            <h1 className="text-2xl font-bold">Artist Dashboard</h1>
            <p className="text-sm text-[var(--pf-text-muted)]">Manage your music and earnings</p>
          </div>
        </div>

        {/* MONEY BAR - Top Priority */}
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-xs text-[var(--pf-text-muted)] mb-1">Total Earned</p>
              <p className="text-2xl font-bold text-green-400">${stats.total_earnings.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--pf-text-muted)] mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-400">${stats.pending_payout.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--pf-text-muted)] mb-1">Paid Out</p>
              <p className="text-2xl font-bold text-blue-400">${stats.paid_to_date.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-green-500/20">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-green-400" />
              <span className="text-sm text-green-400">{stats.total_sales} sales</span>
            </div>
            <Link 
              href="/payout" 
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                balance >= 2500 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'bg-gray-500/50 text-gray-400 cursor-not-allowed'
              }`}
            >
              {balance >= 2500 ? 'Cash Out' : `Need $${((2500 - balance) / 100).toFixed(2)} to cash out`}
            </Link>
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

        {/* QUICK ACTIONS - 4 buttons max */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Link href="/dashboard/dashboard/upload" className="pf-card p-4 flex flex-col items-center justify-center gap-2 hover:border-[var(--pf-orange)] transition-colors">
            <Upload size={24} className="text-purple-400" />
            <span className="text-sm font-medium">Upload Track</span>
          </Link>
          <Link href="/dashboard/add-product" className="pf-card p-4 flex flex-col items-center justify-center gap-2 hover:border-[var(--pf-orange)] transition-colors">
            <Package size={24} className="text-orange-400" />
            <span className="text-sm font-medium">Sell Merch</span>
          </Link>
          <Link href={`/store/${profile?.username || profile?.id}`} className="pf-card p-4 flex flex-col items-center justify-center gap-2 hover:border-[var(--pf-orange)] transition-colors">
            <Share2 size={24} className="text-blue-400" />
            <span className="text-sm font-medium">Share Store</span>
          </Link>
          <Link href="/dashboard/dashboard/artist/edit" className="pf-card p-4 flex flex-col items-center justify-center gap-2 hover:border-[var(--pf-orange)] transition-colors">
            <Edit size={24} className="text-green-400" />
            <span className="text-sm font-medium">Edit Profile</span>
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
            <p className="text-sm text-[var(--pf-text-muted)]">{stats.total_tracks} tracks • {stats.total_products} products</p>
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
          <Link href="/dashboard/add-product" className="block p-3 rounded-lg hover:bg-[var(--pf-surface)] transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-sm">Add Product</span>
              <ChevronRight size={16} className="text-[var(--pf-text-muted)]" />
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}
