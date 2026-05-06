import Link from 'next/link'
import { db } from '@/db'
import { posts } from '@/db/schema'
import { desc, count } from 'drizzle-orm'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, type SessionData } from '@/lib/auth'
import { buttonVariants } from '@/components/ui/button'
import { PostPreview } from '@/components/post-preview'

const PER_PAGE = 20

function pageHref(p: number) {
  return p === 1 ? '/blog' : `/blog?page=${p}`
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

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const offset = (page - 1) * PER_PAGE

  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
  const isLoggedIn = session.isLoggedIn === true

  const [totalResult, pagePosts] = await Promise.all([
    db.select({ count: count() }).from(posts),
    db.select().from(posts).orderBy(desc(posts.createdAt)).limit(PER_PAGE).offset(offset),
  ])

  const total = totalResult[0].count
  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-semibold text-2xl">Latest blog posts</h1>
          {isLoggedIn && (
            <Link href="/admin/posts/new" className={buttonVariants({ size: 'sm' })}>+ New post</Link>
          )}
        </div>
        <a href="/blog/rss.xml" className="text-muted-foreground hover:text-foreground transition-colors" title="RSS feed">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19.01 7.38 20 6.18 20C4.98 20 4 19.01 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z"/></svg>
        </a>
      </div>
      {pagePosts.length === 0 && (
        <p className="text-muted-foreground text-sm">No posts yet.</p>
      )}
      <div className="space-y-6">
        {pagePosts.map((post) => (
          <PostPreview key={post.id} post={post} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-1 pt-2">
          {page > 1 && (
            <Link href={pageHref(page - 1)} className="px-3 py-1 text-sm rounded border hover:bg-muted transition-colors">←</Link>
          )}
          {pageNumbers(page, totalPages).map((p, i) =>
            p === '...' ? (
              <span key={`ellipsis-${i}`} className="px-2 text-sm text-muted-foreground">…</span>
            ) : (
              <Link
                key={p}
                href={pageHref(p as number)}
                className={`px-3 py-1 text-sm rounded border transition-colors ${
                  p === page ? 'bg-foreground text-background' : 'hover:bg-muted'
                }`}
              >
                {p}
              </Link>
            )
          )}
          {page < totalPages && (
            <Link href={pageHref(page + 1)} className="px-3 py-1 text-sm rounded border hover:bg-muted transition-colors">→</Link>
          )}
        </div>
      )}
    </div>
  )
}
