import { NextResponse } from 'next/server'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  try {
    const url = new URL(`${supabaseUrl}/auth/v1/admin/users`)
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey,
        'Content-Type': 'application/json',
      },
    })

    const status = response.status
    const text = await response.text()
    
    return NextResponse.json({
      fetchStatus: status,
      responseLength: text.length,
      canParse: !!JSON.parse(text).users,
      userCount: JSON.parse(text).users?.length || 0,
      error: null,
    })
  } catch (err: any) {
    return NextResponse.json({
      error: err.message,
      stack: err.stack?.substring(0, 300),
    }, { status: 500 })
  }
}