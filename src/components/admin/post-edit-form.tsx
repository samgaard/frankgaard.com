'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { XIcon, BoldIcon, ItalicIcon, ListIcon } from 'lucide-react'
import type { posts } from '@/db/schema'
import type { InferSelectModel } from 'drizzle-orm'

type Post = InferSelectModel<typeof posts>

export function PostEditForm({ post }: { post: Post }) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [keepImages, setKeepImages] = useState<string[]>(post.images ?? [])
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit],
    content: post.body,
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none min-h-[300px] focus:outline-none text-black',
      },
    },
  })

  function addFiles(files: FileList | null) {
    if (!files) return
    const arr = Array.from(files)
    setNewFiles(prev => [...prev, ...arr])
    arr.forEach(f => {
      const url = URL.createObjectURL(f)
      setNewPreviews(prev => [...prev, url])
    })
  }

  function removeKeep(url: string) {
    if (!window.confirm('Remove this image from the post? This will take effect when you save.')) return
    setKeepImages(prev => prev.filter(u => u !== url))
  }

  function removeNew(index: number) {
    setNewFiles(prev => prev.filter((_, i) => i !== index))
    setNewPreviews(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const fd = new FormData(e.currentTarget)
    fd.set('body', editor?.getHTML() ?? '')
    keepImages.forEach(url => fd.append('images', url))
    newFiles.forEach(f => fd.append('newImages', f))

    const res = await fetch(`/api/admin/posts/${post.slug}`, {
      method: 'PATCH',
      body: fd,
    })

    if (res.ok) {
      router.push(`/blog/${post.slug}`)
      router.refresh()
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
        <Input id="title" name="title" defaultValue={post.title} required />
      </div>

      <div className="space-y-1">
        <Label>Slug</Label>
        <p className="text-sm text-muted-foreground font-mono">/{post.slug}</p>
      </div>

      <div className="space-y-1">
        <Label>Body</Label>
        <div className="border rounded-md overflow-hidden">
          <div className="flex gap-1 border-b px-2 py-1 bg-muted/50">
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={`p-1.5 rounded hover:bg-muted transition-colors cursor-pointer ${editor?.isActive('bold') ? 'bg-muted' : ''}`}
            >
              <BoldIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={`p-1.5 rounded hover:bg-muted transition-colors cursor-pointer ${editor?.isActive('italic') ? 'bg-muted' : ''}`}
            >
              <ItalicIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className={`p-1.5 rounded hover:bg-muted transition-colors cursor-pointer ${editor?.isActive('bulletList') ? 'bg-muted' : ''}`}
            >
              <ListIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="px-3 py-2">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Images</Label>
        {(keepImages.length > 0 || newPreviews.length > 0) && (
          <div className="grid grid-cols-3 gap-2">
            {keepImages.map(url => (
              <div key={url} className="relative aspect-square">
                <Image src={url} alt="" fill className="object-cover rounded-md" sizes="33vw" />
                <button
                  type="button"
                  onClick={() => removeKeep(url)}
                  className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80 transition-colors cursor-pointer"
                  title="Remove image from post"
                >
                  <XIcon className="h-3 w-3" />
                </button>
              </div>
            ))}
            {newPreviews.map((url, i) => (
              <div key={url} className="relative aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-full h-full object-cover rounded-md" />
                <button
                  type="button"
                  onClick={() => removeNew(i)}
                  className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80 transition-colors cursor-pointer"
                  title="Remove image from post"
                >
                  <XIcon className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => addFiles(e.target.files)}
        />
        <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
          Add images
        </Button>
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
