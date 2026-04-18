import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { sessionOptions, SessionData } from '@/lib/auth'
import { db } from '@/db'
import { posts } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { uploadToR2 } from '@/lib/r2'
import { randomUUID } from 'crypto'

async function requireAuth() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
  return session.isLoggedIn
}

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!await requireAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params
  const fd = await request.formData()

  const title = fd.get('title') as string
  const body = fd.get('body') as string

  // Existing image URLs to keep
  const keepImages = fd.getAll('images') as string[]

  // Upload any new image files
  const newFiles = fd.getAll('newImages') as File[]
  const uploadedUrls: string[] = []
  for (const file of newFiles) {
    if (!file.size) continue
    const ext = file.name.split('.').pop() ?? 'jpg'
    const key = `blog/${randomUUID()}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())
    uploadedUrls.push(await uploadToR2(buffer, key, file.type))
  }

  const images = [...keepImages, ...uploadedUrls]

  const [post] = await db
    .update(posts)
    .set({ title, body, images })
    .where(eq(posts.slug, slug))
    .returning()

  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(post)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!await requireAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params
  await db.delete(posts).where(eq(posts.slug, slug))
  return new NextResponse(null, { status: 204 })
}
