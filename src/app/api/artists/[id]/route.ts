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
    // Try static fallback first
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

    // Try to fetch profile by ID first
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', params.id)
      .single()

    // If not found by ID, try finding by slug in artists table
    if (profileError || !profile) {
      const { data: artistBySlug } = await supabase
        .from('artists')
        .select('id')
        .eq('slug', params.id)
        .single()

      if (artistBySlug) {
        const { data: profileBySlug } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', artistBySlug.id)
          .single()
        if (profileBySlug) {
          profile = profileBySlug
          profileError = null
        }
      }
    }

    // Fetch artist-specific data from DB first
    const { data: dbArtist } = await supabase
      .from('artists')
      .select('*')
      .eq('id', params.id)
      .single()

    // If no DB artist found, try by slug
    let artistData = dbArtist
    let resolvedProfile = profile
    
    if (!dbArtist) {
      const { data: artistBySlug } = await supabase
        .from('artists')
        .select('*')
        .eq('slug', params.id)
        .single()
      
      if (artistBySlug) {
        artistData = artistBySlug
        // Try to get profile for this artist
        if (!resolvedProfile) {
          const { data: slugProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', artistBySlug.id)
            .single()
          if (slugProfile) resolvedProfile = slugProfile
        }
      }
    }

    // If we have a DB artist, use it as primary source
    if (artistData) {
      // Merge DB artist data with static fallback only for missing fields
      const mergedData = {
        ...resolvedProfile,
        ...artistData,
        // Ensure critical fields come from DB if present
        name: artistData.name || resolvedProfile?.full_name || staticArtist?.name || 'Unknown',
        bio: artistData.bio || resolvedProfile?.bio || staticArtist?.bio || '',
        genre: artistData.genre || resolvedProfile?.genre || staticArtist?.genre || '',
        location: artistData.location || resolvedProfile?.location || staticArtist?.location || '',
        slug: artistData.slug || resolvedProfile?.username || staticArtist?.slug || params.id,
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

    if (Object.keys(artistUpdates).length > 0) {
      // Check if artist record exists
      const { data: existing, error: existingError } = await supabase
        .from('artists')
        .select('id')
        .eq('id', params.id)
        .maybeSingle()

      if (existingError) {
        console.error('Artist lookup error:', existingError)
        return NextResponse.json({ error: 'Failed to verify artist profile' }, { status: 500 })
      }

      if (existing) {
        const { error: artistError } = await supabase
          .from('artists')
          .update(artistUpdates)
          .eq('id', params.id)

        if (artistError) {
          console.error('Artist update error:', artistError)
          return NextResponse.json({ error: 'Failed to update artist profile' }, { status: 500 })
        }
      } else {
        const { error: artistError } = await supabase
          .from('artists')
          .insert({ id: params.id, ...artistUpdates })

        if (artistError) {
          console.error('Artist insert error:', artistError)
          return NextResponse.json({ error: 'Failed to create artist profile' }, { status: 500 })
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating artist:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
