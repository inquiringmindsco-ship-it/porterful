import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { email } = await request.json()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  // Direct REST call to avoid Supabase JS client header issue
  const response = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${serviceKey}`,
      'apikey': serviceKey,
    },
  })

  const data = await response.text()
  let parsed: any = {}
  try { parsed = JSON.parse(data) } catch {}

  const user = parsed.users?.find((u: any) => u.email === email)

  return NextResponse.json({
    found: !!user,
    userId: user?.id || null,
    allUserCount: parsed.users?.length || 0,
    allEmails: parsed.users?.map((u: any) => u.email) || [],
    status: response.status,
  })
}