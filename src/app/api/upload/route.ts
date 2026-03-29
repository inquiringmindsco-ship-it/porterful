import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
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

    // Generate unique filename
    const ext = file.name.split('.').pop()
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${ext}`
    const path = `${folder}/${filename}`

    // Upload to Supabase Storage using service role (bypasses RLS)
    const uploadRes = await fetch(
      `${supabaseUrl}/storage/v1/object/${path}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': file.type,
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
      size: file.size
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
