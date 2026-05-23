import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient, unauthorized } from '@/lib/auth-utils'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 1. Auth check — require admin/founder role
    const auth = await getAuthenticatedClient()
    if (!auth) return unauthorized()

    const { supabase, user } = auth

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!['admin', 'founder'].includes(profile?.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 2. Use service_role for DB operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
    }

    // 3. Get the submission
    const subRes = await fetch(
      `${supabaseUrl}/rest/v1/submissions?id=eq.${id}&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    )

    if (!subRes.ok) {
      const errText = await subRes.text()
      return NextResponse.json({ error: `DB error: ${errText}` }, { status: 500 })
    }

    const submissions = await subRes.json()
    if (!submissions || submissions.length === 0) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    const submission = submissions[0]

    // 4. Update submission status
    const now = new Date().toISOString()
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
      const errText = await patchRes.text()
      return NextResponse.json({ error: `Failed to approve: ${errText}` }, { status: 500 })
    }

    // 5. Upsert artist record — update existing if slug matches, else create
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
      // PHASE B: Submissions approval sets artist to approved but NOT auto-public
      // Founder must explicitly enable public profile in dashboard
      status: 'approved',
      public_profile_enabled: false,
      approved_at: now,
    }

    // Try to find existing artist by slug
    const existingRes = await fetch(
      `${supabaseUrl}/rest/v1/artists?slug=eq.${slug}&select=id`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    )

    let artistId: string | null = null

    if (existingRes.ok) {
      const existing = await existingRes.json()
      if (existing && existing.length > 0) {
        // Update existing artist
        artistId = existing[0].id
        const updateRes = await fetch(
          `${supabaseUrl}/rest/v1/artists?id=eq.${artistId}`,
          {
            method: 'PATCH',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation',
            },
            body: JSON.stringify(artistPayload),
          }
        )
        if (!updateRes.ok) {
          const errText = await updateRes.text()
          return NextResponse.json({ error: `Artist update failed: ${errText}` }, { status: 500 })
        }
      } else {
        // Create new artist
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
        if (!artistRes.ok) {
          const errText = await artistRes.text()
          return NextResponse.json({ error: `Artist creation failed: ${errText}` }, { status: 500 })
        }
        const artistData = await artistRes.json()
        artistId = artistData?.[0]?.id || null
      }
    } else {
      // Fallback: try insert anyway
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
      if (!artistRes.ok) {
        const errText = await artistRes.text()
        return NextResponse.json({ error: `Artist creation failed: ${errText}` }, { status: 500 })
      }
      const artistData = await artistRes.json()
      artistId = artistData?.[0]?.id || null
    }

    // 6. Update user role if user_id exists
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
      artist_id: artistId,
      slug,
      message: `${submission.stage_name} approved and artist profile upserted.`,
    })
  } catch (err: any) {
    console.error('[submissions/approve] error:', err)
    return NextResponse.json(
      { error: err.message || 'Server error' },
      { status: 500 }
    )
  }
}
