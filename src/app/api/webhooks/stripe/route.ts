import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import Stripe from 'stripe';
import { resolveReferrerId, normalizeReferralHandle } from '@/lib/referral';
import { getActivationCodeByValue, normalizeActivationCode } from '@/lib/activation';

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
    const { lk_id, user_id, username, product_id, source, offer_id, referral_code } = metadata;
    const supabase = createServerClient();
    const activationCodeValue = normalizeActivationCode(metadata.activation_code_value || metadata.activation_code || null);
    const discountCents = Math.max(0, Math.round(Number(metadata.discount_cents || 0)));
    const paymentMethod = (metadata.payment_method as string) || 'stripe';

    let activationCodeId: string | null = metadata.activation_code_id || null;
    if (!activationCodeId && activationCodeValue) {
      const { data: activationCode } = await getActivationCodeByValue(supabase, activationCodeValue);
      activationCodeId = activationCode?.id || null;
    }

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ received: true });
    }

    // Resolve referrer_id from the referral handle carried through checkout.
    let referrerId: string | null = null;
    const profileId: string | null = null;

    const referrerHandle = normalizeReferralHandle(referral_code || username || lk_id || null)
    if (referrerHandle) {
      referrerId = await resolveReferrerId(supabase, referrerHandle)
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

    // Write to existing orders table once
    let order: any = null;
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id')
      .eq('stripe_checkout_session_id', session.id)
      .limit(1)
      .maybeSingle();

    if (existingOrder) {
      order = existingOrder;
      if (activationCodeId || paymentMethod !== 'stripe' || discountCents > 0) {
        await supabase
          .from('orders')
          .update({
            activation_code_id: activationCodeId,
            payment_method: paymentMethod,
            discount_cents: discountCents,
            referrer_id: referrerId,
          })
          .eq('id', order.id);
      }
    } else {
      const { data: createdOrder, error: orderError } = await supabase
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
          activation_code_id: activationCodeId,
          payment_method: paymentMethod,
          discount_cents: discountCents,
          // Store Likeness™ identity in metadata fields
          user_id: profileId || user_id || null,
        })
        .select()
        .single();

      if (orderError) {
        console.error('[stripe-webhook] Order insert failed:', orderError.message);
      } else {
        order = createdOrder;
        console.log('[stripe-webhook] Order created:', order.id, 'referrer:', referrerId);
      }
    }

    if (session.customer_email && product_id) {
      const normalizedEmail = session.customer_email.toLowerCase();
      const { data: existingEntitlement } = await supabase
        .from('entitlements')
        .select('id')
        .eq('buyer_email', normalizedEmail)
        .eq('product_id', product_id)
        .eq('status', 'active')
        .limit(1)
        .maybeSingle();

      if (!existingEntitlement) {
        const { error: entitlementError } = await supabase
          .from('entitlements')
          .insert({
            buyer_email: normalizedEmail,
            buyer_user_id: buyerId,
            product_id,
            offer_id: offer_id || null,
            referrer_id: referrerId,
            order_id: order?.id || null,
            status: 'active',
          });

        if (entitlementError) {
          console.error('[stripe-webhook] Entitlement insert failed:', entitlementError.message);
        }
      }
    }

    if (activationCodeId && order?.id) {
      await supabase
        .from('activation_codes')
        .update({
          order_id: order.id,
        })
        .eq('id', activationCodeId);
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

    // Referral loop: update orders.referrer_id + upsert referral_earnings + update superfan balance
    const orderId = order?.id;
    if (referrerId && superfanTotal > 0) {
      // 1. Update orders referrer_id
      if (orderId) {
        await supabase
          .from('orders')
          .update({ referrer_id: referrerId })
          .eq('id', orderId);
      }

      // 2. Upsert referral_earnings (schema: superfan_id, order_id, amount DECIMAL, status)
      const { data: existingReferral } = await supabase
        .from('referral_earnings')
        .select('id')
        .eq('order_id', orderId)
        .limit(1)
        .maybeSingle();

      if (existingReferral?.id) {
        await supabase
          .from('referral_earnings')
          .update({
            superfan_id: referrerId,
            amount: superfanTotal / 100,
            status: 'pending',
          })
          .eq('id', existingReferral.id);
      } else {
        const { error: referralError } = await supabase
          .from('referral_earnings')
          .insert({
            superfan_id: referrerId,
            order_id: orderId,
            amount: superfanTotal / 100,
            status: 'pending',
          });

        if (referralError) {
          console.error('[stripe-webhook] Referral earnings insert failed:', referralError.message);
        }
      }

      // 3. Update superfan available balance
      const { data: superfan } = await supabase
        .from('superfans')
        .select('id, total_earnings, available_earnings')
        .eq('id', referrerId)
        .limit(1)
        .maybeSingle();

      if (superfan) {
        await supabase
          .from('superfans')
          .update({
            total_earnings: (superfan.total_earnings || 0) + (superfanTotal / 100),
            available_earnings: (superfan.available_earnings || 0) + (superfanTotal / 100),
          })
          .eq('id', referrerId);
      }
    }
  }

  return NextResponse.json({ received: true });
}
