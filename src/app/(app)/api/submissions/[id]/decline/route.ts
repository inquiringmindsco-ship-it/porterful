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

    // 4. Update submission status to rejected
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
        body: JSON.stringify({ status: 'rejected' }),
      }
    )

    if (!patchRes.ok) {
      const errText = await patchRes.text()
      return NextResponse.json({ error: `Failed to decline: ${errText}` }, { status: 500 })
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
