'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Crown, Check, Music, Download, Zap, ArrowLeft } from 'lucide-react'

export default function UnlockPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePurchase = async () => {
    setLoading(true)
    setError('')
    
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{
            productId: 'full-access',
            name: 'Full Access - All Music Unlocked',
            price: 5.99,
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
        // Demo mode - redirect to success
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
        <Link href="/support" className="inline-flex items-center gap-2 text-[var(--pf-text-secondary)] hover:text-[var(--pf-text)] mb-8">
          <ArrowLeft size={20} />
          Back to pricing
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[var(--pf-orange)] to-purple-600 mb-4">
            <Crown className="text-white" size={40} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Unlock Everything</h1>
          <p className="text-[var(--pf-text-secondary)]">
            One payment. All music. No subscription.
          </p>
        </div>

        {/* Price Card */}
        <div className="bg-gradient-to-br from-[var(--pf-orange)]/10 to-purple-600/10 rounded-2xl p-8 border border-[var(--pf-orange)]/30 mb-8">
          <div className="text-center mb-6">
            <p className="text-sm text-[var(--pf-text-secondary)] mb-1">One-time payment</p>
            <p className="text-5xl font-bold">$5.99</p>
            <p className="text-sm text-[var(--pf-text-muted)]">USD</p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3">
              <Check size={20} className="text-green-400 shrink-0" />
              <span className="text-[var(--pf-text)]"><strong>Every song unlocked</strong> — 114 tracks</span>
            </div>
            <div className="flex items-center gap-3">
              <Check size={20} className="text-green-400 shrink-0" />
              <span className="text-[var(--pf-text)]"><strong>All albums</strong> — 8 full albums</span>
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
              <span className="text-[var(--pf-text)]"><strong>No subscription</strong> — pay once, own forever</span>
            </div>
            <div className="flex items-center gap-3">
              <Check size={20} className="text-green-400 shrink-0" />
              <span className="text-[var(--pf-text)]"><strong>Download rights</strong> — keep your music offline</span>
            </div>
            <div className="flex items-center gap-3">
              <Check size={20} className="text-green-400 shrink-0" />
              <span className="text-[var(--pf-text)]"><strong>80% to artists</strong> — support creators directly</span>
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
                <Zap size={20} />
                Unlock Everything — $5.99
              </>
            )}
          </button>

          <p className="text-center text-xs text-[var(--pf-text-muted)] mt-4">
            Secure payment via Stripe. Test with card 4242 4242 4242 4242.
          </p>
        </div>

        {/* What You Get */}
        <div className="bg-[var(--pf-surface)] rounded-xl p-6 border border-[var(--pf-border)] mb-8">
          <h3 className="font-bold mb-4">What You're Getting</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Music className="text-[var(--pf-orange)]" size={20} />
              <span className="text-sm">114 tracks</span>
            </div>
            <div className="flex items-center gap-2">
              <Download className="text-[var(--pf-orange)]" size={20} />
              <span className="text-sm">Download access</span>
            </div>
            <div className="flex items-center gap-2">
              <Crown className="text-[var(--pf-orange)]" size={20} />
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
                  <td className="text-center py-2 px-4"><strong>$5.99 once</strong></td>
                  <td className="text-center py-2 px-4">$10.99/mo</td>
                  <td className="text-center py-2 px-4">$10.99/mo</td>
                </tr>
                <tr className="border-b border-[var(--pf-border)]">
                  <td className="py-2 pr-4">Artist gets</td>
                  <td className="text-center py-2 px-4"><strong className="text-green-400">80%</strong></td>
                  <td className="text-center py-2 px-4">~$0.003/stream</td>
                  <td className="text-center py-2 px-4">~$0.01/stream</td>
                </tr>
                <tr className="border-b border-[var(--pf-border)]">
                  <td className="py-2 pr-4">Subscription</td>
                  <td className="text-center py-2 px-4"><strong className="text-green-400">No</strong></td>
                  <td className="text-center py-2 px-4">Yes</td>
                  <td className="text-center py-2 px-4">Yes</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Downloads</td>
                  <td className="text-center py-2 px-4"><strong className="text-green-400">Yes</strong></td>
                  <td className="text-center py-2 px-4">Premium only</td>
                  <td className="text-center py-2 px-4">Premium only</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[var(--pf-text-muted)] mt-4 text-center">
            * Based on average streaming payouts. Artists on Porterful get 80% of every sale.
          </p>
        </div>

        {/* FAQ */}
        <div className="mt-8">
          <h3 className="font-bold mb-4">Questions?</h3>
          <div className="space-y-3">
            <details className="bg-[var(--pf-surface)] rounded-lg p-4 border border-[var(--pf-border)]">
              <summary className="font-medium cursor-pointer">Is this a subscription?</summary>
              <p className="mt-2 text-[var(--pf-text-secondary)] text-sm">
                No. You pay $5.99 once and get permanent access to all music on Porterful. No monthly fees, no recurring charges.
              </p>
            </details>
            <details className="bg-[var(--pf-surface)] rounded-lg p-4 border border-[var(--pf-border)]">
              <summary className="font-medium cursor-pointer">Can I download the music?</summary>
              <p className="mt-2 text-[var(--pf-text-secondary)] text-sm">
                Yes. Full access includes download rights for all tracks. Keep your music offline forever.
              </p>
            </details>
            <details className="bg-[var(--pf-surface)] rounded-lg p-4 border border-[var(--pf-border)]">
              <summary className="font-medium cursor-pointer">What if I only want one song?</summary>
              <p className="mt-2 text-[var(--pf-text-secondary)] text-sm">
                You can buy individual songs for $1 each on the <Link href="/digital" className="text-[var(--pf-orange)] hover:underline">Music page</Link>. Full Access is for listeners who want everything.
              </p>
            </details>
            <details className="bg-[var(--pf-surface)] rounded-lg p-4 border border-[var(--pf-border)]">
              <summary className="font-medium cursor-pointer">Do artists really get 80%?</summary>
              <p className="mt-2 text-[var(--pf-text-secondary)] text-sm">
                Yes. 80% goes directly to artists. 20% goes to the Artist Fund, which supports emerging artists on the platform. We take a small platform fee only to keep the lights on.
              </p>
            </details>
          </div>
        </div>
      </div>
    </div>
  )
}