# Data model — Summit General Hospital (D1)

The site's content lives in one Cloudflare D1 (SQLite) database, bound to the
Worker as `DB`. The schema is in [`schema.sql`](schema.sql); development data is
seeded from [`seed.sql`](seed.sql).

Everything the public site renders is read server-side. The browser never talks
to D1 directly: pages and route handlers run `prepare(...).all()` against
`env.DB` and pass plain objects to components.

## Tables at a glance

| Table | Holds | Public read |
| --- | --- | --- |
| `departments` | Clinical departments: directory filter chip, booking label, card label | `is_active = 1` |
| `doctors` | Consultants: name, role, focus, portrait, clinic note | `is_active = 1` |
| `doctor_departments` | Which departments a consultant is listed under (one primary) | joined via active doctors |
| `service_categories` | Services filter chips (emergency, clinical, diagnostics, support) | `is_active = 1` |
| `services` | The 18 service cards and their call to action | `is_active = 1` |
| `post_categories` | Blog taxonomy | all |
| `posts` | Blog articles (Markdown body, author, SEO fields) | `status = 'published'` and `published_at <= now` |
| `testimonials` | Curated patient feedback, website or social source | `is_published = 1` |
| `review_snapshots` | Cached Google Places rating + review count | latest row per place |
| `messages` | Contact messages submitted through `/contact` | none — server-written, staff-read |

### Relationships

```
departments 1 ──< doctor_departments >── 1 doctors
     │                                      │
     └──< services (department_id)          └──< posts (author_id)

service_categories 1 ──< services
post_categories    1 ──< posts
```

`review_snapshots` and `testimonials` are independent: snapshots are the cached
aggregate rating, testimonials are individual quotes that have been reviewed and
approved for publishing.

## Columns that exist for a reason

