import { createClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    const supabase = createClient()

    // Check if already exists
    const { data: existing } = await supabase
      .from('affiliates')
      .select('id, link_id, email')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({
        affiliate_id: existing.id,
        link_id: existing.link_id,
        email: existing.email,
        link_url: `https://porterful.com/ref/${existing.link_id}`,
        already_exists: true,
      })
    }

    // Create new affiliate
    const linkId = randomUUID().slice(0, 12)
    const { data: newAffiliate, error } = await supabase
      .from('affiliates')
      .insert({ email: normalizedEmail, link_id: linkId })
      .select('id, link_id, email')
      .single()

    if (error) {
      console.error('Affiliate creation error:', error)
      return NextResponse.json({ error: 'Failed to create affiliate link' }, { status: 500 })
    }

    return NextResponse.json({
      affiliate_id: newAffiliate.id,
      link_id: newAffiliate.link_id,
      email: newAffiliate.email,
      link_url: `https://porterful.com/ref/${newAffiliate.link_id}`,
      already_exists: false,
    })
  } catch (err) {
    console.error('Affiliate API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
