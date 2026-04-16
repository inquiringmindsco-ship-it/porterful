import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerSupabaseClient } from '@/lib/supabase-auth'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const response = NextResponse.json({
      success: true,
      user: null,
      role: 'supporter',
      redirectTo: '/dashboard',
    })
    const supabase = createRouteHandlerSupabaseClient(cookieStore, response)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    if (!data.user) {
      return NextResponse.json({ error: 'Login failed' }, { status: 401 })
    }

    // Get user profile to check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    response.headers.set('content-type', 'application/json')
    response.headers.delete('content-length')
    response.body?.cancel()

    return NextResponse.json({
      success: true,
      user: data.user,
      role: profile?.role || 'supporter',
      redirectTo: '/dashboard',
    }, {
      headers: response.headers,
    })
  } catch (err: any) {
    console.error('Login error:', err)
    return NextResponse.json({ error: err.message || 'Login failed' }, { status: 500 })
  }
}
