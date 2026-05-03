import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { normalizeActivationCode, getActivationCodeByValue, consumeActivationCode, isActivationCode, isDiscountCode } from '@/lib/activation'
import { ensureProfile } from '@/lib/server/ensure-profile'

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error('Supabase is not configured')
  }
  return createClient(url, key, { auth: { persistSession: false } })
}

async function getAuthenticatedUser(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll() {},
    },
  })

  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const codeValue = normalizeActivationCode(body?.code)
    if (!codeValue) {
      return NextResponse.json({ error: 'Enter an activation code.' }, { status: 400 })
    }

    const supabase = getServiceSupabase()
    const { data: activationCode, error: lookupError } = await getActivationCodeByValue(supabase, codeValue)

    if (lookupError) {
      return NextResponse.json({ error: lookupError.message }, { status: 500 })
    }

    if (!activationCode) {
      return NextResponse.json({ error: 'Invalid or already used code.' }, { status: 404 })
    }

    if (isDiscountCode(activationCode)) {
      return NextResponse.json({
        error: 'This code is for checkout discounts. Use it at checkout.',
        requiresCheckout: true,
      }, { status: 400 })
    }

    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({
        requiresAuth: true,
        message: 'Code accepted. Sign in to attach it to your account.',
        activationCode: {
          code: activationCode.code_value,
          kind: activationCode.kind,
          prepaid: activationCode.prepaid,
          discountCents: activationCode.discount_cents || 0,
        },
      })
    }

    const userEmail = user.email?.toLowerCase() || null

    const { profile, error: profileError } = await ensureProfile(supabase, user)
    if (profileError || !profile) {
      return NextResponse.json({ error: profileError?.message || 'Unable to prepare your account.' }, { status: 500 })
    }

    const { data: consumed, error: consumeError } = await consumeActivationCode(supabase, codeValue, {
      redeemedByProfileId: profile.id,
      redeemedEmail: userEmail,
    })

    if (consumeError || !consumed) {
      return NextResponse.json({ error: 'This code could not be activated.' }, { status: 409 })
    }

    return NextResponse.json({
      success: true,
      message: 'Your signal has been activated.',
      activationCode: {
        code: consumed.code_value,
        kind: consumed.kind,
        prepaid: consumed.prepaid,
        discountCents: consumed.discount_cents || 0,
      },
    })
  } catch (error: any) {
    console.error('[activation] error:', error)
    return NextResponse.json({ error: error.message || 'Activation failed' }, { status: 500 })
  }
}
