'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function DeleteButton({ id, type }: { id: number | string; type: 'artwork' | 'post' }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    const url = type === 'artwork' ? `/api/admin/artwork/${id}` : `/api/admin/posts/${id}`
    await fetch(url, { method: 'DELETE' })
    router.refresh()
    setLoading(false)
    setConfirming(false)
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <Button size="sm" variant="destructive" onClick={handleDelete} disabled={loading}>
          {loading ? '…' : 'Confirm'}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
          Cancel
        </Button>
      </div>
    )
  }

  return (
    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setConfirming(true)}>
      Delete
    </Button>
  )
}
