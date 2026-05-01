import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

// Artist invite flow for claiming existing artist pages
// This is a manual/admin process — not a self-service endpoint

const RESEND_API_KEY = process.env.RESEND_API_KEY

// Artist invite template
function getInviteEmailTemplate(artistName: string, claimUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Porterful Artist Page Is Ready</title>
  <style>
    body { margin: 0; padding: 0; background: #08080B; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .logo { text-align: center; margin-bottom: 30px; }
    .logo-text { color: #C6A75E; font-size: 24px; font-weight: 700; letter-spacing: 0.05em; }
    .content { background: #12121A; border-radius: 12px; padding: 40px; border: 1px solid #2a2a3a; }
    h1 { color: #ffffff; font-size: 28px; margin: 0 0 20px 0; font-weight: 600; }
    p { color: #a0a0a8; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; }
    .highlight { color: #C6A75E; font-weight: 500; }
    .button { display: inline-block; background: #C6A75E; color: #000000; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; }
    .button:hover { background: #d4b76e; }
    .footer { text-align: center; margin-top: 30px; color: #66666d; font-size: 14px; }
    .url { color: #66666d; font-size: 13px; word-break: break-all; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <div class="logo-text">PORTERFUL</div>
    </div>
    <div class="content">
      <h1>Your Artist Page Is Ready to Claim</h1>
      <p>Hi <span class="highlight">${artistName}</span>,</p>
      <p>Your Porterful artist page has been prepared and is waiting for you. We've set up everything so you can start sharing your music and connecting with fans directly.</p>
      <p>Here's what you'll get:</p>
      <ul style="color: #a0a0a8; line-height: 1.8; padding-left: 20px;">
        <li>Your own artist page at <span class="highlight">porterful.com/artist/${artistName.toLowerCase().replace(/\s+/g, '-')}</span></li>
        <li>Keep the majority of every sale</li>
        <li>Direct fan support with Proud to Pay</li>
        <li>Full control over your music and profile</li>
      </ul>
      <p style="margin-top: 30px;">Click below to create your account and claim your page:</p>
      <a href="${claimUrl}" class="button">Claim Your ${artistName} Page</a>
      <p style="font-size: 14px; color: #66666d; margin-top: 30px;">If you didn't request this invite, you can safely ignore this email.</p>
    </div>
    <div class="footer">
      <p>Porterful — Built for artists, by artists.</p>
      <p class="url">${claimUrl}</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

// POST /api/artist-invite — Send artist invite email (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check for admin authorization (simple check for now)
    const authHeader = request.headers.get('authorization')
    const isAdmin = authHeader === `Bearer ${process.env.ADMIN_INVITE_TOKEN}` || 
                    process.env.NODE_ENV === 'development'
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email, artistName, artistSlug } = await request.json()

    if (!email || !artistName || !artistSlug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create Supabase admin client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    // Check if user already exists
    const { data: existingUser } = await supabase.auth.admin.listUsers()
    const userExists = existingUser?.users?.some((u: any) => u.email === email.toLowerCase())

    // Generate claim URL with artist info
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://porterful.com'
    const claimUrl = userExists 
      ? `${baseUrl}/forgot-password?email=${encodeURIComponent(email)}&artist=${artistSlug}`
      : `${baseUrl}/signup?role=artist&artist=${artistSlug}&email=${encodeURIComponent(email)}`

    // Send email via Resend
    if (!RESEND_API_KEY || RESEND_API_KEY === 're_test') {
      return NextResponse.json({ 
        error: 'Resend not configured',
        claimUrl,
        userExists 
      }, { status: 503 })
    }

    const resend = new Resend(RESEND_API_KEY)

    const { data, error } = await resend.emails.send({
      from: 'Porterful <noreply@likenessverified.com>',
      to: [email],
      bcc: ['iamodmusic@gmail.com'],
      subject: `Your Porterful Artist Page Is Ready to Claim`,
      html: getInviteEmailTemplate(artistName, claimUrl),
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ 
        error: 'Failed to send email',
        claimUrl,
        userExists 
      }, { status: 500 })
    }

    // Log the invite (optional - could create a pending_invites table)
    console.log('[artist-invite] Sent:', {
      email,
      artistName,
      artistSlug,
      userExists,
      messageId: data?.id,
    })

    return NextResponse.json({
      success: true,
      messageId: data?.id,
      claimUrl,
      userExists,
      message: userExists 
        ? 'User exists — password reset link sent'
        : 'New user invite sent — they must sign up'
    })

  } catch (err: any) {
    console.error('[artist-invite] Error:', err)
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}
