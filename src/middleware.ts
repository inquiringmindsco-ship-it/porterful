import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const response = NextResponse.next()

  // Redirect /marketplace to /store
  if (pathname === '/marketplace') {
    return NextResponse.redirect(new URL('/store', request.url))
  }

  // Capture referral param
  const refParam = request.nextUrl.searchParams.get('ref') || request.nextUrl.searchParams.get('referral')
  if (refParam) {
    const refCode = refParam.trim().toUpperCase()

    // Set HttpOnly cookie for server-side (checkout, API)
    response.cookies.set('porterful_referral', refCode, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })

    // Set readable cookie for client-side (UI display, analytics)
    response.cookies.set('porterful_referral_client', refCode, {
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })

    // Strip ref param from URL for clean redirect
    const url = request.nextUrl.clone()
    url.searchParams.delete('ref')
    url.searchParams.delete('referral')
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|maintenance).*)',
  ],
}
