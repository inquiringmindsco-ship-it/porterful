'use client'

import { useState } from 'react'
import { useSupabase } from '@/app/providers'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const { supabase } = useSupabase()
  const router = useRouter()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!supabase) {
        setError('Database not configured. Please check your environment variables.')
        setLoading(false)
        return
      }

      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (loginError) {
        setError(loginError.message)
        return
      }

      if (data.user) {
        // Get user role and redirect
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()

        // Redirect based on role
        if (profile?.role === 'artist') {
          router.push('/dashboard/artist')
        } else if (profile?.role === 'business') {
          router.push('/dashboard')
        } else if (profile?.role === 'brand') {
          router.push('/dashboard')
        } else {
          router.push('/dashboard')
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="pf-container max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-[var(--pf-text-secondary)]">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full pf-btn pf-btn-primary py-4"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="text-center text-sm text-[var(--pf-text-muted)]">
            Don't have an account?{' '}
            <Link href="/signup" className="text-[var(--pf-orange)] hover:underline">
              Create one
            </Link>
          </div>
        </form>

        <div className="mt-8 pt-8 border-t border-[var(--pf-border)]">
          <p className="text-center text-sm text-[var(--pf-text-muted)] mb-4">
            Demo Accounts (no database needed)
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full pf-btn pf-btn-secondary py-3"
          >
            Continue as Demo User
          </button>
        </div>
      </div>
    </div>
  )
}