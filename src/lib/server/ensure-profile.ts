import type { SupabaseClient, User } from '@supabase/supabase-js'

export interface EnsureProfileResult {
  profile: any | null
  created: boolean
  error: any | null
}

function sanitizeUsername(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9_]+/g, '')
}

/**
 * Idempotently ensure a `profiles` row exists for the given auth user.
 *
 * - Returns the existing row untouched if one is already present (never
 *   overwrites role, never promotes to artist).
 * - Inserts a `supporter` row keyed on user.id when missing, deriving
 *   full_name/username from user_metadata or email.
 * - Safe under race with the SECURITY DEFINER trigger: uses upsert with
 *   ignoreDuplicates so a concurrent trigger insert wins without clobber.
 *
 * Pass a Supabase client that can read+write the `profiles` table for this
 * user (service-role on the server, or an authed user client where RLS
 * permits the user's own profile insert).
 */
export async function ensureProfile(
  supabase: SupabaseClient,
  user: User,
): Promise<EnsureProfileResult> {
  if (!user?.id) {
    return { profile: null, created: false, error: new Error('ensureProfile: missing user') }
  }

  const { data: existing, error: fetchErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (fetchErr) {
    return { profile: null, created: false, error: fetchErr }
  }
  if (existing) {
    return { profile: existing, created: false, error: null }
  }

  const meta = (user.user_metadata || {}) as Record<string, any>
  const email = (user.email || '').toLowerCase()
  const emailLocal = email.split('@')[0] || ''
  const fullName: string =
    (meta.full_name as string) ||
    (meta.name as string) ||
    emailLocal ||
    'Porterful User'
  const avatarUrl: string | null =
    (meta.avatar_url as string) || (meta.picture as string) || null

  const baseUsername =
    sanitizeUsername(fullName) ||
    sanitizeUsername(emailLocal) ||
    `user_${user.id.slice(0, 8)}`

  let username = baseUsername
  for (let i = 0; i < 5; i++) {
    const { data: collision } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle()
    if (!collision) break
    username = `${baseUsername}_${user.id.slice(0, 4 + i)}`
  }

  const { error: upsertErr } = await supabase
    .from('profiles')
    .upsert(
      {
        id: user.id,
        email,
        full_name: fullName,
        username,
        avatar_url: avatarUrl,
        role: 'supporter',
      },
      { onConflict: 'id', ignoreDuplicates: true },
    )

  if (upsertErr) {
    return { profile: null, created: false, error: upsertErr }
  }

  const { data: profile, error: refetchErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (refetchErr) {
    return { profile: null, created: false, error: refetchErr }
  }

  return { profile, created: !!profile, error: null }
}
