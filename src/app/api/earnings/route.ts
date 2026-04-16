import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const supabase = createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const email = user.email?.toLowerCase()

  const { data: profile } = await supabase
    .from('profiles')
    .select('lk_id')
    .eq('email', email)
    .limit(1)
    .maybeSingle()

  const lkId = (profile as any)?.lk_id
  if (!lkId) {
    return NextResponse.json({ error: 'No Likeness identity required' }, { status: 403 })
  }

  const { data: earnings } = await supabase
    .from('earnings')
    .select('total_earned_cents, pending_cents, last_activity_at')
    .eq('lk_id', lkId)
    .limit(1)
    .maybeSingle()

  const { data: transactions } = await supabase
    .from('offer_transactions')
    .select('offer_id, product_id, amount_cents, commission_cents, created_at, status')
    .eq('lk_id', lkId)
    .order('created_at', { ascending: false })
    .limit(20)

  const total = earnings?.total_earned_cents || 0
  const pending = earnings?.pending_cents || 0

  return NextResponse.json({
    total_earned_cents: total,
    pending_cents: pending,
    settled_cents: total - pending,
    transactions: transactions || [],
  })
}
