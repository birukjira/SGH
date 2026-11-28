# Summit General Hospital — website and staff system

The website for **Summit General Hospital**, Summit 72, Lemi Kura, Addis Ababa:
patient-facing pages plus a staff area that handles appointment requests, contact
messages, doctors and services.

The repository contains two deliverables that share one design:

| Deliverable | Where | Stack | What it can do |
| --- | --- | --- | --- |
| **Static site** | `src/`, `public/` → `dist/` | plain HTML, CSS, JS, one PHP form handler | Every public page; appointment and contact forms are emailed by `send.php`. No database. |
| **Next.js app** | `web/` | Next.js 16 App Router, React 19, TypeScript, MongoDB Atlas | The same public pages, driven by a database, plus the staff inbox at `/inbox`. |

The static site is what goes on ordinary cPanel hosting today. The Next app is the
version with a back end: requests are stored, not just emailed, and staff can edit
doctors and services without touching HTML.

Both are built from the same source of truth — `src/css/` for styling,
`public/assets/` for images and fonts, `src/partials/icons.html` for icons — so a
design change happens once. `web/scripts/build-assets.mjs` compiles those into the
Next app before every `dev` and `build`.

---

## Quick start

### The Next.js app (pages + database + staff area)

```bash
cd web
cp .dev.vars.example .dev.vars     # set MONGODB_URI and INBOX_PASSWORD
npm install
npm run db:setup                   # create collections, indexes and seed content
npm run dev                        # http://localhost:3100
```

Open <http://localhost:3100> for the public site and <http://localhost:3100/inbox>
for the staff area (password from `web/.dev.vars`).

The database is a MongoDB Atlas cluster, not a file on this machine: create a free
cluster, add a database user, allow your IP under **Network Access**, and paste the
driver connection string (with the password in it) into `MONGODB_URI`. The app uses
the `summit_general_hospital` database when the connection string has no path of its
own. `npm run db:setup` is safe to re-run — it upserts the launch content and never
touches requests or records staff created.

### The static site

```bash
node src/build.mjs                          # no dependencies; writes dist/
python3 -m http.server 8787 --directory dist
```

Form delivery is inactive in local preview; on the server, `send.php` emails the
request to the address configured at the top of the file.

---

## How the front end and the back end connect

There is no separate API — the Next.js server *is* the back end. Server Components
read MongoDB directly, and every write goes through a Server Action.

```
browser ──GET /doctors──► Next server ──getDb() → MONGODB_URI──► MongoDB Atlas
                              │                                     │
                              └────── server-rendered HTML ◄────────┘

browser ──POST (form or action call)──► Server Action
                            ├─ requireStaff()        staff cookie → digest check
                            ├─ parse + validate      lib/content.ts, lib/*.ts
                            ├─ insertOne / updateOne ──► MongoDB
                            ├─ revalidatePath(…)     public pages refresh
                            └─ redirect(?saved=1)
```

The staff screens post a plain `<form>` at a server action, and the contact form uses
`useActionState`. The appointment wizard is the one exception: it keeps its steps and
field checks in the browser, then calls `submitAppointment` — a server action — with
the collected values, and the server re-runs every rule in `lib/appointment-slots.ts`
before writing.

Consequences worth knowing:

- **Nothing is exposed to the browser.** No `/api` routes, no database credentials,
  no client-side fetch layer. Public pages only read; staff writes are gated.
- **Public pages filter on `is_active: 1`**, so hiding a doctor in `/inbox/doctors`
  removes them from `/doctors`, the booking form and the home page on the next load.
- **Staff forms work without JavaScript.** Their markup carries the action ID that
  posts to the same page, so they save even when a click lands before hydration. The
  contact form is a progressively enhanced server-action post too. The appointment
  wizard does need JavaScript; the server checks the same rules either way.
- **The connection is opened in one place** — `web/lib/mongo.ts` — from
  `MONGODB_URI` in `.dev.vars` locally and from the server environment when deployed.
  One pooled client per process; pages never construct their own.

