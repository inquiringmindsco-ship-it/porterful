import { cookies } from 'next/headers'

import type { SupabaseClient } from '@supabase/supabase-js'

export const REFERRAL_COOKIE = 'porterful_referral'
export const REFERRAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 30

export function normalizeReferralHandle(value: string | null | undefined): string | null {
  const handle = value?.trim().toLowerCase()
  return handle ? handle : null
}

export function getStoreUrl(handle: string, baseUrl = 'https://porterful.com'): string {
  const normalized = normalizeReferralHandle(handle)
  if (!normalized) return `${baseUrl}/store`
  return `${baseUrl}/store?ref=${encodeURIComponent(normalized)}`
}

export async function saveReferral(handle: string): Promise<void> {
  const normalized = normalizeReferralHandle(handle)
  if (!normalized) return

  const cookieStore = await cookies()
  cookieStore.set(REFERRAL_COOKIE, normalized, {
    maxAge: REFERRAL_COOKIE_MAX_AGE,
    path: '/',
    sameSite: 'lax',
    httpOnly: false,
  })
}

export async function getReferral(): Promise<string | null> {
  const cookieStore = await cookies()
  return normalizeReferralHandle(cookieStore.get(REFERRAL_COOKIE)?.value || null)
}

export async function resolveReferrerId(
  supabase: SupabaseClient,
  referralHandle: string | null | undefined,
): Promise<string | null> {
  const normalized = normalizeReferralHandle(referralHandle)
  if (!normalized) return null

  const { data: byUsername } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', normalized)
    .limit(1)
    .maybeSingle()
  if (byUsername?.id) return byUsername.id

  const { data: byReferralCode } = await supabase
    .from('profiles')
    .select('id')
    .eq('referral_code', normalized.toUpperCase())
    .limit(1)
    .maybeSingle()
  if (byReferralCode?.id) return byReferralCode.id

  const { data: byLkId } = await supabase
    .from('profiles')
    .select('id')
    .eq('lk_id', normalized)
    .limit(1)
    .maybeSingle()
  return byLkId?.id || null
}
