import Link from 'next/link'
import Image from 'next/image'

type Post = {
  slug: string
  title: string
  body: string
  createdAt: Date
  images?: string[] | null
}

function excerpt(html: string, maxLength = 160): string {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).replace(/\s\S*$/, '') + '…'
}

export function PostPreview({ post }: { post: Post }) {
  return (
    <article>
      <Link href={`/blog/${post.slug}`} className="group grid grid-cols-1 sm:grid-cols-4 gap-4 items-start">
        <div className="sm:col-span-3 space-y-1 min-w-0">
          <p className="text-xs text-muted-foreground">
            {new Date(post.createdAt).toLocaleDateString('en-US', {
              month: 'numeric',
              day: 'numeric',
              year: '2-digit',
            })}
          </p>
          <h2 className="font-semibold text-lg group-hover:underline">{post.title}</h2>
          <p className="text-base text-foreground">{excerpt(post.body)}</p>
        </div>
        {post.images && post.images.length > 0 ? (
          <div className="sm:col-span-1 flex gap-1 h-20 sm:justify-end">
            {post.images.slice(0, 3).map((url, i) => (
              <div key={i} className="relative w-20 h-20 shrink-0 rounded overflow-hidden bg-muted">
                <Image src={url} alt="" fill className="object-cover" />
              </div>
            ))}
          </div>
        ) : (
          <div className="hidden sm:block sm:col-span-1" />
        )}
      </Link>
    </article>
  )
}
