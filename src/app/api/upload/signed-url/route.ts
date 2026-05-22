import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
    const body = await request.json();
    const { filename, folder, contentType } = body;

    if (!filename || !folder) {
      return NextResponse.json(
        { error: 'filename and folder are required' },
        { status: 400 }
      );
    }

    // Validate folder
    const allowedFolders = ['audio', 'artist-images', 'submissions/pending'];
    if (!allowedFolders.includes(folder)) {
      return NextResponse.json(
        { error: `Invalid folder. Use one of: ${allowedFolders.join(', ')}` },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: 'Storage not configured' },
        { status: 500 }
      );
    }

    const safeFilename = sanitizeFilename(filename);
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${safeFilename}`;
    const path = `${folder}/${uniqueName}`;
    const bucket = 'music';

    // Create signed upload URL (valid for 60 seconds)
    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const { data: signedData, error: signedError } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUploadUrl(path);

    if (signedError || !signedData) {
      console.error('[signed-url] Failed:', signedError?.message);
      return NextResponse.json(
        { error: `Failed to create upload URL: ${signedError?.message || 'unknown'}` },
        { status: 500 }
      );
    }

    const { token, path: signedPath } = signedData;

    // Also get the public URL that will be available after upload
    const { data: publicUrlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(path);

    return NextResponse.json({
      token,
      path: signedPath,
      publicUrl: publicUrlData.publicUrl,
      bucket,
      filename: safeFilename,
      originalName: filename,
    });

  } catch (err: any) {
    console.error('[signed-url] Exception:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to create upload URL' },
      { status: 500 }
    );
  }
}
