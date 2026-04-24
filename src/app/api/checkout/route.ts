import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, successUrl, cancelUrl } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items specified' }, { status: 400 })
    }

    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.type === 'track' ? `${item.artist} — ${item.name}` : item.name,
          description: item.type === 'track' ? `Digital track purchase` : undefined,
        },
        unit_amount: Math.round((item.price || 1) * 100),
      },
      quantity: item.quantity || 1,
    }))

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: successUrl?.replace('{CHECKOUT_SESSION_ID}', '{CHECKOUT_SESSION_ID}') || `${request.nextUrl.origin}/checkout/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${request.nextUrl.origin}`,
      payment_intent_data: {
        metadata: {
          item_type: items[0]?.type || 'track',
          item_id: items[0]?.id || '',
        },
      },
      metadata: {
        item_type: items[0]?.type || 'track',
        item_id: items[0]?.id || '',
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: err.message || 'Checkout failed' }, { status: 500 })
  }
}
