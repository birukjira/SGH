# Running and deploying

Two things can be deployed from this repository, independently:

1. the **static site** (`dist/`) to ordinary cPanel hosting, and
2. the **Next.js app** (`web/`) to a Node.js host, where it has the database and the
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
cp .dev.vars.example .dev.vars     # set MONGODB_URI and INBOX_PASSWORD
npm install
npm run db:setup                   # creates collections, indexes and seed content
npm run dev                        # http://localhost:3100
```

`npm run dev` first runs `npm run assets`, which compiles `../src/css/*.css` and copies
images, fonts and the icon sprite into `web/public/`. Those outputs are git-ignored;
`src/` is the source of truth.

The database is MongoDB Atlas, so the app needs a reachable cluster before any page
that reads content will render:

1. Create a free cluster and a database user in Atlas.
2. Add your IP under **Network Access**. Atlas rejects connections from an IP that is
   not allowed at the TLS handshake, which the app reports as a
   `MongoServerSelectionError` (and an SSL alert in the driver's cause) rather than a
   login error.
3. Copy the driver connection string — the one with the password in it — into
   `MONGODB_URI` in `web/.dev.vars`. Leave the database path empty to use
   `summit_general_hospital`, or name one explicitly.

`npm run db:setup` creates the collections and indexes, upserts the seeded
departments, consultants and services, and initialises the id counters. No patient
stories are seeded — add those only with written consent.
Running it again is harmless: seeded content is matched by `id`, and requests,
messages and anything staff added are left alone.

Open `/inbox` and sign in with the `INBOX_PASSWORD` from `web/.dev.vars`.

### Staff smoke test

With the app running (`npm run dev` or `npm start`), `npm run test:smoke` in `web/`
signs in, then drives the staff forms over HTTP: doctor add / edit / primary-department
guard / hide / restore, service add / edit / category guard, message note and status
buttons, the appointment queue's note and status buttons, and the appointment search.
It reads the action ids out of the rendered pages, so a rebuild does not break it, and
it removes every record it creates — including when a check fails. `SMOKE_BASE_URL`
points it at another host; `MONGODB_URI` and `INBOX_PASSWORD` come from the environment
or `web/.dev.vars`.

The public contact and appointment forms are client components, so the script inserts
its message and appointment fixtures directly into MongoDB and tests the staff side.
Counter documents advance with each run; ids stay unique and are never reused.

### Useful scripts (inside `web/`)

| Script | Does |
| --- | --- |
| `npm run dev` | assets + `next dev` on port 3100 |
| `npm run build` | assets + production build |
| `npm run start` | serve the production build on port 3100 |
| `npm run assets` | recompile CSS/sprite and copy images and fonts |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:setup` | create collections/indexes and seed content in MongoDB |
| `npm run test:smoke` | end-to-end staff write checks against a running app (see below) |

## MongoDB Atlas (the database)

The app opens one pooled connection per process from `MONGODB_URI`
(`web/lib/mongo.ts`) and uses the `summit_general_hospital` database by default.

### Checklist

1. **Cluster** — any tier works; the free tier is enough for a hospital front desk.
   A paused cluster refuses connections, so resume it first.
2. **Database user** — a user with read/write on this database, not an admin user for
   day-to-day traffic.
3. **Network access** — the app server's public IP must be allowed. Add the hosting
   provider's egress IP (or its range) rather than `0.0.0.0/0`; Atlas shows the denied
   IP in its connection log if you are unsure which one to add. Locally, add your own
   IP.
4. **Seed** — run `npm run db:setup` once from a machine that can reach the cluster
   (locally is fine; it writes to whatever `MONGODB_URI` points at).
5. **Indexes** — created by the same script. `reference` on `appointments` and `slug`
   on `doctors`/`services` must stay unique.

### Secrets

| Name | Where | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | the host's environment (systemd unit, platform dashboard, or `.env` outside git) | cluster connection string, password included |
| `INBOX_PASSWORD` | the host's environment | the staff inbox password |

`web/.dev.vars` holds local values only and is git-ignored; never commit a real
connection string or password. Because the URI contains the database password, treat
the host's environment file as a secret: `chmod 600`, owned by the app user, and not
readable by other accounts.

## Node hosting (the app with a back end)

MongoDB needs a long-lived TCP connection, so the app runs as a normal Node server —
not on an edge/Worker runtime. Any host that can run Node 20+ works: a small VPS, a
platform app (Railway, Render, Fly, a managed Node service), or a hospital server.

```bash
cd web
npm ci
npm run build                      # assets + next build
MONGODB_URI='mongodb+srv://…' INBOX_PASSWORD='…' npm start   # http://localhost:3100
```

- `npm start` is `next start -p 3100`; put a reverse proxy (nginx, Caddy, the
  platform's router) in front of it for TLS on port 443.
- Set `NODE_ENV=production` (platforms do this already) so the staff cookie is marked
  `Secure`.
- Keep one app process behind the proxy, or make sure your platform does not scale to
  many instances needlessly: each process holds its own connection pool.
- The build is self-contained in `web/`; the static site's `dist/` is not needed.
- Restart the process after changing environment variables — `lib/env.ts` reads them
  at startup.

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

The MongoDB database is the only stateful part of the app. Export it before any
migration or bulk edit:

```bash
mongodump --uri "$MONGODB_URI" --out "backup-$(date +%F)"
```

Restore with `mongorestore --uri "$MONGODB_URI" --drop "backup-YYYY-MM-DD"`. Take
these dumps somewhere outside the repository — they contain patient contact details.
Atlas' own continuous/cloud backups are a paid-cluster feature; on the free tier the
dump above is the backup, so schedule it (cron or the host's scheduler) rather than
relying on the cluster.
