import { NextRequest, NextResponse } from 'next/server'

function sanitizeFilename(name: string): string {
  const ext = name.split('.').pop() || ''
  const nameWithoutExt = name.slice(0, -(ext.length + 1))
  const sanitized = nameWithoutExt
    .replace(/[<>:"/\\|?*()[\]]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/\.\.+/g, '.')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100)
  const cleanExt = ext.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  return `${sanitized || 'audio'}.${cleanExt || 'mp3'}`
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
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${safeFilename}`
    const path = `${folder}/${filename}`

    const uploadRes = await fetch(
      `${supabaseUrl}/storage/v1/object/${path}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': file.type || 'audio/mpeg',
          'x-upsert': 'true'
        },
        body: await file.arrayBuffer()
      }
    )

    if (!uploadRes.ok) {
      const error = await uploadRes.text()
      console.error('Upload failed:', error)
      return NextResponse.json({ error: 'Upload failed', details: error }, { status: 500 })
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${path}`

    return NextResponse.json({ 
      url: publicUrl,
      path,
      filename: file.name,
      originalName: file.name,
      safeName: safeFilename,
      size: file.size
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
