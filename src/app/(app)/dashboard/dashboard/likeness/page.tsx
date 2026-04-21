'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CheckCircle, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react'

interface LikenessStatus {
  verified: boolean
  likeness_id?: string
}

const NAV = [
  { label: 'My Vault', href: '/dashboard' },
  { label: 'Social', href: '/dashboard/likeness' },
  { label: 'Access', href: '/dashboard/access' },
]

export default function SocialPage() {
  const pathname = usePathname()
  const [status, setStatus] = useState<LikenessStatus | null>(null)
  const [likenessIdInput, setLikenessIdInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [linking, setLinking] = useState(false)
  const [linkResult, setLinkResult] = useState<{ ok: boolean; message: string } | null>(null)

  useEffect(() => { fetchStatus() }, [])

  const fetchStatus = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/likeness/status')
      const data = await res.json()
      setStatus(data)
      if (data.likeness_id) setLikenessIdInput(data.likeness_id)
    } catch {
      setStatus({ verified: false })
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
        setLinkResult({ ok: true, message: 'Linked.' })
        await fetchStatus()
      } else {
        setLinkResult({
          ok: false,
          message: data.message || 'Could not verify. Register at LikenessVerified.com first.',
        })
      }
    } catch {
      setLinkResult({ ok: false, message: 'Something went wrong.' })
    }
    setLinking(false)
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-3xl mx-auto px-6">

        {/* Tab Nav */}
        <nav className="flex gap-1 mb-8 border-b border-[var(--pf-border)]">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                pathname === n.href
                  ? 'border-[var(--pf-orange)] text-[var(--pf-text)]'
                  : 'border-transparent text-[var(--pf-text-muted)] hover:text-[var(--pf-text)]'
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <h1 className="text-xl font-bold mb-6">Social Accounts</h1>

        {loading ? (
          <div className="flex justify-center py-16">
            <RefreshCw size={22} className="animate-spin text-[var(--pf-text-muted)]" />
          </div>
        ) : status?.verified ? (

          /* Active — verified account row */
          <div className="space-y-3">
            <div className="flex items-center justify-between border border-[var(--pf-border)] rounded-xl p-4">
              <div className="flex items-center gap-3">
                <CheckCircle size={18} className="text-green-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">LikenessVerified</p>
                  <p className="text-xs font-mono text-[var(--pf-text-muted)]">{status.likeness_id}</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-green-400 bg-green-400/10 px-2.5 py-1 rounded-full">
                Verified
              </span>
            </div>
            <button
              onClick={handleSync}
              className="flex items-center gap-1.5 text-xs text-[var(--pf-text-muted)] hover:text-[var(--pf-text)] transition-colors"
            >
              <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

        ) : (

          /* Empty — no verified accounts */
          <div className="border border-[var(--pf-border)] rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <AlertCircle size={18} className="text-[var(--pf-text-muted)] shrink-0" />
              <p className="text-sm font-medium">No verified accounts yet</p>
            </div>

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
                className="w-full py-2.5 bg-[var(--pf-orange)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--pf-orange-dark)] transition-colors disabled:opacity-50"
              >
                {linking ? 'Linking...' : 'Add Account'}
              </button>
            </form>

            <div className="flex items-center justify-between pt-1">
              <Link
                href="https://likenessverified.com/register"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[var(--pf-text-muted)] hover:text-[var(--pf-text)] transition-colors"
              >
                Register at LikenessVerified.com
                <ExternalLink size={11} />
              </Link>
              <button
                onClick={handleSync}
                className="flex items-center gap-1 text-xs text-[var(--pf-text-muted)] hover:text-[var(--pf-text)] transition-colors"
              >
                <RefreshCw size={11} className={syncing ? 'animate-spin' : ''} />
                Check status
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
