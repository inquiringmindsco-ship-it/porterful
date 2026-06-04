import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAccess, getAdminClient } from '@/lib/admin-client'
import { createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/users
 *
 * Returns user counts and optionally full user list for founder/admin dashboard.
 * Requires founder or admin role.
 */
export async function GET(request: NextRequest) {
  try {
    // Use centralized admin verification
    const auth = await verifyAdminAccess(request)
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error || 'Forbidden: founder or admin required' },
        { status: 403 }
      )
    }

    const supabase = createServerClient()
    const adminClient = getAdminClient()

    // Fetch all profiles with role counts
    const { data: profiles, error: profilesError } = await adminClient
      .from('profiles')
      .select('id, role, created_at, email, full_name, username')

    if (profilesError) {
      console.error('[api/admin/users] Error fetching profiles:', profilesError)
      return NextResponse.json(
        { error: 'Failed to fetch user profiles' },
        { status: 500 }
      )
    }

    // Count users by role
    const counts = {
      total: profiles?.length || 0,
      artists: profiles?.filter(p => p.role === 'artist').length || 0,
      fans: profiles?.filter(p => p.role === 'supporter' || p.role === 'listener').length || 0,
      businesses: profiles?.filter(p => p.role === 'business' || p.role === 'brand').length || 0,
      admins: profiles?.filter(p => p.role === 'admin').length || 0,
      founders: profiles?.filter(p => p.role === 'founder').length || 0,
      needs_attention: 0,
      completed_onboarding: 0,
      uploaded_music: 0,
    }

    // Fetch all artists for join
    const { data: artists } = await adminClient
      .from('artists')
      .select('*')

    // Fetch track counts per user
    const { data: tracks } = await adminClient
      .from('tracks')
      .select('artist_id, status')

    // Build enriched user list
    const users = (profiles || []).map(profile => {
      const artistProfile = artists?.find(a => a.id === profile.id)
      const userTracks = tracks?.filter(t => t.artist_id === profile.id) || []
      const liveTracks = userTracks.filter(t => t.status === 'live' || t.status === 'active')

      const needsAttention = profile.role === 'artist' && (!artistProfile || artistProfile.status === 'pending')
      const completedOnboarding = !!artistProfile
      const uploadedMusic = userTracks.length > 0

      if (needsAttention) counts.needs_attention++
      if (completedOnboarding) counts.completed_onboarding++
      if (uploadedMusic) counts.uploaded_music++

      return {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        username: profile.username,
        role: profile.role,
        signup_date: profile.created_at,
        email_confirmed: true, // Simplified; could check auth.users
        artist_profile: artistProfile
          ? {
              status: artistProfile.status,
              name: artistProfile.name,
              public_profile_enabled: artistProfile.public_profile_enabled,
            }
          : null,
        track_count: userTracks.length,
        live_track_count: liveTracks.length,
        needs_attention: needsAttention,
        attention_reasons: needsAttention ? ['pending_approval'] : [],
        last_seen: profile.created_at, // Could be enhanced with auth logins
      }
    })

    return NextResponse.json({
      counts,
      users: users.sort((a, b) => new Date(b.signup_date).getTime() - new Date(a.signup_date).getTime()),
    })
  } catch (error: any) {
    console.error('[api/admin/users] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
