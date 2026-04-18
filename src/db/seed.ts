import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const client = postgres(process.env.DATABASE_URL!)
const db = drizzle(client, { schema })

const categories = ['Portraits', 'Pictures', 'Installations', 'Notebooks'] as const

const artworkTitles = [
  'Untitled #1', 'Red Figure', 'Blue Study', 'Portrait of a Friend', 'Self Portrait',
  'Night Scene', 'The Garden', 'Abstract Form', 'Face in Shadow', 'Morning Light',
  'Composition I', 'Composition II', 'Composition III', 'Figure in Space', 'Head Study',
  'The Room', 'Landscape', 'Still Life', 'Green Figure', 'Yellow Study',
  'Portrait with Hat', 'Two Figures', 'Interior', 'Exterior View', 'Dark Field',
  'Bright Field', 'The Window', 'Street Scene', 'The Table', 'Figure on Ground',
]

const descriptions = [
  'Oil on canvas, 2019.',
  'Acrylic on paper, 2021.',
  null,
  'Mixed media, 2020.',
  null,
  'Ink and watercolor, 2022.',
  null,
  'Oil on panel, 2018.',
  null,
  'Acrylic and collage, 2023.',
]

const blogTitles = [
  'Notes on painting',
  'A visit to the studio',
  'Working in series',
  'On color',
  'Some thoughts on abstraction',
  'Recent work',
  'Things I\'ve been looking at',
  'New paintings',
  'Back to portraits',
  'Drawings from the notebook',
  'Process notes',
  'On making pictures',
]

const blogBodies = [
  '<p>Been working on a new series of portraits lately. There\'s something about returning to the face — it never gets old. The challenge is always finding something new to say with such a familiar subject.</p><p>Started using a wider brush this week. The results are looser, more energetic. Maybe that\'s the direction.</p>',
  '<p>Spent the afternoon in the studio reorganizing. Sometimes you need to see everything laid out before you can move forward. Found some old canvases I\'d forgotten about — one of them might be worth finishing.</p>',
  '<p>Working in series forces you to commit. You can\'t just make one painting and declare it done — you have to keep pushing the idea until it either exhausts itself or opens into something new.</p><p>Right now I\'m about twelve paintings into a group of figures. Not sure where it ends.</p>',
  '<p>The color question never goes away. I\'ve been limiting my palette this month — just three or four colors — and the work feels more focused. Maybe constraints are what I need.</p>',
  '<p>Someone asked me yesterday whether I consider myself an abstract painter. I didn\'t have a good answer. The work starts with something real — a face, a room, a figure — and then things happen. Call it what you want.</p>',
  '<p>New batch of paintings finished this week. Eighteen in total, which is more than I expected going in. Some are stronger than others, but that\'s always the case.</p><p>A few of them are going to a show in the fall. More details soon.</p>',
  '<p>Been looking at a lot of Guston lately. Also some Bonnard. Completely different painters but both obsessed with their own world — their own vocabulary of forms. That\'s what I\'m after.</p>',
  '<p>Eight new paintings on the wall. Standing back and looking at them together, I can see a direction I didn\'t know I was taking. That\'s usually how it works.</p>',
  '<p>Came back to portraits after a year of working more abstractly. The figure pulls me back eventually. It always does. There\'s a conversation with the history of painting that you can\'t avoid when you put a face on the canvas.</p>',
  '<p>Filled another notebook this week. I draw every day, usually in the morning before I go to the studio. The drawings don\'t always connect to the paintings — they\'re more like thinking out loud.</p>',
  '<p>Someone asked about my process. Honestly, it varies. Sometimes I know what I\'m making before I start. More often I don\'t find out until I\'m well into it. The painting tells you what it needs.</p>',
  '<p>What does it mean to make a picture in 2024? I think about this more than I probably should. In the end you just go to the studio and do the work. The questions answer themselves over time.</p>',
]

async function seed() {
  console.log('Clearing existing data...')
  await db.delete(schema.artworks)
  await db.delete(schema.posts)

  console.log('Seeding artworks...')
  const artworkRows = artworkTitles.map((title, i) => ({
    title,
    imageUrl: `https://picsum.photos/seed/${i + 1}/800/1000`,
    altText: title,
    category: categories[i % categories.length],
    description: descriptions[i % descriptions.length],
  }))
  await db.insert(schema.artworks).values(artworkRows)

  console.log('Seeding posts...')
  const postRows = blogTitles.map((title, i) => ({
    title,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    body: blogBodies[i % blogBodies.length],
    images: [] as string[],
  }))
  await db.insert(schema.posts).values(postRows)

  console.log(`Done — ${artworkRows.length} artworks, ${postRows.length} posts`)
  await client.end()
}

seed().catch((e) => { console.error(e); process.exit(1) })
