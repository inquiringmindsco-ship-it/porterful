'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSupabase } from '@/app/providers'
import { 
  Package, Users, DollarSign, TrendingUp, Plus, Settings, 
  Store, Music, BarChart3, Upload, ChevronRight 
} from 'lucide-react'

// Demo data for when Supabase isn't connected
const DEMO_STATS = {
  total_sales: 2487.50,
  total_orders: 142,
  total_products: 8,
  conversion_rate: 3.2,
  artist_fund_generated: 497.50,
  this_month: {
    sales: 892.00,
    orders: 47,
    growth: '+23%',
  },
}

const DEMO_PRODUCTS = [
  { id: '1', name: 'Ambiguous Tour Tee', price: 25, category: 'artist_merch', sales: 89, status: 'active' },
  { id: '2', name: 'Premium Toothpaste', price: 8.99, category: 'essentials', sales: 234, status: 'active' },
  { id: '3', name: 'Wireless Earbuds', price: 49.99, category: 'trending', sales: 56, status: 'active' },
]

export default function DashboardPage() {
  const { user, supabase } = useSupabase()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(DEMO_STATS)
  const [products, setProducts] = useState(DEMO_PRODUCTS)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (supabase && user) {
      loadDashboard()
    } else {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, user])

  async function loadDashboard() {
    try {
      // Load real data from Supabase
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user!.id)

      if (productsData) {
        setProducts(productsData)
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
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
            <h1 className="text-2xl font-bold mb-4">Seller Dashboard</h1>
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

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="pf-container">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Seller Dashboard</h1>
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
            <p className="text-3xl font-bold">${stats.total_sales.toLocaleString()}</p>
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
            <p className="text-3xl font-bold">${stats.artist_fund_generated.toLocaleString()}</p>
            <p className="text-sm text-[var(--pf-text-muted)] mt-1">Generated for artists</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-[var(--pf-border)]">
          {['overview', 'products', 'orders', 'analytics'].map((tab) => (
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

        {/* Tab Content */}
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
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[var(--pf-surface)] flex items-center justify-center">
                          📦
                        </div>
                        <div>
                          <p className="font-medium">Order #{1000 + i}</p>
                          <p className="text-sm text-[var(--pf-text-muted)]">2 items • {i}h ago</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${(Math.random() * 50 + 20).toFixed(2)}</p>
                        <p className="text-xs text-green-400">paid</p>
                      </div>
                    </div>
                  ))}
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
                    <span className="font-medium text-[var(--pf-orange)]">${stats.artist_fund_generated}</span>
                  </div>
                  <div className="h-2 bg-[var(--pf-border)] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[var(--pf-orange)] to-[var(--pf-orange-light)] rounded-full" style={{ width: '65%' }} />
                  </div>
                  <p className="text-xs text-[var(--pf-text-muted)] mt-2">65% of goal</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="pf-card">
            <div className="flex items-center justify-between p-4 border-b border-[var(--pf-border)]">
              <h2 className="font-semibold">Your Products</h2>
              <button className="pf-btn pf-btn-primary text-sm py-2">
                <Plus size={16} className="mr-1" /> Add Product
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--pf-bg)]">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-[var(--pf-text-muted)]">Product</th>
                    <th className="text-left p-4 text-sm font-medium text-[var(--pf-text-muted)]">Category</th>
                    <th className="text-left p-4 text-sm font-medium text-[var(--pf-text-muted)]">Price</th>
                    <th className="text-left p-4 text-sm font-medium text-[var(--pf-text-muted)]">Sales</th>
                    <th className="text-left p-4 text-sm font-medium text-[var(--pf-text-muted)]">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-[var(--pf-text-muted)]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--pf-border)]">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-[var(--pf-surface-hover)]">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[var(--pf-surface)] flex items-center justify-center text-xl">
                            {product.category === 'artist_merch' ? '👕' : product.category === 'essentials' ? '🪥' : '🎧'}
                          </div>
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-[var(--pf-text-secondary)]">{product.category}</td>
                      <td className="p-4">${product.price}</td>
                      <td className="p-4">{product.sales}</td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                          {product.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <button className="text-[var(--pf-orange)] hover:underline text-sm">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="pf-card p-6">
            <p className="text-[var(--pf-text-secondary)]">Orders management coming soon...</p>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="pf-card p-6">
            <p className="text-[var(--pf-text-secondary)]">Analytics dashboard coming soon...</p>
          </div>
        )}
      </div>
    </div>
  )
}