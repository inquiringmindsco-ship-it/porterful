import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { email, password, name, role, youtube, website, invite_artist_slug } = await request.json()

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    // Create auth user with service role key (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // First check if user already exists
    const { data: existingUser } = await supabase.auth.admin.listUsers()
    const userExists = existingUser?.users?.some((u: any) => u.email?.toLowerCase() === email.toLowerCase())
    
    if (userExists) {
      return NextResponse.json({ 
        error: 'This email is already registered. Please sign in instead.' 
      }, { status: 409 })
    }
    
    const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Skip email confirmation for smoother signup
      user_metadata: { name, full_name: name, role }
    })

    if (signUpError) {
      console.error('Signup error:', signUpError)
      return NextResponse.json({ error: signUpError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    const userId = authData.user.id
    const normalizedEmail = email.toLowerCase()
    const username = normalizedEmail.split('@')[0] || userId

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
      email: normalizedEmail,
      username,
      full_name: name,
      avatar_url: null,
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
