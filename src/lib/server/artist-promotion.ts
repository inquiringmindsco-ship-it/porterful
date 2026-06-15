import type { SupabaseClient } from '@supabase/supabase-js'
import { recordRoleTransition } from '@/lib/server/role-transitions'

export type ArtistPromotionInput = {
  userId: string
  artistName: string
  genre?: string | null
  city?: string | null
  bio?: string | null
  avatarUrl?: string | null
  coverUrl?: string | null
  instagramUrl?: string | null
  youtubeUrl?: string | null
  twitterUrl?: string | null
  tiktokUrl?: string | null
  verified?: boolean
  status?: 'pending' | 'approved' | 'active'
  publicProfileEnabled?: boolean
  performedByUserId?: string | null
  transitionSource?: string
  transitionReason?: string | null
}

export type ArtistPromotionResult = {
  artist: any | null
  slug: string
  authMetadataUpdated: boolean
  profileUpdated: boolean
  roleChanged: boolean
  transitionRecorded: boolean
}

function buildSlug(name: string, fallbackId: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  return base || `artist-${fallbackId.slice(0, 8)}`
}

async function ensureUniqueSlug(supabase: SupabaseClient, baseSlug: string, userId: string) {
  let slug = baseSlug

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { data } = await supabase
      .from('artists')
      .select('id')
      .eq('slug', slug)
      .neq('id', userId)
      .maybeSingle()

    if (!data) return slug

    slug = `${baseSlug}-${userId.slice(0, 4 + attempt)}`
  }

  return `${baseSlug}-${userId.slice(0, 8)}`
}

export async function promoteUserToArtist(
  supabase: SupabaseClient,
  input: ArtistPromotionInput,
): Promise<ArtistPromotionResult> {
  const artistName = input.artistName.trim()
  const baseSlug = buildSlug(artistName, input.userId)
  const slug = await ensureUniqueSlug(supabase, baseSlug, input.userId)

  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('role, email, full_name, username')
    .eq('id', input.userId)
    .maybeSingle()

  const previousRole = String(existingProfile?.role || '').toLowerCase() || null
  const roleChanged = previousRole !== 'artist'

  const artistPayload = {
    id: input.userId,
    name: artistName,
    slug,
    bio: input.bio || null,
    genre: input.genre || null,
    city: input.city || null,
    avatar_url: input.avatarUrl || null,
    cover_url: input.coverUrl || null,
    verified: input.verified ?? true,
    status: input.status || 'approved',
    public_profile_enabled: input.publicProfileEnabled ?? false,
    instagram_url: input.instagramUrl || null,
    youtube_url: input.youtubeUrl || null,
    twitter_url: input.twitterUrl || null,
    tiktok_url: input.tiktokUrl || null,
  }

  const { data: artist, error: artistError } = await supabase
    .from('artists')
    .upsert(artistPayload, { onConflict: 'id' })
    .select('*')
    .single()

  if (artistError) {
    throw artistError
  }

  let profileUpdated = false
  if (roleChanged) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: 'artist' })
      .eq('id', input.userId)

    if (profileError) {
      throw profileError
    }

    profileUpdated = true
  }

  let authMetadataUpdated = false
  try {
    const authApi: any = supabase.auth.admin as any
    const lookup = typeof authApi.getUserById === 'function'
      ? await authApi.getUserById(input.userId)
      : null

    const existingMetadata =
      lookup?.data?.user?.user_metadata ||
      lookup?.data?.user_metadata ||
      lookup?.user?.user_metadata ||
      {}

    const { error: authUpdateError } = await authApi.updateUserById(input.userId, {
      user_metadata: {
        ...(existingMetadata || {}),
        role: 'artist',
        artist_slug: slug,
        artist_name: artistName,
      },
    })

    if (!authUpdateError) {
      authMetadataUpdated = true
    }
  } catch (authError) {
    console.warn('[artist-promotion] auth metadata update failed:', authError)
  }

  let transitionRecorded = false
  if (roleChanged) {
    try {
      const { recorded } = await recordRoleTransition(supabase, {
        userId: input.userId,
        previousRole,
        nextRole: 'artist',
        performedByUserId: input.performedByUserId || null,
        source: input.transitionSource || 'admin_promotion',
        reason: input.transitionReason || null,
        metadata: {
          artist_slug: slug,
          artist_name: artistName,
        },
      })
      transitionRecorded = recorded
    } catch (transitionError) {
      console.warn('[artist-promotion] transition log failed:', transitionError)
    }
  }

  return {
    artist,
    slug,
    authMetadataUpdated,
    profileUpdated,
    roleChanged,
    transitionRecorded,
  }
}
