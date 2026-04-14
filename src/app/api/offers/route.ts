import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const OFFER_SECRET = process.env.OFFER_SECRET || process.env.INTERNAL_API_KEY || 'likeness_offer_secret_2026';
const PRODUCT_CATALOG: Record<string, { name: string; price: number }> = {
  'credit-klimb': { name: 'Credit Klimb', price: 4900 },
  'nlds-membership': { name: 'NLDS Deal Access', price: 2500 },
  'teachyoung': { name: 'TeachYoung', price: 1900 },
  'family-os': { name: 'Family Legacy OS', price: 3900 },
};

// Sign an offer token — self-contained, no DB needed
function signOffer(payload: object): string {
  const data = JSON.stringify(payload);
  const sig = crypto.createHmac('sha256', OFFER_SECRET).update(data).digest('base64url');
  const token = Buffer.from(data).toString('base64url');
  return `${token}.${sig}`;
}

// Verify and decode an offer token
function verifyOffer(token: string): { valid: true; data: any } | { valid: false; error: string } {
  try {
    const [tokenPart, sigPart] = token.split('.');
    if (!tokenPart || !sigPart) return { valid: false, error: 'Malformed token' };
    const data = JSON.parse(Buffer.from(tokenPart, 'base64url').toString('utf8'));
    const expectedSig = crypto.createHmac('sha256', OFFER_SECRET).update(JSON.stringify(data)).digest('base64url');
    if (sigPart !== expectedSig) return { valid: false, error: 'Invalid signature' };
    return { valid: true, data };
  } catch {
    return { valid: false, error: 'Invalid token' };
  }
}

// POST /api/offers — create a self-contained offer token
export async function POST(req: NextRequest) {
  const sessionToken = req.cookies.get('porterful_session')?.value;
  if (!sessionToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let session: { email: string; lkId: string | null; profileId: string };
  try {
    session = JSON.parse(Buffer.from(sessionToken, 'base64url').toString('utf8'));
  } catch {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  if (!session.lkId) return NextResponse.json({ error: 'Likeness™ identity required' }, { status: 403 });

  const { productId, price } = await req.json();
  const product = PRODUCT_CATALOG[productId];
  if (!product) return NextResponse.json({ error: 'Unknown product' }, { status: 400 });

  const priceOverride = typeof price === 'number' ? Math.round(price * 100) : product.price;
  if (priceOverride < product.price * 0.5 || priceOverride > product.price * 1.5) {
    return NextResponse.json({ error: 'Price outside reasonable range' }, { status: 400 });
  }

  // Generate offer_id and self-contained token
  const offerId = `OFR-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const payload = {
    offer_id: offerId,
    lk_id: session.lkId,
    username: session.email.split('@')[0],
    product_id: productId,
    product_name: product.name,
    price_cents: priceOverride,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 days
  };

  const token = signOffer(payload);
  const offerUrl = `${req.nextUrl.origin}/offer/${offerId}?token=${token}`;

  return NextResponse.json({ offer_id: offerId, offer_url: offerUrl, token });
}

// GET /api/offers — list user's active offers (from orders table pending records)
export async function GET(req: NextRequest) {
  const sessionToken = req.cookies.get('porterful_session')?.value;
  if (!sessionToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let session: { email: string; lkId: string | null };
  try {
    session = JSON.parse(Buffer.from(sessionToken, 'base64url').toString('utf8'));
  } catch {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  if (!session.lkId) return NextResponse.json({ error: 'No Likeness™ identity' }, { status: 403 });

  return NextResponse.json({ offers: [], message: 'Token-based offers — links are self-contained' });
}
