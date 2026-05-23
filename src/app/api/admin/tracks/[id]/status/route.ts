import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

/**
 * PATCH /api/admin/tracks/[id]/status
 * 
 * PHASE D: Founder/Admin server endpoint for track publish/hide.
 * Bypasses RLS by using service role key.
 * Validates founder role before mutating.
 * 
 * Body: { status: 'live' | 'draft' | 'archived' | 'pending_review' }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json()
    const trackId = params.id

    if (!trackId || !status) {
      return NextResponse.json({ error: 'Missing track ID or status' }, { status: 400 })
    }

    // Validate status values
    const validStatuses = ['live', 'draft', 'archived', 'pending_review', 'rejected']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    })

    // Verify the requester is a founder/admin
    // Get auth header
    const authHeader = request.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '').trim()
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized — no session token' }, { status: 401 })
    }

    // Verify token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized — invalid session' }, { status: 401 })
    }

    // Check user's role in profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Unauthorized — profile not found' }, { status: 403 })
    }

    const allowedRoles = ['founder', 'admin', 'superadmin']
    if (!allowedRoles.includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden — founder/admin only' }, { status: 403 })
    }

    // PHASE D: Publish/hide track
    // live → is_active: true
    // draft/archived/rejected → is_active: false
    const isActive = status === 'live'

    const { data: updatedTrack, error: updateError } = await supabase
      .from('tracks')
      .update({ status, is_active: isActive })
      .eq('id', trackId)
      .select()
      .single()

    if (updateError) {
      console.error('[admin/track-status] Update error:', updateError)
      return NextResponse.json({ error: 'Failed to update track status' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      track: updatedTrack,
      message: `Track status updated to ${status}`,
    })
  } catch (err: any) {
    console.error('[admin/track-status] Error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
