import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    )

    const { data: artists, error } = await supabase
      .from('artists')
      .select('id, name, slug, status, public_profile_enabled')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message, artists: [] })
    }

    return NextResponse.json({
      raw: artists,
      rachel: artists?.find((a: any) => a.slug === 'rachel-herron-dkwi'),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message })
  }
}
