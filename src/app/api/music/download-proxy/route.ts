import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import {
  createMeasurementSessionId,
  getMeasurementSessionCookieName,
  readMeasurementSessionIdFromCookie,
  resolveMeasurementLocation,
} from '@/lib/measurement';

export const dynamic = 'force-dynamic';

/**
 * Download proxy — validates purchase token, downloads file directly from
 * Supabase Storage using service-role key, and streams it back with
 * Content-Disposition: attachment so browsers treat it as a download.
 *
 * Why not signed URL? createSignedUrl returns a relative path that
 * requires /storage/v1 prefix, and fetching it server-side gave 400s.
 * Using .download() with the service role key is more reliable.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'No recovery token provided.' }, { status: 400 });
    }

    const supabase = createServerClient();
    const measurementCookie = request.cookies.get(getMeasurementSessionCookieName())?.value || null
    const measurementSessionId = readMeasurementSessionIdFromCookie(measurementCookie) || createMeasurementSessionId()

    // Validate the recovery token
    const { data: purchase, error: purchaseError } = await supabase
      .from('music_purchases')
      .select('id, track_id, track_title, artist_name, storage_path, storage_bucket, recovery_token_expires_at, download_count, buyer_user_id, measurement_city, measurement_state')
      .eq('recovery_token', token)
      .maybeSingle();

    if (purchaseError) {
      console.error('[download-proxy] Database error:', purchaseError);
      return NextResponse.json({ error: 'Database error.' }, { status: 500 });
    }

    if (!purchase) {
      return NextResponse.json({ error: 'Invalid recovery token. Please request a new access link.' }, { status: 404 });
    }

    // Check if token has expired
    if (purchase.recovery_token_expires_at && new Date(purchase.recovery_token_expires_at) < new Date()) {
      return NextResponse.json({ error: 'Recovery link has expired. Please request a new access link.' }, { status: 410 });
    }

    const measurementLocation = resolveMeasurementLocation({
      headers: request.headers,
      city: purchase.measurement_city || null,
      state: purchase.measurement_state || null,
    })

    let artistId: string | null = null
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(purchase.track_id || '')) {
      const { data: trackRecord } = await supabase
        .from('tracks')
        .select('artist_id')
        .eq('id', purchase.track_id)
        .maybeSingle()

      artistId = trackRecord?.artist_id || null
    }

    // Download file directly via Supabase client (service role)
    // Use the bucket from the purchase record (defaults to 'music' for new records)
    const bucket = purchase.storage_bucket || 'music';
    const relativePath = purchase.storage_path; // Use path as-is
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from(bucket)
      .download(relativePath);

    if (downloadError || !fileData) {
      console.error('[download-proxy] Download error:', downloadError, { bucket, relativePath });
      return NextResponse.json({ 
        error: 'Failed to download file. The track may have been moved or removed. Please contact support.',
        debug: process.env.NODE_ENV === 'development' ? { bucket, relativePath, error: downloadError?.message } : undefined
      }, { status: 500 });
    }

    const fileBuffer = await fileData.arrayBuffer();

    const { error: downloadInsertError } = await supabase
      .from('downloads')
      .insert({
        session_id: measurementSessionId,
        user_id: purchase.buyer_user_id || null,
        purchase_id: purchase.id,
        track_id: purchase.track_id,
        artist_id: artistId,
        track_title: purchase.track_title || 'track',
        artist_name: purchase.artist_name || 'artist',
        city: measurementLocation.city,
        state: measurementLocation.state,
        source: 'download-proxy',
        downloaded_at: new Date().toISOString(),
      })

    if (downloadInsertError) {
      console.error('[download-proxy] Measurement insert error:', downloadInsertError)
    }

    const { error: purchaseUpdateError } = await supabase
      .from('music_purchases')
      .update({
        download_count: (purchase.download_count || 0) + 1,
        last_downloaded_at: new Date().toISOString(),
      })
      .eq('id', purchase.id)

    if (purchaseUpdateError) {
      console.error('[download-proxy] Purchase download count update error:', purchaseUpdateError)
    }

    // Build a clean filename
    const cleanTitle = (purchase.track_title || 'track').replace(/[^a-zA-Z0-9\s_-]/g, '').trim();
    const cleanArtist = (purchase.artist_name || 'artist').replace(/[^a-zA-Z0-9\s_-]/g, '').trim();
    const filename = `${cleanArtist} - ${cleanTitle}.mp3`;

    // Stream back with forced download headers
    const response = new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        'Content-Length': String(fileBuffer.byteLength),
        'Cache-Control': 'private, no-store, max-age=0',
      },
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

    return response;
  } catch (err) {
    console.error('[download-proxy] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
