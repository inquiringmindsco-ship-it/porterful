import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareSupabaseClient } from '@/lib/supabase-auth'

const PROTECTED_PATHS = ['/dashboard', '/checkout', '/api/auth/admin', '/cart', '/profile']

function isProtected(pathname: string): boolean {
  return PROTECTED_PATHS.some(prefix => pathname.startsWith(prefix))
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (!isProtected(pathname)) {
    return NextResponse.next()
  }

  // Supabase SSR session is the single auth authority for Porterful protected pages
  // createMiddlewareSupabaseClient reads sb-* cookies from the request, validates with Supabase
  const supabase = createMiddlewareSupabaseClient(req, NextResponse.next())

  const { data: { session }, error } = await supabase.auth.getSession()

  if (!session || error) {
    const returnUrl = encodeURIComponent(req.nextUrl.pathname + (req.nextUrl.search || ''))
    return NextResponse.redirect(new URL(`/login?return=${returnUrl}`, req.nextUrl.origin))
  }

  // Valid Supabase session — inject headers for downstream use
  const response = NextResponse.next()
  response.headers.set('x-pf-email', session.user?.email || '')
  response.headers.set('x-pf-profile-id', session.user?.id || '')
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon|api/products|api/stripe|fonts|images|.*\\.(?:svg|png|jpg|gif|webp|ico|css|js)).*)',
  ],
}