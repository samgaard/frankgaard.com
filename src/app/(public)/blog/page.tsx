import Link from 'next/link'
import { db } from '@/db'
import { posts } from '@/db/schema'
import { desc } from 'drizzle-orm'

export default async function BlogPage() {
  const allPosts = await db.select().from(posts).orderBy(desc(posts.createdAt))

  return (
    <div className="space-y-8 max-w-2xl">
      <h1 className="font-semibold text-2xl">Blog</h1>
      {allPosts.length === 0 && (
        <p className="text-muted-foreground text-sm">No posts yet.</p>
      )}
      <div className="space-y-6">
        {allPosts.map((post) => (
          <article key={post.id} className="space-y-1">
            <p className="text-xs text-muted-foreground">
              {new Date(post.createdAt).toLocaleDateString('en-US', {
                month: 'numeric',
                day: 'numeric',
                year: '2-digit',
              })}
            </p>
            <Link href={`/blog/${post.slug}`} className="group block">
              <h2 className="font-medium group-hover:underline">{post.title}</h2>
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}
