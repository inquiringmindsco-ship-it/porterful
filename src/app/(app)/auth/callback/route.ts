import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  createRouteHandlerSupabaseClient,
  getSafeAuthRedirectPath,
} from '@/lib/supabase-auth'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const token = requestUrl.searchParams.get('token')
  const type = requestUrl.searchParams.get('type')
  const email = requestUrl.searchParams.get('email')
  const next = getSafeAuthRedirectPath(requestUrl.searchParams.get('next'))

  if (!code && !token) {
    return NextResponse.redirect(new URL('/login?error=no_token', requestUrl.origin))
  }

  const cookieStore = await cookies()

  if (code) {
    const response = NextResponse.redirect(new URL(next, requestUrl.origin))
    const supabase = createRouteHandlerSupabaseClient(cookieStore, response)
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error || !session) {
      const errUrl = new URL('/login', requestUrl.origin)
      errUrl.searchParams.set('error', 'exchange_failed')
      errUrl.searchParams.set('detail', error?.message ?? 'no_session')
      return NextResponse.redirect(errUrl)
    }

    return response
  }

  if (type === 'recovery' && token && email) {
    const response = NextResponse.redirect(new URL(next, requestUrl.origin))
    const supabase = createRouteHandlerSupabaseClient(cookieStore, response)
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

    return response
  }

  const errUrl = new URL('/login', requestUrl.origin)
  errUrl.searchParams.set('error', 'invalid_params')
  return NextResponse.redirect(errUrl)
}
