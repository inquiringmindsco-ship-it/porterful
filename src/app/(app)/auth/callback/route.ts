import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Unified auth callback handler for both magic links and password resets
// Magic link: /auth/callback?code=xxx
// Password reset: /auth/callback?token=xxx&type=recovery&email=xxx

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const token = requestUrl.searchParams.get('token')
  const type = requestUrl.searchParams.get('type')
  const email = requestUrl.searchParams.get('email')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard/dashboard'

  // Log all incoming params for debugging
  console.log('[Auth Callback] Request URL:', requestUrl.toString())
  console.log('[Auth Callback] Params:', { code: !!code, token: !!token, type, email, next })

  if (!code && !token) {
    console.error('[Auth Callback] No code or token — redirecting to login')
    const loginUrl = new URL('/login', requestUrl.origin)
    loginUrl.searchParams.set('error', 'invalid_link')
    return NextResponse.redirect(loginUrl)
  }

  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  // Handle magic link code exchange
  if (code) {
    console.log('[Auth Callback] Received code, exchanging for session...')
    const { data: { user, session }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    console.log('[Auth Callback] Exchange result:', { 
      hasUser: !!user, 
      hasSession: !!session, 
      error: error?.message,
      userEmail: user?.email 
    })
    console.log('[Auth Callback] Session cookies set:', session ? 'yes' : 'no')
    
    if (error) {
      console.error('Magic link exchange error:', error.message)
      const loginUrl = new URL('/login', requestUrl.origin)
      loginUrl.searchParams.set('error', 'link_expired')
      return NextResponse.redirect(loginUrl)
    }

    if (user) {
      console.log('Magic link session created for:', user.email)
    }
    
    const redirectTo = new URL(next, requestUrl.origin)
    console.log('[Auth Callback] Redirecting to:', redirectTo.toString())
    return NextResponse.redirect(redirectTo)
  }

  // Handle password recovery token
  // Supabase sends: /auth/callback?token=xxx&type=recovery&email=xxx
  if (type === 'recovery' && token && email) {
    // Verify the recovery token and create a session
    const { data: { user, session }, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'recovery',
    })

    if (error || !session) {
      console.error('Recovery token error:', error?.message)
      const loginUrl = new URL('/login', requestUrl.origin)
      loginUrl.searchParams.set('error', 'reset_expired')
      return NextResponse.redirect(loginUrl)
    }

    // Session is now established from the OTP exchange
    // User should be redirected to set new password — but that requires the client to call updateUser
    // For a simple redirect-to-dashboard flow (auto-reset), redirect to dashboard
    // Alternatively redirect to a dedicated password-set page if you want them to choose a new password
    console.log('Password reset session established for:', user?.email)
    return NextResponse.redirect(new URL(next, requestUrl.origin))
  }

  // No recognized auth token
  console.error('Auth callback: no recognized token type', { code: !!code, token: !!token, type })
  const loginUrl = new URL('/login', requestUrl.origin)
  loginUrl.searchParams.set('error', 'invalid_link')
  return NextResponse.redirect(loginUrl)
}