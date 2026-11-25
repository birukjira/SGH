-- Adds the staff-handling columns to an `appointments` table created before them.
-- A fresh database gets these from db/schema.sql, so this file is only needed
-- once for an existing database:
--
--   npx wrangler d1 execute DB --remote --file=db/migrations/001-appointment-handling.sql
--
-- SQLite has no ADD COLUMN IF NOT EXISTS, so running it twice fails on the
-- second ALTER; that is the expected outcome if the columns already exist.

ALTER TABLE appointments ADD COLUMN note TEXT;
ALTER TABLE appointments ADD COLUMN handled_at TEXT;

CREATE INDEX IF NOT EXISTS ix_appointments_queue
  ON appointments (status, preferred_date, id);
