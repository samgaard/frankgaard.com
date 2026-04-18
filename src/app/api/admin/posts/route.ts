import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { sessionOptions, SessionData } from '@/lib/auth'
import { db } from '@/db'
import { posts } from '@/db/schema'

export async function POST(request: Request) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { title, slug, body } = await request.json()

  if (!title || !slug || !body) {
    return NextResponse.json({ error: 'title, slug, and body are required' }, { status: 400 })
  }

  try {
    const [post] = await db
      .insert(posts)
      .values({ title, slug, body })
      .returning()

    return NextResponse.json(post, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
  }
}
