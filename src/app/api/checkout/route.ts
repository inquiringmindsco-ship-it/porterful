import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Debug: Check env vars
    const stripeKey = process.env.STRIPE_SECRET_KEY
    const stripeKeyPreview = stripeKey ? `${stripeKey.slice(0, 10)}...` : 'NOT SET'
    
    console.log('STRIPE_SECRET_KEY:', stripeKeyPreview)
    
    if (!stripeKey) {
      return NextResponse.json({ 
        error: 'Stripe key not found',
        debug: { 
          stripeKey: stripeKeyPreview,
          hasKey: false
        }
      })
    }

    // Dynamic import Stripe
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(stripeKey)
    
    console.log('Stripe initialized, creating session...')

    const body = await request.json()
    const { items } = body
    
    console.log('Items:', JSON.stringify(items))

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: items?.[0]?.name || 'Track',
          },
          unit_amount: 100,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: 'https://porterful.com/checkout/success',
      cancel_url: 'https://porterful.com/',
    })

    console.log('Session created:', session.id, session.url)

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      debug: {
        stripeKey: stripeKeyPreview,
        hasKey: true
      }
    })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ 
      error: error.message,
      type: error.type,
      stack: error.stack?.split('\n').slice(0, 5)
    }, { status: 500 })
  }
}