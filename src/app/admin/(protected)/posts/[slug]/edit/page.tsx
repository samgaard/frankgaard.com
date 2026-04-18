import { db } from '@/db'
import { posts } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { PostEditForm } from '@/components/admin/post-edit-form'

export default async function EditPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [post] = await db.select().from(posts).where(eq(posts.slug, slug)).limit(1)

  if (!post) notFound()

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-semibold text-2xl">Edit Post</h1>
      <PostEditForm post={post} />
    </div>
  )
}
