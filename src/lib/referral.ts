import { cookies } from 'next/headers'
import { browserClient } from '@/lib/supabase'

export const REFERRAL_COOKIE = 'pf_ref'
export const REFERRAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

/**
 * Save a referral code to the user's session cookie.
 * Call this when a user visits /store?ref=username or /username
 */
export async function saveReferral(refUsername: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(REFERRAL_COOKIE, refUsername, {
    maxAge: REFERRAL_COOKIE_MAX_AGE,
    path: '/',
    sameSite: 'lax',
    httpOnly: false, // readable by JS for display
  })
}

/**
 * Get the stored referral code from the user's session.
 */
export async function getReferral(): Promise<string | null> {
  const cookieStore = await cookies()
  const cookiesList = cookieStore.getAll()
  const refCookie = cookiesList.find(c => c.name === REFERRAL_COOKIE)
  return refCookie?.value || null
}

/**
 * Look up a profile by username to get their ID.
 */
export async function getProfileByUsername(username: string): Promise<string | null> {
  try {
    const supabase = browserClient()
    const { data } = await supabase
      .from('profiles')
      .select('id, referral_code')
      .or(`username.ilike.${username},full_name.ilike.${username}`)
      .single()
    return data?.id || null
  } catch {
    return null
  }
}

/**
 * Credit a referrer after a successful order.
 * This should be called by the webhook or order completion handler.
 */
export async function creditReferral(orderId: string, referrerId: string, commissionCents: number) {
  const supabase = browserClient()
  
  // Create a referral_earnings record
  const { error } = await supabase
    .from('referral_earnings')
    .insert({
      referrer_id: referrerId,
      order_id: orderId,
      commission_cents: commissionCents,
      status: 'pending',
    })

  if (error) {
    console.error('Failed to credit referral:', error)
  }
  return !error
}

/**
 * Get the user's store URL for display/sharing.
 */
export function getStoreUrl(username: string, baseUrl = 'https://porterful.com'): string {
  return `${baseUrl}/store?ref=${username}`
}
