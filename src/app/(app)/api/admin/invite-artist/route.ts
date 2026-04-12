/**
 * POST /api/admin/invite-artist
 * 
 * Invites an artist by email. Creates Supabase auth user and sends magic link.
 */

import { NextResponse } from 'next/server'

const ARTISTS = [
  { email: 'jameschapplejr@gmail.com', name: 'Gune', slug: 'gune' },
  { email: 'fastcashent314@gmail.com', name: 'ATM Trap', slug: 'atm-trap' },
  { email: 'douglasrobert23@yahoo.com', name: 'Nikee Turbo', slug: 'nikee-turbo' },
]

export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const results = []

  for (const artist of ARTISTS) {
    try {
      // Use inviteUserByEmail — sends magic link directly
      const res = await fetch(`${supabaseUrl}/auth/v1/admin/users/invite`, {
        method: 'POST',
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: artist.email,
          email_confirm: true,
          user_metadata: { name: artist.name, role: 'artist', slug: artist.slug },
        }),
      })

      const text = await res.text()
      if (res.ok) {
        results.push({ email: artist.email, name: artist.name, status: 'invite_sent' })
      } else {
        const parsed = JSON.parse(text)
        // 422 means user already exists — that's fine
        results.push({ email: artist.email, name: artist.name, status: res.status === 422 ? 'already_invited' : 'failed', detail: parsed.msg || parsed.message || text.substring(0, 100) })
      }
    } catch (err: any) {
      results.push({ email: artist.email, name: artist.name, status: 'error', detail: err.message })
    }
  }

  return NextResponse.json({ results })
}