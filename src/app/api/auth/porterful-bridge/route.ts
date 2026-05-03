import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { ensureProfile } from '@/lib/server/ensure-profile'
import { createHash } from 'crypto';

/**
 * Porterful ↔ Likeness™ Bridge
 *
 * Validates a Likeness™ identity, upserts a Porterful profile, then creates
 * a Supabase Auth session via admin generateLink so that the middleware and
 * client auth provider both see a valid session after the redirect.
 *
 * Flow:
 *   GET  ?token=<bridge_token>  — LikenessVerified sends a signed token here
 *   POST                        — client-side bridge (when likeness_session exists)
 *   → admin.generateLink → Supabase verifies → /auth/callback → /dashboard
 */

const LIKENESS_BASE = 'https://likenessverified.com';
const TOKEN_TTL_MS = 10 * 60 * 1000;

function verifyBridgeToken(token: string, secret: string): { email: string; lkId: string } | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const parts = decoded.split('|');
    if (parts.length !== 4) return null;
    const [email, lkId, expiresAtStr, sig] = parts;
    if (Date.now() > parseInt(expiresAtStr, 10)) return null;
    const payload = `${email}|${lkId}|${expiresAtStr}`;
    const expected = createHash('sha256').update(payload + secret).digest('base64url');
    if (sig !== expected) return null;
    return { email, lkId };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const bridgeToken = searchParams.get('token');
  const error = searchParams.get('error');
  const origin = req.nextUrl.origin;

  if (error) {
    return NextResponse.redirect(new URL('/login?error=likeness_denied', origin));
  }

  if (bridgeToken) {
    const secret = process.env.MAGIC_LINK_SECRET || process.env.LIKENESS_AUTH_SECRET;
    if (secret) {
      const identity = verifyBridgeToken(bridgeToken, secret);
      if (identity) {
        return completeBridge(req, identity.email, identity.lkId, null);
      }
    }
  }

  return bridgeToPorterful(req);
}

export async function POST(req: Request) {
  return bridgeToPorterful(req as NextRequest);
}

async function bridgeToPorterful(req: NextRequest) {
  try {
    const likenSession = req.cookies.get('likeness_session')?.value;
    if (!likenSession) {
      const returnUrl = encodeURIComponent(`${req.nextUrl.origin}/api/auth/porterful-bridge`);
      return NextResponse.redirect(`${LIKENESS_BASE}/login?return=${returnUrl}`);
    }

    const likenRes = await fetch(`${LIKENESS_BASE}/api/auth/internal/validate-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: `likeness_session=${likenSession}`,
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
    return NextResponse.redirect(new URL('/login?error=bridge_failed', req.nextUrl.origin));
  }
}

async function completeBridge(
  req: NextRequest,
  email: string,
  lkId: string,
  referralCode: string | null
) {
  const origin = req.nextUrl.origin;
  try {
    const adminSupabase = createServerClient();
    if (!adminSupabase) {
      return NextResponse.redirect(new URL('/login?error=server_error', origin));
    }

    // Generate a Supabase magic link. This creates the auth user if one doesn't
    // exist for this email, and returns the action_link that completes auth when
    // visited. Using this instead of setting porterful_session directly means the
    // middleware and client provider both see a canonical Supabase session.
    const { data: linkData, error: linkError } = await adminSupabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo: `${origin}/auth/callback` },
    });

    if (linkError || !linkData?.properties?.action_link) {
      console.error('[porterful-bridge] generateLink failed:', linkError);
      return NextResponse.redirect(new URL('/login?error=bridge_failed', origin));
    }

    const authUserId = linkData.user.id;

    const { profile, error: profileError } = await ensureProfile(adminSupabase, linkData.user);
    if (profileError || !profile) {
      console.warn('[porterful-bridge] Failed to ensure profile:', profileError);
      return NextResponse.redirect(new URL('/login?error=bridge_failed', origin));
    }

    if (lkId) {
      await adminSupabase.from('profiles').update({ lk_id: lkId }).eq('id', authUserId);
    }

    // Credit referrer
    if (referralCode && lkId) {
      const { data: referrerProfile } = await adminSupabase
        .from('profiles')
        .select('id')
        .eq('lk_id', referralCode)
        .limit(1)
        .maybeSingle();

      if (referrerProfile && referrerProfile.id !== authUserId) {
        await adminSupabase.from('referrals').upsert(
          { referrer_id: referrerProfile.id, referred_id: authUserId, referral_code: referralCode },
          { onConflict: 'referrer_id,referred_id' }
        );
      }
    }

    // Redirect through Supabase's auth server — it verifies the token and sends
    // the user back to /auth/callback, which sets the session cookies.
    return NextResponse.redirect(linkData.properties.action_link);
  } catch (e: any) {
    console.error('[porterful-bridge] completeBridge error:', e);
    return NextResponse.redirect(new URL('/login?error=bridge_failed', origin));
  }
}
