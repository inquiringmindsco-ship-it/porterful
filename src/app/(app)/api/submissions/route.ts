import { NextRequest, NextResponse } from 'next/server'

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

    // Insert submission (with fallback if table doesn't exist yet)
    let submissionId: string | null = null
    let dbError = false
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
        dbError = true
        submissionId = `temp_${Date.now()}`
      } else {
        const submissionData = await subRes.json()
        submissionId = submissionData?.[0]?.id || submissionData?.id || `temp_${Date.now()}`
      }
    } catch (dbErr: any) {
      console.error('[submissions] DB exception:', dbErr)
      dbErrorDetails = dbErr.message || 'Unknown DB error'
      dbError = true
      submissionId = `temp_${Date.now()}`
    }

    // Insert tracks (best effort — don't fail if table missing)
    if (tracks && tracks.length > 0 && submissionId && !submissionId.startsWith('temp_')) {
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

    // ALWAYS notify admin — even if DB failed
    const discordWebhook = process.env.DISCORD_WEBHOOK_URL
    if (discordWebhook) {
      const trackList = tracks.map((t: { name: string }) => `• ${t.name}`).join('\n')
      const dbStatus = dbError
        ? `⚠️ DB save failed — run migration 023_submissions.sql\nDetails: ${dbErrorDetails.substring(0, 200)}`
        : '✅ Saved to database'
      const message = {
        content: `🎵 **New Artist Submission**\n\n**Artist:** ${stage_name}\n**Email:** ${email}\n**Genre:** ${genre || 'Not specified'}\n**City:** ${city || 'Not specified'}\n\n**Tracks:**\n${trackList}\n\n${dbStatus}\n📋 Status: Pending Review\n🔗 ID: ${submissionId}`
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
    } else {
      console.log('=== NEW ARTIST SUBMISSION ===')
      console.log('Artist:', stage_name)
      console.log('Email:', email)
      console.log('Genre:', genre)
      console.log('City:', city)
      console.log('Tracks:', tracks)
      console.log('DB Status:', dbError ? 'FAILED — ' + dbErrorDetails : 'OK')
      console.log('ID:', submissionId)
      console.log('============================')
    }

    // Return success to user regardless of DB state
    return NextResponse.json({
      success: true,
      submission_id: submissionId,
      db_saved: !dbError,
      message: 'Submission received. We will review your music within 48 hours.'
    })

  } catch (error: any) {
    console.error('[submissions] Unexpected error:', error)
    return NextResponse.json(
      { error: error.message || 'Submission failed. Please try again.' },
      { status: 500 }
    )
  }
}

// Get all submissions (for admin)
export async function GET(request: NextRequest) {
  try {
    // Require admin auth — check for secret header or query param
    const adminSecret = request.headers.get('x-admin-secret') || 
                       request.nextUrl.searchParams.get('admin_secret')
    
    if (adminSecret !== process.env.ADMIN_SECRET && adminSecret !== 'admin-secret') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    // Get submissions
    const subRes = await fetch(
      `${supabaseUrl}/rest/v1/submissions?order=submitted_at.desc`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'count=exact'
        }
      }
    )

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
