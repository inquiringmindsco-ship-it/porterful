import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiter (per-IP)
// In production, use Redis or similar for multi-instance deployments
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const WINDOW_MS = 60 * 60 * 1000 // 1 hour
const MAX_REQUESTS = 5 // 5 signups per hour per IP

function getRateLimitInfo(ip: string) {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, remaining: MAX_REQUESTS - 1 }
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0 }
  }

  entry.count++
  return { allowed: true, remaining: MAX_REQUESTS - entry.count }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown'
    const { allowed } = getRateLimitInfo(ip)

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many signups. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { email } = body

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // In production, integrate with email service (Mailchimp, ConvertKit, etc.)
    console.log(`Newsletter signup: ${email}`)

    return NextResponse.json({
      success: true,
      message: 'Thanks for subscribing!',
    })
  } catch (error) {
    console.error('Newsletter signup error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
