import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// GET /api/artists/[id] - Get artist profile
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
          },
        },
      }
    )

    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', params.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 })
    }

    // Fetch artist-specific data
    const { data: artistData } = await supabase
      .from('artists')
      .select('*')
      .eq('id', params.id)
      .single()

    return NextResponse.json({
      profile: { ...profile, ...artistData }
    })
  } catch (error) {
    console.error('Error fetching artist:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PATCH /api/artists/[id] - Update artist profile
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
          },
        },
      }
    )

    // Verify current user owns this profile
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user || session.user.id !== params.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, bio, genre, location, website, youtube_url, twitter_url, instagram_url, avatar_url, cover_url } = body

    // Update profiles table
    const profileUpdates: Record<string, string> = {}
    if (name !== undefined) profileUpdates.full_name = name
    if (avatar_url !== undefined) profileUpdates.avatar_url = avatar_url
    if (cover_url !== undefined) profileUpdates.cover_url = cover_url

    if (Object.keys(profileUpdates).length > 0) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', params.id)

      if (profileError) {
        console.error('Profile update error:', profileError)
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
      }
    }

    // Update artists table
    const artistUpdates: Record<string, string> = {}
    if (bio !== undefined) artistUpdates.bio = bio
    if (genre !== undefined) artistUpdates.genre = genre
    if (youtube_url !== undefined) artistUpdates.youtube_url = youtube_url
    if (twitter_url !== undefined) artistUpdates.twitter_url = twitter_url
    if (instagram_url !== undefined) artistUpdates.instagram_url = instagram_url
    if (cover_url !== undefined) artistUpdates.cover_url = cover_url

    if (Object.keys(artistUpdates).length > 0) {
      // Check if artist record exists
      const { data: existing } = await supabase
        .from('artists')
        .select('id')
        .eq('id', params.id)
        .single()

      if (existing) {
        const { error: artistError } = await supabase
          .from('artists')
          .update(artistUpdates)
          .eq('id', params.id)

        if (artistError) {
          console.error('Artist update error:', artistError)
        }
      } else {
        const { error: artistError } = await supabase
          .from('artists')
          .insert({ id: params.id, ...artistUpdates })

        if (artistError) {
          console.error('Artist insert error:', artistError)
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating artist:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
