import Link from 'next/link'
import { db } from '@/db'
import { artworks, posts } from '@/db/schema'
import { desc } from 'drizzle-orm'
import { ArtworkCarousel } from '@/components/artwork-carousel'

function excerpt(html: string, maxLength = 160): string {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).replace(/\s\S*$/, '') + '…'
}

export default async function HomePage() {
  const [recentArtworks, recentPosts] = await Promise.all([
    db.select().from(artworks).orderBy(desc(artworks.createdAt)).limit(12),
    db.select().from(posts).orderBy(desc(posts.createdAt)).limit(5),
  ])

  return (
    <div className="space-y-8">
      {recentArtworks.length > 0 ? (
        <ArtworkCarousel artworks={recentArtworks} />
      ) : (
        <div className="h-48 flex items-center justify-center rounded-lg border border-dashed text-muted-foreground text-sm">
          No artwork yet
        </div>
      )}

      {recentPosts.length > 0 && (
        <section className="space-y-6">
            <div className="space-y-6">
              {recentPosts.map((post) => (
                <article key={post.id}>
                  <Link href={`/blog/${post.slug}`} className="group block space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {new Date(post.createdAt).toLocaleDateString('en-US', {
                        month: 'numeric',
                        day: 'numeric',
                        year: '2-digit',
                      })}
                    </p>
                    <h3 className="font-medium group-hover:underline">{post.title}</h3>
                    <p className="text-sm text-muted-foreground">{excerpt(post.body)}</p>
                  </Link>
                </article>
              ))}
            </div>
            <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              All posts →
            </Link>
        </section>
      )}
    </div>
  )
}
