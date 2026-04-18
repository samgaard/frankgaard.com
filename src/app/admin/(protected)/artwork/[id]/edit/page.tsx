import { db } from '@/db'
import { artworks } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { ArtworkEditForm } from '@/components/admin/artwork-edit-form'

export default async function EditArtworkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [artwork] = await db.select().from(artworks).where(eq(artworks.id, Number(id))).limit(1)

  if (!artwork) notFound()

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="font-semibold text-2xl">Edit Artwork</h1>
      <ArtworkEditForm artwork={artwork} />
    </div>
  )
}
