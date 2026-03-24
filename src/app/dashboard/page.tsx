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
              <p className="text-xl font-mono font-bold">{profile?.referral_code || 'N/A'}</p>
              <p className="text-sm text-[var(--pf-text-muted)] mt-1">Share to earn</p>
            </div>
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
  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="pf-container">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Creator Dashboard</h1>
            <p className="text-[var(--pf-text-secondary)]">
              Manage your products and track your earnings
            </p>
          </div>
          <button className="pf-btn pf-btn-primary flex items-center gap-2">
            <Plus size={18} />
            Add Product
          </button>
        </div>

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
          {['overview', 'products', 'orders', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => {}}
              className={`pb-3 px-2 capitalize font-medium transition-colors ${
                tab === 'overview'
                  ? 'text-[var(--pf-orange)] border-b-2 border-[var(--pf-orange)]'
                  : 'text-[var(--pf-text-secondary)] hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
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
                <button className="w-full flex items-center justify-between p-3 rounded-lg bg-[var(--pf-surface)] hover:bg-[var(--pf-surface-hover)] transition-colors">
                  <span className="flex items-center gap-2">
                    <Upload size={18} />
                    Upload Product
                  </span>
                  <ChevronRight size={18} className="text-[var(--pf-text-muted)]" />
                </button>
                <button className="w-full flex items-center justify-between p-3 rounded-lg bg-[var(--pf-surface)] hover:bg-[var(--pf-surface-hover)] transition-colors">
                  <span className="flex items-center gap-2">
                    <BarChart3 size={18} />
                    View Analytics
                  </span>
                  <ChevronRight size={18} className="text-[var(--pf-text-muted)]" />
                </button>
                <button className="w-full flex items-center justify-between p-3 rounded-lg bg-[var(--pf-surface)] hover:bg-[var(--pf-surface-hover)] transition-colors">
                  <span className="flex items-center gap-2">
                    <Settings size={18} />
                    Store Settings
                  </span>
                  <ChevronRight size={18} className="text-[var(--pf-text-muted)]" />
                </button>
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
                <p className="text-xs text-[var(--pf-text-muted)] mt-2">Start selling to generate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Products Tab */}
        <div className="pf-card mt-6">
          <div className="flex items-center justify-between p-4 border-b border-[var(--pf-border)]">
            <h2 className="font-semibold">Your Products</h2>
            <button className="pf-btn pf-btn-primary text-sm py-2">
              <Plus size={16} className="mr-1" /> Add Product
            </button>
          </div>
          {stats.total_products === 0 ? (
            <div className="p-8 text-center text-[var(--pf-text-muted)]">
              <Store size={32} className="mx-auto mb-2 opacity-50" />
              <p>No products yet</p>
              <p className="text-sm mt-1">Add your first product to start selling</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
