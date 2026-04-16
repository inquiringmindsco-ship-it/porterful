import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { randomUUID } from 'crypto'
import { createServerClient } from '@/lib/supabase'

// Lazy-initialize Stripe only when needed
let stripeInstance: Stripe | null = null

const getStripe = () => {
  if (!stripeInstance && process.env.STRIPE_SECRET_KEY) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)
  }
  return stripeInstance
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    const stripe = getStripe()
    
    if (!webhookSecret || webhookSecret === 'your_stripe_webhook_secret' || !stripe) {
      console.log('⚠️ Webhook: Stripe/webhook not configured — skipping order save')
      return NextResponse.json({ received: true, warning: 'Stripe not configured' })
    }

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature!, webhookSecret)
    } catch (err: any) {
      console.error('❌ Webhook signature verification failed:', err.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        console.log('✅ Porterful Payment successful:', session.id)
        console.log('   Customer:', session.customer_details?.email || session.customer_email)
        console.log('   Amount:', session.amount_total ? `$${(session.amount_total / 100).toFixed(2)}` : 'N/A')

        const supabase = createServerClient()
        if (!supabase) {
          console.log('⚠️ Supabase not configured — cannot save order')
          return NextResponse.json({ received: true, warning: 'Supabase not configured' })
        }

        // ── Hardened metadata extraction ──────────────────────────────────
        const metadata = session.metadata || {}
        const productId = metadata.product_id
        const offerId = metadata.offer_id
        const lkId = metadata.lk_id
        const source = metadata.source

        if (!productId) {
          console.error('❌ Webhook: missing required metadata.product_id — cannot save order')
          console.error('   session.id:', session.id)
          console.error('   metadata:', JSON.stringify(metadata))
          return NextResponse.json({ error: 'Missing required metadata.product_id' }, { status: 400 })
        }

        const items = metadata.items ? JSON.parse(metadata.items) : []

        const amountCents = session.amount_total || 0
        const subtotalCents = session.amount_subtotal || 0
        const artistFundCents = parseFloat(metadata.artist_fund || '0') * 100
        const superfanCents = parseFloat(metadata.superfan_share || '0') * 100
        const platformCents = Math.round(subtotalCents * 0.10)
        const sellerCents = subtotalCents - artistFundCents - superfanCents - platformCents

        const buyerEmail = session.customer_email || session.customer_details?.email
        const buyerUserId = metadata.user_id || null

        // Resolve lk_id → profiles.id for referrer attribution
        let resolvedReferrerId: string | null = null
        const lkId = session.metadata?.lk_id
        if (lkId) {
          const { data: referrerProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('lk_id', lkId)
            .single()
          resolvedReferrerId = referrerProfile?.id || null
          if (resolvedReferrerId) {
            console.log('✅ Referrer resolved:', lkId, '→', resolvedReferrerId)
          } else {
            console.log('⚠️ lk_id not found in profiles:', lkId)
          }
        }

        // ── Idempotency: check for existing order by session or payment intent ──
        const sessionId = session.id
        const paymentIntentId = session.payment_intent as string
        const { data: existingOrder } = await supabase
          .from('orders')
          .select('id')
          .eq('stripe_checkout_session_id', sessionId)
          .maybeSingle()

        if (existingOrder) {
          console.log('ℹ️ Order already exists for session:', sessionId, '— skipping duplicate')
        } else {
          // Generate proper UUID for orders.id (Stripe session IDs are not valid UUIDs)
          const orderId = randomUUID()

          const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
              id: orderId,
              status: 'completed',
              buyer_email: buyerEmail,
              product_id: productId,
              amount: amountCents / 100,
              user_id: buyerUserId,
              stripe_checkout_session_id: sessionId,
              stripe_payment_intent_id: paymentIntentId,
              referrer_id: resolvedReferrerId,
              seller_total: sellerCents / 100,
              artist_fund_total: artistFundCents / 100,
              superfan_total: superfanCents / 100,
              platform_total: platformCents / 100,
              shipping_address: (session as any).shipping_details ? JSON.stringify({
                name: (session as any).shipping_details?.name || '',
                line1: (session as any).shipping_details?.address?.line1 || '',
                city: (session as any).shipping_details?.address?.city || '',
                state: (session as any).shipping_details?.address?.state || '',
                postal_code: (session as any).shipping_details?.address?.postal_code || '',
                country: (session as any).shipping_details?.address?.country || 'US',
              }) : null,
            })
            .select()
            .single()

          if (orderError) {
            console.error('❌ Failed to save order:', orderError.message)
            return NextResponse.json({ error: 'Failed to save order: ' + orderError.message }, { status: 500 })
          }
          console.log('✅ Order saved:', order.id)

          // ── Create Entitlement ────────────────────────────────────────────
          if (buyerEmail && productId) {
            try {
              const { data: existing } = await supabase
                .from('entitlements')
                .select('id')
                .eq('buyer_email', buyerEmail)
                .eq('product_id', productId)
                .eq('status', 'active')
                .maybeSingle()
              
              if (!existing) {
                const { data: entitlement, error: entError } = await supabase
                  .from('entitlements')
                  .insert({
                    buyer_email: buyerEmail,
                    buyer_user_id: buyerUserId,
                    product_id: productId,
                    offer_id: offerId || null,
                    referrer_id: resolvedReferrerId,
                    order_id: orderId,
                    status: 'active',
                  })
                  .select()
                  .single()
                
                if (entError) {
                  console.error('❌ Failed to create entitlement:', entError.message)
                } else {
                  console.log('✅ Entitlement created:', entitlement.id)
                }
              } else {
                console.log('ℹ️ Active entitlement already exists for', buyerEmail)
              }
            } catch (entErr) {
              console.error('❌ Entitlement error:', entErr)
            }
          }

          // ── Credit Referral Earnings ─────────────────────────────────────────
          const referralCode = metadata.referral_code
          
          let resolvedReferrerId2: string | null = null
          if (lkId) {
            const { data } = await supabase
              .from('profiles')
              .select('id')
              .eq('lk_id', lkId)
              .single()
            resolvedReferrerId2 = data?.id || null
          }
          
          const referralProfileId = resolvedReferrerId2
            || (referralCode
              ? (await supabase.from('profiles').select('id').eq('referral_code', referralCode).single().then(r => r.data?.id))
              : null)

          if (referralProfileId && superfanCents > 0) {
            try {
              await supabase.from('referral_earnings').insert({
                superfan_id: referralProfileId,
                order_id: orderId,
                amount: superfanCents / 100,
                status: 'pending',
              })

              const { data: refProfile } = await supabase
                .from('profiles')
                .select('total_referrals')
                .eq('id', referralProfileId)
                .single()
              
              if (refProfile) {
                await supabase
                  .from('profiles')
                  .update({ total_referrals: (refProfile.total_referrals || 0) + 1 })
                  .eq('id', referralProfileId)
              }

              console.log(`✅ Referral earnings: ${(superfanCents / 100).toFixed(2)} → user ${referralProfileId}`)
            } catch (refErr) {
              console.error('❌ Referral earnings error:', refErr)
            }
          }
        }

        // ── Dropship Order Forwarding ────────────────────────────────────
          const dropshipItems = items.filter((item: any) => item.dropship === true)
          if (dropshipItems.length > 0) {
            const shipping = (session as any).shipping_details?.address || {}
            const nameParts = ((session as any).shipping_details?.name || 'Customer').split(' ')
            const firstName = nameParts[0] || ''
            const lastName = nameParts.slice(1).join(' ') || ''

            for (const item of dropshipItems) {
              const supplierPrice = item.supplierPrice || 0
              const storePrice = item.price || 0
              const margin = (storePrice - supplierPrice) * (item.quantity || 1)

              const dropshipPayload = {
                orderId: session.id,
                customer: {
                  email: session.customer_email || session.customer_details?.email || '',
                  name: (session as any).shipping_details?.name || 'Customer',
                  phone: (session as any).shipping_details?.phone || '',
                },
                shippingAddress: {
                  firstName,
                  lastName,
                  address: shipping.line1 || '',
                  city: shipping.city || '',
                  state: shipping.state || '',
                  zip: shipping.postal_code || '',
                  country: shipping.country || 'US',
                  phone: (session as any).shipping_details?.phone || '',
                },
                items: [{
                  name: item.name || item.title,
                  quantity: item.quantity || 1,
                  price: storePrice,
                  sku: item.id,
                }],
                total: (session.amount_total || 0) / 100,
                shippingCost: 0,
                PorterfulMargin: margin,
              }

              try {
                const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://porterful.com'
                const dropshipRes = await fetch(`${baseUrl}/api/dropship/carcamfpv`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'forward_order', payload: dropshipPayload }),
                })
                const dropshipResult = await dropshipRes.json()
                console.log(`[dropship] RC FPV Mini Car forwarded:`, dropshipResult.success ? '✅' : '❌', dropshipResult.message || '')
              } catch (err) {
                console.error('[dropship] Forward failed:', err)
              }
            }
          }

          if (items.length > 0) {
            const orderItems = items.map((item: any) => ({
              order_id: session.id,
              product_id: item.id || null,
              product_name: item.name || item.title || 'Unknown Product',
              price: item.price * 100,
              quantity: item.quantity || 1,
              seller_id: null,
              artist_id: null,
              superfan_id: null,
            }))

            const { error: itemsError } = await supabase
              .from('order_items')
              .insert(orderItems)

            if (itemsError) {
              console.error('❌ Failed to save order items:', itemsError.message)
            } else {
              console.log('✅ Order items saved:', items.length)
            }
          }

          for (const item of items) {
            if (item.id) {
              try {
                await supabase.rpc('increment_sales_count', { product_id: item.id })
              } catch {
                // RPC might not exist
              }
            }
          }

          // ── Send Confirmation Email ───────────────────────────────────────
          const receiptEmail = session.customer_email || session.customer_details?.email
          if (receiptEmail) {
            sendOrderConfirmation(receiptEmail, session, items, {
              username: session.metadata?.username || 'the seller',
              offer_id: session.metadata?.offer_id || null,
            }).catch(err =>
              console.error('[porterful-webhook] Confirmation email failed:', err)
            )
          }
        }
        break
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('❌ Payment failed:', paymentIntent.id)
        console.log('   Error:', paymentIntent.last_payment_error?.message)
        break
      }
      
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        console.log('💸 Refund processed:', charge.id)
        
        const supabase = createServerClient()
        if (supabase && charge.payment_intent) {
          try {
            await supabase
              .from('orders')
              .update({ status: 'refunded' })
              .eq('stripe_payment_intent_id', charge.payment_intent as string)
          } catch (e) {
            console.error('Refund status update failed:', e)
          }
        }
        break
      }
      
      default:
        console.log(`Webhook event: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function sendOrderConfirmation(
  email: string,
  session: Stripe.Checkout.Session,
  items: any[],
  options: { username: string; offer_id: string | null } = { username: 'the seller', offer_id: null }
) {
  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) {
    console.warn('[porterful-email] RESEND_API_KEY not set — skipping confirmation')
    return
  }

  const fromAddress = process.env.EMAIL_FROM || 'Porterful <noreply@porterful.com>'
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://porterful.com'

  const total = (session.amount_total || 0) / 100
  const productName = items.length > 0 ? (items[0].name || items[0].title || 'your purchase') : 'your purchase'
  const sellerUsername = options.username
  const claimUrl = `${baseUrl}/claim?email=${encodeURIComponent(email)}&product=${encodeURIComponent(session.metadata?.product_id || '')}&offer=${encodeURIComponent(options.offer_id || '')}&session=${encodeURIComponent(session.id)}`

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #000; color: #fff; margin: 0; padding: 0; }
    .container { max-width: 560px; margin: 0 auto; padding: 40px 20px; }
    .header { text-align: center; margin-bottom: 32px; }
    .logo { font-size: 20px; font-weight: 900; color: #f97316; }
    h1 { font-size: 28px; font-weight: 900; margin: 0 0 12px; color: #fff; }
    p { color: #9ca3af; line-height: 1.7; font-size: 15px; margin: 0 0 16px; }
    .card { background: #0f0f0f; border: 1px solid #1f2937; border-radius: 12px; padding: 24px; margin: 24px 0; }
    .card-title { font-size: 12px; font-weight: 700; color: #f97316; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
    .detail { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #1f2937; }
    .detail:last-child { border-bottom: none; }
    .detail-label { color: #6b7280; font-size: 13px; }
    .detail-value { color: #fff; font-size: 13px; font-weight: 600; }
    .item-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #1f2937; }
    .item-row:last-child { border-bottom: none; }
    .footer { text-align: center; color: #4b5563; font-size: 12px; margin-top: 40px; border-top: 1px solid #1f2937; padding-top: 24px; }
    .cta { display: inline-block; background: #f97316; color: #000; font-weight: 700; font-size: 15px; padding: 14px 28px; border-radius: 8px; text-decoration: none; margin: 8px 0; }
    .cta-secondary { display: inline-block; background: transparent; color: #9ca3af; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 8px 0; border: 1px solid #1f2937; }
    .cta-block { text-align: center; margin: 32px 0; }
    .ref { color: #4b5563; font-size: 11px; font-family: monospace; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">PORTERFUL</div>
    </div>

    <h1>Payment Received ✅</h1>
    <p>Your payment of <strong style="color:#fff">$${total.toFixed(2)}</strong> has been confirmed. Access via <strong style="color:#fff">@${sellerUsername}</strong>.</p>

    <div class="card">
      <div class="card-title">Order Confirmation</div>
      ${items.map((item: any) => `
        <div class="item-row">
          <span class="detail-label">${item.name || item.title}</span>
          <span class="detail-value">×${item.quantity || 1}</span>
        </div>
      `).join('')}
      <div class="item-row" style="margin-top:12px;padding-top:12px;border-top:1px solid #1f2937">
        <span class="detail-label" style="font-weight:700;color:#fff">Total Paid</span>
        <span class="detail-value" style="color:#f97316">$${total.toFixed(2)}</span>
      </div>
      <div class="item-row">
        <span class="detail-label">Seller</span>
        <span class="detail-value">@${sellerUsername}</span>
      </div>
      <div class="item-row">
        <span class="detail-label">Reference</span>
        <span class="detail-value ref">${session.id}</span>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Claim Your Access</div>
      <p style="margin:0 0 16px;color:#9ca3af;font-size:13px;">
        Click below to claim access to your purchase. Use the same email you used at checkout.
      </p>
      <div class="cta-block" style="margin:16px 0;">
        <a href="${claimUrl}" class="cta">Claim Your Access →</a>
      </div>
      <p style="margin:0;color:#4b5563;font-size:12px;">
        Having trouble? Visit <a href="${baseUrl}/claim" style="color:#6b7280">porterful.com/claim</a> and enter your email.
      </p>
    </div>

    <div class="footer">
      Porterful — Where artists own their future.<br>
      <a href="${baseUrl}" style="color:#6b7280">porterful.com</a>
    </div>
  </div>
</body>
</html>`

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromAddress,
      to: email,
      subject: `✅ Order confirmed — $${total.toFixed(2)}`,
      html,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Resend error: ${response.status} ${err}`)
  }

  const data = await response.json() as { id: string }
  console.log(`[porterful-email] Confirmation sent: ${data.id}`)
}