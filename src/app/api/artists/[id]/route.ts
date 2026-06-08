import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { ARTISTS } from '@/lib/artists'
import { isPublicArtistEligible } from '@/lib/public-artists'
import { normalizeArtistAppearance } from '@/lib/artist-theme'

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
    // PHASE A GUARDRAIL: Check public eligibility before returning
    if (dbArtist) {
      const socialLinks = typeof dbArtist.social_links === 'object' && dbArtist.social_links ? dbArtist.social_links : {}
      const isPublic = isPublicArtistEligible({
        status: dbArtist.status,
        public_profile_enabled: dbArtist.public_profile_enabled,
      })
      
      // If not publicly eligible, return 404 for public requests
      // (Internal/dashboard requests should use a different endpoint with auth)
      if (!isPublic) {
        return NextResponse.json({ error: 'Artist not found or not publicly visible' }, { status: 404 })
      }

      const mergedData = {
        ...profile,
        ...dbArtist,
        // Ensure critical fields come from DB if present
        name: dbArtist.name || profile?.full_name || staticArtist?.name || 'Unknown',
        bio: dbArtist.bio || profile?.bio || staticArtist?.bio || '',
        genre: dbArtist.genre || profile?.genre || staticArtist?.genre || '',
        location: dbArtist.location || profile?.location || staticArtist?.location || '',
        slug: dbArtist.slug || profile?.username || staticArtist?.slug || params.id,
        appearance: normalizeArtistAppearance(
          dbArtist.appearance || dbArtist.artist_appearance || socialLinks.appearance,
          staticArtist?.appearance || undefined,
        ),
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
    const {
      name,
      bio,
      genre,
      location,
      website,
      youtube_url,
      twitter_url,
      x_url,
      instagram_url,
      tiktok_url,
      avatar_url,
      profile_image_url,
      cover_url,
      banner_url,
      hero_image_url,
      appearance,
      appearance_settings,
      primary_color,
      secondary_color,
      accent_color,
      background_style,
      color_mode,
      profile_image_shape,
      profile_image_focus,
      profile_image_position,
    } = body

    // Use service role for update (bypasses RLS after auth check)
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      { auth: { persistSession: false } }
    )

    // Update artists table
    const artistUpdates: Record<string, any> = {}
    if (name !== undefined) artistUpdates.name = name
    if (bio !== undefined) artistUpdates.bio = bio
    if (location !== undefined) artistUpdates.location = location
    if (website !== undefined) artistUpdates.website_url = website
    if (genre !== undefined) artistUpdates.genre = genre
    if (youtube_url !== undefined) artistUpdates.youtube_url = youtube_url
    if (twitter_url !== undefined) artistUpdates.twitter_url = twitter_url
    if (x_url !== undefined && twitter_url === undefined) artistUpdates.twitter_url = x_url
    if (instagram_url !== undefined) artistUpdates.instagram_url = instagram_url
    // Also update social_links JSON as fallback for columns that may not exist yet (tiktok_url, x_url)
    if (tiktok_url !== undefined || x_url !== undefined || youtube_url !== undefined || instagram_url !== undefined || twitter_url !== undefined) {
      const { data: currentArtist } = await serviceSupabase
        .from('artists')
        .select('social_links')
        .eq('id', params.id)
        .single()
      
      const socialLinks = typeof currentArtist?.social_links === 'object' && currentArtist?.social_links ? currentArtist.social_links : {}
      
      if (tiktok_url !== undefined) socialLinks.tiktok = tiktok_url
      if (x_url !== undefined) socialLinks.x = x_url
      if (youtube_url !== undefined) socialLinks.youtube = youtube_url
      if (instagram_url !== undefined) socialLinks.instagram = instagram_url
      if (twitter_url !== undefined) socialLinks.twitter = twitter_url
      
      artistUpdates.social_links = socialLinks
    }
    if (avatar_url !== undefined) artistUpdates.avatar_url = avatar_url
    if (profile_image_url !== undefined && avatar_url === undefined) artistUpdates.avatar_url = profile_image_url
    if (cover_url !== undefined) artistUpdates.cover_url = cover_url
    if (banner_url !== undefined && cover_url === undefined) artistUpdates.cover_url = banner_url
    if (hero_image_url !== undefined && cover_url === undefined && banner_url === undefined) artistUpdates.cover_url = hero_image_url

    if (
      appearance !== undefined ||
      appearance_settings !== undefined ||
      primary_color !== undefined ||
      secondary_color !== undefined ||
      accent_color !== undefined ||
      background_style !== undefined ||
      color_mode !== undefined ||
      profile_image_shape !== undefined ||
      profile_image_focus !== undefined ||
      profile_image_position !== undefined
    ) {
      const { data: currentArtist } = await serviceSupabase
        .from('artists')
        .select('social_links, appearance, artist_appearance')
        .eq('id', params.id)
        .single()

      const socialLinks = typeof currentArtist?.social_links === 'object' && currentArtist?.social_links ? { ...currentArtist.social_links } : {}
      const currentAppearance = normalizeArtistAppearance(
        currentArtist?.appearance || currentArtist?.artist_appearance || socialLinks.appearance,
        null,
      )

      const nextAppearance = normalizeArtistAppearance(
        appearance || appearance_settings || {
          primaryColor: primary_color,
          secondaryColor: secondary_color,
          accentColor: accent_color,
          backgroundStyle: background_style,
          colorMode: color_mode,
          profileImageShape: profile_image_shape,
          profileImageFocus: profile_image_focus,
          profileImagePosition: profile_image_position,
        },
        currentAppearance || undefined,
      )

      socialLinks.appearance = nextAppearance
      artistUpdates.social_links = socialLinks
    }

    // Update artists table
    const { data: artistData, error: artistError } = await serviceSupabase
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
