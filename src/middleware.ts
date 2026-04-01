import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Allow API routes, static files, and the maintenance page itself
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') || // static files with extensions
    pathname === '/maintenance'
  ) {
    return NextResponse.next()
  }

  // Redirect everything else to maintenance page
  const maintenanceUrl = new URL('/maintenance', request.url)
  return NextResponse.redirect(maintenanceUrl)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next (Next.js internals)
     * - static files
     * - maintenance page itself
     */
    '/((?!api|_next/static|_next/image|favicon.ico|maintenance).*)',
  ],
}
