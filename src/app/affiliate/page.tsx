'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Link2 } from 'lucide-react'

export default function AffiliatePage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    link_url: string
    link_id: string
    already_exists?: boolean
  } | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/affiliate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong')
        return
      }

      setResult(data)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyLink = () => {
    if (result?.link_url) {
      navigator.clipboard.writeText(result.link_url)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--pf-bg)' }}>
      <div className="w-full max-w-md text-center">
        {!result ? (
          <>
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--pf-fg)' }}>
              Start Selling
            </h1>
            <p className="mb-8" style={{ color: 'var(--pf-muted)' }}>
              Enter your email to get a link. Share it — when someone buys through your link, you earn.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg text-center text-lg"
                style={{
                  background: 'var(--pf-surface)',
                  border: '1px solid var(--pf-border)',
                  color: 'var(--pf-fg)',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full text-lg py-3 rounded-lg font-medium transition-opacity disabled:opacity-50"
                style={{
                  background: 'var(--pf-accent)',
                  color: 'var(--pf-bg)',
                }}
              >
                {loading ? 'Creating your link...' : 'Get My Link'}
              </button>
            </form>

            {error && (
              <p className="mt-4 text-red-500">{error}</p>
            )}
          </>
        ) : (
          <>
            <div className="flex justify-center mb-4 text-[var(--pf-orange)]">
              <Link2 className="h-12 w-12" />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--pf-fg)' }}>
              Your Link is Ready
            </h2>
            <p className="mb-6" style={{ color: 'var(--pf-muted)' }}>
              Share this link — when someone buys, you earn.
            </p>

            <div
              className="p-4 rounded-lg mb-4 text-lg font-mono break-all"
              style={{
                background: 'var(--pf-surface)',
                border: '1px solid var(--pf-border)',
                color: 'var(--pf-fg)',
              }}
            >
              {result.link_url}
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={copyLink}
                className="flex-1 py-3 rounded-lg font-medium transition-opacity"
                style={{
                  background: 'var(--pf-accent)',
                  color: 'var(--pf-bg)',
                }}
              >
                Copy Link
              </button>
              <button
                onClick={() => router.push('/')}
                className="flex-1 py-3 rounded-lg font-medium transition-opacity"
                style={{
                  border: '1px solid var(--pf-border)',
                  color: 'var(--pf-fg)',
                }}
              >
                Browse Porterful
              </button>
            </div>

            <p className="mt-6 text-sm" style={{ color: 'var(--pf-muted)' }}>
              We’ll email you details when you make your first sale.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
