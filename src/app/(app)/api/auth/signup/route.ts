import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ensureProfile } from '@/lib/server/ensure-profile'

function isDuplicateAuthUserError(error: { message?: string; status?: number } | null | undefined) {
  if (!error) return false
  const message = (error.message || '').toLowerCase()
  return (
    error.status === 409 ||
    message.includes('already') ||
    message.includes('registered') ||
    message.includes('exists') ||
    message.includes('duplicate')
  )
}

// Valid roles for public signup — 'admin' and 'founder' require manual assignment
const VALID_SIGNUP_ROLES = ['supporter', 'superfan', 'artist', 'business', 'brand'] as const
type ValidSignupRole = typeof VALID_SIGNUP_ROLES[number]

const SIGNUP_WINDOW_MS = 10 * 60 * 1000
const MAX_SIGNUP_ATTEMPTS_PER_WINDOW = 5
const signupAttemptBuckets = new Map<string, { count: number; resetAt: number }>()

function getSignupThrottleKey(request: Request, email: string) {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const realIp = request.headers.get('x-real-ip')?.trim()
  const ip = forwardedFor || realIp || 'unknown'
  return `${ip}:${email.toLowerCase()}`
}

function checkSignupThrottle(request: Request, email: string) {
  const key = getSignupThrottleKey(request, email)
  const now = Date.now()
  const current = signupAttemptBuckets.get(key)

  if (!current || current.resetAt <= now) {
    signupAttemptBuckets.set(key, { count: 1, resetAt: now + SIGNUP_WINDOW_MS })
    return { limited: false as const }
  }

  if (current.count >= MAX_SIGNUP_ATTEMPTS_PER_WINDOW) {
    const retryAfterMs = Math.max(0, current.resetAt - now)
    return { limited: true as const, retryAfterMs }
  }

  current.count += 1
  signupAttemptBuckets.set(key, current)
  return { limited: false as const }
}

export async function POST(request: Request) {
  try {
    const { email, password, name, role, youtube, website, invite_artist_slug } = await request.json()

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const throttle = checkSignupThrottle(request, String(email))
    if (throttle.limited) {
      return NextResponse.json(
        { error: 'Too many signup attempts. Please wait a moment and try again.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.max(1, Math.ceil(throttle.retryAfterMs / 1000))),
          },
        },
      )
    }

    // CRITICAL-001 FIX: Reject privileged roles from public signup
    if (!VALID_SIGNUP_ROLES.includes(role as ValidSignupRole)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${VALID_SIGNUP_ROLES.join(', ')}` },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    // Create auth user with service role key (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Skip email confirmation for smoother signup
      user_metadata: { name, full_name: name, role }
    })

    if (signUpError) {
      if (isDuplicateAuthUserError(signUpError)) {
        return NextResponse.json({
          error: 'This email is already registered. Please sign in instead.',
        }, { status: 409 })
      }

      console.error('Signup error:', signUpError)
      return NextResponse.json({ error: signUpError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    const userId = authData.user.id

    // --- Referral Logic ---
    let referredBy: string | null = null
    let refCode: string | null | undefined = null
    try {
      const cookieStore = await cookies()
      refCode = cookieStore.get('porterful_referral')?.value
      if (refCode) {
        // Look up referrer's profile ID by referral_code
        const { data: referrerProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('referral_code', refCode)
          .single()
        if (referrerProfile) {
          referredBy = referrerProfile.id
        }
      }
    } catch (refErr) {
      // Non-fatal: proceed without referral
      console.warn('Referral lookup error:', refErr)
    }

    // Clear referral cookie after processing
    try {
      const cookieStore = await cookies()
      cookieStore.delete('porterful_referral')
    } catch {
      // Ignore if cookie already cleared or inaccessible
    }
    // --- End Referral Logic ---

    // Ensure the profile exists even if the auth trigger already created it.
    const { profile: ensuredProfile, error: ensureProfileError } = await ensureProfile(supabase, authData.user)

    let profile = ensuredProfile
    if (!profile) {
      const { data: existingProfile, error: existingProfileError } = await supabase
        .from('profiles')
        .select('id, role, referred_by')
        .eq('id', userId)
        .maybeSingle()

      if (existingProfileError || !existingProfile) {
        console.error('Profile ensure error:', ensureProfileError || existingProfileError)
        return NextResponse.json({
          error: 'Could not prepare your profile. Please try again.',
        }, { status: 500 })
      }

      profile = existingProfile
    }

    const profileUpdates: Record<string, unknown> = {}
    if (profile.role !== role) {
      profileUpdates.role = role
    }
    if (referredBy && profile.referred_by !== referredBy) {
      profileUpdates.referred_by = referredBy
    }

    if (Object.keys(profileUpdates).length > 0) {
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', userId)

      if (profileUpdateError) {
        console.error('Profile update error:', profileUpdateError)
        return NextResponse.json({
          error: 'Could not finish setting up your profile. Please try again.',
        }, { status: 500 })
      }
    }

    // Create referral record if this was a referred signup
    if (referredBy && refCode) {
      try {
        await supabase.from('referrals').insert({
          referrer_id: referredBy,
          referred_id: userId,
          referral_code: refCode,
        })
      } catch (refErr) {
        console.warn('Referral record creation failed (non-fatal):', refErr)
      }
    }

    // If artist, create artist record
    if (role === 'artist') {
      // Check if this is an invite claim with existing slug
      let artistSlug: string
      
      if (invite_artist_slug) {
        // Check if the invited slug already exists (should link to existing)
        const { data: existingArtist } = await supabase
          .from('artists')
          .select('id, slug')
          .eq('slug', invite_artist_slug)
          .maybeSingle()
        
        if (existingArtist) {
          // This is a claim flow - the artist record exists but needs user_id
          // PHASE B GUARDRAIL: Keep existing status/public_profile, only update user linkage
          await supabase.from('artists').update({ id: userId }).eq('slug', invite_artist_slug)
          artistSlug = invite_artist_slug
        } else {
          // Slug doesn't exist yet, use it as new
          // PHASE B: New artist defaults to pending/hidden until approved
          artistSlug = invite_artist_slug
          await supabase.from('artists').insert({
            id: userId,
            name: name,
            slug: artistSlug,
            bio: '',
            location: '',
            status: 'pending',
            public_profile_enabled: false,
            ...(youtube ? { social_links: { youtube } } : {}),
          })
        }
      } else {
        // Normal signup - generate slug from name
        // PHASE B: New artist defaults to pending/hidden until approved by founder
        artistSlug = name.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') + '-' + Math.random().toString(36).substr(2, 4)
        
        await supabase.from('artists').insert({
          id: userId,
          name: name,
          slug: artistSlug,
          bio: '',
          location: '',
          status: 'pending',
          public_profile_enabled: false,
          ...(youtube ? { social_links: { youtube } } : {}),
        })
      }
    }

    // If business/brand, update with website only.
    if ((role === 'business' || role === 'brand') && website) {
      await supabase.from('profiles').update({
        website,
      }).eq('id', userId)
    }

    // Return success - client will handle session creation via email/password login
    return NextResponse.json({ 
      success: true,
      userId,
      message: 'Account created successfully'
    })

  } catch (err: any) {
    console.error('Signup API error:', err)
    return NextResponse.json({ error: err.message || 'Signup failed' }, { status: 500 })
  }
}
