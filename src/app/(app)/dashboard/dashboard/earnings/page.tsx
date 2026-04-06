'use client'

/* ════════════════════════════════════════════════════════════════
   STRIPE CONNECT — Artist Payouts Wiring Guide
   ════════════════════════════════════════════════════════════════
   
   Required env vars:
     STRIPE_SECRET_KEY       — Stripe API secret key
     STRIPE_PUBLISHABLE_KEY — Stripe publishable key (NEXT_PUBLIC_STRIPE_KEY)
     STRIPE_WEBHOOK_SECRET  — Webhook signing secret from Stripe dashboard
   
   Connect flow:
     1. Artist clicks "Connect Stripe" on dashboard
     2. Redirect to /api/stripe/connect (creates Express account link)
     3. Stripe redirects back to /dashboard/earnings?stripe_connected=true
     4. Store stripe_account_id in profiles.stripe_account_id
     5. Set profiles.stripe_onboarded = true after dashboard completed
   
   Onboarding checklist:
     - Collect bank account or debit card for payouts
     - Verify identity (DOB, address, SSN last 4 for US)
     - Accept Stripe Connected account terms
   
   Payout flow:
     1. Artist requests payout via POST /api/payouts
     2. Server calls stripe.transfers.create({
          amount: cents,
          currency: 'usd',
          destination: artist.stripe_account_id,
          transfer_group: `payout_${artist.id}`
        })
     3. Webhook stripe.event.type === 'transfer.created' logs payout
     4. Update profiles.total_paid_out, profiles.current_balance
   
   Key tables:
     profiles.stripe_account_id     — Stripe account identifier
     profiles.stripe_onboarded      — whether Stripe setup is complete
     profiles.current_balance       — available balance (in cents)
     profiles.total_paid_out        — lifetime payout total
     payout_requests.id            — payout request records
     payout_requests.stripe_transfer_id — Stripe transfer ID
   
   Webhook events to handle:
     - account.updated          (payouts_enabled, charges_enabled changes)
     - transfer.created         (payout processed)
     - transfer.failed          (payout failed)
     - payout.paid              (payout completed)
     - payout.failed            (payout failed)
   
   Docs: https://stripe.com/docs/connect
   Dashboard: https://dashboard.stripe.com/settings/connect
   ════════════════════════════════════════════════════════════════ */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePayout, getTierInfo, formatCurrency, PAYOUT_TIERS } from '@/lib/payout-context'
