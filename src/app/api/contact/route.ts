import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getSiteName } from '@/lib/settings'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  const body = await request.json()
  const { name, email, message, turnstileToken, website } = body

  // Honeypot — bots fill hidden fields, real users don't
  if (website) return NextResponse.json({})

  if (!email || !message) {
    return NextResponse.json({ error: 'Email and message are required.' }, { status: 400 })
  }

  // Verify Turnstile token server-side
  const verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: turnstileToken,
    }),
  })
  const verificationData = await verification.json()
  if (!verificationData.success) {
    return NextResponse.json({ error: 'Bot check failed. Please try again.' }, { status: 400 })
  }

  const [recipientSetting, fromSetting, bccSetting] = await Promise.all([
    getSetting('contact_recipient_email'),
    getSetting('contact_from_email'),
    getSetting('contact_bcc_email'),
  ])

  const to = (recipientSetting ?? '').split(',').map((e) => e.trim()).filter(Boolean)
  if (to.length === 0) {
    return NextResponse.json({ error: 'Contact form is not configured.' }, { status: 500 })
  }

  const from = fromSetting ?? 'onboarding@resend.dev'
  const bcc = (bccSetting ?? '').split(',').map((e) => e.trim()).filter(Boolean)
  const siteName = await getSiteName()

  await resend.emails.send({
    from,
    to,
    ...(bcc.length > 0 && { bcc }),
    replyTo: email,
    subject: `New message from ${siteName}${name ? ` — ${name}` : ''}`,
    text: `You received a message from the contact form on ${siteName}.\n\n${message}\n\n---\n${name ? `${name} ` : ''}<${email}>`,
  })

  return NextResponse.json({ ok: true })
}