**`departments.filter_label` vs `appointment_label` vs `card_label`.**
One department appears in three places with three conventions: the filter chip
("Surgery & ortho"), the value the booking form expects ("General & Laparoscopic
Surgery"), and the small label on a consultant card ("Surgery"). Storing all
three avoids hard-coding display strings in components.

**`doctors.languages`** is a JSON array (`'[]'` until verified). The directory
search includes it, so a patient can search "Amharic". Don't fill it with
assumed values.

**`services.booking_department`** is text, not a foreign key. Services outnumber
consultant departments (Family Medicine, Dermatology, Dental…), so the form
value is stored with the service. `services.department_id` is an optional link
to the consultant department when one exists (used for cross-links).

**`posts.status` and `published_at`.** Drafts never reach a public query.
`'scheduled'` is a draft with a future `published_at`; the public query uses
`published_at <= now`, so a scheduled post appears without a cron job.

**`testimonials.source` / `source_review_id`.** A partial unique index prevents
importing the same Google or Facebook review twice. Google-sourced rows store
the quote only when the Places API terms allow it, plus `source_url` back to
Maps; the aggregate rating comes from `review_snapshots`, not from mirrored
review text.

**`review_snapshots`.** Google Places returns at most five reviews and bills per
request, so the rating is fetched by a scheduled refresh and cached here with
`fetched_at`. Pages read the newest snapshot; a stale snapshot is better than a
blocking API call in a page render.

## Query patterns

Directory page (`app/doctors/page.tsx` → `lib/db.ts`):

1. `SELECT … FROM doctors WHERE is_active = 1 ORDER BY sort_order, name`
2. `SELECT dd.doctor_id, dep.slug, dep.card_label, dep.appointment_label, dd.is_primary
     FROM doctor_departments dd JOIN departments dep …` — grouped by doctor in JS,
   so the page needs two queries regardless of how many departments a doctor has.
3. `SELECT slug, filter_label FROM departments WHERE is_active = 1 ORDER BY sort_order`
   for the filter chips.

Services page: join `services` to `service_categories` and order by
`service_categories.sort_order, services.sort_order`.

Blog index: `WHERE status = 'published' AND published_at <= ?` ordered by
`published_at DESC`, joined to `post_categories` and `doctors` (author).

## Write rules

- Slugs are stable. Changing one breaks links and SEO; add a redirect instead.
- Set `updated_at` in the statement that writes the row
  (`updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')`); there are no triggers.
- Deactivate rows (`is_active = 0`, `is_published = 0`) rather than deleting
  content that has been public.
- Deleting a department is blocked while consultants or services reference it
  (`ON DELETE RESTRICT`); reassign first.
- Admin mutations will be authenticated and same-origin checked before they
  touch these tables. No table is writable from the browser.

## Applying the schema

```bash
npm run db:local                          # local Miniflare D1 (used by `npm run dev`)
npx wrangler d1 execute DB --local --command "SELECT name FROM doctors"
```

Remote (after the Sites D1 binding exists):

```bash
npm run db:remote
```

Existing databases need the one-off migrations once. SQLite has no
`ADD COLUMN IF NOT EXISTS`, so a second run fails on the ALTER — that means it
is already applied:

```bash
npx wrangler d1 execute DB --remote --file=db/migrations/001-appointment-handling.sql
npx wrangler d1 execute DB --remote --file=db/migrations/002-message-note.sql
```

## Contact messages

`messages` is the only public write path in the schema: the server action behind
`/contact` (`lib/messages.ts`) validates the form and inserts one row. Nothing
reads it from a page, so no query in the app can leak an enquiry.

- `status` (`new` → `read` → `archived`) is staff workflow; rows are archived,
  never deleted, so a retention policy can be applied deliberately.
- `note` is a short internal staff note ("replied by phone"), capped at 500
  characters and never rendered publicly. It saves without touching `status`,
  the same as the appointment queue.
- `consent` records that the sender agreed to be replied to; `source_page` keeps
  room for the appointment form to write into the same inbox later.
- Validation lives in one place so the UI and the database see the same rules:
  name, a syntactically valid email, one of the fixed subjects, a message of at
  least 10 characters and a checked consent box. A filled honeypot returns
  success without writing.

## Appointment requests

`appointments` is the public write path behind `/appointment`
(`lib/appointments.ts` → server action in `app/appointment/actions.ts`). Like
`messages`, nothing reads it from a public page.

- `reference` (`SGH-<base36 time>-<random>`) is unique and is what the front desk
  quotes on the phone; it is returned on the success panel.
- `department` stores the booking label the form offered (the same string as
  `departments.appointment_label` or a service's `booking_department`), so a
  request still reads correctly if a department is later renamed on the card
  grid. `doctor` is nullable — blank means "any available consultant".
- `visit_type` is `First consultation` or `Follow-up visit`; `preferred_date` is
  ISO `YYYY-MM-DD`, `preferred_time` one of the eight clinic slots. Both are
  preferences: the team confirms by phone.
- `status` (`new` → `confirmed` → `declined`, or `archived`) is the front-desk
  workflow. Rows are archived, never deleted, so retention can be deliberate.
- `handled_at` is set whenever staff move a row out of `new` and cleared again if
  it is moved back, so the queue can show how long a request has been waiting.
- `note` is a short internal note for the front desk ("left a voicemail"),
  capped at 500 characters. It is staff-only and never rendered publicly.
- Validation mirrors the contact form (name, phone, optional but well-formed
  email, consent) and adds a date window: today through 90 days ahead.
- Throttling is per phone number (3 per hour) and site-wide, counted from the
  table, so no IP address is stored.

## Staff appointment queue

`/inbox/appointments` (page and server actions in `app/inbox/appointments/`)
sits behind the same `requireStaff()` gate as the message inbox. The queue lives
under `/inbox` on purpose: the staff cookie is scoped to that path.

- Default filter is `status = 'new'`, ordered by `preferred_date` and then by
  clock time (the eight slots sort by their position in `TIME_SLOTS`, because
  `'10:30 AM' < '8:30 AM'` as text). Rows are grouped by preferred date in the
  page, which is the front desk's call list.
- Search matches `reference`, `phone`, patient name, and a digits-only variant
  of the phone so `251911…` finds `+251 911 …`.
- Each row is one form and one server action (`updateAppointment`): the note is
  always submitted, and `status` arrives only from the status button that was
  clicked (confirmed / declined / archived / back to new). It re-checks
  `requireStaff()` then calls `revalidatePath('/inbox/appointments')`.
- Queries and writes live in `lib/appointment-queue.ts`; the public form never
  imports it.

## Deliberately not modelled yet

Newsletter subscribers and admin users are not in this schema. They arrive with
the newsletter/admin port, and they need retention rules, rate limiting and
access control that the inbox does not.
