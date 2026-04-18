# frankgaard.com — rebuild project

## Overview
Replacing a Drupal 8.9.20 site hosted on GoDaddy with a modern stack.
The site is a gallery and blog for artist Frank Gaard.

**Live site:** https://frankgaard.com  
**Current stack:** Drupal 8.9.20, PHP (legacy), GoDaddy shared hosting (~$25/mo)  
**Current cost problem:** GoDaddy no longer supporting this Drupal/PHP version, premium fee ongoing

---

## Decisions made

| Decision | Choice | Notes |
|---|---|---|
| Stack | Next.js + shadcn/ui | Vercel for hosting, SSG for gallery/blog pages |
| Image storage | Cloudflare R2 | Free egress, S3-compatible, ~free for this site's volume |
| Database | Postgres via Neon or Supabase | Free tier, Vercel-compatible |
| Hosting | Vercel Pro | $20/mo, covers all projects under one account |
| Domain registrar | Stay on GoDaddy | Keep as registrar, just update DNS to Vercel |
| SSL | Vercel managed | Included in Pro, auto-renewed, no manual cert work |
| Admin UI | Custom via shadcn | Simple as possible for non-technical user (Frank) |

**Rejected options:**
- Drupal 10/11 upgrade — escaping the CMS upgrade treadmill
- WordPress — viable fallback but not preferred
- Rails on Render — good option, Next.js edged it out for SSG/Vercel DX
- Squarespace/Format — vendor lock-in concern

---

## Architecture notes

- Gallery and blog pages pre-rendered as static HTML via Next.js SSG
- On new content publish, affected pages regenerate and push to Vercel CDN edge
- Images stored on Cloudflare R2, served via Cloudflare CDN (not Vercel bandwidth)
- Admin UI protected by auth (single user — Frank), minimal UI: upload + title + category for art, title + body for posts
- No ecommerce, no user accounts, no comments

---

## Content types (confirmed via DB recon)

**Database:** `i1631801_drup3` — table prefix `drup_`  
**Recon completed:** April 2026 using Claude Code against local Docker MySQL instance

### Confirmed content counts

| Type | Count | Notes |
|---|---|---|
| `photo` | 385 | Main gallery images |
| `blog` | 227 | Blog posts |
| `page` | 1 | "Welcome to FrankGaard.com" home page |

### Photo categories (taxonomy)

| Category | Count |
|---|---|
| Portraits | 148 |
| Pictures | 121 |
| Installations | 65 |
| Notebooks | 51 |
| **Total** | **385** |

### File inventory

| Type | Count | Size |
|---|---|---|
| JPEG | 633 | ~222 MB |
| PNG | 11 | ~12 MB |
| **Total** | **644** | **~234 MB** |

All files stored under `public://photos/` in Drupal's file system. Fits comfortably in Cloudflare R2 free tier.

### Confirmed data models

**Photo node fields:**
- `field_photo` — single image file with alt text, width, height
- `field_gallery` — taxonomy term (category)
- `field_description` — optional caption/description (HTML)
- `field_year` — exists but unused (0 rows)

**Blog node fields:**
- `field_blog_body_value` — rich HTML body content
- `field_images` — optional multi-value inline image attachments
- URL slugs via `drup_path_alias` → `/blog/<slug>`

### Final data models for Next.js

- `Artwork` — title, image (R2 url), alt_text, category, description, created_at
- `Post` — title, body (HTML), slug, images (array), created_at

---

## Checklist

### Phase 0 — Reconnaissance ✅ Complete
- [x] Export Drupal MySQL database from GoDaddy (phpMyAdmin)
- [x] Load locally (Docker + MySQL 8)
- [x] Identify correct database among multiple GoDaddy projects in export (`i1631801_drup3`)
- [x] Run inventory queries via Claude Code
- [x] Audit taxonomy terms — 4 categories confirmed (Portraits, Pictures, Installations, Notebooks)
- [x] Confirm total image count and storage size (644 files, ~234 MB)

