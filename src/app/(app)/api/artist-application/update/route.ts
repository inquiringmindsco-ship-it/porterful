import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { buildArtistWelcomeEmailHTML, buildArtistWelcomeEmailText } from '@/lib/artist-welcome-email'
import { promoteUserToArtist } from '@/lib/server/artist-promotion'

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

    // If approved — promote the user to artist via the shared helper
    if (status === 'approved') {
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('role, email')
        .eq('id', app.user_id)
        .maybeSingle()

      const wasAlreadyArtist = String(currentProfile?.role || '').toLowerCase() === 'artist'

      // Delegate artist row + role + auth metadata + role transition to the helper.
      // Helper handles: slug collision (with .neq), auth metadata merge, role-transition audit.
      const promotion = await promoteUserToArtist(supabase, {
        userId: app.user_id,
        artistName: app.stage_name,
        bio: app.bio || null,
        genre: app.genre || null,
        city: app.city || null,
        avatarUrl: app.avatar_url || null,
        coverUrl: app.cover_image_url || null,
        instagramUrl: app.instagram ? `https://instagram.com/${String(app.instagram).replace('@', '')}` : null,
        youtubeUrl: app.youtube ? `https://youtube.com/@${String(app.youtube).replace('@', '')}` : null,
        twitterUrl: app.twitter ? `https://twitter.com/${String(app.twitter).replace('@', '')}` : null,
        tiktokUrl: app.tiktok ? `https://tiktok.com/@${String(app.tiktok).replace('@', '')}` : null,
        verified: true,
        status: 'active',
        publicProfileEnabled: true,
        performedByUserId: null,
        transitionSource: 'artist_application_approval',
        transitionReason: 'Artist application approved by admin',
      }).catch((promotionError) => {
        console.error('[artist-application/update] promotion helper failed:', promotionError)
        return null
      })

      const slug = promotion?.slug || app.stage_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

      // Welcome email — only if this is a fresh promotion (not a re-approval)
      const resend = getResend()
      if (resend && app.email && !wasAlreadyArtist) {
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
