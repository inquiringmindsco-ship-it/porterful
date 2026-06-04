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
import {
  buildStripeLineItems,
  CheckoutCatalogError,
  type CheckoutResolvedItem,
  resolveCheckoutCart,
} from '@/lib/checkout-catalog'
import {
  createMeasurementSessionId,
  getMeasurementSessionCookieName,
  readMeasurementSessionIdFromCookie,
  resolveMeasurementLocation,
} from '@/lib/measurement'

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
  items: CheckoutResolvedItem[]
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

  const orderItems = params.items.map((item) => ({
    order_id: order.id,
    product_id: isUuid(item.id) ? item.id : null,
    product_name: item.name || 'Product',
    quantity: Number(item.quantity || 1),
    price: Number(item.unitAmountCents || 0) / 100,
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
    const measurementLocation = resolveMeasurementLocation({
      headers: request.headers,
      city: shippingAddress?.city || null,
      state: shippingAddress?.state || null,
    })

    // Read referral cookie server-side — fallback to client-passed value
    const cookieReferralCode = request.cookies.get('porterful_referral')?.value || null
    const effectiveReferralCode = normalizeReferralHandle(referralCode || cookieReferralCode)

    if (!items.length) {
      return NextResponse.json({ error: 'No items in cart.' }, { status: 400 })
    }

    const resolvedCart = resolveCheckoutCart(items)
    const { items: resolvedItems, subtotalCents: subtotal, requiresShipping } = resolvedCart
    const primaryItem = resolvedItems[0] || null
    const shippingCost = requiresShipping ? (subtotal >= 5000 ? 0 : 500) : 0
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

    const measurementSessionCookie = request.cookies.get(getMeasurementSessionCookieName())?.value || null
    const measurementSessionId = readMeasurementSessionIdFromCookie(measurementSessionCookie) || createMeasurementSessionId()

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
        items: resolvedItems,
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
    const lineItems = buildStripeLineItems(resolvedItems, {
      baseUrl: request.nextUrl.origin,
    })

    // Demo mode if no Stripe
    if (!stripe) {
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({
          error: 'Checkout is temporarily unavailable.',
        }, { status: 503 })
      }

      const demoSessionId = `demo_session_${Date.now()}`
      return NextResponse.json({
        sessionId: demoSessionId,
        url: `${request.nextUrl.origin}/checkout/success?demo=true&session_id=${demoSessionId}`,
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
      type: primaryItem?.kind || 'product',
      product_id: primaryItem?.productId || primaryItem?.id || '',
      sku_id: primaryItem?.skuId || '',
      sku_code: primaryItem?.skuCode || '',
      production_asset_id: primaryItem?.productionAssetId || '',
      artist_id: primaryItem?.artistId || '',
      fulfillment_type: primaryItem?.fulfillmentType || '',
      catalog_status: primaryItem?.catalogStatus || '',
      audio_url: primaryItem?.audioUrl || '',
      track_name: primaryItem?.name || '',
      track_artist: primaryItem?.artist || '',
      track_image: primaryItem?.image || '',
      // Store minimal items — Stripe metadata values have 500-char limit per key.
      // Full item data is recovered server-side via /api/session/{id} using catalog lookup.
      items: JSON.stringify(resolvedItems.map((item) => ({
        id: item.id,
        productId: item.productId || '',
        name: item.name,
        artist: item.artist,
        price: (item.unitAmountCents || 0) / 100,
        type: item.kind,
        quantity: item.quantity,
        unitAmountCents: item.unitAmountCents,
        skuId: item.skuId || '',
        skuCode: item.skuCode || '',
        productionAssetId: item.productionAssetId || '',
        artistId: item.artistId || '',
        fulfillmentType: item.fulfillmentType || '',
        catalogStatus: item.catalogStatus || '',
        audioUrl: item.audioUrl || '',
      }))),
      activation_code_value: activationCodeValue || '',
      activation_code_id: activationRecord?.id || '',
      activation_code_kind: activationRecord?.kind || '',
      payment_method: 'stripe',
      discount_cents: activationDiscountCents.toString(),
      measurement_session_id: measurementSessionId,
      measurement_city: measurementLocation.city || '',
      measurement_state: measurementLocation.state || '',
    }

    const sessionParams: any = {
      line_items: lineItems,
      mode: 'payment',
      success_url: 'https://porterful.com/checkout/checkout/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://porterful.com/',
      metadata,
    }

    // Only collect shipping for physical products
    if (requiresShipping) {
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

    const response = NextResponse.json({
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
    if (!measurementSessionCookie) {
      response.cookies.set(getMeasurementSessionCookieName(), measurementSessionId, {
        httpOnly: false,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
      })
    }

    return response
  } catch (error: any) {
    if (error instanceof CheckoutCatalogError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Checkout failed' },
      { status: 500 }
    )
  }
}
