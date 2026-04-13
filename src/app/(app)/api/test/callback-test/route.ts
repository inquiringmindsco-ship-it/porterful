import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Diagnostic endpoint — logs all query params and returns them so browser can see
export async function GET(request: Request) {
  const url = new URL(request.url)
  const params = Object.fromEntries(url.searchParams)

  return NextResponse.json({
    received: true,
    path: url.pathname,
    params,
    timestamp: new Date().toISOString(),
  })
}