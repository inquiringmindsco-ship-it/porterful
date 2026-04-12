/**
 * API Route Guard
 * Validates auth on API routes — import at top of route handlers
 * 
 * Usage in route.ts:
 *   import { withAuth } from '@/lib/api-auth-guard'
 *   export const POST = withAuth(async (req, { userId }) => {
 *     // userId is guaranteed to exist
 *     ...
 *   })
 */

import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export interface AuthenticatedRequest {
  userId: string
  profile?: any
}

type RouteHandler<T = any> = (req: Request, data: AuthenticatedRequest) => Promise<T> | T

export function withAuth<T = any>(handler: RouteHandler<T>) {
  return async (req: Request) => {
    try {
      const cookieStore = await cookies()
      const accessToken = cookieStore.get('sb-access-token')?.value

      if (!accessToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll()
            },
            setAll() {},
          },
        }
      )

      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      return handler(req, { userId: user.id, profile })
    } catch (err) {
      console.error('[API Auth] Error:', err)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
}

/**
 * Require specific role
 */
export function withRole(role: string) {
  return (handler: RouteHandler) => {
    return withAuth(async (req, data) => {
      if (data.profile?.role !== role && data.profile?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      return handler(req, data)
    })
  }
}
