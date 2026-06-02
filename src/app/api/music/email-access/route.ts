// API route for email-based access recovery to purchased music
// Generates a recovery token and sends access link via Resend

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { Resend } from 'resend';
import { buildPurchaseEmailHTML, buildPurchaseEmailText } from '@/lib/music-email-template';
import { createHash } from 'crypto';
import {
  createMeasurementSessionId,
  getMeasurementSessionCookieName,
  readMeasurementSessionIdFromCookie,
  resolveMeasurementLocation,
} from '@/lib/measurement';

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, orderId } = body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const supabase = createServerClient();
    const measurementCookie = request.cookies.get(getMeasurementSessionCookieName())?.value || null
    const measurementSessionId = readMeasurementSessionIdFromCookie(measurementCookie) || createMeasurementSessionId()
    const measurementLocation = resolveMeasurementLocation({ headers: request.headers })
    const normalizedEmail = email.toLowerCase()
    const emailHash = createHash('sha256').update(normalizedEmail).digest('hex')
    const emailDomain = normalizedEmail.split('@')[1] || null

    const { error: captureError } = await supabase
      .from('email_captures')
      .upsert({
        session_id: measurementSessionId,
        email_hash: emailHash,
        email_domain: emailDomain,
        city: measurementLocation.city,
        state: measurementLocation.state,
        source: 'email-access',
        captured_at: new Date().toISOString(),
      }, { onConflict: 'session_id,email_hash' })

    if (captureError) {
      console.error('[email-access] Measurement capture error:', captureError)
    }

    // Look up purchases by email
    const { data: purchases, error: purchaseError } = await supabase
      .from('music_purchases')
      .select('*')
      .eq('buyer_email', normalizedEmail);

    if (purchaseError) {
      console.error('[email-access] Query error:', purchaseError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Also check orders table for non-music purchases
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('id, buyer_email, stripe_checkout_session_id')
      .eq('buyer_email', normalizedEmail)
      .eq('status', 'completed');

    if (orderError) {
      console.error('[email-access] Order query error:', orderError);
    }

    // Generate or refresh recovery tokens for purchases
    const accessLinks: Array<{
      trackTitle: string;
      artist: string;
      accessUrl: string;
      expiresAt: string;
    }> = [];

    if (purchases && purchases.length > 0) {
      for (const purchase of purchases) {
        // Generate new recovery token
        const { data: updated, error: updateError } = await supabase
          .from('music_purchases')
          .update({
            recovery_token: crypto.randomUUID(),
            recovery_token_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          })
          .eq('id', purchase.id)
          .select('recovery_token')
          .single();

        if (!updateError && updated) {
          accessLinks.push({
            trackTitle: purchase.track_title,
            artist: purchase.artist_name,
            accessUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/music/recover?token=${updated.recovery_token}`,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          });
        }
      }
    }

    // ── Send access email via Resend (branded template) ──
    let emailDelivered = false;
    const resend = getResend();
    // Use verified domain: likenessverified.com
    // TODO: Switch to support@porterful.com after verifying porterful.com in Resend
    const fromAddress = 'Porterful <noreply@likenessverified.com>';
    if (resend && accessLinks.length > 0) {
      try {
        const html = buildPurchaseEmailHTML({
          buyerEmail: email,
          tracks: accessLinks.map(l => ({
            trackTitle: l.trackTitle,
            artistName: l.artist,
            accessUrl: l.accessUrl,
            expiresAt: l.expiresAt,
          })),
        });

        const text = buildPurchaseEmailText({
          buyerEmail: email,
          tracks: accessLinks.map(l => ({
            trackTitle: l.trackTitle,
            artistName: l.artist,
            accessUrl: l.accessUrl,
            expiresAt: l.expiresAt,
          })),
        });

        const { error: sendError } = await resend.emails.send({
          from: fromAddress,
          to: normalizedEmail,
          subject: accessLinks.length > 1 ? 'Your Porterful Tracks Are Ready' : 'Your Porterful Track Is Ready',
          html,
          text,
        });
        if (sendError) {
          console.error('[email-access] Resend error:', sendError.message);
        } else {
          emailDelivered = true;
          console.log('[email-access] Resend delivered branded email to:', email);
        }
      } catch (e) {
        console.error('[email-access] Resend exception:', e);
      }
    } else if (!resend) {
      console.warn('[email-access] Resend not configured — email not sent');
    }

    const response = NextResponse.json({
      success: emailDelivered,
      message: emailDelivered
        ? 'Access link sent to your email'
        : 'Purchase confirmed. Access link could not be sent — sign in with this email to access your music.',
      emailDelivered,
      // Only include links in development for testing
      ...(process.env.NODE_ENV === 'development' ? { debugLinks: accessLinks } : {}),
    });

    if (!measurementCookie) {
      response.cookies.set(getMeasurementSessionCookieName(), measurementSessionId, {
        httpOnly: false,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
      })
    }

    return response
  } catch (error) {
    console.error('[email-access] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
