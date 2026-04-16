import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const supabase = createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const email = user.email?.toLowerCase()
  if (!email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, lk_id')
    .eq('id', user.id)
    .limit(1)
    .maybeSingle()

  const sellerId = profile?.id || null
  const lkId = profile?.lk_id || null

  const { data: soldOrders } = await supabase
    .from('orders')
    .select('id, amount, seller_total, product_id, buyer_email, created_at, stripe_checkout_session_id')
    .eq('referrer_id', sellerId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(20)

  const totalSold = (soldOrders || []).reduce((sum: number, o: any) => sum + (o.seller_total || 0), 0)
  const totalOrders = soldOrders?.length || 0

  const { data: superfan } = await supabase
    .from('superfans')
    .select('id, total_earnings, available_earnings, tier')
    .eq('id', sellerId)
    .limit(1)
    .maybeSingle()

  const { data: purchases } = await supabase
    .from('orders')
    .select('id, amount, product_id, created_at')
    .eq('buyer_email', email)
    .order('created_at', { ascending: false })
    .limit(5)

  return NextResponse.json({
    seller: {
      total_earned_cents: totalSold,
      order_count: totalOrders,
      recent_sales: soldOrders || [],
    },
    superfan: superfan ? {
      total_earned_cents: Math.round((superfan.total_earnings || 0) * 100),
      available_cents: Math.round((superfan.available_earnings || 0) * 100),
      tier: superfan.tier,
    } : null,
    purchases: purchases || [],
    lkId,
  })
}
