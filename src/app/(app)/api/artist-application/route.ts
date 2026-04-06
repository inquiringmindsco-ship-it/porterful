import { NextResponse } from 'next/server'

// Threshold for auto-approval
function shouldAutoApprove(application: {
  stage_name: string
  genre: string
  bio: string
  email: string
  phone: string
  instagram?: string
  youtube?: string
  tiktok?: string
  twitter?: string
  spotify?: string
  apple_music?: string
  soundcloud?: string
  avatar_url?: string
}): { autoApprove: boolean; missing: string[] } {
  const hasMusicPlatform = application.spotify || application.apple_music || application.soundcloud || application.youtube

  const missing: string[] = []
  if (!application.stage_name?.trim()) missing.push('stage name')
  if (!application.genre?.trim()) missing.push('genre')
  if (!application.bio?.trim() || application.bio.trim().length < 50) missing.push('bio (50+ characters)')
  if (!application.email?.trim()) missing.push('email')
  if (!application.phone?.trim()) missing.push('phone')
  if (!hasMusicPlatform) missing.push('at least one music link (Spotify, Apple Music, SoundCloud, or YouTube)')

  return {
    autoApprove: missing.length === 0,
    missing,
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      user_id,
      stage_name,
      genre,
      city,
      bio,
      email,
      phone,
      instagram,
      twitter,
      youtube,
      tiktok,
      spotify,
      apple_music,
      soundcloud,
      avatar_url,
      cover_image_url,
    } = body

    // Validate required fields with specific error messages
    if (!user_id) {
      return NextResponse.json({ error: 'You must be signed in to apply. Please create an account and try again.' }, { status: 400 })
    }
    if (!stage_name?.trim()) {
      return NextResponse.json({ error: 'Stage name is required.' }, { status: 400 })
    }
    if (!email?.trim()) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 })
    }
    if (!phone?.trim()) {
      return NextResponse.json({ error: 'Phone number is required.' }, { status: 400 })
    }

    // Lazy init — only create client when actually needed (not at module load)
    const { createServerClient } = await import('@/lib/supabase')
    const supabase = createServerClient()
    if (!supabase) return NextResponse.json({ error: 'Server not configured. Please try again later.' }, { status: 500 })

    // Check if already has an application on record
    const { data: existing } = await supabase
      .from('artist_applications')
      .select('id, status')
      .eq('user_id', user_id)
      .single()

    if (existing) {
      return NextResponse.json({
        error: `You already have an application on file (status: ${existing.status}). Only one application per account is allowed.`,
        application_id: existing.id,
      }, { status: 400 })
    }

    // Check auto-approve threshold
    const approval = shouldAutoApprove({
      stage_name,
      genre,
      bio,
      email,
      phone,
      instagram,
      youtube,
      tiktok,
      twitter,
      spotify,
      apple_music,
      soundcloud,
      avatar_url,
    })

    const newStatus = approval.autoApprove ? 'approved' : 'pending_review'
    const reason = approval.autoApprove
      ? 'All threshold requirements met.'
      : 'Missing: ' + approval.missing.join(', ')

    // Insert application
    const { data, error } = await supabase
      .from('artist_applications')
      .insert({
        user_id,
        stage_name,
        genre: genre || null,
        city: city || null,
        bio: bio || null,
        email,
        phone,
        instagram: instagram || null,
        twitter: twitter || null,
        youtube: youtube || null,
        tiktok: tiktok || null,
        spotify: spotify || null,
        apple_music: apple_music || null,
        soundcloud: soundcloud || null,
        avatar_url: avatar_url || null,
        cover_image_url: cover_image_url || null,
        status: newStatus,
        auto_approve_reason: reason,
      })
      .select()
      .single()

    if (error) {
      console.error('Application insert error:', error)
      return NextResponse.json({ error: 'Database error. Please try again in a moment.' }, { status: 500 })
    }

    // If auto-approved, create the artist profile immediately
    if (approval.autoApprove) {
      const slug = stage_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

      const { error: artistError } = await supabase
        .from('artists')
        .insert({
          user_id,
          name: stage_name,
          slug,
          bio: bio || null,
          genre: genre || null,
          city: city || null,
          avatar_url: avatar_url || null,
          cover_url: cover_image_url || null,
          verified: true,
          instagram_url: instagram ? `https://instagram.com/${instagram.replace('@', '')}` : null,
          youtube_url: youtube ? `https://youtube.com/${youtube.replace('@', '')}` : null,
          twitter_url: twitter ? `https://twitter.com/${twitter.replace('@', '')}` : null,
          tiktok_url: tiktok ? `https://tiktok.com/@${tiktok.replace('@', '')}` : null,
        })

      if (artistError) {
        console.error('Artist creation error:', artistError)
        // Application is saved; surface the artist creation issue to caller
        return NextResponse.json({
          success: true,
          application: data,
          status: newStatus,
          warning: 'Your application was approved but there was an issue creating your artist page. An administrator will follow up.',
        })
      }

      // Update user role to artist
      await supabase
        .from('profiles')
        .update({ role: 'artist' })
        .eq('id', user_id)

      console.log(`[AUTO-APPROVED] Artist: ${stage_name} (${slug}) — artist record created`)
    } else {
      console.log(`[PENDING REVIEW] Artist: ${stage_name} — missing: ${approval.missing.join(', ')}`)
    }

    return NextResponse.json({
      success: true,
      application: data,
      status: newStatus,
      message: approval.autoApprove
        ? 'Application approved! Your artist page has been created and is ready to configure.'
        : 'Application submitted. We will review it and get back to you within 24–48 hours.',
    })
  } catch (err) {
    console.error('Application route error:', err)
    return NextResponse.json({ error: 'Server error. Please try again or contact support.' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  // Admin only — check for admin auth header
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET || 'admin-secret'}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { createServerClient } = await import('@/lib/supabase')
  const supabase = createServerClient()
  if (!supabase) return NextResponse.json({ error: 'Server not configured' }, { status: 500 })

  const { data, error } = await supabase
    .from('artist_applications')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  return NextResponse.json({ applications: data })
}
