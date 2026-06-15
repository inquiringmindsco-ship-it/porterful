import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAccess, getAdminClient } from '@/lib/admin-client'
import { promoteUserToArtist } from '@/lib/server/artist-promotion'
import { buildArtistWelcomeEmailHTML, buildArtistWelcomeEmailText } from '@/lib/artist-welcome-email'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

function getResend() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey || apiKey === 're_test') return null
  return new Resend(apiKey)
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdminAccess(request)
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || 'Forbidden' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const userId = String(body.user_id || '').trim()
    if (!userId) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
    }

    const supabase = getAdminClient()

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name, username, avatar_url, role')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const { data: existingArtist } = await supabase
      .from('artists')
      .select('id, name, slug, bio, genre, city, avatar_url, cover_url, instagram_url, youtube_url, twitter_url, tiktok_url, verified, status, public_profile_enabled')
      .eq('id', userId)
      .maybeSingle()

    const { data: application } = await supabase
      .from('artist_applications')
      .select('stage_name, genre, city, bio, avatar_url, cover_image_url, instagram, youtube, twitter, tiktok, status, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const artistName =
      String((application as any)?.stage_name || existingArtist?.name || profile.full_name || profile.username || profile.email || 'Porterful Artist')

    const promotion = await promoteUserToArtist(supabase, {
      userId,
      artistName,
      genre: (application as any)?.genre || existingArtist?.genre || null,
      city: (application as any)?.city || existingArtist?.city || null,
      bio: (application as any)?.bio || existingArtist?.bio || null,
      avatarUrl: (application as any)?.avatar_url || existingArtist?.avatar_url || profile.avatar_url || null,
      coverUrl: (application as any)?.cover_image_url || existingArtist?.cover_url || null,
      instagramUrl: (application as any)?.instagram ? `https://instagram.com/${String((application as any).instagram).replace('@', '')}` : existingArtist?.instagram_url || null,
      youtubeUrl: (application as any)?.youtube ? `https://youtube.com/@${String((application as any).youtube).replace('@', '')}` : existingArtist?.youtube_url || null,
      twitterUrl: (application as any)?.twitter ? `https://twitter.com/${String((application as any).twitter).replace('@', '')}` : existingArtist?.twitter_url || null,
      tiktokUrl: (application as any)?.tiktok ? `https://tiktok.com/@${String((application as any).tiktok).replace('@', '')}` : existingArtist?.tiktok_url || null,
      verified: true,
      status: existingArtist?.status || 'approved',
      publicProfileEnabled: existingArtist?.public_profile_enabled ?? false,
    })

    const resend = getResend()
    let welcomeEmailSent = false
    let welcomeEmailError: string | null = null

    if (resend && profile.email) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://porterful.com'
      const dashboardUrl = `${siteUrl}/dashboard/artist`
      const artistPageUrl = promotion.slug ? `${siteUrl}/artist/${promotion.slug}` : dashboardUrl
      try {
        const html = buildArtistWelcomeEmailHTML({
          artistName,
          dashboardUrl,
          artistPageUrl,
          genre: (application as any)?.genre || existingArtist?.genre || null,
          city: (application as any)?.city || existingArtist?.city || null,
        })
        const text = buildArtistWelcomeEmailText({
          artistName,
          dashboardUrl,
          artistPageUrl,
          genre: (application as any)?.genre || existingArtist?.genre || null,
          city: (application as any)?.city || existingArtist?.city || null,
        })

        const { error: sendError } = await resend.emails.send({
          from: 'Porterful <noreply@likenessverified.com>',
          to: [profile.email],
          subject: `Welcome to Porterful, ${artistName}`,
          html,
          text,
        })

        if (sendError) {
          welcomeEmailError = sendError.message
        } else {
          welcomeEmailSent = true
        }
      } catch (err: any) {
        welcomeEmailError = err?.message || 'Failed to send welcome email'
      }
    }

    return NextResponse.json({
      success: true,
      user_id: userId,
      artist: promotion.artist,
      slug: promotion.slug,
      role: 'artist',
      authMetadataUpdated: promotion.authMetadataUpdated,
      welcomeEmailSent,
      ...(welcomeEmailError ? { welcomeEmailError } : {}),
    })
  } catch (error: any) {
    console.error('[api/admin/users/promote-to-artist] error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to promote user to artist' },
      { status: 500 },
    )
  }
}
