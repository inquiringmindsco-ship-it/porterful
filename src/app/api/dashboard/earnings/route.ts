import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { createServerClient as createSsrClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// GET /api/dashboard/earnings — read real earnings from existing ledger
export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const ssrSupabase = createSsrClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
        },
      },
    }
  );
  const { data: { session } } = await ssrSupabase.auth.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerClient();
  const sellerId: string = session.user.id;

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

  // 3. Get recent orders as buyer
  const { data: purchases } = await supabase
    .from('orders')
    .select('id, amount, product_id, created_at')
    .eq('buyer_id', sellerId)
    .order('created_at', { ascending: false })
    .limit(5);

  // 4. Get referral earnings breakdown from referral_earnings table
  const { data: referralRows, error: referralError } = await supabase
    .from('referral_earnings')
    .select('id, superfan_id, order_id, amount, status, created_at')
    .eq('superfan_id', sellerId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (referralError) {
    console.warn('[dashboard/earnings] referral_earnings unavailable:', referralError.message);
  }

  const referralHistory = (referralRows || []).map((row: any) => ({
    ...row,
    status: row.status === 'withdrawn' ? 'paid' : row.status,
    commission_cents: Math.round(Number(row.amount || 0) * 100),
  }));
  const pendingReferral = referralHistory
    .filter((row: any) => row.status === 'pending')
    .reduce((sum: number, row: any) => sum + Number(row.commission_cents || 0), 0);

  const totalReferralEarned = referralHistory
    .reduce((sum: number, row: any) => sum + Number(row.commission_cents || 0), 0);

  const paidReferral = referralHistory
    .filter((row: any) => row.status === 'paid')
    .reduce((sum: number, row: any) => sum + Number(row.commission_cents || 0), 0);

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
    referral: {
      total_earned_cents: totalReferralEarned,
      pending_cents: pendingReferral,
      paid_cents: paidReferral,
      history: referralHistory,
    },
  });
}
