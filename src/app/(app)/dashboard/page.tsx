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
    // If the profile cannot be prepared, fail closed back to login instead of
    // serving a broken dashboard state.
    redirect('/login?error=profile_create_failed')
  }

  let profile = ensuredProfile

  const elevatedRoles = new Set(['artist', 'admin', 'founder'])

  if (inferredRole === 'artist' && !elevatedRoles.has(profile.role)) {
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

  // Check for first-time artist: if they have 0 tracks, send them straight to upload
  if (profile?.role === 'artist') {
    const { count: trackCount } = await adminSb
      .from('tracks')
      .select('id', { count: 'exact', head: true })
      .eq('artist_id', user.id)
    if (!trackCount || trackCount === 0) {
      redirect('/dashboard/upload')
    }
    redirect('/dashboard/artist')
  }

  return (
    <PorterfulDashboard
      serverProfileId={user.id}
      initialProfile={profile}
    />
  )
}
