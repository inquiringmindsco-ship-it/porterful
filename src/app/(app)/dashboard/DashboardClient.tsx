'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSupabase } from '@/app/providers'
import { useWallet } from '@/lib/wallet-context'
import {
  Package, Users, DollarSign, Plus, Settings,
  Store, Music, BarChart3, Upload, ChevronRight, ShieldCheck
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

interface DashboardClientProps {
  serverProfileId: string
  lkId: string
}

export default function DashboardClient({ serverProfileId, lkId }: DashboardClientProps) {
  // Use serverProfileId as the auth source of truth — validated via Likeness™ session bridge
  // serverProfileId = Porterful profile ID, lkId = Likeness™ identity ID
  const { supabase } = useSupabase()
  const { balance } = useWallet()

  const [mounted, setMounted] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS)
  const [profile, setProfile] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'analytics'>('overview')

  useEffect(() => {
    setMounted(true)
  }, [])

  // Load dashboard data using the server-confirmed profile ID
  // serverProfileId is guaranteed valid — server component validated Likeness™ session
  useEffect(() => {
    if (!mounted) return
    if (!serverProfileId) return
    loadDashboard()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, serverProfileId, supabase])

  async function loadDashboard() {
    if (!supabase || !serverProfileId) return
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', serverProfileId)
        .single()
      setProfile(profileData)

      if (profileData?.role === 'supporter' || profileData?.role === 'superfan') {
        setStats(EMPTY_STATS)
        setDataLoading(false)
        return
      }

      if (profileData?.role === 'artist') {
        const { data: ordersData } = await supabase
          .from('orders')
          .select('*, order_items(count)')
          .eq('status', 'paid')

        const { count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('seller_id', serverProfileId)

        const totalOrders = ordersData?.length || 0
        const totalSales = ordersData?.reduce((sum: number, o: any) => sum + (o.total || 0), 0) || 0

        setStats({
          total_sales: totalSales,
          total_orders: totalOrders,
          total_products: productsCount || 0,
          conversion_rate: 0,
          artist_fund_generated: totalSales * 0.1,
          this_month: { sales: totalSales, orders: totalOrders, growth: '0%' },
        })
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    } finally {
      setDataLoading(false)
    }
  }

  // Wait for mount only — serverUserId means auth is already confirmed
  // Never redirect based on client-side user state
  if (!mounted || dataLoading) {
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

  // serverUserId is the source of truth — profile may still be loading
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
              <h1 className="text-3xl font-bold mb-2">
                {profile?.full_name || 'My'} Dashboard
              </h1>
              <p className="text-[var(--pf-text-secondary)] flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--pf-orange)]/20 text-[var(--pf-orange)] border border-[var(--pf-orange)]/30">
                  {profile?.role || 'member'}
                </span>
              </p>
            </div>
            <Link href="/settings" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] hover:border-[var(--pf-orange)] transition-colors text-sm">
              <Settings size={16} />
              Account Settings
            </Link>
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
                <span className="text-[var(--pf-text-muted)]">My Referrals</span>
                <Users size={20} className="text-purple-400" />
              </div>
              <p className="text-3xl font-bold">{profile?.total_referrals || 0}</p>
              <p className="text-sm text-[var(--pf-text-muted)] mt-1">Network earnings tracked</p>
            </div>
          </div>

          {/* Become a Creator */}
          <div className="pf-card p-6 border border-purple-500/30">
            <div className="flex items-center gap-3 mb-3">
              <Music size={24} className="text-purple-400" />
              <div>
                <p className="font-semibold">Are you an artist?</p>
                <p className="text-sm text-[var(--pf-text-muted)]">Apply to become a creator and start selling</p>
              </div>
            </div>
            <Link href="/apply" className="pf-btn pf-btn-primary text-sm">
              Apply to Sell
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Artist/Creator Dashboard
  const profileFields = [
    profile?.full_name,
    profile?.bio,
    profile?.avatar_url,
    profile?.genre,
    profile?.city,
    profile?.instagram_url || profile?.youtube_url || profile?.twitter_url || profile?.tiktok_url,
  ].filter(Boolean)
  const completionPct = profile ? Math.round((profileFields.length / 7) * 100) : 0

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
              <h1 className="text-3xl font-bold mb-1">
                {profile?.full_name || 'Creator'} Dashboard
              </h1>
              <p className="text-[var(--pf-text-secondary)] flex items-center gap-2 flex-wrap">
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--pf-orange)]/20 text-[var(--pf-orange)] border border-[var(--pf-orange)]/30">
                  {profile?.role || 'artist'}
                </span>
                {completionPct < 100 && (
                  <span className="text-xs text-[var(--pf-text-muted)]">{completionPct}% complete</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {completionPct < 100 && (
                <Link href="/dashboard/artist" className="px-4 py-2 bg-[var(--pf-orange)] text-white text-sm font-semibold rounded-lg hover:bg-[var(--pf-orange-dark)] transition-colors">
                  Complete Profile →
                </Link>
              )}
              <Link href="/settings" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] hover:border-[var(--pf-orange)] transition-colors text-sm">
                <Settings size={16} />
                Settings
              </Link>
            </div>
          </div>
          {profile && (
            <div className="w-full h-2 bg-[var(--pf-surface)] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[var(--pf-orange)] to-purple-500 transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          )}
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <p className="text-xs text-[var(--pf-text-muted)]">
              {profile?.artist_slug ? 'Your public artist page is live.' : 'Complete your artist page before you promote it.'}
            </p>
          </div>
        </div>

        {/* LIKENESS VERIFICATION BANNER */}
        {!profile?.likeness_verified && (
          <div className="mb-6 p-4 rounded-2xl bg-[var(--pf-orange)]/10 border border-[var(--pf-orange)]/30 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <ShieldCheck size={24} className="text-[var(--pf-orange)] shrink-0" />
              <div>
                <p className="font-semibold text-sm">Verify your Likeness to unlock payouts</p>
                <p className="text-xs text-[var(--var(--pf-text-muted))]">Required to sell products or receive earnings on Porterful.</p>
              </div>
            </div>
            <Link href="/dashboard/likeness" className="px-4 py-2 bg-[var(--pf-orange)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--pf-orange-dark)] transition-colors shrink-0">
              Verify Likeness →
            </Link>
          </div>
        )}

        {/* Share Your Page Prompt */}
        {profile?.artist_slug && (
          <div className="mb-8 p-6 bg-gradient-to-r from-[var(--pf-orange)]/10 to-purple-500/10 rounded-2xl border border-[var(--pf-orange)]/30">
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
                  Share your link — every person who joins and buys earns you 3%. You&apos;re early, so build your position now.
                </p>
                <div className="flex gap-3 flex-wrap">
                  <Link href="/dashboard/artist" className="px-4 py-2 bg-[var(--pf-orange)] text-white text-sm font-semibold rounded-lg hover:bg-[var(--pf-orange-dark)] transition-colors">
                    Build Your Network
                  </Link>
                  <Link href="/dashboard/add-product" className="px-4 py-2 bg-[var(--pf-surface)] border border-[var(--pf-border)] text-white text-sm font-medium rounded-lg hover:border-[var(--pf-orange)] transition-colors">
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
                      <p className="text-sm mt-1">Share your link to start earning</p>
                    </div>
                  ) : (
                    <div className="p-4 text-sm text-[var(--pf-text-muted)]">Orders will appear here</div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="pf-card p-4">
                <h3 className="font-semibold mb-3 text-sm">Quick Actions</h3>
                <div className="space-y-2">
                  <Link href="/dashboard/upload" className="flex items-center gap-2 text-sm py-2 hover:text-[var(--pf-orange)] transition-colors">
                    <Upload size={14} />
                    Upload Music
                  </Link>
                  <Link href="/dashboard/add-product" className="flex items-center gap-2 text-sm py-2 hover:text-[var(--pf-orange)] transition-colors">
                    <Plus size={14} />
                    Add Product
                  </Link>
                  <Link href="/dashboard/artist" className="flex items-center gap-2 text-sm py-2 hover:text-[var(--pf-orange)] transition-colors">
                    <Store size={14} />
                    Edit Store
                  </Link>
                  <Link href="/dashboard/earnings" className="flex items-center gap-2 text-sm py-2 hover:text-[var(--pf-orange)] transition-colors">
                    <DollarSign size={14} />
                    View Earnings
                  </Link>
                </div>
              </div>

              <div className="pf-card p-4">
                <h3 className="font-semibold mb-3 text-sm">Your Network</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--pf-text-muted)]">Referral link</span>
                    <button
                      onClick={() => {
                        const link = `${window.location.origin}/?ref=${profile?.referral_code || ''}`
                        navigator.clipboard.writeText(link)
                      }}
                      className="text-[var(--pf-orange)] hover:underline text-xs"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="text-xs font-mono text-[var(--pf-orange)] truncate">
                    {typeof window !== 'undefined' ? window.location.origin : ''}/?ref={profile?.referral_code || '...'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">My Products</h2>
              <Link href="/dashboard/add-product" className="pf-btn pf-btn-primary text-sm">
                <Plus size={16} className="inline mr-1" />
                Add Product
              </Link>
            </div>
            {stats.total_products === 0 ? (
              <div className="pf-card p-12 text-center">
                <Store size={48} className="mx-auto mb-4 text-[var(--pf-text-muted)]" />
                <p className="text-[var(--pf-text-secondary)] mb-4">No products yet</p>
                <Link href="/dashboard/add-product" className="pf-btn pf-btn-primary">
                  Add Your First Product
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-4">
                <p className="text-[var(--pf-text-muted)]">Products loading...</p>
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Orders</h2>
            </div>
            {stats.total_orders === 0 ? (
              <div className="pf-card p-12 text-center">
                <Package size={48} className="mx-auto mb-4 text-[var(--pf-text-muted)]" />
                <p className="text-[var(--pf-text-secondary)]">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-[var(--pf-text-muted)]">Order details loading...</p>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="pf-card p-12 text-center">
            <BarChart3 size={48} className="mx-auto mb-4 text-[var(--pf-text-muted)]" />
            <h2 className="text-xl font-bold mb-2">Analytics</h2>
            <p className="text-[var(--pf-text-secondary)] mb-4">Coming soon — track your audience growth</p>
          </div>
        )}
      </div>
    </div>
  )
}
