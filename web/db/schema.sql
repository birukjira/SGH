-- Summit General Hospital — D1 (SQLite) schema
-- Apply locally:  npm run db:local
-- Apply remotely: npm run db:remote   (after the DB binding exists)
--
-- Conventions
--   * ids are integers; public URLs use `slug` (stable, never reused)
--   * timestamps are ISO-8601 UTC strings, written by the app on mutation
--   * soft state is `is_active` / `is_published`; rows are not deleted
--   * JSON columns store JSON arrays/objects and are CHECKed with json_valid()

PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------------------
-- Departments: the unit a consultant belongs to and a booking is routed to.
-- `filter_label` is the short directory chip ("Surgery & ortho"),
-- `appointment_label` is the department string the booking form expects
-- ("General & Laparoscopic Surgery").
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS departments (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  slug              TEXT    NOT NULL UNIQUE,
  name              TEXT    NOT NULL,
  filter_label      TEXT    NOT NULL,
  appointment_label TEXT    NOT NULL,
  card_label        TEXT    NOT NULL,
  summary           TEXT,
  icon              TEXT,
  is_active         INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  sort_order        INTEGER NOT NULL DEFAULT 0,
  created_at        TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at        TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- ---------------------------------------------------------------------------
-- Doctors (consultants). Display order and visibility are controlled here;
-- department membership lives in doctor_departments because a consultant
-- can appear under more than one filter chip.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS doctors (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  slug                 TEXT    NOT NULL UNIQUE,
  name                 TEXT    NOT NULL,
  role                 TEXT    NOT NULL,
  focus                TEXT    NOT NULL,
  bio_md               TEXT,
  photo_path           TEXT,
  photo_alt            TEXT,
  clinic_note          TEXT    NOT NULL DEFAULT 'Clinic days — call to confirm',
  languages            TEXT    NOT NULL DEFAULT '[]' CHECK (json_valid(languages)),
  accepts_appointments INTEGER NOT NULL DEFAULT 1 CHECK (accepts_appointments IN (0, 1)),
  is_active            INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  sort_order           INTEGER NOT NULL DEFAULT 0,
  created_at           TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at           TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS doctor_departments (
  doctor_id     INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
  is_primary    INTEGER NOT NULL DEFAULT 0 CHECK (is_primary IN (0, 1)),
  PRIMARY KEY (doctor_id, department_id)
);

-- Exactly one primary department per consultant (partial unique index).
CREATE UNIQUE INDEX IF NOT EXISTS ux_doctor_primary_department
  ON doctor_departments (doctor_id) WHERE is_primary = 1;

CREATE INDEX IF NOT EXISTS ix_doctors_active_sort ON doctors (is_active, sort_order, name);
CREATE INDEX IF NOT EXISTS ix_doctor_departments_dept ON doctor_departments (department_id, doctor_id);

-- ---------------------------------------------------------------------------
-- Services: the 18 cards on /services, grouped by the filter chips.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS service_categories (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  slug       TEXT    NOT NULL UNIQUE,
  name       TEXT    NOT NULL,
  is_active  INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS services (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  slug          TEXT    NOT NULL UNIQUE,
  name          TEXT    NOT NULL,
  summary       TEXT    NOT NULL,
  body_md       TEXT,
  icon          TEXT,
  tag_label     TEXT,
  category_id   INTEGER NOT NULL REFERENCES service_categories(id) ON DELETE RESTRICT,
  department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
  -- Value the booking form expects for this service, e.g. "Family Medicine".
  -- Kept as text because services outnumber consultant departments.
  booking_department TEXT,
  cta_label     TEXT    NOT NULL DEFAULT 'Book this service',
  cta_type      TEXT    NOT NULL DEFAULT 'appointment'
                        CHECK (cta_type IN ('appointment', 'call', 'contact')),
  is_emergency  INTEGER NOT NULL DEFAULT 0 CHECK (is_emergency IN (0, 1)),
  is_active     INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at    TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS ix_services_category ON services (is_active, category_id, sort_order);

-- ---------------------------------------------------------------------------
-- Blog posts. Drafts are never returned by public queries; scheduling is
-- expressed as status = 'scheduled' with a future published_at.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS post_categories (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  slug       TEXT    NOT NULL UNIQUE,
  name       TEXT    NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS posts (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  slug           TEXT    NOT NULL UNIQUE,
  title          TEXT    NOT NULL,
  excerpt        TEXT,
  body_md        TEXT    NOT NULL,
  cover_image    TEXT,
  cover_alt      TEXT,
  category_id    INTEGER REFERENCES post_categories(id) ON DELETE SET NULL,
  author_id      INTEGER REFERENCES doctors(id) ON DELETE SET NULL,
  status         TEXT    NOT NULL DEFAULT 'draft'
                         CHECK (status IN ('draft', 'scheduled', 'published', 'archived')),
  published_at   TEXT,
  seo_title      TEXT,
  seo_description TEXT,
  created_at     TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at     TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  CHECK (status <> 'published' OR published_at IS NOT NULL),
  CHECK (status <> 'published' OR length(coalesce(excerpt, '')) > 0)
);

CREATE INDEX IF NOT EXISTS ix_posts_public ON posts (status, published_at DESC);
CREATE INDEX IF NOT EXISTS ix_posts_category ON posts (category_id, published_at DESC);

-- ---------------------------------------------------------------------------
-- Patient feedback. Rows are curated (consent checked before publishing).
-- Google-sourced rows keep only what the Places API permits us to store:
-- rating, relative time, author display name and a link back to Maps —
-- never a full mirrored review corpus.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS testimonials (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_name    TEXT    NOT NULL,
  patient_meta    TEXT,
  quote           TEXT    NOT NULL,
  rating          INTEGER CHECK (rating BETWEEN 1 AND 5),
  source          TEXT    NOT NULL DEFAULT 'website'
                          CHECK (source IN ('website', 'google', 'facebook', 'telegram', 'in_person')),
  source_url      TEXT,
  source_review_id TEXT,
  is_published    INTEGER NOT NULL DEFAULT 0 CHECK (is_published IN (0, 1)),
  is_featured     INTEGER NOT NULL DEFAULT 0 CHECK (is_featured IN (0, 1)),
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at      TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_testimonials_source_review
  ON testimonials (source, source_review_id) WHERE source_review_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_testimonials_published
  ON testimonials (is_published, is_featured DESC, sort_order);

-- Cached aggregate (rating + review count) from Google Places. Written by a
-- scheduled refresh, rendered server-side; never fetched from the browser.
CREATE TABLE IF NOT EXISTS review_snapshots (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  provider      TEXT    NOT NULL DEFAULT 'google' CHECK (provider IN ('google')),
  place_id      TEXT    NOT NULL,
  rating        REAL,
  review_count  INTEGER,
  fetched_at    TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  payload_json  TEXT    CHECK (payload_json IS NULL OR json_valid(payload_json))
);

CREATE INDEX IF NOT EXISTS ix_review_snapshots_place
  ON review_snapshots (provider, place_id, fetched_at DESC);

-- ---------------------------------------------------------------------------
-- Contact messages submitted through /contact. Written only by the server
-- action in lib/messages.ts; never read by a public page. Staff read the
-- inbox directly (status tracks whether a message has been handled).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS messages (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  email       TEXT    NOT NULL,
  phone       TEXT,
  subject     TEXT    NOT NULL,
  body        TEXT    NOT NULL,
  -- Short internal note for staff ("replied by phone"); never shown publicly.
  note        TEXT,
  consent     INTEGER NOT NULL DEFAULT 0 CHECK (consent IN (0, 1)),
  status      TEXT    NOT NULL DEFAULT 'new'
                      CHECK (status IN ('new', 'read', 'archived')),
  source_page TEXT    NOT NULL DEFAULT '/contact',
  created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS ix_messages_inbox ON messages (status, created_at DESC);

-- ---------------------------------------------------------------------------
-- Failed staff-inbox sign-ins, keyed by a digest of the client IP (hashed with
-- the inbox password, so the stored key cannot be reversed without it). Rows
-- are pruned after the lockout window; a successful sign-in clears its key.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS login_attempts (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  key          TEXT    NOT NULL,
  attempted_at TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS ix_login_attempts_key ON login_attempts (key, attempted_at DESC);

-- ---------------------------------------------------------------------------
-- Appointment requests from /appointment. Not a booking calendar: the front
-- desk calls the patient to confirm, then moves the row to 'confirmed'.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS appointments (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  reference      TEXT    NOT NULL UNIQUE,
  department     TEXT    NOT NULL,
  doctor         TEXT,
  visit_type     TEXT    NOT NULL DEFAULT 'First consultation',
  preferred_date TEXT    NOT NULL,
  preferred_time TEXT    NOT NULL,
  first_name     TEXT    NOT NULL,
  last_name      TEXT    NOT NULL,
  phone          TEXT    NOT NULL,
  email          TEXT,
  reason         TEXT,
  -- Short front-desk note ("left a message", "number unreachable"); not medical advice.
  note           TEXT,
  consent        INTEGER NOT NULL DEFAULT 0 CHECK (consent IN (0, 1)),
  status         TEXT    NOT NULL DEFAULT 'new'
                         CHECK (status IN ('new', 'confirmed', 'declined', 'archived')),
  -- When staff moved the row out of 'new'; cleared again if it returns to 'new'.
  handled_at     TEXT,
  created_at     TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS ix_appointments_inbox ON appointments (status, created_at DESC);
CREATE INDEX IF NOT EXISTS ix_appointments_phone ON appointments (phone, created_at DESC);
CREATE INDEX IF NOT EXISTS ix_appointments_queue ON appointments (status, preferred_date, id);
