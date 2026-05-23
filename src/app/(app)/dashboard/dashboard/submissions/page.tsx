import { redirect } from 'next/navigation'
import { getAuthenticatedClient } from '@/lib/auth-utils'
import SubmissionsClient from './SubmissionsClient'

export default async function SubmissionsPage() {
  const auth = await getAuthenticatedClient()
  if (!auth) {
    redirect('/login?returnTo=/dashboard/dashboard/submissions')
  }

  const { supabase, user } = auth

  // Require admin or founder role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!['admin', 'founder'].includes(profile?.role)) {
    redirect('/dashboard')
  }

  return <SubmissionsClient />
}
