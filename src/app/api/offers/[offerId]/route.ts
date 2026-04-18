import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ offerId: string }> }
) {
  const { offerId } = await params;
  const token = new URL(req.url).searchParams.get('token');

  if (!offerId) return NextResponse.json({ error: 'Missing offerId' }, { status: 400 });

  if (token) {
    // Token-based: verify the self-contained token
    const result = verifyOffer(token);
    if (!result.valid) return NextResponse.json({ error: result.error }, { status: 404 });
    if (result.data.offer_id !== offerId) {
      return NextResponse.json({ error: 'Offer not found or token expired' }, { status: 404 });
    }

    return NextResponse.json({
      offer_id: result.data.offer_id,
      product_id: result.data.product_id,
      product_name: result.data.product_name,
      price_cents: Math.round(Number(result.data.price_cents || 0)),
      username: result.data.username,
      lk_id: result.data.lk_id,
      status: 'active',
    });
  }

  // No token: try DB-based (legacy, won't exist)
  return NextResponse.json({ error: 'Offer not found or token expired' }, { status: 404 });
}
