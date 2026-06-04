'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FaGoogle } from 'react-icons/fa'
import { useSupabase } from '@/app/providers'

interface LoginClientProps {
  nextPath: string
  initialError?: string | null
  emailExists?: boolean
  accountCreated?: boolean
  verificationRequired?: boolean
  prefillEmail?: string
}

export default function LoginClient({
  nextPath,
  initialError = null,
  emailExists = false,
  accountCreated = false,
  verificationRequired = false,
  prefillEmail = '',
}: LoginClientProps) {
  const router = useRouter()
  const { supabase, user } = useSupabase()
  const [email, setEmail] = useState(prefillEmail)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(initialError || '')
  const [success, setSuccess] = useState(emailExists || accountCreated || verificationRequired)

  useEffect(() => {
    if (user) {
      router.replace(nextPath)
    }
  }, [user, nextPath, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!supabase) {
        setError('SYSTEM_PROCESSING')
        return
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        const message = String((payload as { error?: string }).error || '').toLowerCase()
        if (message.includes('invalid') || message.includes('password') || message.includes('email')) {
          setError('Invalid email or password. Please try again.')
        } else if (message.includes('confirm') || message.includes('verify')) {
          setError('Please verify your email before signing in.')
        } else {
          setError('SYSTEM_PROCESSING')
        }
        setLoading(false)
        return
      }

      // Force a full document navigation so the server-rendered dashboard
      // sees the newly issued auth cookies immediately instead of relying on
      // a stale client-side auth snapshot.
      window.location.replace(nextPath)
    } catch (err: any) {
      setError('SYSTEM_PROCESSING')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthSignIn = async () => {
    if (!supabase) {
      setError('Login is temporarily unavailable.')
      return
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      },
    })
    if (error) setError(error.message)
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-[var(--pf-text-secondary)]">Sign in to your account</p>
        </div>

        {emailExists && (
          <div className="mb-6 p-4 rounded-lg bg-[var(--pf-orange)]/10 border border-[var(--pf-orange)]/30 text-[var(--pf-text)] text-sm">
            <p className="font-medium mb-1">This email already has an account.</p>
            <p>Sign in below to continue.</p>
          </div>
        )}

        {(accountCreated || verificationRequired) && (
          <div className="mb-6 p-4 rounded-lg bg-[var(--pf-orange)]/10 border border-[var(--pf-orange)]/30 text-[var(--pf-text)] text-sm">
            <p className="font-medium mb-1">Your account is ready.</p>
            <p>
              {verificationRequired
                ? 'Check your email if verification is required, then sign in to continue.'
                : 'Sign in below to continue.'}
            </p>
          </div>
        )}

        {error && error !== 'SYSTEM_PROCESSING' && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {error === 'SYSTEM_PROCESSING' && (
          <div className="mb-6 p-6 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-orange)]/30 text-center">
            <div className="w-12 h-12 rounded-full bg-[var(--pf-orange)]/20 flex items-center justify-center mx-auto mb-3">
              <svg className="animate-spin h-6 w-6 text-[var(--pf-orange)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">Processing your request...</h3>
            <p className="text-[var(--pf-text-secondary)] text-sm mb-3">
              We're experiencing a temporary delay. This may take a moment.
            </p>
            <p className="text-xs text-[var(--pf-text-muted)]">
              If this takes longer than 30 seconds, we'll reach out to you at <span className="text-[var(--pf-orange)]">{email}</span> to complete your setup.
            </p>
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
              if (!supabase) {
                setError('Login is temporarily unavailable.')
                setLoading(false)
                return
              }
              const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                  emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
                },
              })
              if (error) setError(error.message)
              else setSuccess(true)
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
          Don’t have an account?{' '}
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
            View Demo
          </Link>
        </div>
      </div>
    </div>
  )
}
