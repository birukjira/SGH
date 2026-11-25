-- Adds the staff note column to a `messages` table created before it existed.
-- A fresh database gets it from db/schema.sql, so this file is only needed once:
--
--   npx wrangler d1 execute DB --remote --file=db/migrations/002-message-note.sql
--
-- SQLite has no ADD COLUMN IF NOT EXISTS, so a second run fails on the ALTER;
-- that is the expected outcome once the column is there.

ALTER TABLE messages ADD COLUMN note TEXT;
