import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { decodePorterfulSession } from '@/lib/porterful-session';

export async function GET(req: NextRequest) {
  const sessionToken = req.cookies.get('porterful_session')?.value;
  if (!sessionToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const session = decodePorterfulSession(sessionToken);
  if (!session) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  const supabase = createServerClient();

  // Find profile by email
  let sellerId: string | null = null;
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username')
    .eq('email', session.email.toLowerCase())
    .limit(1)
    .maybeSingle();

  if (profile) sellerId = profile.id;

  // 1. Get all orders where this user is the referrer (seller earnings)
  const { data: soldOrders } = await supabase
    .from('orders')
    .select('id, amount, seller_total, product_id, buyer_email, created_at, stripe_checkout_session_id')
    .eq('referrer_id', sellerId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(20);

  const totalSold = (soldOrders || []).reduce((sum: number, o: any) => sum + (o.seller_total || 0), 0);
  const totalOrders = soldOrders?.length || 0;

  // 2. Get superfan earnings if applicable
  const { data: superfan } = await supabase
    .from('superfans')
    .select('id, total_earnings, available_earnings, tier')
    .eq('id', sellerId)
    .limit(1)
    .maybeSingle();

  // 3. Get referral earnings (commissions from being a referrer)
  const { data: referralRows } = await supabase
    .from('referral_earnings')
    .select('id, amount, status, created_at, order_id')
    .eq('superfan_id', sellerId)
    .order('created_at', { ascending: false })
    .limit(20);

  const referralEarnings = (referralRows || []).map((r: any) => ({
    ...r,
    status: r.status === 'withdrawn' ? 'paid' : r.status,
    commission_cents: Math.round((r.amount || 0) * 100),
  }));
  const totalReferralCents = referralEarnings.reduce((s: number, r: any) => s + r.commission_cents, 0);

  // 4. Get recent orders as buyer
  const { data: purchases } = await supabase
    .from('orders')
    .select('id, amount, product_id, created_at')
    .eq('buyer_email', session.email.toLowerCase())
    .order('created_at', { ascending: false })
    .limit(5);

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
    referral: {
      total_earned_cents: totalReferralCents,
      pending_cents: referralEarnings
        .filter((r: any) => r.status === 'pending')
        .reduce((s: number, r: any) => s + r.commission_cents, 0),
      available_cents: referralEarnings
        .filter((r: any) => r.status === 'available')
        .reduce((s: number, r: any) => s + r.commission_cents, 0),
      paid_cents: referralEarnings
        .filter((r: any) => r.status === 'paid')
        .reduce((s: number, r: any) => s + r.commission_cents, 0),
      recent: referralEarnings.slice(0, 10),
    },
    purchases: purchases || [],
  });
}
