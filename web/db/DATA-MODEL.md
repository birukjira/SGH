# Data model — Summit General Hospital (MongoDB)

The site's content lives in one MongoDB database (default
`summit_general_hospital`). There are no SQL files: [`setup.mjs`](setup.mjs)
(`npm run db:setup`) creates the collections, builds the indexes, seeds the launch
content and initialises the id counters.

Everything the public site renders is read server-side. The browser never talks to
the database: pages and server actions call `getDb()` from
[`../lib/mongo.ts`](../lib/mongo.ts) and pass plain objects to components.

## Collections at a glance

| Collection | Holds | Public read |
| --- | --- | --- |
| `departments` | Clinical departments: directory filter chip, booking label, card label | `is_active: 1` |
| `doctors` | Consultants: name, role, focus, portrait, clinic note | `is_active: 1` |
| `doctor_departments` | Which departments a consultant is listed under (one primary) | joined via active doctors |
| `service_categories` | Services filter chips (emergency, clinical, diagnostics, support) | `is_active: 1` |
| `services` | The 18 service cards and their call to action | `is_active: 1` |
| `post_categories` | Blog taxonomy | all |
| `posts` | Blog articles (Markdown body, author, SEO fields) | `status: 'published'` and `published_at <= now` |
| `testimonials` | Curated patient feedback, website or social source | `is_published: 1` |
| `review_snapshots` | Cached Google Places rating + review count | latest document per place |
| `messages` | Contact messages submitted through `/contact` | none — server-written, staff-read |
| `appointments` | Appointment requests from `/appointment` | none — server-written, staff-read |
| `login_attempts` | Failed staff sign-ins, for throttling | none |
| `counters` | Next numeric `id` per collection | none |

### Relationships

MongoDB has no joins here, so the app groups in JavaScript after two or three
`find()` calls:

```
departments 1 ──< doctor_departments >── 1 doctors
     │                                      │
     └──< services (department_id)          └──< posts (author_id)

service_categories 1 ──< services
post_categories    1 ──< posts
```

`doctor_departments` documents are `{ doctor_id, department_id, is_primary }`;
`services.department_id` and `posts.author_id` are optional numeric references.
`review_snapshots` and `testimonials` are independent: snapshots are the cached
aggregate rating, testimonials are individual quotes that have been reviewed and
approved for publishing.

## Identifiers, indexes and timestamps

- **`id` is a number, not an ObjectId.** Public URLs and staff forms use integers
  (`/inbox/doctors/12`), so documents carry `id` filled by `nextId(db, name)`, which
  increments `counters._id = name` with `$inc` and `upsert`. Never expose `_id`.
- **Indexes are created by `setup.mjs`**, not by the app: unique `id` on every
  collection that carries one (so counter drift is a failed write, not a silently
  overwritten record), unique `slug` on
  `departments`, `doctors`, `service_categories`, `services`, `post_categories` and
  `posts`; unique `(doctor_id, department_id)` on `doctor_departments`; unique
  `reference` on `appointments`; `(status, created_at)` on `messages`;
  `(status, preferred_date, id)` and `(phone, created_at)` on `appointments`.
- **Timestamps are ISO-8601 UTC strings** (`nowIso()`) rather than BSON dates, so
  they sort lexicographically and the staff screens format them without conversion.
- **No CHECK constraints.** Values such as `status` are narrowed in TypeScript and
  written through `lib/*.ts`; the only structural guarantees are the indexes above
  plus the app's validation.

## Fields that exist for a reason

