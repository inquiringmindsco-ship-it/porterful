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

export async function GET(request: NextRequest) {
  try {
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

    // Fetch all profiles with artist data
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name, username, role, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (profilesError) {
      console.error('[api/admin/users] profiles error:', profilesError)
      return NextResponse.json(
        { error: 'Failed to fetch profiles' },
        { status: 500 }
      )
    }

    // Fetch all artists
    const { data: artists, error: artistsError } = await supabase
      .from('artists')
      .select('id, status, public_profile_enabled, created_at')

    if (artistsError) {
      console.error('[api/admin/users] artists error:', artistsError)
    }

    // Fetch artist applications for promotion hints
    const { data: artistApplications, error: artistApplicationsError } = await supabase
      .from('artist_applications')
      .select('id, user_id, stage_name, genre, city, bio, email, phone, status, created_at')
      .order('created_at', { ascending: false })

    if (artistApplicationsError) {
      console.error('[api/admin/users] artist applications error:', artistApplicationsError)
    }

    // Fetch all tracks
    const { data: tracks, error: tracksError } = await supabase
      .from('tracks')
      .select('id, artist_id, status, is_active, created_at')

    if (tracksError) {
      console.error('[api/admin/users] tracks error:', tracksError)
    }

    // Build artist lookup
    const artistMap = new Map()
    artists?.forEach(a => artistMap.set(a.id, a))

    // Build track counts per artist
    const trackCounts = new Map()
    const liveTrackCounts = new Map()
    tracks?.forEach(t => {
      const count = trackCounts.get(t.artist_id) || 0
      trackCounts.set(t.artist_id, count + 1)
      
      if (t.status === 'live' || t.is_active) {
        const liveCount = liveTrackCounts.get(t.artist_id) || 0
        liveTrackCounts.set(t.artist_id, liveCount + 1)
      }
    })

    // Get auth user data for email confirmation
    const { data: authUsers, error: authError2 } = await supabase.auth.admin.listUsers()
    
    if (authError2) {
      console.error('[api/admin/users] auth users error:', authError2)
    }

    const authUserMap = new Map()
    authUsers?.users?.forEach(u => {
      authUserMap.set(u.id, {
        email_confirmed_at: u.email_confirmed_at,
        last_sign_in_at: u.last_sign_in_at,
      })
    })

    const applicationMap = new Map()
    artistApplications?.forEach(app => {
      if (!applicationMap.has(app.user_id)) {
        applicationMap.set(app.user_id, app)
      }
    })

    // Build enriched user list
    const enrichedUsers = profiles.map(p => {
      const artist = artistMap.get(p.id)
      const application = applicationMap.get(p.id) || null
      const trackCount = trackCounts.get(p.id) || 0
      const liveTrackCount = liveTrackCounts.get(p.id) || 0
      const authData = authUserMap.get(p.id) || {}

      // Determine needs attention
      const attentionReasons: string[] = []
      
      if (!authData.email_confirmed_at) {
        attentionReasons.push('Email not confirmed')
      }
      
      if (p.role === 'artist' && !artist) {
        attentionReasons.push('Artist role but no profile')
      }

      if (p.role !== 'artist' && application) {
        attentionReasons.push('Artist application on file')
      }
      
      if (artist && artist.status === 'pending' && trackCount === 0) {
        attentionReasons.push('Pending artist, no uploads')
      }
      
      if (trackCount > 0 && liveTrackCount === 0) {
        attentionReasons.push('Uploads but none live')
      }
      
      if (artist && artist.status === 'suspended') {
        attentionReasons.push('Suspended')
      }

      return {
        id: p.id,
        email: p.email,
        full_name: p.full_name,
        username: p.username,
        role: p.role,
        signup_date: p.created_at,
        email_confirmed: !!authData.email_confirmed_at,
        last_seen: authData.last_sign_in_at,
        artist_profile: artist ? {
          status: artist.status,
          public_profile_enabled: artist.public_profile_enabled,
          created_at: artist.created_at,
        } : null,
        artist_application: application ? {
          id: application.id,
          stage_name: application.stage_name,
          genre: application.genre,
          city: application.city,
          bio: application.bio,
          email: application.email,
          phone: application.phone,
          status: application.status,
          created_at: application.created_at,
        } : null,
        track_count: trackCount,
        live_track_count: liveTrackCount,
        needs_attention: attentionReasons.length > 0,
        attention_reasons: attentionReasons,
      }
    })

    // Calculate counts
    const counts = {
      total: enrichedUsers.length,
      artists: enrichedUsers.filter(u => u.role === 'artist').length,
      fans: enrichedUsers.filter(u => u.role === 'supporter' || u.role === 'superfan').length,
      businesses: enrichedUsers.filter(u => u.role === 'business' || u.role === 'brand').length,
      admins: enrichedUsers.filter(u => u.role === 'admin' || u.role === 'founder').length,
      needs_attention: enrichedUsers.filter(u => u.needs_attention).length,
      completed_onboarding: enrichedUsers.filter(u => u.artist_profile && u.track_count > 0).length,
      uploaded_music: enrichedUsers.filter(u => u.track_count > 0).length,
    }

    return NextResponse.json({
      users: enrichedUsers,
      counts,
    })
  } catch (error: any) {
    console.error('[api/admin/users] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
