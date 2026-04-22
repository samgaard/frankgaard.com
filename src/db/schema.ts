import { pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core'

export const settings = pgTable('settings', {
  key: varchar('key', { length: 255 }).primaryKey(),
  value: text('value'),
})

export const artworks = pgTable('artworks', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).unique(),
  imageUrl: text('image_url').notNull(),
  altText: text('alt_text'),
  category: varchar('category', { length: 100 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  body: text('body').notNull(),
  images: text('images').array(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
