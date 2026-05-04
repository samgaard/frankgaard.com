'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { BoldIcon, ItalicIcon, ListIcon } from 'lucide-react'
import Image from 'next/image'

export default function NewPostPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [previews, setPreviews] = useState<string[]>([])

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit],
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none min-h-[300px] focus:outline-none text-black',
      },
    },
  })

  function generateSlug(title: string) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    setPreviews(files.map((f) => URL.createObjectURL(f)))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const fd = new FormData(e.currentTarget)
    const title = fd.get('title') as string
    fd.set('slug', generateSlug(title))
    fd.set('body', editor?.getHTML() ?? '')

    const res = await fetch('/api/admin/posts', {
      method: 'POST',
      body: fd,
    })

    if (res.ok) {
      router.push('/admin')
    } else {
      const data = await res.json()
      setError(data.error ?? 'Something went wrong')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-semibold text-2xl">New Post</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="space-y-1">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required />
        </div>

        <div className="space-y-1">
          <Label>Body</Label>
          <div className="border rounded-md overflow-hidden">
            <div className="flex gap-1 border-b px-2 py-1 bg-muted/50">
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                className={`p-1.5 rounded hover:bg-muted transition-colors ${editor?.isActive('bold') ? 'bg-muted' : ''}`}
              >
                <BoldIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                className={`p-1.5 rounded hover:bg-muted transition-colors ${editor?.isActive('italic') ? 'bg-muted' : ''}`}
              >
                <ItalicIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                className={`p-1.5 rounded hover:bg-muted transition-colors ${editor?.isActive('bulletList') ? 'bg-muted' : ''}`}
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
          <Label htmlFor="images">Images <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Input
            id="images"
            name="images"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFilesChange}
          />
          {previews.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {previews.map((src, i) => (
                <div key={i} className="relative w-24 h-24 rounded-md overflow-hidden bg-muted">
                  <Image src={src} alt={`Preview ${i + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? 'Saving…' : 'Publish post'}
        </Button>
      </form>
    </div>
  )
}
