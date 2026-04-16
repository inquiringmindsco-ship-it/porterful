'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Instagram, Music, Share2, Zap } from 'lucide-react'

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'from-pink-500 to-purple-600' },
  { id: 'tiktok', label: 'TikTok', icon: Music, color: 'from-gray-800 to-black' },
  { id: 'youtube', label: 'YouTube', icon: Share2, color: 'from-red-500 to-red-700' },
  { id: 'twitter', label: 'X / Twitter', icon: Share2, color: 'from-blue-500 to-blue-700' },
]

export default function OnboardPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [handle, setHandle] = useState('')
  const [platform, setPlatform] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [createdSlug, setCreatedSlug] = useState('')

  const handleSubmit = async () => {
    if (!handle.trim() || !platform) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle: handle.trim(), platform }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Try again.')
        setLoading(false)
        return
      }

      setCreatedSlug(data.slug)
      setStep(2)
    } catch {
      setError('Connection error. Check your internet and try again.')
    } finally {
      setLoading(false)
    }
  }

  // Step 1: Handle + Platform
  if (step === 1) {
    return (
      <div className="min-h-screen bg-[var(--pf-bg)] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--pf-orange)]/10 text-[var(--pf-orange)] text-sm font-medium mb-6">
              <Zap size={14} />
              Go live in 30 seconds
            </div>
            <h1 className="text-3xl font-bold mb-3">Start with your @</h1>
            <p className="text-[var(--pf-text-secondary)]">
              Enter your handle — we handle the rest. No forms, no waiting.
            </p>
          </div>

          {/* Form */}
          <div className="space-y-5">
            {/* Handle input */}
            <div>
              <label className="block text-sm font-medium mb-2">Your @handle</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--pf-text-muted)]">@</span>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value.replace('@', ''))}
                  placeholder="yourusername"
                  className="w-full pl-8 pr-4 py-3.5 bg-[var(--pf-bg-secondary)] border border-[var(--pf-border)] rounded-xl text-white placeholder:text-[var(--pf-text-muted)] focus:outline-none focus:border-[var(--pf-orange)] transition-colors"
                  autoFocus
                />
              </div>
            </div>

            {/* Platform selector */}
            <div>
              <label className="block text-sm font-medium mb-3">Primary platform</label>
              <div className="grid grid-cols-2 gap-3">
                {PLATFORMS.map(({ id, label, icon: Icon, color }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPlatform(id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                      platform === id
                        ? 'border-[var(--pf-orange)] bg-[var(--pf-orange)]/10'
                        : 'border-[var(--pf-border)] bg-[var(--pf-bg-secondary)] hover:border-[var(--pf-border-hover)]'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
                      <Icon size={18} className="text-white" />
                    </div>
                    <span className="font-medium text-sm">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!handle.trim() || !platform || loading}
              className="w-full py-3.5 bg-[var(--pf-orange)] text-white font-bold rounded-xl hover:bg-[var(--pf-orange-dark)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating your page...
                </>
              ) : (
                <>
                  Go Live
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-[var(--pf-text-muted)] mt-6">
            By continuing, you agree to Porterful&apos;s{" "}
            <Link href="/terms" className="text-[var(--pf-orange)] hover:underline">Terms</Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-[var(--pf-orange)] hover:underline">Privacy Policy</Link>
          </p>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 border-t border-[var(--pf-border)]" />
            <span className="text-xs text-[var(--pf-text-muted)]">or</span>
            <div className="flex-1 border-t border-[var(--pf-border)]" />
          </div>

          {/* Full application link */}
          <Link
            href="/apply"
            className="block w-full py-3 text-center text-sm text-[var(--pf-text-secondary)] hover:text-[var(--pf-orange)] transition-colors"
          >
            Want a complete artist page? Apply with full details →
          </Link>
        </div>
      </div>
    )
  }

  // Step 2: Success — page is live
  if (step === 2) {
    return (
      <div className="min-h-screen bg-[var(--pf-bg)] flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          {/* Success icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>

          <h1 className="text-3xl font-bold mb-3">Your page is live.</h1>
          <p className="text-[var(--pf-text-secondary)] mb-8">
            Your artist page is ready. Complete your profile to unlock payouts and add products.
          </p>

          {/* Page link */}
          <div className="bg-[var(--pf-surface)] rounded-2xl border border-[var(--pf-border)] p-5 mb-6">
            <p className="text-xs text-[var(--pf-text-muted)] uppercase tracking-wider mb-2">Your page URL</p>
            <p className="font-mono text-[var(--pf-orange)] font-medium">
              porterful.com/artist/{createdSlug}
            </p>
          </div>

          {/* Early signal */}
          <div className="mb-4 px-4 py-2 bg-purple-500/10 rounded-lg border border-purple-500/20 inline-block mx-auto">
            <p className="text-xs text-purple-400 font-medium">🌱 You're early — your network is waiting to be built</p>
          </div>

          {/* FIRST EARNING BLOCK */}
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl border border-green-500/20 p-5 mb-5 text-left">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-lg">🎉</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm mb-1">Your page is live — here's what's next</h3>
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center">
                      <span className="text-green-400 text-xs">✓</span>
                    </div>
                    <p className="text-xs text-[var(--pf-text-secondary)]">Your page is public and ready to be shared</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center">
                      <span className="text-green-400 text-xs">✓</span>
                    </div>
                    <p className="text-xs text-[var(--pf-text-secondary)]">Platform products are already available on your page</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      <span className="text-yellow-400 text-xs">→</span>
                    </div>
                    <p className="text-xs text-[var(--pf-text-secondary)]">Complete your profile to unlock payouts</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/artist/${createdSlug}`
                      if (navigator.share) {
                        navigator.share({ title: 'Check out my music on Porterful', url: link })
                      } else {
                        navigator.clipboard.writeText(link)
                        alert('Link copied!')
                      }
                    }}
                    className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs font-medium rounded-lg transition-colors"
                  >
                    📤 Build Your Network
                  </button>
                  <span className="text-xs text-[var(--pf-text-muted)] self-center">— your link is ready</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href={`/artist/${createdSlug}`}
              className="w-full py-3.5 bg-[var(--pf-orange)] text-white font-bold rounded-xl hover:bg-[var(--pf-orange-dark)] transition-colors flex items-center justify-center gap-2"
            >
              View Your Page →
              <ArrowRight size={18} />
            </Link>

            <Link
              href="/dashboard"
              className="w-full py-3.5 bg-[var(--pf-surface)] border border-[var(--pf-border)] text-white font-medium rounded-xl hover:border-[var(--pf-orange)] transition-colors flex items-center justify-center gap-2"
            >
              Complete Profile → Unlock Payouts
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* Locked features note — encouraging rewrite */}
          <div className="mt-6 p-4 bg-[var(--pf-surface)] rounded-xl border border-[var(--pf-border)] text-center">
            <p className="text-sm text-[var(--pf-text-secondary)]">
              💡 <span className="text-white font-medium">Want to earn more?</span> Add products or connect Stripe to receive payments directly.
            </p>
            <p className="text-xs text-[var(--pf-text-muted)] mt-1">
              Your page earns a share of all platform merch sales automatically.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return null
}
