import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Strip all characters not allowed in Supabase Storage paths: [a-zA-Z0-9\-\_\.]
function sanitizeFilename(name: string): string {
  const lastDot = name.lastIndexOf('.')
  const hasExt = lastDot > 0 && lastDot < name.length - 1
  const base = hasExt ? name.slice(0, lastDot) : name
  const ext = hasExt ? name.slice(lastDot + 1) : ''

  const cleanBase = base
    .normalize('NFD')                    // decompose accented chars
    .replace(/[\u0300-\u036f]/g, '')     // strip accent marks
    .replace(/[^a-zA-Z0-9\-_]/g, '-')   // replace anything unsafe with hyphen
    .replace(/-{2,}/g, '-')              // collapse consecutive hyphens
    .replace(/^-+|-+$/g, '')            // trim leading/trailing hyphens
    .substring(0, 80)

  const cleanExt = ext.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  return `${cleanBase || 'file'}${cleanExt ? '.' + cleanExt : '.bin'}`
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll() {},
        },
      }
    )

    const { data: { session }, error } = await supabase.auth.getSession()

    if (error || !session?.user) {
      console.error('Upload auth failed:', error?.message || 'No session')
      return NextResponse.json({ error: 'Unauthorized - please log in' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'audio'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Storage not configured' }, { status: 500 })
    }

    // Sanitize filename to avoid Supabase Storage pattern validation errors
    const safeFilename = sanitizeFilename(file.name)
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${safeFilename}`
    const path = `${folder}/${filename}`

    // Upload to Supabase Storage using service role (bypasses RLS)
    const uploadRes = await fetch(
      `${supabaseUrl}/storage/v1/object/${path}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': folder === 'audio' ? 'audio/mpeg' : (file.type || 'application/octet-stream'),
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

    // Return public URL
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
