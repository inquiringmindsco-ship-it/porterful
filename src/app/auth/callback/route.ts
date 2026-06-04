import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { CookieOptions } from '@supabase/ssr'
import { captureAuthError } from '@/lib/sentry'
import type { EmailOtpType } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next')
  const errorParam = searchParams.get('error')
  const origin = request.nextUrl.origin

  const safeNext = next?.startsWith('/') && !next.startsWith('//') ? next : '/onboarding'

  if (errorParam) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(errorParam)}`, origin))
  }
  if (!code && !(tokenHash && type)) {
    return NextResponse.redirect(new URL('/login?error=no_code', origin))
  }

  const response = NextResponse.redirect(new URL(safeNext, origin), 307)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options as CookieOptions)
          })
        },
      },
    }
  )

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (error || !data.session) {
      captureAuthError(error || new Error('No session returned'), {
        step: 'callback',
        provider: 'email',
      })
      return NextResponse.redirect(new URL('/login?error=exchange_failed', origin))
    }
  } else if (tokenHash && type) {
    // Admin-generated magic links (e.g. Likeness bridge) use token_hash instead of PKCE code
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
    if (error) {
      captureAuthError(error, {
        step: 'callback',
        provider: 'likeness',
      })
      return NextResponse.redirect(new URL('/login?error=exchange_failed', origin))
    }
  }

  return response
}
