import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareSupabaseClient } from '@/lib/supabase-auth'

const ROLE_GATED_ROUTES = [
  { prefix: '/dashboard/founder', roles: ['admin', 'founder'] },
  { prefix: '/dashboard/admin', roles: ['admin'] },
  { prefix: '/dashboard/artist', roles: ['artist', 'admin', 'founder'] },
  { prefix: '/dashboard/upload', roles: ['artist', 'admin', 'founder'] },
] as const

async function checkUserRole(supabase: any, allowedRoles: readonly string[]) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
    
  return allowedRoles.includes(profile?.role)
}

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

  // Protect authenticated application surfaces.
  // Everything else stays public by default.
  const requiresAuth = pathname === '/dashboard' || pathname.startsWith('/dashboard/') || pathname === '/settings' || pathname.startsWith('/settings/')
  const requiresAdminGate = pathname === '/api/admin' || pathname.startsWith('/api/admin/')

  if (requiresAuth || requiresAdminGate) {
    // Use a single response object so that Supabase SSR can write refreshed
    // session cookies back to the browser. Passing a throwaway NextResponse.next()
    // causes the refreshed tokens to be silently discarded.
    const response = NextResponse.next({ request: { headers: request.headers } })
    const supabase = createMiddlewareSupabaseClient(request, response)
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      const returnUrl = encodeURIComponent(pathname + (request.nextUrl.search || ''))
      return NextResponse.redirect(new URL(`/login?return=${returnUrl}`, request.nextUrl.origin))
    }

    for (const { prefix, roles } of ROLE_GATED_ROUTES) {
      if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
        const hasRole = await checkUserRole(supabase, roles)
        if (!hasRole) {
          return NextResponse.redirect(new URL('/dashboard', request.nextUrl.origin))
        }
      }
    }

    if (requiresAdminGate) {
      const hasAdminRole = await checkUserRole(supabase, ['admin', 'founder'])
      if (!hasAdminRole) {
        return NextResponse.redirect(new URL('/dashboard', request.nextUrl.origin))
      }
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
