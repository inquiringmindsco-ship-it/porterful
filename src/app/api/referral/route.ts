import { NextRequest, NextResponse } from 'next/server'
import { saveReferral } from '@/lib/referral'

/**
 * GET /api/referral?ref=username
 * Saves the referral username to a cookie and redirects to /store
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const ref = searchParams.get('ref')

  if (!ref) {
    return NextResponse.json({ error: 'Missing ref parameter' }, { status: 400 })
  }

  // Save to cookie
  await saveReferral(ref)

  // Redirect to store
  return NextResponse.redirect(new URL('/store', request.url))
}
