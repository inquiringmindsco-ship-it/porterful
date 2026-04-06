import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { handle, platform } = await req.json()

    if (!handle?.trim()) {
      return NextResponse.json({ error: 'Handle is required.' }, { status: 400 })
    }
    if (!platform) {
      return NextResponse.json({ error: 'Please select a platform.' }, { status: 400 })
    }

    // Generate slug from handle
    const slug = handle
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '-')
      .replace(/-+/g, '-')
      .replace(/(^-|-$)/g, '')

    if (slug.length < 2) {
      return NextResponse.json({ error: 'Handle must be at least 2 characters.' }, { status: 400 })
    }

    // Lazy init Supabase
    const { createServerClient } = await import('@/lib/supabase')
    const supabase = createServerClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Server not configured. Try again later.' }, { status: 500 })
    }

    // Check if slug already exists
    const { data: existingArtist } = await supabase
      .from('artists')
      .select('id, slug')
      .eq('slug', slug)
      .single()

    if (existingArtist) {
      return NextResponse.json({
        error: `@${handle} is already taken. Try a different handle or apply with full details.`,
      }, { status: 409 })
    }

    // Get platform display name and URL
    const platformConfig: Record<string, { label: string; urlTemplate: (h: string) => string }> = {
      instagram: {
        label: 'Instagram',
        urlTemplate: (h: string) => `https://instagram.com/${h.replace('@', '')}`,
      },
      tiktok: {
        label: 'TikTok',
        urlTemplate: (h: string) => `https://tiktok.com/@${h.replace('@', '')}`,
      },
      youtube: {
        label: 'YouTube',
        urlTemplate: (h: string) => `https://youtube.com/@${h.replace('@', '')}`,
      },
      twitter: {
        label: 'X / Twitter',
        urlTemplate: (h: string) => `https://twitter.com/${h.replace('@', '')}`,
      },
    }

    const platformInfo = platformConfig[platform]
    if (!platformInfo) {
      return NextResponse.json({ error: 'Invalid platform selected.' }, { status: 400 })
    }

    const platformUrl = platformInfo.urlTemplate(handle)
    const displayName = handle
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, (c: string) => c.toUpperCase())

    // Create artist profile stub
    const { data: artist, error: artistError } = await supabase
      .from('artists')
      .insert({
        slug,
        name: displayName,
        bio: `${displayName} is building on Porterful. Stay tuned for new music and merch.`,
        genre: null,
        city: null,
        avatar_url: null, // Will use initial avatar
        cover_url: null,
        verified: false, // Unverified until profile is completed
        instagram_url: platform === 'instagram' ? platformUrl : null,
        youtube_url: platform === 'youtube' ? platformUrl : null,
        twitter_url: platform === 'twitter' ? platformUrl : null,
        tiktok_url: platform === 'tiktok' ? platformUrl : null,
        followers: 0,
        supporters: 0,
        earnings: 0,
        products: 0,
        onboard_source: platform,
        onboard_handle: handle,
      })
      .select()
      .single()

    if (artistError) {
      console.error('Onboard artist creation error:', artistError)
      // Check for slug collision
      if (artistError.code === '23505') {
        return NextResponse.json({
          error: `@${handle} is already on Porterful. Try a different handle.`,
        }, { status: 409 })
      }
      return NextResponse.json({ error: 'Could not create your page. Try again.' }, { status: 500 })
    }

    console.log(`[ONBOARD] Artist stub created: ${slug} via ${platform} @${handle}`)

    return NextResponse.json({
      success: true,
      slug,
      name: displayName,
      message: 'Your artist page is live! Complete your profile to unlock payouts.',
    })

  } catch (err) {
    console.error('Onboard route error:', err)
    return NextResponse.json({ error: 'Server error. Try again or contact support.' }, { status: 500 })
  }
}
