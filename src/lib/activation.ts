import type { SupabaseClient } from '@supabase/supabase-js'

export type ActivationCodeKind = 'activation' | 'discount'

export type ActivationCodeRecord = {
  id: string
  code_value: string
  status: 'unused' | 'used'
  kind: ActivationCodeKind
  prepaid: boolean
  discount_cents: number | null
  shirt_type: string | null
  source: string | null
  metadata: Record<string, unknown> | null
  redeemed_by_profile_id: string | null
  redeemed_email: string | null
  order_id: string | null
  used_at: string | null
  created_at: string
  updated_at: string | null
}

export function normalizeActivationCode(value: string | null | undefined): string | null {
  const normalized = value?.trim().toUpperCase().replace(/\s+/g, '')
  return normalized ? normalized : null
}

export function isActivationCode(record: ActivationCodeRecord | null | undefined): boolean {
  return record?.kind === 'activation'
}

export function isDiscountCode(record: ActivationCodeRecord | null | undefined): boolean {
  return record?.kind === 'discount'
}

export function getDiscountCents(record: ActivationCodeRecord | null | undefined): number {
  return Math.max(0, Math.round(Number(record?.discount_cents || 0)))
}

export async function getActivationCodeByValue(
  supabase: SupabaseClient,
  codeValue: string,
) {
  return supabase
    .from('activation_codes')
    .select('*')
    .eq('code_value', codeValue)
    .limit(1)
    .maybeSingle<ActivationCodeRecord>()
}

export async function consumeActivationCode(
  supabase: SupabaseClient,
  codeValue: string,
  updates: {
    redeemedByProfileId?: string | null
    redeemedEmail?: string | null
    orderId?: string | null
  } = {},
) {
  const timestamp = new Date().toISOString()
  return supabase
    .from('activation_codes')
    .update({
      status: 'used',
      redeemed_by_profile_id: updates.redeemedByProfileId ?? null,
      redeemed_email: updates.redeemedEmail ?? null,
      order_id: updates.orderId ?? null,
      used_at: timestamp,
      updated_at: timestamp,
    })
    .eq('code_value', codeValue)
    .eq('status', 'unused')
    .select('*')
    .maybeSingle<ActivationCodeRecord>()
}
