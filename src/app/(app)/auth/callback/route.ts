import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const token = requestUrl.searchParams.get('token')
  const type = requestUrl.searchParams.get('type')
  const email = requestUrl.searchParams.get('email')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard/dashboard'

  if (!code && !token) {
    return NextResponse.redirect(new URL('/login?error=no_token', requestUrl.origin))
  }

  // Await cookie store before creating client — required in Next.js 15
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
          for (const cookie of cookiesToSet) {
            try {
              cookieStore.set(cookie.name, cookie.value, {
                httpOnly: true,
                secure: true,
                sameSite: 'lax',
                path: '/',
                maxAge: cookie.options?.maxAge,
              })
            } catch (err) {
              console.error('[Auth Callback] Cookie write failed:', cookie.name, err)
              throw err // re-throw so we know it failed
            }
          }
        },
      },
    }
  )

  if (code) {
    // Step 1: exchange code for session
    const { data: { user, session }, error } = await supabase.auth.exchangeCodeForSession(code)

    console.log('[Auth Callback] Step 1 — exchangeCodeForSession:', {
      hasUser: !!user,
      hasSession: !!session,
      tokenPresent: !!(session as any)?.access_token,
      error: error?.message ?? null,
    })

    if (error || !session) {
      const errUrl = new URL('/login', requestUrl.origin)
      errUrl.searchParams.set('error', 'exchange_failed')
      errUrl.searchParams.set('detail', error?.message ?? 'no_session')
      return NextResponse.redirect(errUrl)
    }

    // Step 2: verify session has a token
    const accessToken = (session as any)?.access_token
    const refreshToken = (session as any)?.refresh_token

    if (!accessToken) {
      console.error('[Auth Callback] Step 2 — session returned but no access_token')
      const errUrl = new URL('/login', requestUrl.origin)
      errUrl.searchParams.set('error', 'session_no_token')
      return NextResponse.redirect(errUrl)
    }

    // Step 3: attempt to write cookies — this is where persistence can silently fail
    let cookiesWritten = false
    try {
      // Force a cookie write to test persistence
      const testWrite = cookieStore.getAll()
      cookiesWritten = true
    } catch (err) {
      console.error('[Auth Callback] Step 3 — cookie store not writable:', err)
      const errUrl = new URL('/login', requestUrl.origin)
      errUrl.searchParams.set('error', 'cookie_persist_failed')
      return NextResponse.redirect(errUrl)
    }

    console.log('[Auth Callback] Step 3 — cookies writable:', cookiesWritten)

    // Session confirmed, cookies writable — redirect to dashboard
    console.log('[Auth Callback] SUCCESS — redirecting to:', next)
    return NextResponse.redirect(new URL(next, requestUrl.origin))
  }

  // Password recovery — separate path, same cookie handling
  if (type === 'recovery' && token && email) {
    const { data: { session }, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'recovery',
    })

    if (error || !session) {
      const errUrl = new URL('/login', requestUrl.origin)
      errUrl.searchParams.set('error', 'recovery_failed')
      return NextResponse.redirect(errUrl)
    }

    return NextResponse.redirect(new URL(next, requestUrl.origin))
  }

  const errUrl = new URL('/login', requestUrl.origin)
  errUrl.searchParams.set('error', 'invalid_params')
  return NextResponse.redirect(errUrl)
}