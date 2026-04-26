import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Allow major search engines full access
        userAgent: ['Googlebot', 'Bingbot', 'DuckDuckBot', 'Slurp'],
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
      {
        // Block known AI scrapers and aggressive bots
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'Google-Extended',
          'CCBot',
          'anthropic-ai',
          'ClaudeBot',
          'AhrefsBot',
          'SemrushBot',
          'MJ12bot',
          'DotBot',
          'BLEXBot',
          'PetalBot',
        ],
        disallow: '/',
      },
      {
        // Everyone else: allow public pages but not admin/api
        userAgent: '*',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: 'https://frankgaard.com/sitemap.xml',
  }
}
