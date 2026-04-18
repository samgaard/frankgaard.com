/**
 * Migration script: Drupal 8 → Supabase + Cloudflare R2
 *
 * Run dry run first:  pnpm db:migrate-drupal:dry
 * Full migration:     pnpm db:migrate-drupal
 * Posts only:        pnpm db:migrate-drupal --posts-only
 */

import 'dotenv/config'
import mysql from 'mysql2/promise'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'
import { uploadToR2 } from '../lib/r2'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'
import { randomUUID } from 'crypto'

const DOWNLOADS_DIR = join(homedir(), 'Downloads')
const DRY_RUN = process.argv.includes('--dry-run')
const POSTS_ONLY = process.argv.includes('--posts-only')

async function migrateArtworks(drupal: mysql.Connection, db: ReturnType<typeof drizzle>) {
  console.log('📸 Fetching photo nodes from Drupal...')
  const [photos] = await drupal.execute(`
    SELECT
      n.nid, n.title, n.created,
      f.filename, f.filemime,
      t.name AS category,
      p.field_photo_alt AS alt_text,
      fd.field_description_value AS description
    FROM drup_node_field_data n
    JOIN drup_node__field_photo p ON p.entity_id = n.nid
    JOIN drup_file_managed f ON f.fid = p.field_photo_target_id
    JOIN drup_node__field_gallery g ON g.entity_id = n.nid
    JOIN drup_taxonomy_term_field_data t ON t.tid = g.field_gallery_target_id
    LEFT JOIN drup_node__field_description fd ON fd.entity_id = n.nid
    WHERE n.type = 'photo' AND n.status = 1
    ORDER BY n.created ASC
  `) as [any[], any]

  console.log(`Found ${photos.length} photos\n`)
  let ok = 0, skipped = 0

  for (const photo of photos) {
    const localPath = join(DOWNLOADS_DIR, photo.filename)
    if (!existsSync(localPath)) {
      console.warn(`  ⚠️  Missing: ${photo.filename}`)
      skipped++
      continue
    }
    if (!DRY_RUN) {
      const ext = (photo.filename.split('.').pop() ?? 'jpg').toLowerCase()
      const key = `artwork/${randomUUID()}.${ext}`
      const buffer = await readFile(localPath)
      const imageUrl = await uploadToR2(buffer, key, photo.filemime || 'image/jpeg')
      await db.insert(schema.artworks).values({
        title: photo.title,
        imageUrl,
        altText: photo.alt_text || photo.title,
        category: photo.category,
        description: photo.description || null,
        createdAt: new Date(photo.created * 1000),
      })
    }
    ok++
    if (ok % 20 === 0) console.log(`  ✓ ${ok}/${photos.length} artworks`)
  }
  console.log(`\n✅ Artworks: ${ok} migrated, ${skipped} skipped\n`)
}

async function migratePosts(drupal: mysql.Connection, db: ReturnType<typeof drizzle>) {
  console.log('📝 Fetching blog posts from Drupal...')
  const [posts] = await drupal.execute(`
    SELECT
      n.nid, n.title, n.created,
      SUBSTRING_INDEX(pa.alias, '/', -1) AS slug,
      b.field_blog_body_value AS body
    FROM drup_node_field_data n
    JOIN drup_node__field_blog_body b ON b.entity_id = n.nid
    LEFT JOIN drup_path_alias pa ON pa.path = CONCAT('/node/', n.nid)
    WHERE n.type = 'blog' AND n.status = 1
    ORDER BY n.created ASC
  `) as [any[], any]

  const [blogImages] = await drupal.execute(`
    SELECT fi.entity_id as nid, f.filename, f.filemime, f.uri
    FROM drup_node__field_images fi
    JOIN drup_file_managed f ON f.fid = fi.field_images_target_id
    WHERE fi.bundle = 'blog'
    ORDER BY fi.entity_id, fi.delta
  `) as [any[], any]

  const imagesByNid = new Map<number, any[]>()
  for (const img of blogImages) {
    if (!imagesByNid.has(img.nid)) imagesByNid.set(img.nid, [])
    imagesByNid.get(img.nid)!.push(img)
  }

  console.log(`Found ${posts.length} posts (${imagesByNid.size} have images)\n`)
  let ok = 0, skipped = 0

  for (const post of posts) {
    const slug = post.slug || post.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 200)

    const imageUrls: string[] = []
    if (!DRY_RUN) {
      for (const img of imagesByNid.get(post.nid) ?? []) {
        // URI is e.g. public://photos/file.jpg or public://2019-01/file.jpg
        const uriPath = img.uri.replace('public://', '')
        const localPath = existsSync(join(DOWNLOADS_DIR, uriPath))
          ? join(DOWNLOADS_DIR, uriPath)
          : join(DOWNLOADS_DIR, img.filename)
        if (!existsSync(localPath)) {
          console.warn(`  ⚠️  Missing blog image: ${img.filename} (${uriPath})`)
          continue
        }
        const ext = (img.filename.split('.').pop() ?? 'jpg').toLowerCase()
        const key = `blog/${randomUUID()}.${ext}`
        const buffer = await readFile(localPath)
        imageUrls.push(await uploadToR2(buffer, key, img.filemime || 'image/jpeg'))
      }

      try {
        await db.insert(schema.posts).values({
          title: post.title, slug, body: post.body,
          images: imageUrls, createdAt: new Date(post.created * 1000),
        })
        ok++
      } catch (e: any) {
        if (e.message?.includes('unique') || e.message?.includes('duplicate')) {
          await db.insert(schema.posts).values({
            title: post.title, slug: `${slug}-${post.nid}`, body: post.body,
            images: imageUrls, createdAt: new Date(post.created * 1000),
          })
          ok++
        } else {
          console.warn(`  ⚠️  Post "${post.title}": ${e.message}`)
          skipped++
        }
      }
    } else {
      ok++
    }
  }
  console.log(`✅ Posts: ${ok} migrated, ${skipped} skipped\n`)
}

async function main() {
  if (DRY_RUN) console.log('🔍 DRY RUN — no data will be written\n')

  const drupal = await mysql.createConnection({
    host: '127.0.0.1', port: 3306,
    user: 'root', password: 'root',
    database: 'i1631801_drup3',
  })
  const pgClient = postgres(process.env.DATABASE_URL!)
  const db = drizzle(pgClient, { schema })

  if (POSTS_ONLY) {
    console.log('⚡ Posts-only mode — clearing existing posts...')
    if (!DRY_RUN) await db.delete(schema.posts)
    await migratePosts(drupal, db)
  } else {
    await migrateArtworks(drupal, db)
    await migratePosts(drupal, db)
  }

  await drupal.end()
  await pgClient.end()
  console.log('🎉 Migration complete!')
}

main().catch((e) => { console.error(e); process.exit(1) })
