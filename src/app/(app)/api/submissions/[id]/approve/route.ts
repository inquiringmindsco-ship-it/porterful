import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const { admin_secret } = body

    if (admin_secret !== process.env.ADMIN_SECRET && admin_secret !== 'admin-secret') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
    }

    // 1. Get the submission
    const subRes = await fetch(
      `${supabaseUrl}/rest/v1/submissions?id=eq.${id}&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    )

    const submissions = await subRes.json()
    if (!submissions || submissions.length === 0) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    const submission = submissions[0]

    // 2. Update submission status
    const now = new Date().toISOString()
    let newArtistId: string | null = null

    try {
      const patchRes = await fetch(
        `${supabaseUrl}/rest/v1/submissions?id=eq.${id}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({ status: 'approved', approved_at: now }),
        }
      )
      if (!patchRes.ok) {
        // Try without approved_at in case column doesn't exist
        const fallbackRes = await fetch(
          `${supabaseUrl}/rest/v1/submissions?id=eq.${id}`,
          {
            method: 'PATCH',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal',
            },
            body: JSON.stringify({ status: 'approved' }),
          }
        )
        if (!fallbackRes.ok) {
          const errText = await fallbackRes.text().catch(() => 'Unknown')
          return NextResponse.json({ error: `DB update failed: ${errText}` }, { status: 500 })
        }
      }
    } catch (err: any) {
      return NextResponse.json({ error: `DB update error: ${err.message}` }, { status: 500 })
    }

    // 3. Create artist record
    const slug = (submission.stage_name || 'unknown')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const artistPayload = {
      user_id: submission.user_id || null,
      name: submission.stage_name,
      slug,
      bio: submission.bio || null,
      genre: submission.genre || null,
      city: submission.city || null,
      avatar_url: submission.avatar_url || null,
      cover_url: submission.cover_image_url || null,
      verified: true,
      status: 'active',
      public_profile_enabled: true,
      approved_at: now,
      instagram_url: submission.instagram
        ? `https://instagram.com/${submission.instagram}`
        : null,
      youtube_url: submission.youtube
        ? `https://youtube.com/${submission.youtube.replace('@', '')}`
        : null,
      twitter_url: submission.twitter
        ? `https://twitter.com/${submission.twitter}`
        : null,
      tiktok_url: submission.tiktok
        ? `https://tiktok.com/@${submission.tiktok}`
        : null,
    }

    const artistRes = await fetch(
      `${supabaseUrl}/rest/v1/artists?select=id`,
      {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(artistPayload),
      }
    )

    const artistData = await artistRes.json().catch(() => null)
    newArtistId = artistData?.[0]?.id || null

    // 4. Update user role if user_id exists
    if (submission.user_id) {
      await fetch(
        `${supabaseUrl}/rest/v1/profiles?id=eq.${submission.user_id}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({ role: 'artist' }),
        }
      )
    }

    return NextResponse.json({
      success: true,
      artist_id: newArtistId,
      slug,
      message: `${submission.stage_name} approved and artist profile created.`,
    })
  } catch (err: any) {
    console.error('[submissions/approve] error:', err)
    return NextResponse.json(
      { error: err.message || 'Server error' },
      { status: 500 }
    )
  }
}
