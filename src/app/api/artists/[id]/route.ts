import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { ARTISTS } from '@/lib/artists'

export const dynamic = 'force-dynamic'

// GET /api/artists/[id] - Get artist profile by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Try static fallback for reference
    const staticArtist = ARTISTS.find(a => a.id === params.id || a.slug === params.id)

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

    // Try to fetch artist by ID first (DB is canonical)
    let dbArtist = null
    let profile = null

    const { data: artistById } = await supabase
      .from('artists')
      .select('*')
      .eq('id', params.id)
      .maybeSingle()

    if (artistById) {
      dbArtist = artistById
    } else {
      // Try by slug
      const { data: artistBySlug } = await supabase
        .from('artists')
        .select('*')
        .eq('slug', params.id)
        .maybeSingle()
      if (artistBySlug) dbArtist = artistBySlug
    }

    // Fetch profile for additional data
    const artistId = dbArtist?.id || params.id
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', artistId)
      .maybeSingle()
    if (profileData) profile = profileData

    // If we have a DB artist, use it as primary source
    if (dbArtist) {
      const mergedData = {
        ...profile,
        ...dbArtist,
        // Ensure critical fields come from DB if present
        name: dbArtist.name || profile?.full_name || staticArtist?.name || 'Unknown',
        bio: dbArtist.bio || profile?.bio || staticArtist?.bio || '',
        genre: dbArtist.genre || profile?.genre || staticArtist?.genre || '',
        location: dbArtist.location || profile?.location || staticArtist?.location || '',
        slug: dbArtist.slug || profile?.username || staticArtist?.slug || params.id,
      }
      return NextResponse.json({ profile: mergedData })
    }

    // If no DB artist at all, try static fallback
    if (staticArtist) {
      return NextResponse.json({
        profile: { ...profile, ...staticArtist, full_name: staticArtist.name }
      })
    }

    return NextResponse.json({ error: 'Artist not found' }, { status: 404 })
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

    // Update artists table
    const artistUpdates: Record<string, string> = {}
    if (name !== undefined) artistUpdates.name = name
    if (bio !== undefined) artistUpdates.bio = bio
    if (location !== undefined) artistUpdates.location = location
    if (website !== undefined) artistUpdates.website_url = website
    if (genre !== undefined) artistUpdates.genre = genre
    if (youtube_url !== undefined) artistUpdates.youtube_url = youtube_url
    if (twitter_url !== undefined) artistUpdates.twitter_url = twitter_url
    if (instagram_url !== undefined) artistUpdates.instagram_url = instagram_url
    if (avatar_url !== undefined) artistUpdates.avatar_url = avatar_url
    if (cover_url !== undefined) artistUpdates.cover_url = cover_url

    // Update artists table
    const { data: artistData, error: artistError } = await supabase
      .from('artists')
      .update(artistUpdates)
      .eq('id', params.id)
      .select()
      .single()

    if (artistError) {
      console.error('Error updating artist:', artistError)
      return NextResponse.json({ error: 'Failed to update artist' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      profile: artistData
    })
  } catch (error) {
    console.error('Error updating artist:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
