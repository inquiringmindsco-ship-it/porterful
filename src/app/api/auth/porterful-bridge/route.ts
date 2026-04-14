import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { createHash } from 'crypto';

/**
 * Porterful ↔ Likeness™ Bridge
 * 
 * Handles cross-product unified auth flow:
 * 1. GET: Magic link return URL — LikenessVerified redirects here with signed token
 * 2. POST: Client-side bridge — when likeness_session cookie exists on Porterful
 * 
 * Token-based approach avoids cross-origin cookie forwarding issues.
 * LikenessVerified signs a short-lived token; Porterful verifies HMAC locally.
 */

const LIKENESS_BASE = 'https://likenessverified.com';
const TOKEN_TTL_MS = 10 * 60 * 1000; // 10 minutes

// ─── Token helpers ────────────────────────────────────────────────────────────
function createBridgeToken(email: string, lkId: string, secret: string): string {
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const payload = `${email.toLowerCase()}|${lkId}|${expiresAt}`;
  const sig = createHash('sha256').update(payload + secret).digest('base64url');
  return Buffer.from(`${payload}|${sig}`).toString('base64url');
}

function verifyBridgeToken(token: string, secret: string): { email: string; lkId: string } | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const parts = decoded.split('|');
    if (parts.length !== 4) return null;
    const [email, lkId, expiresAtStr, sig] = parts;

    const expiresAt = parseInt(expiresAtStr, 10);
    if (Date.now() > expiresAt) return null; // expired

    // Verify HMAC
    const payload = `${email}|${lkId}|${expiresAtStr}`;
    const expectedSig = createHash('sha256').update(payload + secret).digest('base64url');
    if (sig !== expectedSig) return null; // tampered

    return { email, lkId };
  } catch {
    return null;
  }
}

// ─── GET: Magic link return handler ─────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const bridgeToken = searchParams.get('token');
  const error = searchParams.get('error');

  // Handle error from LikenessVerified
  if (error) {
    return NextResponse.redirect(new URL('/login/login?error=likeness_denied', req.nextUrl.origin));
  }

  // If we have a bridge token, verify it locally (no cross-origin fetch needed)
  if (bridgeToken) {
    const secret = process.env.MAGIC_LINK_SECRET || process.env.LIKENESS_AUTH_SECRET;
    if (secret) {
      const identity = verifyBridgeToken(bridgeToken, secret);
      if (identity) {
        return completeBridge(req, identity.email, identity.lkId, null);
      }
    }
  }

  // No token or invalid — try via LikenessVerified session cookie
  return bridgeToPorterful(req);
}

// ─── POST: Client-initiated bridge ───────────────────────────────────────────
export async function POST(req: Request) {
  return bridgeToPorterful(req as NextRequest);
}

// ─── Core bridging logic ──────────────────────────────────────────────────────
async function bridgeToPorterful(req: NextRequest) {
  try {
    const likenSession = req.cookies.get('likeness_session')?.value;
    if (!likenSession) {
      // No likeness_session — redirect to LikenessVerified login
      const returnUrl = encodeURIComponent(`${req.nextUrl.origin}/api/auth/porterful-bridge`);
      return NextResponse.redirect(`${LIKENESS_BASE}/login?return=${returnUrl}`);
    }

    // Validate likeness_session via LikenessVerified internal endpoint
    // Note: credentials:include sends HttpOnly cookie to same-origin
    const likenRes = await fetch(`${LIKENESS_BASE}/api/auth/internal/validate-session`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'cookie': `likeness_session=${likenSession}`,
      },
    });

    if (!likenRes.ok) {
      const returnUrl = encodeURIComponent(`${req.nextUrl.origin}/api/auth/porterful-bridge`);
      return NextResponse.redirect(`${LIKENESS_BASE}/login?return=${returnUrl}`);
    }

    const likenData = await likenRes.json();
    if (!likenData.valid) {
      const returnUrl = encodeURIComponent(`${req.nextUrl.origin}/api/auth/porterful-bridge`);
      return NextResponse.redirect(`${LIKENESS_BASE}/login?return=${returnUrl}`);
    }

    return completeBridge(req, likenData.email, likenData.lkId, likenData.referralCode || null);
  } catch (e: any) {
    console.error('[porterful-bridge] Error:', e);
    return NextResponse.redirect(new URL('/login/login?error=bridge_failed', req.nextUrl.origin));
  }
}

// ─── Complete the bridge: upsert profile + set porterful_session ─────────────
async function completeBridge(
  req: NextRequest,
  email: string,
  lkId: string,
  referralCode: string | null
) {
  try {
    const supabase = createServiceClient();
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, name, role')
      .eq('email', email.toLowerCase())
      .limit(1)
      .single();

    let profileId: string;

    if (existingProfile) {
      profileId = existingProfile.id;
      if (lkId) {
        await supabase.from('profiles').update({ lk_id: lkId }).eq('id', profileId);
      }
    } else {
      const { data: newProfile, error: createErr } = await supabase
        .from('profiles')
        .insert({
          email: email.toLowerCase(),
          name: email.split('@')[0],
          role: 'supporter',
          ...(lkId ? { lk_id: lkId } : {}),
        })
        .select('id')
        .limit(1)
        .single();

      if (createErr || !newProfile) {
        console.error('[porterful-bridge] Profile creation failed:', createErr);
        return NextResponse.redirect(new URL('/login/login?error=profile_create_failed', req.nextUrl.origin));
      }
      profileId = newProfile.id;
    }

    // Credit referrer if referralCode present
    if (referralCode && lkId) {
      const { data: referrerProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('lk_id', referralCode)
        .limit(1)
        .maybeSingle();

      if (referrerProfile && referrerProfile.id !== profileId) {
        await supabase.from('referrals').upsert({
          referrer_id: referrerProfile.id,
          referred_id: profileId,
          referral_code: referralCode,
        }, { onConflict: 'referrer_id,referred_id' });
      }
    }

    // Create Porterful session token
    const sessionToken = Buffer.from(JSON.stringify({
      email: email.toLowerCase(),
      profileId,
      lkId: lkId || null,
      iat: Date.now(),
    })).toString('base64url');

    const response = NextResponse.redirect(new URL('/dashboard', req.nextUrl.origin));
    response.cookies.set('porterful_session', sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    return response;
  } catch (e: any) {
    console.error('[porterful-bridge] completeBridge error:', e);
    return NextResponse.redirect(new URL('/login/login?error=bridge_failed', req.nextUrl.origin));
  }
}
