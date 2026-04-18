import { NextRequest, NextResponse } from 'next/server'
import { REFERRAL_COOKIE, REFERRAL_COOKIE_MAX_AGE, getStoreUrl, normalizeReferralHandle } from '@/lib/referral'

/**
 * GET /api/referral?ref=username
 * Stores the referral handle in a shared cookie and redirects to the central store.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const ref = normalizeReferralHandle(searchParams.get('ref'))

  if (!ref) {
    return NextResponse.json({ error: 'Missing ref parameter' }, { status: 400 })
  }

  const response = NextResponse.redirect(new URL(getStoreUrl(ref, request.nextUrl.origin), request.url))
  response.cookies.set(REFERRAL_COOKIE, ref, {
    maxAge: REFERRAL_COOKIE_MAX_AGE,
    path: '/',
    sameSite: 'lax',
  })
  return response
}
