'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, ArrowRight, Lock, ShieldCheck } from 'lucide-react'
import { useSupabase } from '@/app/providers'
import { normalizeActivationCode } from '@/lib/activation'

const PENDING_KEY = 'porterful_pending_activation_code'

type ActivationState = 'idle' | 'checking' | 'success' | 'needs_auth' | 'error'

export default function ActivatePage() {
  const { user, loading: authLoading } = useSupabase()
  const searchParams = useSearchParams()
  const router = useRouter()
  const autoAttempted = useRef(false)

  const initialCode = normalizeActivationCode(searchParams.get('code')) || ''
  const [code, setCode] = useState(initialCode)
  const [state, setState] = useState<ActivationState>('idle')
  const [message, setMessage] = useState('')
  const [detail, setDetail] = useState('')

  useEffect(() => {
    if (code) return
    const saved = typeof window !== 'undefined' ? normalizeActivationCode(window.localStorage.getItem(PENDING_KEY)) : null
    if (saved) {
      setCode(saved)
    }
  }, [code])

  useEffect(() => {
    if (authLoading || !user || !code || autoAttempted.current) return
    autoAttempted.current = true
    void submitCode(code)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, code])

  const buildReturnPath = (activationCode: string) => `/activate?code=${encodeURIComponent(activationCode)}`

  const handleAuthRedirect = (path: '/login' | '/signup') => {
    if (!code) return
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(PENDING_KEY, code)
    }
    router.push(`${path}?next=${encodeURIComponent(buildReturnPath(code))}`)
  }

  const submitCode = async (value: string) => {
    const normalized = normalizeActivationCode(value)
    if (!normalized) {
      setState('error')
      setMessage('Enter your activation code.')
      return
    }

    setState('checking')
    setMessage('')
    setDetail('')

    try {
      const res = await fetch('/api/activation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code: normalized }),
      })

      const data = await res.json().catch(() => ({}))

      if (res.ok && data.success) {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(PENDING_KEY)
        }
        setState('success')
        setMessage(data.message || 'Your signal has been activated.')
        setDetail(data.requiresAuth ? 'Sign in or create an account to attach this code to your profile.' : 'Your account is now marked as paid (cash).')
        if (!data.requiresAuth) {
          setTimeout(() => router.push('/dashboard'), 1200)
        }
        return
      }

      if (data.requiresCheckout) {
        setState('error')
        setMessage(data.error || 'Use this code at checkout.')
        setDetail('This code is a checkout discount, not an activation code.')
        return
      }

      if (data.requiresAuth) {
        setState('needs_auth')
        setMessage(data.message || 'Sign in to attach this code to your account.')
        setDetail('If you just created your account, come back here after sign in and the code will activate.')
        return
      }

      setState('error')
      setMessage(data.error || 'This code could not be activated.')
      setDetail('')
    } catch {
      setState('error')
      setMessage('Network error. Please try again.')
      setDetail('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    autoAttempted.current = true
    await submitCode(code)
  }

  return (
    <main className="min-h-screen bg-[var(--pf-bg)] pt-24 pb-12">
      <div className="pf-container max-w-xl">
        <div className="mx-auto rounded-3xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-6 md:p-8 shadow-2xl shadow-black/20">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--pf-orange)]">
            Activate
          </p>
          <h1 className="mt-2 text-3xl font-bold leading-tight">
            Activate your signal
          </h1>
          <p className="mt-3 max-w-2xl text-base text-[var(--pf-text-secondary)]">
            Enter your one-time code to connect a cash sale or approved activation to your Likeness™ account.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--pf-text-secondary)] mb-2">Activation code</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter code"
                className="w-full rounded-xl border border-[var(--pf-border)] bg-[var(--pf-bg)] px-4 py-3 text-[var(--pf-text)] placeholder:text-[var(--pf-text-muted)] focus:border-[var(--pf-orange)] focus:outline-none"
                autoComplete="one-time-code"
                inputMode="text"
              />
            </div>

            <button
              type="submit"
              disabled={state === 'checking' || !code.trim()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--pf-orange)] px-5 py-3.5 text-sm font-semibold text-[#111111] transition-colors hover:bg-[var(--pf-orange-light)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {state === 'checking' ? 'Checking…' : 'Activate'}
              <ArrowRight size={16} />
            </button>
          </form>

          {state === 'success' && (
            <div className="mt-6 rounded-2xl border border-green-500/30 bg-green-500/10 p-4">
              <p className="flex items-center gap-2 font-semibold text-green-400">
                <CheckCircle2 size={18} />
                Your signal has been activated.
              </p>
              {detail && <p className="mt-2 text-sm text-[var(--pf-text-secondary)]">{detail}</p>}
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Link href="/dashboard" className="pf-btn pf-btn-primary inline-flex items-center justify-center gap-2">
                  Go to Dashboard
                </Link>
                <Link href="/" className="pf-btn pf-btn-secondary inline-flex items-center justify-center gap-2">
                  Return Home
                </Link>
              </div>
            </div>
          )}

          {state === 'needs_auth' && (
            <div className="mt-6 rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-bg)] p-4">
              <p className="flex items-center gap-2 font-semibold text-[var(--pf-text)]">
                <Lock size={18} className="text-[var(--pf-orange)]" />
                {message}
              </p>
              {detail && <p className="mt-2 text-sm text-[var(--pf-text-secondary)]">{detail}</p>}
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={() => handleAuthRedirect('/login')} className="pf-btn pf-btn-primary inline-flex items-center justify-center gap-2">
                  Sign In
                </button>
                <button type="button" onClick={() => handleAuthRedirect('/signup')} className="pf-btn pf-btn-secondary inline-flex items-center justify-center gap-2">
                  Create Account
                </button>
              </div>
            </div>
          )}

          {state === 'error' && (
            <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
              <p className="font-semibold text-red-400">{message}</p>
              {detail && <p className="mt-2 text-sm text-[var(--pf-text-secondary)]">{detail}</p>}
            </div>
          )}

          <div className="mt-6 flex items-start gap-2 text-xs text-[var(--pf-text-muted)]">
            <ShieldCheck size={14} className="mt-0.5 shrink-0 text-[var(--pf-orange)]" />
            <p>
              Codes are single-use. Cash activations mark your account as paid (cash). Discount codes are handled at checkout.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