**Notes from recon:**
- SQL export contained 3 separate GoDaddy project databases — budget tracker, MTG card database, and Frank's site
- Frank's DB identified by `fgaard_subtheme` references
- Table prefix is `drup_` (not standard `drupal_`)
- `field_year` exists on photo nodes but is entirely unused — skip in migration
- Blog posts are rich personal writing — HTML body, some with attached images
- Docker container `drupal-local` still running locally with DB available for migration scripts

**Inventory queries (updated for drup_ prefix):**
```sql
SELECT type, COUNT(*) as count FROM drup_node_field_data WHERE status = 1 GROUP BY type;
SELECT COUNT(*) as total_files, ROUND(SUM(filesize)/1024/1024, 1) as total_mb FROM drup_file_managed;
SELECT t.name, COUNT(*) as count FROM drup_node__field_gallery g
JOIN drup_taxonomy_term_field_data t ON t.tid = g.field_gallery_target_id GROUP BY t.name;
```

---

### Phase 1 — Build
- [x] Scaffold Next.js project (TypeScript, Tailwind, shadcn) — Next.js 15, pnpm, shadcn New York style
- [x] Set up Postgres database (Supabase local via Docker — cloud setup deferred to Phase 3)
- [ ] Set up Cloudflare R2 bucket
- [x] Define schema — Artwork and Post models — `src/db/schema.ts`
- [x] Build public gallery index page — `/gallery`, category filter, lightbox
- [ ] Build public gallery detail page (SSG) — covered by lightbox, may not need separate page
- [x] Build public blog index page — `/blog`
- [x] Build public blog post page — `/blog/[slug]`
- [x] Build admin auth (simple — single user, iron-session, env-var credentials)
- [x] Build admin: upload artwork form — `/admin/artwork/new`
- [x] Build admin: write blog post form — `/admin/posts/new`
- [x] Build admin: edit/delete for both
- [ ] Test admin UI with non-technical user

---

### Phase 2 — Migration
- [ ] Export images from GoDaddy file system (`sites/default/files/photos/`)
- [ ] Upload images to Cloudflare R2 bucket
- [ ] Write migration script (Claude Code) — read from `i1631801_drup3` Docker DB
- [ ] Migrate 385 photo nodes with title, category, description, alt text, image ref
- [ ] Migrate 227 blog posts with HTML body, slug, date, attached images
- [ ] Handle blog posts with inline `field_images` attachments
- [ ] Verify migrated content against live site
- [ ] Check all image references resolve correctly to R2 URLs

---

### Phase 3 — Deploy & Go Live
- [ ] Create Vercel project, connect GitHub repo
- [ ] Set environment variables (DB, R2 credentials)
- [ ] Confirm site looks correct on Vercel preview URL
- [ ] Update DNS at GoDaddy — point frankgaard.com to Vercel
- [ ] Confirm SSL active on custom domain
- [ ] Smoke test all pages on live domain
- [ ] Cancel GoDaddy hosting plan (keep domain registration)
- [ ] Monitor for one week

---

## Cost summary

| Service | Cost/mo |
|---|---|
| Vercel Pro | $20 |
| Cloudflare R2 (images) | ~$0 |
| Neon / Supabase Postgres | ~$0 (free tier) |
| Cloudflare DNS/CDN | $0 |
| GoDaddy domain renewal | ~$2 amortized |
| **Total** | **~$22/mo** |

Previous GoDaddy cost: ~$25/mo

---

## Resources
- [frankgaard.com](https://frankgaard.com) — live site
- [Vercel](https://vercel.com) — hosting
- [shadcn/ui](https://ui.shadcn.com) — component library
- [Cloudflare R2](https://developers.cloudflare.com/r2/) — image storage
- [Neon](https://neon.tech) — serverless Postgres
- [Let's Encrypt](https://letsencrypt.org) — SSL reference
