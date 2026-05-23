import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function createSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseAdmin()
    
    const { data: track, error } = await supabase
      .from('tracks')
      .select('audio_url')
      .eq('id', params.id)
      .single()
    
    if (error || !track?.audio_url) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 })
    }
    
    // Redirect to the actual audio file in Supabase storage
    return NextResponse.redirect(track.audio_url)
  } catch (error) {
    console.error('Audio redirect error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
