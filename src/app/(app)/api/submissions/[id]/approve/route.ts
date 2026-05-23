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

    // 5. Create artist record
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

    if (!artistRes.ok) {
      const errText = await artistRes.text()
      return NextResponse.json({ error: `Artist creation failed: ${errText}` }, { status: 500 })
    }

    const artistData = await artistRes.json()
    const newArtistId = artistData?.[0]?.id || null

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
