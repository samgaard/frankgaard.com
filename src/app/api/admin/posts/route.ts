import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { sessionOptions, SessionData } from '@/lib/auth'
import { db } from '@/db'
import { posts } from '@/db/schema'
import { uploadToR2 } from '@/lib/r2'
import { randomUUID } from 'crypto'

export async function POST(request: Request) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const fd = await request.formData()
  const title = fd.get('title') as string
  const slug = fd.get('slug') as string
  const body = fd.get('body') as string
  const imageFiles = fd.getAll('images') as File[]

  if (!title || !slug || !body) {
    return NextResponse.json({ error: 'title, slug, and body are required' }, { status: 400 })
  }

  const imageUrls = await Promise.all(
    imageFiles.filter((f) => f.size > 0).map(async (file) => {
      const ext = file.name.split('.').pop() ?? 'jpg'
      const key = `posts/${randomUUID()}.${ext}`
      const buffer = Buffer.from(await file.arrayBuffer())
      return uploadToR2(buffer, key, file.type)
    })
  )

  try {
    const [post] = await db
      .insert(posts)
      .values({ title, slug, body, images: imageUrls.length > 0 ? imageUrls : null })
      .returning()

    return NextResponse.json(post, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
  }
}
