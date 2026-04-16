'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShieldCheck, ExternalLink, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'

interface LikenessStatus {
  verified: boolean
  likeness_id?: string
  verified_at?: string
  source?: string
  reason?: string
  register_url?: string
}

export default function LikenessPage() {
  const [status, setStatus] = useState<LikenessStatus | null>(null)
  const [likenessIdInput, setLikenessIdInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [linking, setLinking] = useState(false)
  const [linkResult, setLinkResult] = useState<{ ok: boolean; message: string } | null>(null)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/likeness/status')
      const data = await res.json()
      setStatus(data)
      if (data.likeness_id) setLikenessIdInput(data.likeness_id)
    } catch {
      setStatus({ verified: false, reason: 'error' })
    }
    setLoading(false)
  }

  const handleSync = async () => {
    setSyncing(true)
    await fetchStatus()
    setSyncing(false)
  }

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!likenessIdInput.trim()) return
    setLinking(true)
    setLinkResult(null)
    try {
      const res = await fetch('/api/likeness/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ likeness_id: likenessIdInput.trim() }),
      })
      const data = await res.json()
      if (data.verified) {
        setLinkResult({ ok: true, message: 'Likeness ID linked successfully!' })
        await fetchStatus()
      } else {
        setLinkResult({ ok: false, message: data.message || 'Could not verify that Likeness ID. Make sure you registered at LikenessVerified.com first.' })
      }
    } catch {
      setLinkResult({ ok: false, message: 'Something went wrong. Try again.' })
    }
    setLinking(false)
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--pf-orange)]/10 flex items-center justify-center">
            <ShieldCheck size={22} className="text-[var(--pf-orange)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Likeness Verification</h1>
            <p className="text-sm text-[var(--pf-text-muted)]">Protect your identity and brand on Porterful</p>
          </div>
        </div>
        <button
          onClick={handleSync}
          className="p-2 rounded-lg hover:bg-[var(--pf-surface)] transition-colors"
          title="Refresh status"
        >
          <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw size={24} className="animate-spin text-[var(--pf-orange)]" />
        </div>
      ) : (
        <>
          {/* Status Card */}
          {status?.verified ? (
            <div className="mb-6 p-5 rounded-2xl bg-green-500/5 border border-green-500/20">
              <div className="flex items-start gap-3">
                <CheckCircle size={24} className="text-green-400 shrink-0 mt-0.5" />
                <div>
                  <h2 className="font-bold text-green-400 mb-1">Likeness Verified</h2>
                  <p className="text-sm text-[var(--pf-text-secondary)] mb-3">
                    Your likeness is registered and protected. You can sell music, products, and receive payouts on Porterful.
                  </p>
                  <div className="flex items-center gap-4 text-xs text-[var(--pf-text-muted)]">
                    <span>ID: <span className="font-mono text-[var(--pf-orange)]">{status.likeness_id}</span></span>
                    {status.verified_at && (
                      <span>Verified: {new Date(status.verified_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-5 rounded-2xl bg-[var(--pf-orange)]/5 border border-[var(--pf-orange)]/20">
              <div className="flex items-start gap-3">
                <AlertCircle size={24} className="text-[var(--pf-orange)] shrink-0 mt-0.5" />
                <div>
                  <h2 className="font-bold mb-1">Verification Required</h2>
                  <p className="text-sm text-[var(--pf-text-secondary)] mb-3">
                    You must verify your likeness before you can sell music, list products, or receive payouts on Porterful. This protects your identity and brand.
                  </p>
                  <Link
                    href="https://likenessverified.com/register"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--pf-orange)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--pf-orange-dark)] transition-colors"
                  >
                    Register at LikenessVerified.com
                    <ExternalLink size={14} />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Two-column layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Link Likeness ID */}
            <div className="p-5 rounded-2xl bg-[var(--pf-surface)] border border-[var(--pf-border)]">
              <h3 className="font-bold mb-1">Link Your Likeness ID</h3>
              <p className="text-xs text-[var(--pf-text-muted)] mb-4">
                Already have a Likeness ID from likenessverified.com? Enter it here to link your accounts.
              </p>
              <form onSubmit={handleLink} className="space-y-3">
                <input
                  type="text"
                  value={likenessIdInput}
                  onChange={(e) => setLikenessIdInput(e.target.value)}
                  placeholder="lk-XXXX-XXXX"
                  className="w-full px-3 py-2 bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg text-sm focus:outline-none focus:border-[var(--pf-orange)]"
                />
                {linkResult && (
                  <p className={`text-xs ${linkResult.ok ? 'text-green-400' : 'text-red-400'}`}>
                    {linkResult.message}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={linking || !likenessIdInput.trim()}
                  className="w-full py-2 bg-[var(--pf-orange)] text-white text-sm font-semibold rounded-lg hover:bg-[var(--pf-orange-dark)] transition-colors disabled:opacity-50"
                >
                  {linking ? 'Linking...' : 'Link Likeness ID'}
                </button>
              </form>
            </div>

            {/* Why Verify */}
            <div className="p-5 rounded-2xl bg-[var(--pf-surface)] border border-[var(--pf-border)]">
              <h3 className="font-bold mb-3">Why Verify?</h3>
              <ul className="space-y-2.5 text-sm text-[var(--pf-text-secondary)]">
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-400 shrink-0 mt-0.5" />
                  <span>Protect your name and brand from impersonation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-400 shrink-0 mt-0.5" />
                  <span>Required to receive payouts from music and product sales</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-400 shrink-0 mt-0.5" />
                  <span>Required to list products for sale on Porterful</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-400 shrink-0 mt-0.5" />
                  <span>Build trust with fans — your identity is verified</span>
                </li>
              </ul>
              <div className="mt-4 pt-4 border-t border-[var(--pf-border)]">
                <p className="text-xs text-[var(--pf-text-muted)]">
                  Free to verify · Takes about 60 seconds
                </p>
              </div>
            </div>
          </div>

          {/* Sync Status Button */}
          {!status?.verified && (
            <div className="mt-6 text-center">
              <button
                onClick={handleSync}
                className="text-sm text-[var(--pf-text-muted)] hover:text-[var(--pf-orange)] transition-colors"
              >
                I've registered — check my status again
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
