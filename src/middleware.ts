import { NextRequest, NextResponse } from 'next/server';
import { getPorterfulSession } from '@/lib/porterful-session';

const LIKENESS_LOGIN_URL = 'https://likenessverified.com/login';
const PROTECTED_PATHS = ['/dashboard', '/checkout', '/api/auth/admin', '/cart', '/profile'];
const BRIDGE_API = '/api/auth/porterful-bridge';

function isProtected(pathname: string): boolean {
  return PROTECTED_PATHS.some(prefix => pathname.startsWith(prefix));
}

function extractReturnUrl(req: NextRequest): string {
  return encodeURIComponent(req.nextUrl.origin + req.nextUrl.pathname + req.search);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect defined paths
  if (!isProtected(pathname)) {
    return NextResponse.next();
  }

  // Check for existing valid porterful_session
  const session = await getPorterfulSession();

  if (session) {
    // Valid session — inject headers for downstream use and continue
    const response = NextResponse.next();
    response.headers.set('x-pf-email', session.email);
    response.headers.set('x-pf-profile-id', session.profileId);
    response.headers.set('x-pf-lk-id', session.lkId);
    return response;
  }

  // No session — attempt bridge (maybe likeness_session exists but porterful_session not set)
  if (req.cookies.get('likeness_session')) {
    // Try to bridge via internal API call (bridge sets porterful_session cookie)
    const bridgeUrl = new URL(BRIDGE_API, req.nextUrl.origin).toString();
    try {
      const likenSession = req.cookies.get('likeness_session')?.value || '';
      const bridgeRes = await fetch(bridgeUrl, {
        method: 'POST',
        headers: { 'cookie': `likeness_session=${likenSession}` },
      });

      if (bridgeRes.ok) {
        // Bridge succeeded — read Set-Cookie headers and forward them
        const setCookieHeaders = bridgeRes.headers.getAll('set-cookie');
        const response = NextResponse.next();
        setCookieHeaders.forEach(cookie => {
          response.headers.append('set-cookie', cookie);
        });
        response.headers.set('x-pf-email', (await bridgeRes.json()).email || '');
        return response;
      }
    } catch {
      // Bridge failed — fall through to redirect
    }
  }

  // Still no session — redirect to LikenessVerified login with return URL
  const returnUrl = extractReturnUrl(req);
  const loginUrl = new URL(LIKENESS_LOGIN_URL);
  loginUrl.searchParams.set('return', returnUrl);
  return NextResponse.redirect(loginUrl.toString());
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon|api/products|api/stripe|fonts|images|.*\\.(?:svg|png|jpg|gif|webp|ico|css|js)).*)',
  ],
};
