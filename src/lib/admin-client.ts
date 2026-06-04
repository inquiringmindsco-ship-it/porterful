import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

/**
 * CRITICAL-003: Centralized Admin Client Pattern
 * 
 * Rules:
 * 1. Service role is NEVER the default
 * 2. Public reads use anon client
 * 3. User-scoped reads use authenticated client
 * 4. Service role ONLY for explicit admin operations with role verification
 */

// Public client — for unauthenticated reads (respects RLS)
export function getAnonClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key, { auth: { persistSession: false } })
}

// Admin client — ONLY for operations that require bypassing RLS
// Must be used AFTER role verification
export function getAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  if (!key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY not configured — admin operations disabled')
  }
  
  return createClient(url, key, { auth: { persistSession: false } })
}

// Admin guard — verify caller is founder or admin before admin operations
export async function verifyAdminAccess(req: NextRequest): Promise<{ 
  authorized: boolean
  userId?: string
  role?: string
  error?: string
}> {
  try {
    // Import dynamically to avoid circular deps
    const { createServerClient } = await import('@supabase/ssr')
    const { cookies } = await import('next/headers')
    
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
    )
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return { authorized: false, error: 'Authentication required' }
    }
    
    // Check role in profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    const role = profile?.role
    const isAdmin = role === 'founder' || role === 'admin'
    
    return {
      authorized: isAdmin,
      userId: user.id,
      role,
      error: isAdmin ? undefined : `Role '${role}' is not authorized for admin operations`
    }
  } catch (err: any) {
    return { authorized: false, error: err.message }
  }
}

// Convenience: get admin client with built-in verification
export async function getVerifiedAdminClient(req: NextRequest): Promise<{
  client: SupabaseClient
  userId: string
  role: string
} | {
  client: null
  error: string
  status: number
}> {
  const auth = await verifyAdminAccess(req)
  
  if (!auth.authorized) {
    return { client: null, error: auth.error || 'Forbidden', status: 403 }
  }
  
  return {
    client: getAdminClient(),
    userId: auth.userId!,
    role: auth.role!
  }
}