Full detail: [`docs/architecture.md`](docs/architecture.md).

---

## Pages

| Route | Renders |
| --- | --- |
| `/` | Home: hero, quick access, departments, care pathways, doctors, patient stories, map |
| `/about` | Story, mission, facility gallery, quality commitments |
| `/services` | Service cards from MongoDB, filterable by category |
| `/doctors` | Consultant directory from MongoDB, with specialty filters |
| `/appointment` | Three-step appointment request, written to `appointments` |
| `/visit` | What to bring, admissions, visiting hours, rights, insurance, FAQs |
| `/contact` | Contact details plus a message form written to `messages` |
| `/privacy` | Website privacy notice |

Legacy `.html` addresses (`/doctors.html`, …) permanently redirect to the routes above,
so old links and search results keep working.

### Staff area (`/inbox`)

| Route | Purpose |
| --- | --- |
| `/inbox/login` | Shared front-desk password |
| `/inbox` | Contact messages, grouped New / Read / Archived, with internal notes |
| `/inbox/appointments` | Appointment requests and their status (new → confirmed or declined → archived) |
| `/inbox/doctors` | Consultant list, hide/restore, add and edit |
| `/inbox/services` | Service list by category, hide/restore, add and edit |

Rules the staff screens enforce: **records are hidden, never deleted**; a doctor's URL
slug is generated once and never changes; a doctor's primary department must be one
of their ticked departments (refused by the server, not just the picker); editing a
record cannot change its visibility. Operating guide: [`docs/staff-guide.md`](docs/staff-guide.md).

---

## Data

One MongoDB database (`summit_general_hospital` by default), created and seeded by
[`web/db/setup.mjs`](web/db/setup.mjs) (`npm run db:setup`). The document shapes are
described in [`web/db/DATA-MODEL.md`](web/db/DATA-MODEL.md).

| Collection | Holds |
| --- | --- |
| `departments` | Clinical units used by filters and the booking form |
| `doctors`, `doctor_departments` | Consultants and their memberships (one primary per doctor) |
| `service_categories`, `services` | The `/services` cards and their booking departments |
| `messages` | Contact form submissions and staff status/notes |
| `appointments` | Appointment requests, reference and status |
| `posts`, `post_categories` | Blog collections, ready but not yet routed |
| `testimonials`, `review_snapshots` | Curated quotes and a cached Google rating |
| `login_attempts` | Throttling for the staff password |
| `counters` | The next numeric id for each collection |

Conventions: documents carry a numeric `id` (filled from `counters`, so URLs and staff
forms stay `/inbox/doctors/12`), public URLs use stable slugs, timestamps are ISO-8601
UTC strings, and soft state (`is_active`, `is_published`, `status`) replaces deletes.
There is no ORM and no migration framework: `db/setup.mjs` creates the indexes and is
idempotent.

```bash
cd web
npx mongosh "$MONGODB_URI" --eval 'db.doctors.find({}, { name: 1, is_active: 1 }).toArray()'
```

---

## Repository layout

```
.
├── src/                      static site source
│   ├── build.mjs             zero-dependency build → dist/
│   ├── pages/                one HTML fragment per page
│   ├── partials/             header, footer, icon sprite
│   ├── css/                  the design system (source of truth for both apps)
│   ├── js/                   interactions and form validation
│   └── layout.html           page shell
├── public/                   static assets, send.php, .htaccess, favicon
├── dist/                     generated by src/build.mjs (not committed)
├── figma-plugin/             Figma design builder
├── FIGMA.md                  Figma install and editing guide
├── web/                      the Next.js app
│   ├── app/                  routes: public pages + /inbox
│   ├── components/           shared UI (header, footer, icons, staff nav)
│   ├── lib/                  MongoDB access, queries, validation, staff auth
│   ├── db/                   setup.mjs (collections, indexes, seed), DATA-MODEL.md
│   ├── scripts/              build-assets.mjs
│   ├── tests/                browser-test helpers
│   ├── public/               generated assets (CSS, images, sprite)
│   ├── .dev.vars.example     local secrets template (MongoDB URI, inbox password)
│   └── next.config.ts        legacy redirects, image and dev-host settings
├── .github/workflows/        CI: install `web/`, typecheck and build on every push
├── docs/                     architecture, staff guide, deployment, static site
└── README.md
```

