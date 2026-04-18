'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { artworks } from '@/db/schema'
import type { InferSelectModel } from 'drizzle-orm'

const CATEGORIES = ['Portraits', 'Pictures', 'Installations', 'Notebooks'] as const
type Artwork = InferSelectModel<typeof artworks>

export function ArtworkEditForm({ artwork }: { artwork: Artwork }) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const fd = new FormData(e.currentTarget)

    const res = await fetch(`/api/admin/artwork/${artwork.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: fd.get('title'),
        imageUrl: fd.get('imageUrl'),
        altText: fd.get('altText'),
        category: fd.get('category'),
        description: fd.get('description'),
      }),
    })

    if (res.ok) {
      router.push('/admin/artwork')
    } else {
      const data = await res.json()
      setError(data.error ?? 'Something went wrong')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="space-y-1">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={artwork.title} required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          name="category"
          defaultValue={artwork.category}
          required
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input id="imageUrl" name="imageUrl" type="url" defaultValue={artwork.imageUrl} required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="altText">Alt text</Label>
        <Input id="altText" name="altText" defaultValue={artwork.altText ?? ''} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={3} defaultValue={artwork.description ?? ''} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving…' : 'Save changes'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
