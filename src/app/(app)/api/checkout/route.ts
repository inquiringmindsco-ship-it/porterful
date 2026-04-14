import { NextRequest, NextResponse } from 'next/server'

// Dynamic Stripe import
async function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  const Stripe = (await import('stripe')).default
  return new Stripe(key)
}

export async function POST(request: NextRequest) {
  try {
    const stripe = await getStripe()
    const body = await request.json()
    const { items, referralCode } = body

    // Read referral cookie server-side — fallback to client-passed value
    const cookieReferralCode = request.cookies.get('porterful_referral')?.value || null
    const effectiveReferralCode = referralCode || cookieReferralCode

    // Check if this is digital (tracks) or physical (merch)
    const isDigital = items.some((item: any) => item.type === 'track' || item.type === 'digital')
    
    // Calculate totals (in cents)
    const subtotal = items.reduce((sum: number, item: any) => {
      const price = Math.round(item.price * 100)
      return sum + (price * (item.quantity || 1))
    }, 0)
    
    const shippingCost = isDigital ? 0 : (subtotal >= 5000 ? 0 : 500)
    const total = subtotal + shippingCost

    // Artist earnings breakdown
    // Note: 3% flat for now. Tier-based (3/5/8/10%) requires referrer tier lookup at checkout.
    const artistFund = Math.round(subtotal * 0.20)
    const superfanShare = effectiveReferralCode ? Math.round(subtotal * 0.03) : 0
    const platformFee = Math.round(subtotal * 0.10)
    const sellerEarnings = subtotal - artistFund - superfanShare - platformFee

    // Demo mode if no Stripe
    if (!stripe) {
      const demoSessionId = `demo_session_${Date.now()}`
      return NextResponse.json({
        sessionId: demoSessionId,
        url: `https://porterful.com/checkout/success?demo=true&session_id=${demoSessionId}`,
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
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name || item.title || 'Product',
          description: item.artist ? `by ${item.artist}` : (item.description || undefined),
          images: item.image ? [item.image.startsWith('http') ? item.image : `https://porterful.com${item.image}`] : undefined,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity || 1,
    }))

    // Get Likeness™ identity from session (set by middleware or direct cookie)
    const sessionToken = request.cookies.get('porterful_session')?.value;
    let profileId: string | null = null;
    let lkId: string | null = null;
    let sessionEmail: string | null = null;

    if (sessionToken) {
      try {
        const sessionData = JSON.parse(Buffer.from(sessionToken, 'base64url').toString('utf8'));
        profileId = sessionData.profileId || null;
        lkId = sessionData.lkId || null;
        sessionEmail = sessionData.email || null;
      } catch {}
    }

    // Fallback to middleware-set headers (injected when same-server)
    profileId = profileId || request.headers.get('x-pf-profile-id') || null;
    lkId = lkId || request.headers.get('x-pf-lk-id') || null;
    sessionEmail = sessionEmail || request.headers.get('x-pf-email') || null;

    const sessionParams: any = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: 'https://porterful.com/checkout/checkout/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://porterful.com/',
      metadata: {
        // Attribution — ties payment to Likeness™ identity
        user_id: profileId || '',
        lk_id: lkId || '',
        email: sessionEmail || '',
        source: 'porterful',
        referral_code: effectiveReferralCode || '',
        artist_fund: artistFund.toString(),
        superfan_share: superfanShare.toString(),
        type: items[0]?.type || 'product',
        audio_url: items[0]?.audioUrl || '',
        track_name: items[0]?.name || '',
        track_artist: items[0]?.artist || '',
        track_image: items[0]?.image || '',
        items: JSON.stringify(items.map((item: any) => ({
          id: item.id || null,
          name: item.name || item.title,
          artist: item.artist,
          price: item.price,
          quantity: item.quantity || 1,
          artistCut: item.artistCut || 0,
        }))),
      },
    }

    // Only collect shipping for physical products
    if (!isDigital) {
      sessionParams.shipping_address_collection = {
        allowed_countries: ['US', 'CA'],
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

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