**`departments.filter_label` vs `appointment_label` vs `card_label`.**
One department appears in three places with three conventions: the filter chip
("Surgery & ortho"), the value the booking form expects ("General & Laparoscopic
Surgery"), and the small label on a consultant card ("Surgery"). Storing all
three avoids hard-coding display strings in components.

**`doctors.languages`** is an array (`[]` until verified). The directory search
includes it, so a patient can search "Amharic". Don't fill it with assumed values.

**`services.booking_department`** is text, not a reference. Services outnumber
consultant departments (Family Medicine, Dermatology, Dental…), so the form value is
stored with the service. `services.department_id` is an optional link to the
consultant department when one exists (used for cross-links).

**`posts.status` and `published_at`.** Drafts never reach a public query.
`'scheduled'` is a draft with a future `published_at`; the public query uses
`published_at <= now`, so a scheduled post appears without a cron job.

**`testimonials.source` / `source_review_id`.** A partial unique index
(`{ source: 1, source_review_id: 1 }` with `partialFilterExpression` on the string
type) prevents importing the same Google or Facebook review twice. Google-sourced
documents store the quote only when the Places API terms allow it, plus `source_url`
back to Maps; the aggregate rating comes from `review_snapshots`, not from mirrored
review text.

**`review_snapshots`.** Google Places returns at most five reviews and bills per
request, so the rating is fetched by a scheduled refresh and cached here with
`fetched_at`. Pages read the newest snapshot; a stale snapshot is better than a
blocking API call in a page render.

## Query patterns

Directory page (`app/doctors/page.tsx` → `lib/db.ts`):

1. `doctors.find({ is_active: 1 }).sort({ sort_order: 1, name: 1 })`
2. `doctor_departments.find({})` plus `departments.find({})`, joined in memory so the
   page needs three reads regardless of how many departments a doctor has.
3. `departments.find({ is_active: 1 }).sort({ sort_order: 1 })` for the filter chips.

Services page: read active `services` and all `service_categories`, then filter and
order in JavaScript by `categories.sort_order`, `services.sort_order`, `name`.

Blog index: `posts.find({ status: 'published', published_at: { $lte: now } })` sorted
by `published_at` descending, with categories and authors joined in memory.

Staff appointment queue: `listAppointments()` builds one filter object (status, plus
an `$or` of case-insensitive regexes over `reference`, `phone`, `patient_name`,
`first_name`, `last_name`, `phone_digits`), then sorts by `preferred_date`, the slot
index of `preferred_time`, and `id`.

## Write rules

- Slugs are stable. Changing one breaks links and SEO; add a redirect instead.
- Set `updated_at` in the same `updateOne`/`insertOne` that writes the document;
  there are no triggers.
- Deactivate (`is_active: 0`, `is_published: 0`) rather than deleting content that has
  been public.
- A department that consultants or services reference is not deleted; hide it and
  reassign first.
- Admin mutations are authenticated (`requireStaff()`) before they touch these
  collections, and no collection is writable from the browser.

## Applying the schema

```bash
cd web
npm run db:setup     # create collections + indexes, upsert seed content, init counters
```

Safe to re-run. Seeded documents are matched by `id`, so staff edits to seeded rows are
overwritten back to the seed values while records staff created are untouched; the
counter documents use `$max`, so ids are never reissued. To inspect the result:

```bash
npx mongosh "$MONGODB_URI" --eval 'db.doctors.find({}, { name: 1, is_active: 1 }).toArray()'
```

## Contact messages

`messages` is a public write path: the server action behind `/contact`
(`lib/messages.ts`) validates the form and inserts one document. Nothing reads it from
a page, so no public query can leak an enquiry.

- `status` (`new` → `read` → `archived`) is staff workflow; documents are archived,
  never deleted, so a retention policy can be applied deliberately.
- `note` is a short internal staff note ("replied by phone"), capped at 500
  characters and never rendered publicly. It saves without touching `status`, the same
  as the appointment queue.
- `consent` records that the sender agreed to be replied to; `source_page` keeps room
  for other forms to write into the same inbox later.
- Validation lives in one place so the UI and the database see the same rules: name, a
  syntactically valid email, one of the fixed subjects, a message of at least 10
  characters and a checked consent box. A filled honeypot returns success without
  writing.
- Throttling counts documents already stored: 2 per email address per hour and 20
  site-wide per hour, using the `(email, created_at)` index.

## Appointment requests

`appointments` is the public write path behind `/appointment`
(`lib/appointments.ts` → server action in `app/appointment/actions.ts`). Like
`messages`, nothing reads it from a public page.

- `reference` (`SGH-<base36 time>-<random>`) is unique and is what the front desk
  quotes on the phone; it is returned on the success panel.
- `department` stores the booking label the form offered (the same string as
  `departments.appointment_label` or a service's `booking_department`), so a request
  still reads correctly if a department is later renamed on the card grid. `doctor` is
  nullable — blank means "any available consultant".
- `visit_type` is `First consultation` or `Follow-up visit`; `preferred_date` is ISO
  `YYYY-MM-DD`, `preferred_time` one of the eight clinic slots. Both are preferences:
  the team confirms by phone.
- `first_name`/`last_name` are stored alongside the derived `patient_name`, and
  `phone_digits` holds the number without spaces, dashes or `+`, so the queue's search
  can match either form.
- `status` (`new` → `confirmed` → `declined`, or `archived`) is the front-desk
  workflow. Documents are archived, never deleted, so retention can be deliberate.
- `handled_at` is set whenever staff move a request out of `new` and cleared again if
  it is moved back, so the queue can show how long a request has been waiting.
- `note` is a short internal note for the front desk ("left a voicemail"), capped at
  500 characters. It is staff-only and never rendered publicly.
- Validation mirrors the contact form (name, phone, optional but well-formed email,
  consent) and adds a date window: today through 90 days ahead.
- Throttling is per phone number (3 per hour), counted from stored documents, so no IP
  address is kept.

## Staff appointment queue

`/inbox/appointments` (page and server actions in `app/inbox/appointments/`) sits
behind the same `requireStaff()` gate as the message inbox. The queue lives under
`/inbox` on purpose: the staff cookie is scoped to that path.

- Default filter is `status: 'new'`, ordered by `preferred_date` and then by clock
  time (the eight slots sort by their position in `TIME_SLOTS`, because
  `'10:30 AM' < '8:30 AM'` as text). Rows are grouped by preferred date in the page,
  which is the front desk's call list.
- Search matches `reference`, `phone`, `patient_name`, `first_name`, `last_name` and
  `phone_digits`, using escaped case-insensitive regexes so `.` or `(` cannot act as a
  pattern.
- Each row is one form and one server action (`updateAppointment`): the note is always
  submitted, and `status` arrives only from the status button that was clicked
  (confirmed / declined / archived / back to new). It re-checks `requireStaff()` then
  calls `revalidatePath('/inbox/appointments')`.
- Queries and writes live in `lib/appointment-queue.ts`; the public form never imports
  it.

## Deliberately not modelled yet

Newsletter subscribers and admin users are not in this database. They arrive with the
newsletter/admin port, and they need retention rules, rate limiting and access control
that the inbox does not.
