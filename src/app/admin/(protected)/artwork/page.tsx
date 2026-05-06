import Link from 'next/link'
import Image from 'next/image'
import { db } from '@/db'
import { artworks } from '@/db/schema'
import { desc } from 'drizzle-orm'
import { buttonVariants } from '@/components/ui/button'
import { DeleteButton } from '@/components/admin/delete-button'

export default async function AdminArtworkPage() {
  const items = await db.select().from(artworks).orderBy(desc(artworks.createdAt))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-2xl">Artwork ({items.length})</h1>
        <Link href="/admin/artwork/new" className={buttonVariants({ size: 'sm' })}>Add artwork</Link>
      </div>

      {items.length === 0 && (
        <p className="text-muted-foreground text-sm">No artwork yet.</p>
      )}

      <div className="space-y-2">
        {items.map((artwork) => (
          <div key={artwork.id} className="flex items-center gap-4 border rounded-lg p-3">
            <div className="relative w-12 h-12 shrink-0 rounded overflow-hidden bg-muted">
              <Image src={artwork.imageUrl} alt={artwork.title} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{artwork.title}</p>
              <p className="text-xs text-muted-foreground">{artwork.category}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link href={`/admin/artwork/${artwork.id}/edit`} className={buttonVariants({ size: 'sm', variant: 'outline' })}>Edit</Link>
              <DeleteButton id={artwork.id} type="artwork" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
