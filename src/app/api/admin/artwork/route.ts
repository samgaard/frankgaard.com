import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { sessionOptions, SessionData } from '@/lib/auth'
import { db } from '@/db'
import { artworks } from '@/db/schema'
import { uploadToR2 } from '@/lib/r2'
import { randomUUID } from 'crypto'

export async function POST(request: Request) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const fd = await request.formData()
  const title = fd.get('title') as string
  const category = fd.get('category') as string
  const altText = fd.get('altText') as string | null
  const description = fd.get('description') as string | null
  const imageFile = fd.get('image') as File | null

  if (!title || !category || !imageFile) {
    return NextResponse.json({ error: 'title, category, and image are required' }, { status: 400 })
  }

  const ext = imageFile.name.split('.').pop() ?? 'jpg'
  const key = `artwork/${randomUUID()}.${ext}`
  const buffer = Buffer.from(await imageFile.arrayBuffer())
  const imageUrl = await uploadToR2(buffer, key, imageFile.type)

  const [artwork] = await db
    .insert(artworks)
    .values({ title, imageUrl, altText: altText || null, category, description: description || null })
    .returning()

  return NextResponse.json(artwork, { status: 201 })
}
