import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
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

    const sendResponse = (body: object) => new NextResponse(JSON.stringify(body), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        console.log('✅ Payment successful:', session.id)
        console.log('   Customer:', session.customer_details?.email || session.customer_email)
        console.log('   Amount:', session.amount_total ? `$${(session.amount_total / 100).toFixed(2)}` : 'N/A')

        const supabase = createServerClient()
        if (!supabase) {
          console.log('⚠️ Supabase not configured — cannot save order')
          return sendResponse({ received: true, warning: 'Supabase not configured' })
        }

        const items = session.metadata?.items
          ? JSON.parse(session.metadata.items)
          : []

        const amountCents = session.amount_total || 0
        const subtotalCents = session.amount_subtotal || 0
        const artistFundCents = parseFloat(session.metadata?.artist_fund || '0') * 100
        const superfanCents = parseFloat(session.metadata?.superfan_share || '0') * 100
        const platformCents = Math.round(subtotalCents * 0.10) // platform 10%
        const sellerCents = subtotalCents - artistFundCents - superfanCents - platformCents

        // Schema: id, user_id, order_number, status, subtotal, shipping, tax, total,
        // seller_total, artist_fund_total, superfan_total, platform_total,
        // referrer_id, stripe_payment_intent_id, stripe_checkout_session_id,
        // shipping_address, created_at, updated_at
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            id: session.id,
            user_id: null,
            status: 'paid',
            subtotal: subtotalCents / 100,
            total: amountCents / 100,
            shipping: 0,
            tax: 0,
            seller_total: sellerCents / 100,
            artist_fund_total: artistFundCents / 100,
            superfan_total: superfanCents / 100,
            platform_total: platformCents / 100,
            referrer_id: null,
            stripe_payment_intent_id: session.payment_intent as string,
            stripe_checkout_session_id: session.id,
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
        } else {
          console.log('✅ Order saved:', order.id)

          // Schema: id, order_id, product_id, product_name, price, quantity, seller_id, artist_id, superfan_id, created_at
          if (items.length > 0) {
            const orderItems = items.map((item: any) => ({
              order_id: session.id,
              product_id: item.id || null,
              product_name: item.name || item.title || 'Unknown Product',
              price: item.price * 100, // convert to cents integer
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

          // Update product sales count (best-effort)
          for (const item of items) {
            if (item.id) {
              try {
                await supabase.rpc('increment_sales_count', { product_id: item.id })
              } catch {
                // RPC might not exist
              }
            }
          }

          // TODO: Send confirmation email
          // TODO: Trigger Printful fulfillment
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
