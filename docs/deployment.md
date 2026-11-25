# Running and deploying

Two things can be deployed from this repository, independently:

1. the **static site** (`dist/`) to ordinary cPanel hosting, and
2. the **Next.js app** (`web/`) to Cloudflare Workers, where it has the database and
   staff inbox.

They look the same because they share the CSS and assets, but only the Next app has
a back end.

## Local development

### Static site

```bash
node src/build.mjs                 # writes dist/ — no dependencies to install
python3 -m http.server 8787 --directory dist
```

### Next.js app

```bash
cd web
cp .dev.vars.example .dev.vars     # set INBOX_PASSWORD to something long
npm install
npm run db:local                   # creates the local D1 database and seeds it
npm run dev                        # http://localhost:3100
```

`npm run dev` first runs `npm run assets`, which compiles `../src/css/*.css` and copies
images, fonts and the icon sprite into `web/public/`. Those outputs are git-ignored;
`src/` is the source of truth.

The local database is Wrangler's Miniflare state in `web/.wrangler/`. Reset it at any
time with `npm run db:local` (schema and seed are idempotent), or inspect it with:

```bash
npx wrangler d1 execute DB --local --command "SELECT id, name, is_active FROM doctors"
```

Open `/inbox` and sign in with the `INBOX_PASSWORD` from `web/.dev.vars`.

### Useful scripts (inside `web/`)

| Script | Does |
| --- | --- |
| `npm run dev` | assets + `next dev` on port 3100 |
| `npm run build` | assets + production build |
| `npm run start` | serve the production build on port 3100 |
| `npm run assets` | recompile CSS/sprite and copy images and fonts |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:local` | apply `db/schema.sql` + `db/seed.sql` to the local D1 |
| `npm run db:remote` | apply the same files to the deployed D1 database |

## Cloudflare (the app with a back end)

The app deploys as a Worker built by OpenNext (`@opennextjs/cloudflare`), with D1 as
the database. `wrangler.jsonc` declares the `DB` binding and the compatibility date.

### Secrets

| Name | Where | Purpose |
| --- | --- | --- |
| `INBOX_PASSWORD` | Worker secret: `npx wrangler secret put INBOX_PASSWORD`, or the Cloudflare dashboard | the staff inbox password |

Nothing else is required. `.dev.vars` holds the local value only and is git-ignored;
never commit a real password.

### Database

1. Create the D1 database and put its id in `wrangler.jsonc` (already done for the
   `summit-general-hospital` database).
2. Apply the schema and seed: `npm run db:remote`.
3. Deploy (below). The Worker reads the same `DB` binding; `lib/d1.ts` requires no change.

### Deploy

`wrangler.jsonc` points the Worker at `.open-next/worker.js`, which OpenNext produces.
`open-next.config.ts` holds the adapter settings. From `web/`:

```bash
npx opennextjs-cloudflare build     # npm run build, then adapts the output
npx opennextjs-cloudflare deploy    # upload to Cloudflare Workers
```

The OpenNext build runs `npm run build` first, so the CSS and asset step happens too.
`npm run build` alone is only the Next.js build; it is not the Worker. To run the
built Worker locally under Wrangler before deploying:

```bash
npx opennextjs-cloudflare build
npx opennextjs-cloudflare preview    # http://localhost:8787
```

The preview reads the same local D1 state as `next dev`, so run `npm run db:local`
first; without the schema every database-backed page returns a 500.

### First-deploy checks

- `/` and every public page render, images and the stylesheet load.
- `/inbox/login` accepts the configured password and sets the cookie.
- A contact message posted from `/contact` appears under `/inbox`.
- An appointment posted from `/appointment` appears under `/inbox/appointments`.
- Hiding a doctor removes them from `/doctors` immediately, and Show restores them.

## cPanel (the static site only)

This is the workflow that produces a site with no database and no staff inbox — forms
are delivered by `send.php`. Full detail, including the Site Builder warning, is in
[`static-site.md`](static-site.md):

1. `node src/build.mjs`
2. Upload the **contents** of `dist/` into `public_html` (enable hidden files so
   `.htaccess` goes too).
3. Make sure PHP 8+ and `mail()` are available, and set the recipient address at the
   top of `send.php`.
4. Send one test through each form.

## Backups

The D1 database is the only stateful part of the app. Export it before any migration
or bulk edit:

```bash
npx wrangler d1 export DB --remote --output backup-$(date +%F).sql
```

Keep a copy outside the repository; the exports contain patient contact details.
