import { cache } from 'react'
import { Lora } from 'next/font/google'
import { db } from '@/db'
import { posts } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ImageDialog } from '@/components/image-dialog'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, type SessionData } from '@/lib/auth'
import type { Metadata } from 'next'

const lora = Lora({ subsets: ['latin'], variable: '--font-lora' })

type Props = { params: Promise<{ slug: string }> }

const getPost = cache(async (slug: string) => {
  const [post] = await db.select().from(posts).where(eq(posts.slug, slug)).limit(1)
  return post ?? null
})

function excerpt(html: string, maxLength = 200): string {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).replace(/\s\S*$/, '') + '…'
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return {}

  const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Blog'
  const description = excerpt(post.body)
  const image = post.images?.[0]

  return {
    title: `${post.title} — ${siteName}`,
    description,
    openGraph: {
      title: post.title,
      description,
      siteName,
      ...(image && { images: [{ url: image }] }),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: post.title,
      description,
      ...(image && { images: [image] }),
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) notFound()

  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
  const isLoggedIn = session.isLoggedIn === true

  const hasImages = post.images && post.images.length > 0

  return (
    <div className={`${lora.variable} flex flex-col md:flex-row md:gap-8 md:items-start`}>
      <article className="w-full md:max-w-2xl md:shrink-0 space-y-6">
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
          className="prose prose-lg max-w-none [font-family:var(--font-lora)] [color:#1c1917]"
          dangerouslySetInnerHTML={{ __html: post.body }}
        />

        <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors block pt-4">
          ← All posts
        </Link>
      </article>

      {hasImages && (
        <aside className="w-full md:flex-1 pt-6 md:pt-10">
          <div className="grid grid-cols-2 gap-2">
            {post.images!.map((url, i) => (
              <ImageDialog key={i} src={url} />
            ))}
          </div>
        </aside>
      )}
    </div>
  )
}
