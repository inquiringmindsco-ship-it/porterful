import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

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
    const stripe = getStripe()
    const body = await request.json()
    const { items, shipping, referralCode } = body

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
    const shippingCost = subtotal >= 5000 ? 0 : 500 // $5 or free over $50
    const total = subtotal + shippingCost

    // Calculate artist earnings (67% to seller, 20% to artist fund, 3% to superfans, 10% platform)
    const artistFund = Math.round(subtotal * 0.20)
    const superfanShare = Math.round(subtotal * 0.03)
    const platformFee = Math.round(subtotal * 0.10)
    const sellerEarnings = subtotal - artistFund - superfanShare - platformFee

    // Check if Stripe is configured
    if (!stripe) {
      // Demo mode - return mock session
      const demoSessionId = `demo_session_${Date.now()}`
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://porterful.com'
      return NextResponse.json({
        sessionId: demoSessionId,
        url: `${baseUrl}/checkout/success?demo=true&session_id=${demoSessionId}`,
        demo: true,
        message: 'Stripe not configured. Running in demo mode.',
        breakdown: {
          subtotal: subtotal / 100,
          shipping: shippingCost / 100,
          total: total / 100,
          artistFund: artistFund / 100,
          sellerEarnings: sellerEarnings / 100,
        }
      })
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item: any) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name || item.title,
            description: item.artist ? `by ${item.artist}` : (item.description || ''),
            images: item.image ? [item.image] : [],
          },
          // Convert dollars to cents (Stripe expects cents)
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity || 1,
      })),
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/cart`,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'],
      },
      metadata: {
        artist_fund: artistFund.toString(),
        superfan_share: superfanShare.toString(),
        referral_code: referralCode || '',
        type: items[0]?.type || 'product',
      },
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      breakdown: {
        subtotal: subtotal / 100,
        shipping: shippingCost / 100,
        total: total / 100,
        artistFund: artistFund / 100,
        sellerEarnings: sellerEarnings / 100,
      }
    })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Checkout failed' },
      { status: 500 }
    )
  }
}