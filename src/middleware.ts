import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareSupabaseClient } from '@/lib/supabase-auth'

const MAINTENANCE_ALLOWLIST = ['/maintenance', '/login', '/signup', '/forgot-password'] as const

const ROLE_GATED_ROUTES = [
  { prefix: '/dashboard/founder', roles: ['admin', 'founder'] },
  { prefix: '/dashboard/admin', roles: ['admin'] },
  { prefix: '/dashboard/artist', roles: ['artist', 'admin', 'founder'] },
  { prefix: '/dashboard/upload', roles: ['artist', 'admin', 'founder'] },
] as const

async function checkUserRole(supabase: any, allowedRoles: readonly string[]) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  return allowedRoles.includes(profile?.role)
}

function isStaticAsset(pathname: string) {
  return (
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/manifest.json' ||
    pathname === '/icon.svg' ||
    pathname === '/apple-touch-icon.png' ||
    pathname.includes('.')
  )
}

function isMaintenanceAllowed(pathname: string) {
  return (
    pathname.startsWith('/api') ||
    isStaticAsset(pathname) ||
    MAINTENANCE_ALLOWLIST.some((route) => pathname === route || pathname.startsWith(`${route}/`))
  )
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const enabled = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true'

  if (enabled) {
    if (isMaintenanceAllowed(pathname)) {
      return NextResponse.next()
    }

    const url = request.nextUrl.clone()
    url.pathname = '/maintenance'
    url.search = ''
    return NextResponse.redirect(url)
  }

  if (isStaticAsset(pathname)) {
    return NextResponse.next()
  }

  const requiresAuth =
    pathname === '/dashboard' ||
    pathname.startsWith('/dashboard/') ||
    pathname === '/settings' ||
    pathname.startsWith('/settings/')
  const requiresAdminGate = pathname === '/api/admin' || pathname.startsWith('/api/admin/')

  if (requiresAuth || requiresAdminGate) {
    const response = NextResponse.next({ request: { headers: request.headers } })
    const supabase = createMiddlewareSupabaseClient(request, response)
    const {
      data: { session },
    } = await supabase.auth.getSession()

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
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json|icon.svg|apple-touch-icon.png).*)'],
}
