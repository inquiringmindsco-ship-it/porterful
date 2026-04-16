import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerComponentSupabaseClient } from '@/lib/supabase-auth'
import DashboardClient from './DashboardClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Canonical dashboard — Supabase SSR session is the single auth authority
export default async function DashboardPage() {
  const cookieStore = await cookies()
  const supabase = createServerComponentSupabaseClient(cookieStore)

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  const profileId = user.id

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .limit(1)
    .single()

  if (!profile) {
    redirect('/login')
  }

  const lkId = (profile as any).lk_id || null

  return <DashboardClient serverProfileId={profileId} lkId={lkId} />
}