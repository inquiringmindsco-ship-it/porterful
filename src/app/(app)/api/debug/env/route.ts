import { NextResponse } from 'next/server'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING'
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING'
  
  return NextResponse.json({
    supabaseUrl: url ? 'SET' : 'MISSING',
    anonKey,
    serviceKey,
    urlPrefix: url ? url.substring(0, 30) : 'MISSING',
  })
}