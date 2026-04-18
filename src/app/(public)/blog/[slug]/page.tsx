import { db } from '@/db'
import { posts } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ImageDialog } from '@/components/image-dialog'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, type SessionData } from '@/lib/auth'

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [post] = await db.select().from(posts).where(eq(posts.slug, slug)).limit(1)

  if (!post) notFound()

  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
  const isLoggedIn = session.isLoggedIn === true

  return (
    <article className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {new Date(post.createdAt).toLocaleDateString('en-US', {
              month: 'numeric',
              day: 'numeric',
              year: '2-digit',
            })}
          </p>
          {isLoggedIn && (
            <Link href={`/admin/posts/${post.slug}/edit`} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Edit
            </Link>
          )}
        </div>
        <h1 className="font-semibold text-2xl">{post.title}</h1>
      </div>

      <div
        className="prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: post.body }}
      />

      {post.images && post.images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 pt-4">
          {post.images.map((url, i) => (
            <ImageDialog key={i} src={url} />
          ))}
        </div>
      )}

      <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors block pt-4">
        ← All posts
      </Link>
    </article>
  )
}
