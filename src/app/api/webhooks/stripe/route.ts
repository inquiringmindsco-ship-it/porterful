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

    // Always respond quickly to Stripe
    const sendResponse = (body: object) => new NextResponse(JSON.stringify(body), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const sessionWithShipping = session as Stripe.Checkout.Session & {
          shipping_details: {
            name?: string
            address?: {
              line1?: string
              city?: string
              state?: string
              postal_code?: string
              country?: string
            }
          } | null
        }
        
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

        // Save order to Supabase
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            id: session.id,
            buyer_id: null,
            status: 'paid',
            total: (session.amount_total || 0) / 100,
            subtotal: (session.amount_subtotal || 0) / 100,
            commission_total: parseFloat(session.metadata?.artist_fund || '0') / 100,
            referral_commission: parseFloat(session.metadata?.superfan_share || '0') / 100,
            stripe_payment_id: session.payment_intent as string,
            shipping_address: sessionWithShipping.shipping_details ? {
              name: sessionWithShipping.shipping_details.name || '',
              address: sessionWithShipping.shipping_details.address?.line1 || '',
              city: sessionWithShipping.shipping_details.address?.city || '',
              state: sessionWithShipping.shipping_details.address?.state || '',
              zip: sessionWithShipping.shipping_details.address?.postal_code || '',
              country: sessionWithShipping.shipping_details.address?.country || 'US',
            } : null,
          })
          .select()
          .single()

        if (orderError) {
          console.error('❌ Failed to save order:', orderError.message)
          // Don't return error to Stripe — order is paid, we can reconcile manually
        } else {
          console.log('✅ Order saved:', order.id)

          // Save order items
          if (items.length > 0) {
            const orderItems = items.map((item: any) => ({
              order_id: session.id,
              product_id: item.id || null,
              quantity: item.quantity || 1,
              price: item.price,
              commission: item.artistCut ? (item.price * item.artistCut) / 100 : 0,
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

          // Update product sales count
          if (items.length > 0) {
            for (const item of items) {
              if (item.id) {
                try {
                  await supabase.rpc('increment_sales_count', { product_id: item.id })
                } catch {
                  // RPC might not exist — safe to ignore
                }
              }
            }
          }

          // TODO: Send confirmation email
          // TODO: Trigger fulfillment
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
        
        // Update order status to refunded
        const supabase = createServerClient()
        if (supabase && charge.payment_intent) {
          try {
            await supabase
              .from('orders')
              .update({ status: 'refunded' })
              .eq('stripe_payment_id', charge.payment_intent as string)
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
