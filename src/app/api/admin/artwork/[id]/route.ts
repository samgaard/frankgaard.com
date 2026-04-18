import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { sessionOptions, SessionData } from '@/lib/auth'
import { db } from '@/db'
import { artworks } from '@/db/schema'
import { eq } from 'drizzle-orm'

async function requireAuth() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
  return session.isLoggedIn
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { title, imageUrl, altText, category, description } = await request.json()

  const [artwork] = await db
    .update(artworks)
    .set({ title, imageUrl, altText: altText || null, category, description: description || null })
    .where(eq(artworks.id, Number(id)))
    .returning()

  if (!artwork) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(artwork)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await db.delete(artworks).where(eq(artworks.id, Number(id)))
  return new NextResponse(null, { status: 204 })
}
