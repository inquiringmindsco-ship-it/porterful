import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const TO_EMAIL = 'porter.jonathanj@gmail.com'

function getResend() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey || apiKey === 're_test') {
    return null
  }
  return new Resend(apiKey)
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Store submission in database first (always works)
    let submission = null
    let dbError = null
    try {
      const supabase = getSupabase()
      const result = await supabase
        .from('contact_submissions')
        .insert({
          name,
          email,
          subject: subject || 'General',
          message,
          status: 'new',
        })
        .select()
        .single()
      
      submission = result.data
      dbError = result.error
      
      if (dbError) {
        console.error('Database error:', dbError)
      }
    } catch (e) {
      console.error('Database exception:', e)
      dbError = e
    }

    // Try to send email via Resend
    const resend = getResend()
    let emailSent = false
    let emailError = null

    if (resend) {
      try {
        const { data, error } = await resend.emails.send({
          from: 'Porterful <contact@porterful.com>',
          to: [TO_EMAIL],
          replyTo: email,
          subject: `[Porterful Contact] ${subject || 'New message'} from ${name}`,
          html: `
            <h2>New message from Porterful contact form</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject || '(no subject)'}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
            <hr>
            <p><small>Stored in database: ${submission ? 'Yes' : 'No'}</small></p>
          `,
        })

        if (error) {
          console.error('Resend error:', error)
          emailError = error
        } else {
          emailSent = true
        }
      } catch (e) {
        console.error('Email send exception:', e)
        emailError = e
      }
    }

    // Return success if either DB or email worked
    if (submission || emailSent) {
      return NextResponse.json({
        success: true,
        id: submission?.id,
        emailSent,
        stored: !!submission,
        warning: emailError ? 'Email failed but submission stored' : undefined,
      })
    }

    // If DB failed but we have a valid Resend key, try email-only
    if (!submission && resend && !emailSent) {
      return NextResponse.json({
        success: false,
        error: 'Failed to store submission and send email',
        details: {
          db: (dbError as any)?.message || 'Unknown DB error',
          email: (emailError as any)?.message || 'Unknown email error',
        },
      }, { status: 500 })
    }

  } catch (err) {
    console.error('Contact form error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}