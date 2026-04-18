import Link from 'next/link'
import { db } from '@/db'
import { artworks, posts } from '@/db/schema'
import { sql } from 'drizzle-orm'
import { buttonVariants } from '@/components/ui/button'

export default async function AdminPage() {
  const [[{ count: artworkCount }], [{ count: postCount }]] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(artworks),
    db.select({ count: sql<number>`count(*)` }).from(posts),
  ])

  return (
    <div className="space-y-8">
      <h1 className="font-semibold text-2xl">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 max-w-sm">
        <Link href="/admin/artwork" className="border rounded-lg p-4 space-y-1 hover:bg-muted transition-colors block">
          <p className="text-3xl font-semibold">{artworkCount}</p>
          <p className="text-sm text-muted-foreground">Artworks</p>
        </Link>
        <Link href="/admin/posts" className="border rounded-lg p-4 space-y-1 hover:bg-muted transition-colors block">
          <p className="text-3xl font-semibold">{postCount}</p>
          <p className="text-sm text-muted-foreground">Posts</p>
        </Link>
      </div>
      <div className="flex gap-3">
        <Link href="/admin/artwork/new" className={buttonVariants()}>Add Artwork</Link>
        <Link href="/admin/posts/new" className={buttonVariants({ variant: 'outline' })}>New Post</Link>
      </div>
    </div>
  )
}
