'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSupabase } from '@/app/providers'
import { useWallet } from '@/lib/wallet-context'
import {
  Package, Users, DollarSign, Plus, Settings,
  Store, Music, Upload, ShieldCheck, Copy, Check,
  ExternalLink, ArrowRight,
} from 'lucide-react'

interface DashboardStats {
  total_sales: number
  total_orders: number
  total_products: number
  artist_fund_generated: number
  this_month: { sales: number; orders: number; growth: string }
}

const EMPTY_STATS: DashboardStats = {
  total_sales: 0,
  total_orders: 0,
  total_products: 0,
  artist_fund_generated: 0,
  this_month: { sales: 0, orders: 0, growth: '0%' },
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
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS)
  const [profile, setProfile] = useState<any>(initialProfile)
  const [copied, setCopied] = useState<'page' | 'ref' | null>(null)
  const [pendingBalance, setPendingBalance] = useState<number>(0)

  useEffect(() => { setMounted(true) }, [])

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

      // Fetch pending balance from order_items
      if (profileData?.role === 'artist') {
        const { data: orderItemsData } = await supabase
          .from('order_items')
          .select('order_id, price, quantity, status')
          .eq('seller_id', serverProfileId)

        const pending = (orderItemsData || [])
          .filter((item: any) => item.status === 'pending')
          .reduce((sum: number, item: any) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0)
        setPendingBalance(pending)

        const { count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('seller_id', serverProfileId)

        const uniqueOrderIds = new Set((orderItemsData || []).map((item: any) => item.order_id).filter(Boolean))
        const totalOrders = uniqueOrderIds.size
        const totalSales = (orderItemsData || [])
          .filter((item: any) => item.status === 'completed')
          .reduce((sum: number, item: any) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0)

        setStats({
          total_sales: totalSales,
          total_orders: totalOrders,
          total_products: productsCount || 0,
          artist_fund_generated: totalSales * 0.1,
          this_month: { sales: totalSales, orders: totalOrders, growth: '0%' },
        })
      } else {
        setPendingBalance(0)
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error)
      setActionError('Failed to load dashboard data')
    } finally {
      setDataLoading(false)
    }
  }

  function copy(type: 'page' | 'ref', text: string) {
    setActionLoading('copy')
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(type)
        setActionSuccess('Copied to clipboard!')
        setTimeout(() => {
          setCopied(null)
          setActionSuccess(null)
        }, 2000)
      })
      .catch(() => {
        setActionError('Failed to copy')
      })
      .finally(() => {
        setActionLoading(null)
      })
  }

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

  // Error state
  if (actionError && !dataLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="pf-container">
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
            <p className="text-sm text-red-400">{actionError}</p>
            <button onClick={() => { setActionError(null); setDataLoading(true); loadDashboard(); }} className="mt-2 text-xs text-red-300 hover:underline">Retry</button>
          </div>
        </div>
      </div>
    )
  }

  const isArtist = profile?.role === 'artist'
  const isSupporter = !isArtist

  // Money visibility
  const availableBalance = balance / 100
  const totalEarned = availableBalance + pendingBalance
  const canCashOut = availableBalance >= 25

  // Profile completion
  const profileFields = [
    profile?.full_name,
    profile?.bio,
    profile?.avatar_url,
    profile?.genre,
    profile?.city,
    profile?.instagram_url || profile?.youtube_url || profile?.twitter_url || profile?.tiktok_url,
  ].filter(Boolean)
  const completionPct = profile ? Math.round((profileFields.length / 6) * 100) : 0

  // State machine: determine user state and primary CTA
  const getUserState = () => {
    if (!profile?.archetype) return 'NEW_USER'
    if (!profile?.likeness_verified) return 'UNVERIFIED'
    if (!profile?.full_name || !profile?.bio || !profile?.avatar_url) return 'INCOMPLETE_PROFILE'
    if (stats.total_products === 0) return 'NO_PRODUCTS'
    if (!profile?.artist_slug) return 'NO_SLUG'
    return 'LIVE_SELLING'
  }

  const userState = getUserState()

  // Primary CTA based on state
  const primaryCTA = {
    NEW_USER: { label: 'Take 20-Second Quiz', sub: 'Unlock your earning path', href: '/likelihood', icon: <ArrowRight size={20} />, color: 'from-orange-500/20 to-amber-500/10 border-[var(--pf-orange)]/30' },
    UNVERIFIED: { label: 'Verify Likeness', sub: 'Required to cash out', href: '/dashboard/dashboard/likeness', icon: <ShieldCheck size={20} />, color: 'from-orange-500/20 to-amber-500/10 border-[var(--pf-orange)]/30' },
    INCOMPLETE_PROFILE: { label: 'Finish Profile', sub: '3 clicks to go live', href: '/dashboard/dashboard/artist/edit', icon: <ArrowRight size={20} />, color: 'from-purple-500/15 to-blue-500/10 border-purple-500/30' },
    NO_PRODUCTS: { label: 'Add First Product', sub: 'Start making money', href: '/dashboard/dashboard/add-product', icon: <Plus size={20} />, color: 'from-green-500/15 to-emerald-500/10 border-green-500/30' },
    NO_SLUG: { label: 'Set Your URL', sub: 'Publish your store', href: '/dashboard/dashboard/artist/edit', icon: <ExternalLink size={20} />, color: 'from-blue-500/15 to-cyan-500/10 border-blue-500/30' },
    LIVE_SELLING: { label: 'Share Your Page', sub: `porterful.com/artist/${profile.artist_slug}`, href: null, icon: <Copy size={20} />, color: 'from-[var(--pf-orange)]/15 to-amber-500/10 border-[var(--pf-orange)]/30' },
  }[userState]

  const pageUrl = profile?.artist_slug ? `https://porterful.com/artist/${profile.artist_slug}` : null
  const refUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://porterful.com'}/?ref=${profile?.referral_code || ''}`

  // ─── Supporter ───────────────────────────────────────────────────────────
  if (isSupporter) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="pf-container max-w-3xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold">{profile?.full_name || 'My'} Dashboard</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--pf-orange)]/20 text-[var(--pf-orange)] border border-[var(--pf-orange)]/30 mt-1 inline-block">
                {profile?.role || 'supporter'}
              </span>
            </div>
            <Link href="/settings/settings" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] hover:border-[var(--pf-orange)] transition-colors text-sm">
              <Settings size={14} />
              Settings
            </Link>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <div className="pf-card p-5 border border-[var(--pf-orange)]/30">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[var(--pf-text-muted)]">Available</span>
                <DollarSign size={16} className="text-[var(--pf-orange)]" />
              </div>
              <p className="text-2xl font-bold">${availableBalance.toFixed(2)}</p>
              <p className="text-xs text-[var(--pf-text-muted)] mt-1">{canCashOut ? 'Ready to withdraw' : `$${(25 - availableBalance).toFixed(2)} to cash out`}</p>
            </div>
            <div className="pf-card p-5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[var(--pf-text-muted)]">Pending</span>
                <DollarSign size={16} className="text-blue-400" />
              </div>
              <p className="text-2xl font-bold">${pendingBalance.toFixed(2)}</p>
              <p className="text-xs text-[var(--pf-text-muted)] mt-1">Processing</p>
            </div>
            <div className="pf-card p-5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[var(--pf-text-muted)]">Total Earned</span>
                <DollarSign size={16} className="text-green-400" />
              </div>
              <p className="text-2xl font-bold">${totalEarned.toFixed(2)}</p>
              <p className="text-xs text-[var(--pf-text-muted)] mt-1">Lifetime</p>
            </div>
          </div>

          {canCashOut && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-500/15 to-emerald-500/10 border border-green-500/30 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-bold text-sm">Ready to cash out ${availableBalance.toFixed(2)}?</p>
                <p className="text-xs text-[var(--pf-text-muted)] mt-0.5">Withdraw to your connected account</p>
              </div>
              <button className="px-4 py-2 bg-green-500 text-white text-sm font-bold rounded-xl hover:bg-green-600 transition-colors">
                Cash Out →
              </button>
            </div>
          )}

          <div className="pf-card p-5 flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">Want to sell on Porterful?</p>
              <p className="text-xs text-[var(--pf-text-muted)] mt-0.5">Apply as an artist or creator</p>
            </div>
            <Link href="/apply" className="pf-btn pf-btn-primary text-sm">
              Apply to Sell <ArrowRight size={14} className="inline ml-1" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ─── Artist ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="pf-container max-w-4xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">{profile?.full_name || 'Artist'} Dashboard</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--pf-orange)]/20 text-[var(--pf-orange)] border border-[var(--pf-orange)]/30">
                {profile?.role || 'artist'}
              </span>
              {completionPct < 100 && (
                <span className="text-xs text-[var(--pf-text-muted)]">{completionPct}% complete</span>
              )}
              <span className={`flex items-center gap-1 text-xs ${profile?.artist_slug ? 'text-green-400' : 'text-[var(--pf-text-muted)]'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${profile?.artist_slug ? 'bg-green-400' : 'bg-[var(--pf-text-muted)]'}`} />
                {profile?.artist_slug ? 'Live' : 'Not live'}
              </span>
            </div>
          </div>
          <Link href="/settings/settings" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)] hover:border-[var(--pf-orange)] transition-colors text-sm">
            <Settings size={14} />
            Settings
          </Link>
        </div>

        {/* Completion bar */}
        {completionPct < 100 && (
          <div className="w-full h-1.5 bg-[var(--pf-surface)] rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-gradient-to-r from-[var(--pf-orange)] to-purple-500 transition-all duration-500"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        )}

        {/* Primary CTA - State Machine Driven */}
        <div className={`mb-6 p-5 rounded-2xl bg-gradient-to-r ${primaryCTA.color} border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              {primaryCTA.icon}
            </div>
            <div>
              <p className="font-bold">{primaryCTA.label}</p>
              <p className="text-sm text-[var(--pf-text-secondary)]">{primaryCTA.sub}</p>
            </div>
          </div>
          {primaryCTA.href ? (
            <Link href={primaryCTA.href} className="w-full sm:w-auto px-4 py-2 bg-white text-black text-sm font-bold rounded-xl hover:bg-white/90 transition-colors shrink-0 text-center">
              Go →
            </Link>
          ) : pageUrl ? (
            <button
              onClick={() => copy('page', pageUrl)}
              disabled={actionLoading === 'copy'}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white text-black text-sm font-bold rounded-xl hover:bg-white/90 transition-colors shrink-0 disabled:opacity-50"
            >
              {actionLoading === 'copy' ? (
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : copied === 'page' ? (
                <Check size={14} />
              ) : (
                <Copy size={14} />
              )}
              {actionLoading === 'copy' ? 'Copying...' : copied === 'page' ? 'Copied!' : 'Copy Link'}
            </button>
          ) : null}
        </div>

        {/* Success/Error States */}
        {actionSuccess && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-sm text-green-400">{actionSuccess}</p>
          </div>
        )}

        {/* Stats - Mobile Optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="pf-card p-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[var(--pf-text-muted)]">Earned</span>
              <DollarSign size={16} className="text-[var(--pf-orange)]" />
            </div>
            <p className="text-2xl font-bold">${stats.total_sales.toFixed(2)}</p>
            <p className="text-xs text-green-400 mt-1">{stats.this_month.growth} this month</p>
          </div>
          <div className="pf-card p-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[var(--pf-text-muted)]">Orders</span>
              <Package size={16} className="text-blue-400" />
            </div>
            <p className="text-2xl font-bold">{stats.total_orders}</p>
            <p className="text-xs text-[var(--pf-text-muted)] mt-1">{stats.this_month.orders} this month</p>
          </div>
          <div className="pf-card p-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[var(--pf-text-muted)]">Products</span>
              <Store size={16} className="text-purple-400" />
            </div>
            <p className="text-2xl font-bold">{stats.total_products}</p>
            <p className="text-xs text-[var(--pf-text-muted)] mt-1">Active listings</p>
          </div>
        </div>

        {/* Action Buttons - Max 4, Revenue-Focused, Mobile Optimized */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {[
            { label: 'Add Product', href: '/dashboard/dashboard/add-product', icon: <Plus size={18} />, primary: true },
            { label: 'Share Page', action: () => pageUrl && copy('page', pageUrl), icon: <Copy size={18} />, primary: true },
            ...(stats.total_sales > 0 ? [{ label: 'Earnings', href: '/dashboard/dashboard/earnings', icon: <DollarSign size={18} />, primary: false }] : []),
            ...(stats.total_orders > 5 ? [{ label: 'Analytics', href: '/dashboard/dashboard/analytics', icon: <ExternalLink size={18} />, primary: false }] : []),
          ].slice(0, 4).map((action) => (
            <button
              key={action.label}
              onClick={() => action.action && action.action()}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors text-sm font-semibold min-h-[44px] ${
                action.primary
                  ? 'bg-[var(--pf-orange)] border-[var(--pf-orange)] text-white hover:bg-[var(--pf-orange-dark)]'
                  : 'bg-[var(--pf-surface)] border-[var(--pf-border)] hover:border-[var(--pf-orange)]'
              } ${action.href ? 'cursor-pointer' : ''}`}
              disabled={actionLoading === 'copy'}
            >
              {action.href ? (
                <Link href={action.href} className="flex flex-col items-center gap-2 w-full h-full">
                  {action.icon}
                  {action.label}
                </Link>
              ) : (
                <>
                  {actionLoading === 'copy' ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    action.icon
                  )}
                  {action.label}
                </>
              )}
            </button>
          ))}
        </div>

        {/* Bottom row: recent orders + sidebar */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2 pf-card">
            <div className="flex items-center justify-between p-4 border-b border-[var(--pf-border)]">
              <h2 className="font-semibold text-sm">Recent Orders</h2>
              <Link href="/dashboard/dashboard/earnings" className="text-xs text-[var(--pf-orange)] hover:underline">
                View all →
              </Link>
            </div>
            <div className="divide-y divide-[var(--pf-border)]">
              {stats.total_orders === 0 ? (
                <div className="p-8 text-center text-[var(--pf-text-muted)]">
                  <Package size={28} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No orders yet</p>
                  {pageUrl && (
                    <button
                      onClick={() => copy('page', pageUrl)}
                      className="mt-3 text-xs text-[var(--pf-orange)] hover:underline flex items-center gap-1 mx-auto"
                    >
                      <Copy size={12} /> Copy your page link to start earning
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-4 text-sm text-[var(--pf-text-muted)]">Orders will appear here</div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Your Page */}
            {pageUrl && (
              <div className="pf-card p-4">
                <p className="text-xs text-[var(--pf-text-muted)] mb-2">Your artist page</p>
                <p className="text-xs font-mono text-[var(--pf-orange)] truncate mb-3">
                  porterful.com/artist/{profile.artist_slug}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => copy('page', pageUrl)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-lg hover:border-[var(--pf-orange)] transition-colors"
                  >
                    {copied === 'page' ? <Check size={12} /> : <Copy size={12} />}
                    {copied === 'page' ? 'Copied!' : 'Copy'}
                  </button>
                  <Link
                    href={`/artist/${profile.artist_slug}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-lg hover:border-[var(--pf-orange)] transition-colors"
                  >
                    <ExternalLink size={12} /> View
                  </Link>
                </div>
              </div>
            )}

            {/* Referral Link */}
            <div className="pf-card p-4">
              <p className="text-xs text-[var(--pf-text-muted)] mb-2">Referral link</p>
              <p className="text-xs font-mono text-[var(--pf-orange)] truncate mb-3">
                porterful.com/?ref={profile?.referral_code || '...'}
              </p>
              <button
                onClick={() => copy('ref', refUrl)}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-lg hover:border-[var(--pf-orange)] transition-colors"
              >
                {copied === 'ref' ? <Check size={12} /> : <Copy size={12} />}
                {copied === 'ref' ? 'Copied!' : 'Copy link'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
