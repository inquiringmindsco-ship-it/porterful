import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const profileId = user.id

  const { data: profile } = await supabase
    .from('profiles')
    .select('lk_id')
    .eq('id', profileId)
    .limit(1)
    .maybeSingle()

  const lkId = (profile as any)?.lk_id
  if (!lkId) {
    return NextResponse.json({ error: 'Likeness identity required' }, { status: 403 })
  }

  const { productId, price } = await req.json()
  const PRODUCT_CATALOG: Record<string, { name: string; price: number }> = {
    'credit-klimb': { name: 'Credit Klimb', price: 4900 },
    'nlds-membership': { name: 'NLDS Deal Access', price: 2500 },
    'teachyoung': { name: 'TeachYoung', price: 1900 },
    'family-os': { name: 'Family Legacy OS', price: 3900 },
  }
  const product = PRODUCT_CATALOG[productId]
  if (!product) return NextResponse.json({ error: 'Unknown product' }, { status: 400 })

  const priceOverride = typeof price === 'number' ? Math.round(price * 100) : product.price
  if (priceOverride < product.price * 0.5 || priceOverride > product.price * 1.5) {
    return NextResponse.json({ error: 'Price outside reasonable range' }, { status: 400 })
  }

  const OFFER_SECRET = process.env.OFFER_SECRET || process.env.INTERNAL_API_KEY || 'likeness_offer_secret_2026'
  const { createHmac } = await import('crypto')
  const offerId = `OFR-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
  const payload = {
    offer_id: offerId,
    lk_id: lkId,
    username: user.email?.split('@')[0] || 'user',
    product_id: productId,
    product_name: product.name,
    price_cents: priceOverride,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
  }
  const data = JSON.stringify(payload)
  const sig = createHmac('sha256', OFFER_SECRET).update(data).digest('base64url')
  const token = Buffer.from(data).toString('base64url') + '.' + sig

  const offerUrl = `${req.nextUrl.origin}/offer/${offerId}?token=${token}`
  return NextResponse.json({ offer_id: offerId, offer_url: offerUrl, token })
}

export async function GET(req: NextRequest) {
  const supabase = createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const profileId = user.id
  const { data: profile } = await supabase
    .from('profiles')
    .select('lk_id')
    .eq('id', profileId)
    .limit(1)
    .maybeSingle()

  const lkId = (profile as any)?.lk_id
  if (!lkId) {
    return NextResponse.json({ error: 'No Likeness identity' }, { status: 403 })
  }

  return NextResponse.json({ offers: [], message: 'Token-based offers — links are self-contained' })
}
