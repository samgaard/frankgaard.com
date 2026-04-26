'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import Script from 'next/script'

declare global {
  interface Window {
    _turnstileLogin?: (token: string) => void
    _turnstileLoginExpired?: () => void
  }
}

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')

  useEffect(() => {
    window._turnstileLogin = (token: string) => setTurnstileToken(token)
    window._turnstileLoginExpired = () => setTurnstileToken('')
    return () => {
      delete window._turnstileLogin
      delete window._turnstileLoginExpired
    }
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const fd = new FormData(e.currentTarget)

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: fd.get('email'),
        password: fd.get('password'),
        turnstileToken,
      }),
    })

    if (res.ok) {
      router.push('/admin')
    } else {
      setError('Invalid credentials')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="font-semibold text-xl">Admin login</h1>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required autoComplete="current-password" />
        </div>
        <div
          className="cf-turnstile"
          data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          data-callback="_turnstileLogin"
          data-expired-callback="_turnstileLoginExpired"
        />
        <Button type="submit" className="w-full" disabled={loading || !turnstileToken}>
          {loading ? 'Logging in…' : 'Log in'}
        </Button>
      </form>
    </div>
  )
}