import { useSupabase } from '@/app/providers'
import { DollarSign, TrendingUp, Clock, Award, ArrowUp, ArrowDown, Wallet, ArrowRight, CreditCard, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function ArtistDashboardPage() {
  const router = useRouter()
  const { user, supabase, loading: authLoading } = useSupabase()
  const { earnings, isLoading: payoutLoading, requestPayout } = usePayout()
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [error, setError] = useState('')
  const [profile, setProfile] = useState<any>(null)
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    async function checkAccess() {
      if (authLoading) return
      if (!user) {
        router.push('/login')
        return
      }
      const { data } = await supabase!
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(data)
      if (data?.role !== 'artist') {
        router.push('/dashboard')
        return
      }
      setPageLoading(false)
    }
    checkAccess()
  }, [user, supabase, authLoading, router])

  if (authLoading || pageLoading || payoutLoading) {
    return (
      <div className="min-h-screen bg-[var(--pf-bg)] text-[var(--pf-text)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-[var(--pf-orange)] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-[var(--pf-text-secondary)]">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!earnings) {
    return (
      <div className="min-h-screen bg-[var(--pf-bg)] text-[var(--pf-text)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--pf-text-secondary)]">No artist profile found.</p>
          <Link href="/dashboard/upload" className="pf-btn pf-btn-primary mt-4">
            Get Started
          </Link>
        </div>
      </div>
    )
  }

  const tierInfo = getTierInfo(earnings.tier)
  const nextTier = earnings.tier === 'new' ? 'growing' : earnings.tier === 'growing' ? 'established' : null
  const nextTierInfo = nextTier ? getTierInfo(nextTier as keyof typeof PAYOUT_TIERS) : null
  const progressToNextTier = nextTier 
    ? (earnings.totalSales / PAYOUT_TIERS[nextTier as keyof typeof PAYOUT_TIERS].threshold) * 100 
    : 100

  const handleWithdraw = async () => {
    setError('')
    const amount = parseFloat(withdrawAmount)
    
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount')
      return
    }
    
    if (amount < earnings.minimumPayout) {
      setError(`Minimum withdrawal is ${formatCurrency(earnings.minimumPayout)}`)
      return
    }
    
    if (amount > earnings.currentBalance) {
      setError('Insufficient balance')
      return
    }

    setIsWithdrawing(true)
    try {
      await requestPayout(amount)
      setWithdrawAmount('')
    } catch (err: any) {
      setError(err.message || 'Withdrawal failed')
    } finally {
      setIsWithdrawing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--pf-bg)] text-[var(--pf-text)]">
      {/* Header */}
      <div className="bg-gradient-to-b from-[var(--pf-orange)]/20 to-transparent pt-32 pb-8">
        <div className="pf-container">
          <Link href="/" className="flex items-center gap-2 text-[var(--pf-text-secondary)] hover:text-white mb-4">
            <ArrowRight size={20} className="rotate-180" />
            Back
          </Link>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <DollarSign className="text-[var(--pf-orange)]" />
            Artist Dashboard
          </h1>
          <p className="text-[var(--pf-text-secondary)] mt-1">
            Track your earnings and manage payouts
          </p>
        </div>
      </div>

      <div className="pf-container py-8">
        {/* Tier Card */}
        <div className="bg-gradient-to-br from-[var(--pf-orange)] to-purple-600 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/80 text-sm mb-1">Your Tier</p>
              <p className="text-3xl font-bold text-white flex items-center gap-2">
                <Award size={28} />
                {tierInfo.name}
              </p>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm mb-1">Payout Frequency</p>
              <p className="text-xl font-bold text-white">{tierInfo.payoutFrequency}</p>
            </div>
          </div>
          
          {tierInfo.probationDays > 0 && earnings.probationEndsAt && (
            <div className="bg-white/20 rounded-lg p-3 mt-4">
              <p className="text-white/90 text-sm">
                🎯 Probationary period ends: {new Date(earnings.probationEndsAt).toLocaleDateString()}
              </p>
            </div>
          )}

          <p className="text-white/80 text-sm mt-4">{tierInfo.description}</p>

          {nextTier && nextTierInfo && (
            <div className="mt-6 pt-4 border-t border-white/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80">Progress to {nextTierInfo.name}</span>
                <span className="text-white font-medium">{Math.min(progressToNextTier, 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-white rounded-full h-2 transition-all"
                  style={{ width: `${Math.min(progressToNextTier, 100)}%` }}
                />
              </div>
              <p className="text-white/60 text-sm mt-2">
                {formatCurrency(earnings.totalSales)} / {formatCurrency(nextTierInfo.threshold)} in sales
              </p>
            </div>
          )}
        </div>

        {/* BACKEND STUB: Stripe Connect Status Panel */}
        {/* ─────────────────────────────────────────────────────────────
           This panel shows Stripe Connect account status.
           TODO: When wired, fetch from Supabase:
             const { data: profile } = await supabase
               .from('profiles')
               .select('stripe_account_id, stripe_onboarded')
               .eq('id', user.id)
               .single()
             
           Example data:
             const stripeAccount = {
               connected: profile?.stripe_account_id != null,
               onboarded: profile?.stripe_onboarded ?? false,
               accountId: profile?.stripe_account_id ? 
                 profile.stripe_account_id.slice(-4) : null
             }
           ───────────────────────────────────────────────────────────── */}
        <div className="bg-[var(--pf-surface)] border-2 border-dashed border-purple-500/30 rounded-xl p-5 mb-8 opacity-75">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
              <CreditCard size={24} className="text-purple-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">Stripe Connect</h3>
                <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                  Not Connected
                </span>
              </div>
              <p className="text-sm text-[var(--pf-text-secondary)] mb-3">
                Connect your Stripe account to receive payouts directly to your bank account. 
                Requires identity verification and bank account or debit card.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link 
                  href="/dashboard/settings/stripe"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition text-sm"
                >
                  <ExternalLink size={14} />
                  Connect Stripe Account
                </Link>
                <a 
                  href="https://stripe.com/docs/connect" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--pf-bg)] hover:bg-[var(--pf-border)] text-[var(--pf-text-secondary)] font-medium rounded-lg transition text-sm"
                >
                  View Docs →
                </a>
              </div>
              <div className="mt-3 pt-3 border-t border-[var(--pf-border)] grid grid-cols-2 gap-4 text-xs text-[var(--pf-text-muted)]">
                <div>
                  <span className="text-[var(--pf-text-muted)]">Account ID</span>
                  <p className="font-mono mt-0.5 text-[var(--pf-text-secondary)]">—</p>
                </div>
                <div>
                  <span className="text-[var(--pf-text-muted)]">Payouts Enabled</span>
                  <p className="mt-0.5 text-yellow-400">Pending</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[var(--pf-surface)] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-green-500" size={20} />
              </div>
              <span className="text-[var(--pf-text-secondary)]">Total Sales</span>
            </div>
            <p className="text-3xl font-bold">{formatCurrency(earnings.totalSales)}</p>
            <p className="text-sm text-[var(--pf-text-muted)]">{earnings.salesCount} sales</p>
          </div>

          <div className="bg-[var(--pf-surface)] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[var(--pf-orange)]/20 rounded-lg flex items-center justify-center">
                <Wallet className="text-[var(--pf-orange)]" size={20} />
              </div>
              <span className="text-[var(--pf-text-secondary)]">Available Balance</span>
            </div>
            <p className="text-3xl font-bold">{formatCurrency(earnings.currentBalance)}</p>
            <p className="text-sm text-[var(--pf-text-muted)]">
              {earnings.minimumPayout > 0 ? `Min. withdrawal: ${formatCurrency(earnings.minimumPayout)}` : 'No minimum'}
            </p>
          </div>

          <div className="bg-[var(--pf-surface)] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <ArrowDown className="text-purple-500" size={20} />
              </div>
              <span className="text-[var(--pf-text-secondary)]">Total Paid Out</span>
            </div>
            <p className="text-3xl font-bold">{formatCurrency(earnings.totalPaidOut)}</p>
            <p className="text-sm text-[var(--pf-text-muted)]">Lifetime payouts</p>
          </div>
        </div>

        {/* Withdraw Section */}
        <div className="bg-[var(--pf-surface)] rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Request Payout</h2>
          
          {earnings.currentBalance < earnings.minimumPayout && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
              <p className="text-yellow-500">
                You need at least {formatCurrency(earnings.minimumPayout)} to request a payout.
              </p>
            </div>
          )}

          <div className="flex gap-4">
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Amount to withdraw"
              className="flex-1 bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--pf-orange)]"
              min={earnings.minimumPayout}
              max={earnings.currentBalance}
              step="0.01"
            />
            <button
              onClick={handleWithdraw}
              disabled={isWithdrawing || earnings.currentBalance < earnings.minimumPayout}
              className="pf-btn pf-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isWithdrawing ? 'Processing...' : 'Withdraw'}
            </button>
          </div>

          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setWithdrawAmount(earnings.currentBalance.toFixed(2))}
              className="text-sm text-[var(--pf-text-secondary)] hover:text-[var(--pf-orange)]"
            >
              Withdraw All
            </button>
            <span className="text-[var(--pf-text-muted)]">•</span>
            <button
              onClick={() => setWithdrawAmount('50')}
              className="text-sm text-[var(--pf-text-secondary)] hover:text-[var(--pf-orange)]"
            >
              $50
            </button>
            <span className="text-[var(--pf-text-muted)]">•</span>
            <button
              onClick={() => setWithdrawAmount('100')}
              className="text-sm text-[var(--pf-text-secondary)] hover:text-[var(--pf-orange)]"
            >
              $100
            </button>
          </div>

          <p className="text-sm text-[var(--pf-text-muted)] mt-4">
            {earnings.tier === 'new' && 'Payouts are processed monthly with a 30-day holding period.'}
            {earnings.tier === 'growing' && 'Payouts are processed bi-weekly with a 14-day holding period.'}
            {earnings.tier === 'established' && 'Payouts are processed weekly with a 7-day holding period.'}
          </p>
        </div>

        {/* Payout History */}
        <div className="bg-[var(--pf-surface)] rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Payout History</h2>

          {earnings.payoutHistory.length === 0 ? (
            <div className="text-center py-8 text-[var(--pf-text-muted)]">
              <Clock className="mx-auto mb-2" size={32} />
              <p>No payouts yet</p>
              <p className="text-sm mt-1">Your first payout will appear here after you reach the minimum.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {earnings.payoutHistory.map((payout) => (
                <div 
                  key={payout.id}
                  className="flex items-center justify-between p-4 bg-[var(--pf-bg)] rounded-lg"
                >
                  <div>
                    <p className="font-medium">{formatCurrency(payout.amount)}</p>
                    <p className="text-sm text-[var(--pf-text-muted)]">
                      {new Date(payout.requestedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      payout.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                      payout.status === 'processing' ? 'bg-yellow-500/20 text-yellow-500' :
                      payout.status === 'failed' ? 'bg-red-500/20 text-red-500' :
                      'bg-[var(--pf-text-muted)]/20 text-[var(--pf-text-muted)]'
                    }`}>
                      {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Sales */}
        {earnings.recentSales.length > 0 && (
          <div className="bg-[var(--pf-surface)] rounded-xl p-6 mt-8">
            <h2 className="text-xl font-bold mb-4">Recent Sales</h2>
            <div className="space-y-3">
              {earnings.recentSales.slice(0, 10).map((sale) => (
                <div 
                  key={sale.id}
                  className="flex items-center justify-between p-4 bg-[var(--pf-bg)] rounded-lg"
                >
                  <div>
                    <p className="font-medium">{sale.productName}</p>
                    <p className="text-sm text-[var(--pf-text-muted)]">
                      {new Date(sale.saleDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-500">+{formatCurrency(sale.artistCut)}</p>
                    <p className="text-sm text-[var(--pf-text-muted)]">
                      {formatCurrency(sale.amount)} sale
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tier Benefits */}
        <div className="bg-[var(--pf-surface)] rounded-xl p-6 mt-8">
          <h2 className="text-xl font-bold mb-4">Tier Benefits</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {Object.entries(PAYOUT_TIERS).map(([key, tier]) => (
              <div 
                key={key}
                className={`p-4 rounded-lg border-2 ${
                  key === earnings.tier 
                    ? 'border-[var(--pf-orange)] bg-[var(--pf-orange)]/10' 
                    : 'border-[var(--pf-border)]'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Award size={18} className={key === earnings.tier ? 'text-[var(--pf-orange)]' : 'text-[var(--pf-text-muted)]'} />
                  <span className="font-medium">{tier.name}</span>
                </div>
                <ul className="text-sm text-[var(--pf-text-secondary)] space-y-1">
                  <li>• {tier.payoutFrequency} payouts</li>
                  <li>• {tier.minimumPayout > 0 ? `$${tier.minimumPayout} minimum` : 'No minimum'}</li>
                  <li>• {tier.threshold > 0 ? `$${tier.threshold}+ in sales` : 'New artists'}</li>
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}