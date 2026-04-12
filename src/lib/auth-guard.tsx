/**
 * Auth Guard for Client Components
 * Redirects to login if no session is present
 * 
 * Usage:
 *   import { useAuthGuard } from '@/lib/auth-guard'
 *   const { userId, isLoading } = useAuthGuard()
 *   if (isLoading) return <LoadingSpinner />
 *   if (!userId) return null // Already redirected
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/app/providers'

interface AuthGuardResult {
  userId: string | null
  isLoading: boolean
  profile: any
}

export function useAuthGuard(requireAuth = true): AuthGuardResult {
  const { user, supabase, loading } = useSupabase()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [localLoading, setLocalLoading] = useState(true)

  useEffect(() => {
    if (loading) return

    if (requireAuth && !user) {
      router.push('/login')
      return
    }

    if (user && supabase) {
      // Fetch profile
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data }: { data: unknown }) => {
          setProfile(data)
          setLocalLoading(false)
        })
    } else {
      setLocalLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, supabase])

  return {
    userId: user?.id ?? null,
    isLoading: loading || localLoading,
    profile,
  }
}

/**
 * Higher-order component wrapper for page-level auth
 * Use at the top of dashboard pages
 * 
 * Usage:
 *   export default withAuth(DashboardPage)
 */
export function withAuth<P extends Record<string, unknown>>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: Omit<P, 'userId' | 'profile'>) {
    const { userId, isLoading, profile } = useAuthGuard()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
      setMounted(true)
    }, [])

    if (!mounted || isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--pf-bg)' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: 'var(--pf-orange)' }} />
        </div>
      )
    }

    if (!userId) {
      return null // Redirecting
    }

    return <Component {...props as P} userId={userId} profile={profile} />
  }
}