---

## Working on it

| Task | Command | Where |
| --- | --- | --- |
| Rebuild the static site | `node src/build.mjs` | repository root |
| Recompile CSS/images for the app | `npm run assets` | `web/` |
| Typecheck the app (also runs in CI on every push) | `npm run typecheck` | `web/` |
| Production build | `npm run build` | `web/` |
| Create/seed the database (safe to re-run) | `npm run db:setup` | `web/` |

Guidelines:

- **Edit CSS in `src/css/`**, then run `npm run assets` in `web/`. Files under
  `web/public/assets/css/` are generated and git-ignored.
- **Typecheck before handing over:** `npm run typecheck` must pass.
  `.github/workflows/ci.yml` runs the typecheck and the production build on every
  push; there is no other automated check in the project.
- **No invented clinical facts.** Clinic days, languages, qualifications, hours and
  insurance text must come from the hospital. Where they are unknown, the site says
  so ("Clinic days — call to confirm") rather than guessing.
- **Do not weaken the staff gate.** Any new staff page or action starts with
  `requireStaff()`; any new public endpoint needs its own throttle.
- **Never commit secrets.** `.dev.vars` and `.env*` are git-ignored; the real
  connection string and inbox password live in the server's environment.

`web/tests/click-after-scroll.js` is a browser helper for manual checks: it scrolls
with `behavior: 'instant'` and hit-tests the pointer before clicking, because the
site's global `scroll-behavior: smooth` otherwise makes an automated click land on
whatever the page has scrolled past. Paste it into the devtools console and call
`await sghClick('selector')`.

---

## Deploying

- **Static site** → upload the contents of `dist/` to `public_html` on cPanel.
- **Next app** → a Node.js host (VPS, platform app, or any server that can run
  `npm run build` and `npm start`) with `MONGODB_URI` and `INBOX_PASSWORD` in its
  environment, talking to the same MongoDB Atlas cluster.

Both paths, including Atlas network access, secrets, seeding and first-deploy checks,
are in [`docs/deployment.md`](docs/deployment.md).

---

## Documentation

| Document | Covers |
| --- | --- |
| [`docs/architecture.md`](docs/architecture.md) | Request flow, MongoDB access, data model, staff auth, revalidation, client components |
| [`docs/staff-guide.md`](docs/staff-guide.md) | What each staff screen does and the rules it follows |
| [`docs/deployment.md`](docs/deployment.md) | Local setup, Atlas, secrets, Node hosting, cPanel, backups |
| [`docs/static-site.md`](docs/static-site.md) | The static deliverable in depth: cPanel publishing, `send.php`, design tokens, accessibility, pre-launch content checklist |
| [`web/db/DATA-MODEL.md`](web/db/DATA-MODEL.md) | Collections, indexes and the fields that exist for a reason |
| [`FIGMA.md`](FIGMA.md) | The Figma design plugin |

---

## Before this goes live

The design and code are complete; several facts are not yet confirmed by the
hospital — consultant roles and clinic days, services actually offered, hours,
the emergency/ambulance line, insurance wording, and patient testimonials. Stock
photography stands in for the real building and team. Work through the checklist in
[`docs/static-site.md`](docs/static-site.md) before publishing, and treat the
privacy notice as a draft for review.

## Credits

Photography from [Unsplash](https://unsplash.com/license), map screenshot from
[Google Maps](https://www.google.com/maps) (© Google), typeface
[Montserrat](https://fonts.google.com/specimen/Montserrat) (SIL OFL 1.1), logo
supplied by the hospital. Full list in [`docs/static-site.md`](docs/static-site.md).
