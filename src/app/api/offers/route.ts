import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createServerClient as createAdminClient } from '@/lib/supabase';
import { getAuthenticatedClient } from '@/lib/auth-utils';
import { getPorterfulSession } from '@/lib/porterful-session';
import { PRODUCTS } from '@/lib/products';

// Static store products — IDs are string slugs, not DB UUIDs
const STATIC_PRODUCTS: Record<string, { name: string; price_cents: number }> = {
  'credit-klimb':    { name: 'Credit Klimb',      price_cents: 4900 },
  'nlds-membership': { name: 'NLDS Deal Access',   price_cents: 2500 },
  'teachyoung':      { name: 'TeachYoung',          price_cents: 1900 },
  'family-os':       { name: 'Family Legacy OS',   price_cents: 3900 },
};

function getOfferSecret() {
  const secret =
    process.env.OFFER_SECRET ||
    process.env.PORTERFUL_SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!secret) throw new Error('Offer signing secret is required');
  return secret;
}

function signOffer(payload: object): string {
  const data = JSON.stringify(payload);
  const sig = crypto.createHmac('sha256', getOfferSecret()).update(data).digest('base64url');
  const token = Buffer.from(data).toString('base64url');
  return `${token}.${sig}`;
}

async function getSupabaseUser() {
  const porterfulSession = await getPorterfulSession();
  if (porterfulSession) {
    return {
      id: porterfulSession.profileId,
      email: porterfulSession.email,
      lkId: porterfulSession.lkId,
      profileId: porterfulSession.profileId,
      source: 'porterful',
    } as const;
  }

  const auth = await getAuthenticatedClient();
  if (!auth?.user) return null;

  return {
    id: auth.user.id,
    email: auth.user.email || '',
    lkId: null,
    profileId: auth.user.id,
    source: 'supabase',
  } as const;
}

async function getOfferActor() {
  const sessionUser = await getSupabaseUser();
  if (!sessionUser) return null;

  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, lk_id, username, email')
    .eq('id', sessionUser.id)
    .limit(1)
    .maybeSingle();

  const sellerIdentity =
    sessionUser.lkId ||
    profile?.lk_id ||
    profile?.id ||
    sessionUser.profileId ||
    sessionUser.id;

  const sellerUsername =
    profile?.username ||
    sessionUser.email?.split('@')[0] ||
    profile?.email?.split('@')[0] ||
    sessionUser.profileId.slice(0, 8);

  return {
    supabase,
    sellerIdentity,
    sellerUsername,
  };
}

function resolveCatalogProduct(productId: string) {
  const curated = PRODUCTS.find((product) => product.id === productId)
  if (curated) {
    return {
      name: curated.name,
      price_cents: Math.round(curated.price * 100),
    }
  }

  return STATIC_PRODUCTS[productId] || null
}

// POST /api/offers — create a self-contained offer token
export async function POST(req: NextRequest) {
  const actor = await getOfferActor();
  if (!actor) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { productId } = body;
  if (!productId) return NextResponse.json({ error: 'Missing productId' }, { status: 400 });

  // Resolve product from the curated catalog, with legacy static store slugs as fallback.
  const resolvedProduct = resolveCatalogProduct(productId);
  if (!resolvedProduct) {
    return NextResponse.json({ error: 'Unknown product' }, { status: 400 });
  }

  const offerId = `OFR-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  const payload = {
    offer_id: offerId,
    lk_id: actor.sellerIdentity,
    username: actor.sellerUsername,
    product_id: productId,
    product_name: resolvedProduct.name,
    price_cents: resolvedProduct.price_cents,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
  };

  const token = signOffer(payload);
  const offerUrl = `${req.nextUrl.origin}/offer/${offerId}?token=${token}`;

  return NextResponse.json({ offer_id: offerId, offer_url: offerUrl, token });
}

// GET /api/offers — list user's active offers
export async function GET(req: NextRequest) {
  const actor = await getOfferActor();
  if (!actor) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: offers } = await actor.supabase
      .from('offers')
      .select('offer_id, product_id, product_name, price_cents, status, created_at')
      .eq('lk_id', actor.sellerIdentity)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    return NextResponse.json({ offers: offers || [] });
  } catch {
    return NextResponse.json({ offers: [] });
  }
}
