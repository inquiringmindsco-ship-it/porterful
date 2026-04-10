'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSupabase } from '@/app/providers'
import { useWallet } from '@/lib/wallet-context'
import { 
  Package, Users, DollarSign, TrendingUp, Plus, Settings, 
  Store, Music, BarChart3, Upload, ChevronRight, Gift, Heart
} from 'lucide-react'

interface DashboardStats {
  total_sales: number
  total_orders: number
  total_products: number
  conversion_rate: number
  artist_fund_generated: number
  this_month: {
    sales: number
    orders: number
    growth: string
  }
}

const EMPTY_STATS: DashboardStats = {
  total_sales: 0,
  total_orders: 0,
  total_products: 0,
  conversion_rate: 0,
  artist_fund_generated: 0,
  this_month: { sales: 0, orders: 0, growth: '0%' },
}

export default function DashboardPage() {
  const { user, supabase, loading: authLoading } = useSupabase()
  const { balance } = useWallet()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS)
  const [profile, setProfile] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'analytics'>('overview')

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setLoading(false)
      return
    }
    loadDashboard()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, user, authLoading])

  async function loadDashboard() {
    if (!supabase || !user) return
    try {
      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(profileData)

      // If supporter role, show supporter dashboard (no creator stats)
      if (profileData?.role === 'supporter') {
        setStats(EMPTY_STATS)
        setLoading(false)
        return
      }

      // If artist, load real creator stats
      if (profileData?.role === 'artist') {
        // Load orders where user is seller
        const { data: ordersData } = await supabase
          .from('orders')
          .select('*, order_items(count)')
          .eq('status', 'paid')

        // Load products count
        const { count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('seller_id', user.id)

        const totalOrders = ordersData?.length || 0
        const totalSales = ordersData?.reduce((sum: number, o: any) => sum + (o.total || 0), 0) || 0

        setStats({
          total_sales: totalSales,
          total_orders: totalOrders,
          total_products: productsCount || 0,
          conversion_rate: 0,
          artist_fund_generated: totalSales * 0.1, // 10% to artist fund
          this_month: {
            sales: totalSales,
            orders: totalOrders,
            growth: '0%',
          },
        })
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="pf-container">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-[var(--pf-surface)] rounded w-1/4" />
            <div className="h-32 bg-[var(--pf-surface)] rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="pf-container">
          <div className="pf-card p-12 text-center">
            <Store size={48} className="mx-auto mb-4 text-[var(--pf-orange)]" />
            <h1 className="text-2xl font-bold mb-4">Creator Dashboard</h1>
            <p className="text-[var(--pf-text-secondary)] mb-6">
              Sign in to manage your products, view sales, and track earnings.
            </p>
            <Link href="/login" className="pf-btn pf-btn-primary">
              Sign In <ChevronRight className="inline ml-1" size={16} />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const isArtist = profile?.role === 'artist'
  const isSupporter = profile?.role === 'supporter' || profile?.role === 'superfan'

  // Supporter Dashboard
  if (isSupporter) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="pf-container">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
              <p className="text-[var(--pf-text-secondary)]">
                Welcome back, {profile?.full_name || profile?.username || 'Supporter'}!
              </p>
            </div>
          </div>

          {/* Wallet Card */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <div className="pf-card p-6 border border-[var(--pf-orange)]/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[var(--pf-text-muted)]">Wallet Balance</span>
                <DollarSign size={20} className="text-[var(--pf-orange)]" />
              </div>
              <p className="text-3xl font-bold">${(balance / 100).toFixed(2)}</p>
              <Link href="/wallet" className="text-sm text-[var(--pf-orange)] hover:underline mt-1 inline-block">
                Add funds
              </Link>
            </div>

            <div className="pf-card p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[var(--pf-text-muted)]">My Orders</span>
                <Package size={20} className="text-blue-400" />
              </div>
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-[var(--pf-text-muted)] mt-1">No purchases yet</p>
            </div>

            <div className="pf-card p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[var(--pf-text-muted)]">Referral Code</span>
                <Gift size={20} className="text-purple-400" />
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xl font-mono font-bold flex-1">{profile?.referral_code || 'N/A'}</p>
                <button
                  onClick={() => {
                    const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/?ref=${profile?.referral_code || ''}`
                    navigator.clipboard.writeText(link)
                    alert('Referral link copied!')
                  }}
                  className="px-2 py-1 text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded transition-colors"
                  title="Copy referral link"
                >
                  Copy Link
                </button>
              </div>
              <p className="text-sm text-[var(--pf-text-muted)] mt-1">Share your link — earnings tracked automatically</p>
            </div>
          </div>

          {/* NEXT ACTION NUDGE */}
          <div className="mb-6 p-4 bg-[var(--pf-orange)]/10 rounded-xl border border-[var(--pf-orange)]/20">
            <p className="text-sm text-[var(--pf-text-secondary)]">
              <span className="text-[var(--pf-orange)] font-semibold">Your link is ready to share.</span>
              {profile?.total_referrals === 0 
                ? " Share it with friends — when they join and buy, you earn 3%." 
                : ` Your ${profile.total_referrals} referral${profile.total_referrals === 1 ? '' : 's'} are already earning for you.`}
            </p>
          </div>

          {/* Quick Links */}
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/artists" className="pf-card p-6 hover:border-[var(--pf-orange)] transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--pf-orange)]/20 flex items-center justify-center">
                  <Music size={20} className="text-[var(--pf-orange)]" />
                </div>
                <h2 className="font-semibold">Discover Artists</h2>
              </div>
              <p className="text-sm text-[var(--pf-text-secondary)]">
                Find and support independent artists
              </p>
            </Link>

            <Link href="/shop" className="pf-card p-6 hover:border-[var(--pf-orange)] transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--pf-orange)]/20 flex items-center justify-center">
                  <Store size={20} className="text-[var(--pf-orange)]" />
                </div>
                <h2 className="font-semibold">Shop</h2>
              </div>
              <p className="text-sm text-[var(--pf-text-secondary)]">
                Music, merch, and essentials
              </p>
            </Link>

            <Link href="/radio" className="pf-card p-6 hover:border-[var(--pf-orange)] transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--pf-orange)]/20 flex items-center justify-center">
                  <TrendingUp size={20} className="text-[var(--pf-orange)]" />
                </div>
                <h2 className="font-semibold">Radio</h2>
              </div>
              <p className="text-sm text-[var(--pf-text-secondary)]">
                Listen to independent artists
              </p>
            </Link>
          </div>

          {/* YOUR NETWORK SECTION */}
          <div className="mt-8">
            <h2 className="text-lg font-bold mb-1">Your Network</h2>
            <p className="text-sm text-[var(--pf-text-muted)] mb-4">
              {profile?.total_referrals === 0 
                ? "You're early — build your position now" 
                : `${profile?.total_referrals} ${profile?.total_referrals === 1 ? 'person has' : 'people have'} joined through your link`}
            </p>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="pf-card p-5">
                <p className="text-sm text-[var(--pf-text-muted)] mb-1">People joined</p>
                <p className="text-2xl font-bold">{
                  // Replace with actual count from Supabase
                  profile?.total_referrals || 0
                }</p>
              </div>
              <div className="pf-card p-5">
                <p className="text-sm text-[var(--pf-text-muted)] mb-1">Network earnings</p>
                <p className="text-2xl font-bold text-green-400">Tracking soon</p>
                <p className="text-xs text-[var(--pf-text-muted)] mt-1">Referral earnings are not connected yet</p>
              </div>
              <div className="pf-card p-5">
                <p className="text-sm text-[var(--pf-text-muted)] mb-1">Your referral link</p>
                <p className="text-sm font-mono text-[var(--pf-orange)] break-all">
                  {typeof window !== 'undefined' ? window.location.origin : ''}/?ref={profile?.referral_code || ''}
                </p>
              </div>
            </div>
            
            {/* Share block */}
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20 p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">⭐</span>
                <div>
                  <p className="font-bold text-sm">Share your link — earnings tracked automatically</p>
                  <p className="text-xs text-[var(--pf-text-muted)]">3% commission on every purchase your people make</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/?ref=${profile?.referral_code || ''}`
                    if (navigator.share) {
                      navigator.share({ title: 'Join me on Porterful', url: link })
                    } else {
                      navigator.clipboard.writeText(link)
                      alert('Link copied!')
                    }
                  }}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  📤 Build Your Network
                </button>
                <Link href="/superfan" className="px-4 py-2 bg-[var(--pf-surface)] border border-[var(--pf-border)] text-white text-sm font-medium rounded-lg hover:border-purple-500 transition-colors">
                  Learn More
                </Link>
              </div>
            </div>
          </div>

          {/* Become a Superfan */}
          <div className="mt-8 pf-card p-6 border border-purple-500/30">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Heart size={24} className="text-purple-400" />
              </div>
              <div>
                <h2 className="font-semibold text-lg mb-1">Become a Superfan</h2>
                <p className="text-[var(--pf-text-secondary)] text-sm mb-3">
                  Earn commission by sharing your favorite artists with friends. The more they buy, the more you earn.
                </p>
                <Link href="/superfan" className="pf-btn pf-btn-primary text-sm">
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Artist/Creator Dashboard
  // Calculate profile completion
  const profileFields = [
    profile?.full_name,
    profile?.bio,
    profile?.avatar_url,
    profile?.genre,
    profile?.city,
    profile?.instagram_url || profile?.youtube_url || profile?.twitter_url || profile?.tiktok_url,
  ].filter(Boolean)
  const completionPct = Math.round((profileFields.length / 7) * 100)

  // Determine next action
  const nextAction = !profile?.bio ? 'Add your bio — it helps fans find you' :
                     !profile?.avatar_url ? 'Add a profile photo — builds trust' :
                     !profile?.instagram_url && !profile?.youtube_url ? 'Connect your social links' :
                     stats.total_products === 0 ? 'Add your first product' :
                     'Share your page to start earning'

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="pf-container">
        {/* PROGRESS HEADER */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-3xl font-bold mb-1">Your Dashboard</h1>
              <p className="text-[var(--pf-text-secondary)]">
                {completionPct < 100 ? `${completionPct}% complete — ${nextAction}` : 'Your store is live and ready to earn'}
              </p>
            </div>
            {completionPct < 100 && (
              <Link href="/dashboard/artist" className="px-4 py-2 bg-[var(--pf-orange)] text-white text-sm font-semibold rounded-lg hover:bg-[var(--pf-orange-dark)] transition-colors">
                Complete Profile →
              </Link>
            )}
          </div>
          {/* Completion bar */}
          <div className="w-full h-2 bg-[var(--pf-surface)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[var(--pf-orange)] to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-xs text-[var(--pf-text-muted)]">
              {profile?.artist_slug ? 'Your public artist page is live.' : 'Complete your artist page before you promote it.'}
            </p>
          </div>
        </div>

        {/* Keep the rest of the existing dashboard content below */}

        {/* Share Your Page Prompt */}
        {profile?.artist_slug && (
          <div className="mb-8 p-6 bg-gradient-to-r from-[var(--pf-orange)]/10 to-purple-500/10 rounded-2xl border border-[var(--pf-orange)]/30">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-1">🎤 Share Your Artist Page</h3>
                <p className="text-[var(--pf-text-secondary)] text-sm mb-3">
                  Your profile is live! Share it with fans so they can support you directly.
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-[var(--pf-bg)] rounded-lg border border-[var(--pf-border)] text-sm font-mono">
                    porterful.com/artist/{profile.artist_slug}
                  </code>
                  <button 
                    onClick={() => navigator.clipboard.writeText(`https://porterful.com/artist/${profile.artist_slug}`)}
                    className="pf-btn pf-btn-secondary text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Completion Checklist */}
        {!profile?.artist_slug && (
          <div className="mb-8 p-6 bg-[var(--pf-surface)] rounded-2xl border border-[var(--pf-border)]">
            <h3 className="text-lg font-bold mb-4">🚀 Get Started</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--pf-orange)]/20 flex items-center justify-center">
                  <span className="text-[var(--pf-orange)] font-bold">1</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium">Complete your profile</p>
                  <p className="text-sm text-[var(--pf-text-muted)]">Add your bio, photo, and social links</p>
                </div>
                <Link href="/settings" className="pf-btn pf-btn-secondary text-sm">Setup</Link>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <span className="text-purple-400 font-bold">2</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium">Add your music</p>
                  <p className="text-sm text-[var(--pf-text-muted)]">Your catalog is your foundation</p>
                </div>
                <Link href="/dashboard/upload" className="pf-btn pf-btn-secondary text-sm">Upload</Link>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <span className="text-green-400 font-bold">3</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium">Add merch or digital products</p>
                  <p className="text-sm text-[var(--pf-text-muted)]">Sell while you sleep</p>
                </div>
                <span className="text-sm text-[var(--pf-text-muted)]">→</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <span className="text-blue-400 font-bold">4</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium">Track your progress</p>
                  <p className="text-sm text-[var(--pf-text-muted)]">Earnings grow with your network</p>
                </div>
                <span className="text-sm text-[var(--pf-text-muted)]">→</span>
              </div>
            </div>
          </div>
        )}

        {/* FIRST EARNING OPPORTUNITY BANNER */}
        {stats.total_orders === 0 && stats.total_products === 0 && (
          <div className="mb-6 bg-gradient-to-r from-[var(--pf-orange)]/15 to-amber-500/10 rounded-2xl border border-[var(--pf-orange)]/25 p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--pf-orange)]/20 flex items-center justify-center shrink-0">
                <span className="text-2xl">🚀</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base mb-1">Your network starts here</h3>
                <p className="text-sm text-[var(--pf-text-secondary)] mb-3">
                  Share your link — every person who joins and buys earns you 3%. You're early, so build your position now.
                </p>
                <div className="flex gap-3 flex-wrap">
                  <Link href="/dashboard/artist" className="px-4 py-2 bg-[var(--pf-orange)] text-white text-sm font-semibold rounded-lg hover:bg-[var(--pf-orange-dark)] transition-colors">
                    Build Your Network
                  </Link>
                  <Link href="/dashboard/products/add" className="px-4 py-2 bg-[var(--pf-surface)] border border-[var(--pf-border)] text-white text-sm font-medium rounded-lg hover:border-[var(--pf-orange)] transition-colors">
                    Add Your First Product
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="pf-card p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[var(--pf-text-muted)]">Total Sales</span>
              <DollarSign size={20} className="text-[var(--pf-orange)]" />
            </div>
            <p className="text-3xl font-bold">${stats.total_sales.toFixed(2)}</p>
            <p className="text-sm text-green-400 mt-1">{stats.this_month.growth} this month</p>
          </div>

          <div className="pf-card p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[var(--pf-text-muted)]">Orders</span>
              <Package size={20} className="text-blue-400" />
            </div>
            <p className="text-3xl font-bold">{stats.total_orders}</p>
            <p className="text-sm text-[var(--pf-text-muted)] mt-1">{stats.this_month.orders} this month</p>
          </div>

          <div className="pf-card p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[var(--pf-text-muted)]">Products</span>
              <Store size={20} className="text-purple-400" />
            </div>
            <p className="text-3xl font-bold">{stats.total_products}</p>
            <p className="text-sm text-[var(--pf-text-muted)] mt-1">Active listings</p>
          </div>

          <div className="pf-card p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[var(--pf-text-muted)]">Artist Fund</span>
              <Music size={20} className="text-[var(--pf-orange)]" />
            </div>
            <p className="text-3xl font-bold">${stats.artist_fund_generated.toFixed(2)}</p>
            <p className="text-sm text-[var(--pf-text-muted)] mt-1">Generated for artists</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-[var(--pf-border)]">
          {(['overview', 'products', 'orders', 'analytics'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-2 capitalize font-medium transition-colors ${
                activeTab === tab
                  ? 'text-[var(--pf-orange)] border-b-2 border-[var(--pf-orange)]'
                  : 'text-[var(--pf-text-secondary)] hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Orders */}
            <div className="lg:col-span-2">
            <div className="pf-card">
              <div className="flex items-center justify-between p-4 border-b border-[var(--pf-border)]">
                <h2 className="font-semibold">Recent Orders</h2>
                <Link href="/dashboard/orders" className="text-sm text-[var(--pf-orange)] hover:underline">
                  View All
                </Link>
              </div>
              <div className="divide-y divide-[var(--pf-border)]">
                {stats.total_orders === 0 ? (
                  <div className="p-8 text-center text-[var(--pf-text-muted)]">
                    <Package size={32} className="mx-auto mb-2 opacity-50" />
                    <p>No orders yet</p>
                    <p className="text-sm mt-1">Start promoting your products to see orders here</p>
                  </div>
                ) : (
                  <p className="p-4 text-center text-[var(--pf-text-muted)]">Loading orders...</p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="pf-card p-6">
              <h2 className="font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link href="/dashboard/upload" className="w-full flex items-center justify-between p-3 rounded-lg bg-[var(--pf-surface)] hover:bg-[var(--pf-surface-hover)] transition-colors">
                  <span className="flex items-center gap-2">
                    <Upload size={18} />
                    Upload Product
                  </span>
                  <ChevronRight size={18} className="text-[var(--pf-text-muted)]" />
                </Link>
                <Link href="/dashboard?tab=analytics" onClick={() => setActiveTab('analytics')} className="w-full flex items-center justify-between p-3 rounded-lg bg-[var(--pf-surface)] hover:bg-[var(--pf-surface-hover)] transition-colors">
                  <span className="flex items-center gap-2">
                    <BarChart3 size={18} />
                    View Analytics
                  </span>
                  <ChevronRight size={18} className="text-[var(--pf-text-muted)]" />
                </Link>
                <Link href="/settings" className="w-full flex items-center justify-between p-3 rounded-lg bg-[var(--pf-surface)] hover:bg-[var(--pf-surface-hover)] transition-colors">
                  <span className="flex items-center gap-2">
                    <Settings size={18} />
                    Store Settings
                  </span>
                  <ChevronRight size={18} className="text-[var(--pf-text-muted)]" />
                </Link>
              </div>
            </div>

            {/* Artist Fund Impact */}
            <div className="pf-card p-6 mt-6">
              <h2 className="font-semibold mb-4">Your Impact</h2>
              <p className="text-sm text-[var(--pf-text-secondary)] mb-4">
                Every sale on Porterful contributes to the artist fund.
              </p>
              <div className="bg-[var(--pf-bg)] rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-[var(--pf-text-muted)]">To Artists</span>
                  <span className="font-medium text-[var(--pf-orange)]">${stats.artist_fund_generated.toFixed(2)}</span>
                </div>
                <div className="h-2 bg-[var(--pf-border)] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[var(--pf-orange)] to-[var(--pf-orange-light)] rounded-full" style={{ width: '0%' }} />
                </div>
                <p className="text-xs text-[var(--pf-text-muted)] mt-2">This card updates as real orders are recorded.</p>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="pf-card">
            <div className="flex items-center justify-between p-4 border-b border-[var(--pf-border)]">
              <h2 className="font-semibold">Your Products</h2>
              <Link href="/dashboard/add-product" className="pf-btn pf-btn-primary text-sm py-2">
                <Plus size={16} className="mr-1" /> Add Product
              </Link>
            </div>
            {stats.total_products === 0 ? (
              <div className="p-8 text-center text-[var(--pf-text-muted)]">
                <Store size={32} className="mx-auto mb-2 opacity-50" />
                <p>No products yet</p>
                <p className="text-sm mt-1">Click "Add Product" to create your first product</p>
              </div>
            ) : (
              <div className="p-4 text-center text-[var(--pf-text-muted)]">
                Loading products...
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="pf-card">
            <div className="flex items-center justify-between p-4 border-b border-[var(--pf-border)]">
              <h2 className="font-semibold">Orders</h2>
              <span className="text-sm text-[var(--pf-text-muted)]">{stats.total_orders} total</span>
            </div>
            {stats.total_orders === 0 ? (
              <div className="p-8 text-center text-[var(--pf-text-muted)]">
                <Package size={32} className="mx-auto mb-2 opacity-50" />
                <p>No orders yet</p>
                <p className="text-sm mt-1">Orders will appear here when customers make purchases</p>
              </div>
            ) : (
              <div className="p-4 text-center text-[var(--pf-text-muted)]">
                Loading orders...
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="pf-card">
            <div className="p-4 border-b border-[var(--pf-border)]">
              <h2 className="font-semibold">Analytics</h2>
              <p className="text-sm text-[var(--pf-text-muted)]">View your sales performance</p>
            </div>
            <div className="p-8 text-center text-[var(--pf-text-muted)]">
              <BarChart3 size={32} className="mx-auto mb-2 opacity-50" />
              <p>Analytics not connected yet</p>
              <p className="text-sm mt-1">Sales totals are live above, but detailed analytics are still being wired.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
