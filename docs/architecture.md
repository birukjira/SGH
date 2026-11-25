# Architecture — how the front end talks to the back end

There is no separate API server and no client-side fetch layer. The Next.js app in
`web/` is the whole back end: pages render on the server, read from Cloudflare D1
directly, and every write goes through a Server Action — posted by a `<form>` on the
staff screens, or called by the appointment wizard.

```
browser
  │  GET /doctors
  ▼
Next server (Node in `next dev`, Cloudflare Worker when deployed)
  │  getDb() → env.DB   (D1 binding, see wrangler.jsonc)
  ▼
D1 (SQLite)
  │  rows
  ▼
Server Component renders HTML ──► browser
```

Writes take the same route in reverse, through a Server Action:

```
browser submits <form> ──► server action (POST, same origin)
                              ├─ requireStaff()           cookie → digest check
                              ├─ parse + validate         lib/content.ts
                              ├─ INSERT/UPDATE  ─────────► D1
                              ├─ revalidatePath(...)      public pages re-render
                              └─ redirect(?saved=1)
```

The appointment form is the only write that does not come from a form post: its
wizard validates in the browser and then calls `submitAppointment(values)`. That is
still a server action running on the server, and `requestAppointment()` re-runs every
rule from `lib/appointment-slots.ts` before it inserts a row.

## Why this shape

- **No exposed API surface.** Every query runs on the server; the browser never sees
  the database binding or a query string, and there is no `/api/*` to protect.
- **Public pages are read-only.** They call `lib/db.ts`, which filters
  `is_active = 1`, and never prompt for credentials.
- **Staff writes are ordinary form posts.** They work without JavaScript (Next
  progressively enhances server-action forms: the markup carries
  `action=""` plus a `$ACTION_ID` field, which posts to the same page and runs the
  action), and they cannot be replayed from another origin because the staff cookie
  is `SameSite=Lax`.

## The database binding

`web/lib/d1.ts` is the only place that resolves the binding:

```ts
const { env } = await getCloudflareContext({ async: true });
const db = (env as { DB?: D1DatabaseLike }).DB;   // throws a clear error if missing
```

- **`next dev`** — `initOpenNextCloudflareForDev({ configPath: './wrangler.jsonc' })`
  in `next.config.ts` reads the D1 binding from Wrangler's local Miniflare state
  (`web/.wrangler/`). No Cloudflare account is needed to develop; the data lives in
  a local SQLite file.
- **Deployed** — the Worker reads the same `DB` binding from the `d1_databases` entry
  in `wrangler.jsonc`.

Because both paths read the same binding name, application code never branches on
environment.

## Data access modules

| Module | Responsibility | Used by |
| --- | --- | --- |
| `lib/d1.ts` | Resolve the `DB` binding | everything |
| `lib/db.ts` | Public reads: doctors, department chips, services, booking departments | public pages |
| `lib/content.ts` | Staff reads plus `parse*Form` validation and `save*` writes for doctors and services | `/inbox/doctors`, `/inbox/services` |
| `lib/appointment-slots.ts` | Booking slots, visit types and the validation rules shared by browser and server (imports no D1 code) | `/appointment` |
| `lib/appointments.ts` | Re-validate and insert appointment requests | `/appointment` |
| `lib/appointment-queue.ts` | Staff queue queries, status changes and counts | `/inbox/appointments`, staff nav badges |
| `lib/messages.ts` | Validate and insert contact messages | `/contact` |
| `lib/inbox.ts` | Staff gate (`isStaff`, `requireStaff`), sign-in/out with throttling, messages list, status and notes | every `/inbox` route |
| `lib/format.ts` | Phone/date helpers used by staff screens | staff screens |

Writes are plain SQL through prepared statements with bound parameters. No ORM, no
migrations framework: `web/db/schema.sql` is idempotent (`CREATE TABLE IF NOT
EXISTS`) and `web/db/seed.sql` seeds the launch content.

## Schema, in one screen

