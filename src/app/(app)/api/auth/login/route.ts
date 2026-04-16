import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerSupabaseClient } from '@/lib/supabase-auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    // Build response — success redirect to /dashboard
    const response = NextResponse.redirect(new URL('/dashboard', request.nextUrl.origin), 307)

    // Pass request cookies (mutable, for reading) and response (for setting session cookies).
    // createRouteHandlerSupabaseClient reads existing cookies from request.cookies
    // and writes new session cookies (access_token, refresh_token) to response.cookies.
    const supabase = createRouteHandlerSupabaseClient(request.cookies, response)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.session) {
      return NextResponse.json({ error: error?.message || 'Login failed' }, { status: 401 })
    }

    // Session cookies are now on the response object.
    // The 307 redirect will carry them to the browser.
    return response
  } catch (err: any) {
    console.error('Login error:', err)
    return NextResponse.json({ error: err.message || 'Login failed' }, { status: 500 })
  }
}