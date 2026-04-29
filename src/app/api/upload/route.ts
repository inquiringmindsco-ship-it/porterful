import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/m4a', 'audio/wav', 'audio/aac', 'audio/ogg'];
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_AUDIO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;  // 5MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!folder || !['audio', 'artist-images'].includes(folder)) {
      return NextResponse.json({ error: 'Invalid folder. Use "audio" or "artist-images"' }, { status: 400 });
    }

    // Validate file type and size
    if (folder === 'audio') {
      if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
        return NextResponse.json({ error: 'Invalid audio format. Use MP3, M4A, WAV, AAC, or OGG' }, { status: 400 });
      }
      if (file.size > MAX_AUDIO_SIZE) {
        return NextResponse.json({ error: 'Audio file too large. Max 50MB' }, { status: 400 });
      }
    } else {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return NextResponse.json({ error: 'Invalid image format. Use JPEG, PNG, WebP, or GIF' }, { status: 400 });
      }
      if (file.size > MAX_IMAGE_SIZE) {
        return NextResponse.json({ error: 'Image too large. Max 5MB' }, { status: 400 });
      }
    }

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'mp3';
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/ /g, '_');
    const filename = `${timestamp}-${random}-${safeName}`;
    const path = `${folder}/${filename}`;

    // Upload using service role key (bypasses RLS)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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
      return NextResponse.json({ error: 'Upload failed: ' + uploadError.message }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('music')
      .getPublicUrl(path);

    return NextResponse.json({ url: urlData.publicUrl, path });
  } catch (err: any) {
    console.error('[upload] Exception:', err);
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}
