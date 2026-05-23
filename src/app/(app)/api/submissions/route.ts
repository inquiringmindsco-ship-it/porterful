import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient, unauthorized } from '@/lib/auth-utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { stage_name, email, genre, city, bio, tracks } = body

    // Validate
    if (!stage_name || !email || !tracks || tracks.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    // Create submission record
    const submission = {
      stage_name,
      email,
      genre: genre || null,
      city: city || null,
      bio: bio || null,
      status: 'pending',
      submitted_at: new Date().toISOString()
    }

    // Insert submission
    let submissionId: string | null = null
    const dbError = false
    let dbErrorDetails = ''

    try {
      const subRes = await fetch(
        `${supabaseUrl}/rest/v1/submissions`,
        {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(submission)
        }
      )

      if (!subRes.ok) {
        dbErrorDetails = await subRes.text()
        console.error('[submissions] DB insert failed:', dbErrorDetails)
        return NextResponse.json(
          { error: 'Failed to save submission', details: dbErrorDetails },
          { status: 500 }
        )
      }

      const submissionData = await subRes.json()
      submissionId = submissionData?.[0]?.id || submissionData?.id
    } catch (dbErr: any) {
      console.error('[submissions] DB exception:', dbErr)
      return NextResponse.json(
        { error: 'Database error', details: dbErr.message },
        { status: 500 }
      )
    }

    // Insert tracks
    if (tracks && tracks.length > 0 && submissionId) {
      for (const track of tracks) {
        try {
          await fetch(
            `${supabaseUrl}/rest/v1/submission_tracks`,
            {
              method: 'POST',
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
              },
              body: JSON.stringify({
                submission_id: submissionId,
                filename: track.name,
                url: track.url,
                path: track.path,
                size: track.size || null
              })
            }
          )
        } catch (trackErr) {
          console.error('[submissions] Track insert failed:', trackErr)
        }
      }
    }

    // Notify admin
    const discordWebhook = process.env.DISCORD_WEBHOOK_URL
    if (discordWebhook) {
      const trackList = tracks.map((t: { name: string }) => `• ${t.name}`).join('\n')
      const message = {
        content: `🎵 **New Artist Submission**\n\n**Artist:** ${stage_name}\n**Email:** ${email}\n**Genre:** ${genre || 'Not specified'}\n**City:** ${city || 'Not specified'}\n\n**Tracks:**\n${trackList}\n\n✅ Saved to database\n📋 Status: Pending Review\n🔗 ID: ${submissionId}`
      }

      try {
        await fetch(discordWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message)
        })
      } catch (notifErr) {
        console.error('[submissions] Discord notification failed:', notifErr)
      }
    }

    return NextResponse.json({
      success: true,
      submission_id: submissionId,
      message: 'Submission received. We will review your music within 48 hours.'
    })

  } catch (error: any) {
    console.error('[submissions] Unexpected error:', error)
    return NextResponse.json(
      { error: error.message || 'Submission failed' },
      { status: 500 }
    )
  }
}

// Get all submissions (admin/founder only)
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedClient()
    if (!auth) return unauthorized()

    const { supabase, user } = auth

    // Require admin or founder role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!['admin', 'founder'].includes(profile?.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Use service role for DB access
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const subRes = await fetch(
      `${supabaseUrl}/rest/v1/submissions?order=submitted_at.desc`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        }
      }
    )

    if (!subRes.ok) {
      const errText = await subRes.text()
      console.error('[submissions] DB fetch failed:', errText)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    const submissions = await subRes.json()

    // Get tracks for each submission
    const submissionsWithTracks = await Promise.all(
      submissions.map(async (sub: { id: string }) => {
        const tracksRes = await fetch(
          `${supabaseUrl}/rest/v1/submission_tracks?submission_id=eq.${sub.id}`,
          {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`
            }
          }
        )
        const tracks = await tracksRes.json()
        return { ...sub, tracks }
      })
    )

    return NextResponse.json(submissionsWithTracks)

  } catch (error) {
    console.error('Get submissions error:', error)
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 })
  }
}
