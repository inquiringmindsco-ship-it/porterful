import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import SubmissionsClient from './SubmissionsClient'

export default async function SubmissionsPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const supabase = createClient(url, key, {
    auth: { persistSession: false }
  })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login?returnTo=/dashboard/dashboard/submissions')
  }

  return <SubmissionsClient />
}
