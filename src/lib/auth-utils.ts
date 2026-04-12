/**
 * Server-side Auth Utilities
 * Validates sessions and protects API routes
 * 
 * LEGACY: referral_records — DO NOT USE
 * Ledger reads/writes now go through signal_actions
 */

import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * Get authenticated Supabase client for server components/routes
 * Validates session from HttpOnly cookies
 */
export async function getAuthenticatedClient() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('sb-access-token')?.value
  const refreshToken = cookieStore.get('sb-refresh-token')?.value

  if (!accessToken) {
    return null
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  })

  // Validate the session
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }

  return { supabase, user }
}

/**
 * Require authenticated user — returns 401 if not authenticated
 */
export async function requireAuth() {
  const result = await getAuthenticatedClient()
  
  if (!result) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return result
}

/**
 * Get user from session — returns null if not authenticated (no error)
 */
export async function getUser() {
  const result = await getAuthenticatedClient()
  return result?.user ?? null
}

/**
 * Check if user has specific role
 */
export async function hasRole(role: string) {
  const result = await getAuthenticatedClient()
  if (!result) return false

  const { user, supabase } = result
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role === role
}

/**
 * Protect an API route — returns error response if not authenticated
 */
export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

/**
 * Protect an API route — returns error response if not admin
 */
export async function requireAdmin() {
  const isAdmin = await hasRole('admin')
  if (!isAdmin) {
    return unauthorized()
  }
  return getAuthenticatedClient()
}
