import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { buildArtistWelcomeEmailHTML, buildArtistWelcomeEmailText } from '@/lib/artist-welcome-email'
import { recordRoleTransition } from '@/lib/server/role-transitions'

function getResend() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey || apiKey === 're_test') return null
  return new Resend(apiKey)
}

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
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

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

      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', app.user_id)
        .maybeSingle()

      // Check if artist already exists
      const { data: existingArtist } = await supabase
        .from('artists')
        .select('id')
        .eq('slug', slug)
        .maybeSingle()

      if (existingArtist) {
        // Update existing artist to active
        await supabase
          .from('artists')
          .update({ status: 'active', public_profile_enabled: true })
          .eq('id', existingArtist.id)
      } else {
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
            status: 'active',
            public_profile_enabled: true,
            instagram_url: app.instagram ? `https://instagram.com/${app.instagram}` : null,
            youtube_url: app.youtube ? `https://youtube.com/${app.youtube.replace('@', '')}` : null,
            twitter_url: app.twitter ? `https://twitter.com/${app.twitter}` : null,
            tiktok_url: app.tiktok ? `https://tiktok.com/@${app.tiktok}` : null,
          })

        if (artistError) {
          console.error('Artist creation error:', artistError)
          // Still return success since status was updated
        }
      }

      // Update the user's role to artist
      await supabase
        .from('profiles')
        .update({ role: 'artist' })
        .eq('id', app.user_id)

      await recordRoleTransition(supabase, {
        userId: app.user_id,
        previousRole: currentProfile?.role || 'supporter',
        nextRole: 'artist',
        performedByUserId: null,
        source: 'artist_application_approval',
        reason: 'Artist application approved by admin',
        metadata: {
          application_id: app.id,
          artist_slug: slug,
        },
      })

      await adminSupabase.auth.admin.updateUserById(app.user_id, {
        user_metadata: { role: 'artist' },
      })

      const resend = getResend()
      if (resend && app.email && String(currentProfile?.role || '').toLowerCase() !== 'artist') {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://porterful.com'
        const dashboardUrl = `${siteUrl}/dashboard/artist`
        const artistPageUrl = `${siteUrl}/artist/${slug}`
        try {
          const html = buildArtistWelcomeEmailHTML({
            artistName: app.stage_name,
            dashboardUrl,
            artistPageUrl,
            genre: app.genre || null,
            city: app.city || null,
          })
          const text = buildArtistWelcomeEmailText({
            artistName: app.stage_name,
            dashboardUrl,
            artistPageUrl,
            genre: app.genre || null,
            city: app.city || null,
          })

          await resend.emails.send({
            from: 'Porterful <noreply@likenessverified.com>',
            to: [app.email],
            subject: `Welcome to Porterful, ${app.stage_name}`,
            html,
            text,
          })
        } catch (welcomeError) {
          console.warn('[artist-application/update] welcome email failed:', welcomeError)
        }
      }
    }

    return NextResponse.json({ success: true, status })
  } catch (err) {
    console.error('Update route error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
