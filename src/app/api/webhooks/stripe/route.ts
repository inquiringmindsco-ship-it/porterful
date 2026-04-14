import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: 'Missing webhook config' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = (await import('stripe')).default.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata || {};
    const { lk_id, user_id, username, product_id, source, offer_id } = metadata;

    // Resolve referrer_id from Likeness™ identity (lk_id)
    // The profiles table links Likeness™ identity to Porterful profile
    let referrerId: string | null = null;
    let profileId: string | null = null;

    const supabase = createServerClient();

    if (lk_id) {
      // Find profile(s) that have this Likeness™ identity
      // profiles table may store lk_id in metadata — check via email if available
      if (session.customer_email) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', session.customer_email.toLowerCase())
          .limit(1)
          .maybeSingle();
        if (profile) {
          referrerId = profile.id;
          profileId = profile.id;
        }
      }
      // Fallback: try to find by username match in metadata
      if (!referrerId && username) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username)
          .limit(1)
          .maybeSingle();
        if (profile) {
          referrerId = profile.id;
          profileId = profile.id;
        }
      }
    }

    // Also try to find buyer profile
    let buyerId: string | null = null;
    if (session.customer_email) {
      const { data: buyerProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', session.customer_email.toLowerCase())
        .limit(1)
        .maybeSingle();
      if (buyerProfile) buyerId = buyerProfile.id;
    }

    const amount = session.amount_total || 0;
    const sellerTotal = Math.round(amount * 0.67);
    const artistFundTotal = Math.round(amount * 0.20);
    const superfanTotal = Math.round(amount * 0.03);
    const platformTotal = Math.round(amount * 0.10);

    // Write to existing orders table
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_id: buyerId,
        product_id: product_id || null,
        amount,
        status: 'completed',
        referrer_id: referrerId,
        seller_total: sellerTotal,
        artist_fund_total: artistFundTotal,
        superfan_total: superfanTotal,
        platform_total: platformTotal,
        stripe_checkout_session_id: session.id,
        buyer_email: session.customer_email || null,
        // Store Likeness™ identity in metadata fields
        user_id: profileId || user_id || null,
      })
      .select()
      .single();

    if (orderError) {
      console.error('[stripe-webhook] Order insert failed:', orderError.message);
    } else {
      console.log('[stripe-webhook] Order created:', order.id, 'referrer:', referrerId);
    }

    // Also record in payments table if tier-based
    if (metadata.tier) {
      await supabase
        .from('payments')
        .insert({
          email: session.customer_email || null,
          name: username || lk_id || 'anonymous',
          tier: metadata.tier,
          amount: Math.round((amount || 0) / 100),
          stripe_session_id: session.id,
          status: 'completed',
        });
    }

    // Update superfans earnings if referrer is a superfan
    if (referrerId) {
      const { data: superfan } = await supabase
        .from('superfans')
        .select('id, total_earnings, available_earnings')
        .eq('id', referrerId)
        .limit(1)
        .maybeSingle();

      if (superfan) {
        const commission = Math.round(amount * 0.03);
        await supabase
          .from('superfans')
          .update({
            total_earnings: (superfan.total_earnings || 0) + commission,
            available_earnings: (superfan.available_earnings || 0) + commission,
          })
          .eq('id', referrerId);
      }
    }
  }

  return NextResponse.json({ received: true });
}
