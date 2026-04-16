'use client'

import { createBrowserClient } from '@supabase/ssr'

function getCookieAll() {
  return document.cookie.split(';').map(c => {
    const [name, ...rest] = c.trim().split('=')
    return { name, value: rest.join('=') }
  })
}

function setCookieAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
  cookiesToSet.forEach(({ name, value, options }) => {
    let cookieStr = `${name}=${value}`
    if (options) {
      if (typeof options.maxAge === 'number') cookieStr += `; Max-Age=${options.maxAge}`
      if (options.path) cookieStr += `; Path=${options.path}`
      if (options.domain) cookieStr += `; Domain=${options.domain}`
      if (options.sameSite) cookieStr += `; SameSite=${options.sameSite}`
      if (options.secure) cookieStr += `; Secure`
      if (options.httpOnly) cookieStr += `; HttpOnly`
    }
    document.cookie = cookieStr
  })
}

export function createBrowserSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error('Supabase environment variables are not configured')
  }

  // Use explicit cookie getAll/setAll so code_verifier is stored in
  // document.cookie (same as server route handler reads from).
  // Without this, browser client uses localStorage and server cannot see
  // the code_verifier needed for PKCE exchange.
  return createBrowserClient(url, anonKey, {
    cookies: {
      getAll: getCookieAll,
      setAll: setCookieAll,
    },
    auth: {
      flowType: 'pkce',
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  })
}