import { cache } from 'react'
import { db } from '@/db'
import { settings } from '@/db/schema'
import { eq } from 'drizzle-orm'

export const getSetting = cache(async (key: string): Promise<string | null> => {
  const [row] = await db.select().from(settings).where(eq(settings.key, key)).limit(1)
  return row?.value ?? null
})

export async function getSiteName(): Promise<string> {
  return (await getSetting('site_name')) ?? 'Gallery'
}
