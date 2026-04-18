'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import Image from 'next/image'

const CATEGORIES = ['Portraits', 'Pictures', 'Installations', 'Notebooks'] as const

export default function NewArtworkPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const fd = new FormData(e.currentTarget)

    const res = await fetch('/api/admin/artwork', {
      method: 'POST',
      body: fd,
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
    <div className="max-w-lg space-y-6">
      <h1 className="font-semibold text-2xl">Add Artwork</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="space-y-1">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            name="category"
            required
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="image">Image</Label>
          <Input
            id="image"
            name="image"
            type="file"
            accept="image/*"
            required
            onChange={handleFileChange}
          />
          {preview && (
            <div className="relative mt-2 aspect-square w-40 overflow-hidden rounded-md bg-muted">
              <Image src={preview} alt="Preview" fill className="object-cover" />
            </div>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="altText">Alt text</Label>
          <Input id="altText" name="altText" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" rows={3} />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Uploading…' : 'Save artwork'}
        </Button>
      </form>
    </div>
  )
}
