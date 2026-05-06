import Link from 'next/link'
import { db } from '@/db'
import { artworks, posts } from '@/db/schema'
import { desc } from 'drizzle-orm'
import { ArtworkCarousel } from '@/components/artwork-carousel'
import { PostPreview } from '@/components/post-preview'
import { buttonVariants } from '@/components/ui/button'

export default async function HomePage() {
  const [carouselArtworks, recentPosts] = await Promise.all([
    db.select().from(artworks).orderBy(desc(artworks.createdAt)).limit(20),
    db.select().from(posts).orderBy(desc(posts.createdAt)).limit(5),
  ])

  return (
    <div className="space-y-8">
      {carouselArtworks.length > 0 ? (
        <ArtworkCarousel artworks={carouselArtworks} />
      ) : (
        <div className="h-48 flex items-center justify-center rounded-lg border border-dashed text-muted-foreground text-sm">
          No artwork yet
        </div>
      )}

      {recentPosts.length > 0 && (
        <section className="space-y-6">
          <h2 className="font-semibold text-2xl">Latest blog posts</h2>
          <div className="space-y-6">
            {recentPosts.map((post) => (
              <PostPreview key={post.id} post={post} />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-3 flex items-center justify-between">
              <Link href="/blog" className={buttonVariants({ size: 'sm' })}>All posts →</Link>
              <a href="/blog/rss.xml" className="text-muted-foreground hover:text-foreground transition-colors" title="RSS feed">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19.01 7.38 20 6.18 20C4.98 20 4 19.01 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z"/></svg>
              </a>
            </div>
            <div className="hidden sm:block sm:col-span-1" />
          </div>
        </section>
      )}
    </div>
  )
}
