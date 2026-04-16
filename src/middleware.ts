import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareSupabaseClient } from '@/lib/supabase-auth'

const PUBLIC_PATHS = [
  '/',
  '/music',
  '/artists',
  '/store',
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
    // Single auth truth: Supabase SSR session cookies created by route handler.
    // createMiddlewareSupabaseClient reads sb-* cookies from request and validates
    // against Supabase. getSession() returns the session if valid, null if not.
    const supabase = createMiddlewareSupabaseClient(request, NextResponse.next())
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      const returnUrl = encodeURIComponent(pathname + (request.nextUrl.search || ''))
      return NextResponse.redirect(
        new URL(`/login?return=${returnUrl}`, request.nextUrl.origin)
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon|api/products|api/stripe|fonts|images|.*\\.(?:svg|png|jpg|gif|webp|ico|css|js)).*)',
  ],
}