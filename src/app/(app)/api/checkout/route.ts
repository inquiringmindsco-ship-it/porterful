import { NextRequest, NextResponse } from 'next/server'
import { decodePorterfulSession } from '@/lib/porterful-session'
import { createServerClient } from '@/lib/supabase'
import { normalizeReferralHandle, resolveReferrerId } from '@/lib/referral'
import {
  consumeActivationCode,
  getActivationCodeByValue,
  getDiscountCents,
  normalizeActivationCode,
} from '@/lib/activation'

// Dynamic Stripe import
async function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  const Stripe = (await import('stripe')).default
  return new Stripe(key)
}

function isUuid(value: string | null | undefined): boolean {
  return typeof value === 'string'
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function normalizeEmail(value: string | null | undefined): string | null {
  const email = value?.trim().toLowerCase()
  return email ? email : null
}

async function createCashOrder(params: {
  supabase: ReturnType<typeof createServerClient>
  items: any[]
  buyerId: string | null
  buyerEmail: string | null
  shippingAddress: Record<string, unknown> | null
  referrerId: string | null
  activationCodeId: string | null
  paymentMethod: 'cash' | 'code'
  discountCents: number
  orderAmountCents: number
}) {
  const sellerTotal = Math.round(params.orderAmountCents * 0.67)
  const artistFundTotal = Math.round(params.orderAmountCents * 0.20)
  const superfanTotal = Math.round(params.orderAmountCents * 0.03)
  const platformTotal = Math.round(params.orderAmountCents * 0.10)

  const { data: order, error: orderError } = await params.supabase
    .from('orders')
    .insert({
      user_id: params.buyerId || null,
      buyer_id: params.buyerId || null,
      buyer_email: params.buyerEmail,
      amount: params.orderAmountCents,
      seller_total: sellerTotal,
      artist_fund_total: artistFundTotal,
      superfan_total: superfanTotal,
      platform_total: platformTotal,
      referrer_id: params.referrerId,
      activation_code_id: params.activationCodeId,
      payment_method: params.paymentMethod,
      discount_cents: params.discountCents,
      shipping_address: params.shippingAddress,
      status: 'completed',
    })
    .select()
    .single()

  if (orderError || !order) {
    throw new Error(orderError?.message || 'Could not create order')
  }

  const orderItems = params.items.map((item: any) => ({
    order_id: order.id,
    product_id: isUuid(item.id || item.productId) ? (item.id || item.productId) : null,
    product_name: item.name || item.title || 'Product',
    quantity: Number(item.quantity || 1),
    price: Number(item.price || 0),
    seller_id: null,
    artist_id: null,
    superfan_id: params.referrerId || null,
  }))

  const { error: itemsError } = await params.supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) {
    await params.supabase.from('orders').delete().eq('id', order.id)
    throw new Error(itemsError.message)
  }

  return {
    order,
    sellerTotal,
    artistFundTotal,
    superfanTotal,
    platformTotal,
  }
}

