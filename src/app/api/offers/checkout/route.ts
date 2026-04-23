import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { decodePorterfulSession } from '@/lib/porterful-session';

function getOfferSecret() {
  const secret =
    process.env.OFFER_SECRET ||
    process.env.PORTERFUL_SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!secret) {
    throw new Error('Offer signing secret is required');
  }
  return secret;
}

function verifyOffer(token: string): { valid: true; data: any } | { valid: false; error: string } {
  try {
    const [tokenPart, sigPart] = token.split('.');
    if (!tokenPart || !sigPart) return { valid: false, error: 'Malformed token' };
    const data = JSON.parse(Buffer.from(tokenPart, 'base64url').toString('utf8'));
    const sig = crypto.createHmac('sha256', getOfferSecret()).update(JSON.stringify(data)).digest('base64url');
    if (sigPart !== sig) return { valid: false, error: 'Invalid signature' };
    if (data.exp && data.exp < Math.floor(Date.now() / 1000)) return { valid: false, error: 'Expired' };
    return { valid: true, data };
  } catch {
    return { valid: false, error: 'Invalid token' };
  }
}

const PRODUCT_NAMES: Record<string, string> = {
  'credit-klimb': 'Credit Klimb', 'nlds-membership': 'NLDS Deal Access',
  'teachyoung': 'TeachYoung', 'family-os': 'Family Legacy OS',
};

export async function POST(req: NextRequest) {
  const { offerId, productId, token } = await req.json();

  // Validate offer token — the signed payload is the source of truth.
  let offer: any;
  if (token) {
    const result = verifyOffer(token);
    if (!result.valid) return NextResponse.json({ error: result.error }, { status: 404 });
    if (result.data.offer_id !== offerId) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }
    if (result.data.product_id !== productId) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    offer = result.data;
  } else if (offerId) {
    return NextResponse.json({ error: 'offerId requires token' }, { status: 400 });
  } else {
    return NextResponse.json({ error: 'offerId or token required' }, { status: 400 });
  }

  const sessionToken = req.cookies.get('porterful_session')?.value;
  let session: { email: string; lkId: string | null; profileId: string } = { email: '', lkId: null, profileId: '' };
  if (sessionToken) {
    const decoded = decodePorterfulSession(sessionToken);
    if (decoded) {
      session = decoded;
    }
  }

  const price = offer.price_cents;
  const productName = PRODUCT_NAMES[offer.product_id] || offer.product_name || 'Product';

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });

  const Stripe = (await import('stripe')).default;
  const stripe = new Stripe(stripeKey);

  const successUrl = `${req.nextUrl.origin}/offer/${offer.offer_id}/success?token=${token}`;
  const cancelUrl = `${req.nextUrl.origin}/offer/${offer.offer_id}?token=${token}`;

  const stripeSession = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: { name: productName },
        unit_amount: price,
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      offer_id: offer.offer_id,
      lk_id: offer.lk_id,
      username: offer.username,
      user_id: session.profileId || '',
      email: session.email || '',
      product_id: offer.product_id,
      source: 'likeness',
      commission_cents: Math.round(price * 0.03),
      affiliate_link_id: req.cookies.get('porterful_affiliate_ref')?.value || '',
    },
  });

  return NextResponse.json({ url: stripeSession.url, sessionId: stripeSession.id });
}
