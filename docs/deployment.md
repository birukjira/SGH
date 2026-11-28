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

### Front-desk email alerts (optional)

A request that only lands in `/inbox` is a request nobody has been told about. When
`RESEND_API_KEY`, `NOTIFY_EMAIL_TO` and `NOTIFY_EMAIL_FROM` are all set, each saved
contact message and appointment request also sends one short email to the front desk:
who to call back, what they asked for, and the reference. The patient's own message
and reason stay in `/inbox` rather than travelling through mailboxes.

Delivery is best effort and runs after the visitor's response is sent, through
`after()` in `web/lib/notify.ts`, using the built-in `fetch` — no extra package.
A mail failure is logged and never turns a saved request into an error. With any of
the three values missing, alerts are simply off; that is the normal state in local
development and in the smoke test.

To turn them on: create an API key at the mail provider, verify the sending domain
(its SPF/DKIM records must pass, or mail will be filtered), and set the three values
in the host's environment. Send one real request from the public form and confirm the
email arrives before relying on it.

`npm run test:notify` checks the payload offline (`fetch` is stubbed): that a configured
alert posts the right recipient, sender, subject and inbox link, that an unset key or
recipient sends nothing, and that the appointment and contact alerts carry routing detail
only — the patient's reason and the message body never reach the email. It needs no
database, and it does not test real delivery — only a live key can do that.

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
| `npm run test:notify` | checks the front-desk alert payload and its no-op path, with `fetch` stubbed |

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
| `RESEND_API_KEY` | the host's environment | optional: sends the front-desk alert for each new request |
| `NOTIFY_EMAIL_TO` | the host's environment | optional: the address the front desk reads |
| `NOTIFY_EMAIL_FROM` | the host's environment | optional: verified sender, e.g. `Summit General Hospital <alerts@…>` |

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
- Set `SITE_URL` when the app is not on its production address — for a test host
  such as `https://test.summitgh.com.et`. Canonical and sitemap URLs and the inbox
  link in alert emails are built from it, so without it a test deployment points
  staff back at production. It is read at startup, and also at build time for pages
  Next prerenders.
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

## Testing on a subdomain (`test.summitgh.com.et`)

The test host runs the same build as production; only the address and the environment
differ. It exists to try a change in front of a real browser without touching the main
site.

### DNS comes first

`test.summitgh.com.et` currently resolves to `172.104.247.216`, a Traefik proxy with no
route for that name: plain HTTP answers `404 page not found` and HTTPS serves
`CN=TRAEFIK DEFAULT CERT`. So:

1. Replace that record with an A record pointing at the server that runs the app (the
   cPanel server that serves `summitgh.com.et` is `91.204.209.11`).
2. Wait until `dig +short test.summitgh.com.et` prints the new address. AutoSSL checks
   over HTTP against that address, so requesting the certificate earlier fails.
3. Issue the certificate (cPanel → **SSL/TLS Status** → Run AutoSSL).

### The app on a cPanel Node app

This needs **Software → Setup Node.js App** (CloudLinux's Node.js Selector, which runs
app through Passenger). A LiteSpeed-only account can serve `dist/` but cannot run this
app; that case needs a VPS instead.

- Application root: `~/nodeapps/sgh-test`, outside `public_html`
- Application URL: `test.summitgh.com.et`
- Application startup file: `server.cjs`
- Node 20 or newer, application mode `production`
- Environment variables: `MONGODB_URI`, `INBOX_PASSWORD`,
  `SITE_URL=https://test.summitgh.com.et`, `NODE_ENV=production`; add the three mail
  values only if the test host should send alert emails.
- Startup file: `web/server.cjs` in this repository, uploaded as `server.cjs` at the
  application root.
