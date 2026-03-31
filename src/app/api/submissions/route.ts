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
    
    // Insert submission
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
      console.error('Submissions insert error:', await subRes.text())
      // Continue anyway - we'll still send the notification
    }
    
    const submissionData = await subRes.json()
    const submissionId = submissionData?.id || `temp_${Date.now()}`
    
    // Insert tracks
    if (tracks && tracks.length > 0) {
      for (const track of tracks) {
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
      }
    }
    
    // Send notification to Porterful admin (Od)
    // Using Discord webhook if available, otherwise just log it
    const discordWebhook = process.env.DISCORD_WEBHOOK_URL
    if (discordWebhook) {
      const trackList = tracks.map((t: { name: string }) => `• ${t.name}`).join('\n')
      const message = {
        content: `🎵 **New Artist Submission**\n\n**Artist:** ${stage_name}\n**Email:** ${email}\n**Genre:** ${genre || 'Not specified'}\n**City:** ${city || 'Not specified'}\n\n**Tracks:**\n${trackList}\n\n📋 Status: Pending Review\n🔗 ID: ${submissionId}`
      }
      
      await fetch(discordWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      })
    } else {
      // Log for now - admin will check dashboard
      console.log('=== NEW ARTIST SUBMISSION ===')
      console.log('Artist:', stage_name)
      console.log('Email:', email)
      console.log('Genre:', genre)
      console.log('City:', city)
      console.log('Tracks:', tracks)
      console.log('============================')
    }
    
    return NextResponse.json({ 
      success: true, 
      id: submissionId,
      message: 'Submission received. We will review your music and get back to you soon.' 
    })
    
  } catch (error) {
    console.error('Submission error:', error)
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 })
  }
}

// Get all submissions (for admin)
export async function GET(request: NextRequest) {
  try {
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
