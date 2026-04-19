import Link from 'next/link'
import type { Metadata } from 'next'
import { db } from '@/db'
import { artworks } from '@/db/schema'
import { eq, count } from 'drizzle-orm'
import { GalleryGrid } from '@/components/gallery-grid'
import { GalleryFilters } from '@/components/gallery-filters'

export const metadata: Metadata = {
  title: `Gallery — ${process.env.NEXT_PUBLIC_SITE_NAME ?? ''}`.replace(/ — $/, ''),
  openGraph: {
    siteName: process.env.NEXT_PUBLIC_SITE_NAME,
  },
}

const CATEGORIES = ['Portraits', 'Pictures', 'Installations', 'Notebooks'] as const
const PER_PAGE_OPTIONS = [24, 48, 96] as const
const DEFAULT_PER_PAGE = 24

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string; perPage?: string }>
}) {
  const { category, page: pageParam, perPage: perPageParam } = await searchParams

  const activeCategory = CATEGORIES.find((c) => c === category) ?? null
  const perPage = PER_PAGE_OPTIONS.find((n) => n === Number(perPageParam)) ?? DEFAULT_PER_PAGE
  const page = Math.max(1, Number(pageParam) || 1)
  const offset = (page - 1) * perPage

  const where = activeCategory ? eq(artworks.category, activeCategory) : undefined

  const [totalResult, items] = await Promise.all([
    db.select({ count: count() }).from(artworks).where(where),
    db.select().from(artworks).where(where).orderBy(artworks.createdAt).limit(perPage).offset(offset),
  ])

  const total = totalResult[0].count
  const totalPages = Math.ceil(total / perPage)

  return (
    <div className="space-y-6">
      <GalleryFilters activeCategory={activeCategory} perPage={perPage} />

      {items.length === 0 && (
        <p className="text-muted-foreground text-sm">No artwork found.</p>
      )}

      <GalleryGrid artworks={items} priorityCount={8} />

      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} category={activeCategory} perPage={perPage} />
      )}
    </div>
  )
}

function pageHref(p: number, category: string | null, perPage: number) {
  const q = new URLSearchParams()
  if (category) q.set('category', category)
  if (perPage !== DEFAULT_PER_PAGE) q.set('perPage', String(perPage))
  if (p > 1) q.set('page', String(p))
  const qs = q.toString()
  return `/gallery${qs ? `?${qs}` : ''}`
}

function pageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '...')[] = [1]
  if (current > 3) pages.push('...')
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    pages.push(p)
  }
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
}

function Pagination({ page, totalPages, category, perPage }: {
  page: number
  totalPages: number
  category: string | null
  perPage: number
}) {
  return (
    <div className="flex items-center justify-center gap-1 pt-4">
      {page > 1 && (
        <Link href={pageHref(page - 1, category, perPage)} className="px-3 py-1 text-sm rounded border hover:bg-muted transition-colors">←</Link>
      )}
      {pageNumbers(page, totalPages).map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-sm text-muted-foreground">…</span>
        ) : (
          <Link
            key={p}
            href={pageHref(p, category, perPage)}
            className={`px-3 py-1 text-sm rounded border transition-colors ${
              p === page ? 'bg-foreground text-background' : 'hover:bg-muted'
            }`}
          >
            {p}
          </Link>
        )
      )}
      {page < totalPages && (
        <Link href={pageHref(page + 1, category, perPage)} className="px-3 py-1 text-sm rounded border hover:bg-muted transition-colors">→</Link>
      )}
    </div>
  )
}
