import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  return NextResponse.json({
    artist: searchParams.get('artist'),
    count_only: searchParams.get('count_only'),
    all_keys: Array.from(searchParams.keys()),
    raw_url: request.url,
  })
}
