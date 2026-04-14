import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const sessionToken = req.cookies.get('porterful_session')?.value;

  if (!sessionToken) {
    return NextResponse.json({ authenticated: false });
  }

  try {
    const data = JSON.parse(Buffer.from(sessionToken, 'base64url').toString('utf8'));
    return NextResponse.json({
      authenticated: true,
      email: data.email || null,
      lkId: data.lkId || null,
      profileId: data.profileId || null,
    });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
