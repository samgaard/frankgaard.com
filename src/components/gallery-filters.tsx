'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const CATEGORIES = ['Portraits', 'Pictures', 'Installations', 'Notebooks'] as const
const PER_PAGE_OPTIONS = [24, 48, 96] as const

export function GalleryFilters({
  activeCategory,
  perPage,
}: {
  activeCategory: string | null
  perPage: number
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page')
    router.push(`/gallery?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={activeCategory ?? ''}
        onChange={(e) => updateParam('category', e.target.value || null)}
        className="text-sm border rounded px-3 py-1.5 bg-background"
      >
        <option value="">All categories</option>
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      <select
        value={perPage}
        onChange={(e) => updateParam('perPage', e.target.value)}
        className="text-sm border rounded px-3 py-1.5 bg-background"
      >
        {PER_PAGE_OPTIONS.map((n) => (
          <option key={n} value={n}>{n} per page</option>
        ))}
      </select>
    </div>
  )
}
