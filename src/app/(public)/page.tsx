import Link from 'next/link'
import Image from 'next/image'
import { db } from '@/db'
import { artworks, posts } from '@/db/schema'
import { desc } from 'drizzle-orm'
import { ArtworkCarousel } from '@/components/artwork-carousel'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const CATEGORIES = ['Portraits', 'Pictures', 'Installations', 'Notebooks'] as const

export default async function HomePage() {
  const [recentArtworks, recentPosts] = await Promise.all([
    db.select().from(artworks).orderBy(desc(artworks.createdAt)).limit(12),
    db.select().from(posts).orderBy(desc(posts.createdAt)).limit(5),
  ])

  const artworksByCategory = CATEGORIES.map((cat) => ({
    category: cat,
    items: recentArtworks.filter((a) => a.category === cat),
  })).filter((g) => g.items.length > 0)

  return (
    <div className="space-y-12">
      {/* Carousel */}
      {recentArtworks.length > 0 ? (
        <ArtworkCarousel artworks={recentArtworks} />
      ) : (
        <div className="h-48 flex items-center justify-center rounded-lg border border-dashed text-muted-foreground text-sm">
          No artwork yet
        </div>
      )}

      {/* Gallery preview by category */}
      {artworksByCategory.length > 0 && (
        <section className="space-y-8">
          {artworksByCategory.map(({ category, items }) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg">{category}</h2>
                <Link
                  href={`/gallery?category=${category}`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  View all →
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {items.slice(0, 4).map((artwork) => (
                  <div key={artwork.id} className="aspect-square relative overflow-hidden rounded-md bg-muted">
                    <Image
                      src={artwork.imageUrl}
                      alt={artwork.altText ?? artwork.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="text-center pt-2">
            <Link href="/gallery" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              View full gallery →
            </Link>
          </div>
        </section>
      )}

      {/* Recent blog posts */}
      {recentPosts.length > 0 && (
        <>
          <Separator />
          <section className="space-y-4">
            <h2 className="font-semibold text-lg">Recent Posts</h2>
            <div className="space-y-4">
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
                  </Link>
                </article>
              ))}
            </div>
            <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              All posts →
            </Link>
          </section>
        </>
      )}
    </div>
  )
}
