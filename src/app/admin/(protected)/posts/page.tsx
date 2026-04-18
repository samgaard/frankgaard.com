import Link from 'next/link'
import { db } from '@/db'
import { posts } from '@/db/schema'
import { desc } from 'drizzle-orm'
import { buttonVariants } from '@/components/ui/button'
import { DeleteButton } from '@/components/admin/delete-button'

export default async function AdminPostsPage() {
  const items = await db.select().from(posts).orderBy(desc(posts.createdAt))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-2xl">Posts ({items.length})</h1>
        <Link href="/admin/posts/new" className={buttonVariants({ size: 'sm' })}>New post</Link>
      </div>

      {items.length === 0 && (
        <p className="text-muted-foreground text-sm">No posts yet.</p>
      )}

      <div className="space-y-2">
        {items.map((post) => (
          <div key={post.id} className="flex items-center gap-4 border rounded-lg p-3">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{post.title}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(post.createdAt).toLocaleDateString('en-US', {
                  month: 'numeric', day: 'numeric', year: '2-digit',
                })} · /{post.slug}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link href={`/admin/posts/${post.slug}/edit`} className={buttonVariants({ size: 'sm', variant: 'outline' })}>Edit</Link>
              <DeleteButton id={post.slug} type="post" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
