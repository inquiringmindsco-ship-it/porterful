import { redirect } from 'next/navigation'
import { getServerUser } from '@/lib/supabase-auth'
import LoginClient from './LoginClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function getSafeNextPath(next: string | undefined) {
  if (!next || !next.startsWith('/') || next.startsWith('//')) {
    return '/dashboard'
  }

  return next
}

function getLoginError(error: string | undefined) {
  switch (error) {
    case 'no_code':
      return 'Sign-in could not be completed. Please try again.'
    case 'exchange_failed':
      return 'Your sign-in link expired or could not be verified.'
    case 'likeness_denied':
      return 'Likeness sign-in was denied.'
    case 'bridge_failed':
      return 'Likeness sign-in could not be completed.'
    case 'server_error':
      return 'Login is temporarily unavailable.'
    case 'profile_create_failed':
      return 'Your account could not be prepared. Please try again.'
    case 'exists':
      return null // Handled separately as success message
    default:
      return error ? 'Sign-in could not be completed.' : null
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: { return?: string; next?: string; error?: string; exists?: string; created?: string; verify?: string; email?: string }
}) {
  const nextPath = getSafeNextPath(searchParams?.return || searchParams?.next)
  const user = await getServerUser()

  if (user) {
    redirect(nextPath)
  }

  return <LoginClient 
    nextPath={nextPath} 
    initialError={getLoginError(searchParams?.error)}
    emailExists={searchParams?.exists === 'true'}
    accountCreated={searchParams?.created === 'true'}
    verificationRequired={searchParams?.verify === 'true'}
    prefillEmail={searchParams?.email || ''}
  />
}
