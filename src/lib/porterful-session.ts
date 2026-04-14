import { cookies } from 'next/headers';

/**
 * Porterful Session — decoded from porterful_session cookie
 * Set by /api/auth/porterful-bridge after Likeness™ validation.
 */

export interface PorterfulSession {
  email: string;
  profileId: string;
  lkId: string;
  iat: number;
}

export async function getPorterfulSession(): Promise<PorterfulSession | null> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get('porterful_session');
    if (!cookie?.value) return null;

    const decoded = JSON.parse(Buffer.from(cookie.value, 'base64url').toString('utf8'));

    // Validate expiry (30 days)
    if (Date.now() - decoded.iat > 30 * 24 * 60 * 60 * 1000) {
      return null;
    }

    return decoded as PorterfulSession;
  } catch {
    return null;
  }
}

export async function requirePorterfulSession(): Promise<PorterfulSession> {
  const session = await getPorterfulSession();
  if (!session) {
    throw new Error('NOT_AUTHENTICATED');
  }
  return session;
}
