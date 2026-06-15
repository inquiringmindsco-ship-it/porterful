import { createClient } from '@supabase/supabase-js'
import type { NextRequest } from 'next/server'

type SupabaseLike = {
  from: ReturnType<typeof createClient>['from']
  auth: ReturnType<typeof createClient>['auth']
}

export function isFounderOrAdmin(role?: string | null) {
  return role === 'founder' || role === 'admin'
}

export function extractBearerToken(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.replace('Bearer ', '').trim()
  return token || null
}

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase admin configuration')
  }

  return createClient(url, key, { auth: { persistSession: false } })
}

export function createUserClient(token: string | null) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error('Missing Supabase public configuration')
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : undefined,
  })
}

export type ArtistVideoProfile = {
  id: string
  role: string | null
  full_name?: string | null
  username?: string | null
  email?: string | null
}

export type ArtistVideoArtist = {
  id: string
  name: string
  slug?: string | null
  created_at?: string | null
  status?: string | null
  public_profile_enabled?: boolean | null
  verified?: boolean | null
  likeness_verified?: boolean | null
  bio?: string | null
  avatar_url?: string | null
  cover_url?: string | null
}

export async function getArtistVideoRequestAuth(req: NextRequest) {
  const token = extractBearerToken(req)
  const userClient = createUserClient(token)
  let adminClient: ReturnType<typeof createAdminClient> | null = null

  const {
    data: { user: sessionUser },
  } = await userClient.auth.getUser()

  if (sessionUser) {
    return { user: sessionUser, userClient, adminClient, token }
  }

  if (!token) {
    return { user: null, userClient, adminClient, token }
  }

  adminClient = createAdminClient()
  const {
    data: { user },
    error,
  } = await adminClient.auth.getUser(token)

  if (error || !user) {
    return { user: null, userClient, adminClient, token }
  }

  return { user, userClient, adminClient, token }
}

export async function getArtistVideoProfile(client: SupabaseLike, userId: string): Promise<ArtistVideoProfile | null> {
  const { data } = await client
    .from('profiles')
    .select('id, role, full_name, username, email')
    .eq('id', userId)
    .single()

  return data || null
}

export async function getArtistVideoArtist(client: SupabaseLike, artistId: string): Promise<ArtistVideoArtist | null> {
  const { data, error } = await client
    .from('artists')
    .select('id, name, slug, created_at, status, public_profile_enabled, verified, bio, avatar_url, cover_url')
    .eq('id', artistId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data || null
}
