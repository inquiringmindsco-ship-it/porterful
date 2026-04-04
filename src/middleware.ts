import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Maintenance middleware — uncomment below to enable
/*
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname === '/maintenance'
  ) {
    return NextResponse.next()
  }
  const maintenanceUrl = new URL('/maintenance', request.url)
  return NextResponse.redirect(maintenanceUrl)
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|maintenance).*)',
  ],
}
*/

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Redirect /marketplace to /store
  if (pathname === '/marketplace') {
    return NextResponse.redirect(new URL('/store', request.url))
  }

  return NextResponse.next()
}
