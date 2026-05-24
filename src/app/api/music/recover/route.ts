import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'No recovery token provided.' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Look up the purchase by recovery token
    const { data: purchase, error } = await supabase
      .from('music_purchases')
      .select('id, track_title, artist_name, storage_path, storage_bucket, recovery_token_expires_at')
      .eq('recovery_token', token)
      .maybeSingle()

    if (error) {
      console.error('[music-recover] Database error:', error)
      return NextResponse.json({ error: 'Database error. Please try again later.' }, { status: 500 })
    }

    if (!purchase) {
      return NextResponse.json({ error: 'Invalid recovery token. Please request a new access link from your purchase confirmation email.' }, { status: 404 })
    }

    // Check if token has expired
    if (purchase.recovery_token_expires_at && new Date(purchase.recovery_token_expires_at) < new Date()) {
      return NextResponse.json({ error: 'Recovery link has expired. Please request a new access link.' }, { status: 410 })
    }

    // Generate signed download URL
    // Use the bucket from the purchase record (defaults to 'music' for new records, 'audio' for legacy)
    const bucket = purchase.storage_bucket || 'music';
    const rawPath = purchase.storage_path
    const relativePath = rawPath.replace(/^audio\//, '')
    const { data: signedUrlData, error: signedError } = await supabase
      .storage
      .from(bucket)
      .createSignedUrl(relativePath, 300) // 5 minutes

    if (signedError || !signedUrlData?.signedUrl) {
      console.error('[music-recover] Signed URL error:', signedError, { bucket, relativePath })
      return NextResponse.json({ 
        error: 'Failed to generate download link. The track file may have been moved or removed. Please contact support.',
        debug: process.env.NODE_ENV === 'development' ? { bucket, relativePath, error: signedError?.message } : undefined
      }, { status: 500 })
    }

    return NextResponse.json({
      trackTitle: purchase.track_title,
      artist: purchase.artist_name,
      downloadUrl: signedUrlData.signedUrl,
      expiresIn: 300,
    })
  } catch (err) {
    console.error('[music-recover] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
