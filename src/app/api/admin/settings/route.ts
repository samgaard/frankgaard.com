import { NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, type SessionData } from '@/lib/auth'
import { db } from '@/db'
import { settings } from '@/db/schema'

export async function POST(request: Request) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
  if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { key, value } = await request.json()
  if (!key) return NextResponse.json({ error: 'Key is required.' }, { status: 400 })

  await db.insert(settings).values({ key, value }).onConflictDoUpdate({ target: settings.key, set: { value } })

  return NextResponse.json({ ok: true })
}
