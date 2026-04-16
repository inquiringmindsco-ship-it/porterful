'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'

// This client component handles any fallback when the route handler doesn't execute.
// In practice, the route.ts (server route handler) handles all /auth/callback GET requests.
// This component is a safety net in case something reaches the client-side page.
export default function CallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const error = searchParams.get('error')
    if (error) {
      router.replace('/login?error=' + encodeURIComponent(error))
      return
    }
    const code = searchParams.get('code')
    if (!code) {
      router.replace('/login?error=no_code')
      return
    }
    // If we reach here with a code but the server didn't handle it,
    // redirect to login — the server route should handle the exchange.
    router.replace('/login')
  }, [searchParams])

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full text-center">
        <div className="text-5xl mb-6 animate-pulse">🔑</div>
        <h1 className="text-2xl font-bold mb-2">Signing you in…</h1>
        <p className="text-[var(--pf-text-secondary)]">
          Completing your sign-in — one moment.
        </p>
      </div>
    </div>
  )
}