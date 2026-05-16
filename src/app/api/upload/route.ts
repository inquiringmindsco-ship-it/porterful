import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/auth-utils';
import { createClient } from '@supabase/supabase-js';

const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg', 'audio/mp3', 'audio/m4a', 'audio/wav', 'audio/aac', 'audio/ogg', 'audio/flac', 'audio/x-flac'
];
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_AUDIO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;  // 5MB

function sanitizeFilename(name: string): string {
  const lastDot = name.lastIndexOf('.');
  const hasExt = lastDot > 0 && lastDot < name.length - 1;
  const base = hasExt ? name.slice(0, lastDot) : name;
  const ext = hasExt ? name.slice(lastDot + 1) : '';

  const cleanBase = base
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\-_]/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);

  const cleanExt = ext.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  return `${cleanBase || 'file'}${cleanExt ? '.' + cleanExt : '.bin'}`;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Auth check
    const auth = await getAuthenticatedClient();
    if (!auth?.user) {
      console.error('[upload] Auth failed: no valid session');
      return NextResponse.json(
        { error: 'Your session expired. Please log in again and retry.' },
        { status: 401 }
      );
    }

    // 2. Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!folder || !['audio', 'artist-images'].includes(folder)) {
      return NextResponse.json(
        { error: 'Invalid folder. Use "audio" or "artist-images"' },
        { status: 400 }
      );
    }

    // 3. Validate file type and size
    if (folder === 'audio') {
      if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `File type "${file.type || 'unknown'}" not supported. Use MP3, M4A, WAV, AAC, FLAC, or OGG.` },
          { status: 400 }
        );
      }
      if (file.size > MAX_AUDIO_SIZE) {
        return NextResponse.json(
          { error: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is 50MB.` },
          { status: 400 }
        );
      }
    } else {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `File type "${file.type || 'unknown'}" not supported. Use JPEG, PNG, WebP, or GIF.` },
          { status: 400 }
        );
      }
      if (file.size > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          { error: `Image too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is 5MB.` },
          { status: 400 }
        );
      }
    }

    // 4. Verify Supabase env
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      console.error('[upload] Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL');
      return NextResponse.json(
        { error: 'Upload temporarily failed. Our storage provider is not configured.' },
        { status: 500 }
      );
    }

    // 5. Generate safe filename
    const safeFilename = sanitizeFilename(file.name);
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${safeFilename}`;
    const path = `${folder}/${filename}`;

    // 6. Upload using Supabase JS client
    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from('music')
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('[upload] Storage upload failed:', uploadError.message);
      if (uploadError.message.includes('row-level security') || uploadError.message.includes('policy')) {
        return NextResponse.json(
          { error: 'Storage permission issue. Please contact support.' },
          { status: 403 }
        );
      }
      if (uploadError.message.includes('not found') || uploadError.message.includes('bucket')) {
        return NextResponse.json(
          { error: 'Upload temporarily failed. Storage bucket not found.' },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // 7. Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('music')
      .getPublicUrl(path);

    return NextResponse.json({
      url: urlData.publicUrl,
      path,
      filename: file.name,
      safeName: safeFilename,
      size: file.size,
    });

  } catch (err: any) {
    console.error('[upload] Unexpected exception:', err);
    return NextResponse.json(
      { error: err.message || 'Upload temporarily failed. Please try again.' },
      { status: 500 }
    );
  }
}
