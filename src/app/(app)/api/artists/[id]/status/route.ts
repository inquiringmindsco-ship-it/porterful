import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getServerSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

const ALLOWED_STATUSES = ['active', 'approved', 'pending', 'suspended']

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status } = body

    // Validate input
    if (!status || typeof status !== 'string') {
      return NextResponse.json(
        { error: 'Status string is required' },
        { status: 400 }
      )
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Status must be one of: ${ALLOWED_STATUSES.join(', ')}` },
        { status: 400 }
      )
    }

    const supabase = getServerSupabase()

    // Verify the requesting user is founder/admin
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'founder' && profile.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Forbidden: founder or admin required' },
        { status: 403 }
      )
    }

    // Determine visibility based on status
    const public_profile_enabled = status === 'active' || status === 'approved'

    // Perform the update with service role
    const { data, error } = await supabase
      .from('artists')
      .update({ 
        status,
        public_profile_enabled,
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('[api/artists/status] Update error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      artist: data,
      status,
      public_profile_enabled,
    })
  } catch (error: any) {
    console.error('[api/artists/status] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}