export async function POST(request: NextRequest) {
  try {
    const stripe = await getStripe()
    const body = await request.json()
    const items = Array.isArray(body?.items) ? body.items : []
    const referralCode = body?.referralCode || null
    const activationCodeValue = normalizeActivationCode(body?.activationCode || body?.code || null)
    const shippingAddress = body?.shipping_address || body?.shippingAddress || null
    const shippingEmail = normalizeEmail(body?.shippingEmail || body?.shipping_email || shippingAddress?.email || null)

    // Read referral cookie server-side — fallback to client-passed value
    const cookieReferralCode = request.cookies.get('porterful_referral')?.value || null
    const effectiveReferralCode = normalizeReferralHandle(referralCode || cookieReferralCode)

    if (!items.length) {
      return NextResponse.json({ error: 'No items in cart.' }, { status: 400 })
    }

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
    const artistFund = Math.round(subtotal * 0.20)
    const superfanShare = effectiveReferralCode ? Math.round(subtotal * 0.03) : 0
    const platformFee = Math.round(subtotal * 0.10)
    const sellerEarnings = subtotal - artistFund - superfanShare - platformFee

    const supabase = createServerClient()

    const sessionToken = request.cookies.get('porterful_session')?.value
    let profileId: string | null = null
    let lkId: string | null = null
    let sessionEmail: string | null = null

    if (sessionToken) {
      try {
        const sessionData = decodePorterfulSession(sessionToken)
        if (!sessionData) throw new Error('invalid_session')
        profileId = sessionData.profileId || null
        lkId = sessionData.lkId || null
        sessionEmail = normalizeEmail(sessionData.email || null)
      } catch {}
    }

    profileId = profileId || request.headers.get('x-pf-profile-id') || null
    lkId = lkId || request.headers.get('x-pf-lk-id') || null
    sessionEmail = sessionEmail || normalizeEmail(request.headers.get('x-pf-email') || null)

    const buyerEmail = shippingEmail || sessionEmail || null
    let activationRecord: Awaited<ReturnType<typeof getActivationCodeByValue>>['data'] | null = null
    if (activationCodeValue) {
      const { data, error } = await getActivationCodeByValue(supabase, activationCodeValue)
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      activationRecord = data || null
    }

    if (activationCodeValue && !activationRecord) {
      return NextResponse.json({ error: 'Invalid or already used code.' }, { status: 404 })
    }

    if (activationRecord?.kind === 'activation' && !activationRecord.prepaid) {
      return NextResponse.json({
        error: 'This code is for account activation only. Use it on /activate.',
      }, { status: 400 })
    }

    const activationDiscountCents = activationRecord && activationRecord.kind === 'discount'
      ? getDiscountCents(activationRecord)
      : 0
    const discountedSubtotal = Math.max(0, subtotal - activationDiscountCents)
    const payableTotal = discountedSubtotal + shippingCost
    const isPrepaidActivation = Boolean(activationRecord?.kind === 'activation' && activationRecord.prepaid)

    if (activationRecord && (isPrepaidActivation || (activationRecord.kind === 'discount' && payableTotal <= 0))) {
      const paymentMethod: 'cash' | 'code' = isPrepaidActivation ? 'cash' : 'code'
      const orderAmountCents = isPrepaidActivation ? total : payableTotal
      const { order } = await createCashOrder({
        supabase,
        items,
        buyerId: profileId,
        buyerEmail,
        shippingAddress,
        referrerId: effectiveReferralCode ? await resolveReferrerId(supabase, effectiveReferralCode) : null,
        activationCodeId: activationRecord.id,
        paymentMethod,
        discountCents: isPrepaidActivation ? 0 : activationDiscountCents,
        orderAmountCents,
      })

      const { data: consumed, error: consumeError } = await consumeActivationCode(supabase, activationRecord.code_value, {
        redeemedByProfileId: profileId,
        redeemedEmail: buyerEmail,
        orderId: order.id,
      })

      if (consumeError || !consumed) {
        await supabase.from('orders').delete().eq('id', order.id)
        return NextResponse.json({ error: 'This code could not be activated.' }, { status: 409 })
      }

      if (profileId) {
        await supabase
          .from('profiles')
          .update({
            paid_cash: true,
            cash_paid_at: new Date().toISOString(),
            activation_code_id: consumed.id,
          })
          .eq('id', profileId)
      }

      return NextResponse.json({
        cash: true,
        noCharge: true,
        orderId: order.id,
        message: 'Your signal has been activated.',
        breakdown: {
          subtotal: subtotal / 100,
          shipping: shippingCost / 100,
          total: orderAmountCents / 100,
          discount: activationDiscountCents / 100,
          artistFund: Math.round(orderAmountCents * 0.20) / 100,
          sellerEarnings: Math.round(orderAmountCents * 0.67) / 100,
        },
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

    const metadata: Record<string, string> = {
      // Attribution — ties payment to Likeness™ identity
      user_id: profileId || '',
      lk_id: lkId || '',
      email: sessionEmail || '',
      source: 'porterful',
      referral_code: effectiveReferralCode || '',
      artist_fund: artistFund.toString(),
      superfan_share: superfanShare.toString(),
      type: items[0]?.type || 'product',
      product_id: items[0]?.id || '',
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
      activation_code_value: activationCodeValue || '',
      activation_code_id: activationRecord?.id || '',
      activation_code_kind: activationRecord?.kind || '',
      payment_method: 'stripe',
      discount_cents: activationDiscountCents.toString(),
    }

    const sessionParams: any = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: 'https://porterful.com/checkout/checkout/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://porterful.com/',
      metadata,
    }

    // Only collect shipping for physical products
    if (!isDigital) {
      sessionParams.shipping_address_collection = {
        allowed_countries: ['US', 'CA'],
      }
    }

      if (activationRecord && activationRecord.kind === 'discount') {
      const discountAmount = Math.min(activationDiscountCents, subtotal)
      if (discountAmount > 0) {
        const coupon = await stripe.coupons.create({
          amount_off: discountAmount,
          currency: 'usd',
          duration: 'once',
          name: `Porterful ${activationCodeValue}`,
        })
        sessionParams.discounts = [{ coupon: coupon.id }]
      }

      await consumeActivationCode(supabase, activationRecord.code_value, {
        redeemedByProfileId: profileId,
        redeemedEmail: buyerEmail,
      })
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
