import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { email, password, name, role, youtube, website, industry, invite_artist_slug } = await request.json()

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    // Create auth user with service role key (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Skip email confirmation for smoother signup
      user_metadata: { name, role }
    })

    if (signUpError) {
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

    // Create profile
    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      email: email,
      name: name,
      role: role,
      ...(referredBy ? { referred_by: referredBy } : {}),
    })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Continue anyway - profile might already exist
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

    // If this email already redeemed a cash activation or prepaid checkout, mark the profile.
    try {
      const normalizedEmail = email.toLowerCase()
      const { data: activationCode } = await supabase
        .from('activation_codes')
        .select('id, code_value, kind, prepaid, redeemed_email, used_at')
        .eq('redeemed_email', normalizedEmail)
        .eq('status', 'used')
        .order('used_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      const { data: cashOrder } = await supabase
        .from('orders')
        .select('id, activation_code_id, payment_method, buyer_email, created_at')
        .eq('buyer_email', normalizedEmail)
        .in('payment_method', ['cash', 'code'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      const activationCodeId = activationCode?.id || cashOrder?.activation_code_id || null
      if (activationCodeId || cashOrder) {
        await supabase.from('profiles').update({
          paid_cash: true,
          cash_paid_at: new Date().toISOString(),
          activation_code_id: activationCodeId,
        }).eq('id', userId)
      }
    } catch (cashErr) {
      console.warn('Cash activation lookup failed (non-fatal):', cashErr)
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
          // Update the existing artist record to point to this user
          await supabase.from('artists').update({ id: userId }).eq('slug', invite_artist_slug)
          artistSlug = invite_artist_slug
        } else {
          // Slug doesn't exist yet, use it as new
          artistSlug = invite_artist_slug
          await supabase.from('artists').insert({
            id: userId,
            name: name,
            slug: artistSlug,
            bio: '',
            location: '',
            ...(youtube ? { social_links: { youtube } } : {}),
          })
        }
      } else {
        // Normal signup - generate slug from name
        artistSlug = name.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') + '-' + Math.random().toString(36).substr(2, 4)
        
        await supabase.from('artists').insert({
          id: userId,
          name: name,
          slug: artistSlug,
          bio: '',
          location: '',
          ...(youtube ? { social_links: { youtube } } : {}),
        })
      }
    }

    // If business/brand, update with website and industry
    if ((role === 'business' || role === 'brand') && website) {
      await supabase.from('profiles').update({
        website,
        industry,
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
