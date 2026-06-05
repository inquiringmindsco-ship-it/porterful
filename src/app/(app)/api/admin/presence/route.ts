import { NextResponse } from 'next/server'
import { getAuthenticatedClient, unauthorized } from '@/lib/auth-utils'
import { parsePresencePath } from '@/lib/presence-now-playing'

const ACTIVE_WINDOW_SECONDS = 75
export const dynamic = 'force-dynamic'

function roleLabel(role?: string | null): string {
  if (!role) return 'Supporter'
  return role.charAt(0).toUpperCase() + role.slice(1)
}

export async function GET() {
  try {
    const auth = await getAuthenticatedClient()
    if (!auth) return unauthorized()

    const { supabase, user } = auth
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    const metadataRole = typeof user.user_metadata?.role === 'string' ? user.user_metadata.role : null
    const isFounderOrAdmin =
      profile?.role === 'admin' ||
      profile?.role === 'founder' ||
      metadataRole === 'admin' ||
      metadataRole === 'founder'

    if (!isFounderOrAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const cutoff = new Date(Date.now() - ACTIVE_WINDOW_SECONDS * 1000).toISOString()

    const [sessionResult, visitorResult] = await Promise.all([
      supabase
        .from('presence_sessions')
        .select('user_id, email, full_name, username, avatar_url, role, current_path, last_seen_at, created_at, updated_at')
        .gte('last_seen_at', cutoff)
        .order('last_seen_at', { ascending: false })
        .limit(200),
      supabase
        .from('presence_visitors')
        .select('visitor_id, display_name, current_path, last_seen_at, created_at, updated_at')
        .gte('last_seen_at', cutoff)
        .order('last_seen_at', { ascending: false })
        .limit(200),
    ])

    if (sessionResult.error) {
      console.error('[admin:presence] Session query error:', sessionResult.error.message, sessionResult.error.details)
      return NextResponse.json({ error: 'Failed to load live presence' }, { status: 500 })
    }

    if (visitorResult.error) {
      console.error('[admin:presence] Visitor query error:', visitorResult.error.message, visitorResult.error.details)
      return NextResponse.json({ error: 'Failed to load live presence' }, { status: 500 })
    }

    const activeUsers = [
      ...(sessionResult.data ?? []).map((row: any) => {
        const parsedPresence = parsePresencePath(row.current_path)
        const displayName = row.full_name || row.username || row.email?.split('@')[0] || 'Anonymous'
        return {
          id: row.user_id,
          kind: 'authenticated',
          user_id: row.user_id,
          visitor_id: null,
          email: row.email,
          full_name: row.full_name,
          username: row.username,
          avatar_url: row.avatar_url,
          role: row.role || 'supporter',
          role_label: roleLabel(row.role),
          current_path: parsedPresence.currentPath,
          now_playing: parsedPresence.nowPlaying,
          last_seen_at: row.last_seen_at,
          created_at: row.created_at,
          updated_at: row.updated_at,
          display_name: displayName,
        }
      }),
      ...(visitorResult.data ?? []).map((row: any) => {
        const parsedPresence = parsePresencePath(row.current_path)
        return {
          id: row.visitor_id,
          kind: 'guest',
          user_id: null,
          visitor_id: row.visitor_id,
          email: null,
          full_name: null,
          username: null,
          avatar_url: null,
          role: 'guest',
          role_label: 'Guest',
          current_path: parsedPresence.currentPath,
          now_playing: parsedPresence.nowPlaying,
          last_seen_at: row.last_seen_at,
          created_at: row.created_at,
          updated_at: row.updated_at,
          display_name: row.display_name || 'Guest',
        }
      }),
    ].sort((a, b) => new Date(b.last_seen_at).getTime() - new Date(a.last_seen_at).getTime())

    const counts = activeUsers.reduce(
      (acc, userRow) => {
        acc.total += 1
        if (userRow.now_playing?.trackTitle) acc.playing += 1
        if (userRow.role === 'artist') acc.artists += 1
        else if (userRow.role === 'admin') acc.admins += 1
        else if (userRow.role === 'business' || userRow.role === 'brand') acc.businesses += 1
        else if (userRow.role === 'guest') acc.guests += 1
        else acc.supporters += 1
        return acc
      },
      { total: 0, playing: 0, artists: 0, supporters: 0, businesses: 0, admins: 0, guests: 0 }
    )

    return NextResponse.json({
      activeUsers,
      counts,
      cutoff,
      updatedAt: new Date().toISOString(),
    })
  } catch (err: any) {
    console.error('[admin:presence] Exception:', err)
    return NextResponse.json({ error: err.message || 'Failed to load live presence' }, { status: 500 })
  }
}
