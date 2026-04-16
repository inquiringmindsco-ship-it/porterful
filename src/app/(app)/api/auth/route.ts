import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServerComponentSupabaseClient } from '@/lib/supabase-auth'

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerComponentSupabaseClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile with role
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return NextResponse.json({ user, profile })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get user' }, { status: 500 })
  }
}