| Table | Purpose | Notable rules |
| --- | --- | --- |
| `departments` | Clinical units; drive directory chips and booking departments | one row carries three labels (filter, appointment, card) |
| `doctors` | Consultants on `/doctors` | `slug` is permanent; `is_active` hides without deleting |
| `doctor_departments` | Doctor ↔ department membership | partial unique index allows exactly one `is_primary = 1` per doctor |
| `service_categories` / `services` | The `/services` cards and booking options | `booking_department` is text, because services outnumber consultant departments |
| `posts` / `post_categories` | Blog, ready but not yet routed | `status` draft/scheduled/published/archived with CHECKs |
| `testimonials` / `review_snapshots` | Curated patient quotes and cached Google rating | never published without `is_published = 1` |
| `messages` | `/contact` submissions | `status` new/read/archived; `note` is staff-only |
| `appointments` | `/appointment` requests | `reference` unique; `status` new/confirmed/declined/archived |
| `login_attempts` | Failed staff sign-ins | keyed by a digest of IP + password, pruned on next attempt |

Per the conventions in `web/db/schema.sql`: integer ids, public URLs use `slug`,
timestamps are ISO-8601 UTC strings written by the app, and soft state
(`is_active`, `is_published`, `status`) is preferred over deleting rows.

## Staff authentication

`lib/inbox.ts` implements a single shared front-desk password, deliberately not a
user account system:

1. `INBOX_PASSWORD` comes from `.dev.vars` locally and from the hosting environment
   in production. If it is unset, `isStaff()` is false and the inbox is closed.
2. A correct password sets `sgh_inbox` to the SHA-256 of `summit-inbox:<password>` —
   httpOnly, `SameSite=Lax`, `path=/inbox`, 12-hour lifetime. The password itself is
   never stored in the browser.
3. Every staff page and every staff action calls `requireStaff()`, which redirects to
   `/inbox/login` when the cookie is absent or wrong. Redirects are not a security
   boundary on their own, so the check is repeated inside each action — a POST to a
   server action without the cookie changes nothing.
4. Failed attempts are counted per client (max 5 in 15 minutes) in `login_attempts`,
   so the single shared password cannot be brute-forced. A broken counter never
   locks staff out; it logs and allows the attempt.

Staff pages also set `robots: { index: false, follow: false }`.

## Client components

Only what genuinely needs the browser is a client component:

| Component | Why |
| --- | --- |
| `DepartmentPicker` | Filters the primary-department select by the ticked checkboxes |
| `AppointmentForm` | Three-step wizard, inline validation, calls the server action at the end |
| `ContactForm` | `useActionState` for inline field errors and a status message |
| `DoctorDirectory`, `ServiceDirectory` | Filter chips and search over data rendered by the server |
| `HeroCarousel`, `SiteHeader` | Carousel and mobile menu toggle |

`ContactRail` and the whole doctor form are Server Components: links and uncontrolled
inputs plus a Server Action are enough, so staff forms keep their values through a
validation error redirect.

## Revalidation

D1 reads happen per request, but a write also refreshes routes that render
consultant- or service-derived content, so a hidden doctor disappears immediately:

```ts
revalidatePath('/inbox/doctors');  // the staff list
revalidatePath('/doctors');        // the public directory
revalidatePath('/appointment');    // the booking form's doctor/service lists
revalidatePath('/');               // the home page previews
```

## Asset pipeline

The design lives in the static site (`src/css`, `src/partials`, `public/assets`) and
is compiled into the Next app by `web/scripts/build-assets.mjs`, which runs before
`dev` and `build`:

- `src/css/*.css` → `web/public/assets/css/styles.css`
- `public/assets/{img,fonts}` → `web/public/assets/`
- `src/partials/icons.html` → `web/public/sprite.svg` (icons are used as
  `<use href="/sprite.svg#i-arrow">`)

There is exactly one stylesheet and one icon set for both deliverables. Edit CSS in
`src/css/` and run `npm run assets` inside `web/` — never edit
`web/public/assets/css/styles.css`, which is generated and git-ignored.

## Extension points

- **Blog** — `posts` and `post_categories` already exist with draft/scheduled states;
  it needs `/blog`, `/blog/[slug]` and a staff editor.
- **Notifications** — new requests currently wait for staff to open the inbox. The
  submit actions in `lib/appointments.ts` and `lib/messages.ts` are the place to add
  an email or Telegram send.
- **Per-user staff accounts** — replacing the shared password means adding a staff
  table and an audit log; `requireStaff()` is the single choke point to change.
