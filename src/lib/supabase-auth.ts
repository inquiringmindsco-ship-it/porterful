import {
  createBrowserClient,
  createServerClient,
  type CookieOptions,
} from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { NextRequest, NextResponse } from 'next/server'

type CookieRecord = {
  name: string
  value: string
  options?: CookieOptions
}

type ReadonlyCookieStore = {
  getAll(): CookieRecord[]
}

type MutableCookieStore = ReadonlyCookieStore & {
  set(name: string, value: string, options?: CookieOptions): void
}

const DEFAULT_SITE_URL = 'http://localhost:3000'
export const DEFAULT_AUTH_REDIRECT_PATH = '/dashboard'

function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error('Supabase environment variables are not configured')
  }

  return { url, anonKey }
}

function getAuthOptions() {
  return {
    flowType: 'pkce' as const,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  }
}

export function getAuthCallbackUrl() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL
  return new URL('/auth/callback', siteUrl).toString()
}

export function getSafeAuthRedirectPath(next?: string | null) {
  if (!next || !next.startsWith('/') || next.startsWith('//')) {
    return DEFAULT_AUTH_REDIRECT_PATH
  }

  return next
}

export function createBrowserSupabaseClient() {
  const { url, anonKey } = getSupabaseEnv()

  return createBrowserClient(url, anonKey, {
    auth: getAuthOptions(),
  })
}

export function createServerComponentSupabaseClient(cookieStore: ReadonlyCookieStore) {
  const { url, anonKey } = getSupabaseEnv()

  return createServerClient(url, anonKey, {
    auth: getAuthOptions(),
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll() {},
    },
  })
}

export function createRouteHandlerSupabaseClient(
  cookieStore: MutableCookieStore,
  response: NextResponse,
) {
  const { url, anonKey } = getSupabaseEnv()

  return createServerClient(url, anonKey, {
    auth: getAuthOptions(),
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options)
          response.cookies.set(name, value, options)
        })
      },
    },
  })
}

export function createMiddlewareSupabaseClient(
  request: NextRequest,
  response: NextResponse,
) {
  const { url, anonKey } = getSupabaseEnv()

  return createServerClient(url, anonKey, {
    auth: getAuthOptions(),
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value)
          response.cookies.set(name, value, options)
        })
      },
    },
  })
}

export async function getServerUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const supabase = createServerComponentSupabaseClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}
