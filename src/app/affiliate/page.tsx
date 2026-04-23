'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-center text-lg py-6"
                style={{
                  background: 'var(--pf-surface)',
                  borderColor: 'var(--pf-border)',
                  color: 'var(--pf-fg)',
                }}
              />
              <Button
                type="submit"
                disabled={loading}
                className="w-full text-lg py-6"
                style={{
                  background: 'var(--pf-accent)',
                  color: 'var(--pf-bg)',
                }}
              >
                {loading ? 'Creating your link...' : 'Get My Link'}
              </Button>
            </form>

            {error && (
              <p className="mt-4 text-red-500">{error}</p>
            )}
          </>
        ) : (
          <>
            <div className="text-4xl mb-4">🔗</div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--pf-fg)' }}>
              {result.already_exists ? 'Your Link is Ready' : 'Your Link is Ready'}
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
              <Button
                onClick={copyLink}
                className="flex-1"
                style={{
                  background: 'var(--pf-accent)',
                  color: 'var(--pf-bg)',
                }}
              >
                Copy Link
              </Button>
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="flex-1"
                style={{
                  borderColor: 'var(--pf-border)',
                  color: 'var(--pf-fg)',
                }}
              >
                Browse Porterful
              </Button>
            </div>

            <p className="mt-6 text-sm" style={{ color: 'var(--pf-muted)' }}>
              We&apos;ll email you details when you make your first sale.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
