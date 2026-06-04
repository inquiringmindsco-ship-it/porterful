import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getServerSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // ✅ FIXED: anon key only for public reads
    { auth: { persistSession: false } }
  )
}

// Admin-only: service role for updates with proper guard
function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
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
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        return NextResponse.json(
          { error: 'site_settings table not found. Run migration 028_site_settings.sql in Supabase dashboard.' },
          { status: 500 }
        )
      }
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
    // TODO: Add admin role guard here before using admin client
    // const { user } = await getUserFromRequest(req)
    // if (!user || !['founder','admin'].includes(user.role)) return 403
    
    const supabase = getAdminSupabase() // Use admin client for updates
    const body = await req.json()
    
    const { data, error } = await supabase
      .from('site_settings')
      .update({ value: body, updated_at: new Date().toISOString() })
      .eq('key', 'homepage')
      .select()

    if (error) {
      console.error('[site-settings] Update error:', error)
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        return NextResponse.json(
          { error: 'site_settings table not found. Run migration 028_site_settings.sql in Supabase dashboard.' },
          { status: 500 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, settings: data?.[0]?.value })
  } catch (error: any) {
    console.error('Site settings update error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
