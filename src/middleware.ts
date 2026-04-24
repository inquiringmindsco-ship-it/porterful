import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareSupabaseClient } from '@/lib/supabase-auth'

const PUBLIC_PATHS = [
  '/',
  '/music',
  '/artists',
  '/store',
  '/tap',
  '/signal',
  '/tap-in',
  '/systems',
  '/login',
  '/register',
  '/forgot-password',
  '/auth/callback',
  '/api/auth/session',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip Next.js internals and static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Allow public paths
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Protect dashboard and all sub-routes under (app)
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/api/auth/signup') || pathname.startsWith('/checkout') || pathname.startsWith('/artist') || pathname.startsWith('/superfan') || pathname.startsWith('/settings')) {
    // Use a single response object so that Supabase SSR can write refreshed
    // session cookies back to the browser. Passing a throwaway NextResponse.next()
    // causes the refreshed tokens to be silently discarded.
    const response = NextResponse.next({ request: { headers: request.headers } })
    const supabase = createMiddlewareSupabaseClient(request, response)
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      const returnUrl = encodeURIComponent(pathname + (request.nextUrl.search || ''))
      return NextResponse.redirect(
        new URL(`/login?return=${returnUrl}`, request.nextUrl.origin)
      )
    }

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon|api/products|api/stripe|fonts|images|.*\\.(?:svg|png|jpg|gif|webp|ico|css|js)).*)',
  ],
}
