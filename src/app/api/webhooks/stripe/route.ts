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
    const { lk_id, user_id, username, product_id, source, offer_id, referral_code, affiliate_link_id } = metadata;
    // Stripe customer_email may be null when customer pays without creating a Stripe account.
    // Fallback chain: customer_email → metadata.email → customer_details.email
    const customerEmail = session.customer_email || metadata.email || session.customer_details?.email || null;
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

    // Affiliate referral: look up by affiliate_link_id and credit the affiliate
    let affiliateId: string | null = null;
    if (affiliate_link_id) {
      const { data: affiliate } = await supabase
        .from('affiliates')
        .select('id, referral_count')
        .eq('link_id', affiliate_link_id)
        .limit(1)
        .maybeSingle();
      if (affiliate) {
        affiliateId = affiliate.id;
        // Increment referral count
        await supabase
          .from('affiliates')
          .update({ referral_count: (affiliate.referral_count || 0) + 1 })
          .eq('id', affiliate.id);
      }
    }

    // Also try to find buyer profile
    let buyerId: string | null = null;
    if (customerEmail) {
      const { data: buyerProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', customerEmail.toLowerCase())
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
      if (activationCodeId || discountCents > 0) {
        await supabase
          .from('orders')
          .update({
            referrer_id: referrerId,
          })
          .eq('id', order.id);
      }
    } else {
      const { data: createdOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
          buyer_id: buyerId,
          product_id: (product_id && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(product_id)) ? product_id : null,
          amount,
          status: 'completed',
          referrer_id: referrerId,
          seller_total: sellerTotal,
          artist_fund_total: artistFundTotal,
          superfan_total: superfanTotal,
          platform_total: platformTotal,
          stripe_checkout_session_id: session.id,
          buyer_email: customerEmail || null,
          activation_code_id: activationCodeId,
          discount_cents: discountCents,
          payment_method: paymentMethod,
          // Store Likeness™ identity in metadata fields
          user_id: buyerId || profileId || user_id || null,
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

    if (customerEmail && product_id) {
      const normalizedEmail = customerEmail.toLowerCase();
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
          email: customerEmail || null,
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

    // Affiliate earnings: credit the affiliate (3% commission)
    if (affiliateId && superfanTotal > 0) {
      const { data: affiliate } = await supabase
        .from('affiliates')
        .select('id, email, referral_count')
        .eq('id', affiliateId)
        .limit(1)
        .maybeSingle();

      if (affiliate) {
        const affiliateEarning = superfanTotal / 100;
        const { error: earningsError } = await supabase
          .from('affiliate_earnings')
          .insert({
            affiliate_id: affiliateId,
            order_id: orderId,
            amount: affiliateEarning,
            status: 'pending',
          });

        if (earningsError) {
          console.error('[stripe-webhook] Affiliate earnings insert failed:', earningsError.message);
        }
      }
    }

    // ── MUSIC PURCHASE: record entitlement + derive real storage path ──
    // CRITICAL FIX: Ensure music_purchases.amount_paid matches the Stripe session amount
    // (cents, not dollars). The orders row is already written above for all sessions.
    const itemsJson = metadata.items;
    if (itemsJson && customerEmail) {
      try {
        const items = JSON.parse(itemsJson);
        for (const item of items) {
          const isTrack = item.type === 'track' || item.kind === 'track';
          const hasAudio = item.audioUrl || item.audio_url || item.audioUrl === '';
          if (isTrack || hasAudio) {
            // Derive real Supabase storage path from the public audio URL
            // e.g.  https://...supabase.co/storage/v1/object/public/music/audio/613a.../c345....mp3
            //   →  audio/613a.../c345....mp3  (relative to 'music' bucket)
            const publicAudioUrl: string = item.audioUrl || item.audio_url || '';
            let storagePath = item.storagePath || '';
            const storageBucket = 'music'; // Correct bucket for music files
            
            if (!storagePath && publicAudioUrl.includes('/storage/v1/object/')) {
              // Match path after /public/ prefix: /storage/v1/object/public/music/audio/... → audio/...
              const match = publicAudioUrl.match(/\/storage\/v1\/object\/public\/music\/(.+?)(?:\?|$)/);
              if (match) {
                storagePath = match[1];
              } else {
                // Fallback: match without public prefix (legacy URLs)
                const legacyMatch = publicAudioUrl.match(/\/storage\/v1\/object\/(.+?)(?:\?|$)/);
                if (legacyMatch) {
                  storagePath = legacyMatch[1].replace(/^music\//, '');
                }
              }
            }
            
            // Final fallback: try to find track in DB by ID
            if (!storagePath && item.id) {
              const { data: trackRecord } = await supabase
                .from('tracks')
                .select('audio_url')
                .eq('id', item.id)
                .maybeSingle();
              if (trackRecord?.audio_url) {
                const match = trackRecord.audio_url.match(/\/storage\/v1\/object\/public\/music\/(.+?)(?:\?|$)/);
                if (match) storagePath = match[1];
              }
            }

            // Generate recovery token immediately on purchase
            const recoveryToken = crypto.randomUUID();
            const recoveryExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

            // Use session.amount_total (cents) as the canonical amount.
            // Fall back to item.price_cents, then item.price*100, then 0.
            const itemAmountCents = item.price_cents
              ? Math.round(item.price_cents)
              : item.price
                ? Math.round(Number(item.price) * 100)
                : 0;
            const canonicalAmountCents = session.amount_total || itemAmountCents || 0;

            const { error: musicError } = await supabase
              .from('music_purchases')
              .upsert({
                buyer_email: customerEmail.toLowerCase(),
                buyer_user_id: buyerId,
                track_id: item.id || `track-${Date.now()}`,
                track_title: item.name || item.title || 'Unknown Track',
                artist_name: item.artist || 'Unknown Artist',
                stripe_session_id: session.id,
                amount_paid: canonicalAmountCents,
                storage_bucket: storageBucket,
                storage_path: storagePath,
                recovery_token: recoveryToken,
                recovery_token_expires_at: recoveryExpiresAt,
                purchased_at: new Date().toISOString(),
              }, {
                onConflict: 'buyer_email,track_id',
                ignoreDuplicates: false,
              });

            if (musicError) {
              console.error('[stripe-webhook] Music purchase insert failed:', musicError.message, { code: musicError.code });
            } else {
              console.log('[stripe-webhook] Music purchase recorded:', item.name, '| amount_cents:', canonicalAmountCents, '| bucket:', storageBucket, '| path:', storagePath, '| token:', recoveryToken.substring(0, 8) + '...');
            }
          }
        }
      } catch (e) {
        console.error('[stripe-webhook] Failed to parse items for music purchase:', e);
      }
    }

    console.log('[stripe-webhook] checkout.session.completed processed:', session.id, '| email:', customerEmail, '| amount:', amount);
  }

  return NextResponse.json({ received: true });
}
