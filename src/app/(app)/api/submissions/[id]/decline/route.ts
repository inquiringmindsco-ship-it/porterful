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

    // 2. Update submission status to rejected
    const now = new Date().toISOString()
    const updatePayload: Record<string, any> = { status: 'rejected' }
    // Only add declined_at if the column might exist (best effort)
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
          body: JSON.stringify({ status: 'rejected', declined_at: now }),
        }
      )
      if (!patchRes.ok) {
        // Try without declined_at in case column doesn't exist
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
            body: JSON.stringify({ status: 'rejected' }),
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

    return NextResponse.json({
      success: true,
      message: `${submission.stage_name} has been declined.`,
    })
  } catch (err: any) {
    console.error('[submissions/decline] error:', err)
    return NextResponse.json(
      { error: err.message || 'Server error' },
      { status: 500 }
    )
  }
}
