import { getSetting, getSiteName } from '@/lib/settings'
import { SettingsForm } from './settings-form'

export default async function SettingsPage() {
  const [siteName, recipientEmail, fromEmail, bccEmail] = await Promise.all([
    getSiteName(),
    getSetting('contact_recipient_email'),
    getSetting('contact_from_email'),
    getSetting('contact_bcc_email'),
  ])

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="font-semibold text-2xl">Settings</h1>
      <SettingsForm
        siteName={siteName}
        recipientEmail={recipientEmail ?? ''}
        fromEmail={fromEmail ?? 'onboarding@resend.dev'}
        bccEmail={bccEmail ?? ''}
      />
    </div>
  )
}
