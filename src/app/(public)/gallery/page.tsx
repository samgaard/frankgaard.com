import Image from 'next/image'
import { db } from '@/db'
import { artworks } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { ArtworkDialog } from '@/components/artwork-dialog'

const CATEGORIES = ['Portraits', 'Pictures', 'Installations', 'Notebooks'] as const

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const activeCategory = CATEGORIES.find((c) => c === category) ?? null

  const items = await db
    .select()
    .from(artworks)
    .where(activeCategory ? eq(artworks.category, activeCategory) : undefined)
    .orderBy(artworks.createdAt)

  const grouped = activeCategory
    ? [{ category: activeCategory, items }]
    : CATEGORIES.map((cat) => ({
        category: cat,
        items: items.filter((a) => a.category === cat),
      })).filter((g) => g.items.length > 0)

  return (
    <div className="space-y-10">
      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <a
          href="/gallery"
          className={`text-sm px-3 py-1 rounded-full border transition-colors ${
            !activeCategory ? 'bg-foreground text-background' : 'hover:bg-muted'
          }`}
        >
          All
        </a>
        {CATEGORIES.map((cat) => (
          <a
            key={cat}
            href={`/gallery?category=${cat}`}
            className={`text-sm px-3 py-1 rounded-full border transition-colors ${
              activeCategory === cat ? 'bg-foreground text-background' : 'hover:bg-muted'
            }`}
          >
            {cat}
          </a>
        ))}
      </div>

      {grouped.length === 0 && (
        <p className="text-muted-foreground text-sm">No artwork yet.</p>
      )}

      {grouped.map(({ category: cat, items: catItems }) => (
        <section key={cat} className="space-y-3">
          {!activeCategory && <h2 className="font-semibold text-lg">{cat}</h2>}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {catItems.map((artwork) => (
              <ArtworkDialog key={artwork.id} artwork={artwork} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
