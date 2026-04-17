# frankgaard.com — Claude context

Artist portfolio and blog for Frank Gaard. Rebuilt from Drupal 8 on GoDaddy.
This project is maintained primarily via Claude Code — keep the codebase conventional and avoid clever abstractions.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15, App Router, TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui (New York style) |
| Database | Supabase (Postgres) via Drizzle ORM |
| Image storage | Cloudflare R2 (Phase 2 — not yet wired up) |
| Auth | iron-session, single user, env-var credentials |
| Hosting | Vercel (not yet deployed — local dev only) |
| Package manager | pnpm |

## Design principles

- Art-forward: images are the main visual component, UI should get out of the way
- Use shadcn/ui defaults — avoid custom design system work
- Low-budget site: no over-engineering, no clever abstractions
- Keep pages conventional so Claude can work on them easily in future sessions

## Project structure

```
src/
  app/
    (public)/         # public-facing routes share layout
      gallery/        # /gallery — all artwork by category
      blog/           # /blog — blog index
        [slug]/       # /blog/[slug] — individual post
    admin/            # protected, iron-session auth check in layout
      login/          # /admin/login
      artwork/new/    # upload new artwork
      posts/new/      # write new post
    api/
      auth/login/     # POST — set session cookie
      auth/logout/    # POST — destroy session
    page.tsx          # homepage: carousel + gallery preview + recent posts
  db/
    schema.ts         # Drizzle schema (artworks, posts)
    index.ts          # postgres client + drizzle instance
  lib/
    auth.ts           # iron-session config + SessionData type
    utils.ts          # shadcn cn() helper
  components/
    ui/               # shadcn components (copied in, editable)
```

## Data models

### artworks
- `id`, `title`, `image_url` (R2 URL), `alt_text`, `category`, `description` (HTML), `created_at`
- Categories: Portraits, Pictures, Installations, Notebooks

### posts
- `id`, `title`, `slug`, `body` (HTML), `images` (text array of URLs), `created_at`

## Auth

Single-user auth via iron-session. Credentials are env vars — no user table.
Both Frank (day-to-day) and Sam (occasional admin help) use the same credentials.

```
ADMIN_EMAIL=...
ADMIN_PASSWORD=...
SESSION_SECRET=...   # 32-char random string, generate: openssl rand -base64 32
```

Admin routes check `session.isLoggedIn` — redirect to `/admin/login` if false.

## Environment variables

Copy `.env.local.example` → `.env.local` and fill in values.

```
DATABASE_URL         # Supabase connection string (pooled)
SESSION_SECRET       # Random 32-char string for iron-session encryption
ADMIN_EMAIL          # Single admin login email
ADMIN_PASSWORD       # Single admin login password
R2_ACCOUNT_ID        # Phase 2
R2_ACCESS_KEY_ID     # Phase 2
R2_SECRET_ACCESS_KEY # Phase 2
R2_BUCKET_NAME       # Phase 2
R2_PUBLIC_URL        # Phase 2
```

## Database commands

```bash
pnpm db:generate   # generate migration SQL from schema changes
pnpm db:migrate    # apply migrations to DB
pnpm db:studio     # open Drizzle Studio (visual DB browser)
```

## shadcn components installed

button, card, badge, carousel, dialog, navigation-menu, input, textarea, label, separator

Add more: `pnpm dlx shadcn@latest add <component-name>`

## Key pages to build (Phase 1)

- `app/page.tsx` — Homepage: rotating carousel of artwork, gallery preview by category, recent blog posts
- `app/(public)/gallery/page.tsx` — Gallery index filtered by category (tabs or dropdown)
- `app/(public)/blog/page.tsx` — Blog index, paginated, reverse-chron
- `app/(public)/blog/[slug]/page.tsx` — Blog post, HTML body, attached images
- `app/admin/login/page.tsx` — Login form (email + password)
- `app/admin/artwork/new/page.tsx` — Upload artwork: title, category, image, description
- `app/admin/posts/new/page.tsx` — Write post: title, slug, body (HTML or markdown)
- `app/admin/layout.tsx` — Auth guard: redirect to login if no session

## Migration context (Phase 2)

Content being migrated from Drupal 8 MySQL database `i1631801_drup3` (table prefix `drup_`).
Docker container `drupal-local` runs locally with the DB available.

Counts: 385 photos across 4 categories, 227 blog posts, ~234 MB of images.
Images are in Drupal's `public://photos/` and will be uploaded to Cloudflare R2.

Migration scripts will read from the local Docker DB and insert into Supabase via Drizzle.

## Infrastructure (to set up)

- [ ] Supabase project — get `DATABASE_URL` (use pooled connection string)
- [ ] Cloudflare account + R2 bucket `frankgaard-images` (Phase 2)
- [ ] Vercel project — connect GitHub repo `github.com/samgaard/frankgaard.com` (Phase 3)
- [ ] DNS: update GoDaddy to point frankgaard.com → Vercel (Phase 3)

## Live site reference

https://frankgaard.com — current Drupal site. Nav: Home, Gallery (with category filter dropdown), Blog.
Homepage has a horizontal carousel of portrait thumbnails, gallery sections below, blog at bottom.
