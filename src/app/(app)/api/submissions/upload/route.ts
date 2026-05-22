import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function sanitizeFilename(name: string): string {
  const lastDot = name.lastIndexOf('.')
  const hasExt = lastDot > 0 && lastDot < name.length - 1
  const base = hasExt ? name.slice(0, lastDot) : name
  const ext = hasExt ? name.slice(lastDot + 1) : ''
  const cleanBase = base
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\-_]/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80)
  const cleanExt = ext.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  return `${cleanBase || 'audio'}${cleanExt ? '.' + cleanExt : '.mp3'}`
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'submissions/pending'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const isAudio = file.type.includes('audio') || file.name.endsWith('.mp3')
    if (!isAudio) {
      return NextResponse.json({ error: 'Only MP3 files are allowed' }, { status: 400 })
    }

    // Validate size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum 50MB.' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Storage not configured' }, { status: 500 })
    }

    const safeFilename = sanitizeFilename(file.name)
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${safeFilename}`
    const path = `${folder}/${filename}`

    // Upload using Supabase JS client (fixes "string did not match expected pattern")
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    })

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabaseAdmin.storage
      .from('music')
      .upload(path, buffer, {
        contentType: file.type || 'audio/mpeg',
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload failed:', uploadError.message)
      if (uploadError.message.includes('row-level security') || uploadError.message.includes('policy')) {
        return NextResponse.json(
          { error: 'Storage permission issue. Please contact support.' },
          { status: 403 }
        )
      }
      if (uploadError.message.includes('not found') || uploadError.message.includes('bucket')) {
        return NextResponse.json(
          { error: 'Upload temporarily failed. Storage bucket not found.' },
          { status: 500 }
        )
      }
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('music')
      .getPublicUrl(path)

    return NextResponse.json({
      url: urlData.publicUrl,
      path,
      filename: file.name,
      originalName: file.name,
      safeName: safeFilename,
      size: file.size,
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Upload failed. Please try again.' },
      { status: 500 }
    )
  }
}
