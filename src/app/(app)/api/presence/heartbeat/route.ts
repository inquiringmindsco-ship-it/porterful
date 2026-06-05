import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/auth-utils'

const ALLOWED_ROLES = new Set(['supporter', 'superfan', 'artist', 'business', 'brand', 'admin'])
const VISITOR_COOKIE = 'porterful_presence_visitor'
const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 30
export const dynamic = 'force-dynamic'

function normalizePath(input: unknown): string | null {
  if (typeof input !== 'string') return null
  const trimmed = input.trim()
  if (!trimmed) return null
  return trimmed.slice(0, 500)
}

function inferRole(profileRole?: string | null, metadataRole?: unknown): string {
  if (profileRole && ALLOWED_ROLES.has(profileRole)) return profileRole
  if (typeof metadataRole === 'string' && ALLOWED_ROLES.has(metadataRole)) return metadataRole
  return 'supporter'
}

function normalizeVisitorId(input: unknown): string | null {
  if (typeof input !== 'string') return null
  const trimmed = input.trim()
  if (!trimmed) return null
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(trimmed)
    ? trimmed
    : null
}

function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase service credentials')
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const currentPath = normalizePath((body as { current_path?: unknown }).current_path)
    const visitorCookie = normalizeVisitorId(request.cookies.get(VISITOR_COOKIE)?.value)
    const now = new Date().toISOString()
    const auth = await getAuthenticatedClient()

    if (!auth) {
      const serviceSupabase = createServiceClient()
      const visitorId = visitorCookie ?? crypto.randomUUID()
      const displayName = `Guest ${visitorId.slice(-4).toUpperCase()}`
      const { error } = await serviceSupabase.from('presence_visitors').upsert(
        {
          visitor_id: visitorId,
          display_name: displayName,
          current_path: currentPath,
          last_seen_at: now,
          updated_at: now,
        },
        { onConflict: 'visitor_id' }
      )

      if (error) {
        console.error('[presence:heartbeat] Visitor upsert error:', error.message, error.details)
        return NextResponse.json({ error: 'Failed to update presence' }, { status: 500 })
      }

      const response = NextResponse.json({ success: true, kind: 'visitor' })
      if (!visitorCookie) {
        response.cookies.set(VISITOR_COOKIE, visitorId, {
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          path: '/',
          maxAge: VISITOR_COOKIE_MAX_AGE,
        })
      }
      return response
    }

    const { supabase, user } = auth

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name, username, avatar_url')
      .eq('id', user.id)
      .maybeSingle()

    const role = inferRole(profile?.role, user.user_metadata?.role)
    const fullName =
      profile?.full_name ??
      (typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : null) ??
      (typeof user.user_metadata?.name === 'string' ? user.user_metadata.name : null)
    const username =
      profile?.username ??
      (typeof user.user_metadata?.user_name === 'string' ? user.user_metadata.user_name : null) ??
      (typeof user.user_metadata?.preferred_username === 'string' ? user.user_metadata.preferred_username : null)
    const avatarUrl =
      profile?.avatar_url ??
      (typeof user.user_metadata?.avatar_url === 'string' ? user.user_metadata.avatar_url : null) ??
      (typeof user.user_metadata?.picture === 'string' ? user.user_metadata.picture : null)

    const { error } = await supabase.from('presence_sessions').upsert(
      {
        user_id: user.id,
        email: user.email ?? '',
        full_name: fullName,
        username,
        avatar_url: avatarUrl,
        role,
        current_path: currentPath,
        last_seen_at: now,
        updated_at: now,
      },
      { onConflict: 'user_id' }
    )

    if (error) {
      console.error('[presence:heartbeat] Upsert error:', error.message, error.details)
      return NextResponse.json({ error: 'Failed to update presence' }, { status: 500 })
    }

    if (visitorCookie) {
      const serviceSupabase = createServiceClient()
      const { error: visitorDeleteError } = await serviceSupabase
        .from('presence_visitors')
        .delete()
        .eq('visitor_id', visitorCookie)

      if (visitorDeleteError) {
        console.error('[presence:heartbeat] Visitor cleanup error:', visitorDeleteError.message, visitorDeleteError.details)
      }
    }

    return NextResponse.json({ success: true, kind: 'authenticated' })
  } catch (err: any) {
    console.error('[presence:heartbeat] Exception:', err)
    return NextResponse.json({ error: err.message || 'Failed to update presence' }, { status: 500 })
  }
}
