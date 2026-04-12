import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Direct admin password reset — use service role to bypass RLS
// POST /api/admin/reset-password
// Body: { email: string, newPassword: string }

export async function POST(request: Request) {
  try {
    const { email, newPassword } = await request.json()

    if (!email || !newPassword) {
      return NextResponse.json({ error: 'Email and newPassword required' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    // Use service role key for admin operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Find user by email
    const { data: users, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
      console.error('List users error:', listError)
      return NextResponse.json({ error: listError.message }, { status: 500 })
    }

    const user = users?.users.find(u => u.email === email)

    if (!user) {
      return NextResponse.json({ error: 'No user found with that email' }, { status: 404 })
    }

    // Update password — use updateUserById for Supabase v2
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    )

    if (updateError) {
      console.error('Password update error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Password updated for ' + email })

  } catch (err: any) {
    console.error('Reset password error:', err)
    return NextResponse.json({ error: err.message || 'Reset failed' }, { status: 500 })
  }
}