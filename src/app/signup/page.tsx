'use client'

import { useState } from 'react'
import { useSupabase } from '@/app/providers'
import { useRouter } from 'next/navigation'
import { Music, Store, Building2, Star } from 'lucide-react'
import { FaGoogle, FaFacebook, FaApple } from 'react-icons/fa'

export default function SignupPage() {
  const { supabase } = useSupabase()
  const router = useRouter()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('supporter')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!supabase) {
        setError('Database not configured. Please run the SQL setup first.')
        setLoading(false)
        return
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (signUpError) {
        // Handle Supabase email rate limit errors with friendly message
        if (signUpError.message.includes('rate limit') || signUpError.message.includes('Email rate limit')) {
          setError('Too many signup attempts right now. Please wait a few minutes and try again, or contact support if you need help.')
        } else {
          setError(signUpError.message)
        }
        return
      }

      if (data.user) {
        // Create profile
        await supabase.from('profiles').insert({
          id: data.user.id,
          email: email,
          full_name: name,
          role: role,
          referral_code: 'PF-' + Math.random().toString(36).substr(2, 8).toUpperCase()
        })
        
        setSuccess(true)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: 'google' | 'facebook' | 'apple') => {
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

  if (success) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <div className="pf-card p-8 max-w-md mx-auto text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
            <span className="text-3xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Check Your Email</h1>
          <p className="text-[var(--pf-text-secondary)] mb-6">
            We sent a confirmation link to <strong>{email}</strong>
          </p>
          <p className="text-sm text-[var(--pf-text-muted)]">
            Click the link to verify your account, then you can log in.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="pf-container max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-[var(--pf-text-secondary)]">Join the artist economy</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--pf-orange)]"
              placeholder="Your name"
            />
          </div>

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
              minLength={6}
              className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--pf-orange)]"
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">I am a...</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'supporter', icon: Star, label: 'Fan' },
                { value: 'artist', icon: Music, label: 'Artist' },
                { value: 'business', icon: Store, label: 'Business' },
                { value: 'brand', icon: Building2, label: 'Brand' },
              ].map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    role === r.value
                      ? 'border-[var(--pf-orange)] bg-[var(--pf-orange)]/10'
                      : 'border-[var(--pf-border)] hover:border-[var(--pf-border-hover)]'
                  }`}
                >
                  <r.icon className="mx-auto mb-1" size={20} />
                  <span className="text-sm">{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full pf-btn pf-btn-primary py-4"
          >
            {loading ? 'Creating account...' : 'Create Account'}
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

          <p className="text-center text-sm text-[var(--pf-text-muted)]">
            Already have an account?{' '}
            <a href="/login" className="text-[var(--pf-orange)] hover:underline">Sign in</a>
          </p>
        </form>
      </div>
    </div>
  )
}