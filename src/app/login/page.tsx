'use client'

import { useState } from 'react'
import { useSupabase } from '@/app/providers'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FaGoogle, FaApple } from 'react-icons/fa'

export default function LoginPage() {
  const { supabase } = useSupabase()
  const router = useRouter()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [resetSent, setResetSent] = useState(false)

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
        // Provide friendlier messages for common errors
        if (loginError.message.includes('Invalid login credentials')) {
          setError('Incorrect email or password. Please try again.')
        } else if (loginError.message.includes('Email not confirmed')) {
          setError('Please verify your email first. Check your inbox for a confirmation link.')
        } else {
          setError(loginError.message)
        }
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

  const handleResetPassword = async () => {
    if (!email) {
      setError('Enter your email address first, then click "Forgot password?"')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      })
      if (error) {
        setError(error.message)
      } else {
        setResetSent(true)
      }
    } catch {
      setError('Failed to send reset email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: 'google' | 'apple') => {
    setLoading(true)
    setError('')
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) {
        setError(error.message)
        setLoading(false)
      }
    } catch (err: any) {
      setError(err.message || 'OAuth failed')
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

        {resetSent && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400">
            <p className="font-medium">Password reset email sent!</p>
            <p className="text-sm mt-1">Check your inbox for a link to reset your password.</p>
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
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-[var(--pf-orange)]"
                placeholder="Your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--pf-text-muted)] hover:text-[var(--pf-text)]"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleResetPassword}
              disabled={loading || resetSent}
              className="text-sm text-[var(--pf-orange)] hover:underline disabled:opacity-50"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full pf-btn pf-btn-primary py-4"
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

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleOAuthSignIn('google')}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-[var(--pf-border)] hover:border-[var(--pf-border-hover)] transition-colors bg-[var(--pf-bg)]"
            >
              <FaGoogle className="text-lg" />
              <span className="text-sm font-medium">Google</span>
            </button>
            <button
              type="button"
              onClick={() => handleOAuthSignIn('apple')}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-[var(--pf-border)] hover:border-[var(--pf-border-hover)] transition-colors bg-[var(--pf-bg)]"
            >
              <FaApple className="text-lg" />
              <span className="text-sm font-medium">Apple</span>
            </button>
          </div>

          <div className="text-center text-sm text-[var(--pf-text-muted)]">
            Don't have an account?{' '}
            <Link href="/signup" className="text-[var(--pf-orange)] hover:underline">
              Create one
            </Link>
          </div>
          
          <div className="text-center text-sm">
            <a href="/signup?role=artist" className="text-[var(--pf-text-secondary)] hover:text-[var(--pf-orange)]">
              Artist signup →
            </a>
            <span className="mx-2 text-[var(--pf-border)]">|</span>
            <a href="/signup/superfan" className="text-[var(--pf-text-secondary)] hover:text-[var(--pf-orange)]">
              Become a Superfan →
            </a>
          </div>
        </form>


      </div>
    </div>
  )
}