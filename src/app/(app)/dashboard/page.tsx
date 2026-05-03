import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerComponentSupabaseClient } from '@/lib/supabase-auth'
import { createServerClient } from '@/lib/supabase'
import { ensureProfile } from '@/lib/server/ensure-profile'
import PorterfulDashboard from './PorterfulDashboard'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardRoot() {
  const cookieStore = await cookies()
  const supabase = createServerComponentSupabaseClient(cookieStore)

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  const inferredRole = user.user_metadata?.role === 'artist' ? 'artist' : 'supporter'

  const adminSb = createServerClient()
  const { profile: ensuredProfile, error: ensureError } = await ensureProfile(adminSb, user)

  if (ensureError || !ensuredProfile) {
    // If the profile cannot be prepared, fail closed into setup instead of
    // serving a broken dashboard state.
    redirect('/signup?setup=1')
  }

  let profile = ensuredProfile

  if (inferredRole === 'artist' && profile.role !== 'artist') {
    const { data: normalizedProfile } = await adminSb
      .from('profiles')
      .update({ role: 'artist' })
      .eq('id', user.id)
      .select('*')
      .single()

    if (normalizedProfile) {
      profile = normalizedProfile
    }
  }

  // Role-aware redirect: artists to their specific dashboard
  if (profile?.role === 'artist') {
    redirect('/dashboard/artist')
  }

  return (
    <PorterfulDashboard
      serverProfileId={user.id}
      initialProfile={profile}
    />
  )
}
