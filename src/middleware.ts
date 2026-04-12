/**
 * Porterful Auth Middleware
 * Protects dashboard routes by validating session cookies
 * 
 * LEGACY: referral_records — DO NOT USE
 * Ledger reads/writes now go through signal_actions
 * 
 * @see src/lib/auth-utils.ts — server-side auth utilities
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const DASHBOARD_PATHS = [
  '/dashboard',
  '/dashboard/',
  '/dashboard/artist',
  '/dashboard/products',
  '/dashboard/orders',
  '/dashboard/analytics',
  '/dashboard/add-product',
  '/dashboard/upload',
  '/dashboard/submissions',
  '/dashboard/collaborations',
  '/dashboard/earnings',
  '/dashboard/settings',
]

const AUTH_PATHS = [
  '/login',
  '/signup',
  '/superfan',
]

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const response = NextResponse.next()

  // ──────────────────────────────────────────────
  // 1. Redirect unauthenticated users from dashboard
  // ──────────────────────────────────────────────
  const isDashboardPath = DASHBOARD_PATHS.some(p => pathname.startsWith(p))
  const isAuthPath = AUTH_PATHS.some(p => pathname.startsWith(p))

  if (isDashboardPath) {
    const accessToken = request.cookies.get('sb-access-token')?.value
    const refreshToken = request.cookies.get('sb-refresh-token')?.value

    if (!accessToken) {
      // No session — redirect to login
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Validate session with Supabase
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll() {
              // Cookie setting not needed here — just reading
            },
          },
        }
      )

      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        // Invalid session — redirect to login
        const redirectUrl = new URL('/login', request.url)
        redirectUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(redirectUrl)
      }

      // User is valid — add user ID to response headers for client access
      response.headers.set('x-user-id', user.id)
    } catch (err) {
      console.error('[Auth Middleware] Session validation error:', err)
      // On error, redirect to login for safety
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // ──────────────────────────────────────────────
  // 2. Redirect authenticated users away from auth pages
  // ──────────────────────────────────────────────
  if (isAuthPath && !pathname.includes('/api/')) {
    const accessToken = request.cookies.get('sb-access-token')?.value

    if (accessToken) {
      try {
        const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: {
              getAll() {
                return request.cookies.getAll()
              },
              setAll() {},
            },
          }
        )

        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          // Already logged in — redirect to dashboard
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      } catch {
        // Ignore errors on auth pages — let them through to login
      }
    }
  }

  // ──────────────────────────────────────────────
  // 3. Referral param capture (existing behavior)
  // ──────────────────────────────────────────────
  const refParam = request.nextUrl.searchParams.get('ref') || request.nextUrl.searchParams.get('referral')
  if (refParam) {
    const refCode = refParam.trim().toUpperCase()

    response.cookies.set('porterful_referral', refCode, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })

    response.cookies.set('porterful_referral_client', refCode, {
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })

    // Strip ref param from URL
    const url = request.nextUrl.clone()
    url.searchParams.delete('ref')
    url.searchParams.delete('referral')
    return NextResponse.redirect(url)
  }

  // ──────────────────────────────────────────────
  // 4. Redirect /marketplace to /store
  // ──────────────────────────────────────────────
  if (pathname === '/marketplace') {
    return NextResponse.redirect(new URL('/store', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|maintenance|.*\\..*).*)',
  ],
}
