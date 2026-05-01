'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, Check, Music, Download, ArrowLeft, Sparkles } from 'lucide-react'
import { TRACKS } from '@/lib/data'

export default function UnlockPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [customAmount, setCustomAmount] = useState('')
  const selectedAmount = customAmount || '5.99'

  const handlePurchase = async () => {
    setLoading(true)
    setError('')

    const amount = parseFloat(selectedAmount)
    if (isNaN(amount) || amount < 5.99) {
      setError('Minimum contribution is $5.99 — thank you for understanding!')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{
            productId: 'full-access',
            name: 'Full Access - All Music Unlocked',
            price: amount,
            quantity: 1,
            type: 'digital',
            image: '/logo.svg'
          }]
        })
      })

      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else if (data.demo) {
        window.location.href = '/checkout/success?demo=true'
      } else {
        setError(data.error || 'Something went wrong. Please try again.')
        setLoading(false)
      }
    } catch (err) {
      setError('Connection error. Please check your internet and try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-24 bg-[var(--pf-bg)]">
      <div className="pf-container max-w-2xl">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-[var(--pf-text-secondary)] hover:text-[var(--pf-text)] mb-8">
          <ArrowLeft size={20} />
          Back to home
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[var(--pf-orange)] to-purple-600 mb-4">
            <Heart className="text-white" size={40} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Show Some Love</h1>
          <p className="text-[var(--pf-text-secondary)]">
            Support the artists directly. Minimum $5.99 — add more if you want.
          </p>
        </div>

        {/* Contribution Card */}
        <div className="bg-gradient-to-br from-[var(--pf-orange)]/10 to-purple-600/10 rounded-2xl p-8 border border-[var(--pf-orange)]/30 mb-8">
          <div className="text-center mb-6">
            <p className="text-sm text-[var(--pf-text-secondary)] mb-1">Your contribution goes directly to artists</p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <span className="text-5xl font-bold">$</span>
              <input
                type="number"
                min="5.99"
                step="0.01"
                value={customAmount}
                onChange={e => setCustomAmount(e.target.value)}
                placeholder="5.99"
                className="text-5xl font-bold bg-transparent border-none outline-none text-center w-32"
              />
            </div>
            <p className="text-sm text-[var(--pf-text-muted)]">USD · Minimum $5.99</p>
          </div>

          {/* Preset amounts */}
          <div className="flex gap-2 mb-6 justify-center flex-wrap">
            {['5.99', '9.99', '14.99', '19.99', '29.99'].map(amount => (
              <button
                key={amount}
                onClick={() => setCustomAmount(amount)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  selectedAmount === amount && !customAmount
                    ? 'bg-[var(--pf-orange)] text-white'
                    : customAmount === amount
                    ? 'bg-[var(--pf-orange)] text-white'
                    : 'bg-[var(--pf-surface)] border border-[var(--pf-border)] hover:border-[var(--pf-orange)]'
                }`}
              >
                ${amount}
              </button>
            ))}
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3">
              <Check size={20} className="text-green-400 shrink-0" />
              <span className="text-[var(--pf-text)]"><strong>Every song unlocked</strong> — {TRACKS.length} tracks</span>
            </div>
            <div className="flex items-center gap-3">
              <Check size={20} className="text-green-400 shrink-0" />
              <span className="text-[var(--pf-text)]"><strong>All albums</strong> — full access forever</span>
            </div>
            <div className="flex items-center gap-3">
              <Check size={20} className="text-green-400 shrink-0" />
              <span className="text-[var(--pf-text)]"><strong>All artists</strong> — unlimited access</span>
            </div>
            <div className="flex items-center gap-3">
              <Check size={20} className="text-green-400 shrink-0" />
              <span className="text-[var(--pf-text)]"><strong>No preview limits</strong> — stream full tracks</span>
            </div>
            <div className="flex items-center gap-3">
              <Check size={20} className="text-green-400 shrink-0" />
              <span className="text-[var(--pf-text)]"><strong>earnings to artists</strong> — your money goes further here</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <button
            onClick={handlePurchase}
            disabled={loading}
            className="w-full py-4 bg-[var(--pf-orange)] text-white rounded-xl font-bold text-lg hover:bg-[var(--pf-orange-dark)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <Heart size={20} className="fill-current" />
                Contribute ${selectedAmount} — Unlock Everything
              </>
            )}
          </button>

          <p className="text-center text-xs text-[var(--pf-text-muted)] mt-4">
            Secure payment via Stripe. Test with card 4242 4242 4242 4242.
          </p>
        </div>

        {/* What You Get */}
        <div className="bg-[var(--pf-surface)] rounded-xl p-6 border border-[var(--pf-border)] mb-8">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-[var(--pf-orange)]" />
            What You're Getting
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Music className="text-[var(--pf-orange)]" size={20} />
              <span className="text-sm">{TRACKS.length} tracks</span>
            </div>
            <div className="flex items-center gap-2">
              <Download className="text-[var(--pf-orange)]" size={20} />
              <span className="text-sm">Download access</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="text-[var(--pf-orange)]" size={20} />
              <span className="text-sm">Full streaming</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="text-[var(--pf-orange)]" size={20} />
              <span className="text-sm">No limits</span>
            </div>
          </div>
        </div>

        {/* Comparison */}
        <div className="bg-[var(--pf-surface)] rounded-xl p-6 border border-[var(--pf-border)]">
          <h3 className="font-bold mb-4 text-center">Porterful vs Others</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--pf-border)]">
                  <th className="text-left py-2 pr-4"></th>
                  <th className="text-center py-2 px-4 text-[var(--pf-orange)]">Porterful</th>
                  <th className="text-center py-2 px-4 text-[var(--pf-text-muted)]">Spotify</th>
                  <th className="text-center py-2 px-4 text-[var(--pf-text-muted)]">Apple Music</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[var(--pf-border)]">
                  <td className="py-2 pr-4">Cost</td>
                  <td className="text-center py-2 px-4"><strong>${selectedAmount} once</strong></td>
                  <td className="text-center py-2 px-4">$10.99/mo</td>
                  <td className="text-center py-2 px-4">$10.99/mo</td>
                </tr>
                <tr className="border-b border-[var(--pf-border)]">
                  <td className="py-2 pr-4">Artist gets</td>
                  <td className="text-center py-2 px-4"><strong className="text-green-400">80%</strong></td>
                  <td className="text-center py-2 px-4">~$0.003/stream</td>
                  <td className="text-center py-2 px-4">~$0.01/stream</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Subscription</td>
                  <td className="text-center py-2 px-4"><strong className="text-green-400">Never</strong></td>
                  <td className="text-center py-2 px-4">Forever</td>
                  <td className="text-center py-2 px-4">Forever</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
