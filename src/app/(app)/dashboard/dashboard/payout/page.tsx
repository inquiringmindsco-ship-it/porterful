'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, DollarSign, AlertCircle, Check, Clock, CreditCard, ArrowRight } from 'lucide-react'
import { useSupabase } from '@/app/providers'
import { LIKENESS_REGISTRATION_URL, getLikenessVerificationState } from '@/lib/likeness-verification'

interface PayoutBalance {
  total_earned: number
  available: number
  pending: number
  tier: string
}

export default function PayoutPage() {
  const router = useRouter()
  const { user, supabase, loading: authLoading } = useSupabase()
  const [balance, setBalance] = useState<PayoutBalance | null>(null)
  const [loading, setLoading] = useState(true)
  const [likenessVerified, setLikenessVerified] = useState<boolean | null>(null)
  const [requesting, setRequesting] = useState(false)
  const [requested, setRequested] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login')
      return
    }
    checkLikenessAndLoad()
  }, [user, authLoading])

  async function checkLikenessAndLoad() {
    if (!user || !supabase) return
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      const state = getLikenessVerificationState(profile)
      setLikenessVerified(state.verified)

      if (state.verified) {
        await loadBalance()
      } else {
        setLoading(false)
      }
    } catch (err) {
      console.error('Error checking likeness:', err)
      setLoading(false)
    }
  }

  async function loadBalance() {
    if (!user || !supabase) return
    
    try {
      // Fetch actual earnings from Supabase
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('price, quantity, created_at')
        .eq('seller_id', user.id)

      const total = (orderItems || []).reduce((sum: number, item: any) => {
        return sum + (Number(item.price) || 0) * (Number(item.quantity) || 0)
      }, 0)

      const balanceData: PayoutBalance = {
        total_earned: total,
        available: total * 0.67, // 67% artist cut after fees
        pending: 0,
        tier: 'growing',
      }

      setBalance(balanceData)
    } catch (err) {
      console.error('Error loading balance:', err)
      setBalance({ total_earned: 0, available: 0, pending: 0, tier: 'new' })
    }
    setLoading(false)
  }

  async function handleRequestPayout() {
    if (!balance || balance.available < 10) {
      setError('Minimum payout is $10.00')
      return
    }

    setRequesting(true)
    setError('')

    try {
      const res = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'payout_request',
          amount: balance.available,
        }),
      })

      const data = await res.json()

      if (res.status === 403 && data.code === 'LIKENESS_VERIFICATION_REQUIRED') {
        setLikenessVerified(false)
        setError(data.error)
        return
      }

      if (!res.ok) {
        setError(data.error || 'Failed to request payout')
        return
      }

      setRequested(true)
    } catch (err) {
      setError('Failed to request payout')
    } finally {
      setRequesting(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-20 pb-24 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--pf-orange)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Likeness verification required
  if (likenessVerified === false) {
    return (
      <div className="min-h-screen pt-20 pb-24 bg-[var(--pf-bg)]">
        <div className="pf-container max-w-2xl mx-auto">
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 text-[var(--pf-text-muted)] hover:text-white mb-8"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </Link>

          <div className="bg-gradient-to-r from-[var(--pf-orange)]/20 to-purple-600/20 border border-[var(--pf-orange)]/30 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--pf-orange)]/20 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-[var(--pf-orange)]" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Likeness Verification Required</h1>
            <p className="text-[var(--pf-text-secondary)] mb-6 max-w-md mx-auto">
              Verification required to withdraw funds. Complete identity verification to enable payouts.
            </p>
            <a
              href={LIKENESS_REGISTRATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--pf-orange)] text-white rounded-xl font-semibold hover:bg-[var(--pf-orange-dark)] transition-colors"
            >
              <Check size={20} />
              Verify at LikenessVerified.com
              <ArrowRight size={16} />
            </a>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Success state
  if (requested) {
    return (
      <div className="min-h-screen pt-20 pb-24 bg-[var(--pf-bg)]">
        <div className="pf-container max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Payout Requested!</h1>
          <p className="text-[var(--pf-text-secondary)] mb-6">
            Your payout of ${(balance?.available || 0).toFixed(2)} has been submitted. 
            Expect it to arrive in 2-3 business days.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--pf-orange)] text-white rounded-xl font-semibold hover:bg-[var(--pf-orange-dark)] transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-24 bg-[var(--pf-bg)]">
      <div className="pf-container max-w-2xl mx-auto">
        {/* Header */}
        <Link 
          href="/dashboard"
          className="inline-flex items-center gap-2 text-[var(--pf-text-muted)] hover:text-white mb-8"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>

        <h1 className="text-2xl font-bold mb-2 flex items-center gap-3">
          <DollarSign className="text-green-400" />
          Request Payout
        </h1>
        <p className="text-[var(--pf-text-secondary)] mb-8">
          Withdraw your earnings to your bank account
        </p>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30 rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-[var(--pf-text-muted)] mb-1">Total Earned</p>
              <p className="text-2xl font-bold text-white">${(balance?.total_earned || 0).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--pf-text-muted)] mb-1">Available (67% cut)</p>
              <p className="text-2xl font-bold text-green-400">${(balance?.available || 0).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--pf-text-muted)] mb-1">Pending</p>
              <p className="text-2xl font-bold text-[var(--pf-orange)]">${(balance?.pending || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Payout Info */}
        <div className="bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-xl p-6 mb-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <CreditCard size={18} className="text-[var(--pf-text-muted)]" />
            Payout Method
          </h2>
          <p className="text-sm text-[var(--pf-text-secondary)] mb-4">
            Payouts are processed via Stripe direct deposit. Connect your Stripe account in settings to enable withdrawals.
          </p>
          <Link 
            href="/settings"
            className="text-sm text-[var(--pf-orange)] hover:underline"
          >
            Go to Settings →
          </Link>
        </div>

        {/* Request Button */}
        <div className="bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold">Request Payout</p>
              <p className="text-sm text-[var(--pf-text-muted)]">Minimum: $10.00</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-400">${(balance?.available || 0).toFixed(2)}</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <button
            onClick={handleRequestPayout}
            disabled={requesting || (balance?.available || 0) < 10}
            className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {requesting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <DollarSign size={18} />
                Request ${(balance?.available || 0).toFixed(2)} Payout
              </>
            )}
          </button>

          <div className="mt-4 flex items-center gap-2 text-xs text-[var(--pf-text-muted)]">
            <Clock size={12} />
            <span>2-3 business days to arrive • $0.25 Stripe processing fee</span>
          </div>
        </div>

        {/* How it Works */}
        <div className="mt-8">
          <h2 className="font-semibold mb-4">How Payouts Work</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[var(--pf-surface)] rounded-xl p-4">
              <div className="w-8 h-8 rounded-full bg-[var(--pf-orange)]/20 flex items-center justify-center mb-3">
                <span className="text-sm font-bold text-[var(--pf-orange)]">1</span>
              </div>
              <p className="text-sm font-medium mb-1">Earn from Sales</p>
              <p className="text-xs text-[var(--pf-text-muted)]">You receive 67% of each sale automatically</p>
            </div>
            <div className="bg-[var(--pf-surface)] rounded-xl p-4">
              <div className="w-8 h-8 rounded-full bg-[var(--pf-orange)]/20 flex items-center justify-center mb-3">
                <span className="text-sm font-bold text-[var(--pf-orange)]">2</span>
              </div>
              <p className="text-sm font-medium mb-1">Build Balance</p>
              <p className="text-xs text-[var(--pf-text-muted)]">Balance updates in real-time as orders complete</p>
            </div>
            <div className="bg-[var(--pf-surface)] rounded-xl p-4">
              <div className="w-8 h-8 rounded-full bg-[var(--pf-orange)]/20 flex items-center justify-center mb-3">
                <span className="text-sm font-bold text-[var(--pf-orange)]">3</span>
              </div>
              <p className="text-sm font-medium mb-1">Request Payout</p>
              <p className="text-xs text-[var(--pf-text-muted)]">Minimum $10, processed on 1st & 15th</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