- The first deployment needs its own `node_modules`, so press **Run NPM Install** once
  in the Node.js App screen (or run `npm ci --omit=dev` over SSH). Later uploads only
  replace code and build output — see
  [Deploying from GitHub Actions](#deploying-from-github-actions-ftp) below.

Passenger loads the startup file directly, so it needs its own entry point. It must be
CommonJS, and it must not pin a port — Passenger replaces the socket `listen()` binds
to. It is committed as `web/server.cjs`:

```js
// server.cjs
const next = require('next');
const http = require('node:http');

const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  http.createServer((req, res) => handle(req, res)).listen(process.env.PORT || 3000);
});
```

### Checks specific to a test host

- `SITE_URL` must be set for the **build**, not only at start. `/sitemap.xml` and other
  routes Next prerenders bake their URLs; verified both ways — a start-time-only
  override left the sitemap pointing at production, a build with it set moved the
  sitemap to the test host. Pages rendered per request follow the start-time value.
- Atlas → **Network Access** must allow that server's public IP, or every page that
  reads content fails with `MongoServerSelectionError`.
- `npm run db:setup` writes to whatever `MONGODB_URI` points at. Use a separate database
  for the test host if you want to be sure nothing it does reaches real requests.
- A test host is public. The generated `robots.txt` still advertises production's
  sitemap, and nothing stops crawlers indexing the test pages themselves; keep that in
  mind before leaving it up.

## Deploying from GitHub Actions (FTP)

`.github/workflows/deploy.yml` builds in CI and uploads the result over FTP. It runs
from the Actions tab (**Deploy to cPanel** → *Run workflow*), not on every push: a
hospital site should not publish itself while a change is still being reviewed.

| Target | Builds | Uploads to |
| --- | --- | --- |
| `app` | `web/` with `SITE_URL` baked into the build | the Node app root (`nodeapps/sgh-test`) |
| `static` | `dist/` | the static site's web root (`public_html`) |

Both targets use the same FTP account.

### 1. Create the FTP account

cPanel → **Files → FTP Accounts → Add FTP Account**:

- **Log in**: `deploy@summitgh.com.et` (the name is yours to choose; note it exactly)
- **Password**: use *Password Generator* and copy it — cPanel shows it only once
- **Directory**: `/` (or leave it blank) so the account can reach both
  `nodeapps/sgh-test` and `public_html`. A directory such as `nodeapps/sgh-test` jails
  the account there; in that case set `APP_REMOTE_DIR` to `.` and create a second
  account for `public_html` with `STATIC_REMOTE_DIR=.`
- **Quota**: unlimited

This is a deploy-only account, not the main cPanel login, but it can write anywhere in
the home directory — treat its password like the hosting password, and keep it in
GitHub secrets rather than in this repository. It can be deleted between deployments
and re-created when needed.

### 2. Add the secrets to GitHub

Repository → **Settings → Secrets and variables → Actions**.

Secrets:

| Name | Value |
| --- | --- |
| `FTP_SERVER` | the FTP hostname cPanel shows, e.g. `ftp.summitgh.com.et` (an IP works too) |
| `FTP_USERNAME` | the account from step 1, e.g. `deploy@summitgh.com.et` |
| `FTP_PASSWORD` | that account's password |

Variables (optional, defaults in brackets):

| Name | Value |
| --- | --- |
| `FTP_PORT` | [`21`] |
| `APP_REMOTE_DIR` | [`nodeapps/sgh-test`] |
| `STATIC_REMOTE_DIR` | [`public_html`] |
| `SITE_URL` | [`https://test.summitgh.com.et`] — baked into the app build |

Nothing else belongs in GitHub: `MONGODB_URI`, `INBOX_PASSWORD` and the three mail
values stay in the cPanel Node app's environment.

### 3. First run

The `app` target expects a prepared application: the Node app created in cPanel with
`server.cjs` as its startup file, its environment values set, and `node_modules`
installed once. The workflow uploads the code and an Ubuntu-built `.next`, then writes
`tmp/restart.txt`, which makes Passenger reload the app.

Actions → **Deploy to cPanel** → *Run workflow* → target `app`. A green run ends with
the mirror summary; open `https://test.summitgh.com.et/` and work through the
first-deploy checks above.

### What breaks this, in order of likelihood

- **TLS**: the workflow requires FTPS with a verified certificate
  (`ftp:ssl-force yes`, `ssl:verify-certificate yes`). If the host's FTP certificate is
  self-signed the run stops at login — use the `FTP_SERVER` name that matches the
  certificate. Only a host with no valid certificate at all should have that line set
  to `no`, because the password would then travel over an unverified channel.
- **Login refused**: some hosts restrict FTP by IP or require the connection from an
  allowed address. Check cPanel's FTP/security settings if the password is definitely
  right.
- **Wrong remote path**: `cd` into a missing directory fails the run immediately. The
  paths are relative to the FTP account's home directory.
- **Upload was fine, the app is not**: the `.next` was built on Ubuntu. If Passenger
  errors after a green run, rebuild on the server (`npm ci && npm run build` over SSH);
  the code and `server.cjs` are already there.
- **Errors during a deploy**: the workflow deletes `.next` before uploading the new
  one, so the test host can return 500 for the length of the upload. That is acceptable
  on a test host; on production, deploy to a second application root and switch the
  URL instead.

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
