'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FaGoogle } from 'react-icons/fa'
import { createBrowserClient } from '@supabase/ssr'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Use @supabase/ssr with cookie adapter — stores PKCE verifier in cookies
  // so the callback (server-side) can access it for code exchange
  const getSupabaseClient = () => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to sign in')
        setLoading(false)
        return
      }

      if (data.role === 'artist') {
        router.push('/dashboard/artist')
      } else {
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthSignIn = async () => {
    const supabase = getSupabaseClient()

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // PKCE code verifier is stored in cookies via SSR adapter
        // so the server-side callback can find it
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-[var(--pf-text-secondary)]">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--pf-orange)]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--pf-orange)]"
              placeholder="Your password"
            />
          </div>

          <div className="flex items-center justify-end text-sm">
            <Link href="/forgot-password" className="text-[var(--pf-orange)] hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full pf-btn pf-btn-primary py-4 text-lg"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--pf-border)]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[var(--pf-bg)] text-[var(--pf-text-muted)]">or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOAuthSignIn}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-lg border border-[var(--pf-border)] hover:border-[var(--pf-orange)] transition-colors bg-[var(--pf-surface)]"
          >
            <FaGoogle className="text-xl" />
            <span className="font-medium">Continue with Google</span>
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--pf-border)]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[var(--pf-bg)] text-[var(--pf-text-muted)]">or sign in without a password</span>
            </div>
          </div>

          <button
            type="button"
            onClick={async () => {
              if (!email) {
                setError('Enter your email first, then click Magic Link')
                return
              }
              setLoading(true)
              setError('')
              const supabase = getSupabaseClient()
              const { error } = await supabase.auth.signInWithOtp({
                email,
                options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
              })
              if (error) {
                setError(error.message)
              } else {
                setSuccess(true)
              }
              setLoading(false)
            }}
            className="w-full py-4 rounded-lg border border-[var(--pf-orange)]/50 hover:border-[var(--pf-orange)] transition-colors text-[var(--pf-orange)] font-medium"
          >
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>

          {success && (
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
              Magic link sent! Check your email inbox.
            </div>
          )}
        </form>

        <div className="text-center text-sm text-[var(--pf-text-muted)] mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-[var(--pf-orange)] hover:underline">
            Create one
          </Link>
        </div>

        <div className="mt-8 pt-8 border-t border-[var(--pf-border)]">
          <p className="text-center text-sm text-[var(--pf-text-muted)] mb-4">
            See what Porterful can do
          </p>
          <Link
            href="/demo"
            className="block w-full py-3 text-center border border-[var(--pf-border)] rounded-lg font-medium hover:border-[var(--pf-orange)] transition-colors"
          >
            View Demo Tours
          </Link>
        </div>
      </div>
    </div>
  )
}