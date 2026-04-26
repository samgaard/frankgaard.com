import { MetadataRoute } from 'next'
import { db } from '@/db'
import { posts } from '@/db/schema'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const allPosts = await db.select({ slug: posts.slug, createdAt: posts.createdAt }).from(posts)

  const postEntries: MetadataRoute.Sitemap = allPosts.map((post) => ({
    url: `https://frankgaard.com/blog/${post.slug}`,
    lastModified: post.createdAt,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [
    {
      url: 'https://frankgaard.com',
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://frankgaard.com/gallery',
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: 'https://frankgaard.com/blog',
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://frankgaard.com/contact',
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    ...postEntries,
  ]
}
