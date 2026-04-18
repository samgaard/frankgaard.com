'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { BoldIcon, ItalicIcon, ListIcon } from 'lucide-react'

export default function NewPostPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit],
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[300px] focus:outline-none',
      },
    },
  })

  function generateSlug(title: string) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const title = fd.get('title') as string

    const res = await fetch('/api/admin/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        slug: fd.get('slug') || generateSlug(title),
        body: editor?.getHTML() ?? '',
      }),
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
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" placeholder="auto-generated from title if blank" />
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
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving…' : 'Publish post'}
        </Button>
      </form>
    </div>
  )
}
