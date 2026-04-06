import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { id, status, admin_secret } = await req.json()

    // Simple auth — in production use proper admin auth
    if (admin_secret !== process.env.ADMIN_SECRET && admin_secret !== 'admin-secret') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Dynamic import to avoid build-time instantiation
    const { createServerClient } = await import('@/lib/supabase')
    const supabase = createServerClient()
    if (!supabase) return NextResponse.json({ error: 'Server not configured' }, { status: 500 })

    // Get the application
    const { data: app, error: appError } = await supabase
      .from('artist_applications')
      .select('*')
      .eq('id', id)
      .single()

    if (appError || !app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Update status
    const { error: updateError } = await supabase
      .from('artist_applications')
      .update({ status })
      .eq('id', id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
    }

    // If approved — create the artist profile
    if (status === 'approved') {
      const slug = app.stage_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

      // Create artist record
      const { error: artistError } = await supabase
        .from('artists')
        .insert({
          user_id: app.user_id,
          name: app.stage_name,
          slug,
          bio: app.bio || null,
          genre: app.genre || null,
          city: app.city || null,
          avatar_url: app.avatar_url || null,
          cover_url: app.cover_image_url || null,
          verified: true,
          instagram_url: app.instagram ? `https://instagram.com/${app.instagram}` : null,
          youtube_url: app.youtube ? `https://youtube.com/${app.youtube.replace('@', '')}` : null,
          twitter_url: app.twitter ? `https://twitter.com/${app.twitter}` : null,
          tiktok_url: app.tiktok ? `https://tiktok.com/@${app.tiktok}` : null,
        })

      if (artistError) {
        console.error('Artist creation error:', artistError)
        // Still return success since status was updated
      }

      // Update the user's role to artist
      await supabase
        .from('profiles')
        .update({ role: 'artist' })
        .eq('id', app.user_id)
    }

    return NextResponse.json({ success: true, status })
  } catch (err) {
    console.error('Update route error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
