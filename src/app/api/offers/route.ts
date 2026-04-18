import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createServerClient as createAdminClient } from '@/lib/supabase';
import { getAuthenticatedClient } from '@/lib/auth-utils';

// Static store products — IDs are string slugs, not DB UUIDs
const STATIC_PRODUCTS: Record<string, { name: string; price_cents: number }> = {
  'credit-klimb':    { name: 'Credit Klimb',      price_cents: 4900 },
  'nlds-membership': { name: 'NLDS Deal Access',   price_cents: 2500 },
  'teachyoung':      { name: 'TeachYoung',          price_cents: 1900 },
  'family-os':       { name: 'Family Legacy OS',   price_cents: 3900 },
};

function getOfferSecret() {
  const secret = process.env.OFFER_SECRET;
  if (!secret) throw new Error('OFFER_SECRET is required');
  return secret;
}

function signOffer(payload: object): string {
  const data = JSON.stringify(payload);
  const sig = crypto.createHmac('sha256', getOfferSecret()).update(data).digest('base64url');
  const token = Buffer.from(data).toString('base64url');
  return `${token}.${sig}`;
}

async function getSupabaseUser() {
  const auth = await getAuthenticatedClient();
  return auth?.user ?? null;
}

// POST /api/offers — create a self-contained offer token
export async function POST(req: NextRequest) {
  const user = await getSupabaseUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { productId } = body;
  if (!productId) return NextResponse.json({ error: 'Missing productId' }, { status: 400 });

  // Resolve product — check static products first, then DB
  let productName = '';
  let priceCents = 0;

  const staticProduct = STATIC_PRODUCTS[productId];
  if (staticProduct) {
    productName = staticProduct.name;
    priceCents = staticProduct.price_cents;
  } else {
    const supabase = createAdminClient();
    const { data: product } = await supabase
      .from('products')
      .select('id, title, base_price')
      .eq('id', productId)
      .limit(1)
      .single();
    if (!product) return NextResponse.json({ error: 'Unknown product' }, { status: 400 });
    productName = product.title;
    priceCents = Math.round(Number(product.base_price) * 100);
  }

  const offerId = `OFR-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const username = user.email?.split('@')[0] || user.id.slice(0, 8);

  const payload = {
    offer_id: offerId,
    user_id: user.id,
    username,
    product_id: productId,
    product_name: productName,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
  };

  // Try to persist offer record — non-fatal if DB insert fails
  try {
    const supabase = createAdminClient();
    await supabase.from('offers').insert({
      offer_id: offerId,
      user_id: user.id,
      username,
      product_id: productId,
      product_name: productName,
      price_cents: priceCents,
      status: 'active',
    });
  } catch {
    // Proceed even if offers table doesn't exist or has schema issues
  }

  const token = signOffer(payload);
  const offerUrl = `${req.nextUrl.origin}/offer/${offerId}?token=${token}`;

  return NextResponse.json({ offer_id: offerId, offer_url: offerUrl, token });
}

// GET /api/offers — list user's active offers
export async function GET(req: NextRequest) {
  const user = await getSupabaseUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const { data: offers } = await supabase
      .from('offers')
      .select('offer_id, product_id, product_name, price_cents, status, created_at')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    return NextResponse.json({ offers: offers || [] });
  } catch {
    return NextResponse.json({ offers: [] });
  }
}
