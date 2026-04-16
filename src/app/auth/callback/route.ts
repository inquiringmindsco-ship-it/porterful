import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerSupabaseClient } from '@/lib/supabase-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')
  const errorParam = searchParams.get('error')
  const origin = request.nextUrl.origin

  // Sanitize redirect — only allow safe paths
  const safeNext = next?.startsWith('/') && !next.startsWith('//') ? next : '/dashboard'

  if (errorParam) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(errorParam)}`, origin))
  }
  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', origin))
  }

  // Build redirect response — will carry session cookies to browser on success
  const response = NextResponse.redirect(new URL(safeNext, origin), 307)

  // Pass request cookies (getAll) and response (setAll) so createServerClient can:
  // - Read code_verifier from incoming request cookies
  // - Write session cookies (access_token, refresh_token) to response on SIGNED_IN
  const supabase = createRouteHandlerSupabaseClient(request.cookies, response)
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.session) {
    return NextResponse.redirect(new URL('/login?error=exchange_failed', origin))
  }

  return response
}