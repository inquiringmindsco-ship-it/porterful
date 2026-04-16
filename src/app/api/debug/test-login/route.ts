/**
 * Debug endpoint: Create a session cookie for testing.
 * ONLY available when NEXT_PUBLIC_APP_URL is localhost.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const origin = request.nextUrl.origin
  
  if (!origin.includes('localhost') && !origin.includes('127.0.0.1')) {
    return NextResponse.json({ error: 'Not allowed' }, { status: 403 })
  }

  const { email, password } = await request.json()
  if (!email || !password) {
    return NextResponse.json({ error: 'email and password required' }, { status: 400 })
  }

  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
  
  const { data: sessionData, error: signInError } = await anonClient.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError || !sessionData?.session) {
    return NextResponse.json({ error: 'Sign in failed: ' + signInError?.message }, { status: 401 })
  }

  const session = sessionData.session

  // Build redirect response
  const response = NextResponse.redirect(new URL('/dashboard', origin), 307)

  // Cookie options:
  // httpOnly: false — so NextRequest middleware can read them
  // secure: matches env
  const isSecure = process.env.NODE_ENV === 'production'
  const cookieOpts = {
    maxAge: session.expires_in || 3600,
    path: '/',
    sameSite: 'lax' as const,
    secure: isSecure,
    httpOnly: false,
  }

  // Set the raw tokens as cookies.
  // createServerClient stores access_token as 'sb-access-token' and refresh_token as 'sb-refresh-token'.
  // We use the same names so middleware getSession() can find them.
  response.cookies.set('sb-access-token', session.access_token, cookieOpts)
  response.cookies.set('sb-refresh-token', session.refresh_token, cookieOpts)

  // Debug log
  const cookiesSet = response.cookies.getAll()
  console.log('[debug-login] cookies set:', cookiesSet.map(c => c.name).join(', '))
  console.log('[debug-login] redirect to:', '/dashboard')

  return response
}