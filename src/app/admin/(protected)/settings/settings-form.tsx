'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

type Props = {
  siteName: string
  recipientEmail: string
  fromEmail: string
  bccEmail: string
}

export function SettingsForm({ siteName, recipientEmail, fromEmail, bccEmail }: Props) {
  const [values, setValues] = useState({ siteName, recipientEmail, fromEmail, bccEmail })
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  function set(field: keyof typeof values, val: string) {
    setValues((v) => ({ ...v, [field]: val }))
    setStatus('idle')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('saving')
    const entries: [string, string][] = [
      ['site_name', values.siteName],
      ['contact_recipient_email', values.recipientEmail],
      ['contact_from_email', values.fromEmail],
      ['contact_bcc_email', values.bccEmail],
    ]
    const results = await Promise.all(
      entries.map(([key, value]) =>
        fetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value }),
        })
      )
    )
    setStatus(results.every((r) => r.ok) ? 'saved' : 'error')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">General</h2>
        <div className="space-y-1">
          <Label htmlFor="site_name">Site name</Label>
          <Input id="site_name" value={values.siteName} onChange={(e) => set('siteName', e.target.value)} required />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Contact form</h2>
        <div className="space-y-1">
          <Label htmlFor="recipient_email">Recipient email</Label>
          <Input id="recipient_email" type="email" value={values.recipientEmail} onChange={(e) => set('recipientEmail', e.target.value)} placeholder="who receives contact form submissions" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="from_email">From email</Label>
          <Input id="from_email" value={values.fromEmail} onChange={(e) => set('fromEmail', e.target.value)} placeholder="onboarding@resend.dev" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="bcc_email">BCC email <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Input id="bcc_email" value={values.bccEmail} onChange={(e) => set('bccEmail', e.target.value)} placeholder="monitoring address" />
        </div>
      </div>

      {status === 'saved' && <p className="text-sm text-green-600">Saved.</p>}
      {status === 'error' && <p className="text-sm text-destructive">Something went wrong.</p>}
      <Button type="submit" disabled={status === 'saving'}>
        {status === 'saving' ? 'Saving…' : 'Save'}
      </Button>
    </form>
  )
}
