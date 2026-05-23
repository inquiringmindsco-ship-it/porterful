import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getServerSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function GET() {
  try {
    const supabase = getServerSupabase()
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value')
      .eq('key', 'homepage')
      .single()

    if (error) {
      console.error('[site-settings] DB error:', error)
      return NextResponse.json({ settings: null })
    }

    return NextResponse.json({ settings: data?.value || {} })
  } catch (error) {
    console.error('Site settings error:', error)
    return NextResponse.json({ settings: null })
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = getServerSupabase()
    const body = await req.json()
    
    const { data, error } = await supabase
      .from('site_settings')
      .update({ value: body, updated_at: new Date().toISOString() })
      .eq('key', 'homepage')
      .select()

    if (error) {
      console.error('[site-settings] Update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, settings: data?.[0]?.value })
  } catch (error: any) {
    console.error('Site settings update error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
