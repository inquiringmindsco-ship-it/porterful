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

    // Build metadata from first item (for music purchases)
    const firstItem = items[0]
    const metadata: Record<string, string> = {
      item_type: firstItem?.type || 'track',
      item_id: firstItem?.id || '',
      item_name: firstItem?.name || '',
      item_artist: firstItem?.artist || '',
    }

    // Include audio_url if it's a track
    if (firstItem?.type === 'track' && firstItem?.audio_url) {
      metadata.audio_url = firstItem.audio_url
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: successUrl?.replace('{CHECKOUT_SESSION_ID}', '{CHECKOUT_SESSION_ID}') || `${request.nextUrl.origin}/checkout/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${request.nextUrl.origin}`,
      metadata,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: err.message || 'Checkout failed' }, { status: 500 })
  }
}
